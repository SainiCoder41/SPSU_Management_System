import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createDepartmentSchema, assignHodSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', DepartmentController.getDepartments);
router.get('/:id', DepartmentController.getDepartmentById);
router.post('/', authorize('ADMIN'), validateRequest(createDepartmentSchema), DepartmentController.createDepartment);
router.patch('/:id/hod', authorize('ADMIN'), validateRequest(assignHodSchema), DepartmentController.assignHod);

export default router;
