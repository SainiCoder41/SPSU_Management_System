import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { Role } from '../types/index.js';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
