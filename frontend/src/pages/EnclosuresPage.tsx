import { useEffect, useState } from 'react';
import {
  getEnclosures,
  createEnclosure,
  updateEnclosure,
  deleteEnclosure,
  getEnclosureQrUrl,
  type EnclosurePayload,
} from '../services/api';
import type { Enclosure } from '../types/models';

const EMPTY_FORM = {
  name: '',
  habitatType: '',
  capacity: '5',
};

export default function EnclosuresPage() {
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQrId, setSelectedQrId] = useState<number | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadEnclosures() {
    try {
      const data = await getEnclosures();
      setEnclosures(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea incintelor.');
    }
  }

  useEffect(() => {
    let ignore = false;

    getEnclosures()
      .then((data) => {
        if (!ignore) {
          setEnclosures(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Eroare la încărcarea incintelor.');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: EnclosurePayload = {
        name: form.name.trim(),
        habitatType: form.habitatType.trim(),
        capacity: Number(form.capacity),
      };

      if (editingId === null) {
        await createEnclosure(payload);
      } else {
        await updateEnclosure(editingId, payload);
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadEnclosures();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea incintei.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(enc: Enclosure) {
    setEditingId(enc.id);
    setForm({
      name: enc.name,
      habitatType: enc.habitatType,
      capacity: String(enc.capacity),
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Sigur vrei să ștergi incinta "${name}"?`)) return;

    try {
      setError(null);
      await deleteEnclosure(id);
      if (editingId === id) handleCancelEdit();
      if (selectedQrId === id) setSelectedQrId(null);
      await loadEnclosures();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la ștergerea incintei.');
    }
  }

  if (loading) return <p>Se încarcă incintele...</p>;

  return (
    <div>
      <h2>Incinte ({enclosures.length})</h2>

      {error && <p style={{ color: 'crimson' }}>Eroare: {error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '0.6rem',
          maxWidth: 480,
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #ddd',
        }}
      >
        <h3 style={{ margin: 0 }}>
          {editingId === null ? 'Adaugă incintă nouă' : `Editează incinta #${editingId}`}
        </h3>

        <input
          type="text"
          placeholder="Nume incintă (ex: Jungla Asiatică)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Tip habitat (ex: Pădure tropicală)"
          value={form.habitatType}
          onChange={(e) => setForm({ ...form, habitatType: e.target.value })}
          required
        />

        <input
          type="number"
          min={1}
          placeholder="Capacitate"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          required
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Se salvează...' : editingId === null ? 'Adaugă' : 'Salvează'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={handleCancelEdit}>
              Anulează
            </button>
          )}
        </div>
      </form>

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
              <th>Acțiuni</th>
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
                    PNG
                  </a>
                </td>
                <td>
                  <button onClick={() => handleEdit(enc)}>Editează</button>{' '}
                  <button onClick={() => handleDelete(enc.id, enc.name)}>Șterge</button>
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