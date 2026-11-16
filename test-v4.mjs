// SPSU Campus Management System - v4.0 & v3.5 E2E Integration Suite

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
  if (!data.token) throw new Error(`Login failed for ${email}: ${data.message}`);
  return data.token;
}

async function main() {
  console.log('==========================================================');
  console.log('🏛️  SPSU Campus Management System - v4.0 & v3.5 E2E Tests');
  console.log('==========================================================');

  const adminToken = await login('admin@spsu.ac.in', 'Admin@123');
  const studentToken = await login('student1@spsu.ac.in', 'Student@1234');
  const wardenToken = await login('warden.bh2@spsu.ac.in', 'Staff@1234');

  let ticketId = null;
  let sensitiveTicketId = null;
  let noticeId = null;

  // TEST 1: Submit standard grievance ticket (CMP-001, CMP-002, CMP-004)
  await runStep('1. Student Submits Standard Grievance Ticket', async () => {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        category: 'Hostel',
        title: 'Room heater circuit breaker tripping in BH-2 Block B',
        description: 'Circuit breaker trips immediately whenever the room heater is turned on in Room 204.',
        isAnonymous: false,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.ticketNumber) {
      throw new Error(json.message || 'Failed to submit complaint or missing ticketNumber');
    }
    if (json.data.status !== 'Submitted') {
      throw new Error(`Expected status 'Submitted', got ${json.data.status}`);
    }
    ticketId = json.data._id;
    console.log(`\n   [Registered Ticket: ${json.data.ticketNumber}]`);
  });

  // TEST 2: Submit anonymous sensitive grievance (CMP-003, CMP-005, BR-008)
  await runStep('2. Student Submits Anonymous Sensitive Grievance (Ragging / Harassment)', async () => {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        category: 'Ragging / Harassment',
        title: 'Verbal confrontation by senior hostel residents',
        description: 'Observed aggressive verbal harassment of junior students outside dining hall.',
        isAnonymous: true,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.isSensitive) {
      throw new Error('Expected isSensitive to be true for Ragging / Harassment');
    }
    if (json.data.priority !== 'Critical') {
      throw new Error(`Expected priority 'Critical', got ${json.data.priority}`);
    }
    if (!json.data.isAnonymous) {
      throw new Error('Expected isAnonymous to be true');
    }
    sensitiveTicketId = json.data._id;
    console.log(`\n   [Registered Sensitive Ticket: ${json.data.ticketNumber} - Critical]`);
  });

  // TEST 3: Warden Queue Access Restriction on Sensitive Grievances (BR-008)
  await runStep('3. Verify Non-Admin (Warden) Queue Excludes Sensitive Grievance', async () => {
    const res = await fetch(`${BASE_URL}/complaints/queue`, {
      headers: { Authorization: `Bearer ${wardenToken}` },
    });
    const json = await res.json();
    const found = json.data.find((c) => c._id === sensitiveTicketId);
    if (found) {
      throw new Error('Security Violation: Non-Admin warden was able to view sensitive grievance!');
    }
  });

  // TEST 4: Designated Authority (Admin) Can Access Sensitive Grievance with Identity Masked (CMP-003)
  await runStep('4. Admin Queue Access and Submitter Anonymity Masking', async () => {
    const res = await fetch(`${BASE_URL}/complaints/queue?sensitiveOnly=true`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    const target = json.data.find((c) => c._id === sensitiveTicketId);
    if (!target) {
      throw new Error('Admin could not locate sensitive grievance in queue');
    }
    if (target.complainant.name !== 'Anonymous Submitter') {
      throw new Error(`Anonymity breach: expected 'Anonymous Submitter', got '${target.complainant.name}'`);
    }
  });

  // TEST 5: Status Update to Under Review and Add Internal Note (CMP-006, CMP-007)
  await runStep("5. Update Status to 'Under Review' and Add Internal Note", async () => {
    // 5a. Update status
    const statusRes = await fetch(`${BASE_URL}/complaints/${ticketId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wardenToken}`,
      },
      body: JSON.stringify({
        status: 'Under Review',
        comment: 'Warden dispatched electrician',
      }),
    });
    const statusJson = await statusRes.json();
    if (statusJson.data.status !== 'Under Review') {
      throw new Error('Status update to Under Review failed');
    }

    // 5b. Add internal note
    const noteRes = await fetch(`${BASE_URL}/complaints/${ticketId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wardenToken}`,
      },
      body: JSON.stringify({
        text: 'Internal investigation: Replacement 16A breaker ordered from storeroom.',
        isInternal: true,
      }),
    });
    const noteJson = await noteRes.json();
    if (!noteJson.success) {
      throw new Error('Failed to add internal note');
    }
  });

  // TEST 6: Submitter Cannot See Internal Notes (CMP-007)
  await runStep('6. Verify Complainant Is Shielded from Internal Staff Notes', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${ticketId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const json = await res.json();
    const internalNotes = (json.data.notes || []).filter((n) => n.isInternal);
    if (internalNotes.length > 0) {
      throw new Error('Security breach: Student was able to view internal staff notes!');
    }
  });

  // TEST 7: Resolving Grievance Requires Mandatory Resolution Note (CMP-008)
  await runStep('7. Enforce Mandatory Resolution Note on Closure (CMP-008)', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${ticketId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wardenToken}`,
      },
      body: JSON.stringify({
        status: 'Resolved',
        resolutionNote: '',
      }),
    });
    if (res.ok) {
      throw new Error('Validation failure: System allowed resolution without a mandatory resolution note');
    }
  });

  // TEST 8: Successful Resolution with Resolution Note
  await runStep('8. Resolve Grievance With Full Resolution Note', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${ticketId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wardenToken}`,
      },
      body: JSON.stringify({
        status: 'Resolved',
        resolutionNote: 'Electrician replaced the faulty 16A miniature circuit breaker. Tested with load up to 2000W.',
        comment: 'Work completed and verified',
      }),
    });
    const json = await res.json();
    if (!json.success || json.data.status !== 'Resolved') {
      throw new Error(json.message || "Expected status 'Resolved'");
    }
    if (!json.data.resolutionNote) {
      throw new Error('Missing resolutionNote on resolved complaint');
    }
  });

  // TEST 9: Publish Campus Notice with Urgent and Pinned Flags (COM-001, COM-008)
  await runStep('9. Admin Publishes Urgent Pinned Announcement', async () => {
    const res = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Severe Weather Alert - Academic Buildings Close Early Today',
        body: 'Heavy rainfall predicted in Udaipur district. All laboratory sessions and evening classes after 4:00 PM are suspended.',
        priority: 'Urgent',
        isPinned: true,
        targetAudience: {
          roles: ['STUDENT', 'FACULTY'],
        },
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data._id) {
      throw new Error(json.message || 'Failed to publish notice');
    }
    noticeId = json.data._id;
    if (!json.data.isPinned) {
      throw new Error('Notice should be pinned');
    }
  });

  // TEST 10: In-App Notifications Verification and Mark as Read (COM-004, COM-006)
  await runStep('10. In-App Notification Delivery and Mark Read Lifecycle', async () => {
    // 10a. Fetch notifications
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const json = await res.json();
    if (!json.data || json.data.length === 0) {
      throw new Error('Student has no in-app notifications');
    }
    const notif = json.data[0];

    // 10b. Mark single notification as read
    const markRes = await fetch(`${BASE_URL}/notifications/${notif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markJson = await markRes.json();
    if (!markJson.success || !markJson.data.isRead) {
      throw new Error('Failed to mark notification as read');
    }

    // 10c. Mark all notifications as read
    const allRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const allJson = await allRes.json();
    if (!allJson.success) {
      throw new Error('Failed to mark all notifications as read');
    }
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
