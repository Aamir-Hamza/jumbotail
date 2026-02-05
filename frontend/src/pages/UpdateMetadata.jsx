import { useState } from 'react';
import { api } from '../api';

const META_KEYS = ['ram', 'screensize', 'model', 'storage', 'brightness', 'display_type', 'sound_output'];

export default function UpdateMetadata() {
  const [productId, setProductId] = useState('');
  const [meta, setMeta] = useState(() => Object.fromEntries(META_KEYS.map((k) => [k, ''])));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMetaChange = (key, value) => {
    setMeta((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = parseInt(productId, 10);
    if (Number.isNaN(id) || id < 1) {
      setError('Enter a valid product ID.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const Metadata = Object.fromEntries(
        Object.entries(meta).filter(([, v]) => v != null && String(v).trim() !== '')
      );
      const res = await api.updateMetadata(id, Metadata);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Update product metadata</h1>
      <p className="meta">Add or update attributes like ram, screensize, model, storage, brightness, etc.</p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product ID *</label>
          <input
            type="number"
            min={1}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>
        {META_KEYS.map((key) => (
          <div key={key} className="form-group">
            <label>{key}</label>
            <input
              value={meta[key] ?? ''}
              onChange={(e) => handleMetaChange(key, e.target.value)}
              placeholder={`e.g. ${key === 'ram' ? '8GB' : key === 'screensize' ? '6.3 inches' : ''}`}
            />
          </div>
        ))}
        {error && <p className="error">{error}</p>}
        {result && (
          <p style={{ color: 'var(--accent)' }}>
            Updated productId {result.productId}. Metadata: {JSON.stringify(result.Metadata)}
          </p>
        )}
        <button type="submit" disabled={loading}>{loading ? 'Updating…' : 'Update metadata'}</button>
      </form>
    </>
  );
}
