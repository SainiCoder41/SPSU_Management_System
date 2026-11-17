import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { AttendanceService } from './attendanceService.js';
import { AcademicService } from './academicService.js';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIChatService {
  /**
   * Campus Knowledge Base for SPSU (AI-005)
   */
  private static CAMPUS_KB: Record<string, string> = {
    curfew: 'Hostel Curfew & Gate Timings:\n- All residential students must check into their respective hostel blocks by 9:30 PM on weekdays and 10:00 PM on Saturdays/Sundays.\n- Outstation night permissions require prior warden approval and parent confirmation on the portal.',
    mess: 'Hostel Mess Schedule:\n- Breakfast: 07:30 AM – 09:15 AM\n- Lunch: 12:30 PM – 02:15 PM\n- High Tea & Snacks: 05:00 PM – 06:00 PM\n- Dinner: 07:45 PM – 09:30 PM\nSpecial dietary needs can be requested via the Hostel Warden desk.',
    leave: 'Leave Application Policy:\n- Apply via "Leave Applications" on the student portal at least 24 hours prior to travel.\n- Approval Flow: Mentor Endorsement ➔ Hostel Warden Approval ➔ HOD Authorization.\n- Gate passes are auto-generated upon final Warden clearance with verifiable QR code.',
    library: 'SPSU Central Library Hours:\n- Monday to Friday: 08:30 AM – 10:00 PM\n- Saturdays & Sundays: 09:00 AM – 06:00 PM\n- During Mid-Term and End-Term examinations: Extended study hours up to 12:00 Midnight.',
    emergency: 'Emergency Contacts (24x7):\n- Campus Medical Center / Ambulance: +91 94140 12345 / Ext: 108\n- Security Control Room (Main Gate): +91 94140 12346 / Ext: 100\n- Anti-Ragging Helpline (Toll-Free): 1800-180-5522 / registrar@spsu.ac.in\n- Women Grievance Cell (ICC): icc@spsu.ac.in',
    antiragging: 'Zero Tolerance Anti-Ragging Policy:\nSPSU maintains a strict zero-tolerance policy against any form of hazing or ragging in campus and hostels. Immediate suspensions and legal reporting follow under Supreme Court guidelines. File an urgent complaint directly in the Grievance Portal or notify the Proctorial Board.',
    wifi: 'Campus Wi-Fi & IT Services:\n- SSID: SPSU_Students_5G (Authentication via your university ERP login).\n- Bandwidth quota: High-speed academic access in classrooms, labs, and hostels.\n- IT Helpdesk: it.support@spsu.ac.in located in Admin Block Ground Floor.',
  };

  /**
   * Safe Contextual Q&A Processing (AI-004, AI-006)
   */
  static async processQuery(
    userId: string,
    userRole: string,
    query: string
  ): Promise<{ response: string; contextualData?: any; source: 'KB' | 'STUDENT_CONTEXT' | 'GENERAL' }> {
    const q = query.trim().toLowerCase();

    // Guardrail: Disallow attempting to extract cross-user data or prompt override (AI-006)
    if (
      q.includes('other students') ||
      q.includes('all passwords') ||
      q.includes('admin secrets') ||
      q.includes('salary of') ||
      q.includes('database credentials')
    ) {
      return {
        response:
          'Security & Privacy Notice: As per university privacy guardrails (AI-006), requests for other users\' personal information, system credentials, or cross-student records are strictly restricted.',
        source: 'GENERAL',
      };
    }

    // 1. Personal student queries (attendance, CGPA, leaves, mentor)
    if (userRole === 'STUDENT' || userRole === 'PARENT') {
      const student = await Student.findOne(
        userRole === 'STUDENT' ? { user: userId } : { parent: userId }
      )
        .populate('user', 'name email')
        .populate('department', 'name code')
        .populate('hostel', 'name')
        .populate({ path: 'mentor', populate: { path: 'user', select: 'name email phone' } })
        .lean();

      if (student) {
        // Attendance query
        if (q.includes('attendance') || q.includes('absent') || q.includes('bunk') || q.includes('percentage')) {
          const summary = await AttendanceService.getStudentAttendanceSummary(student._id.toString());
          return {
            response: `Hello ${((student.user as any)?.name) || 'Student'}, your current cumulative attendance is ${summary.cumulativePercentage}%. You have attended ${summary.totalAttended} out of ${summary.totalConducted} scheduled sessions. ${
              summary.cumulativePercentage < 75
                ? '⚠️ Notice: Your attendance is below the mandatory 75% requirement. Please consult your faculty mentor.'
                : '✅ Great job! Your attendance is above the university threshold.'
            }`,
            contextualData: summary,
            source: 'STUDENT_CONTEXT',
          };
        }

        // Results / CGPA query
        if (q.includes('cgpa') || q.includes('sgpa') || q.includes('marks') || q.includes('grade') || q.includes('result')) {
          const results = await AcademicService.getStudentResults(student._id.toString());
          return {
            response: `Your current academic standing: CGPA is ${student.cgpa || results.currentCGPA || 'N/A'}. You have completed ${results.totalSemestersCompleted} semester(s). Full official marksheets and grade breakdown are available on your "Academics & ID Card" portal.`,
            contextualData: results,
            source: 'STUDENT_CONTEXT',
          };
        }

        // Mentor query
        if (q.includes('mentor') || q.includes('advisor') || q.includes('faculty guide')) {
          const mentor = student.mentor as any;
          const mentorUser = mentor?.user;
          return {
            response: mentorUser
              ? `Your assigned faculty mentor is ${mentorUser.name}. Contact email: ${mentorUser.email}, Phone: ${mentorUser.phone || 'Available via university intercom'}. Mentoring hours are Monday to Friday 03:30 PM - 05:00 PM.`
              : 'Your faculty mentor assignment is currently pending department allocation. Please contact your HOD office.',
            contextualData: mentorUser,
            source: 'STUDENT_CONTEXT',
          };
        }

        // Leave query
        if (q.includes('leave') || q.includes('outpass') || q.includes('gate pass') || q.includes('outing')) {
          const recentLeaves = await LeaveRequest.find({ student: student._id }).sort({ createdAt: -1 }).limit(3).lean();
          if (recentLeaves.length === 0) {
            return {
              response: 'You have no recent leave applications on record. You can apply for Day Outing, Night Out, or Home Leave directly in the "Leave Applications" tab.',
              source: 'STUDENT_CONTEXT',
            };
          }
          const latest = recentLeaves[0];
          return {
            response: `Your latest leave request (#${latest._id.toString().slice(-6)}) is currently: "${latest.status}". Dates: ${new Date(latest.startDate).toLocaleDateString()} to ${new Date(latest.endDate).toLocaleDateString()}. Reason: ${latest.reason}.`,
            contextualData: latest,
            source: 'STUDENT_CONTEXT',
          };
        }
      }
    }

    // 2. Campus Knowledge Base Matching
    if (q.includes('curfew') || q.includes('timing') || q.includes('gate close') || q.includes('entry time')) {
      return { response: this.CAMPUS_KB.curfew, source: 'KB' };
    }
    if (q.includes('mess') || q.includes('breakfast') || q.includes('lunch') || q.includes('dinner') || q.includes('food')) {
      return { response: this.CAMPUS_KB.mess, source: 'KB' };
    }
    if (q.includes('how to apply leave') || q.includes('leave rule') || q.includes('leave policy')) {
      return { response: this.CAMPUS_KB.leave, source: 'KB' };
    }
    if (q.includes('library') || q.includes('books') || q.includes('reading room')) {
      return { response: this.CAMPUS_KB.library, source: 'KB' };
    }
    if (q.includes('emergency') || q.includes('ambulance') || q.includes('hospital') || q.includes('security')) {
      return { response: this.CAMPUS_KB.emergency, source: 'KB' };
    }
    if (q.includes('ragging') || q.includes('hazing') || q.includes('harassment') || q.includes('bullying')) {
      return { response: this.CAMPUS_KB.antiragging, source: 'KB' };
    }
    if (q.includes('wifi') || q.includes('internet') || q.includes('network') || q.includes('it support')) {
      return { response: this.CAMPUS_KB.wifi, source: 'KB' };
    }

    // Default Fallback
    return {
      response:
        'I am SPSU Campus Assistant, here to help with campus navigation, mess and hostel schedules, attendance rules, leave procedures, library timings, and emergency contacts. You can ask me questions like: "What is the hostel curfew?", "How do I apply for leave?", "What are mess timings?", or "What is my current attendance?".',
      source: 'GENERAL',
    };
  }
}
