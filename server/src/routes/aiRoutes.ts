import { Router } from 'express';
import {
  getMentorMenteesRisk,
  getDepartmentRisk,
  getStudentRiskById,
  handleAIChat,
} from '../controllers/aiController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

const router = Router();

router.use(authenticate);

// Student Risk & Early Warning (AI-001, AI-002, AI-003, AI-007)
router.get('/risk/mentees', authorizeRoles('MENTOR', 'ADMIN'), getMentorMenteesRisk);
router.get('/risk/department/:departmentId', authorizeRoles('HOD', 'ADMIN'), getDepartmentRisk);
router.get('/risk/student/:studentId', authorizeRoles('MENTOR', 'HOD', 'FACULTY', 'ADMIN'), getStudentRiskById);

// In-App Campus AI Chatbot (AI-004, AI-005, AI-006)
router.post('/chat', handleAIChat);

export default router;
