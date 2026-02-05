/**
 * Search route: GET /api/v1/search/product?query=...
 */

import { Router } from 'express';
import { getSearch } from '../deps.js';

const router = Router();
const prefix = '/search';

/** GET /api/v1/search/product?query=... - Search and rank products */
router.get(`${prefix}/product`, async (req, res) => {
  try {
    const searchService = getSearch();
    const query = (req.query.query ?? '').toString().trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const results = await searchService.search(query, limit);
    return res.json({ data: results });
  } catch (err) {
    return res.status(500).json({ detail: err.message || 'Search failed' });
  }
});

export default router;
