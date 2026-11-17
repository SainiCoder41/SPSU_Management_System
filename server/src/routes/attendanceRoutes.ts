import { Router } from 'express';
import {
  markAttendance,
  getMyAttendance,
  getStudentAttendanceById,
  getLowAttendance,
  getSubjects,
  createSubject,
  getTimetable,
  saveTimetable,
} from '../controllers/attendanceController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

const router = Router();

router.use(authenticate);

// Student / Parent Attendance
router.get('/my', getMyAttendance);
router.get('/student/:studentId', authorizeRoles('ADMIN', 'HOD', 'MENTOR', 'FACULTY', 'WARDEN'), getStudentAttendanceById);

// Low Attendance summary (ATT-003)
router.get('/low-attendance', authorizeRoles('ADMIN', 'HOD', 'MENTOR'), getLowAttendance);

// Faculty mark attendance (ATT-001)
router.post('/mark', authorizeRoles('ADMIN', 'FACULTY', 'HOD', 'MENTOR'), markAttendance);

// Subjects (ATT-004)
router.get('/subjects', getSubjects);
router.post('/subjects', authorizeRoles('ADMIN', 'HOD'), createSubject);

// Timetable (ATT-005)
router.get('/timetable', getTimetable);
router.post('/timetable', authorizeRoles('ADMIN', 'HOD'), saveTimetable);

export default router;
