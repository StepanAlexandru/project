import { useEffect, useState } from 'react';
import {
  getAnimals,
  getSpecies,
  getEnclosures,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  type AnimalPayload,
} from '../services/api';
import type { Animal, Species, Enclosure } from '../types/models';

const EMPTY_FORM = {
  name: '',
  age: '',
  gender: 'Mascul',
  description: '',
  speciesId: '',
  enclosureId: '',
};

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAnimals() {
    try {
      const data = await getAnimals();
      setAnimals(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea animalelor.');
    }
  }

  useEffect(() => {
    let ignore = false;

    Promise.all([getAnimals(), getSpecies(), getEnclosures()])
      .then(([animalsData, speciesData, enclosuresData]) => {
        if (!ignore) {
          setAnimals(animalsData);
          setSpeciesList(speciesData);
          setEnclosures(enclosuresData);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Eroare la încărcarea datelor.');
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
      const payload: AnimalPayload = {
        name: form.name.trim(),
        age: form.age.trim() ? Number(form.age) : null,
        gender: form.gender || null,
        description: form.description.trim() || null,
        speciesId: Number(form.speciesId),
        enclosureId: Number(form.enclosureId),
      };

      if (editingId === null) {
        await createAnimal(payload);
      } else {
        await updateAnimal(editingId, payload);
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadAnimals();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea animalului.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(a: Animal) {
    setEditingId(a.id);
    setForm({
      name: a.name,
      age: a.age !== null ? String(a.age) : '',
      gender: a.gender ?? 'Mascul',
      description: a.description ?? '',
      speciesId: String(a.speciesId),
      enclosureId: String(a.enclosureId),
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Sigur vrei să ștergi animalul "${name}"?`)) return;

    try {
      setError(null);
      await deleteAnimal(id);
      if (editingId === id) handleCancelEdit();
      await loadAnimals();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la ștergerea animalului.');
    }
  }

  if (loading) return <p>Se încarcă animalele...</p>;

  return (
    <div>
      <h2>Animale ({animals.length})</h2>

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
          {editingId === null ? 'Adaugă animal nou' : `Editează animalul #${editingId}`}
        </h3>

        <input
          type="text"
          placeholder="Nume animal (ex: Nala)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <select
          value={form.speciesId}
          onChange={(e) => setForm({ ...form, speciesId: e.target.value })}
          required
        >
          <option value="">-- Alege specia --</option>
          {speciesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.commonName} ({s.scientificName})
            </option>
          ))}
        </select>

        <select
          value={form.enclosureId}
          onChange={(e) => setForm({ ...form, enclosureId: e.target.value })}
          required
        >
          <option value="">-- Alege incinta --</option>
          {enclosures.map((enc) => (
            <option key={enc.id} value={enc.id}>
              {enc.name} ({enc.habitatType})
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            min={0}
            placeholder="Vârstă (opțional)"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            style={{ flex: 1 }}
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            style={{ flex: 1 }}
          >
            <option value="Mascul">Mascul</option>
            <option value="Femelă">Femelă</option>
            <option value="Necunoscut">Necunoscut</option>
          </select>
        </div>

        <textarea
          placeholder="Descriere (opțional)"
          rows={2}
          value={form.description}
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
              <th>Acțiuni</th>
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
                <td>
                  <button onClick={() => handleEdit(a)}>Editează</button>{' '}
                  <button onClick={() => handleDelete(a.id, a.name)}>Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}