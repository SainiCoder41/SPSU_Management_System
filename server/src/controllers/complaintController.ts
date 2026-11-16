import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { ComplaintService } from '../services/complaintService.js';

export const submitComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaint = await ComplaintService.submitComplaint(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Grievance ticket created successfully',
      data: complaint,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error submitting complaint' });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaints = await ComplaintService.getMyComplaints(req.user!.id);
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching complaints' });
  }
};

export const getComplaintsQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, sensitiveOnly } = req.query;
    const complaints = await ComplaintService.getComplaintsQueue(req.user!.id, req.user!.role, {
      status: status as any,
      category: category as any,
      sensitiveOnly: sensitiveOnly === 'true',
    });
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching complaint queue' });
  }
};

export const getComplaintDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaint = await ComplaintService.getComplaintDetails(req.params.id, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, data: complaint });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message || 'Error fetching complaint' });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, resolutionNote, comment } = req.body;
    const complaint = await ComplaintService.updateStatus(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.user!.email,
      status,
      resolutionNote,
      comment
    );
    res.status(200).json({
      success: true,
      message: `Grievance status updated to ${status}`,
      data: complaint,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message || 'Error updating complaint' });
  }
};

export const addComplaintNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, isInternal } = req.body;
    const complaint = await ComplaintService.addNote(
      req.params.id,
      req.user!.id,
      req.user!.email,
      text,
      !!isInternal
    );
    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: complaint,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error adding note' });
  }
};
