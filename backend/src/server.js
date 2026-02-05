/**
 * Jumbotail Search API - Node.js backend entry point.
 * Run: npm run dev  or  npm start
 * Set MONGODB_URI in .env to persist catalog in MongoDB.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { init } from './deps.js';
import productRoutes from './routes/product.js';
import searchRoutes from './routes/search.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Jumbotail Search API', docs: '/api/v1 (see README)', health: '/health' });
});

// API v1
app.use('/api/v1', productRoutes);
app.use('/api/v1', searchRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ detail: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: 'An internal error occurred. Please try again.' });
});

async function start() {
  await init();
  app.listen(PORT, () => {
    console.log(`Jumbotail API running at http://localhost:${PORT}`);
    if (process.env.MONGODB_URI) console.log('Using MongoDB for catalog.');
    else console.log('Using in-memory catalog (set MONGODB_URI for MongoDB).');
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
