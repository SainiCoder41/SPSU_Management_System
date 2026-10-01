import { User } from '../models/User';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { JwtPayload, UserRole } from '../types';

export class AuthService {
  static async login(email: string, plainPassword: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact SPSU administration.');
    }

    const isMatch = await comparePassword(plainPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const payload: JwtPayload = {
      userId: (user._id as any).toString(),
      role: user.role,
      email: user.email,
    };

    const token = generateToken(payload);

    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };

    return { token, user: safeUser };
  }

  static async me(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    return user;
  }

  static async setupInitialAdmin(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount > 0) {
      throw new Error('Initial admin already exists. Setup route disabled.');
    }

    const passwordHash = await hashPassword(data.password);
    const admin = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'ADMIN' as UserRole,
      isActive: true,
    });

    return admin;
  }
}
