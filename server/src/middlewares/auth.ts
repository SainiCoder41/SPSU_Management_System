import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Role } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    secondaryRoles?: Role[];
    name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; role: Role; email: string };
    
    // Check if user still exists and isActive
    const user = await User.findById(decoded.id).select('name email role secondaryRoles isActive');
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User session is invalid or user is inactive.' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      secondaryRoles: user.secondaryRoles || [],
      name: user.name,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
