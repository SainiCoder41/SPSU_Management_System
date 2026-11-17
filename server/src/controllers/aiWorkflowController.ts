import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { AIWorkflowService } from '../services/aiWorkflowService.js';

export const classifyComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      res.status(400).json({ success: false, message: 'Title or description required for classification' });
      return;
    }

    const result = AIWorkflowService.classifyComplaint(title || '', description || '');
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error classifying complaint' });
  }
};

export const getLeaveAnomalies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const report = await AIWorkflowService.analyzeLeavePatterns(studentId);
    res.status(200).json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error analyzing leave anomalies' });
  }
};

export const naturalDirectorySearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ success: false, message: 'Search query string is required' });
      return;
    }

    const results = await AIWorkflowService.naturalLanguageDirectorySearch(query);
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error performing natural directory search' });
  }
};

export const draftNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, bulletPoints, category, targetAudience } = req.body;
    if (!title || !Array.isArray(bulletPoints)) {
      res.status(400).json({ success: false, message: 'Title and bulletPoints array are required' });
      return;
    }

    const draft = AIWorkflowService.draftAndTranslateNotice({
      title,
      bulletPoints,
      category: category || 'General',
      targetAudience: targetAudience || 'All Students & Staff',
    });

    res.status(200).json({ success: true, data: draft });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error drafting notice' });
  }
};
