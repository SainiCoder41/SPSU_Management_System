import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';

export const seedDatabase = async (disconnectAfter: boolean = true) => {
  try {
    console.log('🌱 Starting SPSU CMS Database Seeding...');
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Hostel.deleteMany({}),
      Staff.deleteMany({}),
      Student.deleteMany({}),
      Parent.deleteMany({}),
    ]);

    // 1. Create Departments
    console.log('🏢 Creating Departments (CSE, ECE, ME, CE)...');
    const deptCse = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Emerging Technologies',
    });

    const deptEce = await Department.create({
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Department of Electronics, IoT and Communication Systems',
    });

    const deptMe = await Department.create({
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Department of Mechanical and Automation Engineering',
    });

    const deptCe = await Department.create({
      name: 'Civil Engineering',
      code: 'CE',
      description: 'Department of Civil and Infrastructure Engineering',
    });

    // 2. Create Hostels
    console.log('🏠 Creating Hostels (BH1-BH4, GH1-GH3)...');
    const hostels = await Hostel.create([
      { name: 'BH1', type: 'BOYS', capacity: 120, occupancy: 0, description: 'Boys Hostel 1 (Vivekananda Bhawan)' },
      { name: 'BH2', type: 'BOYS', capacity: 150, occupancy: 0, description: 'Boys Hostel 2 (Tagore Bhawan)' },
      { name: 'BH3', type: 'BOYS', capacity: 150, occupancy: 0, description: 'Boys Hostel 3 (Aryabhata Bhawan)' },
      { name: 'BH4', type: 'BOYS', capacity: 180, occupancy: 0, description: 'Boys Hostel 4 (Kalam Bhawan)' },
      { name: 'GH1', type: 'GIRLS', capacity: 100, occupancy: 0, description: 'Girls Hostel 1 (Gargi Bhawan)' },
      { name: 'GH2', type: 'GIRLS', capacity: 120, occupancy: 0, description: 'Girls Hostel 2 (Maitreyi Bhawan)' },
      { name: 'GH3', type: 'GIRLS', capacity: 140, occupancy: 0, description: 'Girls Hostel 3 (Kalpana Chawla Bhawan)' },
    ]);

    const hostelBh2 = hostels.find((h) => h.name === 'BH2')!;
    const hostelGh1 = hostels.find((h) => h.name === 'GH1')!;

    // 3. Create Admin User
    console.log('👤 Creating ADMIN: admin@spsu.ac.in');
    const adminUser = await User.create({
      name: 'Dr. SPSU Admin',
      email: 'admin@spsu.ac.in',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '+91 98765 00001',
    });

    await Staff.create({
      user: adminUser._id,
      employeeId: 'ADM-001',
      department: deptCse._id,
      designation: 'Director of IT & Campus Systems',
      specialization: 'Enterprise Architecture & Cloud Systems',
      officeLocation: 'Admin Block, Room 101',
    });

    // 4. Create HOD User (CSE)
    console.log('👤 Creating HOD: hod.cse@spsu.ac.in');
    const hodUser = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'hod.cse@spsu.ac.in',
      password: 'Staff@1234',
      role: 'HOD',
      phone: '+91 98765 00002',
    });

    const hodStaff = await Staff.create({
      user: hodUser._id,
      employeeId: 'CSE-HOD-01',
      department: deptCse._id,
      designation: 'Professor & Head of Department',
      specialization: 'Artificial Intelligence & High Performance Computing',
      officeLocation: 'Academic Block A, Room 301',
    });

    // Link HOD to Department
    deptCse.hod = hodStaff._id as any;
    await deptCse.save();

    // 5. Create Faculty User
    console.log('👤 Creating FACULTY: faculty1@spsu.ac.in');
    const facultyUser = await User.create({
      name: 'Dr. Priya Mehta',
      email: 'faculty1@spsu.ac.in',
      password: 'Staff@1234',
      role: 'FACULTY',
      phone: '+91 98765 00003',
    });

    const facultyStaff = await Staff.create({
      user: facultyUser._id,
      employeeId: 'CSE-FAC-01',
      department: deptCse._id,
      designation: 'Associate Professor',
      specialization: 'Distributed Database Systems & Software Engineering',
      officeLocation: 'Academic Block A, Room 204',
    });

    // 6. Create Mentor User
    console.log('👤 Creating MENTOR: mentor.cse@spsu.ac.in');
    const mentorUser = await User.create({
      name: 'Prof. Vikram Singh',
      email: 'mentor.cse@spsu.ac.in',
      password: 'Staff@1234',
      role: 'MENTOR',
      phone: '+91 98765 00004',
    });

    const mentorStaff = await Staff.create({
      user: mentorUser._id,
      employeeId: 'CSE-MTR-01',
      department: deptCse._id,
      designation: 'Assistant Professor & Chief Student Mentor',
      specialization: 'Full-Stack Web Systems & Cybersecurity',
      officeLocation: 'Academic Block A, Room 210',
    });

    // 7. Create Warden User
    console.log('👤 Creating WARDEN: warden.bh2@spsu.ac.in');
    const wardenUser = await User.create({
      name: 'Mr. Arvind Chauhan',
      email: 'warden.bh2@spsu.ac.in',
      password: 'Staff@1234',
      role: 'WARDEN',
      phone: '+91 98765 00005',
    });

    const wardenStaff = await Staff.create({
      user: wardenUser._id,
      employeeId: 'HST-WRD-02',
      department: deptMe._id,
      designation: 'Hostel Warden & Assistant Professor',
      specialization: 'Thermal Systems & Student Residential Welfare',
      officeLocation: 'BH2 Warden Office, Ground Floor',
    });

    // Link Warden to BH2
    hostelBh2.warden = wardenStaff._id as any;
    await hostelBh2.save();

    // 8. Create Student 1 (Aarav Verma)
    console.log('👤 Creating STUDENT: student1@spsu.ac.in');
    const student1User = await User.create({
      name: 'Aarav Verma',
      email: 'student1@spsu.ac.in',
      password: 'Student@1234',
      role: 'STUDENT',
      phone: '+91 91234 56780',
    });

    const student1 = await Student.create({
      user: student1User._id,
      enrollmentNumber: 'SPSU2023CSE001',
      rollNumber: '23BCSE01',
      program: 'B.Tech',
      department: deptCse._id,
      semester: 4,
      section: 'A',
      cgpa: 8.85,
      admissionYear: 2023,
      hostel: hostelBh2._id,
      roomNumber: 'B-204',
      mentor: mentorStaff._id,
    });

    // 9. Create Parent User (Linked to student1)
    console.log('👤 Creating PARENT: parent1@gmail.com');
    const parentUser = await User.create({
      name: 'Mr. Ramesh Verma',
      email: 'parent1@gmail.com',
      password: 'Parent@1234',
      role: 'PARENT',
      phone: '+91 94140 12345',
    });

    const parent = await Parent.create({
      user: parentUser._id,
      student: student1._id,
      relation: 'Father',
      occupation: 'Senior General Manager, JK Cement Ltd.',
      address: 'Plot 42, Shobhagpura, Udaipur, Rajasthan - 313001',
    });

    student1.parent = parent._id as any;
    await student1.save();

    // 10. Additional Sample Students to populate the SIS directory & mentee list
    console.log('👥 Creating additional sample students...');
    const extraStudentsData = [
      {
        name: 'Ananya Sharma',
        email: 'ananya.cse@spsu.ac.in',
        rollNumber: '23BCSE02',
        enrollmentNumber: 'SPSU2023CSE002',
        dept: deptCse._id,
        semester: 4,
        section: 'A',
        cgpa: 9.2,
        hostel: hostelGh1._id,
        room: 'G-102',
        mentor: mentorStaff._id,
      },
      {
        name: 'Rohan Rathore',
        email: 'rohan.cse@spsu.ac.in',
        rollNumber: '23BCSE03',
        enrollmentNumber: 'SPSU2023CSE003',
        dept: deptCse._id,
        semester: 4,
        section: 'B',
        cgpa: 7.9,
        hostel: hostelBh2._id,
        room: 'B-205',
        mentor: mentorStaff._id,
      },
      {
        name: 'Sneha Jain',
        email: 'sneha.ece@spsu.ac.in',
        rollNumber: '22BECE01',
        enrollmentNumber: 'SPSU2022ECE001',
        dept: deptEce._id,
        semester: 6,
        section: 'A',
        cgpa: 8.4,
        hostel: hostelGh1._id,
        room: 'G-201',
        mentor: facultyStaff._id,
      },
      {
        name: 'Kabir Singhania',
        email: 'kabir.me@spsu.ac.in',
        rollNumber: '24BME01',
        enrollmentNumber: 'SPSU2024ME001',
        dept: deptMe._id,
        semester: 2,
        section: 'A',
        cgpa: 8.1,
        hostel: hostelBh2._id,
        room: 'B-108',
        mentor: wardenStaff._id,
      },
      {
        name: 'Diya Patel',
        email: 'diya.ce@spsu.ac.in',
        rollNumber: '21BCE01',
        enrollmentNumber: 'SPSU2021CE001',
        dept: deptCe._id,
        semester: 8,
        section: 'A',
        cgpa: 9.05,
        hostel: null,
        room: '',
        mentor: null,
      },
    ];

    for (const s of extraStudentsData) {
      const u = await User.create({
        name: s.name,
        email: s.email,
        password: 'Student@1234',
        role: 'STUDENT',
        phone: '+91 91234 500' + s.rollNumber.slice(-2),
      });

      await Student.create({
        user: u._id,
        enrollmentNumber: s.enrollmentNumber,
        rollNumber: s.rollNumber,
        program: 'B.Tech',
        department: s.dept,
        semester: s.semester,
        section: s.section,
        cgpa: s.cgpa,
        admissionYear: 2020 + (8 - s.semester) / 2,
        hostel: s.hostel,
        roomNumber: s.room,
        mentor: s.mentor,
      });
    }

    // Update hostel occupancy
    for (const h of hostels) {
      const occ = await Student.countDocuments({ hostel: h._id });
      await Hostel.findByIdAndUpdate(h._id, { occupancy: occ });
    }

    console.log('✅ Database seeding finished successfully!');
    console.log('--------------------------------------------------');
    console.log('🎉 Default Demo Accounts Ready for Testing:');
    console.log('  1. ADMIN   : admin@spsu.ac.in        / Admin@123');
    console.log('  2. STUDENT : student1@spsu.ac.in     / Student@1234');
    console.log('  3. FACULTY : faculty1@spsu.ac.in     / Staff@1234');
    console.log('  4. MENTOR  : mentor.cse@spsu.ac.in   / Staff@1234');
    console.log('  5. WARDEN  : warden.bh2@spsu.ac.in   / Staff@1234');
    console.log('  6. HOD     : hod.cse@spsu.ac.in      / Staff@1234');
    console.log('  7. PARENT  : parent1@gmail.com       / Parent@1234');
    console.log('--------------------------------------------------');

    if (disconnectAfter) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err: any) {
    console.error('❌ Database seeding failed:', err);
    if (disconnectAfter) {
      await disconnectDB();
      process.exit(1);
    }
  }
};

// Run if called directly as script
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase(true);
}
