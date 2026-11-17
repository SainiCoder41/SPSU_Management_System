import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { AIRiskService } from '../services/aiRiskService.js';
import { AIChatService } from '../services/aiChatService.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';

export const getMentorMenteesRisk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findOne({ user: req.user!.id });
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff profile not found' });
      return;
    }

    const list = await AIRiskService.getMentorMenteesRiskList(staff._id.toString());
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error computing mentee risk analysis' });
  }
};

export const getDepartmentRisk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.params;
    const list = await AIRiskService.getDepartmentRiskList(departmentId);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error computing department risk analysis' });
  }
};

export const getStudentRiskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let studentId = req.params.studentId;

    if (!studentId && req.user!.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user!.id });
      if (student) studentId = student._id.toString();
    }

    if (!studentId) {
      res.status(404).json({ success: false, message: 'Student not specified' });
      return;
    }

    const profile = await AIRiskService.evaluateStudentRisk(studentId);
    res.status(200).json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error evaluating student risk' });
  }
};

export const handleAIChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message string is required' });
      return;
    }

    const reply = await AIChatService.processQuery(req.user!.id, req.user!.role, message);
    res.status(200).json({ success: true, ...reply });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error processing AI chat query' });
  }
};
