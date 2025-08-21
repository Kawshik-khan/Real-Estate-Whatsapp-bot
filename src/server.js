import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectToDatabase } from './config/database.js';
import { redisClient } from './config/redis.js';
import webhookRouter from './routes/webhook.js';

dotenv.config();

const app = express();

// Security and basics
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60
});
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Webhook
app.use('/webhook', webhookRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Avoid leaking details in production
  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd ? 'Internal server error' : err.message;
  res.status(err.status || 500).json({ error: message });
});

const PORT = process.env.PORT || 3000;

async function start() {
  await connectToDatabase();
  await redisClient.connect();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});


