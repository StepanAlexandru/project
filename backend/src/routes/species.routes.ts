import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

function isPrismaError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

// 1. READ ALL — GET /api/species
router.get('/', async (_req: Request, res: Response) => {
  try {
    const speciesList = await prisma.species.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(speciesList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea speciilor.' });
  }
});

// 2. READ ONE — GET /api/species/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    const species = await prisma.species.findUnique({
      where: { id },
      include: { animals: true },
    });

    if (!species) {
      res.status(404).json({ error: 'Specia nu a fost găsită.' });
      return;
    }

    res.json(species);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea speciei.' });
  }
});

// 3. CREATE — POST /api/species
router.post('/', async (req: Request, res: Response) => {
  const { commonName, scientificName, conservationStatus, description, model3dUrl } = req.body;

  if (!commonName || !scientificName || !conservationStatus) {
    res.status(400).json({
      error: 'Câmpurile commonName, scientificName și conservationStatus sunt obligatorii.',
    });
    return;
  }

  try {
    const newSpecies = await prisma.species.create({
      data: {
        commonName,
        scientificName,
        conservationStatus,
        description,
        model3dUrl,
      },
    });

    res.status(201).json(newSpecies);
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2002') {
      res.status(409).json({ error: 'Există deja o specie cu acest scientificName.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la crearea speciei.' });
  }
});

// 4. UPDATE — PUT /api/species/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  const { commonName, scientificName, conservationStatus, description, model3dUrl } = req.body;

  try {
    const updatedSpecies = await prisma.species.update({
      where: { id },
      data: {
        commonName,
        scientificName,
        conservationStatus,
        description,
        model3dUrl,
      },
    });

    res.json(updatedSpecies);
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Specia nu a fost găsită.' });
        return;
      }
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Există deja o specie cu acest scientificName.' });
        return;
      }
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la actualizarea speciei.' });
  }
});

// 5. DELETE — DELETE /api/species/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    await prisma.species.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2025') {
      res.status(404).json({ error: 'Specia nu a fost găsită.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la ștergerea speciei.' });
  }
});

export default router;