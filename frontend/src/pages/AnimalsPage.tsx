import { useEffect, useState } from 'react';
import { getAnimals } from '../services/api';
import type { Animal } from '../types/models';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnimals()
      .then((data) => setAnimals(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea animalelor.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Se încarcă animalele...</p>;
  if (error) return <p style={{ color: 'crimson' }}>Eroare: {error}</p>;

  return (
    <div>
      <h2>Animale ({animals.length})</h2>
      {animals.length === 0 ? (
        <p>Nu există animale în baza de date.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Specie</th>
              <th>Incintă</th>
              <th>Vârstă</th>
              <th>Gen</th>
              <th>Descriere</th>
            </tr>
          </thead>
          <tbody>
            {animals.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.species ? a.species.commonName : `#${a.speciesId}`}</td>
                <td>{a.enclosure ? a.enclosure.name : `#${a.enclosureId}`}</td>
                <td>{a.age ?? '—'}</td>
                <td>{a.gender ?? '—'}</td>
                <td>{a.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}