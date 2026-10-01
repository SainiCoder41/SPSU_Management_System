import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Hostel } from '../models/Hostel';
import { hashPassword } from '../utils/password';
import { cache } from '../config/redis';

export interface StudentFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  semester?: number;
  batch?: string;
  section?: string;
  hostelCode?: string;
  gender?: string;
  status?: string;
  mentorId?: string;
  hostelId?: string;
}

export class StudentService {
  static async getStudents(filters: StudentFilterOptions) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, filters.limit || 20);
    const skip = (page - 1) * limit;

    const cacheKey = `students:list:${JSON.stringify(filters)}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const query: any = {};

    if (filters.branch) query.branch = filters.branch;
    if (filters.semester) query.semester = Number(filters.semester);
    if (filters.batch) query.batch = filters.batch;
    if (filters.section) query.section = filters.section;
    if (filters.status) query.currentStatus = filters.status;
    if (filters.mentorId) query.mentorId = filters.mentorId;
    if (filters.hostelId) query.hostelId = filters.hostelId;

    if (filters.hostelCode) {
      const hostel = await Hostel.findOne({ code: filters.hostelCode });
      if (hostel) {
        query.hostelId = hostel._id;
      }
    }

    let userIdsMatchingSearch: any[] | null = null;
    if (filters.search || filters.gender) {
      const userSearchQuery: any = {};
      if (filters.gender) userSearchQuery.gender = filters.gender;
      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        userSearchQuery.$or = [
          { firstName: regex },
          { lastName: regex },
          { fullName: regex },
          { email: regex },
        ];
      }

      const users = await User.find(userSearchQuery).select('_id');
      userIdsMatchingSearch = users.map((u) => u._id);
    }

    if (filters.search && !userIdsMatchingSearch?.length) {
      const regex = new RegExp(filters.search, 'i');
      const profileSearch = await StudentProfile.find({
        $or: [
          { enrollmentNumber: regex },
          { registrationNumber: regex },
          { rollNumber: regex },
        ],
      }).select('userId');
      
      const extraUserIds = profileSearch.map(p => p.userId);
      userIdsMatchingSearch = Array.from(new Set([...(userIdsMatchingSearch || []), ...extraUserIds]));
    }

    if (userIdsMatchingSearch !== null) {
      query.userId = { $in: userIdsMatchingSearch };
    }

    const [students, totalItems] = await Promise.all([
      StudentProfile.find(query)
        .populate('userId', '-passwordHash')
        .populate('mentorId', 'firstName lastName fullName email phone')
        .populate('hostelId', 'code gender wardenId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      StudentProfile.countDocuments(query),
    ]);

    const result = {
      data: students,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };

    await cache.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  static async getStudentById(id: string) {
    const student = await StudentProfile.findById(id)
      .populate('userId', '-passwordHash')
      .populate('mentorId', 'firstName lastName fullName email phone')
      .populate({
        path: 'hostelId',
        select: 'code gender wardenId',
        populate: {
          path: 'wardenId',
          select: 'firstName lastName fullName email phone',
        },
      })
      .populate({
        path: 'parentIds',
        populate: {
          path: 'userId',
          select: 'firstName lastName fullName email phone',
        },
      });

    if (!student) {
      const studentByUser = await StudentProfile.findOne({ userId: id })
        .populate('userId', '-passwordHash')
        .populate('mentorId', 'firstName lastName fullName email phone')
        .populate({
          path: 'hostelId',
          select: 'code gender wardenId',
          populate: {
            path: 'wardenId',
            select: 'firstName lastName fullName email phone',
          },
        })
        .populate({
          path: 'parentIds',
          populate: {
            path: 'userId',
            select: 'firstName lastName fullName email phone',
          },
        });
      if (!studentByUser) throw new Error('Student profile not found');
      return studentByUser;
    }

    return student;
  }

  static async createStudent(data: any) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) throw new Error('User with this email already exists');

    const existingEnrollment = await StudentProfile.findOne({
      enrollmentNumber: data.enrollmentNumber.toUpperCase(),
    });
    if (existingEnrollment) throw new Error('Enrollment number already exists');

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
      role: 'STUDENT',
      gender: data.gender || 'OTHER',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      isActive: true,
    });

    const studentProfile = await StudentProfile.create({
      userId: user._id,
      enrollmentNumber: data.enrollmentNumber.toUpperCase(),
      registrationNumber: data.registrationNumber.toUpperCase(),
      admissionYear: data.admissionYear || new Date().getFullYear(),
      academicYear: data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
      program: data.program,
      degree: data.degree,
      branch: data.branch,
      specialization: data.specialization || null,
      semester: data.semester,
      batch: data.batch,
      section: data.section,
      rollNumber: data.rollNumber,
      currentStatus: 'ACTIVE',
      mentorId: data.mentorId || null,
      hostelId: data.hostelId || null,
      parentIds: data.parentIds || [],
      address: data.address || {},
      emergencyContact: data.emergencyContact || {},
    });

    await cache.delByPattern('students:list');
    await cache.delByPattern('dashboard:admin:stats');

    return this.getStudentById((studentProfile._id as any).toString());
  }

  static async updateStudent(id: string, updateData: any) {
    const student = await StudentProfile.findById(id);
    if (!student) throw new Error('Student profile not found');

    if (updateData.user) {
      await User.findByIdAndUpdate(student.userId, updateData.user);
    }

    await StudentProfile.findByIdAndUpdate(id, updateData.profile || updateData, {
      new: true,
    });

    await cache.delByPattern('students:list');
    await cache.delByPattern('dashboard:admin:stats');

    return this.getStudentById(id);
  }
}
