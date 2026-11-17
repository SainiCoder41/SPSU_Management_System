import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Hostel } from '../models/Hostel.js';
import { AuditLog } from '../models/AuditLog.js';
import { cache } from '../config/redis.js';
import { exportStudentsToExcel } from '../services/bulkImportService.js';
import { AuthRequest } from '../middlewares/auth.js';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { department, semester, section, query, hostel } = req.query;

    const filter: any = {};

    if (department) {
      filter.department = department;
    }
    if (semester) {
      filter.semester = Number(semester);
    }
    if (section) {
      filter.section = section;
    }
    if (hostel) {
      filter.hostel = hostel;
    }

    if (query) {
      const q = String(query).trim();
      const usersMatching = await User.find({
        role: 'STUDENT',
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = usersMatching.map((u) => u._id);

      filter.$or = [
        { rollNumber: { $regex: q, $options: 'i' } },
        { enrollmentNumber: { $regex: q, $options: 'i' } },
        { user: { $in: userIds } },
      ];
    }

    const [total, students] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter)
        .populate('user', 'name email phone avatar isActive')
        .populate('department', 'name code')
        .populate('hostel', 'name type')
        .populate({
          path: 'mentor',
          populate: { path: 'user', select: 'name email phone' },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching students' });
  }
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code')
      .populate('hostel', 'name type warden')
      .populate({
        path: 'mentor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'parent',
        populate: { path: 'user', select: 'name email phone' },
      });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching student details' });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      enrollmentNumber,
      rollNumber,
      program,
      department,
      semester,
      section,
      cgpa,
      admissionYear,
      hostel,
      roomNumber,
      mentor,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const existingStudent = await Student.findOne({
      $or: [{ rollNumber }, { enrollmentNumber }],
    });
    if (existingStudent) {
      res.status(400).json({
        success: false,
        message: 'Student with this roll number or enrollment number already exists',
      });
      return;
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: password || 'Student@1234',
      role: 'STUDENT',
      phone,
    });
    await user.save();

    const student = new Student({
      user: user._id,
      enrollmentNumber,
      rollNumber,
      program: program || 'B.Tech',
      department,
      semester,
      section: section || 'A',
      cgpa: cgpa || 0.0,
      admissionYear: admissionYear || new Date().getFullYear(),
      hostel: hostel || null,
      roomNumber: roomNumber || '',
      mentor: mentor || null,
    });
    await student.save();

    if (hostel) {
      await Hostel.findByIdAndUpdate(hostel, { $inc: { occupancy: 1 } });
    }

    await cache.del('admin:stats');

    const created = await Student.findById(student._id)
      .populate('user', 'name email phone')
      .populate('department')
      .populate('hostel');

    res.status(201).json({ success: true, message: 'Student registered successfully', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating student' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const {
      name,
      phone,
      department,
      semester,
      section,
      cgpa,
      hostel,
      roomNumber,
      mentor,
      program,
    } = req.body;

    if (name || phone) {
      await User.findByIdAndUpdate(student.user, {
        ...(name && { name }),
        ...(phone && { phone }),
      });
    }

    // Check hostel changes
    if (hostel !== undefined && String(hostel) !== String(student.hostel)) {
      if (student.hostel) {
        await Hostel.findByIdAndUpdate(student.hostel, { $inc: { occupancy: -1 } });
      }
      if (hostel) {
        await Hostel.findByIdAndUpdate(hostel, { $inc: { occupancy: 1 } });
      }
      student.hostel = hostel || null;
    }

    if (department) student.department = department;
    if (semester !== undefined) student.semester = semester;
    if (section) student.section = section;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (roomNumber !== undefined) student.roomNumber = roomNumber;
    if (mentor !== undefined) student.mentor = mentor || null;
    if (program) student.program = program;

    await student.save();
    await cache.del('admin:stats');

    const updated = await Student.findById(student._id)
      .populate('user', 'name email phone')
      .populate('department')
      .populate('hostel')
      .populate('mentor');

    res.status(200).json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating student' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    if (student.hostel) {
      await Hostel.findByIdAndUpdate(student.hostel, { $inc: { occupancy: -1 } });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(student._id);

    await cache.del('admin:stats');

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting student' });
  }
};

export const exportStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const buffer = await exportStudentsToExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="spsu_students_directory.xlsx"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating export file' });
  }
};

export const toggleStudentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const user = await User.findById(student.user);
    if (!user) {
      res.status(404).json({ success: false, message: 'Linked user record not found' });
      return;
    }

    const prevState = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      actor: req.user!.id,
      actorRole: req.user!.role,
      actorEmail: req.user!.email,
      action: user.isActive ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
      resourceType: 'Student',
      resourceId: student._id.toString(),
      previousState: { isActive: prevState },
      newState: { isActive: user.isActive },
      comment: `Student profile status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
    });

    await cache.del('admin:stats');

    res.status(200).json({
      success: true,
      message: `Student account marked as ${user.isActive ? 'Active' : 'Inactive'}`,
      data: { id: student._id, isActive: user.isActive },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error toggling student status' });
  }
};
