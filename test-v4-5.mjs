// SPSU Campus Management System - v4.5 Hardening & Compliance Test Suite

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
  return { status: res.status, data };
}

async function main() {
  console.log('==========================================================');
  console.log('🏛️  SPSU CMS - v4.5 Hardening & Compliance Integration Tests');
  console.log('==========================================================');

  const adminLogin = await login('admin@spsu.ac.in', 'Admin@123');
  const adminToken = adminLogin.data.token;
  if (!adminToken) throw new Error('Admin login failed');

  // TEST 1: Password Change Workflow (HRD-006)
  await runStep('1. Change Password Workflow (HRD-006)', async () => {
    const studentLogin = await login('student1@spsu.ac.in', 'Student@1234');
    const studentToken = studentLogin.data.token;

    // Change to new password
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'Student@1234',
        newPassword: 'Student@Updated123',
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Change password failed');

    // Verify login with updated password
    const loginTest = await login('student1@spsu.ac.in', 'Student@Updated123');
    if (loginTest.status !== 200) throw new Error('Failed to login with updated password');

    // Revert back for consistency
    await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginTest.data.token}`,
      },
      body: JSON.stringify({
        currentPassword: 'Student@Updated123',
        newPassword: 'Student@1234',
      }),
    });
  });

  // TEST 2: Password Reset Token Workflow (HRD-006)
  await runStep('2. Password Reset Token Workflow (HRD-006)', async () => {
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student1@spsu.ac.in' }),
    });
    const forgotJson = await forgotRes.json();
    if (!forgotJson.resetToken) throw new Error('Reset token was not generated');

    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: forgotJson.resetToken,
        newPassword: 'Student@1234',
      }),
    });
    const resetJson = await resetRes.json();
    if (!resetJson.success) throw new Error(resetJson.message || 'Reset password failed');
  });

  // TEST 3: Account Lockout Guard after 5 Failed Attempts (NFR-004)
  await runStep('3. Account Lockout After 5 Failed Login Attempts (NFR-004)', async () => {
    // Attempt 5 bad logins on parent account
    let lastStatus = 0;
    for (let i = 1; i <= 5; i++) {
      const res = await login('parent1@gmail.com', 'WrongPass999!');
      lastStatus = res.status;
    }
    if (lastStatus !== 429) {
      throw new Error(`Expected HTTP 429 Account Locked, got ${lastStatus}`);
    }

    // Next attempt should also be 429
    const blocked = await login('parent1@gmail.com', 'Parent@1234');
    if (blocked.status !== 429) {
      throw new Error(`Account should be locked, but got status ${blocked.status}`);
    }
    console.log('\n   [Verified account lockout 429 response]');
  });

  // TEST 4: Student Activation / Deactivation Soft-Delete (HRD-002, SH-005)
  let testStudentId = null;
  await runStep('4. Student Activation / Deactivation Soft-Delete (HRD-002)', async () => {
    const studentsRes = await fetch(`${BASE_URL}/students?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentsData = await studentsRes.json();
    const student = studentsData.data[0];
    testStudentId = student._id;

    // Toggle to Inactive
    const deactRes = await fetch(`${BASE_URL}/students/${testStudentId}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deactJson = await deactRes.json();
    if (deactJson.data.isActive !== false) throw new Error('Student should be inactive');

    // Toggle back to Active
    const actRes = await fetch(`${BASE_URL}/students/${testStudentId}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const actJson = await actRes.json();
    if (actJson.data.isActive !== true) throw new Error('Student should be active');
  });

  // TEST 5: Staff Activation / Deactivation Soft-Delete (HRD-002)
  let testStaffId = null;
  await runStep('5. Staff Activation / Deactivation Soft-Delete (HRD-002)', async () => {
    const staffRes = await fetch(`${BASE_URL}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const staffData = await staffRes.json();
    const staff = staffData.data.find((s) => s.user?.role !== 'ADMIN') || staffData.data[0];
    testStaffId = staff._id;

    // Toggle status
    const toggleRes = await fetch(`${BASE_URL}/staff/${testStaffId}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const toggleJson = await toggleRes.json();
    if (!toggleJson.success) throw new Error('Failed to toggle staff status');

    // Toggle back
    await fetch(`${BASE_URL}/staff/${testStaffId}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  // TEST 6: Staff Bulk Export (SIS-007)
  await runStep('6. Staff Directory Export to Excel (SIS-007)', async () => {
    const res = await fetch(`${BASE_URL}/staff/export`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Staff export failed with status ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 500) throw new Error('Exported buffer is empty');
  });

  // TEST 7: Central Audit Log Querying (HRD-001, SH-006)
  await runStep('7. Central Audit Trail Recording and Inspection (HRD-001)', async () => {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success || json.count === 0) {
      throw new Error('No audit log entries recorded');
    }
    console.log(`\n   [Found ${json.count} recorded audit trail events in system]`);
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
