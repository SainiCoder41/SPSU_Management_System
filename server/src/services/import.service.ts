import xlsx from 'xlsx';
import { StudentService } from './student.service';
import { Hostel } from '../models/Hostel';

export interface ImportErrorItem {
  row: number;
  field: string;
  message: string;
}

export class ImportService {
  static async processStudentImport(fileBuffer: Buffer) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    let successful = 0;
    let failed = 0;
    const errors: ImportErrorItem[] = [];

    const hostels = await Hostel.find();
    const hostelCodeMap = new Map<string, any>();
    hostels.forEach((h) => hostelCodeMap.set(h.code.toUpperCase(), h._id));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const firstName = String(row.firstName || row['First Name'] || '').trim();
        const lastName = String(row.lastName || row['Last Name'] || '').trim();
        const email = String(row.email || row['Email'] || '').trim().toLowerCase();
        const phone = String(row.phone || row['Phone'] || '').trim();
        const enrollmentNumber = String(row.enrollmentNumber || row['Enrollment Number'] || '').trim();
        const registrationNumber = String(row.registrationNumber || row['Registration Number'] || '').trim();
        const program = String(row.program || row['Program'] || 'B.Tech').trim();
        const degree = String(row.degree || row['Degree'] || 'Bachelor of Technology').trim();
        const branch = String(row.branch || row['Branch'] || 'CSE').trim();
        const semester = Number(row.semester || row['Semester'] || 1);
        const batch = String(row.batch || row['Batch'] || '2024-2028').trim();
        const section = String(row.section || row['Section'] || 'A').trim();
        const gender = String(row.gender || row['Gender'] || 'MALE').toUpperCase();
        const hostelCode = String(row.hostelCode || row['Hostel Code'] || '').trim().toUpperCase();

        if (!firstName) {
          errors.push({ row: rowNum, field: 'firstName', message: 'First name is required' });
          failed++;
          continue;
        }
        if (!lastName) {
          errors.push({ row: rowNum, field: 'lastName', message: 'Last name is required' });
          failed++;
          continue;
        }
        if (!email) {
          errors.push({ row: rowNum, field: 'email', message: 'Email is required' });
          failed++;
          continue;
        }
        if (!enrollmentNumber) {
          errors.push({ row: rowNum, field: 'enrollmentNumber', message: 'Enrollment number is required' });
          failed++;
          continue;
        }

        let hostelId = null;
        if (hostelCode && hostelCodeMap.has(hostelCode)) {
          hostelId = hostelCodeMap.get(hostelCode);
        }

        await StudentService.createStudent({
          firstName,
          lastName,
          email,
          phone,
          enrollmentNumber,
          registrationNumber: registrationNumber || enrollmentNumber,
          program,
          degree,
          branch,
          semester,
          batch,
          section,
          rollNumber: enrollmentNumber,
          gender: ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : 'OTHER',
          hostelId,
        });

        successful++;
      } catch (err: any) {
        failed++;
        errors.push({
          row: rowNum,
          field: 'general',
          message: err.message || 'Error processing row',
        });
      }
    }

    return {
      total: rows.length,
      successful,
      failed,
      errors,
    };
  }
}
