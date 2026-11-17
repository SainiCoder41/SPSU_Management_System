import { Router } from 'express';
import multer from 'multer';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  importStaff,
  exportStaff,
} from '../controllers/staffController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { staffCreateSchema, staffUpdateSchema } from '../validators/index.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.use(authenticate);

// Staff Bulk Export & Import (SIS-007, SIS-008)
router.get('/export', authorizeRoles('ADMIN'), exportStaff);
router.post('/import', authorizeRoles('ADMIN'), upload.single('file'), importStaff);

router.get('/', authorizeRoles('ADMIN', 'HOD', 'FACULTY', 'MENTOR', 'WARDEN'), getStaff);
router.post('/', authorizeRoles('ADMIN'), validateRequest(staffCreateSchema), createStaff);
router.get('/:id', authorizeRoles('ADMIN', 'HOD', 'FACULTY', 'MENTOR', 'WARDEN'), getStaffById);
router.put('/:id', authorizeRoles('ADMIN'), validateRequest(staffUpdateSchema), updateStaff);
router.patch('/:id/toggle-status', authorizeRoles('ADMIN'), toggleStaffStatus);

export default router;
