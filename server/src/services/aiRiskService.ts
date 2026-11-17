import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Marksheet } from '../models/Marksheet.js';
import { Complaint } from '../models/Complaint.js';

export interface IStudentRiskProfile {
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  semester: number;
  mentorName?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0 - 100
  factors: string[];
  metrics: {
    attendancePercentage: number;
    cgpa: number;
    backlogs: number;
    rejectedLeaves: number;
    openComplaints: number;
  };
  recommendedActions: string[];
  isAdvisory: true;
  disclaimer: string;
}

export class AIRiskService {
  private static DISCLAIMER =
    'Advisory Notice (AI-007): This assessment is generated algorithmically for academic counseling and pastoral care only. It must never be used for automated disciplinary or punitive actions.';

  /**
   * Compute comprehensive risk score for a single student
   */
  static async evaluateStudentRisk(studentId: string): Promise<IStudentRiskProfile> {
    const student = await Student.findById(studentId)
      .populate('user', 'name email phone')
      .populate('department', 'name code')
      .populate({ path: 'mentor', populate: { path: 'user', select: 'name' } })
      .lean();

    if (!student) throw new Error('Student not found for risk evaluation');

    // 1. Attendance factor
    const attendanceRecords = await Attendance.find({
      'records.student': student._id,
    }).lean();

    let totalClasses = 0;
    let attendedClasses = 0;

    attendanceRecords.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === student._id.toString());
      if (rec) {
        totalClasses++;
        if (rec.status === 'Present' || rec.status === 'Late') attendedClasses++;
        if (rec.status === 'OnLeave') attendedClasses++; // Excused under ATT-007
      }
    });

    const attendancePct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 85;

    // 2. Academic & CGPA factor
    const marksheets = await Marksheet.find({ student: student._id }).sort({ semester: 1 }).lean();
    const cgpa = student.cgpa || (marksheets.length > 0 ? marksheets[marksheets.length - 1].cgpa : 7.0);
    const totalBacklogs = marksheets.reduce((sum, m) => sum + (m.backlogs || 0), 0);

    // 3. Leave behavior
    const leaves = await LeaveRequest.find({ student: student._id }).lean();
    const rejectedLeaves = leaves.filter((l) => l.status === 'Rejected').length;

    // 4. Complaints against / raised by student
    const complaints = await Complaint.find({
      submittedBy: (student.user as any)?._id,
      status: { $in: ['Open', 'In Review'] },
    }).lean();

    // Risk Score Calculation (0 to 100)
    let score = 0;
    const factors: string[] = [];
    const recommendedActions: string[] = [];

    // Attendance scoring (weight 40%)
    if (attendancePct < 65) {
      score += 40;
      factors.push(`Critical low attendance: ${attendancePct}% (well below mandatory 75% threshold)`);
      recommendedActions.push('Schedule mandatory attendance counseling session with student and parent');
    } else if (attendancePct < 75) {
      score += 25;
      factors.push(`Attendance warning: ${attendancePct}% (below 75% eligibility cutoff)`);
      recommendedActions.push('Send formal attendance advisory notification');
    } else if (attendancePct < 80) {
      score += 10;
      factors.push(`Borderline attendance: ${attendancePct}%`);
    }

    // CGPA & Backlogs scoring (weight 35%)
    if (cgpa < 5.0) {
      score += 30;
      factors.push(`Academic distress: CGPA ${cgpa.toFixed(2)} is below minimum degree progression requirement`);
      recommendedActions.push('Assign peer tutor and schedule remedial subject sessions');
    } else if (cgpa < 6.0) {
      score += 18;
      factors.push(`Sub-optimal academic standing: CGPA ${cgpa.toFixed(2)} requires targeted mentoring`);
      recommendedActions.push('Review study timetable and course internal evaluations');
    }

    if (totalBacklogs > 0) {
      score += Math.min(15, totalBacklogs * 5);
      factors.push(`Active course backlogs: ${totalBacklogs} un-cleared paper(s)`);
      recommendedActions.push('Coordinate remedial enrollment plan for upcoming semester supplementary exams');
    }

    // Leave irregularities (weight 15%)
    if (rejectedLeaves >= 2) {
      score += 15;
      factors.push(`Repeated unapproved absence requests: ${rejectedLeaves} rejected leave applications`);
      recommendedActions.push('Consult hostel warden regarding residential discipline and leave patterns');
    }

    // Complaints factor (weight 10%)
    if (complaints.length >= 2) {
      score += 10;
      factors.push(`Multiple active unresolved grievances (${complaints.length})`);
      recommendedActions.push('Expedite student welfare grievance resolution');
    }

    score = Math.min(100, Math.max(0, score));

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (score >= 50) {
      riskLevel = 'HIGH';
    } else if (score >= 25) {
      riskLevel = 'MEDIUM';
    }

    if (factors.length === 0) {
      factors.push('Consistently strong attendance and steady academic progress');
      recommendedActions.push('Acknowledge good standing and encourage co-curricular participation');
    }

    return {
      studentId: student._id.toString(),
      studentName: (student.user as any)?.name || 'Student',
      rollNumber: student.rollNumber,
      department: (student.department as any)?.name || 'Engineering',
      semester: student.semester,
      mentorName: ((student.mentor as any)?.user as any)?.name || 'Assigned Faculty Mentor',
      riskLevel,
      riskScore: score,
      factors,
      metrics: {
        attendancePercentage: attendancePct,
        cgpa,
        backlogs: totalBacklogs,
        rejectedLeaves,
        openComplaints: complaints.length,
      },
      recommendedActions,
      isAdvisory: true,
      disclaimer: this.DISCLAIMER,
    };
  }

  /**
   * Get ranked "Needs Attention" list for a mentor's assigned mentees
   */
  static async getMentorMenteesRiskList(mentorStaffId: string): Promise<IStudentRiskProfile[]> {
    const mentees = await Student.find({ mentor: new mongoose.Types.ObjectId(mentorStaffId) }).lean();
    const profiles = await Promise.all(mentees.map((m) => this.evaluateStudentRisk(m._id.toString())));
    // Rank descending by risk score
    return profiles.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get ranked "Needs Attention" list for a department (HOD view)
   */
  static async getDepartmentRiskList(departmentId: string): Promise<IStudentRiskProfile[]> {
    const students = await Student.find({ department: new mongoose.Types.ObjectId(departmentId) }).lean();
    const profiles = await Promise.all(students.map((s) => this.evaluateStudentRisk(s._id.toString())));
    return profiles.sort((a, b) => b.riskScore - a.riskScore);
  }
}
