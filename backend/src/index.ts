import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import speciesRoutes from './routes/species.routes';
import enclosureRoutes from './routes/enclosures.routes';
import animalRoutes from './routes/animals.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.set('json replacer', (key: string, value: unknown) => {
  if ((key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
    return value.replace('T', ' ').replace(/\.\d{3}Z$/, '');
  }
  return value;
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Augmented Zoo API rulează!' });
});

app.use('/api/species', speciesRoutes);
app.use('/api/enclosures', enclosureRoutes);
app.use('/api/animals', animalRoutes);

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});