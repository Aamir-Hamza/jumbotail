/**
 * API client for Jumbotail backend.
 * Uses relative /api so Vite proxy forwards to backend (localhost:8000).
 */

const BASE = '/api/v1';

async function request(method, path, body = null) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || res.statusText || 'Request failed');
  return data;
}

export const api = {
  search: (query, limit = 50) =>
    request('GET', `/search/product?query=${encodeURIComponent(query)}&limit=${limit}`),

  addProduct: (product) =>
    request('POST', '/product', product),

  updateMetadata: (productId, Metadata) =>
    request('PUT', '/product/meta-data', { productId, Metadata }),

  getProduct: (productId) =>
    request('GET', `/product/${productId}`),
};
