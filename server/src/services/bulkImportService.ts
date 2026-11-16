import * as XLSX from 'xlsx';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { Staff } from '../models/Staff.js';
import bcrypt from 'bcryptjs';

export interface ImportResult {
  totalRows: number;
  importedCount: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

export const parseAndImportStudents = async (fileBuffer: Buffer): Promise<ImportResult> => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const result: ImportResult = {
    totalRows: rows.length,
    importedCount: 0,
    errors: [],
  };

  if (!rows || rows.length === 0) {
    return result;
  }

  // Pre-load departments, hostels, and staff for quick lookup
  const departments = await Department.find();
  const hostels = await Hostel.find();
  const staffMembers = await Staff.find().populate('user', 'email name');

  const deptMap = new Map<string, any>();
  departments.forEach((d) => {
    deptMap.set(d.code.toUpperCase(), d._id);
    deptMap.set(d.name.toLowerCase(), d._id);
  });

  const hostelMap = new Map<string, any>();
  hostels.forEach((h) => {
    hostelMap.set(h.name.toUpperCase(), h._id);
  });

  const staffEmailMap = new Map<string, any>();
  staffMembers.forEach((s) => {
    const userObj = s.user as any;
    if (userObj && userObj.email) {
      staffEmailMap.set(userObj.email.toLowerCase(), s._id);
    }
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2; // considering header is row 1

    try {
      const name = String(row['Name'] || row['name'] || '').trim();
      const email = String(row['Email'] || row['email'] || '').trim().toLowerCase();
      const rollNumber = String(row['RollNumber'] || row['Roll Number'] || row['rollNumber'] || '').trim();
      const enrollmentNumber = String(
        row['EnrollmentNumber'] || row['Enrollment Number'] || row['enrollmentNumber'] || ''
      ).trim();
      const departmentCode = String(row['Department'] || row['department'] || 'CSE').trim().toUpperCase();
      const semester = parseInt(row['Semester'] || row['semester'] || '1', 10);
      const section = String(row['Section'] || row['section'] || 'A').trim();
      const cgpa = parseFloat(row['CGPA'] || row['cgpa'] || '0.0');
      const admissionYear = parseInt(row['AdmissionYear'] || row['admissionYear'] || `${new Date().getFullYear()}`, 10);
      const hostelName = String(row['Hostel'] || row['hostel'] || '').trim().toUpperCase();
      const roomNumber = String(row['RoomNumber'] || row['Room Number'] || row['roomNumber'] || '').trim();
      const mentorEmail = String(row['MentorEmail'] || row['mentorEmail'] || '').trim().toLowerCase();
      const phone = String(row['Phone'] || row['phone'] || '').trim();

      if (!name || !email || !rollNumber || !enrollmentNumber) {
        result.errors.push({
          row: rowIndex,
          error: 'Missing required fields: Name, Email, RollNumber, or EnrollmentNumber',
          data: row,
        });
        continue;
      }

      // Check if user or student already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        result.errors.push({
          row: rowIndex,
          error: `User with email '${email}' already exists`,
          data: row,
        });
        continue;
      }

      const existingStudent = await Student.findOne({
        $or: [{ rollNumber }, { enrollmentNumber }],
      });
      if (existingStudent) {
        result.errors.push({
          row: rowIndex,
          error: `Student with roll number '${rollNumber}' or enrollment '${enrollmentNumber}' already exists`,
          data: row,
        });
        continue;
      }

      const deptId = deptMap.get(departmentCode) || departments[0]?._id;
      const hostelId = hostelName ? hostelMap.get(hostelName) || null : null;
      const mentorId = mentorEmail ? staffEmailMap.get(mentorEmail) || null : null;

      // Create User
      const defaultPassword = 'Student@1234';
      const user = new User({
        name,
        email,
        password: defaultPassword,
        role: 'STUDENT',
        phone,
      });
      await user.save();

      // Create Student
      const student = new Student({
        user: user._id,
        enrollmentNumber,
        rollNumber,
        program: row['Program'] || 'B.Tech',
        department: deptId,
        semester: isNaN(semester) ? 1 : semester,
        section,
        cgpa: isNaN(cgpa) ? 0.0 : cgpa,
        admissionYear: isNaN(admissionYear) ? new Date().getFullYear() : admissionYear,
        hostel: hostelId,
        roomNumber,
        mentor: mentorId,
      });
      await student.save();

      if (hostelId) {
        await Hostel.findByIdAndUpdate(hostelId, { $inc: { occupancy: 1 } });
      }

      result.importedCount++;
    } catch (err: any) {
      result.errors.push({
        row: rowIndex,
        error: err.message || 'Error processing row',
        data: row,
      });
    }
  }

  return result;
};

export const exportStudentsToExcel = async (filter: any = {}): Promise<Buffer> => {
  const students = await Student.find(filter)
    .populate('user', 'name email phone')
    .populate('department', 'name code')
    .populate('hostel', 'name type')
    .populate({
      path: 'mentor',
      populate: { path: 'user', select: 'name email' },
    });

  const rows = students.map((s: any) => ({
    'Enrollment Number': s.enrollmentNumber,
    'Roll Number': s.rollNumber,
    'Full Name': s.user?.name || '',
    'Email Address': s.user?.email || '',
    'Phone': s.user?.phone || '',
    'Program': s.program,
    'Department': s.department?.code || '',
    'Department Name': s.department?.name || '',
    'Semester': s.semester,
    'Section': s.section,
    'CGPA': s.cgpa,
    'Admission Year': s.admissionYear,
    'Hostel': s.hostel?.name || 'Day Scholar',
    'Room Number': s.roomNumber || '',
    'Mentor Name': s.mentor?.user?.name || 'Unassigned',
    'Mentor Email': s.mentor?.user?.email || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
