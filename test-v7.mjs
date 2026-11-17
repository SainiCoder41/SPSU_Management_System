// SPSU Campus Management System - v7.0 Campus Services & Reach E2E Test Suite

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
  console.log('🏛️  SPSU CMS - v7.0 Campus Services & Reach Tests');
  console.log('==========================================================');

  const adminToken = await login('admin@spsu.ac.in', 'Admin@123');
  const studentToken = await login('student1@spsu.ac.in', 'Student@1234');
  const wardenToken = await login('warden.bh2@spsu.ac.in', 'Staff@1234');

  // Fetch student profile for Mongo ID
  const studentsRes = await fetch(`${BASE_URL}/students?limit=1`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const studentsJson = await studentsRes.json();
  const student = studentsJson.data[0];

  let bookId = null;
  let issueId = null;

  // TEST 1: Library Book Catalog & Borrowing (SRV-001)
  await runStep('1. Library Catalog & Book Loan Lifecycle (SRV-001)', async () => {
    // 1. Fetch catalog
    const booksRes = await fetch(`${BASE_URL}/services/library/books`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const booksJson = await booksRes.json();
    if (!booksJson.success || booksJson.data.length === 0) {
      throw new Error('No books found in library catalog');
    }
    const book = booksJson.data[0];
    bookId = book._id;
    const initialCopies = book.availableCopies;

    // 2. Issue book to student
    const issueRes = await fetch(`${BASE_URL}/services/library/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ bookId, studentId: student._id }),
    });
    const issueJson = await issueRes.json();
    if (!issueJson.success || !issueJson.data._id) {
      throw new Error(issueJson.message || 'Book issue failed');
    }
    issueId = issueJson.data._id;

    // 3. Verify stock decrement
    const checkRes = await fetch(`${BASE_URL}/services/library/books`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const checkJson = await checkRes.json();
    const updatedBook = checkJson.data.find((b) => b._id === bookId);
    if (updatedBook.availableCopies !== initialCopies - 1) {
      throw new Error('Available book copies did not decrement');
    }
  });

  // TEST 2: Return Book & Automatic Fine Calculation (SRV-001)
  await runStep('2. Library Book Return & Fine Audit (SRV-001)', async () => {
    const res = await fetch(`${BASE_URL}/services/library/return/${issueId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Book return failed');
    if (json.data.status !== 'Returned') {
      throw new Error(`Expected status Returned, got ${json.data.status}`);
    }
    if (typeof json.data.fineAmount !== 'number') {
      throw new Error('Return record missing fineAmount');
    }
  });

  // TEST 3: Training & Placement Drives Catalog (SRV-002)
  let driveId = null;
  await runStep('3. Training & Placement Drives Catalog (SRV-002)', async () => {
    const res = await fetch(`${BASE_URL}/services/placements/drives`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch placement drives');
    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('No active placement drives found');
    }
    const drive = json.data[0];
    driveId = drive._id;
    if (typeof drive.ctcPackageLPA !== 'number' || typeof drive.eligibilityCgpa !== 'number') {
      throw new Error('Drive missing package CTC or eligibility cutoff');
    }
  });

  // TEST 4: Student Placement Application (SRV-002)
  await runStep('4. Student Placement Application & Eligibility (SRV-002)', async () => {
    // Create a new distinct test drive to test clean application submission
    const driveRes = await fetch(`${BASE_URL}/services/placements/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        companyName: 'Infosys Special Edition ' + Math.floor(Math.random() * 1000),
        roleTitle: 'Specialist Programmer',
        ctcPackageLPA: 9.5,
        eligibilityCgpa: 7.0,
        driveDate: new Date(),
        registrationDeadline: new Date(Date.now() + 864000000),
      }),
    });
    const driveJson = await driveRes.json();
    const testDriveId = driveJson.data._id;

    const res = await fetch(`${BASE_URL}/services/placements/drives/${testDriveId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ resumeUrl: 'https://spsu.ac.in/resumes/aarav_verma.pdf' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Application submission failed');
    if (json.data.status !== 'Applied') {
      throw new Error(`Expected status Applied, got ${json.data.status}`);
    }
  });

  // TEST 5: Hostel Visitor Check-in & Check-out Register (SRV-003)
  let visitorLogId = null;
  await runStep('5. Hostel & Gate Visitor Register Lifecycle (SRV-003)', async () => {
    // 1. Check-in visitor
    const inRes = await fetch(`${BASE_URL}/services/visitors/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wardenToken}`,
      },
      body: JSON.stringify({
        visitorName: 'Dr. Sunita Sharma',
        phone: '+91 98765 43210',
        relation: 'Academic Guest / Guest Lecturer',
        purpose: 'Keynote lecture on Advanced VLSI Design',
        gateNumber: 'Gate 2 (Academic Complex)',
      }),
    });
    const inJson = await inRes.json();
    if (!inRes.ok) throw new Error(inJson.message || 'Visitor check-in failed');
    if (inJson.data.status !== 'Inside') {
      throw new Error('Visitor status is not Inside');
    }
    visitorLogId = inJson.data._id;

    // 2. Check-out visitor
    const outRes = await fetch(`${BASE_URL}/services/visitors/checkout/${visitorLogId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${wardenToken}` },
    });
    const outJson = await outRes.json();
    if (!outRes.ok) throw new Error(outJson.message || 'Visitor check-out failed');
    if (outJson.data.status !== 'CheckedOut' || !outJson.data.checkOut) {
      throw new Error('Visitor status did not update to CheckedOut with timestamp');
    }
  });

  // TEST 6: Multi-Channel External Notification Dispatch Adapter (SRV-005)
  await runStep('6. Multi-Channel Notification Dispatcher (SRV-005)', async () => {
    const res = await fetch(`${BASE_URL}/services/notifications/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientPhone: '+91 94140 12345',
        recipientEmail: 'student1@spsu.ac.in',
        channel: 'BOTH',
        subject: 'Urgent Campus Advisory: Severe Weather Notice',
        message: 'All evening laboratory sessions will conclude by 5:00 PM today due to heavy rain forecast.',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Notification dispatch failed');
    if (!json.data.dispatched || !json.data.logId) {
      throw new Error('Adapter failed to confirm dispatch');
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
