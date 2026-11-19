import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import speciesRoutes from './routes/species.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Augmented Zoo API rulează!' });
});

app.use('/api/species', speciesRoutes);

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});