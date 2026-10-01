import { Hostel } from '../models/Hostel';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { cache } from '../config/redis';

export class HostelService {
  static async getAllHostels() {
    const hostels = await Hostel.find()
      .populate('wardenId', 'firstName lastName fullName email phone')
      .sort({ code: 1 });

    const hostelsWithStats = await Promise.all(
      hostels.map(async (hostel) => {
        const studentCount = await StudentProfile.countDocuments({ hostelId: hostel._id });
        return {
          ...hostel.toObject(),
          residentCount: studentCount,
        };
      })
    );

    return hostelsWithStats;
  }

  static async getHostelById(id: string) {
    const hostel = await Hostel.findById(id).populate('wardenId', 'firstName lastName fullName email phone');
    if (!hostel) throw new Error('Hostel not found');
    const residentCount = await StudentProfile.countDocuments({ hostelId: hostel._id });
    return {
      ...hostel.toObject(),
      residentCount,
    };
  }

  static async assignWarden(hostelId: string, wardenId: string) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) throw new Error('Hostel not found');

    const wardenUser = await User.findById(wardenId);
    if (!wardenUser) throw new Error('Warden user not found');

    hostel.wardenId = wardenUser._id as any;
    await hostel.save();

    wardenUser.role = 'WARDEN';
    await wardenUser.save();

    await cache.delByPattern('hostel');
    return this.getHostelById(hostelId);
  }

  static async getHostelStudents(hostelId: string) {
    return StudentProfile.find({ hostelId })
      .populate('userId', '-passwordHash')
      .populate('mentorId', 'firstName lastName fullName email phone')
      .sort({ roomNumber: 1, createdAt: -1 });
  }
}
