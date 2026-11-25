import { Router, Request, Response } from 'express';
import { prisma, isPrismaError } from '../lib/prisma';
import QRCode from 'qrcode';



const router = Router();

// 1. READ ALL — GET /api/enclosures
router.get('/', async (_req: Request, res: Response) => {
  try {
    const enclosures = await prisma.enclosure.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { animals: true } } },
    });
    res.json(enclosures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea incintelor.' });
  }
});

// 2. READ ONE — GET /api/enclosures/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    const enclosure = await prisma.enclosure.findUnique({
      where: { id },
      include: {
        animals: {
          include: { species: true },
        },
      },
    });

    if (!enclosure) {
      res.status(404).json({ error: 'Incinta nu a fost găsită.' });
      return;
    }

    res.json(enclosure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea incintei.' });
  }
});

// 2.1 GENERATE QR — GET /api/enclosures/:id/qr
router.get('/:id/qr', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    const enclosure = await prisma.enclosure.findUnique({ where: { id } });

    if (!enclosure) {
      res.status(404).json({ error: 'Incinta nu a fost găsită.' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const targetUrl = enclosure.qrCode || `${frontendUrl}/visit/enclosure/${enclosure.id}`;

    // Salvăm URL-ul în baza de date dacă incinta nu avea încă un qrCode
    if (!enclosure.qrCode) {
      await prisma.enclosure.update({
        where: { id },
        data: { qrCode: targetUrl },
      });
    }

    // Opțional: dacă frontend-ul cere ?format=json, trimitem Data URL (base64)
    if (req.query.format === 'json') {
      const qrDataUrl = await QRCode.toDataURL(targetUrl, { width: 300 });
      res.json({ enclosureId: enclosure.id, url: targetUrl, qrDataUrl });
      return;
    }

    // Implicit: trimitem direct imaginea PNG
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 300,
      margin: 2,
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la generarea codului QR.' });
  }
});

// 3. CREATE — POST /api/enclosures
router.post('/', async (req: Request, res: Response) => {
  const { name, habitatType, capacity, qrCode } = req.body;

  if (!name || !habitatType || typeof capacity !== 'number' || capacity <= 0) {
    res.status(400).json({
      error: 'Câmpurile name, habitatType și capacity (număr pozitiv) sunt obligatorii.',
    });
    return;
  }

  try {
    const newEnclosure = await prisma.enclosure.create({
      data: { name, habitatType, capacity, qrCode },
    });
    res.status(201).json(newEnclosure);
  } catch (error) {
    if (isPrismaError(error) && error.code === 'P2002') {
      res.status(409).json({ error: 'Există deja o incintă cu acest nume sau cod QR.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la crearea incintei.' });
  }
});

// 4. UPDATE — PUT /api/enclosures/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  const { name, habitatType, capacity, qrCode } = req.body;

  try {
    const updatedEnclosure = await prisma.enclosure.update({
      where: { id },
      data: { name, habitatType, capacity, qrCode },
    });
    res.json(updatedEnclosure);
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Incinta nu a fost găsită.' });
        return;
      }
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Există deja o incintă cu acest nume sau cod QR.' });
        return;
      }
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la actualizarea incintei.' });
  }
});

// 5. DELETE — DELETE /api/enclosures/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'ID-ul trebuie să fie un număr valid.' });
    return;
  }

  try {
    await prisma.enclosure.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Incinta nu a fost găsită.' });
        return;
      }
      if (error.code === 'P2003') {
        res.status(409).json({
          error: 'Nu poți șterge incinta cât timp conține animale. Mută sau șterge animalele mai întâi.',
        });
        return;
      }
    }
    console.error(error);
    res.status(500).json({ error: 'Eroare la ștergerea incintei.' });
  }
});

export default router;