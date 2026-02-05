/**
 * Mongoose schema for Product (catalog).
 * productId is a numeric API-facing ID; we use a counter for the next value.
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    mrp: { type: Number },
    currency: { type: String, default: 'Rupee' },
    units_sold: { type: Number, default: 0 },
    return_rate: { type: Number, default: 0 },
    complaints_count: { type: Number, default: 0 },
    Metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model('Product', productSchema);
