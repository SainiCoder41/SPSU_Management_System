import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorize('PARENT', 'ADMIN'));

router.get('/students', ParentController.getLinkedStudents);
router.get('/students/:studentId', ParentController.getStudentDetail);

export default router;
