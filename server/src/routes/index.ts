import { Router } from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import studentRoutes from './studentRoutes.js';
import staffRoutes from './staffRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import hostelRoutes from './hostelRoutes.js';
import { mentorRouter, wardenRouter, hodRouter, parentRouter } from './portalRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/students', studentRoutes);
router.use('/staff', staffRoutes);
router.use('/departments', departmentRoutes);
router.use('/hostels', hostelRoutes);
router.use('/mentor', mentorRouter);
router.use('/warden', wardenRouter);
router.use('/hod', hodRouter);
router.use('/parent', parentRouter);

export default router;
