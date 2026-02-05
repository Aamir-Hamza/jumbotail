/**
 * In-memory product catalog store.
 * Thread-safe via single-threaded Node; auto-increment productId.
 */

/** @typedef {import('./product.js').Product} Product */
/** @typedef {import('./product.js').ProductCreate} ProductCreate */
/** @typedef {import('./product.js').ProductMetaUpdate} ProductMetaUpdate */

export class CatalogStore {
  constructor() {
    /** @type {Map<number, Product>} */
    this._products = new Map();
    this._nextId = 1;
  }

  /**
   * @param {ProductCreate} payload
   * @returns {Promise<number>} productId
   */
  async add(payload) {
    const productId = this._nextId++;
    const product = {
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
    };
    this._products.set(productId, product);
    return productId;
  }

  /**
   * @param {number} productId
   * @returns {Promise<Product | undefined>}
   */
  async get(productId) {
    return this._products.get(productId);
  }

  /**
   * @param {ProductMetaUpdate} payload
   * @returns {Promise<Product | undefined>}
   */
  async updateMetadata(payload) {
    const product = this._products.get(payload.productId);
    if (!product) return undefined;
    product.Metadata = { ...product.Metadata, ...payload.Metadata };
    return product;
  }

  /** @returns {Promise<Product[]>} */
  async listAll() {
    return Array.from(this._products.values());
  }

  /** @returns {Promise<number>} */
  async count() {
    return this._products.size;
  }
}
