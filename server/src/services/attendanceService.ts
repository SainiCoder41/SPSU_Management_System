import mongoose from 'mongoose';
import { Attendance, IAttendanceDocument, AttendanceStatus } from '../models/Attendance.js';
import { Timetable, ITimetableDocument } from '../models/Timetable.js';
import { Subject } from '../models/Subject.js';
import { Student } from '../models/Student.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { AuditService } from './auditService.js';

export class AttendanceService {
  /**
   * Mark or update daily attendance for a subject and section (ATT-001, ATT-007)
   */
  static async markAttendance(
    facultyId: string,
    facultyRole: string,
    data: {
      subjectId: string;
      departmentId: string;
      semester: number;
      section: string;
      date: string;
      startTime: string;
      endTime: string;
      records: Array<{ studentId: string; status: AttendanceStatus; remarks?: string }>;
    }
  ): Promise<IAttendanceDocument> {
    const attendanceDate = new Date(data.date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Preload students to get linked user accounts for leave check (ATT-007)
    const studentIds = data.records.map((r) => new mongoose.Types.ObjectId(r.studentId));
    const students = await Student.find({ _id: { $in: studentIds } }).select('_id user');
    const studentUserMap = new Map<string, mongoose.Types.ObjectId>();
    students.forEach((s) => studentUserMap.set(s._id.toString(), s.user as mongoose.Types.ObjectId));

    // Check approved leaves for the day (ATT-007)
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const approvedLeaves = await LeaveRequest.find({
      applicant: { $in: Array.from(studentUserMap.values()) },
      status: 'Approved',
      startDate: { $lt: nextDay },
      endDate: { $gte: attendanceDate },
    }).select('applicant');

    const approvedLeaveUserIds = new Set(approvedLeaves.map((l) => l.applicant.toString()));

    let present = 0;
    let absent = 0;
    let onLeave = 0;

    const processedRecords = data.records.map((rec) => {
      let finalStatus = rec.status;
      const studentUserId = studentUserMap.get(rec.studentId)?.toString();

      // If student is on approved leave from v2.0, exclude from absence counts (ATT-007)
      if (studentUserId && approvedLeaveUserIds.has(studentUserId) && finalStatus !== 'Present') {
        finalStatus = 'OnLeave';
      }

      if (finalStatus === 'Present' || finalStatus === 'Late') present++;
      else if (finalStatus === 'OnLeave') onLeave++;
      else absent++;

      return {
        student: new mongoose.Types.ObjectId(rec.studentId),
        status: finalStatus,
        remarks: rec.remarks || (finalStatus === 'OnLeave' ? 'Excused: Approved Leave (v2.0)' : ''),
      };
    });

    const filter = {
      subject: new mongoose.Types.ObjectId(data.subjectId),
      section: data.section,
      date: attendanceDate,
      'timeSlot.startTime': data.startTime,
    };

    const update = {
      subject: new mongoose.Types.ObjectId(data.subjectId),
      department: new mongoose.Types.ObjectId(data.departmentId),
      semester: data.semester,
      section: data.section,
      faculty: new mongoose.Types.ObjectId(facultyId),
      date: attendanceDate,
      timeSlot: { startTime: data.startTime, endTime: data.endTime },
      records: processedRecords,
      totalStudents: processedRecords.length,
      presentCount: present,
      absentCount: absent,
      onLeaveCount: onLeave,
    };

    const attendance = await Attendance.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    await AuditService.log({
      actor: facultyId,
      actorRole: facultyRole,
      action: 'ATTENDANCE_MARKED',
      resourceType: 'Attendance',
      resourceId: attendance._id.toString(),
      comment: `Marked attendance for ${data.section} (${present} present, ${absent} absent, ${onLeave} on leave)`,
    });

    return attendance;
  }

  /**
   * Get student's subject-wise and overall attendance percentage (ATT-002)
   */
  static async getStudentAttendanceSummary(studentId: string): Promise<any> {
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    const attendances = await Attendance.find({ 'records.student': studentObjId })
      .populate('subject', 'name code credits type')
      .lean();

    const subjectMap = new Map<string, { subject: any; totalClasses: number; attended: number; onLeave: number }>();

    let totalClassesAll = 0;
    let attendedAll = 0;

    for (const att of attendances) {
      const rec = att.records.find((r) => r.student.toString() === studentId);
      if (!rec) continue;

      const subId = (att.subject as any)._id.toString();
      if (!subjectMap.has(subId)) {
        subjectMap.set(subId, {
          subject: att.subject,
          totalClasses: 0,
          attended: 0,
          onLeave: 0,
        });
      }

      const stat = subjectMap.get(subId)!;
      stat.totalClasses++;
      totalClassesAll++;

      if (rec.status === 'Present' || rec.status === 'Late') {
        stat.attended++;
        attendedAll++;
      } else if (rec.status === 'OnLeave') {
        stat.onLeave++;
        stat.attended++; // Excused from penalty
        attendedAll++;
      }
    }

    const subjectBreakdown = Array.from(subjectMap.values()).map((s) => ({
      subject: s.subject,
      totalClasses: s.totalClasses,
      attendedClasses: s.attended,
      excusedLeaves: s.onLeave,
      percentage: s.totalClasses > 0 ? Math.round((s.attended / s.totalClasses) * 100) : 100,
    }));

    const cumulativePercentage =
      totalClassesAll > 0 ? Math.round((attendedAll / totalClassesAll) * 100) : 100;

    return {
      studentId,
      totalClasses: totalClassesAll,
      attendedClasses: attendedAll,
      cumulativePercentage,
      isLowAttendance: cumulativePercentage < 75,
      subjectBreakdown,
    };
  }

  /**
   * Get low attendance list (< threshold %, default 75%) for HODs and Mentors (ATT-003)
   */
  static async getLowAttendanceStudents(filters: { departmentId?: string; threshold?: number }): Promise<any[]> {
    const threshold = filters.threshold || 75;
    const query: any = {};
    if (filters.departmentId) query.department = filters.departmentId;

    const students = await Student.find(query)
      .populate('user', 'name email phone')
      .populate('department', 'name code')
      .populate({ path: 'mentor', populate: { path: 'user', select: 'name email' } })
      .lean();

    const results = [];
    for (const s of students) {
      const summary = await this.getStudentAttendanceSummary(s._id.toString());
      if (summary.totalClasses > 0 && summary.cumulativePercentage < threshold) {
        results.push({
          student: s,
          summary,
        });
      }
    }

    return results;
  }

  /**
   * Save timetable with clash detection validation (ATT-005)
   */
  static async saveTimetable(data: {
    departmentId: string;
    semester: number;
    section: string;
    academicYear?: number;
    slots: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      subjectId: string;
      facultyId: string;
      room: string;
    }>;
  }): Promise<ITimetableDocument> {
    const year = data.academicYear || new Date().getFullYear();

    // Clash detection: check other timetables in the same academic year
    const existingTimetables = await Timetable.find({
      academicYear: year,
      _id: { $ne: new mongoose.Types.ObjectId() },
    }).lean();

    for (const slot of data.slots) {
      for (const tt of existingTimetables) {
        // Skip current timetable's own section
        if (
          tt.department.toString() === data.departmentId &&
          tt.semester === data.semester &&
          tt.section === data.section
        ) {
          continue;
        }

        for (const existingSlot of tt.slots) {
          if (existingSlot.dayOfWeek === slot.dayOfWeek) {
            // Check time overlap
            const overlaps = slot.startTime < existingSlot.endTime && slot.endTime > existingSlot.startTime;
            if (overlaps) {
              if (existingSlot.faculty.toString() === slot.facultyId) {
                throw new Error(
                  `Faculty clash on ${slot.dayOfWeek} at ${slot.startTime}-${slot.endTime}: Faculty is already assigned to section ${tt.section}`
                );
              }
              if (existingSlot.room.toUpperCase() === slot.room.toUpperCase()) {
                throw new Error(
                  `Room clash on ${slot.dayOfWeek} at ${slot.startTime}-${slot.endTime}: Room ${slot.room} is already booked for section ${tt.section}`
                );
              }
            }
          }
        }
      }
    }

    const timetable = await Timetable.findOneAndUpdate(
      {
        department: new mongoose.Types.ObjectId(data.departmentId),
        semester: data.semester,
        section: data.section,
        academicYear: year,
      },
      {
        department: new mongoose.Types.ObjectId(data.departmentId),
        semester: data.semester,
        section: data.section,
        academicYear: year,
        slots: data.slots.map((s) => ({
          dayOfWeek: s.dayOfWeek as any,
          startTime: s.startTime,
          endTime: s.endTime,
          subject: new mongoose.Types.ObjectId(s.subjectId),
          faculty: new mongoose.Types.ObjectId(s.facultyId),
          room: s.room,
        })),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return timetable;
  }
}
