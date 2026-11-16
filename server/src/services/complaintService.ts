import mongoose from 'mongoose';
import { Complaint, IComplaintDocument, ComplaintCategory, ComplaintStatus, User } from '../models/index.js';
import { NotificationService } from './notificationService.js';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ComplaintService {
  /**
   * Generate next sequential ticket number like GRV-2026-0001
   */
  private static async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await Complaint.countDocuments();
    const seq = String(count + 1).padStart(4, '0');
    return `GRV-${year}-${seq}`;
  }

  /**
   * Submit a new grievance / complaint
   */
  static async submitComplaint(
    complainantId: string,
    data: {
      category: ComplaintCategory;
      title: string;
      description: string;
      isAnonymous?: boolean;
      attachmentUrl?: string;
      assignedDepartment?: string;
    }
  ): Promise<IComplaintDocument> {
    const isSensitive = data.category === 'Ragging / Harassment';
    const ticketNumber = await this.generateTicketNumber();

    // Find Designated Authority (Admin) if sensitive
    let assignedOwner: mongoose.Types.ObjectId | undefined;
    if (isSensitive) {
      const adminUser = await User.findOne({ role: 'Admin' });
      if (adminUser) assignedOwner = adminUser._id as mongoose.Types.ObjectId;
    }

    const complaint = await Complaint.create({
      ticketNumber,
      complainant: new mongoose.Types.ObjectId(complainantId),
      isAnonymous: !!data.isAnonymous,
      category: data.category,
      isSensitive,
      title: data.title,
      description: data.description,
      attachmentUrl: data.attachmentUrl || '',
      assignedDepartment: data.assignedDepartment ? new mongoose.Types.ObjectId(data.assignedDepartment) : undefined,
      assignedOwner,
      status: 'Submitted',
      priority: isSensitive ? 'Critical' : 'Medium',
      notes: [],
      auditTrail: [
        {
          actor: new mongoose.Types.ObjectId(complainantId),
          action: 'Complaint Submitted',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Submitted',
          comment: `Ticket ${ticketNumber} registered successfully`,
        },
      ],
    });

    // Send notification to designated authority or admin if sensitive
    if (isSensitive) {
      const admins = await User.find({ role: 'Admin' }).select('_id');
      for (const a of admins) {
        await NotificationService.notify(
          a._id as mongoose.Types.ObjectId,
          '⚠️ Sensitive Grievance Received',
          `Sensitive complaint ${ticketNumber} (${data.category}) requires immediate investigation.`,
          'Complaint',
          `/complaints/manage?ticket=${ticketNumber}`
        );
      }
    }

    return complaint;
  }

  /**
   * Get complaints submitted by the authenticated user
   */
  static async getMyComplaints(userId: string): Promise<any[]> {
    const complaints = await Complaint.find({ complainant: new mongoose.Types.ObjectId(userId) })
      .populate('assignedDepartment', 'name code')
      .populate('assignedOwner', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    // Strip internal notes for the student/submitter
    return complaints.map((c) => ({
      ...c,
      notes: (c.notes || []).filter((n) => !n.isInternal),
    }));
  }

  /**
   * Get complaints queue for handlers (Staff, HOD, Warden, Admin)
   */
  static async getComplaintsQueue(
    userId: string,
    userRole: string,
    filters: { status?: ComplaintStatus; category?: ComplaintCategory; sensitiveOnly?: boolean } = {}
  ): Promise<any[]> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;

    // Sensitive complaints (Ragging / Harassment) are ONLY visible to Admin
    const isAdmin = userRole.toUpperCase() === 'ADMIN';
    if (!isAdmin) {
      query.isSensitive = false;
    } else if (filters.sensitiveOnly) {
      query.isSensitive = true;
    }

    const complaints = await Complaint.find(query)
      .populate('complainant', 'name email role')
      .populate('assignedDepartment', 'name code')
      .populate('assignedOwner', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    // If complaint is anonymous, mask the complainant identity
    return complaints.map((c) => {
      if (c.isAnonymous) {
        return {
          ...c,
          complainant: {
            _id: c.complainant?._id,
            name: 'Anonymous Submitter',
            email: 'hidden@anonymous.spsu.ac.in',
            role: (c.complainant as any)?.role || 'Anonymous',
          },
        };
      }
      return c;
    });
  }

  /**
   * Get single complaint by ID or ticket number
   */
  static async getComplaintDetails(identifier: string, userId: string, userRole: string): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId ? { _id: identifier } : { ticketNumber: identifier };

    const complaint = await Complaint.findOne(query)
      .populate('complainant', 'name email role')
      .populate('assignedDepartment', 'name code')
      .populate('assignedOwner', 'name email role')
      .populate('notes.author', 'name role')
      .lean();

    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    // Role check for sensitive complaints
    const normalizedRole = userRole.toUpperCase();
    if (complaint.isSensitive && normalizedRole !== 'ADMIN' && String(complaint.complainant._id) !== userId) {
      throw new AppError('Access denied: sensitive grievance is restricted to Designated Authority', 403);
    }

    // Filter internal notes if user is complainant and not admin/staff
    const isOwnerOrStaff = ['ADMIN', 'HOD', 'FACULTY', 'WARDEN', 'MENTOR'].includes(normalizedRole);
    if (!isOwnerOrStaff) {
      complaint.notes = (complaint.notes || []).filter((n) => !n.isInternal);
    }

    // Mask identity if anonymous and requester is not complainant
    if (complaint.isAnonymous && String(complaint.complainant._id) !== userId) {
      complaint.complainant = {
        _id: complaint.complainant._id,
        name: 'Anonymous Submitter',
        email: 'hidden@anonymous.spsu.ac.in',
        role: (complaint.complainant as any).role || 'Anonymous',
      } as any;
    }

    return complaint;
  }

  /**
   * Update complaint status (with mandatory resolution note on Resolved/Closed)
   */
  static async updateStatus(
    complaintId: string,
    actorId: string,
    actorRole: string,
    actorName: string,
    newStatus: ComplaintStatus,
    resolutionNote?: string,
    comment?: string
  ): Promise<IComplaintDocument> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    if (complaint.isSensitive && actorRole.toUpperCase() !== 'ADMIN') {
      throw new AppError('Only the Designated Authority can update sensitive complaints', 403);
    }

    // CMP-008: Resolution requires mandatory resolution note
    if (['Resolved', 'Closed'].includes(newStatus) && (!resolutionNote || !resolutionNote.trim())) {
      throw new AppError('A detailed resolution note is required when resolving or closing a complaint', 400);
    }

    const previousStatus = complaint.status;
    complaint.status = newStatus;
    if (resolutionNote) {
      complaint.resolutionNote = resolutionNote.trim();
    }

    complaint.auditTrail.push({
      actor: new mongoose.Types.ObjectId(actorId),
      action: `Status changed to ${newStatus}`,
      timestamp: new Date(),
      previousState: previousStatus,
      newState: newStatus,
      comment: comment || resolutionNote || `Status updated by ${actorName}`,
    });

    await complaint.save();

    // Notify complainant about update
    await NotificationService.notify(
      complaint.complainant,
      `Grievance Update: ${complaint.ticketNumber}`,
      `Your grievance status has been updated to "${newStatus}".${resolutionNote ? ` Resolution note: "${resolutionNote}"` : ''}`,
      'Complaint',
      `/complaints?ticket=${complaint.ticketNumber}`
    );

    return complaint;
  }

  /**
   * Add a note / reply to the complaint
   */
  static async addNote(
    complaintId: string,
    authorId: string,
    authorName: string,
    text: string,
    isInternal: boolean = false
  ): Promise<IComplaintDocument> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    complaint.notes.push({
      author: new mongoose.Types.ObjectId(authorId),
      authorName,
      isInternal,
      text: text.trim(),
      createdAt: new Date(),
    });

    await complaint.save();

    // If external note added by staff, notify complainant
    if (!isInternal && String(complaint.complainant) !== authorId) {
      await NotificationService.notify(
        complaint.complainant,
        `New Message on Grievance: ${complaint.ticketNumber}`,
        `${authorName} posted a response on your ticket.`,
        'Complaint',
        `/complaints?ticket=${complaint.ticketNumber}`
      );
    }

    return complaint;
  }
}
