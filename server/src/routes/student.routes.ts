import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createStudentSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/me/profile', authorize('STUDENT'), StudentController.getMyProfile);
router.get('/', authorize('ADMIN', 'FACULTY', 'HOD', 'MENTOR', 'WARDEN'), StudentController.getStudents);
router.get('/:id', authorize('ADMIN', 'FACULTY', 'HOD', 'MENTOR', 'WARDEN', 'PARENT', 'STUDENT'), StudentController.getStudentById);
router.post('/', authorize('ADMIN'), validateRequest(createStudentSchema), StudentController.createStudent);
router.patch('/:id', authorize('ADMIN'), StudentController.updateStudent);

export default router;
