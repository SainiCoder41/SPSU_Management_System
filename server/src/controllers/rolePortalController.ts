import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { Parent } from '../models/Parent.js';

// Mentor Portal: /api/mentor/mentees
export const getMentorMentees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findOne({ user: req.user?.id });
    if (!staff) {
      res.status(404).json({ success: false, message: 'Mentor profile not found for this user' });
      return;
    }

    const mentees = await Student.find({ mentor: staff._id })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('hostel', 'name type')
      .sort({ semester: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: mentees.length,
      data: {
        mentor: staff,
        mentees,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching mentees' });
  }
};

// Warden Portal: /api/warden/residents
export const getWardenResidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findOne({ user: req.user?.id });
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff profile not found' });
      return;
    }

    const hostel = await Hostel.findOne({ warden: staff._id });
    if (!hostel) {
      res.status(404).json({ success: false, message: 'No hostel currently assigned to this warden' });
      return;
    }

    const residents = await Student.find({ hostel: hostel._id })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate({
        path: 'mentor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ roomNumber: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      data: {
        hostel,
        residentsCount: residents.length,
        residents,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching hostel residents' });
  }
};

// HOD Portal: /api/hod/overview
export const getHodOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findOne({ user: req.user?.id });
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff profile not found' });
      return;
    }

    // Find the department where this staff is HOD (or staff.department)
    let department = await Department.findOne({ hod: staff._id });
    if (!department) {
      department = await Department.findById(staff.department);
    }

    if (!department) {
      res.status(404).json({ success: false, message: 'No department found for this HOD' });
      return;
    }

    const [facultyMembers, students] = await Promise.all([
      Staff.find({ department: department._id }).populate('user', 'name email phone role isActive avatar'),
      Student.find({ department: department._id })
        .populate('user', 'name email phone avatar')
        .populate('hostel', 'name')
        .populate({
          path: 'mentor',
          populate: { path: 'user', select: 'name' },
        })
        .sort({ semester: 1, rollNumber: 1 }),
    ]);

    // Calculate semester breakdown
    const semesterDistribution: Record<number, number> = {};
    students.forEach((s) => {
      semesterDistribution[s.semester] = (semesterDistribution[s.semester] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        department,
        facultyCount: facultyMembers.length,
        studentCount: students.length,
        semesterDistribution,
        facultyMembers,
        students,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching HOD departmental overview' });
  }
};

// Parent Portal: /api/parent/student
export const getParentStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parentRecord = await Parent.findOne({ user: req.user?.id }).populate({
      path: 'student',
      populate: [
        { path: 'user', select: 'name email phone avatar' },
        { path: 'department', select: 'name code' },
        {
          path: 'hostel',
          populate: {
            path: 'warden',
            populate: { path: 'user', select: 'name email phone' },
          },
        },
        {
          path: 'mentor',
          populate: { path: 'user', select: 'name email phone' },
        },
      ],
    });

    if (!parentRecord || !parentRecord.student) {
      res.status(404).json({ success: false, message: 'No student record associated with this parent account' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        parent: parentRecord,
        student: parentRecord.student,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching parent student details' });
  }
};
