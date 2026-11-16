import { LeaveRequest, ILeaveRequestDocument, LeaveStatus } from '../models/LeaveRequest.js';
import { LeaveType, ILeaveTypeDocument } from '../models/LeaveType.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { User } from '../models/User.js';
import { cache } from '../config/redis.js';

export class LeaveService {
  /**
   * Determine the next approver from the SIS hierarchy (SH-007, LEV-003)
   */
  static async resolveApproverForUser(userId: string, userRole: string): Promise<string> {
    const adminUser = await User.findOne({ role: 'ADMIN', isActive: true });
    const fallbackAdminId = adminUser ? adminUser._id.toString() : userId;

    if (userRole === 'STUDENT') {
      const student = await Student.findOne({ user: userId })
        .populate({ path: 'mentor', populate: { path: 'user' } })
        .populate({ path: 'hostel', populate: { path: 'warden', populate: { path: 'user' } } })
        .populate({ path: 'department', populate: { path: 'hod', populate: { path: 'user' } } });

      if (student) {
        // Priority 1: Assigned Faculty Mentor
        if (student.mentor && (student.mentor as any).user) {
          return (student.mentor as any).user._id.toString();
        }
        // Priority 2: Hostel Warden
        if (student.hostel && (student.hostel as any).warden && (student.hostel as any).warden.user) {
          return (student.hostel as any).warden.user._id.toString();
        }
        // Priority 3: Department HOD
        if (student.department && (student.department as any).hod && (student.department as any).hod.user) {
          return (student.department as any).hod.user._id.toString();
        }
      }
    } else if (['FACULTY', 'MENTOR', 'WARDEN'].includes(userRole)) {
      const staff = await Staff.findOne({ user: userId }).populate({
        path: 'department',
        populate: { path: 'hod', populate: { path: 'user' } },
      });

      if (staff && staff.department) {
        const hod = (staff.department as any).hod;
        if (hod && hod.user && hod.user._id.toString() !== userId) {
          return hod.user._id.toString();
        }
      }
    }

    return fallbackAdminId;
  }

