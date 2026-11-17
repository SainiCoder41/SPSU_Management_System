import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { AttendanceService } from '../services/attendanceService.js';
import { Subject } from '../models/Subject.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Timetable } from '../models/Timetable.js';

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attendance = await AttendanceService.markAttendance(
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error recording attendance' });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let studentId: string | null = null;

    if (req.user!.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user!.id });
      if (student) studentId = student._id.toString();
    } else if (req.user!.role === 'PARENT') {
      const parent = await Parent.findOne({ user: req.user!.id });
      if (parent && parent.student) studentId = parent.student.toString();
    }

    if (!studentId) {
      res.status(404).json({ success: false, message: 'Student profile not linked to user' });
      return;
    }

    const summary = await AttendanceService.getStudentAttendanceSummary(studentId);
    res.status(200).json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching attendance' });
  }
};

export const getStudentAttendanceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const summary = await AttendanceService.getStudentAttendanceSummary(req.params.studentId);
    res.status(200).json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching student attendance' });
  }
};

export const getLowAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, threshold } = req.query;
    const list = await AttendanceService.getLowAttendanceStudents({
      departmentId: departmentId as string,
      threshold: threshold ? Number(threshold) : undefined,
    });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching low attendance summary' });
  }
};

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, semester } = req.query;
    const filter: any = { isActive: true };
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);

    const subjects = await Subject.find(filter)
      .populate('department', 'name code')
      .sort({ semester: 1, code: 1 })
      .lean();

    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching subjects' });
  }
};

export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error creating subject' });
  }
};

export const getTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, semester, section } = req.query;
    if (!department || !semester || !section) {
      res.status(400).json({ success: false, message: 'Department, semester, and section are required' });
      return;
    }

    const timetable = await Timetable.findOne({
      department,
      semester: Number(semester),
      section,
    })
      .populate('slots.subject', 'name code credits type')
      .populate('slots.faculty', 'name email role')
      .lean();

    res.status(200).json({ success: true, data: timetable });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching timetable' });
  }
};

export const saveTimetable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const timetable = await AttendanceService.saveTimetable(req.body);
    res.status(200).json({ success: true, message: 'Timetable published successfully', data: timetable });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error saving timetable' });
  }
};
