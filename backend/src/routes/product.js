/**
 * Product catalog routes: store product, update metadata, get by ID.
 */

import { Router } from 'express';
import { getCatalog } from '../deps.js';

const router = Router();
const prefix = '/product';

/** POST /api/v1/product - Store a new product */
router.post(`${prefix}`, async (req, res) => {
  try {
    const catalog = getCatalog();
    const body = req.body || {};
    const { title, description, rating, stock, price, mrp, currency, units_sold, return_rate, complaints_count } = body;
    if (!title || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ detail: 'title and price (number >= 0) are required' });
    }
    const productId = await catalog.add({
      title: String(title),
      description: description != null ? String(description) : '',
      rating: rating != null ? Number(rating) : 0,
      stock: stock != null ? Number(stock) : 0,
      price: Number(price),
      mrp: mrp != null ? Number(mrp) : undefined,
      currency: currency != null ? String(currency) : 'Rupee',
      units_sold: units_sold != null ? Number(units_sold) : undefined,
      return_rate: return_rate != null ? Number(return_rate) : undefined,
      complaints_count: complaints_count != null ? Number(complaints_count) : undefined,
    });
    return res.status(201).json({ productId });
  } catch (err) {
    return res.status(500).json({ detail: err.message || 'Failed to store product' });
  }
});

/** PUT /api/v1/product/meta-data - Update product metadata */
router.put(`${prefix}/meta-data`, async (req, res) => {
  try {
    const catalog = getCatalog();
    const body = req.body || {};
    const productId = body.productId;
    if (productId == null) {
      return res.status(400).json({ detail: 'productId is required' });
    }
    const product = await catalog.updateMetadata({
      productId: Number(productId),
      Metadata: body.Metadata || {},
    });
    if (!product) {
      return res.status(404).json({ detail: `Product with productId ${productId} not found` });
    }
    return res.json({ productId: product.productId, Metadata: product.Metadata });
  } catch (err) {
    return res.status(500).json({ detail: err.message || 'Failed to update metadata' });
  }
});

/** GET /api/v1/product/:productId - Get product by ID */
router.get(`${prefix}/:productId`, async (req, res) => {
  try {
    const catalog = getCatalog();
    const productId = parseInt(req.params.productId, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ detail: 'Invalid productId' });
    }
    const product = await catalog.get(productId);
    if (!product) {
      return res.status(404).json({ detail: `Product ${productId} not found` });
    }
    return res.json({
      productId: product.productId,
      title: product.title,
      description: product.description,
      rating: product.rating,
      stock: product.stock,
      price: product.price,
      mrp: product.mrp,
      currency: product.currency,
      Metadata: product.Metadata,
    });
  } catch (err) {
    return res.status(500).json({ detail: err.message || 'Failed to get product' });
  }
});

export default router;
