// SPSU Campus Management System - v5.0 Attendance & Timetable Integration Suite

const BASE_URL = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

async function runStep(name, fn) {
  process.stdout.write(`\n🔹 Running: ${name}... `);
  try {
    await fn();
    console.log(`✅ PASS`);
    passed++;
  } catch (err) {
    console.log(`❌ FAIL`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Login failed for ${email}`);
  return data.token;
}

async function main() {
  console.log('==========================================================');
  console.log('🏛️  SPSU CMS - v5.0 Attendance & Timetable E2E Tests');
  console.log('==========================================================');

  const adminToken = await login('admin@spsu.ac.in', 'Admin@123');
  const facultyToken = await login('faculty1@spsu.ac.in', 'Staff@1234');
  const studentToken = await login('student1@spsu.ac.in', 'Student@1234');

  // Pre-load department
  const deptsRes = await fetch(`${BASE_URL}/departments`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deptsJson = await deptsRes.json();
  const cseDept = deptsJson.data.find((d) => d.code === 'CSE') || deptsJson.data[0];

  let subjectId = null;

  // TEST 1: Define Academic Subject (ATT-004)
  await runStep('1. Define Academic Subject (ATT-004)', async () => {
    const res = await fetch(`${BASE_URL}/attendance/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Theory of Computation',
        code: 'CS206_' + Math.floor(Math.random() * 1000),
        department: cseDept._id,
        semester: 4,
        credits: 4,
        type: 'Theory',
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data._id) throw new Error(json.message || 'Failed to create subject');
    subjectId = json.data._id;
  });

  // TEST 2: Publish Section Timetable (ATT-005)
  await runStep('2. Publish Section Timetable (ATT-005)', async () => {
    const res = await fetch(`${BASE_URL}/attendance/timetable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        departmentId: cseDept._id,
        semester: 4,
        section: 'B',
        slots: [
          {
            dayOfWeek: 'Monday',
            startTime: '11:00',
            endTime: '12:00',
            subjectId,
            facultyId: '67389a00b123456789abcde2',
            room: 'LT-201',
          },
        ],
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data._id) throw new Error(json.message || 'Failed to publish timetable');
  });

  // TEST 3: Timetable Room & Faculty Clash Detection (ATT-005)
  await runStep('3. Enforce Timetable Clash Detection (ATT-005)', async () => {
    // Attempt to schedule Section C in same room LT-201 on Monday 11:00-12:00
    const res = await fetch(`${BASE_URL}/attendance/timetable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        departmentId: cseDept._id,
        semester: 4,
        section: 'C',
        slots: [
          {
            dayOfWeek: 'Monday',
            startTime: '11:00',
            endTime: '12:00',
            subjectId,
            facultyId: '67389a00b123456789abcde3',
            room: 'LT-201', // CLASH!
          },
        ],
      }),
    });
    if (res.ok) {
      throw new Error('Validation failure: System allowed room double-booking on timetable');
    }
    console.log('\n   [Verified clash prevention on room double-booking]');
  });

  // TEST 4: Faculty Marks Daily Roll-Call Attendance (ATT-001)
  await runStep('4. Faculty Marks Daily Roll-Call Attendance (ATT-001)', async () => {
    const studentsRes = await fetch(`${BASE_URL}/students?limit=2`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    const studentsJson = await studentsRes.json();
    const students = studentsJson.data;

    const res = await fetch(`${BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        subjectId,
        departmentId: cseDept._id,
        semester: 4,
        section: 'B',
        date: new Date().toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '12:00',
        records: students.map((s, idx) => ({
          studentId: s._id,
          status: idx === 0 ? 'Present' : 'Absent',
          remarks: 'Regular class session',
        })),
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data._id) throw new Error(json.message || 'Mark attendance failed');
  });

  // TEST 5: Student and Parent View Attendance Summary (ATT-002)
  await runStep('5. Student / Parent Retrieves Subject Attendance Breakdown (ATT-002)', async () => {
    const res = await fetch(`${BASE_URL}/attendance/my`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const json = await res.json();
    if (!json.success || json.data.cumulativePercentage === undefined) {
      throw new Error(json.message || 'Failed to fetch student attendance breakdown');
    }
    console.log(`\n   [Student Cumulative Attendance: ${json.data.cumulativePercentage}%]`);
  });

  // TEST 6: Mentors / HODs Low Attendance Threshold Queries (ATT-003)
  await runStep('6. Mentor / HOD Low Attendance Threshold Summary (ATT-003)', async () => {
    const res = await fetch(`${BASE_URL}/attendance/low-attendance?threshold=85`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Failed to query low attendance list');
    }
    console.log(`\n   [Found ${json.count} students with attendance below threshold]`);
  });

  console.log('\n==========================================================');
  console.log(`Test Results Summary: ${passed} Passed, ${failed} Failed`);
  console.log('==========================================================');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
