import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { env } from '../config/env';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { token, user } = await AuthService.login(email, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess({
        res,
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error: any) {
      return sendError(res, 401, error.message || 'Login failed');
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return sendSuccess({ res, message: 'Logged out successfully' });
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthenticated');
      }
      const user = await AuthService.me(req.user.userId);
      return sendSuccess({ res, message: 'Current user profile', data: { user } });
    } catch (error: any) {
      return sendError(res, 401, error.message || 'Failed to fetch user');
    }
  }

  static async setupAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await AuthService.setupInitialAdmin(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Initial admin account created successfully',
        data: { admin },
      });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Admin setup failed');
    }
  }
}
