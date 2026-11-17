import { Router } from 'express';
import { login, logout, getMe, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { loginSchema } from '../validators/index.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
