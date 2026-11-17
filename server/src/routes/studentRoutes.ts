import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudents,
  toggleStudentStatus,
} from '../controllers/studentController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { studentCreateSchema, studentUpdateSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

// Export must be before /:id
router.get('/export', authorizeRoles('ADMIN'), exportStudents);

// Students directory accessible by staff roles & admin
router.get('/', authorizeRoles('ADMIN', 'FACULTY', 'MENTOR', 'HOD', 'WARDEN'), getStudents);
router.post('/', authorizeRoles('ADMIN'), validateRequest(studentCreateSchema), createStudent);

router.get('/:id', authorizeRoles('ADMIN', 'FACULTY', 'MENTOR', 'HOD', 'WARDEN', 'STUDENT'), getStudentById);
router.put('/:id', authorizeRoles('ADMIN'), validateRequest(studentUpdateSchema), updateStudent);
router.patch('/:id/toggle-status', authorizeRoles('ADMIN'), toggleStudentStatus);
router.delete('/:id', authorizeRoles('ADMIN'), deleteStudent);

export default router;
