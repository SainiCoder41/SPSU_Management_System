import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Hostel } from '../models/Hostel';
import { StudentProfile } from '../models/StudentProfile';
import { StaffProfile } from '../models/StaffProfile';
import { ParentProfile } from '../models/ParentProfile';
import { hashPassword } from '../utils/password';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Hostel.deleteMany({}),
      StudentProfile.deleteMany({}),
      StaffProfile.deleteMany({}),
      ParentProfile.deleteMany({}),
    ]);

    console.log('[Seed] Creating Admin account...');
    const adminPassword = await hashPassword('Admin@123');
    const adminUser = await User.create({
      firstName: 'SPSU',
      lastName: 'Administrator',
      fullName: 'SPSU Administrator',
      email: 'admin@spsu.ac.in',
      phone: '+91 9876543210',
      passwordHash: adminPassword,
      role: 'ADMIN',
      gender: 'MALE',
      isActive: true,
    });

    console.log('[Seed] Creating Departments...');
    const deptsData = [
      { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of CSE & AI/ML' },
      { name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of ECE & VLSI' },
      { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Robotics & Mechanical Eng' },
      { name: 'Civil Engineering', code: 'CE', description: 'Department of Infrastructure & Civil Eng' },
    ];
    const departments = await Department.insertMany(deptsData);
    const cseDept = departments.find((d) => d.code === 'CSE')!;

    console.log('[Seed] Creating Staff Accounts (HOD, Faculty, Mentor, Warden)...');
    const staffPassword = await hashPassword('Staff@1234');

    // 1. HOD
    const hodUser = await User.create({
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      fullName: 'Dr. Rajesh Sharma',
      email: 'hod.cse@spsu.ac.in',
      phone: '+91 9876543211',
      passwordHash: staffPassword,
      role: 'HOD',
      gender: 'MALE',
      isActive: true,
    });
    await StaffProfile.create({
      userId: hodUser._id,
      employeeId: 'EMP-HOD-01',
      designation: 'Professor & Head of Department',
      departmentId: cseDept._id,
      employmentType: 'FULL_TIME',
      qualification: 'Ph.D in Computer Science (IIT Bombay)',
      specialization: 'Artificial Intelligence & Distributed Systems',
    });
    cseDept.hodId = hodUser._id as any;
    await cseDept.save();

    // 2. Faculty
    const faculty1User = await User.create({
      firstName: 'Dr. Ananya',
      lastName: 'Verma',
      fullName: 'Dr. Ananya Verma',
      email: 'faculty1@spsu.ac.in',
      phone: '+91 9876543212',
      passwordHash: staffPassword,
      role: 'FACULTY',
      gender: 'FEMALE',
      isActive: true,
    });
    await StaffProfile.create({
      userId: faculty1User._id,
      employeeId: 'EMP-FAC-01',
      designation: 'Associate Professor',
      departmentId: cseDept._id,
      employmentType: 'FULL_TIME',
      qualification: 'Ph.D in Data Analytics',
      specialization: 'Machine Learning',
      reportingHodId: hodUser._id as any,
    });

    const faculty2User = await User.create({
      firstName: 'Prof. Vikram',
      lastName: 'Singh',
      fullName: 'Prof. Vikram Singh',
      email: 'faculty2@spsu.ac.in',
      phone: '+91 9876543213',
      passwordHash: staffPassword,
      role: 'FACULTY',
      gender: 'MALE',
      isActive: true,
    });
    await StaffProfile.create({
      userId: faculty2User._id,
      employeeId: 'EMP-FAC-02',
      designation: 'Assistant Professor',
      departmentId: cseDept._id,
      employmentType: 'FULL_TIME',
      qualification: 'M.Tech CSE',
      specialization: 'Cybersecurity',
      reportingHodId: hodUser._id as any,
    });

    // 3. Mentor
    const mentorUser = await User.create({
      firstName: 'Prof. Sanya',
      lastName: 'Mehta',
      fullName: 'Prof. Sanya Mehta',
      email: 'mentor.cse@spsu.ac.in',
      phone: '+91 9876543214',
      passwordHash: staffPassword,
      role: 'MENTOR',
      gender: 'FEMALE',
      isActive: true,
    });
    await StaffProfile.create({
      userId: mentorUser._id,
      employeeId: 'EMP-MNT-01',
      designation: 'Assistant Professor & Senior Mentor',
      departmentId: cseDept._id,
      employmentType: 'FULL_TIME',
      qualification: 'Ph.D in Software Engineering',
      specialization: 'Cloud Architectures',
      reportingHodId: hodUser._id as any,
    });

    // 4. Warden
    const wardenUser = await User.create({
      firstName: 'Mr. Ramesh',
      lastName: 'Choudhary',
      fullName: 'Mr. Ramesh Choudhary',
      email: 'warden.bh2@spsu.ac.in',
      phone: '+91 9876543215',
      passwordHash: staffPassword,
      role: 'WARDEN',
      gender: 'MALE',
      isActive: true,
    });

    console.log('[Seed] Creating Hostels...');
    const hostelsData = [
      { code: 'BH1', gender: 'MALE', wardenId: null },
      { code: 'BH2', gender: 'MALE', wardenId: wardenUser._id },
      { code: 'BH3', gender: 'MALE', wardenId: null },
      { code: 'BH4', gender: 'MALE', wardenId: null },
      { code: 'GH1', gender: 'FEMALE', wardenId: null },
      { code: 'GH2', gender: 'FEMALE', wardenId: null },
      { code: 'GH3', gender: 'FEMALE', wardenId: null },
    ];
    const hostels = await Hostel.insertMany(hostelsData);
    const bh2Hostel = hostels.find((h) => h.code === 'BH2')!;

    console.log('[Seed] Creating Parent Accounts...');
    const parentPassword = await hashPassword('Parent@1234');
    const parent1User = await User.create({
      firstName: 'Suresh',
      lastName: 'Kapur',
      fullName: 'Suresh Kapur',
      email: 'parent1@gmail.com',
      phone: '+91 9829012345',
      passwordHash: parentPassword,
      role: 'PARENT',
      gender: 'MALE',
      isActive: true,
    });
    const parent1Profile = await ParentProfile.create({
      userId: parent1User._id,
      relation: 'FATHER',
      occupation: 'Senior Executive',
      linkedStudents: [],
    });

    const parent2User = await User.create({
      firstName: 'Anita',
      lastName: 'Rathore',
      fullName: 'Anita Rathore',
      email: 'parent2@gmail.com',
      phone: '+91 9829012346',
      passwordHash: parentPassword,
      role: 'PARENT',
      gender: 'FEMALE',
      isActive: true,
    });
    const parent2Profile = await ParentProfile.create({
      userId: parent2User._id,
      relation: 'MOTHER',
      occupation: 'Architect',
      linkedStudents: [],
    });

    console.log('[Seed] Creating Sample Students...');
    const studentPassword = await hashPassword('Student@1234');
    const sampleStudents = [
      {
        firstName: 'Aarav',
        lastName: 'Kapur',
        email: 'student1@spsu.ac.in',
        phone: '+91 9785123401',
        gender: 'MALE',
        enrollmentNumber: 'SPSU2024CSE001',
        registrationNumber: 'REG2024001',
        program: 'B.Tech',
        degree: 'Bachelor of Technology',
        branch: 'CSE',
        semester: 5,
        batch: '2024-2028',
        section: 'A',
        rollNumber: '24CSE001',
        mentorId: mentorUser._id,
        hostelId: bh2Hostel._id,
        parentProfile: parent1Profile,
      },
      {
        firstName: 'Priya',
        lastName: 'Rathore',
        email: 'student2@spsu.ac.in',
        phone: '+91 9785123402',
        gender: 'FEMALE',
        enrollmentNumber: 'SPSU2024CSE002',
        registrationNumber: 'REG2024002',
        program: 'B.Tech',
        degree: 'Bachelor of Technology',
        branch: 'CSE',
        semester: 5,
        batch: '2024-2028',
        section: 'A',
        rollNumber: '24CSE002',
        mentorId: mentorUser._id,
        hostelId: null,
        parentProfile: parent2Profile,
      },
      {
        firstName: 'Rohan',
        lastName: 'Sharma',
        email: 'student3@spsu.ac.in',
        phone: '+91 9785123403',
        gender: 'MALE',
        enrollmentNumber: 'SPSU2024ECE001',
        registrationNumber: 'REG2024003',
        program: 'B.Tech',
        degree: 'Bachelor of Technology',
        branch: 'ECE',
        semester: 3,
        batch: '2024-2028',
        section: 'B',
        rollNumber: '24ECE001',
        mentorId: mentorUser._id,
        hostelId: bh2Hostel._id,
        parentProfile: null,
      },
      {
        firstName: 'Ananya',
        lastName: 'Joshi',
        email: 'student4@spsu.ac.in',
        phone: '+91 9785123404',
        gender: 'FEMALE',
        enrollmentNumber: 'SPSU2024ME001',
        registrationNumber: 'REG2024004',
        program: 'B.Tech',
        degree: 'Bachelor of Technology',
        branch: 'ME',
        semester: 7,
        batch: '2023-2027',
        section: 'A',
        rollNumber: '23ME001',
        mentorId: null,
        hostelId: null,
        parentProfile: null,
      },
      {
        firstName: 'Kabir',
        lastName: 'Singhania',
        email: 'student5@spsu.ac.in',
        phone: '+91 9785123405',
        gender: 'MALE',
        enrollmentNumber: 'SPSU2024CSE003',
        registrationNumber: 'REG2024005',
        program: 'B.Tech',
        degree: 'Bachelor of Technology',
        branch: 'CSE',
        semester: 1,
        batch: '2025-2029',
        section: 'C',
        rollNumber: '25CSE001',
        mentorId: mentorUser._id,
        hostelId: bh2Hostel._id,
        parentProfile: null,
      },
    ];

    for (const s of sampleStudents) {
      const user = await User.create({
        firstName: s.firstName,
        lastName: s.lastName,
        fullName: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: s.phone,
        passwordHash: studentPassword,
        role: 'STUDENT',
        gender: s.gender as any,
        isActive: true,
      });

      const profile = await StudentProfile.create({
        userId: user._id,
        enrollmentNumber: s.enrollmentNumber,
        registrationNumber: s.registrationNumber,
        admissionYear: 2024,
        academicYear: '2024-2028',
        program: s.program,
        degree: s.degree,
        branch: s.branch,
        semester: s.semester,
        batch: s.batch,
        section: s.section,
        rollNumber: s.rollNumber,
        currentStatus: 'ACTIVE',
        mentorId: s.mentorId || null,
        hostelId: s.hostelId || null,
        parentIds: s.parentProfile ? [s.parentProfile._id] : [],
        address: {
          line1: 'SPSU Campus',
          city: 'Udaipur',
          state: 'Rajasthan',
          country: 'India',
          postalCode: '313601',
        },
      });

      if (s.parentProfile) {
        s.parentProfile.linkedStudents.push(profile._id as any);
        await s.parentProfile.save();
      }
    }

    console.log('====================================================');
    console.log(' SPSU Campus Management System Data Seeded Successfully!');
    console.log(' Credentials Summary:');
    console.log(' ADMIN:    admin@spsu.ac.in / Admin@123');
    console.log(' HOD:      hod.cse@spsu.ac.in / Staff@1234');
    console.log(' FACULTY:  faculty1@spsu.ac.in / Staff@1234');
    console.log(' MENTOR:   mentor.cse@spsu.ac.in / Staff@1234');
    console.log(' WARDEN:   warden.bh2@spsu.ac.in / Staff@1234');
    console.log(' STUDENT:  student1@spsu.ac.in / Student@1234');
    console.log(' PARENT:   parent1@gmail.com / Parent@1234');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
