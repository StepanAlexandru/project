import { useEffect, useState } from 'react';
import { getSpecies } from '../services/api';
import type { Species } from '../types/models';

export default function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSpecies()
      .then((data) => setSpeciesList(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea speciilor.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Se încarcă speciile...</p>;
  if (error) return <p style={{ color: 'crimson' }}>Eroare: {error}</p>;

  return (
    <div>
      <h2>Specii ({speciesList.length})</h2>
      {speciesList.length === 0 ? (
        <p>Nu există specii în baza de date.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume comun</th>
              <th>Nume științific</th>
              <th>Status conservare</th>
              <th>Descriere</th>
            </tr>
          </thead>
          <tbody>
            {speciesList.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.commonName}</td>
                <td><em>{s.scientificName}</em></td>
                <td>{s.conservationStatus}</td>
                <td>{s.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}