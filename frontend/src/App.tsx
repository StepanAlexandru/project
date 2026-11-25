import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import SpeciesPage from './pages/SpeciesPage';
import EnclosuresPage from './pages/EnclosuresPage';
import AnimalsPage from './pages/AnimalsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Augmented Zoo — Admin</h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/admin/species">Specii</Link>
            <Link to="/admin/enclosures">Incinte</Link>
            <Link to="/admin/animals">Animale</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/admin/species" replace />} />
          <Route path="/admin/species" element={<SpeciesPage />} />
          <Route path="/admin/enclosures" element={<EnclosuresPage />} />
          <Route path="/admin/animals" element={<AnimalsPage />} />
          <Route path="/visit/enclosure/:id" element={<p>Pagina vizitatorului (QR) — urmează</p>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}