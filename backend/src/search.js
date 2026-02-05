/**
 * Search and ranking service: TF-IDF relevance + multi-attribute ranking + intent hints.
 * Uses natural (TF-IDF) and string-similarity for fuzzy matching.
 */

import natural from 'natural';
import stringSimilarity from 'string-similarity';
import { toSearchResult } from './product.js';

const { TfIdf } = natural;

/** @param {string} text */
function tokenize(text) {
  const t = (text || '').toLowerCase().trim();
  const tokens = t.match(/[a-z0-9]+/g) || [];
  return tokens.filter((tok) => tok.length >= 2);
}

/**
 * @param {import('./product.js').Product} p
 * @returns {string}
 */
function productSearchText(p) {
  const parts = [p.title, p.description];
  const meta = p.Metadata || {};
  for (const [k, v] of Object.entries(meta)) {
    if (v != null && String(v).trim()) parts.push(`${k} ${v}`);
  }
  return parts.join(' ');
}

/**
 * @param {number} value
 * @param {number} minVal
 * @param {number} maxVal
 */
function normalize(value, minVal, maxVal) {
  if (maxVal <= minVal) return 0.5;
  return (value - minVal) / (maxVal - minVal);
}

/**
 * @param {string} query
 * @returns {'low_price' | 'latest' | 'best_rated' | null}
 */
function intentHint(query) {
  const q = query.toLowerCase();
  if ([/sasta/, /cheap/, /sabse sasta/, /kam daam/, /affordable/, /budget/].some((r) => r.test(q)))
    return 'low_price';
  if ([/latest/, /new/, /naya/, /newest/].some((r) => r.test(q))) return 'latest';
  if ([/best/, /accha/, /top/].some((r) => r.test(q))) return 'best_rated';
  return null;
}

export class SearchService {
  /**
   * @param {import('./catalog.js').CatalogStore} catalog
   */
  constructor(catalog) {
    this.catalog = catalog;
  }

  /**
   * @param {string} query
   * @param {number} [limit=50]
   * @returns {Promise<import('./product.js').ProductSearchResult[]>}
   */
  async search(query, limit = 50) {
    const q = (query || '').trim();
    const products = await this.catalog.listAll();
    if (!products.length) return [];

    if (!q) {
      return this._rankWithoutQuery(products, limit);
    }

    const qTokens = tokenize(q);
    const qLower = q.toLowerCase();
    const intent = intentHint(q);

    // TF-IDF over corpus (title + description + metadata per product)
    const tfidf = new TfIdf();
    const corpusTexts = products.map((p) => productSearchText(p));
    corpusTexts.forEach((doc) => tfidf.addDocument(doc));

    /** @type {number[]} */
    const tfidfScores = new Array(products.length).fill(0);
    if (qTokens.length > 0) {
      qTokens.forEach((term) => {
        tfidf.tfidfs(term, (docIndex, score) => {
          tfidfScores[docIndex] += score;
        });
      });
    }

    // Normalize TF-IDF to [0,1]
    const tfMax = Math.max(...tfidfScores);
    const tfMin = Math.min(...tfidfScores);
    const tfRange = tfMax - tfMin;
    const tfNorm = tfRange > 0 ? tfidfScores.map((s) => (s - tfMin) / tfRange) : tfidfScores.map(() => 0.5);

    // Fuzzy boost (typo tolerance)
    const fuzzyBoost = products.map((p) => {
      const t = stringSimilarity.compareTwoStrings(qLower, (p.title || '').toLowerCase());
      const d = stringSimilarity.compareTwoStrings(qLower, (p.description || '').toLowerCase());
      return Math.max(t, d) * 0.3;
    });

    // Numeric attributes for normalization
    const ratings = products.map((p) => p.rating);
    const stocks = products.map((p) => p.stock);
    const prices = products.map((p) => p.price);
    const mrps = products.map((p) => p.mrp ?? p.price);
    const unitsSold = products.map((p) => p.units_sold ?? 0);
    const returnRates = products.map((p) => p.return_rate ?? 0);
    const complaints = products.map((p) => p.complaints_count ?? 0);
    const discountPct = products.map((p, i) => {
      const m = mrps[i];
      return m > 0 ? (m - prices[i]) / m : 0;
    });

    const rMin = Math.min(...ratings);
    const rMax = Math.max(...ratings);
    const sMin = Math.min(...stocks);
    const sMax = Math.max(...stocks);
    const pMin = Math.min(...prices);
    const pMax = Math.max(...prices);
    const uMin = Math.min(...unitsSold);
    const uMax = Math.max(...unitsSold);
    const dMin = Math.min(...discountPct);
    const dMax = Math.max(...discountPct);
    const retMax = Math.max(...returnRates, 1);
    const compMax = Math.max(...complaints, 1);

    const wRel = 0.45;
    const wRat = 0.15;
    const wStock = 0.08;
    const wDisc = 0.07;
    const wSales = 0.08;
    const wRet = 0.06;
    const wComp = 0.06;
    const wPrice = 0.05;

    /** @type {[number, import('./product.js').Product][]} */
    const scores = products.map((p, i) => {
      let rel = tfNorm[i] + fuzzyBoost[i];
      if (rel < 0.01 && tfidfScores[i] <= 0) rel = 0.001;

      const ratingN = normalize(p.rating, rMin, rMax);
      const stockN = normalize(p.stock, sMin, sMax);
      const priceN = normalize(p.price, pMin, pMax);
      const discountN = normalize(discountPct[i], dMin, dMax);
      const unitsN = normalize(p.units_sold ?? 0, uMin, uMax);
      const returnN = 1 - normalize(p.return_rate ?? 0, 0, retMax);
      const compN = 1 - normalize(p.complaints_count ?? 0, 0, compMax);

      let business = wRat * ratingN + wStock * stockN + wDisc * discountN + wSales * unitsN + wRet * returnN + wComp * compN;
      if (intent === 'low_price') business += 0.15 * (1 - priceN);
      else if (intent === 'best_rated') business += 0.1 * ratingN;
      else business += wPrice * (1 - priceN);

      const total = rel + 0.55 * business;
      return [total, p];
    });

    scores.sort((a, b) => b[0] - a[0] || a[1].productId - b[1].productId);
    return scores.slice(0, limit).map(([, p]) => toSearchResult(p));
  }

  /**
   * @param {import('./product.js').Product[]} products
   * @param {number} limit
   */
  _rankWithoutQuery(products, limit) {
    const scored = products.map((p) => {
      const r = p.rating ?? 0;
      const s = Math.log1p(p.stock ?? 0);
      const prices = products.map((x) => x.price);
      const pMin = Math.min(...prices);
      const pMax = Math.max(...prices);
      const priceN = pMax > pMin ? normalize(p.price, pMin, pMax) : 0.5;
      return [r * s - 0.2 * priceN, p];
    });
    scored.sort((a, b) => b[0] - a[0]);
    return scored.slice(0, limit).map(([, p]) => toSearchResult(p));
  }
}
