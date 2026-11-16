import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { LeaveType } from '../models/LeaveType.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Event } from '../models/Event.js';
import { PermissionType } from '../models/PermissionType.js';
import { PermissionRequest } from '../models/PermissionRequest.js';
import { Complaint } from '../models/Complaint.js';
import { Notice } from '../models/Notice.js';
import { Notification } from '../models/Notification.js';

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
      LeaveType.deleteMany({}),
      LeaveBalance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Event.deleteMany({}),
      PermissionType.deleteMany({}),
      PermissionRequest.deleteMany({}),
      Complaint.deleteMany({}),
      Notice.deleteMany({}),
      Notification.deleteMany({}),
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

    // 11. Create Leave Types & Initial Balances (v2.0 Leave Management)
    console.log('🗓️ Creating Leave Types (v2.0 Leave Management)...');
    const leaveTypes = await LeaveType.create([
      {
        name: 'Casual Leave',
        code: 'CL',
        applicableRole: 'ALL',
        defaultQuota: 12,
        requiresAttachment: false,
        description: 'Short absence for personal, urgent or family matters',
      },
      {
        name: 'Medical / Health Leave',
        code: 'ML',
        applicableRole: 'ALL',
        defaultQuota: 10,
        requiresAttachment: true,
        description: 'Absence due to illness, hospitalization or recovery with medical certificate',
      },
      {
        name: 'Home Visit / Weekend Leave',
        code: 'HV',
        applicableRole: 'STUDENT',
        defaultQuota: 20,
        requiresAttachment: false,
        description: 'Scheduled residential student home visit approved by mentor and warden',
      },
      {
        name: 'Academic / On-Duty Leave',
        code: 'OD',
        applicableRole: 'ALL',
        defaultQuota: 15,
        requiresAttachment: true,
        description: 'Off-campus academic competitions, hackathons, seminars or conferences',
      },
    ]);

    const clType = leaveTypes.find((lt) => lt.code === 'CL')!;
    const hvType = leaveTypes.find((lt) => lt.code === 'HV')!;

    // Create Initial Balances for student1
    const currentYear = new Date().getFullYear();
    for (const lt of leaveTypes) {
      await LeaveBalance.create({
        user: student1User._id,
        leaveType: lt._id,
        academicYear: currentYear,
        totalQuota: lt.defaultQuota,
        usedDays: lt.code === 'CL' ? 2 : 0,
        pendingDays: lt.code === 'HV' ? 3 : 0,
        remainingDays: lt.code === 'CL' ? lt.defaultQuota - 2 : lt.defaultQuota,
      });
    }

    // Seed Sample Leave Requests
    // 1. One Approved Casual Leave in past
    const pastStart = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000);
    await LeaveRequest.create({
      applicant: student1User._id,
      applicantRole: 'STUDENT',
      leaveType: clType._id,
      startDate: pastStart,
      endDate: pastEnd,
      numberOfDays: 2,
      reason: 'Urgent family function at hometown in Jaipur',
      emergencyContact: '+91 94140 12345',
      status: 'Approved',
      currentApprover: mentorUser._id,
      approvalHistory: [
        {
          approver: student1User._id,
          role: 'STUDENT',
          action: 'Submitted',
          actionDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          comments: 'Submitted by student',
        },
        {
          approver: mentorUser._id,
          role: 'MENTOR',
          action: 'Approved',
          actionDate: pastStart,
          comments: 'Approved. Informed parents.',
        },
      ],
      auditTrail: [
        {
          actor: student1User._id,
          action: 'LEAVE_SUBMITTED',
          timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          previousState: 'Draft',
          newState: 'Pending',
          comment: 'Submitted 2 days Casual Leave',
        },
        {
          actor: mentorUser._id,
          action: 'LEAVE_APPROVED',
          timestamp: pastStart,
          previousState: 'Pending',
          newState: 'Approved',
          comment: 'Approved. Informed parents.',
        },
      ],
    });

    // 2. One Pending Home Visit Leave for mentor to review right now!
    const futureStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const futureEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    await LeaveRequest.create({
      applicant: student1User._id,
      applicantRole: 'STUDENT',
      leaveType: hvType._id,
      startDate: futureStart,
      endDate: futureEnd,
      numberOfDays: 3,
      reason: 'Visiting home for upcoming family festival and celebrations',
      emergencyContact: '+91 94140 12345',
      status: 'Pending',
      currentApprover: mentorUser._id,
      approvalHistory: [
        {
          approver: student1User._id,
          role: 'STUDENT',
          action: 'Submitted',
          actionDate: new Date(),
          comments: 'Submitted by student',
        },
      ],
      auditTrail: [
        {
          actor: student1User._id,
          action: 'LEAVE_SUBMITTED',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Pending',
          comment: 'Applicant requested 3 days of Home Visit Leave',
        },
      ],
    });

    // 12. Create Campus Events (v3.0 Event Management)
    console.log('🎪 Creating Campus Events (v3.0 Event Management)...');
    const hackathonEvent = await Event.create({
      title: 'SPSU National Hackathon 2026',
      description: '36-hour flagship hackathon on Generative AI, IoT, and Cloud Infrastructure with industry mentors from JK Cement & Tech partners.',
      category: 'Technical',
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
      venue: 'Academic Block A, Main Auditorium & Computing Labs',
      organizer: facultyUser._id,
      organizerDepartment: deptCse._id,
      targetAudience: {
        roles: ['STUDENT', 'FACULTY'],
        departments: [],
        semesters: [],
      },
      capacity: 120,
      registeredCount: 1,
      isRegistrationOpen: true,
      status: 'Published',
      registrations: [
        {
          student: student1._id,
          user: student1User._id,
          registeredAt: new Date(),
          status: 'Confirmed',
        },
      ],
    });

    await Event.create({
      title: 'Panache 2026: Annual Cultural & Youth Fest',
      description: 'The premier inter-college cultural festival featuring musical band battles, dance showdowns, fashion pageants, and food stalls.',
      category: 'Cultural',
      dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      venue: 'SPSU Central Lawn & Amphitheatre',
      organizer: adminUser._id,
      capacity: 500,
      registeredCount: 0,
      isRegistrationOpen: true,
      status: 'Published',
      registrations: [],
    });

    await Event.create({
      title: 'Distinguished Lecture: AI in Autonomous Manufacturing',
      description: 'Guest keynote session by visiting professors on robotics, automation and cyber-physical production lines.',
      category: 'Academic',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      venue: 'Sir Padampat Memorial Seminar Hall',
      organizer: hodUser._id,
      organizerDepartment: deptCse._id,
      capacity: 80,
      registeredCount: 0,
      isRegistrationOpen: true,
      status: 'Published',
      registrations: [],
    });

    // 13. Create Permission Types (v3.0 Permission / Gate Pass Management)
    console.log('🎫 Creating Permission & Gate Pass Types (v3.0)...');
    const permTypes = await PermissionType.create([
      {
        name: 'Day Outing Pass',
        code: 'DAY_OUTING',
        requiresWardenSignOff: true,
        requiresParentSignOff: false,
        maxDurationHours: 10,
        description: 'Local city visit / shopping during permitted daytime hours with evening return',
      },
      {
        name: 'Night Outing / Overnight Stay',
        code: 'NIGHT_OUTING',
        requiresWardenSignOff: true,
        requiresParentSignOff: true,
        maxDurationHours: 48,
        description: 'Overnight stay at local guardian or emergency travel requiring both Warden approval and Parent sign-off',
      },
      {
        name: 'Late Campus Entry',
        code: 'LATE_ENTRY',
        requiresWardenSignOff: true,
        requiresParentSignOff: false,
        maxDurationHours: 4,
        description: 'Permission to enter campus premises past standard 8:30 PM gate closure',
      },
      {
        name: 'Special Lab & Project Night Pass',
        code: 'LAB_PASS',
        requiresWardenSignOff: false,
        requiresParentSignOff: false,
        maxDurationHours: 12,
        description: 'Night access to Central Computing Facility or Innovation Lab for project work',
      },
    ]);

    const nightPassType = permTypes.find((p) => p.code === 'NIGHT_OUTING')!;

    // Seed Sample Permission Request (Pending for Warden and Parent)
    console.log('🎫 Creating sample Permission Request for student1...');
    await PermissionRequest.create({
      applicant: student1User._id,
      student: student1._id,
      permissionType: nightPassType._id,
      startDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      destination: 'Family residence in Shobhagpura, Udaipur',
      reason: 'Weekend family stay and personal study leave',
      emergencyContact: '+91 94140 12345',
      hasLeaveConflict: false,
      leaveConflictDetails: '',
      status: 'Pending',
      wardenSignOff: {
        signee: wardenUser._id,
        status: 'Pending',
        comments: '',
      },
      parentSignOff: {
        signee: parentUser._id,
        status: 'Pending',
        comments: '',
      },
      auditTrail: [
        {
          actor: student1User._id,
          action: 'PERMISSION_SUBMITTED',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Pending',
          comment: 'Submitted Night Outing / Overnight Stay pass',
        },
      ],
    });

    // 14. Seed Sample Complaints / Grievances (v3.5)
    console.log('📬 Creating Grievances & Complaints (v3.5)...');
    await Complaint.create({
      ticketNumber: 'GRV-2026-0001',
      complainant: student1User._id,
      isAnonymous: false,
      category: 'Hostel',
      isSensitive: false,
      title: 'Water cooler filtration unit in Boys Hostel 2 2nd Floor',
      description: 'The RO drinking water filter unit on the 2nd floor of BH-2 has low water pressure and needs filter replacement.',
      status: 'Under Review',
      priority: 'Medium',
      assignedDepartment: deptCse._id,
      assignedOwner: wardenUser._id,
      notes: [
        {
          author: wardenUser._id,
          authorName: wardenUser.name,
          isInternal: false,
          text: 'Maintenance request logged with campus facilities team. Technician arriving tomorrow.',
          createdAt: new Date(),
        },
      ],
      auditTrail: [
        {
          actor: student1User._id,
          action: 'Complaint Submitted',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Submitted',
          comment: 'Ticket GRV-2026-0001 registered successfully',
        },
        {
          actor: wardenUser._id,
          action: 'Status changed to Under Review',
          timestamp: new Date(),
          previousState: 'Submitted',
          newState: 'Under Review',
          comment: 'Warden reviewed and notified facilities team',
        },
      ],
    });

    // Sensitive Grievance (Ragging/Harassment) assigned to Designated Authority (Admin)
    await Complaint.create({
      ticketNumber: 'GRV-2026-0002',
      complainant: student1User._id,
      isAnonymous: true,
      category: 'Ragging / Harassment',
      isSensitive: true,
      title: 'Verbal intimidation reported near Sports Complex',
      description: 'Senior students observed intimidating 1st year students near the indoor badminton courts after 8:30 PM.',
      status: 'Submitted',
      priority: 'Critical',
      assignedOwner: adminUser._id,
      notes: [],
      auditTrail: [
        {
          actor: student1User._id,
          action: 'Complaint Submitted',
          timestamp: new Date(),
          previousState: 'Draft',
          newState: 'Submitted',
          comment: 'Ticket GRV-2026-0002 registered successfully (Sensitive)',
        },
      ],
    });

    // 15. Seed Notices (v4.0 Notice Board)
    console.log('📢 Creating Campus Notices & Announcements (v4.0)...');
    await Notice.create({
      title: 'Mid-Term Examination Schedule - Autumn 2026',
      body: 'The mid-term examination timetable for B.Tech Semester 4 and Semester 6 has been released. Examinations commence on 10th December 2026. Hall tickets will be issued via the SIS portal.',
      priority: 'Important',
      isPinned: true,
      targetAudience: {
        roles: ['STUDENT', 'FACULTY', 'MENTOR'],
        departments: [],
        semesters: [],
      },
      publisher: adminUser._id,
      status: 'Published',
      publishDate: new Date(),
      viewCount: 142,
    });

    await Notice.create({
      title: 'Hostel Mess Menu Revision & Committee Meeting',
      body: 'A meeting of the Student Hostel & Mess Committee will take place this Thursday at 5:00 PM in Seminar Hall 1 to review nutritional quality and student feedback.',
      priority: 'Normal',
      isPinned: false,
      targetAudience: {
        roles: ['STUDENT', 'WARDEN'],
        hostels: [hostelBh2._id],
      },
      publisher: wardenUser._id,
      status: 'Published',
      publishDate: new Date(),
      viewCount: 48,
    });

    // 16. Seed Notifications (v4.0 In-App Notifications)
    console.log('🔔 Creating In-App Notifications (v4.0)...');
    await Notification.create({
      recipient: student1User._id,
      title: 'Gate Pass Submitted',
      message: 'Your Night Outing / Overnight Stay pass has been submitted and is awaiting warden review.',
      sourceModule: 'Permission',
      link: '/student/permissions',
      isRead: false,
    });

    await Notification.create({
      recipient: student1User._id,
      title: 'Notice: Mid-Term Examination Schedule',
      message: 'A new important notice has been posted regarding Autumn 2026 examinations.',
      sourceModule: 'Notice',
      link: '/notices',
      isRead: false,
    });

    await Notification.create({
      recipient: wardenUser._id,
      title: 'New Permission Request Pending',
      message: 'Aarav Sharma has requested a Night Outing pass requiring your sign-off.',
      sourceModule: 'Permission',
      link: '/warden/permissions',
      isRead: false,
    });

    await Notification.create({
      recipient: adminUser._id,
      title: '⚠️ Sensitive Grievance Received',
      message: 'Sensitive complaint GRV-2026-0002 (Ragging / Harassment) requires immediate investigation.',
      sourceModule: 'Complaint',
      link: '/complaints/manage?ticket=GRV-2026-0002',
      isRead: false,
    });

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
