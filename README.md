# Jumbotail Search – React + Node.js

E-commerce search microservice: **React.js** frontend and **Node.js** backend with in-memory catalog and ranked search.

## Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Node.js, Express; in-memory catalog; TF-IDF + multi-attribute ranking (natural, string-similarity)

## Quick start

### 1. Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

API runs at **http://localhost:8000** (health: http://localhost:8000/health).

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**. It proxies `/api` to the backend, so the backend must be running.

### 3. Use the app

- **Search** – Enter queries like "Sasta Iphone", "iPhone 16 red", "Ifone" (typo-tolerant). Results are ranked by relevance, rating, stock, price, etc.
- **Add Product** – Create products with title, description, price, mrp, stock, rating; optional units_sold for ranking.
- **Update Metadata** – Set productId and metadata (ram, screensize, model, storage, brightness, etc.).

## Project structure

```
Jumbotail/
├── backend/                 # Node.js API
│   ├── package.json
│   └── src/
│       ├── index.js          # Express app, CORS, routes
│       ├── catalog.js        # In-memory CatalogStore
│       ├── search.js         # SearchService (TF-IDF + ranking)
│       ├── product.js        # Types & toSearchResult
│       ├── deps.js           # getCatalog, getSearch
│       └── routes/
│           ├── product.js    # POST/PUT/GET product
│           └── search.js     # GET search/product
├── frontend/                 # React (Vite)
│   ├── package.json
│   ├── vite.config.js        # Proxy /api → localhost:8000
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Routes, nav
│       ├── api.js            # fetch wrappers
│       ├── index.css
│       └── pages/
│           ├── Search.jsx
│           ├── AddProduct.jsx
│           └── UpdateMetadata.jsx
├── app/                      # (Legacy Python/FastAPI – optional)
├── main.py
└── README.md
```

## API (Node backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/product` | Store product; body: title, description, rating, stock, price, mrp?, currency?, units_sold? |
| PUT | `/api/v1/product/meta-data` | Update metadata; body: productId, Metadata |
| GET | `/api/v1/product/:productId` | Get product by ID |
| GET | `/api/v1/search/product?query=...&limit=50` | Search; returns `{ data: [...] }` with ranked products |

## Ranking (backend)

- **Text relevance:** TF-IDF (natural) over title + description + metadata; fuzzy boost (string-similarity) for typos.
- **Signals:** rating, stock, discount %, units_sold, return_rate, complaints (normalized and weighted).
- **Intent:** "sasta"/"cheap" → boost lower price; "latest"/"best" → boost rating.

## Optional

- **Python API:** The original Python/FastAPI app in `main.py` and `app/` can still be run with `uvicorn main:app --reload` if you prefer that backend; point the React app proxy to its port.
- **Persistence:** Replace in-memory store in `backend/src/catalog.js` with a DB (e.g. SQLite/PostgreSQL) and optionally a search index.
