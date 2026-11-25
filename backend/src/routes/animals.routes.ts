import { Router, Request, Response } from 'express';
import { prisma, isPrismaError } from '../lib/prisma';

const router = Router();

// 1. READ ALL — GET /api/animals
router.get('/', async (_req: Request, res: Response) => {
  try {
    const animals = await prisma.animal.findMany({
      orderBy: { id: 'asc' },
      include: {
        species: true,
        enclosure: true,
      },
    });
    res.json(animals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea animalelor.' });
  }
});

// 2. READ ONE — GET /api/animals/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        species: true,
        enclosure: true,
      },
    });

    if (!animal) {
      res.status(404).json({ error: 'Animalul nu a fost găsit.' });
      return;
    }

    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea animalului.' });
  }
});

// 3. CREATE — POST /api/animals
router.post('/', async (req: Request, res: Response) => {
  const { name, age, gender, description, speciesId, enclosureId } = req.body;

  if (!name || typeof speciesId !== 'number' || typeof enclosureId !== 'number') {
    res.status(400).json({
      error: 'Câmpurile name, speciesId și enclosureId sunt obligatorii.',
    });
    return;
  }

  try {
    const newAnimal = await prisma.animal.create({
      data: {
        name,
        age,
        gender,
        description,
        speciesId,
        enclosureId,
      },
      include: {
        species: true,
        enclosure: true,
      },
    });

    res.status(201).json(newAnimal);
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2003') {
      res.status(400).json({
        error: 'speciesId sau enclosureId nu există în baza de date.',
      });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la crearea animalului.' });
  }
});

// 4. UPDATE — PUT /api/animals/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  const { name, age, gender, description, speciesId, enclosureId } = req.body;

  try {
    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: {
        name,
        age,
        gender,
        description,
        speciesId,
        enclosureId,
      },
      include: {
        species: true,
        enclosure: true,
      },
    });

    res.json(updatedAnimal);
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Animalul nu a fost găsit.' });
        return;
      }
      if (error.code === 'P2003') {
        res.status(400).json({
          error: 'speciesId sau enclosureId nu există în baza de date.',
        });
        return;
      }
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la actualizarea animalului.' });
  }
});

// 5. DELETE — DELETE /api/animals/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    await prisma.animal.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2025') {
      res.status(404).json({ error: 'Animalul nu a fost găsit.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la ștergerea animalului.' });
  }
});

export default router;