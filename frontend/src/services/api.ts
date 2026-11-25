import type { Species, Enclosure, Animal } from '../types/models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Eroare HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// --- SPECIES ---
export interface SpeciesPayload {
  commonName: string;
  scientificName: string;
  conservationStatus: string;
  description?: string | null;
  model3dUrl?: string | null;
}

export async function getSpecies(): Promise<Species[]> {
  const res = await fetch(`${API_URL}/species`);
  return handleResponse<Species[]>(res);
}

export async function createSpecies(data: SpeciesPayload): Promise<Species> {
  const res = await fetch(`${API_URL}/species`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Species>(res);
}

export async function updateSpecies(id: number, data: SpeciesPayload): Promise<Species> {
  const res = await fetch(`${API_URL}/species/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Species>(res);
}

export async function deleteSpecies(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/species/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}

// --- ENCLOSURES ---
export interface EnclosurePayload {
  name: string;
  habitatType: string;
  capacity: number;
}

export async function getEnclosures(): Promise<Enclosure[]> {
  const res = await fetch(`${API_URL}/enclosures`);
  return handleResponse<Enclosure[]>(res);
}

export async function createEnclosure(data: EnclosurePayload): Promise<Enclosure> {
  const res = await fetch(`${API_URL}/enclosures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Enclosure>(res);
}

export async function updateEnclosure(id: number, data: EnclosurePayload): Promise<Enclosure> {
  const res = await fetch(`${API_URL}/enclosures/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Enclosure>(res);
}

export async function deleteEnclosure(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/enclosures/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}

export function getEnclosureQrUrl(id: number): string {
  return `${API_URL}/enclosures/${id}/qr`;
}

// --- ANIMALS ---
export interface AnimalPayload {
  name: string;
  age?: number | null;
  gender?: string | null;
  description?: string | null;
  speciesId: number;
  enclosureId: number;
}

export async function getAnimals(): Promise<Animal[]> {
  const res = await fetch(`${API_URL}/animals`);
  return handleResponse<Animal[]>(res);
}

export async function createAnimal(data: AnimalPayload): Promise<Animal> {
  const res = await fetch(`${API_URL}/animals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Animal>(res);
}

export async function updateAnimal(id: number, data: AnimalPayload): Promise<Animal> {
  const res = await fetch(`${API_URL}/animals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Animal>(res);
}

export async function deleteAnimal(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/animals/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}