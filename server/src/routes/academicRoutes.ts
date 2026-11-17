import { Router } from 'express';
import {
  enterMarks,
  getMyResults,
  getStudentResultsById,
  getDepartmentAnalytics,
  getDigitalIdCard,
  verifyDigitalId,
} from '../controllers/academicController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

const router = Router();

// Public QR verification endpoint (ACD-005)
router.get('/verify-id/:studentId', verifyDigitalId);

router.use(authenticate);

// Student / Parent Results & ID Card (ACD-002, ACD-005)
router.get('/my-results', getMyResults);
router.get('/my-id-card', getDigitalIdCard);
router.get('/student/:studentId/results', authorizeRoles('ADMIN', 'HOD', 'FACULTY', 'MENTOR'), getStudentResultsById);
router.get('/student/:studentId/id-card', authorizeRoles('ADMIN', 'HOD', 'FACULTY', 'MENTOR', 'WARDEN'), getDigitalIdCard);

// Faculty Marks Entry (ACD-001)
router.post('/marks', authorizeRoles('ADMIN', 'FACULTY', 'HOD'), enterMarks);

// Department Analytics (ACD-003, ACD-004)
router.get('/analytics/department/:departmentId', authorizeRoles('ADMIN', 'HOD'), getDepartmentAnalytics);

export default router;
