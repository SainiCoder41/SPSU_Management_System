import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

// Route Imports
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';
import staffRoutes from './routes/staff.routes';
import departmentRoutes from './routes/department.routes';
import hostelRoutes from './routes/hostel.routes';
import mentorRoutes from './routes/mentor.routes';
import wardenRoutes from './routes/warden.routes';
import hodRoutes from './routes/hod.routes';
import parentRoutes from './routes/parent.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/parent', parentRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
