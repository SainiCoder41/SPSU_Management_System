import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { CampusServices } from '../services/campusServices.js';
import { Student } from '../models/Student.js';

// ==========================================
// 1. Library Handlers
// ==========================================

export const getLibraryBooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const books = await CampusServices.getLibraryBooks(q as string);
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching library books' });
  }
};

export const addLibraryBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await CampusServices.addLibraryBook(req.body);
    res.status(201).json({ success: true, message: 'Book cataloged successfully', data: book });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error adding book' });
  }
};

export const issueLibraryBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, studentId } = req.body;
    const issue = await CampusServices.issueBook(bookId, studentId, req.user!.id);
    res.status(200).json({ success: true, message: 'Book issued successfully', data: issue });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error issuing book' });
  }
};

export const returnLibraryBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { issueId } = req.params;
    const returned = await CampusServices.returnBook(issueId);
    res.status(200).json({ success: true, message: 'Book returned successfully', data: returned });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error returning book' });
  }
};

export const getMyBorrowedBooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found' });
      return;
    }
    const books = await CampusServices.getStudentBorrowedBooks(student._id.toString());
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching borrowed books' });
  }
};

// ==========================================
// 2. Training & Placement Handlers
// ==========================================

export const getPlacementDrives = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drives = await CampusServices.getPlacementDrives();
    res.status(200).json({ success: true, count: drives.length, data: drives });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching placement drives' });
  }
};

export const createPlacementDrive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drive = await CampusServices.createPlacementDrive(req.body);
    res.status(201).json({ success: true, message: 'Placement drive scheduled', data: drive });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error creating placement drive' });
  }
};

export const applyForPlacementDrive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { driveId } = req.params;
    const student = await Student.findOne({ user: req.user!.id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found' });
      return;
    }

    const application = await CampusServices.applyForPlacementDrive(
      driveId,
      student._id.toString(),
      req.body.resumeUrl
    );
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error submitting application' });
  }
};

export const getPlacementApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { driveId } = req.params;
    const apps = await CampusServices.getDriveApplications(driveId);
    res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching applications' });
  }
};

export const updatePlacementApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appId } = req.params;
    const { status, feedback } = req.body;
    const app = await CampusServices.updateApplicationStatus(appId, status, feedback);
    res.status(200).json({ success: true, message: 'Application status updated', data: app });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error updating application status' });
  }
};

// ==========================================
// 3. Visitor Log Handlers
// ==========================================

export const getVisitorLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const logs = await CampusServices.getVisitorLogs(status as any);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching visitor logs' });
  }
};

export const checkInVisitor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const log = await CampusServices.recordVisitorCheckIn(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Visitor entry recorded', data: log });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error recording visitor check-in' });
  }
};

export const checkOutVisitor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { logId } = req.params;
    const log = await CampusServices.recordVisitorCheckOut(logId);
    res.status(200).json({ success: true, message: 'Visitor departure confirmed', data: log });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error recording visitor check-out' });
  }
};

// ==========================================
// 4. Multi-Channel Notification Dispatcher
// ==========================================

export const dispatchNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await CampusServices.dispatchExternalNotification(req.body);
    res.status(200).json({ success: true, message: 'Notification dispatched via adapter', data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Dispatch error' });
  }
};
