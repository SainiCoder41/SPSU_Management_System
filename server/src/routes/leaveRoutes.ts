import { Router } from 'express';
import {
  submitLeave,
  getMyLeaves,
  getMyBalances,
  getPendingApprovals,
  reviewLeave,
  cancelLeave,
  getLeaveById,
  getAllLeaves,
  getLeaveTypes,
  createLeaveType,
} from '../controllers/leaveController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  createLeaveRequestSchema,
  reviewLeaveRequestSchema,
  leaveTypeConfigSchema,
} from '../validators/leaveValidators.js';

const router = Router();

router.use(authenticate);

// Leave Types
router.get('/types', getLeaveTypes);
router.post('/types', authorizeRoles('ADMIN'), validateRequest(leaveTypeConfigSchema), createLeaveType);

// Balances and Applicant History
router.get('/balances', getMyBalances);
router.get('/my', getMyLeaves);

// Approver Queue (Mentors, Wardens, HODs, Admins)
router.get('/pending', authorizeRoles('MENTOR', 'WARDEN', 'HOD', 'FACULTY', 'ADMIN'), getPendingApprovals);

// Submit and review
router.post('/', validateRequest(createLeaveRequestSchema), submitLeave);
router.post('/:id/review', validateRequest(reviewLeaveRequestSchema), reviewLeave);
router.post('/:id/cancel', cancelLeave);

// Details & Admin Oversight
router.get('/:id', getLeaveById);
router.get('/', authorizeRoles('ADMIN', 'HOD', 'WARDEN'), getAllLeaves);

export default router;
