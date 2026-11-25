export interface Species {
  id: number;
  commonName: string;
  scientificName: string;
  conservationStatus: string;
  description: string | null;
  model3dUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Enclosure {
  id: number;
  name: string;
  habitatType: string;
  capacity: number;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    animals: number;
  };
}

export interface Animal {
  id: number;
  name: string;
  age: number | null;
  gender: string | null;
  description: string | null;
  speciesId: number;
  enclosureId: number;
  species?: Species;
  enclosure?: Enclosure;
  createdAt: string;
  updatedAt: string;
}