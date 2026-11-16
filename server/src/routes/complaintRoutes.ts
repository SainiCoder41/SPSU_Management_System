import { Router } from 'express';
import {
  submitComplaint,
  getMyComplaints,
  getComplaintsQueue,
  getComplaintDetails,
  updateComplaintStatus,
  addComplaintNote,
} from '../controllers/complaintController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  submitComplaintSchema,
  updateComplaintStatusSchema,
  addComplaintNoteSchema,
} from '../validators/complaintValidators.js';

const router = Router();

router.use(authenticate);

// Submitter endpoints
router.post('/', validateRequest(submitComplaintSchema), submitComplaint);
router.get('/my', getMyComplaints);

// Grievance Officers & Admins queue
router.get('/queue', authorizeRoles('ADMIN', 'HOD', 'WARDEN', 'FACULTY', 'MENTOR'), getComplaintsQueue);

// Single ticket & actions
router.get('/:id', getComplaintDetails);
router.put('/:id/status', authorizeRoles('ADMIN', 'HOD', 'WARDEN', 'FACULTY', 'MENTOR'), validateRequest(updateComplaintStatusSchema), updateComplaintStatus);
router.post('/:id/notes', validateRequest(addComplaintNoteSchema), addComplaintNote);

export default router;
