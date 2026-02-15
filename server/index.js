import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDb } from './config/db.js';
import { bootstrapAdmin } from './scripts/bootstrapAdmin.js';
import { contactRouter } from './routes/contact.js';
import { authRouter } from './routes/auth.js';
import { invoicesRouter } from './routes/invoices.js';
import { dashboardRouter } from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'Rastogi Codeworks API' });
});

app.use('/api/contact', contactRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.error('[global-error]', err);
  res.status(500).json({ success: false, message: 'Unexpected server error.' });
});

connectDb()
  .then(() => bootstrapAdmin())
  .catch((err) => console.error('[startup]', err))
  .finally(() => {
    app.listen(PORT, HOST, () => {
      const env = process.env.NODE_ENV || 'development';
      console.log(`Server running at http://${HOST}:${PORT} (${env})`);
    });
  });

