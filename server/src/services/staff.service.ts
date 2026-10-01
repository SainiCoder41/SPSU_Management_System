import { User } from '../models/User';
import { StaffProfile } from '../models/StaffProfile';
import { hashPassword } from '../utils/password';
import { cache } from '../config/redis';

export class StaffService {
  static async getStaff(queryFilter: any = {}) {
    const staffList = await StaffProfile.find(queryFilter)
      .populate('userId', '-passwordHash')
      .populate('departmentId', 'name code hodId')
      .sort({ createdAt: -1 });
    return staffList;
  }

  static async getStaffById(id: string) {
    const staff = await StaffProfile.findById(id)
      .populate('userId', '-passwordHash')
      .populate('departmentId', 'name code hodId');
    if (!staff) {
      const staffByUser = await StaffProfile.findOne({ userId: id })
        .populate('userId', '-passwordHash')
        .populate('departmentId', 'name code hodId');
      if (!staffByUser) throw new Error('Staff profile not found');
      return staffByUser;
    }
    return staff;
  }

  static async createStaff(data: any) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) throw new Error('User with this email already exists');

    const tempPassword = data.password || 'Spsu@1234';
    const passwordHash = await hashPassword(tempPassword);

    const user = await User.create({
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`,
      email: data.email.toLowerCase(),
      phone: data.phone || '',
      passwordHash,
      role: data.role,
      gender: data.gender || 'OTHER',
      isActive: true,
    });

    const staffProfile = await StaffProfile.create({
      userId: user._id,
      employeeId: data.employeeId.toUpperCase(),
      designation: data.designation,
      departmentId: data.departmentId || null,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      employmentType: data.employmentType || 'FULL_TIME',
      qualification: data.qualification || '',
      specialization: data.specialization || '',
      reportingHodId: data.reportingHodId || null,
    });

    await cache.delByPattern('staff:list');
    await cache.delByPattern('dashboard:admin:stats');

    return this.getStaffById((staffProfile._id as any).toString());
  }
}
