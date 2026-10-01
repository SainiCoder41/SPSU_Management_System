import { Router } from 'express';
import { WardenController } from '../controllers/warden.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate, authorize('WARDEN', 'ADMIN'));

router.get('/hostel', WardenController.getMyHostel);
router.get('/students', WardenController.getResidents);

export default router;
