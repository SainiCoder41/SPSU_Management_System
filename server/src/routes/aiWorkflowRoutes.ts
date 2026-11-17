import { Router } from 'express';
import {
  classifyComplaint,
  getLeaveAnomalies,
  naturalDirectorySearch,
  draftNotice,
} from '../controllers/aiWorkflowController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

const router = Router();

router.use(authenticate);

// 1. NLP Complaint Classifier & Anti-Ragging (AIW-001, AIW-002, AIW-003)
router.post('/classify-complaint', classifyComplaint);

// 2. Leave Pattern Anomaly Detector (AIW-004)
router.get('/leave-anomalies/:studentId', authorizeRoles('MENTOR', 'WARDEN', 'HOD', 'ADMIN'), getLeaveAnomalies);

// 3. Natural Language Directory Search (AIW-005)
router.post('/natural-search', authorizeRoles('ADMIN', 'FACULTY', 'MENTOR', 'HOD', 'WARDEN'), naturalDirectorySearch);

// 4. Campus Notice Drafting & Bilingual Hindi Translation (AIW-006)
router.post('/draft-notice', authorizeRoles('ADMIN', 'HOD'), draftNotice);

export default router;
