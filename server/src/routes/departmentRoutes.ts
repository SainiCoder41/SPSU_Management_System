import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from '../controllers/departmentController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { departmentSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorizeRoles('ADMIN'), validateRequest(departmentSchema), createDepartment);
router.put('/:id', authorizeRoles('ADMIN'), validateRequest(departmentSchema.partial()), updateDepartment);

export default router;
