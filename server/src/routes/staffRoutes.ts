import { Router } from 'express';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
} from '../controllers/staffController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { staffCreateSchema, staffUpdateSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'HOD', 'FACULTY', 'MENTOR', 'WARDEN'), getStaff);
router.post('/', authorizeRoles('ADMIN'), validateRequest(staffCreateSchema), createStaff);
router.get('/:id', authorizeRoles('ADMIN', 'HOD', 'FACULTY', 'MENTOR', 'WARDEN'), getStaffById);
router.put('/:id', authorizeRoles('ADMIN'), validateRequest(staffUpdateSchema), updateStaff);

export default router;
