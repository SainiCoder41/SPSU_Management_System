import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { Role } from '../types/index.js';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userRoles = [req.user.role, ...(req.user.secondaryRoles || [])];
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role(s) '${userRoles.join(', ')}'. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
