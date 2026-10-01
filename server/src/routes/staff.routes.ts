import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createStaffSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'HOD', 'FACULTY'), StaffController.getStaff);
router.get('/:id', authorize('ADMIN', 'HOD', 'FACULTY'), StaffController.getStaffById);
router.post('/', authorize('ADMIN'), validateRequest(createStaffSchema), StaffController.createStaff);

export default router;
