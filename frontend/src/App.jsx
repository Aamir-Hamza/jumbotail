import { Routes, Route, NavLink } from 'react-router-dom';
import Search from './pages/Search';
import AddProduct from './pages/AddProduct';
import UpdateMetadata from './pages/UpdateMetadata';

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Search
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => (isActive ? 'active' : '')}>
          Add Product
        </NavLink>
        <NavLink to="/metadata" className={({ isActive }) => (isActive ? 'active' : '')}>
          Update Metadata
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/metadata" element={<UpdateMetadata />} />
      </Routes>
    </div>
  );
}

export default App;
