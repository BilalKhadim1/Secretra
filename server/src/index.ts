import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { appRouter, createContext } from './trpc';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security & Logging Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// tRPC Middleware
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'API is running', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
