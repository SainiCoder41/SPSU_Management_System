import mongoose from 'mongoose';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';

export interface IComplaintNLPResult {
  suggestedCategory: 'Academic' | 'Hostel' | 'Mess' | 'Infrastructure' | 'Ragging' | 'Discipline' | 'General';
  suggestedPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  isRaggingSuspected: boolean;
  raggingKeywordsFound: string[];
  suggestedAssigneeRole: 'WARDEN' | 'HOD' | 'ADMIN' | 'MENTOR';
  confidence: number;
}

export interface ILeaveAnomalyReport {
  studentId: string;
  totalLeavesPast30Days: number;
  hasLongWeekendPattern: boolean;
  hasPreExamClustering: boolean;
  hasHighFrequency: boolean;
  anomaliesDetected: string[];
  recommendation: 'APPROVE_STANDARD' | 'SCRUTINIZE' | 'WARDEN_CONSULTATION_REQUIRED';
}

export class AIWorkflowService {
  /**
   * Anti-ragging keywords as per UGC / Supreme Court guidelines (AIW-002)
   */
  private static RAGGING_KEYWORDS = [
    'ragging',
    'ragged',
    'hazing',
    'forced to',
    'harass',
    'harassment',
    'abused',
    'threatened',
    'bullying',
    'seniors forced',
    'physical abuse',
    'humiliation',
    'strip',
    'beat up',
    'extortion',
  ];

  /**
   * 1. Smart Complaint Classifier & Anti-Ragging Detector (AIW-001, AIW-002, AIW-003)
   */
  static classifyComplaint(title: string, description: string): IComplaintNLPResult {
    const text = `${title} ${description}`.toLowerCase();

    // Check for anti-ragging triggers first
    const matchedRagging = this.RAGGING_KEYWORDS.filter((kw) => text.includes(kw));
    if (matchedRagging.length > 0) {
      return {
        suggestedCategory: 'Ragging',
        suggestedPriority: 'Critical',
        isRaggingSuspected: true,
        raggingKeywordsFound: matchedRagging,
        suggestedAssigneeRole: 'ADMIN',
        confidence: 0.98,
      };
    }

    // Hostel & Mess Keywords
    if (
      text.includes('mess') ||
      text.includes('food') ||
      text.includes('meal') ||
      text.includes('canteen') ||
      text.includes('breakfast') ||
      text.includes('dinner')
    ) {
      const priority = text.includes('food poisoning') || text.includes('insects') ? 'Critical' : 'Medium';
      return {
        suggestedCategory: 'Mess',
        suggestedPriority: priority,
        isRaggingSuspected: false,
        raggingKeywordsFound: [],
        suggestedAssigneeRole: 'WARDEN',
        confidence: 0.92,
      };
    }

    if (
      text.includes('room') ||
      text.includes('washroom') ||
      text.includes('water') ||
      text.includes('electricity') ||
      text.includes('geyser') ||
      text.includes('hostel') ||
      text.includes('bed') ||
      text.includes('cleaning')
    ) {
      const priority = text.includes('no water') || text.includes('electric shock') ? 'High' : 'Medium';
      return {
        suggestedCategory: 'Hostel',
        suggestedPriority: priority,
        isRaggingSuspected: false,
        raggingKeywordsFound: [],
        suggestedAssigneeRole: 'WARDEN',
        confidence: 0.89,
      };
    }

    // Academic Keywords
    if (
      text.includes('faculty') ||
      text.includes('lecture') ||
      text.includes('exam') ||
      text.includes('marks') ||
      text.includes('attendance') ||
      text.includes('syllabus') ||
      text.includes('lab') ||
      text.includes('professor')
    ) {
      return {
        suggestedCategory: 'Academic',
        suggestedPriority: text.includes('exam') ? 'High' : 'Medium',
        isRaggingSuspected: false,
        raggingKeywordsFound: [],
        suggestedAssigneeRole: 'HOD',
        confidence: 0.88,
      };
    }

    // Infrastructure Keywords
    if (
      text.includes('wifi') ||
      text.includes('internet') ||
      text.includes('projector') ||
      text.includes('lift') ||
      text.includes('library') ||
      text.includes('sports')
    ) {
      return {
        suggestedCategory: 'Infrastructure',
        suggestedPriority: 'Low',
        isRaggingSuspected: false,
        raggingKeywordsFound: [],
        suggestedAssigneeRole: 'ADMIN',
        confidence: 0.85,
      };
    }

    // Default General
    return {
      suggestedCategory: 'General',
      suggestedPriority: 'Medium',
      isRaggingSuspected: false,
      raggingKeywordsFound: [],
      suggestedAssigneeRole: 'ADMIN',
      confidence: 0.75,
    };
  }

