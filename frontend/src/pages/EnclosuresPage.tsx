import { useEffect, useState } from 'react';
import { getEnclosures, getEnclosureQrUrl } from '../services/api';
import type { Enclosure } from '../types/models';

export default function EnclosuresPage() {
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQrId, setSelectedQrId] = useState<number | null>(null);

  useEffect(() => {
    getEnclosures()
      .then((data) => setEnclosures(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea incintelor.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Se încarcă incintele...</p>;
  if (error) return <p style={{ color: 'crimson' }}>Eroare: {error}</p>;

  return (
    <div>
      <h2>Incinte ({enclosures.length})</h2>
      {enclosures.length === 0 ? (
        <p>Nu există incinte în baza de date.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Tip habitat</th>
              <th>Capacitate</th>
              <th>Animale</th>
              <th>Cod QR</th>
            </tr>
          </thead>
          <tbody>
            {enclosures.map((enc) => (
              <tr key={enc.id}>
                <td>{enc.id}</td>
                <td>{enc.name}</td>
                <td>{enc.habitatType}</td>
                <td>{enc.capacity}</td>
                <td>{enc._count?.animals ?? 0}</td>
                <td>
                  <button onClick={() => setSelectedQrId(enc.id)}>Vezi QR</button>{' '}
                  <a href={getEnclosureQrUrl(enc.id)} target="_blank" rel="noreferrer">
                    Deschide PNG
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedQrId !== null && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #ccc', display: 'inline-block' }}>
          <h3 style={{ marginTop: 0 }}>Cod QR — Incinta #{selectedQrId}</h3>
          <img
            src={getEnclosureQrUrl(selectedQrId)}
            alt={`QR incinta ${selectedQrId}`}
            width={220}
            height={220}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <button onClick={() => setSelectedQrId(null)}>Închide</button>
          </div>
        </div>
      )}
    </div>
  );
}