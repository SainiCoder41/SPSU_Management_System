export interface IStudentRiskProfile {
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  semester: number;
  mentorName?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
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

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'KB' | 'STUDENT_CONTEXT' | 'GENERAL';
  timestamp: Date;
}