  /**
   * Submit a new leave request (LEV-001, LEV-002, LEV-003)
   */
  static async submitLeaveRequest(
    userId: string,
    userRole: string,
    data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
      emergencyContact?: string;
      attachmentUrl?: string;
    }
  ): Promise<ILeaveRequestDocument> {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Date order validation
    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }

    // Number of days calculation
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check overlapping requests (LEV-002)
    const overlap = await LeaveRequest.findOne({
      applicant: userId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlap) {
      throw new Error(
        `Overlapping leave request found from ${overlap.startDate.toISOString().slice(0, 10)} to ${overlap.endDate.toISOString().slice(0, 10)} with status '${overlap.status}'`
      );
    }

    // Verify leave type
    const leaveType = await LeaveType.findById(data.leaveTypeId);
    if (!leaveType || !leaveType.isActive) {
      throw new Error('Selected leave type is invalid or inactive');
    }

    if (leaveType.requiresAttachment && !data.attachmentUrl) {
      throw new Error(`Supporting attachment is required for ${leaveType.name}`);
    }

    // Resolve approver from SIS hierarchy
    const approverId = await this.resolveApproverForUser(userId, userRole);

    const leave = new LeaveRequest({
      applicant: userId,
      applicantRole: userRole,
      leaveType: data.leaveTypeId,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason: data.reason,
      emergencyContact: data.emergencyContact || '',
      attachmentUrl: data.attachmentUrl || '',
      status: 'Pending',
      currentApprover: approverId,
      approvalHistory: [
        {
          approver: userId,
          role: userRole,
          action: 'Submitted',
          actionDate: new Date(),
          comments: 'Leave request submitted by applicant',
        },
      ],
      auditTrail: [
        {
          actor: userId,
          action: 'LEAVE_SUBMITTED',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Pending',
          comment: `Applicant requested ${numberOfDays} day(s) of ${leaveType.name}`,
        },
      ],
    });

    await leave.save();

    // Update pending days in balance
    const currentYear = new Date().getFullYear();
    await LeaveBalance.findOneAndUpdate(
      { user: userId, leaveType: data.leaveTypeId, academicYear: currentYear },
      {
        $inc: { pendingDays: numberOfDays },
        $setOnInsert: { totalQuota: leaveType.defaultQuota, usedDays: 0, remainingDays: leaveType.defaultQuota },
      },
      { upsert: true }
    );

    await cache.del(`leave:user:${userId}`);
    await cache.del(`leave:approver:${approverId}`);

    return leave;
  }

  /**
   * Approver decision: Approved, Rejected, or Returned (LEV-004, LEV-005)
   */
  static async reviewLeaveRequest(
    leaveId: string,
    approverId: string,
    approverRole: string,
    action: 'Approved' | 'Rejected' | 'Returned',
    comments: string
  ): Promise<ILeaveRequestDocument> {
    const leave = await LeaveRequest.findById(leaveId).populate('leaveType');
    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'Pending') {
      throw new Error(`Cannot review request in '${leave.status}' state`);
    }

    // Authorization check: Must be designated approver or Admin
    const isDesignatedApprover = leave.currentApprover && leave.currentApprover.toString() === approverId;
    const isAdmin = approverRole === 'ADMIN';

    if (!isDesignatedApprover && !isAdmin) {
      throw new Error('You are not authorized to act on this pending leave request');
    }

    const previousState = leave.status;
    leave.status = action;

    // Append to approval history
    leave.approvalHistory.push({
      approver: approverId as any,
      role: approverRole as any,
      action,
      actionDate: new Date(),
      comments,
    });

    // Append to audit trail (SH-006)
    leave.auditTrail.push({
      actor: approverId as any,
      action: `LEAVE_${action.toUpperCase()}`,
      timestamp: new Date(),
      previousState,
      newState: action,
      comment: comments,
    });

    await leave.save();

    // Update LeaveBalance (LEV-008)
    const currentYear = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({
      user: leave.applicant,
      leaveType: leave.leaveType,
      academicYear: currentYear,
    });

    if (balance) {
      balance.pendingDays = Math.max(0, balance.pendingDays - leave.numberOfDays);
      if (action === 'Approved') {
        balance.usedDays += leave.numberOfDays;
        balance.remainingDays = Math.max(0, balance.totalQuota - balance.usedDays);
      }
      await balance.save();
    }

    await cache.del(`leave:user:${leave.applicant}`);
    if (leave.currentApprover) {
      await cache.del(`leave:approver:${leave.currentApprover}`);
    }

    return leave;
  }

  /**
   * Cancel a leave request (Applicant self-service)
   */
  static async cancelLeaveRequest(leaveId: string, userId: string, comment?: string): Promise<ILeaveRequestDocument> {
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.applicant.toString() !== userId) {
      throw new Error('You can only cancel your own leave requests');
    }

    if (!['Pending', 'Returned'].includes(leave.status)) {
      throw new Error(`Cannot cancel a request that is already ${leave.status}`);
    }

    const previousState = leave.status;
    leave.status = 'Cancelled';

    leave.auditTrail.push({
      actor: userId as any,
      action: 'LEAVE_CANCELLED',
      timestamp: new Date(),
      previousState,
      newState: 'Cancelled',
      comment: comment || 'Applicant cancelled request',
    });

    await leave.save();

    // Restore pending balance
    const currentYear = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({
      user: userId,
      leaveType: leave.leaveType,
      academicYear: currentYear,
    });
    if (balance) {
      balance.pendingDays = Math.max(0, balance.pendingDays - leave.numberOfDays);
      await balance.save();
    }

    await cache.del(`leave:user:${userId}`);

    return leave;
  }

  /**
   * Get user leave balances (or initialize defaults if none exist)
   */
  static async getUserBalances(userId: string, userRole: string): Promise<any[]> {
    const currentYear = new Date().getFullYear();
    const roleFilter = userRole === 'STUDENT' ? { applicableRole: { $in: ['STUDENT', 'ALL'] } } : { applicableRole: { $in: ['STAFF', 'ALL'] } };
    const leaveTypes = await LeaveType.find({ ...roleFilter, isActive: true });

    const balances = await Promise.all(
      leaveTypes.map(async (lt) => {
        let b = await LeaveBalance.findOne({
          user: userId,
          leaveType: lt._id,
          academicYear: currentYear,
        });

        if (!b) {
          b = await LeaveBalance.create({
            user: userId,
            leaveType: lt._id,
            academicYear: currentYear,
            totalQuota: lt.defaultQuota,
            usedDays: 0,
            pendingDays: 0,
            remainingDays: lt.defaultQuota,
          });
        }

        return {
          leaveType: lt,
          academicYear: currentYear,
          totalQuota: b.totalQuota,
          usedDays: b.usedDays,
          pendingDays: b.pendingDays,
          remainingDays: b.remainingDays,
        };
      })
    );

    return balances;
  }
}
