import { Router } from 'express';
import { HodController } from '../controllers/hod.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorize('HOD', 'ADMIN'));

router.get('/department', HodController.getMyDepartment);
router.get('/faculty', HodController.getDepartmentFaculty);
router.get('/students', HodController.getDepartmentStudents);

export default router;
