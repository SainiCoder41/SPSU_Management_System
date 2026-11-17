// SPSU Campus Management System - v6.5 AI Workflow Automation Test Suite

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
  console.log('🏛️  SPSU CMS - v6.5 AI Workflow Automation Tests');
  console.log('==========================================================');

  const adminToken = await login('admin@spsu.ac.in', 'Admin@123');
  const studentToken = await login('student1@spsu.ac.in', 'Student@1234');
  const wardenToken = await login('warden.bh2@spsu.ac.in', 'Staff@1234');

  // TEST 1: NLP Complaint Classifier - Normal Maintenance Complaint (AIW-001)
  await runStep('1. NLP Complaint Classifier - Mess Food Issue (AIW-001)', async () => {
    const res = await fetch(`${BASE_URL}/ai/workflow/classify-complaint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Mess food quality issue',
        description: 'Dinner meal served cold and stale in hostel dining hall',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Classification request failed');
    if (json.data.suggestedCategory !== 'Mess') {
      throw new Error(`Expected category 'Mess', got '${json.data.suggestedCategory}'`);
    }
    if (json.data.suggestedAssigneeRole !== 'WARDEN') {
      throw new Error(`Expected assignee 'WARDEN', got '${json.data.suggestedAssigneeRole}'`);
    }
  });

  // TEST 2: Smart Anti-Ragging NLP Auto-Detection (AIW-002)
  await runStep('2. Smart Anti-Ragging NLP Auto-Detection (AIW-002)', async () => {
    const res = await fetch(`${BASE_URL}/ai/workflow/classify-complaint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Incident in hostel corridor',
        description: 'A group of seniors forced juniors and threatened them with physical abuse at night',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Ragging NLP check failed');
    if (!json.data.isRaggingSuspected) {
      throw new Error('Anti-ragging detector failed to suspect ragging incident');
    }
    if (json.data.suggestedPriority !== 'Critical') {
      throw new Error(`Expected Critical priority, got '${json.data.suggestedPriority}'`);
    }
    if (!json.data.raggingKeywordsFound || json.data.raggingKeywordsFound.length === 0) {
      throw new Error('Anti-ragging detector did not return detected keywords');
    }
  });

  // TEST 3: Leave Pattern Anomaly Detector (AIW-004)
  await runStep('3. Leave Pattern Anomaly Detector (AIW-004)', async () => {
    // Get student profile
    const studentsRes = await fetch(`${BASE_URL}/students?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentsJson = await studentsRes.json();
    const student = studentsJson.data[0];

    const res = await fetch(`${BASE_URL}/ai/workflow/leave-anomalies/${student._id}`, {
      headers: { Authorization: `Bearer ${wardenToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Leave anomaly check failed');
    if (!json.data || !json.data.recommendation) {
      throw new Error('Missing anomaly report recommendation');
    }
    if (!Array.isArray(json.data.anomaliesDetected)) {
      throw new Error('Missing anomaliesDetected list');
    }
  });

  // TEST 4: Natural Language Directory Search (AIW-005)
  await runStep('4. Natural Language Directory Search (AIW-005)', async () => {
    const res = await fetch(`${BASE_URL}/ai/workflow/natural-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        query: '4th semester CSE students with cgpa > 8',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Natural search query failed');
    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('Natural language search returned no matching students');
    }
    const found = json.data[0];
    if (found.semester !== 4) {
      throw new Error(`Filter mismatch: expected semester 4, got ${found.semester}`);
    }
  });

  // TEST 5: Campus Notice Drafting & Bilingual Hindi Translation (AIW-006)
  await runStep('5. Notice Drafting & Bilingual Hindi Translation (AIW-006)', async () => {
    const res = await fetch(`${BASE_URL}/ai/workflow/draft-notice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Hostel Curfew & Attendance Strict Adherence',
        bulletPoints: [
          'Mandatory hostel curfew at 9:30 PM strictly enforced',
          'Minimum 75% attendance mandatory for semester end examination',
        ],
        category: 'Discipline',
        targetAudience: 'Hostel Residents & Day Scholars',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Notice draft failed');
    if (!json.data.englishNotice || !json.data.hindiNotice) {
      throw new Error('Missing bilingual notice output');
    }
    if (!json.data.hindiNotice.body.includes('विश्वविद्यालय') && !json.data.hindiNotice.title.includes('सूचना')) {
      throw new Error('Hindi translation payload missing authentic Hindi script');
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
