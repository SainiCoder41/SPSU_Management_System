import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { PermissionService } from '../services/permissionService.js';
import { PermissionRequest } from '../models/PermissionRequest.js';
import { PermissionType } from '../models/PermissionType.js';
import { Parent } from '../models/Parent.js';
import { Hostel } from '../models/Hostel.js';
import { Staff } from '../models/Staff.js';

export const getPermissionTypes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const types = await PermissionType.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: types.length, data: types });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching permission types' });
  }
};

export const createPermissionType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const permType = new PermissionType(req.body);
    await permType.save();
    res.status(201).json({ success: true, message: 'Permission category configured', data: permType });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error creating permission type' });
  }
};

export const submitPermission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const permission = await PermissionService.submitPermission(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Permission / Gate pass request submitted successfully',
      data: permission,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error submitting permission request' });
  }
};

export const getMyPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await PermissionRequest.find({ applicant: req.user!.id })
      .populate('permissionType')
      .populate('wardenSignOff.signee', 'name email')
      .populate('parentSignOff.signee', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching permissions' });
  }
};

export const getWardenPermissionQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If Admin, all pending; if Warden, pending for their hostel
    const filter: any = { 'wardenSignOff.status': 'Pending', status: { $ne: 'Cancelled' } };

    if (req.user!.role !== 'ADMIN') {
      filter['wardenSignOff.signee'] = req.user!.id;
    }

    const list = await PermissionRequest.find(filter)
      .populate('applicant', 'name email phone')
      .populate('student')
      .populate('permissionType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching warden permission queue' });
  }
};

export const getParentPermissionQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { 'parentSignOff.signee': req.user!.id, status: { $ne: 'Cancelled' } };

    const list = await PermissionRequest.find(filter)
      .populate('applicant', 'name email phone')
      .populate('student')
      .populate('permissionType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching parent permissions queue' });
  }
};

export const reviewWardenPermission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, comments } = req.body;
    const updated = await PermissionService.reviewPermissionByWarden(
      req.params.id,
      req.user!.id,
      req.user!.role,
      action,
      comments
    );

    res.status(200).json({
      success: true,
      message: `Hostel warden decision recorded: ${action}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error reviewing permission' });
  }
};

export const signOffParentPermission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, comments } = req.body;
    const updated = await PermissionService.signOffPermissionByParent(
      req.params.id,
      req.user!.id,
      action,
      comments
    );

    res.status(200).json({
      success: true,
      message: `Parent sign-off recorded: ${action}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error recording parent sign-off' });
  }
};

export const cancelPermission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cancelled = await PermissionService.cancelPermission(req.params.id, req.user!.id);
    res.status(200).json({ success: true, message: 'Permission request cancelled', data: cancelled });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error cancelling request' });
  }
};

export const getPermissionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const perm = await PermissionRequest.findById(req.params.id)
      .populate('applicant', 'name email phone')
      .populate({ path: 'student', populate: [{ path: 'department' }, { path: 'hostel' }] })
      .populate('permissionType')
      .populate('wardenSignOff.signee', 'name email')
      .populate('parentSignOff.signee', 'name email')
      .populate('auditTrail.actor', 'name email role');

    if (!perm) {
      res.status(404).json({ success: false, message: 'Permission request not found' });
      return;
    }

    res.status(200).json({ success: true, data: perm });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching permission details' });
  }
};
