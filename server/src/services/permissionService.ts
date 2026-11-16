import { PermissionRequest, IPermissionRequestDocument } from '../models/PermissionRequest.js';
import { PermissionType } from '../models/PermissionType.js';
import { Student } from '../models/Student.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';

export class PermissionService {
  static async submitPermission(
    userId: string,
    data: {
      permissionTypeId: string;
      startDateTime: string;
      endDateTime: string;
      destination: string;
      reason: string;
      emergencyContact: string;
    }
  ): Promise<IPermissionRequestDocument> {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);

    if (start >= end) {
      throw new Error('Departure timing must be earlier than expected return timing');
    }

    const student = await Student.findOne({ user: userId })
      .populate({ path: 'hostel', populate: { path: 'warden', populate: { path: 'user' } } })
      .populate({ path: 'parent', populate: { path: 'user' } });

    if (!student) {
      throw new Error('Only enrolled students can request campus permissions and gate passes');
    }

    const permType = await PermissionType.findById(data.permissionTypeId);
    if (!permType || !permType.isActive) {
      throw new Error('Invalid or inactive permission category');
    }

    // Check overlap conflict with Approved Leaves (PER-005, BR-005)
    let hasLeaveConflict = false;
    let leaveConflictDetails = '';

    const approvedLeaveConflict = await LeaveRequest.findOne({
      applicant: userId,
      status: 'Approved',
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).populate('leaveType');

    if (approvedLeaveConflict) {
      hasLeaveConflict = true;
      leaveConflictDetails = `Conflict flagged: Student has an Approved ${(approvedLeaveConflict.leaveType as any)?.name || 'Leave'} spanning ${approvedLeaveConflict.startDate.toISOString().slice(0, 10)} to ${approvedLeaveConflict.endDate.toISOString().slice(0, 10)}`;
    }

    // Resolve assigned Warden and Parent signees
    const wardenUser =
      student.hostel && (student.hostel as any).warden && (student.hostel as any).warden.user
        ? (student.hostel as any).warden.user._id
        : null;

    const parentUser =
      student.parent && (student.parent as any).user ? (student.parent as any).user._id : null;

    const request = new PermissionRequest({
      applicant: userId,
      student: student._id,
      permissionType: data.permissionTypeId,
      startDateTime: start,
      endDateTime: end,
      destination: data.destination,
      reason: data.reason,
      emergencyContact: data.emergencyContact,
      hasLeaveConflict,
      leaveConflictDetails,
      status: 'Pending',
      wardenSignOff: {
        signee: wardenUser,
        status: permType.requiresWardenSignOff ? 'Pending' : 'Approved',
        comments: permType.requiresWardenSignOff ? '' : 'Warden sign-off not required for this permission type',
      },
      parentSignOff: {
        signee: parentUser,
        status: permType.requiresParentSignOff ? 'Pending' : 'Approved',
        comments: permType.requiresParentSignOff ? '' : 'Parent sign-off not required for this permission type',
      },
      auditTrail: [
        {
          actor: userId as any,
          action: 'PERMISSION_SUBMITTED',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Pending',
          comment: `Student requested ${permType.name} to ${data.destination}. ${hasLeaveConflict ? '[LEAVE CONFLICT FLAGGED]' : ''}`,
        },
      ],
    });

    await request.save();
    return request;
  }

  static async reviewPermissionByWarden(
    permissionId: string,
    wardenUserId: string,
    wardenRole: string,
    action: 'Approved' | 'Rejected',
    comments: string
  ): Promise<IPermissionRequestDocument> {
    const perm = await PermissionRequest.findById(permissionId).populate('permissionType');
    if (!perm) throw new Error('Permission request not found');

    // Authorize: designated warden or Admin
    const isWarden = perm.wardenSignOff?.signee && perm.wardenSignOff.signee.toString() === wardenUserId;
    const isAdmin = wardenRole === 'ADMIN';

    if (!isWarden && !isAdmin && wardenRole !== 'WARDEN') {
      throw new Error('Not authorized to act as hostel warden for this permission request');
    }

    const prevStatus = perm.status;
    perm.wardenSignOff.status = action;
    perm.wardenSignOff.actionDate = new Date();
    perm.wardenSignOff.comments = comments;

    // Evaluate overall status
    if (action === 'Rejected') {
      perm.status = 'Rejected';
    } else {
      const type = perm.permissionType as any;
      if (type.requiresParentSignOff && perm.parentSignOff.status !== 'Approved') {
        perm.status = 'Pending'; // Awaiting parent
      } else {
        perm.status = 'Approved';
      }
    }

    perm.auditTrail.push({
      actor: wardenUserId as any,
      action: `WARDEN_${action.toUpperCase()}`,
      timestamp: new Date(),
      previousState: prevStatus,
      newState: perm.status,
      comment: `Warden ${action}: ${comments}`,
    });

    await perm.save();
    return perm;
  }

  static async signOffPermissionByParent(
    permissionId: string,
    parentUserId: string,
    action: 'Approved' | 'Rejected',
    comments: string
  ): Promise<IPermissionRequestDocument> {
    const perm = await PermissionRequest.findById(permissionId).populate('permissionType');
    if (!perm) throw new Error('Permission request not found');

    const prevStatus = perm.status;
    perm.parentSignOff.status = action;
    perm.parentSignOff.actionDate = new Date();
    perm.parentSignOff.comments = comments;

    if (action === 'Rejected') {
      perm.status = 'Rejected';
    } else {
      const type = perm.permissionType as any;
      if (type.requiresWardenSignOff && perm.wardenSignOff.status !== 'Approved') {
        perm.status = 'Pending'; // Awaiting warden
      } else {
        perm.status = 'Approved';
      }
    }

    perm.auditTrail.push({
      actor: parentUserId as any,
      action: `PARENT_${action.toUpperCase()}`,
      timestamp: new Date(),
      previousState: prevStatus,
      newState: perm.status,
      comment: `Parent ${action}: ${comments}`,
    });

    await perm.save();
    return perm;
  }

  static async cancelPermission(permissionId: string, userId: string): Promise<IPermissionRequestDocument> {
    const perm = await PermissionRequest.findById(permissionId);
    if (!perm) throw new Error('Permission request not found');

    if (perm.applicant.toString() !== userId) {
      throw new Error('You can only cancel your own permission requests');
    }

    if (perm.status !== 'Pending') {
      throw new Error(`Cannot cancel permission request in '${perm.status}' status`);
    }

    const prevStatus = perm.status;
    perm.status = 'Cancelled';

    perm.auditTrail.push({
      actor: userId as any,
      action: 'PERMISSION_CANCELLED',
      timestamp: new Date(),
      previousState: prevStatus,
      newState: 'Cancelled',
      comment: 'Applicant cancelled permission request',
    });

    await perm.save();
    return perm;
  }
}
