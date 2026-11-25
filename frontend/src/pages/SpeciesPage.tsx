import { useEffect, useState } from 'react';
import {
  getSpecies,
  createSpecies,
  updateSpecies,
  deleteSpecies,
  type SpeciesPayload,
} from '../services/api';
import type { Species } from '../types/models';

const EMPTY_FORM: SpeciesPayload = {
  commonName: '',
  scientificName: '',
  conservationStatus: 'Least Concern',
  description: '',
};

const CONSERVATION_OPTIONS = [
  'Least Concern',
  'Near Threatened',
  'Vulnerable',
  'Endangered',
  'Critically Endangered',
];

export default function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<SpeciesPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadSpecies() {
    try {
      const data = await getSpecies();
      setSpeciesList(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea speciilor.');
    }
  }

  useEffect(() => {
    let ignore = false;

    getSpecies()
      .then((data) => {
        if (!ignore) {
          setSpeciesList(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Eroare la încărcarea speciilor.');
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
      const payload: SpeciesPayload = {
        commonName: form.commonName.trim(),
        scientificName: form.scientificName.trim(),
        conservationStatus: form.conservationStatus,
        description: form.description?.trim() || null,
      };

      if (editingId === null) {
        await createSpecies(payload);
      } else {
        await updateSpecies(editingId, payload);
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadSpecies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea speciei.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(s: Species) {
    setEditingId(s.id);
    setForm({
      commonName: s.commonName,
      scientificName: s.scientificName,
      conservationStatus: s.conservationStatus,
      description: s.description ?? '',
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Sigur vrei să ștergi specia "${name}"?`)) return;

    try {
      setError(null);
      await deleteSpecies(id);
      if (editingId === id) handleCancelEdit();
      await loadSpecies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la ștergerea speciei.');
    }
  }

  if (loading) return <p>Se încarcă speciile...</p>;

  return (
    <div>
      <h2>Specii ({speciesList.length})</h2>

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
          {editingId === null ? 'Adaugă specie nouă' : `Editează specia #${editingId}`}
        </h3>

        <input
          type="text"
          placeholder="Nume comun (ex: Tigru Siberian)"
          value={form.commonName}
          onChange={(e) => setForm({ ...form, commonName: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Nume științific (ex: Panthera tigris altaica)"
          value={form.scientificName}
          onChange={(e) => setForm({ ...form, scientificName: e.target.value })}
          required
        />

        <select
          value={form.conservationStatus}
          onChange={(e) => setForm({ ...form, conservationStatus: e.target.value })}
        >
          {CONSERVATION_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Descriere (opțional)"
          rows={2}
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              <th>Acțiuni</th>
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
                <td>
                  <button onClick={() => handleEdit(s)}>Editează</button>{' '}
                  <button onClick={() => handleDelete(s.id, s.commonName)}>Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}