import { Router } from 'express';
import {
  getLibraryBooks,
  addLibraryBook,
  issueLibraryBook,
  returnLibraryBook,
  getMyBorrowedBooks,
  getPlacementDrives,
  createPlacementDrive,
  applyForPlacementDrive,
  getPlacementApplications,
  updatePlacementApplication,
  getVisitorLogs,
  checkInVisitor,
  checkOutVisitor,
  dispatchNotification,
} from '../controllers/campusServicesController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

const router = Router();

router.use(authenticate);

// 1. Library Management (SRV-001)
router.get('/library/books', getLibraryBooks);
router.post('/library/books', authorizeRoles('ADMIN'), addLibraryBook);
router.post('/library/issue', authorizeRoles('ADMIN'), issueLibraryBook);
router.post('/library/return/:issueId', authorizeRoles('ADMIN'), returnLibraryBook);
router.get('/library/my-borrowed', authorizeRoles('STUDENT'), getMyBorrowedBooks);

// 2. Training & Placement Cell (SRV-002)
router.get('/placements/drives', getPlacementDrives);
router.post('/placements/drives', authorizeRoles('ADMIN'), createPlacementDrive);
router.post('/placements/drives/:driveId/apply', authorizeRoles('STUDENT'), applyForPlacementDrive);
router.get('/placements/drives/:driveId/applications', authorizeRoles('ADMIN'), getPlacementApplications);
router.patch('/placements/applications/:appId', authorizeRoles('ADMIN'), updatePlacementApplication);

// 3. Hostel Visitor & Gate Log (SRV-003)
router.get('/visitors', authorizeRoles('WARDEN', 'ADMIN'), getVisitorLogs);
router.post('/visitors/checkin', authorizeRoles('WARDEN', 'ADMIN'), checkInVisitor);
router.post('/visitors/checkout/:logId', authorizeRoles('WARDEN', 'ADMIN'), checkOutVisitor);

// 4. Multi-Channel Notification Dispatcher (SRV-005)
router.post('/notifications/dispatch', authorizeRoles('ADMIN'), dispatchNotification);

export default router;
