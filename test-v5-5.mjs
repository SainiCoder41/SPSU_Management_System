// SPSU Campus Management System - v5.5 Academics & Analytics Integration Suite

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
  console.log('🏛️  SPSU CMS - v5.5 Academics & Analytics E2E Tests');
  console.log('==========================================================');

  const adminToken = await login('admin@spsu.ac.in', 'Admin@123');
  const facultyToken = await login('faculty1@spsu.ac.in', 'Staff@1234');
  const studentToken = await login('student1@spsu.ac.in', 'Student@1234');
  const hodToken = await login('hod.cse@spsu.ac.in', 'Staff@1234');

  // Fetch student profile using faculty token - find student1
  const studentsRes = await fetch(`${BASE_URL}/students?limit=20`, {
    headers: { Authorization: `Bearer ${facultyToken}` },
  });
  const studentsJson = await studentsRes.json();
  const students = studentsJson.data;
  if (!students || students.length === 0) throw new Error('No students found in directory');
  const student = students.find((s) => s.enrollmentNumber === 'SPSU2023CSE001') || students[0];

  // Fetch subjects to include in mark entry
  const subjectsRes = await fetch(`${BASE_URL}/attendance/subjects`, {
    headers: { Authorization: `Bearer ${facultyToken}` },
  });
  const subjectsJson = await subjectsRes.json();
  const subjects = subjectsJson.data;
  if (!subjects || subjects.length === 0) throw new Error('No subjects found for marks entry');

  // TEST 1: Faculty Marks Entry & SGPA/CGPA calculation (ACD-001)
  await runStep('1. Faculty Marks Entry & Auto-Grading/SGPA (ACD-001)', async () => {
    const courses = subjects.slice(0, 3).map((s, idx) => ({
      subjectId: s._id,
      internalMarks: 25 + idx, // max 30
      midTermMarks: 18 + idx,  // max 20
      endTermMarks: 42 + idx,  // max 50
    }));

    const res = await fetch(`${BASE_URL}/academics/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        studentId: student._id,
        semester: 4,
        academicYear: '2024-2025',
        courses,
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Marks entry failed');
    if (!json.data || !json.data.sgpa || !json.data.cgpa) {
      throw new Error('Marksheet did not compute SGPA/CGPA');
    }
    if (json.data.courses[0].grade !== 'A+' && json.data.courses[0].grade !== 'A') {
      throw new Error(`Unexpected grade: ${json.data.courses[0].grade}`);
    }
  });

  // TEST 2: RBAC Guard - Student cannot enter marks (ACD-001 RBAC)
  await runStep('2. RBAC Guard - Student Forbidden from Marks Entry', async () => {
    const res = await fetch(`${BASE_URL}/academics/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        studentId: student._id,
        semester: 4,
        academicYear: '2024-2025',
        courses: [],
      }),
    });

    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    }
  });

  // TEST 3: Student Grade Card Retrieval (ACD-002)
  await runStep('3. Student Grade Card & Academic Progress (ACD-002)', async () => {
    const res = await fetch(`${BASE_URL}/academics/my-results`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch student results');
    if (!json.data.marksheets || json.data.marksheets.length === 0) {
      throw new Error('No marksheets returned for student');
    }
    if (json.data.cgpa <= 0) {
      throw new Error(`Invalid CGPA reported: ${json.data.cgpa}`);
    }
  });

  // TEST 4: Department Performance Analytics for HOD (ACD-003, ACD-004)
  await runStep('4. HOD Department Performance Analytics (ACD-003, ACD-004)', async () => {
    const deptId = student.department?._id || student.department;
    const res = await fetch(`${BASE_URL}/academics/analytics/department/${deptId}`, {
      headers: { Authorization: `Bearer ${hodToken}` },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch HOD department analytics');
    if (typeof json.data.totalStudents !== 'number' || typeof json.data.averageCgpa !== 'number') {
      throw new Error('Analytics payload missing metrics');
    }
  });

  // TEST 5: Digital Student ID Card with Signed QR (ACD-005)
  let qrSignature = null;
  await runStep('5. Digital Student ID Card Generation with QR Signature (ACD-005)', async () => {
    const res = await fetch(`${BASE_URL}/academics/my-id-card`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to get ID card');
    if (!json.data.qrCodePayload || !json.data.qrSignature) {
      throw new Error('ID card missing signed QR data');
    }
    qrSignature = json.data.qrSignature;
  });

  // TEST 6: Public ID Card Verification by Security/Warden (ACD-005)
  await runStep('6. Public QR ID Card Verification (ACD-005)', async () => {
    const res = await fetch(`${BASE_URL}/academics/verify-id/${student._id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'QR Verification failed');
    if (!json.verified || json.student.enrollmentNumber !== student.enrollmentNumber) {
      throw new Error('QR Verification returned incorrect student data');
    }
  });

  console.log('\n==========================================================');
  console.log(`🏁 Tests Completed: ${passed} passed, ${failed} failed`);
  console.log('==========================================================');

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
