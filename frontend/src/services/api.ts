import type { Species, Enclosure, Animal } from '../types/models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Eroare HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getSpecies(): Promise<Species[]> {
  const res = await fetch(`${API_URL}/species`);
  return handleResponse<Species[]>(res);
}

export async function getEnclosures(): Promise<Enclosure[]> {
  const res = await fetch(`${API_URL}/enclosures`);
  return handleResponse<Enclosure[]>(res);
}

export function getEnclosureQrUrl(id: number): string {
  return `${API_URL}/enclosures/${id}/qr`;
}

export async function getAnimals(): Promise<Animal[]> {
  const res = await fetch(`${API_URL}/animals`);
  return handleResponse<Animal[]>(res);
}