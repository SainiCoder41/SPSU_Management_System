import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';

const app: Application = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite static build assets and fonts
  })
);

// CORS configuration for React Vite client
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        ENV.CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/auth/login', authLimiter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    version: '1.0.0',
    service: 'SPSU Campus Management System SIS API',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', routes);

// Serve static frontend in production or when client build is present
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
];
const clientDistPath = clientDistCandidates.find((dir) => fs.existsSync(dir));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(errorHandler);

export default app;
