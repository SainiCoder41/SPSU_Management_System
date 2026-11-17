import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { AcademicService } from '../services/academicService.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';

export const enterMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const marksheet = await AcademicService.enterSemesterMarks(
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Semester marks recorded and SGPA/CGPA computed successfully',
      data: marksheet,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error recording semester marks' });
  }
};

export const getMyResults = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const results = await AcademicService.getStudentResults(studentId);
    res.status(200).json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching results' });
  }
};

export const getStudentResultsById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await AcademicService.getStudentResults(req.params.studentId);
    res.status(200).json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching student results' });
  }
};

export const getDepartmentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analytics = await AcademicService.getDepartmentAnalytics(req.params.departmentId);
    res.status(200).json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching department analytics' });
  }
};

export const getDigitalIdCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let studentId = req.params.studentId;

    if (!studentId) {
      if (req.user!.role === 'STUDENT') {
        const student = await Student.findOne({ user: req.user!.id });
        if (student) studentId = student._id.toString();
      } else if (req.user!.role === 'PARENT') {
        const parent = await Parent.findOne({ user: req.user!.id });
        if (parent && parent.student) studentId = parent.student.toString();
      }
    }

    if (!studentId) {
      res.status(404).json({ success: false, message: 'Student record not found' });
      return;
    }

    const idCard = await AcademicService.getDigitalIdCard(studentId);
    res.status(200).json({ success: true, data: idCard });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching digital ID card' });
  }
};

export const verifyDigitalId = async (req: Request, res: Response): Promise<void> => {
  try {
    const idCard = await AcademicService.getDigitalIdCard(req.params.studentId);
    res.status(200).json({
      success: true,
      verified: true,
      institution: 'Sir Padampat Singhania University (SPSU), Udaipur',
      student: idCard,
    });
  } catch (err: any) {
    res.status(404).json({ success: false, verified: false, message: 'Invalid or expired student ID' });
  }
};
