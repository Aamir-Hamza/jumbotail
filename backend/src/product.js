/**
 * Product entity and validation helpers.
 * Matches API contract: productId, Metadata, Sellingprice in responses.
 */

/**
 * @typedef {Object} ProductCreate
 * @property {string} title
 * @property {string} [description]
 * @property {number} [rating]
 * @property {number} [stock]
 * @property {number} price
 * @property {number} [mrp]
 * @property {string} [currency]
 * @property {number} [units_sold]
 * @property {number} [return_rate]
 * @property {number} [complaints_count]
 */

/**
 * @typedef {Object} ProductMetaUpdate
 * @property {number} productId
 * @property {Record<string, unknown>} [Metadata]
 */

/**
 * @typedef {ProductCreate & { productId: number, Metadata: Record<string, unknown> }} Product
 */

/**
 * @typedef {Object} ProductSearchResult
 * @property {number} productId
 * @property {string} title
 * @property {string} description
 * @property {number} mrp
 * @property {number} Sellingprice
 * @property {Record<string, unknown>} Metadata
 * @property {number} stock
 */

/**
 * @param {Product} p
 * @returns {ProductSearchResult}
 */
export function toSearchResult(p) {
  return {
    productId: p.productId,
    title: p.title,
    description: p.description,
    mrp: p.mrp ?? p.price,
    Sellingprice: p.price,
    Metadata: p.Metadata ?? {},
    stock: p.stock,
  };
}
