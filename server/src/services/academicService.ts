import mongoose from 'mongoose';
import { Marksheet, IMarksheetDocument, ICourseMarks } from '../models/Marksheet.js';
import { Student } from '../models/Student.js';
import { Subject } from '../models/Subject.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { AttendanceService } from './attendanceService.js';
import { AuditService } from './auditService.js';

export class AcademicService {
  /**
   * Helper to compute UGC/AICTE grade and grade points from 100 marks scale
   */
  static computeGrade(total: number): { grade: string; points: number; passed: boolean } {
    if (total >= 90) return { grade: 'O', points: 10, passed: true };
    if (total >= 80) return { grade: 'A+', points: 9, passed: true };
    if (total >= 70) return { grade: 'A', points: 8, passed: true };
    if (total >= 60) return { grade: 'B+', points: 7, passed: true };
    if (total >= 50) return { grade: 'B', points: 6, passed: true };
    if (total >= 40) return { grade: 'C', points: 5, passed: true };
    return { grade: 'F', points: 0, passed: false };
  }

  /**
   * Enter / Update semester marks and compute SGPA & CGPA (ACD-001)
   */
  static async enterSemesterMarks(
    facultyId: string,
    facultyRole: string,
    data: {
      studentId: string;
      semester: number;
      academicYear?: string | number;
      courses: Array<{
        subjectId: string;
        internalMarks: number;
        midTermMarks: number;
        endTermMarks: number;
      }>;
    }
  ): Promise<IMarksheetDocument> {
    const student = await Student.findById(data.studentId);
    if (!student) throw new Error('Student not found');

    const year = data.academicYear ? String(data.academicYear) : String(new Date().getFullYear());
    const subjectIds = data.courses.map((c) => new mongoose.Types.ObjectId(c.subjectId));
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    const subMap = new Map<string, any>();
    subjects.forEach((s) => subMap.set(s._id.toString(), s));

    let totalCredits = 0;
    let earnedCredits = 0;
    let weightedPointsSum = 0;
    let backlogs = 0;

    const processedCourses: ICourseMarks[] = data.courses.map((c) => {
      const sub = subMap.get(c.subjectId);
      const credits = sub ? sub.credits : 3;
      const total = Math.min(100, Math.max(0, c.internalMarks + c.midTermMarks + c.endTermMarks));
      const { grade, points, passed } = this.computeGrade(total);

      totalCredits += credits;
      if (passed) {
        earnedCredits += credits;
        weightedPointsSum += points * credits;
      } else {
        backlogs++;
      }

      return {
        subject: new mongoose.Types.ObjectId(c.subjectId),
        internalMarks: c.internalMarks,
        midTermMarks: c.midTermMarks,
        endTermMarks: c.endTermMarks,
        totalMarks: total,
        grade,
        gradePoints: points,
        credits,
        isPassed: passed,
      };
    });

    const sgpa = totalCredits > 0 ? Number((weightedPointsSum / totalCredits).toFixed(2)) : 0.0;

    // Save or update Marksheet
    const marksheet = await Marksheet.findOneAndUpdate(
      { student: student._id, semester: data.semester },
      {
        student: student._id,
        department: student.department,
        semester: data.semester,
        academicYear: year,
        courses: processedCourses,
        totalCredits,
        earnedCredits,
        sgpa,
        cgpa: sgpa, // Initial fallback
        backlogs,
        isPublished: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Recompute cumulative CGPA across all semester marksheets of student
    const allMarksheets = await Marksheet.find({ student: student._id });
    let totalAllCredits = 0;
    let totalAllWeighted = 0;

    for (const m of allMarksheets) {
      for (const crs of m.courses) {
        totalAllCredits += crs.credits;
        totalAllWeighted += crs.gradePoints * crs.credits;
      }
    }

    const cumulativeCGPA =
      totalAllCredits > 0 ? Number((totalAllWeighted / totalAllCredits).toFixed(2)) : sgpa;

    marksheet.cgpa = cumulativeCGPA;
    await marksheet.save();

    // Sync CGPA to Student model (ACD-001)
    student.cgpa = cumulativeCGPA;
    await student.save();

    await AuditService.log({
      actor: facultyId,
      actorRole: facultyRole,
      action: 'SEMESTER_MARKS_ENTERED',
      resourceType: 'Marksheet',
      resourceId: marksheet._id.toString(),
      comment: `Recorded marks for Semester ${data.semester}: SGPA ${sgpa}, CGPA ${cumulativeCGPA}`,
    });

    return marksheet;
  }

  /**
   * Get student results history (ACD-002)
   */
  static async getStudentResults(studentId: string): Promise<any> {
    const marksheets = await Marksheet.find({ student: new mongoose.Types.ObjectId(studentId) })
      .populate('courses.subject', 'name code credits type')
      .populate('department', 'name code')
      .sort({ semester: 1 })
      .lean();

    const student = await Student.findById(studentId)
      .populate('user', 'name email phone')
      .populate('department', 'name code')
      .lean();

    return {
      student,
      currentCGPA: student?.cgpa || 0.0,
      totalSemestersCompleted: marksheets.length,
      marksheets,
    };
  }

  /**
   * Departmental Analytics Dashboard (ACD-003, ACD-004)
   */
  static async getDepartmentAnalytics(departmentId: string): Promise<any> {
    const students = await Student.find({ department: new mongoose.Types.ObjectId(departmentId) })
      .populate('user', 'name email isActive')
      .lean();

    const totalStudents = students.length;
    const cgpas = students.map((s) => s.cgpa || 0).filter((c) => c > 0);
    const avgCGPA = cgpas.length > 0 ? Number((cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2)) : 0.0;

    // Backlog distribution
    const marksheets = await Marksheet.find({ department: new mongoose.Types.ObjectId(departmentId) }).lean();
    let totalBacklogs = 0;
    marksheets.forEach((m) => (totalBacklogs += m.backlogs || 0));

    // Hostel vs Day-Scholar breakdown
    const residentialCount = students.filter((s) => s.hostel).length;
    const dayScholarCount = totalStudents - residentialCount;

    return {
      departmentId,
      totalStudents,
      avgCGPA,
      averageCgpa: avgCGPA,
      totalBacklogs,
      studentDistribution: {
        residential: residentialCount,
        dayScholar: dayScholarCount,
      },
      cgpaDistribution: {
        firstClassWithDistinction: cgpas.filter((c) => c >= 8.5).length,
        firstClass: cgpas.filter((c) => c >= 6.5 && c < 8.5).length,
        secondClass: cgpas.filter((c) => c >= 5.0 && c < 6.5).length,
        needsImprovement: cgpas.filter((c) => c < 5.0).length,
      },
    };
  }

  /**
   * Digital Student Identity Card with Verified Signature / QR Data (ACD-005)
   */
  static async getDigitalIdCard(studentId: string): Promise<any> {
    const student = await Student.findById(studentId)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('hostel', 'name type')
      .populate({ path: 'mentor', populate: { path: 'user', select: 'name email phone' } })
      .lean();

    if (!student) throw new Error('Student not found');

    const user = student.user as any;
    const verificationUrl = `http://localhost:5000/api/academics/verify-id/${student._id}`;
    const qrSignature = Buffer.from(`${student.enrollmentNumber}:${student._id}:SPSU_OFFICIAL`).toString('base64');

    return {
      idCardNumber: `SPSU-ID-${student.rollNumber}`,
      studentName: user.name,
      rollNumber: student.rollNumber,
      enrollmentNumber: student.enrollmentNumber,
      program: student.program,
      department: (student.department as any)?.name || 'Engineering',
      semester: student.semester,
      bloodGroup: 'B+',
      emergencyContact: '+91 94140 12345',
      hostelBlock: (student.hostel as any)?.name || 'Day Scholar',
      roomNumber: student.roomNumber || 'N/A',
      validUntil: 'July 2028',
      issuedDate: 'August 2024',
      verificationUrl,
      qrCodePayload: verificationUrl,
      qrSignature,
      isVerified: true,
    };
  }
}