  /**
   * 2. Leave Pattern Anomaly Detector (AIW-004)
   */
  static async analyzeLeavePatterns(studentOrUserId: string): Promise<ILeaveAnomalyReport> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const student = await Student.findOne(
      mongoose.isValidObjectId(studentOrUserId)
        ? { $or: [{ _id: studentOrUserId }, { user: studentOrUserId }] }
        : { enrollmentNumber: studentOrUserId }
    ).lean();

    const targetUserId = student ? student.user : (mongoose.isValidObjectId(studentOrUserId) ? studentOrUserId : null);

    const leaves = targetUserId
      ? await LeaveRequest.find({
          applicant: targetUserId,
          createdAt: { $gte: thirtyDaysAgo },
        }).lean()
      : [];

    const anomalies: string[] = [];
    let weekendCount = 0;

    leaves.forEach((l) => {
      const startDay = new Date(l.startDate).getDay(); // 5 = Friday
      const endDay = new Date(l.endDate).getDay(); // 1 = Monday
      if (startDay === 5 || endDay === 1) {
        weekendCount++;
      }
    });

    const hasLongWeekendPattern = weekendCount >= 2;
    if (hasLongWeekendPattern) {
      anomalies.push(`Habitual long-weekend pattern (${weekendCount} instances departing Friday / returning Monday)`);
    }

    const hasHighFrequency = leaves.length >= 3;
    if (hasHighFrequency) {
      anomalies.push(`Elevated absence frequency (${leaves.length} leave applications within the last 30 days)`);
    }

    // Exam proximity check (e.g. mid-term / end-term months October, November, April, May)
    const currentMonth = new Date().getMonth();
    const isExamSeason = [3, 4, 9, 10].includes(currentMonth);
    const hasPreExamClustering = isExamSeason && leaves.length >= 2;
    if (hasPreExamClustering) {
      anomalies.push('Pre-examination absence clustering during critical review period');
    }

    let recommendation: 'APPROVE_STANDARD' | 'SCRUTINIZE' | 'WARDEN_CONSULTATION_REQUIRED' = 'APPROVE_STANDARD';
    if (hasHighFrequency && hasLongWeekendPattern) {
      recommendation = 'WARDEN_CONSULTATION_REQUIRED';
    } else if (hasHighFrequency || hasLongWeekendPattern || hasPreExamClustering) {
      recommendation = 'SCRUTINIZE';
    }

