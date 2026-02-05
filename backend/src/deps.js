/**
 * Shared dependencies: catalog store and search service.
 * Uses MongoDB when MONGODB_URI is set; otherwise in-memory store.
 */

import { CatalogStore } from './catalog.js';
import { CatalogMongo } from './catalogMongo.js';
import { SearchService } from './search.js';

/** @type {CatalogStore | import('./catalogMongo.js').CatalogMongo} */
let catalog;
let searchService;

/**
 * Initialize deps: connect to MongoDB if MONGODB_URI is set, then create catalog and search.
 * Call this before starting the server.
 * @returns {Promise<void>}
 */
export async function init() {
  if (process.env.MONGODB_URI) {
    const { connect } = await import('./db.js');
    await connect();
    catalog = new CatalogMongo();
  } else {
    catalog = new CatalogStore();
  }
  searchService = new SearchService(catalog);
}

export function getCatalog() {
  if (!catalog) throw new Error('Deps not initialized. Call init() first.');
  return catalog;
}

export function getSearch() {
  if (!searchService) throw new Error('Deps not initialized. Call init() first.');
  return searchService;
}
