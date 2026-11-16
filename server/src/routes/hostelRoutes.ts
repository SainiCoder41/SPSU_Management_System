import { Router } from 'express';
import {
  getHostels,
  createHostel,
  updateHostel,
} from '../controllers/hostelController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { hostelSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getHostels);
router.post('/', authorizeRoles('ADMIN'), validateRequest(hostelSchema), createHostel);
router.put('/:id', authorizeRoles('ADMIN'), validateRequest(hostelSchema.partial()), updateHostel);

export default router;
