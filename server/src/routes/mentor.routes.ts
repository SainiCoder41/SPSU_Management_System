import { Router } from 'express';
import { MentorController } from '../controllers/mentor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorize('MENTOR', 'ADMIN'));

router.get('/students', MentorController.getMentees);
router.get('/students/:id', MentorController.getMenteeById);

export default router;
