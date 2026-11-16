import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middlewares/auth.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Contact Administrator.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-Only Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Populate extra profile details depending on role
    let profileData: any = null;
    if (['FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'ADMIN'].includes(user.role)) {
      profileData = await Staff.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'STUDENT') {
      profileData = await Student.findOne({ user: user._id })
        .populate('department')
        .populate('hostel')
        .populate({
          path: 'mentor',
          populate: { path: 'user', select: 'name email phone' },
        });
    } else if (user.role === 'PARENT') {
      profileData = await Parent.findOne({ user: user._id }).populate({
        path: 'student',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'department', select: 'name code' },
          { path: 'hostel', select: 'name type warden' },
        ],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      profile: profileData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error during login' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let profileData: any = null;
    if (['FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'ADMIN'].includes(user.role)) {
      profileData = await Staff.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'STUDENT') {
      profileData = await Student.findOne({ user: user._id })
        .populate('department')
        .populate('hostel')
        .populate({
          path: 'mentor',
          populate: { path: 'user', select: 'name email phone' },
        });
    } else if (user.role === 'PARENT') {
      profileData = await Parent.findOne({ user: user._id }).populate({
        path: 'student',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'department', select: 'name code' },
          { path: 'hostel', select: 'name type warden' },
        ],
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      profile: profileData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
