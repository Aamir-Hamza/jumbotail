/**
 * MongoDB connection via Mongoose.
 * Set MONGODB_URI in .env (e.g. mongodb://localhost:27017/jumbotail).
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Connect to MongoDB. Resolves when connected.
 * @returns {Promise<mongoose.Mongoose>}
 */
export async function connect() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env');
  }
  const conn = await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected:', conn.connection.host);
  return conn;
}

/**
 * Disconnect from MongoDB.
 * @returns {Promise<void>}
 */
export async function disconnect() {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

export { mongoose };
