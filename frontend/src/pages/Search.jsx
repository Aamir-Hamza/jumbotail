import { useState } from 'react';
import { api } from '../api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.search(query);
      setResults(res.data || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Search products</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g. Sasta Iphone, iPhone 16 red, Ifone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading…</p>}
      {!loading && results && (
        <div className="result-list">
          {results.length === 0 ? (
            <p className="loading">No products found. Try another query or add products first.</p>
          ) : (
            results.map((p) => (
              <div key={p.productId} className="result-item card">
                <div>
                  <h3>{p.title}</h3>
                  <p className="meta">{p.description}</p>
                  <p>
                    <span className="price">₹{p.Sellingprice?.toLocaleString()}</span>
                    {p.mrp != null && p.mrp !== p.Sellingprice && (
                      <span className="mrp">₹{p.mrp?.toLocaleString()}</span>
                    )}
                  </p>
                  <p className="meta">Stock: {p.stock} · ID: {p.productId}</p>
                  {p.Metadata && Object.keys(p.Metadata).length > 0 && (
                    <p className="meta">
                      {Object.entries(p.Metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
