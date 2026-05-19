import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth';
import { errorHandler, notFound } from './middleware/errorHandler';

const app  = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// ─── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── BODY PARSING ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── ROUTES ────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── ERROR HANDLING ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── BOOT ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Snap Kampala API running on http://localhost:${PORT}`);
  console.log(`  Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`  Database    : ${process.env.DB_PATH ?? './snap_kampala.db'}`);
});

export default app;
