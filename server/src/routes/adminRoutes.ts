import { Router } from 'express';
import multer from 'multer';
import { getStats, importStudents, getAuditLogs } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/stats', getStats);
router.get('/audit-logs', getAuditLogs);
router.post('/import/students', upload.single('file'), importStudents);

export default router;
