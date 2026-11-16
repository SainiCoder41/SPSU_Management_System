import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { LeaveService } from '../services/leaveService.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { LeaveType } from '../models/LeaveType.js';

export const submitLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leave = await LeaveService.submitLeaveRequest(
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully and routed to assigned approver',
      data: leave,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error submitting leave request' });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaves = await LeaveRequest.find({ applicant: req.user!.id })
      .populate('leaveType')
      .populate('currentApprover', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching your leaves' });
  }
};

export const getMyBalances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const balances = await LeaveService.getUserBalances(req.user!.id, req.user!.role);
    res.status(200).json({ success: true, data: balances });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching leave balances' });
  }
};

export const getPendingApprovals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If Admin, can view all pending; if specific approver, view assigned pending
    const filter: any = { status: 'Pending' };
    if (req.user!.role !== 'ADMIN') {
      filter.currentApprover = req.user!.id;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('applicant', 'name email phone role')
      .populate('leaveType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching pending approvals queue' });
  }
};

export const reviewLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, comments } = req.body;
    const leave = await LeaveService.reviewLeaveRequest(
      req.params.id,
      req.user!.id,
      req.user!.role,
      action,
      comments
    );

    res.status(200).json({
      success: true,
      message: `Leave request has been ${action.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error processing leave review' });
  }
};

export const cancelLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leave = await LeaveService.cancelLeaveRequest(
      req.params.id,
      req.user!.id,
      req.body.comment
    );

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error cancelling leave request' });
  }
};

export const getLeaveById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('applicant', 'name email role phone')
      .populate('leaveType')
      .populate('currentApprover', 'name email role')
      .populate('approvalHistory.approver', 'name email role')
      .populate('auditTrail.actor', 'name email role');

    if (!leave) {
      res.status(404).json({ success: false, message: 'Leave request not found' });
      return;
    }

    // Authorization: applicant, currentApprover, or Admin
    const isOwner = leave.applicant && (leave.applicant as any)._id.toString() === req.user!.id;
    const isApprover = leave.currentApprover && (leave.currentApprover as any)._id.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isApprover && !isAdmin) {
      res.status(403).json({ success: false, message: 'Access denied to this leave request' });
      return;
    }

    res.status(200).json({ success: true, data: leave });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching leave request details' });
  }
};

export const getAllLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, role, leaveTypeId } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (role) filter.applicantRole = role;
    if (leaveTypeId) filter.leaveType = leaveTypeId;

    const leaves = await LeaveRequest.find(filter)
      .populate('applicant', 'name email role')
      .populate('leaveType')
      .populate('currentApprover', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching leaves' });
  }
};

export const getLeaveTypes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const filter: any = { isActive: true };

    if (role) {
      filter.applicableRole = { $in: [role, 'ALL'] };
    }

    const types = await LeaveType.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching leave types' });
  }
};

export const createLeaveType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, applicableRole, defaultQuota, requiresAttachment, description } = req.body;

    const existing = await LeaveType.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: `Leave type with code '${code}' already exists` });
      return;
    }

    const lt = new LeaveType({
      name,
      code: code.toUpperCase(),
      applicableRole,
      defaultQuota: defaultQuota || 15,
      requiresAttachment: !!requiresAttachment,
      description,
    });
    await lt.save();

    res.status(201).json({ success: true, message: 'Leave type created successfully', data: lt });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating leave type' });
  }
};
