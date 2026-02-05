import { useState } from 'react';
import { api } from '../api';

const initial = {
  title: '',
  description: '',
  rating: 4,
  stock: 0,
  price: '',
  mrp: '',
  currency: 'Rupee',
  units_sold: '',
};

export default function AddProduct() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numFields = ['rating', 'stock', 'price', 'mrp', 'units_sold'];
    setForm((prev) => ({
      ...prev,
      [name]: numFields.includes(name) ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const price = form.price === '' ? NaN : Number(form.price);
    if (!form.title.trim() || isNaN(price) || price < 0) {
      setError('Title and price (≥ 0) are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        rating: form.rating,
        stock: form.stock,
        price,
        mrp: form.mrp === '' ? undefined : Number(form.mrp),
        currency: form.currency,
        units_sold: form.units_sold === '' ? undefined : Number(form.units_sold),
      };
      const res = await api.addProduct(payload);
      setResult(res);
      setForm(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Add product to catalog</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Iphone 17" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description" />
        </div>
        <div className="form-group">
          <label>Rating (0–5)</label>
          <input name="rating" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Stock</label>
          <input name="stock" type="number" min={0} value={form.stock} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Price (₹) *</label>
          <input name="price" type="number" min={0} step={1} value={form.price} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>MRP (₹)</label>
          <input name="mrp" type="number" min={0} step={1} value={form.mrp} onChange={handleChange} placeholder="Optional" />
        </div>
        <div className="form-group">
          <label>Currency</label>
          <input name="currency" value={form.currency} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Units sold (for ranking)</label>
          <input name="units_sold" type="number" min={0} value={form.units_sold} onChange={handleChange} placeholder="Optional" />
        </div>
        {error && <p className="error">{error}</p>}
        {result && <p style={{ color: 'var(--accent)' }}>Product stored with productId: <strong>{result.productId}</strong></p>}
        <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save product'}</button>
      </form>
    </>
  );
}
