import { Router } from 'express';
import {
  getNotices,
  getNoticeById,
  publishNotice,
  archiveNotice,
} from '../controllers/noticeController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/roles.js';
import { validateRequest } from '../middlewares/validate.js';
import { publishNoticeSchema } from '../validators/noticeValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotices);
router.post('/', authorizeRoles('ADMIN', 'FACULTY', 'HOD', 'WARDEN'), validateRequest(publishNoticeSchema), publishNotice);
router.get('/:id', getNoticeById);
router.patch('/:id/archive', authorizeRoles('ADMIN', 'FACULTY', 'HOD', 'WARDEN'), archiveNotice);

export default router;