    return {
      studentId: String(studentOrUserId),
      totalLeavesPast30Days: leaves.length,
      hasLongWeekendPattern,
      hasPreExamClustering,
      hasHighFrequency,
      anomaliesDetected: anomalies,
      recommendation,
    };
  }

  /**
   * 3. Natural Language Directory Search (AIW-005)
   */
  static async naturalLanguageDirectorySearch(query: string): Promise<any[]> {
    const q = query.trim().toLowerCase();
    const filter: any = {};

    // Check for semester: e.g. "4th semester", "semester 4", "sem 4"
    const semMatch = q.match(/(\d+)(?:st|nd|rd|th)?\s*(?:sem|semester)/) || q.match(/(?:sem|semester)\s*(\d+)/);
    if (semMatch) {
      filter.semester = parseInt(semMatch[1], 10);
    }

    // Check for Department: CSE, ECE, ME, Civil, Mining, Management
    let deptId: any = null;
    if (q.includes('cse') || q.includes('computer')) {
      const d = await Department.findOne({ code: 'CSE' });
      if (d) deptId = d._id;
    } else if (q.includes('ece') || q.includes('electronics')) {
      const d = await Department.findOne({ code: 'ECE' });
      if (d) deptId = d._id;
    } else if (q.includes('me') || q.includes('mechanical')) {
      const d = await Department.findOne({ code: 'ME' });
      if (d) deptId = d._id;
    }

    if (deptId) filter.department = deptId;

    // Check for CGPA criteria: e.g. "cgpa > 8", "cgpa above 8", "cgpa < 6", "cgpa below 6"
    const cgpaGt = q.match(/cgpa\s*(?:>|above|greater than)\s*([0-9.]+)/);
    const cgpaLt = q.match(/cgpa\s*(?:<|below|less than)\s*([0-9.]+)/);
    if (cgpaGt) {
      filter.cgpa = { $gte: parseFloat(cgpaGt[1]) };
    } else if (cgpaLt) {
      filter.cgpa = { $lte: parseFloat(cgpaLt[1]) };
    }

    // Check for Hostel: e.g. "bh-2", "gh-1", "hostel"
    if (q.includes('bh-2') || q.includes('bh2')) {
      const h = await Hostel.findOne({ name: /BH-2/i });
      if (h) filter.hostel = h._id;
    } else if (q.includes('gh-1') || q.includes('gh1')) {
      const h = await Hostel.findOne({ name: /GH-1/i });
      if (h) filter.hostel = h._id;
    }

    // If query asks about faculty or staff
    if (q.includes('faculty') || q.includes('professor') || q.includes('teacher')) {
      const staffFilter: any = {};
      if (deptId) staffFilter.department = deptId;
      return await Staff.find(staffFilter)
        .populate('user', 'name email phone avatar')
        .populate('department', 'name code')
        .lean();
    }

    // Default to Students search with constructed filter
    return await Student.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('hostel', 'name')
      .lean();
  }

  /**
   * 4. Campus Notice Drafting & Bilingual Hindi Translation (AIW-006)
   */
  static draftAndTranslateNotice(input: {
    title: string;
    bulletPoints: string[];
    category: string;
    targetAudience: string;
  }): {
    englishNotice: { title: string; body: string; signoff: string };
    hindiNotice: { title: string; body: string; signoff: string };
  } {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const bodyEng =
      `This is an official university circular for all ${input.targetAudience.toLowerCase()}.\n\n` +
      `Key Directives & Instructions:\n` +
      input.bulletPoints.map((pt) => `• ${pt.trim()}`).join('\n') +
      `\n\nAll concerned students and staff members are advised to take careful note of the above guidelines and ensure strict compliance.`;

    const signoffEng = `By Order of Vice-Chancellor / Registrar\nSir Padampat Singhania University, Udaipur\nDate: ${today}`;

    // University Bilingual Standard Hindi Translation (Rajasthan State Higher Education Format)
    const hindiTitle = `विश्वविद्यालय सूचना: ${input.title}`;
    const hindiBulletsMap: Record<string, string> = {
      curfew: 'छात्रावास में रात्रि प्रवेश का समय कड़ाई से लागू रहेगा।',
      attendance: 'परीक्षा में बैठने हेतु न्यूनतम 75% उपस्थिति अनिवार्य है।',
      fees: 'सत्र शुल्क जमा करने की अंतिम तिथि का ध्यान रखें।',
      exam: 'परीक्षा संबंधी दिशा-निर्देशों का अक्षरशः पालन करें।',
      holiday: 'विश्वविद्यालय अवकाश के दौरान शैक्षणिक कार्य स्थगित रहेगा।',
    };

    const translatedBullets = input.bulletPoints.map((pt) => {
      const l = pt.toLowerCase();
      for (const [k, v] of Object.entries(hindiBulletsMap)) {
        if (l.includes(k)) return `• ${v} (${pt})`;
      }
      return `• ${pt}`;
    });

    const bodyHindi =
      `यह आधिकारिक विश्वविद्यालय परिपत्र सभी ${input.targetAudience} हेतु जारी किया जाता है।\n\n` +
      `मुख्य दिशा-निर्देश एवं निर्देश:\n` +
      translatedBullets.join('\n') +
      `\n\nसभी संबंधित विद्यार्थियों एवं कर्मचारियों को निर्देशित किया जाता है कि वे उपर्युक्त दिशा-निर्देशों का गंभीरता से अवलोकन करें एवं समयानुसार अनुपालन सुनिश्चित करें।`;

    const signoffHindi = `आदेशानुसार: कुलपति / कुलसचिव\nसर पदमपत सिंघानिया विश्वविद्यालय, उदयपुर\nदिनांक: ${today}`;

    return {
      englishNotice: {
        title: input.title,
        body: bodyEng,
        signoff: signoffEng,
      },
      hindiNotice: {
        title: hindiTitle,
        body: bodyHindi,
        signoff: signoffHindi,
      },
    };
  }
}
