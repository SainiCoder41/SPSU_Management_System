import mongoose from 'mongoose';
import {
  LibraryBook,
  ILibraryBookDocument,
  BookIssue,
  IBookIssueDocument,
  PlacementDrive,
  IPlacementDriveDocument,
  PlacementApplication,
  VisitorLog,
  IVisitorLogDocument,
  Student,
} from '../models/index.js';

export class CampusServices {
  // ==========================================
  // 1. Library Management Services (SRV-001)
  // ==========================================

  static async getLibraryBooks(query?: string): Promise<ILibraryBookDocument[]> {
    const filter: any = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { isbn: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ];
    }
    return await LibraryBook.find(filter).sort({ title: 1 });
  }

  static async addLibraryBook(data: Partial<ILibraryBookDocument>): Promise<ILibraryBookDocument> {
    return await LibraryBook.create(data);
  }

  static async issueBook(
    bookId: string,
    studentId: string,
    issuedById: string
  ): Promise<IBookIssueDocument> {
    const book = await LibraryBook.findById(bookId);
    if (!book) throw new Error('Book not found');
    if (book.availableCopies <= 0) throw new Error('No copies available for borrowing');

    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found');

    // Decrement available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    const issue = await BookIssue.create({
      book: book._id,
      student: student._id,
      issuedBy: new mongoose.Types.ObjectId(issuedById),
      status: 'Issued',
    });

    return issue;
  }

  static async returnBook(issueId: string): Promise<IBookIssueDocument> {
    const issue = await BookIssue.findById(issueId);
    if (!issue) throw new Error('Book issue record not found');
    if (issue.status === 'Returned') throw new Error('Book already returned');

    const book = await LibraryBook.findById(issue.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    const returnDate = new Date();
    issue.returnDate = returnDate;
    issue.status = 'Returned';

    // Fine calculation (₹5/day beyond due date)
    if (returnDate > issue.dueDate) {
      const diffTime = Math.abs(returnDate.getTime() - issue.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      issue.fineAmount = diffDays * 5;
    } else {
      issue.fineAmount = 0;
    }

    await issue.save();
    return issue;
  }

  static async getStudentBorrowedBooks(studentId: string): Promise<IBookIssueDocument[]> {
    return await BookIssue.find({ student: new mongoose.Types.ObjectId(studentId) })
      .populate('book')
      .sort({ createdAt: -1 });
  }

  // ==========================================
  // 2. Training & Placement Cell (SRV-002)
  // ==========================================

  static async getPlacementDrives(): Promise<IPlacementDriveDocument[]> {
    return await PlacementDrive.find()
      .populate('eligibleDepartments', 'name code')
      .sort({ driveDate: 1 });
  }

  static async createPlacementDrive(data: any): Promise<IPlacementDriveDocument> {
    return await PlacementDrive.create(data);
  }

  static async applyForPlacementDrive(
    driveId: string,
    studentId: string,
    resumeUrl?: string
  ): Promise<any> {
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) throw new Error('Placement drive not found');

    const student = await Student.findById(studentId).populate('department');
    if (!student) throw new Error('Student profile not found');

    // 1. CGPA eligibility verification
    const studentCgpa = student.cgpa || 0;
    if (studentCgpa < drive.eligibilityCgpa) {
      throw new Error(
        `CGPA cutoff not met: drive requires minimum ${drive.eligibilityCgpa}, student has ${studentCgpa.toFixed(2)}`
      );
    }

    // 2. Department eligibility verification (if restricted)
    if (drive.eligibleDepartments && drive.eligibleDepartments.length > 0) {
      const studentDeptId = (student.department as any)?._id?.toString() || student.department?.toString();
      const isEligibleDept = drive.eligibleDepartments.some((d) => d.toString() === studentDeptId);
      if (!isEligibleDept) {
        throw new Error('Your department is not eligible for this campus drive');
      }
    }

    // Check duplicate
    const existing = await PlacementApplication.findOne({ drive: drive._id, student: student._id });
    if (existing) throw new Error('Already applied to this placement drive');

    const application = await PlacementApplication.create({
      drive: drive._id,
      student: student._id,
      resumeUrl: resumeUrl || '',
      status: 'Applied',
    });

    return application;
  }

  static async getDriveApplications(driveId: string): Promise<any[]> {
    return await PlacementApplication.find({ drive: new mongoose.Types.ObjectId(driveId) })
      .populate({ path: 'student', populate: { path: 'user department' } })
      .sort({ appliedDate: -1 });
  }

  static async updateApplicationStatus(
    appId: string,
    status: 'Shortlisted' | 'Selected' | 'Rejected',
    feedback?: string
  ): Promise<any> {
    return await PlacementApplication.findByIdAndUpdate(
      appId,
      { status, feedback: feedback || '' },
      { new: true }
    );
  }

  // ==========================================
  // 3. Hostel Visitor & Gate Log (SRV-003)
  // ==========================================

  static async recordVisitorCheckIn(recordedById: string, data: any): Promise<IVisitorLogDocument> {
    return await VisitorLog.create({
      ...data,
      recordedBy: new mongoose.Types.ObjectId(recordedById),
      checkIn: new Date(),
      status: 'Inside',
    });
  }

  static async recordVisitorCheckOut(logId: string): Promise<IVisitorLogDocument> {
    const log = await VisitorLog.findById(logId);
    if (!log) throw new Error('Visitor entry record not found');
    log.checkOut = new Date();
    log.status = 'CheckedOut';
    await log.save();
    return log;
  }

  static async getVisitorLogs(status?: 'Inside' | 'CheckedOut'): Promise<IVisitorLogDocument[]> {
    const filter: any = {};
    if (status) filter.status = status;
    return await VisitorLog.find(filter)
      .populate({ path: 'studentVisited', populate: { path: 'user' } })
      .populate('hostelBlock', 'name type')
      .sort({ checkIn: -1 });
  }

  // ==========================================
  // 4. Multi-Channel Notification Dispatcher (SRV-005)
  // ==========================================

  static async dispatchExternalNotification(params: {
    recipientPhone?: string;
    recipientEmail?: string;
    channel: 'SMS' | 'EMAIL' | 'BOTH';
    subject: string;
    message: string;
  }): Promise<{ dispatched: boolean; channel: string; timestamp: Date; logId: string }> {
    // Adapter logging simulation for high-reliability campus dispatch
    const logId = `DISPATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      dispatched: true,
      channel: params.channel,
      timestamp: new Date(),
      logId,
    };
  }
}
