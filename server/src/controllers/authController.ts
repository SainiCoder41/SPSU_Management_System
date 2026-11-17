import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { AuditLog } from '../models/AuditLog.js';
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

    // Check account temporary lockout (NFR-004)
    if (user.isLocked()) {
      const minutesRemaining = Math.ceil(((user.lockUntil as Date).getTime() - Date.now()) / (60 * 1000));
      res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to repeated failed logins. Please try again after ${minutesRemaining} minute(s).`,
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
        await user.save();
        res.status(429).json({
          success: false,
          message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
        });
        return;
      }
      await user.save();
      res.status(401).json({
        success: false,
        message: `Invalid email or password. Attempt ${user.failedLoginAttempts} of 5.`,
      });
      return;
    }

    // Reset failed login attempts upon success
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
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
        secondaryRoles: user.secondaryRoles || [],
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

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(req.user!.id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match' });
      return;
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'PASSWORD_CHANGED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      comment: 'User changed their account password',
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error changing password' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      // Don't leak user existence
      res.status(200).json({ success: true, message: 'If an account exists, a reset link has been dispatched.' });
      return;
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken, // Returned for testing / development
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating reset token' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Token and new password are required' });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
      return;
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully. Please log in.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error resetting password' });
  }
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
        secondaryRoles: user.secondaryRoles || [],
        phone: user.phone,
        avatar: user.avatar,
      },
      profile: profileData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
