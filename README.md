# 🏛️ SPSU Campus Management System (v7.0 Complete Enterprise Suite)

![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript_%7C_Vite-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_%7C_Express_%7C_TypeScript-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_%7C_Mongoose-47A248?logo=mongodb)
![PWA Ready](https://img.shields.io/badge/PWA-Installable_%7C_Mobile_Ready-5A0FC8?logo=pwa)

Full-featured, role-governed Campus Management & Academic Operating System for **Sir Padampat Singhania University (SPSU), Udaipur** (A JK Cement Initiative).

> 💡 **Looking for the user guide?** Read the detailed [**SYSTEM_DOCUMENTATION.md**](SYSTEM_DOCUMENTATION.md) for role-by-role workflows, screenshots, and business rules.

---

## 📋 Table of Contents

- [Platform Overview](#-platform-overview)
- [Official SPSU Visual Branding](#-official-spsu-visual-branding)
- [7 Role-Based User Portals](#-7-role-based-user-portals)
- [Complete Architecture & Release Roadmap (v1.0 – v7.0)](#-complete-architecture--release-roadmap-v10--v70)
  - [v1.0: Student & Staff Information System (SIS)](#v10-student--staff-information-system-sis)
  - [v2.0: Leave Management & Hierarchy Approval Engine](#v20-leave-management--hierarchy-approval-engine)
  - [v3.0: Campus Life, Events & Gate Passes](#v30-campus-life-events--gate-passes)
  - [v3.5: Grievance Redressal & Anti-Ragging Escrow](#v35-grievance-redressal--anti-ragging-escrow)
  - [v4.0: Campus Notice Board & Unified Notification Hub](#v40-campus-notice-board--unified-notification-hub)
  - [v4.5: Hardening, Security, Audit Logs & Account Protection](#v45-hardening-security-audit-logs--account-protection)
  - [v5.0: Attendance Management & Timetable Clash Detection](#v50-attendance-management--timetable-clash-detection)
  - [v5.5: Academics, UGC Grading, SGPA/CGPA & Verifiable Digital ID](#v55-academics-ugc-grading-sggacgpa--verifiable-digital-id)
  - [v6.0: AI Insights, Dropout Early Warning & Campus Assistant](#v60-ai-insights-dropout-early-warning--campus-assistant)
  - [v6.5: AI Workflow Automation (NLP & Anomaly Detection)](#v65-ai-workflow-automation-nlp--anomaly-detection)
  - [v7.0: Campus Services (Library, Placements, Visitor Gate Logs & PWA)](#v70-campus-services-library-placements-visitor-gate-logs--pwa)
- [API Architecture & Endpoints](#-api-architecture--endpoints)
- [Quick Start & Setup](#-quick-start--setup)
- [Verification & Automated Test Suites (88/88 PASS)](#-verification--automated-test-suites-8888-pass)

---

## 🏛️ Platform Overview

The SPSU Campus Management System delivers an authoritative, unified campus operating system spanning:
1. **Academics & Analytics**: Class scheduling, clash-free timetables, daily attendance with leave waiver protection, continuous evaluation marks entry, automated UGC/AICTE letter grading, and verifiable Digital Student ID Cards with QR signatures.
2. **Residential & Campus Life**: Boys (BH1–BH4) and Girls (GH1–GH3) hostel management, outstation night gate passes with dual Warden & Parent sign-off, guest visitor registers, and campus event reservations.
3. **Pastoral Care & AI Intelligence**: Dropout and academic risk early warning indices, mentor "Needs Attention" intervention lists, safe advisory-only guardrails, in-app conversational assistant, and NLP anti-ragging auto-escalation.
4. **Campus Services**: Central library lending with overdue fine calculation, training & placement corporate drives with automated CGPA eligibility checks, and installable PWA mobile readiness.

---

## 🎨 Official SPSU Visual Branding

| Color Element | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary Brand Blue** | `#0057B8` | Top navbar, active tabs, primary action buttons |
| **Secondary Blue** | `#0076CE` | Secondary accents, interactive hover states |
| **Dark Navy** | `#0B2545` | Sidebar background, primary typography headings |
| **Light Blue Accent** | `#EAF4FF` | Selected navigation items, badge backgrounds |
| **Background Neutral** | `#F7F9FC` | Application body background |
| **Card Surface** | `#FFFFFF` | Container cards, tables, modal surfaces |

---

## 🔐 7 Role-Based User Portals

| Role | Default Demo Email | Password | Scope & Key Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@spsu.ac.in` | `Admin@123` | Full ERP control: Student & Staff CRUD, bulk Excel ingestion, audit trails, leave administration, timetable scheduling, placement drives, and sensitive grievance handling. |
| **STUDENT** | `student1@spsu.ac.in` | `Student@1234` | Timetable schedule, subject attendance progress, marksheet grade cards, verifiable digital ID card, leave requests, gate passes, campus assistant, library book loans, and placement applications. |
| **FACULTY** | `faculty1@spsu.ac.in` | `Staff@1234` | Section roll-call attendance, continuous marks entry, student directory, event publishing, and leave approval queue. |
| **MENTOR** | `mentor.cse@spsu.ac.in` | `Staff@1234` | Assigned mentees roster, **AI Early Warning Needs Attention list**, academic counseling notes, and mentee leave queue. |
| **WARDEN** | `warden.bh2@spsu.ac.in` | `Staff@1234` | Hostel resident roster, night gate pass reviews, leave approvals queue, and **Hostel Gate Visitor Registers**. |
| **HOD** | `hod.cse@spsu.ac.in` | `Staff@1234` | Department faculty roster, **Department Academic Analytics**, curriculum review, timetable management, and department leave authorizations. |
| **PARENT** | `parent1@gmail.com` | `Parent@1234` | Direct visibility into child attendance progress, SGPA/CGPA grade sheets, and mandatory night outstation gate-pass sign-offs. |

---

## ⚡ Complete Architecture & Release Roadmap (v1.0 – v7.0)

### v1.0: Student & Staff Information System (SIS)
- Central identity management for enrollment numbers, roll numbers, branches (CSE, ECE, ME, Civil), semesters, and sections.
- Hostel allocations across BH1–BH4 and GH1–GH3 with room assignments.
- Bulk Excel ingestion service with pre-validation and transactional commit.

### v2.0: Leave Management & Hierarchy Approval Engine
- Multi-day leave applications with date-order validation and duplicate prevention.
- Sequential hierarchical routing: Mentor ➔ Warden ➔ HOD.
- Dynamic annual quota deduction with cancellation and rollback support.

### v3.0: Campus Life, Events & Gate Passes
- Events catalog with capacity-limited RSVP slots and attendee Excel export.
- Day and night outing gate passes with **dual Warden & Parent sign-off**.
- **Leave Overlap Conflict Detection (`PER-005`)**: Auto-blocks gate passes during active leaves.

### v3.5: Grievance Redressal & Anti-Ragging Escrow
- Unique tracking tickets (`GRV-YYYY-XXXX`) across Academic, Hostel, Mess, Infrastructure, and Ragging.
- Anonymous reporting option masking identity from department handlers.
- Mandatory closing remarks before resolving any grievance.

### v4.0: Campus Notice Board & Unified Notification Hub
- Audience-targeted notices filtered by roles, departments, hostels, and semesters.
- Interactive notification bell in top navigation with live unread counter.

### v4.5: Hardening, Security, Audit Logs & Account Protection
- **Comprehensive Audit Trail (`HRD-001`)**: Detailed state change logs across sensitive actions.
- **Soft Deactivation (`HRD-002`)**: Preserves historical data integrity for graduated students and former staff.
- **Account Lockout (`NFR-004`)**: Locks user accounts after 5 consecutive failed attempts (HTTP 429).
- **Multi-Role Authorization (`SH-003`)**: Allows staff to hold secondary roles without multiple accounts.

### v5.0: Attendance Management & Timetable Clash Detection
- Subject timetable scheduler with **anti-clash validation (`ATT-005`)** preventing room or faculty double-booking.
- Section roll-call attendance interface with visual progress bars.
- **Approved Leave Waiver Integration (`ATT-007`)**: Students on approved university leave are automatically excused (`OnLeave`) from absence penalties.

### v5.5: Academics, UGC Grading, SGPA/CGPA & Verifiable Digital ID
- Continuous evaluation marks entry (Internal, Mid-Term, End-Term).
- UGC/AICTE 10-point scale grade conversion (`O`, `A+`, `A`, `B+`, `B`, `C`, `F`) and auto-computed SGPA/CGPA.
- HOD Department Analytics Dashboard with merit grade distribution and residential ratios.
- **Verifiable Digital Student ID Card (`ACD-005`)**: Live ID card featuring photo, blood group, emergency contact, and signed QR verification URL.

### v6.0: AI Insights, Dropout Early Warning & Campus Assistant
- **AI Student Early Warning Index (`AI-001`)**: Evaluates attendance dips (< 75%), CGPA drops, backlogs, and unexcused leaves (score 0–100).
- **Mentor "Needs Attention" List (`AI-002`, `AI-003`)**: Plain-English factor explanations and recommended intervention steps.
- **Strict Advisory-Only Guarantee (`AI-007`)**: Every payload enforces `isAdvisory: true` and the required pastoral care disclaimer.
- **Campus AI Assistant (`AI-004`, `AI-005`)**: Safe conversational assistant for curfew, mess, rules, and student attendance progress.
- **Privacy Guardrail (`AI-006`)**: Blocks cross-student data leakage and system secrets.

### v6.5: AI Workflow Automation (NLP & Anomaly Detection)
- **NLP Complaint Classifier (`AIW-001`)**: Auto-suggests category, priority, and routing.
- **Smart Anti-Ragging Escrow (`AIW-002`)**: Auto-flags hazing keywords and escalates priority to Critical.
- **Leave Pattern Anomaly Detector (`AIW-004`)**: Detects habitual Friday-Monday patterns and pre-exam absence clusters.
- **Natural Language Directory Search (`AIW-005`)**: Query students using natural phrases.
- **Bilingual Notice Drafter (`AIW-006`)**: Generates official notices with authentic Hindi translations.

### v7.0: Campus Services (Library, Placements, Visitor Gate Logs & PWA)
- **Central Library Management (`SRV-001`)**: Book catalog, live stack locations, 14-day loans, and overdue fine calculation (₹5/day).
- **Training & Placement Cell (`SRV-002`)**: Campus recruitment drives, CTC packages, automated CGPA eligibility checks, and student applications.
- **Hostel Visitor & Gate Register (`SRV-003`)**: Security gate register tracking visitor check-in, hostee verification, and check-out logs.
- **Progressive Web App (PWA) (`SRV-004`)**: Mobile web manifest (`manifest.json`) and offline asset caching.
- **Multi-Channel Dispatch Adapter (`SRV-005`)**: Simulated email/SMS broadcast logs.

---

## 🌐 API Architecture & Endpoints

| Group | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | JWT Authentication & Lockout Check |
| **Auth** | `POST` | `/api/auth/change-password` | Change Password Workflow |
| **Auth** | `POST` | `/api/auth/forgot-password` | Issue Password Reset Token |
| **Admin** | `GET` | `/api/admin/audit-logs` | Retrieve Central Compliance Audit Trail |
| **Attendance** | `POST` | `/api/attendance/timetable` | Schedule Section Timetable (Clash Protected) |
| **Attendance** | `POST` | `/api/attendance/mark` | Roll-Call Attendance Entry (Leave Excused) |
| **Attendance** | `GET` | `/api/attendance/my` | Student Cumulative & Subject Breakdown |
| **Academics** | `POST` | `/api/academics/marks` | Record Marks, Auto-Grade, Compute SGPA/CGPA |
| **Academics** | `GET` | `/api/academics/my-results` | Student Semester Results History |
| **Academics** | `GET` | `/api/academics/my-id-card` | Generate Digital Student ID Card with QR |
| **Academics** | `GET` | `/api/academics/verify-id/:id` | Public Security ID Card QR Verification |
| **AI Insights** | `GET` | `/api/ai/risk/mentees` | Mentor Ranked "Needs Attention" List |
| **AI Insights** | `POST` | `/api/ai/chat` | Campus AI Assistant (Knowledge Base + Context) |
| **AI Automation**| `POST` | `/api/ai/workflow/classify-complaint` | NLP Category & Anti-Ragging Escrow |
| **AI Automation**| `GET` | `/api/ai/workflow/leave-anomalies/:id` | Analyze Leave History for Irregularities |
| **AI Automation**| `POST` | `/api/ai/workflow/natural-search` | Natural Language Query to MongoDB Filter |
| **AI Automation**| `POST` | `/api/ai/workflow/draft-notice` | Circular Drafting with Bilingual Hindi Output |
| **Services** | `GET` | `/api/services/library/books` | Search Central Library Catalog |
| **Services** | `POST` | `/api/services/library/issue` | Issue Book & Decrement Stock |
| **Services** | `POST` | `/api/services/library/return/:id` | Return Book & Calculate Overdue Fines |
| **Services** | `GET` | `/api/services/placements/drives` | Placement Drives Catalog & CTC Packages |
| **Services** | `POST` | `/api/services/placements/drives/:id/apply` | Student Application (CGPA Verified) |
| **Services** | `GET` | `/api/services/visitors` | Hostel Gate Visitor Register |
| **Services** | `POST` | `/api/services/visitors/checkin` | Record Visitor Gate Entry |
| **Services** | `POST` | `/api/services/visitors/checkout/:id` | Confirm Visitor Gate Departure |

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **MongoDB** (`mongodb://127.0.0.1:27017` or in-memory fallback)

### 1. Backend Server Setup
```powershell
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with automated database seeding.*

### 2. Frontend Client Setup
```powershell
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Verification & Automated Test Suites (88/88 PASS)

Execute the complete end-to-end test verification suites:

```powershell
# 1. v1.0 SIS & 7-Role Suite (22/22 Passing)
powershell -ExecutionPolicy Bypass -File test-e2e.ps1

# 2. v2.0 Multi-Tier Leave Management Suite (10/10 Passing)
powershell -ExecutionPolicy Bypass -File test-v2-leaves.ps1

# 3. v3.0 Events & Outing Gate Passes Suite (10/10 Passing)
powershell -ExecutionPolicy Bypass -File test-v3-events-permissions.ps1

# 4. v3.5 & v4.0 Grievances, Notices & Unified Alerts (10/10 Passing)
node test-v4.mjs

# 5. v4.5 Hardening, Audit Logs & Account Protection (7/7 Passing)
node test-v4-5.mjs

# 6. v5.0 Attendance & Timetable Clash Detection (6/6 Passing)
node test-v5.mjs

# 7. v5.5 Academics, UGC Grading & Verifiable QR ID Card (6/6 Passing)
node test-v5-5.mjs

# 8. v6.0 AI Early Warning & Campus AI Assistant (6/6 Passing)
node test-v6.mjs

# 9. v6.5 AI Workflow Automation & NLP Escrow (5/5 Passing)
node test-v6-5.mjs

# 10. v7.0 Campus Services (Library, Placements & Gate Logs) (6/6 Passing)
node test-v7.mjs
```

**Total Automated Test Coverage: 88 / 88 Tests Passing (100% Pass Rate)**
