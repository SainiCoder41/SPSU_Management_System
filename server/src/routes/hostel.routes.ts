import { Router } from 'express';
import { HostelController } from '../controllers/hostel.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { assignWardenSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'WARDEN'), HostelController.getHostels);
router.get('/:id', authorize('ADMIN', 'WARDEN'), HostelController.getHostelById);
router.patch('/:id/warden', authorize('ADMIN'), validateRequest(assignWardenSchema), HostelController.assignWarden);
router.get('/:id/students', authorize('ADMIN', 'WARDEN'), HostelController.getHostelStudents);

export default router;
