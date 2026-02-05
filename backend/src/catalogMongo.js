/**
 * MongoDB-backed product catalog (same interface as in-memory, all methods async).
 */

import { ProductModel } from './models/Product.js';

/** @typedef {import('./product.js').ProductCreate} ProductCreate */
/** @typedef {import('./product.js').ProductMetaUpdate} ProductMetaUpdate */
/** @typedef {import('./product.js').Product} Product */

/**
 * Get next productId (max + 1).
 * @returns {Promise<number>}
 */
async function getNextProductId() {
  const doc = await ProductModel.findOne().sort({ productId: -1 }).select('productId').lean();
  return (doc?.productId ?? 0) + 1;
}

/**
 * Map Mongo doc to Product shape (plain object with productId, Metadata, etc.).
 * @param {import('mongoose').Document & Product} doc
 * @returns {Product}
 */
function toProduct(doc) {
  if (!doc) return doc;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    productId: o.productId,
    title: o.title,
    description: o.description ?? '',
    rating: o.rating ?? 0,
    stock: o.stock ?? 0,
    price: o.price,
    mrp: o.mrp,
    currency: o.currency ?? 'Rupee',
    units_sold: o.units_sold ?? 0,
    return_rate: o.return_rate ?? 0,
    complaints_count: o.complaints_count ?? 0,
    Metadata: o.Metadata ?? {},
  };
}

export class CatalogMongo {
  /**
   * @param {ProductCreate} payload
   * @returns {Promise<number>} productId
   */
  async add(payload) {
    const productId = await getNextProductId();
    await ProductModel.create({
      productId,
      title: payload.title,
      description: payload.description ?? '',
      rating: payload.rating ?? 0,
      stock: payload.stock ?? 0,
      price: payload.price,
      mrp: payload.mrp ?? payload.price,
      currency: payload.currency ?? 'Rupee',
      units_sold: payload.units_sold ?? 0,
      return_rate: payload.return_rate ?? 0,
      complaints_count: payload.complaints_count ?? 0,
      Metadata: {},
    });
    return productId;
  }

  /**
   * @param {number} productId
   * @returns {Promise<Product | undefined>}
   */
  async get(productId) {
    const doc = await ProductModel.findOne({ productId }).lean();
    return doc ? toProduct(doc) : undefined;
  }

  /**
   * @param {ProductMetaUpdate} payload
   * @returns {Promise<Product | undefined>}
   */
  async updateMetadata(payload) {
    const doc = await ProductModel.findOne({ productId: payload.productId });
    if (!doc) return undefined;
    doc.Metadata = { ...doc.Metadata, ...payload.Metadata };
    await doc.save();
    return toProduct(doc.toObject());
  }

  /** @returns {Promise<Product[]>} */
  async listAll() {
    const docs = await ProductModel.find().sort({ productId: 1 }).lean();
    return docs.map(toProduct);
  }

  /** @returns {Promise<number>} */
  async count() {
    return ProductModel.countDocuments();
  }
}
