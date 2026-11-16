# 🏛️ SPSU Campus Management System (v4.0 — Complete Campus Enterprise Suite)

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript_%7C_Vite-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_%7C_Express_%7C_TypeScript-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_%7C_Mongoose-47A248?logo=mongodb)
![Redis](https://img.shields.io/badge/Cache-Redis_with_Fallback-DC382D?logo=redis)

Production-ready, multi-tenant Campus Management System for **Sir Padampat Singhania University (SPSU), Udaipur** (A JK Cement Initiative).

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Official SPSU Visual Identity](#-official-spsu-visual-identity)
- [Technology Stack](#-technology-stack)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Release Architecture & Modules](#-release-architecture--modules)
  - [v1.0 — Student Information System (SIS)](#v10--student-information-system-sis)
  - [v2.0 — Leave Management & Approval Engine](#v20--leave-management--approval-engine)
  - [v3.0 — Event & Permission Management (Gate Passes)](#v30--event--permission-management-gate-passes)
  - [v3.5 — Grievance Redressal & Ticket Management](#v35--grievance-redressal--ticket-management)
  - [v4.0 — Campus Notice Board & Unified In-App Notifications](#v40--campus-notice-board--unified-in-app-notifications)
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Quick Start & Setup Guide](#-quick-start--setup-guide)
- [Verification & E2E Test Suites](#-verification--e2e-test-suites)

---

## 🏛️ Executive Summary

The SPSU Campus Management System delivers an authoritative, unified campus operating system spanning:
1. **Release v1.0 — Student Information System (SIS)**: Central identity foundation for students, faculty records, parent accounts, academic tracking, hostel room assignments, mentor-mentee mapping, and departmental hierarchy across **7 user roles**.
2. **Release v2.0 — Leave Management & Approval Engine**: Student & staff leave applications, date-order and overlap validation, multi-stage approval routing using SIS reporting relationships, decision recording with audit trails, and annual quota balance tracking.
3. **Release v3.0 — Event & Permission Management (Gate Passes)**: Campus-wide event publishing, audience targeting, capacity-limited RSVPs, participant roster export, outing and gate-pass workflows with **dual Warden and Parent sign-off**, and automated **Leave Overlap Conflict Detection**.
4. **Release v3.5 — Grievance & Complaint Redressal Portal**: Transparent ticket registration (`GRV-YYYY-XXXX`), anonymous reporting option, zero-tolerance anti-ragging routing to Designated Authority, internal staff notes, and mandatory resolution justification.
5. **Release v4.0 — Communication & Notice Board**: Target-filtered campus circulars, pinned urgent announcements, and automated in-app real-time notification delivery across student and staff dashboards.

---

## 🎨 Official SPSU Visual Identity

| Color Element | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary Brand Blue** | `#0057B8` | Top navbar, active tabs, primary call-to-action buttons |
| **Secondary Blue** | `#0076CE` | Secondary accents, interactive hover states |
| **Dark Navy** | `#0B2545` | Sidebar background, primary typography headings |
| **Light Blue Accent** | `#EAF4FF` | Selected navigation items, badge backgrounds |
| **Background Neutral** | `#F7F9FC` | Application body background |
| **Card Surface** | `#FFFFFF` | Container cards, tables, modal surfaces |

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Email | Password | Scope & Key Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@spsu.ac.in` | `Admin@123` | Full CMS access: Student & Staff CRUD, batch CSV/Excel import/export, leave policies, event publishing, grievance desk, notice board, sensitive complaint designated authority. |
| **STUDENT** | `student1@spsu.ac.in` | `Student@1234` | Academic profile, hostel room, assigned mentor, leave applications, gate pass requests, event RSVP, grievance filing (with anonymous option), campus notices. |
| **FACULTY** | `faculty1@spsu.ac.in` | `Staff@1234` | Faculty dashboard, event publishing, participant exports, student directory access, leave queue, grievance desk, notice board. |
| **MENTOR** | `mentor.cse@spsu.ac.in` | `Staff@1234` | Mentor dashboard, assigned mentees, mentee leave approvals queue, progress overview, grievance desk. |
| **WARDEN** | `warden.bh2@spsu.ac.in` | `Staff@1234` | Warden dashboard, resident directory, hostel leave approvals, resident outing gate pass review, grievance resolution. |
| **HOD** | `hod.cse@spsu.ac.in` | `Staff@1234` | Head of Department overview, faculty roster, student directory, event publishing, department leave approvals, grievance desk. |
| **PARENT** | `parent1@gmail.com` | `Parent@1234` | Parent portal, linked child profile overview, academic placement, overnight outing pass sign-off authorization, campus notices. |

---

## ⚡ Release Architecture & Modules

### v1.0 — Student Information System (SIS)
- 👤 **Student Identity Management**: Enrollment numbers, roll numbers, academic programs, branches, semesters, sections, CGPA, and admission years.
- 🏢 **Hostel & Residential Allocation**: Tracking of Boys Hostels (BH1–BH4) and Girls Hostels (GH1–GH3), room numbers, and warden mappings.
- 🤝 **Mentorship Mapping**: Faculty mentors assigned to cohorts with automatic hierarchical routing.
- 📊 **Bulk Excel/CSV Ingestion**: Auto-mapped bulk file uploads with field validation and rollback safety.

### v2.0 — Leave Management & Approval Engine
- 📅 **Application Engine**: Multi-day leave requests, start/end date validation, and overlap checks (`LEV-002`).
- 🔄 **SIS Hierarchy Routing**: Mentors for academic leaves, Wardens for hostel leaves, HODs for departmental leaves.
- ⚖️ **Dynamic Balances**: Annual quota deduction upon approval, pending lock, and return handling (`LEV-008`).
- 📜 **Audit Trail**: Every state transition stamped with actor, timestamp, and comments (`SH-006`).

### v3.0 — Event & Permission Management (Gate Passes)
- 🎪 **Campus Events Catalog**: Targeted event publishing with department, semester, and role filters (`EVT-001`).
- 🎟️ **Capacity RSVPs**: Instant seat reservations with waitlist prevention (`EVT-004`).
- 📄 **Participant Roster Export**: Formatted Excel export for event attendance tracking (`EVT-006`).
- 🚪 **Gate Pass & Outings**: Day passes, night passes, and emergency outings with emergency contact verification (`PER-001`).
- 👨‍👩‍👦 **Dual Warden & Parent Sign-Off**: Mandatory two-stage approval workflow (`PER-003`).
- ⚠️ **Leave Overlap Conflict Detection**: Automatic cross-check against approved leave requests (`PER-005`, `BR-005`).

### v3.5 — Grievance Redressal & Ticket Management
- 📬 **Ticket Registration**: Sequential human-readable ticket numbers (`GRV-YYYY-XXXX`) (`CMP-002`).
- 🕵️ **Anonymous Option**: Complainant identity masked from departmental handlers (`CMP-003`).
- 🚨 **Zero-Tolerance Anti-Ragging Escalate**: Automatic `Critical` priority and direct routing to Designated Authority (`CMP-005`, `BR-008`).
- 🔒 **Internal Staff Notes**: Staff can post internal investigation notes invisible to students (`CMP-007`).
- ✍️ **Mandatory Resolution Note**: Required justification for closing tickets (`CMP-008`).

### v4.0 — Campus Notice Board & Unified In-App Notifications
- 📢 **Targeted Circulars**: Filtered by audience roles, departments, hostels, and semesters (`COM-002`).
- 📌 **Pinned Urgent Notices**: Pinned at the top of notice boards with urgent highlights (`COM-008`).
- 🔔 **Interactive Notification Drawer**: Real-time bell in top navbar with unread badge counter (`COM-006`).
- ⚡ **Automated Event Notifications**: Triggered on leave approval, gate pass sign-off, grievance resolution, and urgent announcements (`COM-004`).

---

## 🌐 API Endpoint Documentation

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user session |
| `GET` | `/api/students` | Admin, Staff | Retrieve student directory |
| `POST` | `/api/students/import` | Admin | Bulk Excel/CSV student upload |
| `GET` | `/api/leaves/types` | Authenticated | List configured leave types |
| `POST` | `/api/leaves` | Student, Staff | Submit leave application |
| `GET` | `/api/leaves/pending` | Approvers | View approver queue |
| `POST` | `/api/leaves/:id/review` | Approvers | Approve, reject, or return leave |
| `GET` | `/api/events` | Authenticated | List campus events |
| `POST` | `/api/events/:id/rsvp` | Authenticated | RSVP for an event |
| `POST` | `/api/permissions` | Student | Submit outing/gate pass request |
| `PUT` | `/api/permissions/:id/warden-signoff` | Warden, Admin | Hostel warden gate pass review |
| `PUT` | `/api/permissions/:id/parent-signoff` | Parent | Parent outing sign-off |
| `POST` | `/api/complaints` | Authenticated | Submit grievance ticket |
| `GET` | `/api/complaints/my` | Authenticated | View submitted grievances |
| `GET` | `/api/complaints/queue` | Handlers, Admin | Review grievance queues (Sensitive restricted to Admin) |
| `PUT` | `/api/complaints/:id/status` | Handlers, Admin | Update status with resolution note |
| `POST` | `/api/complaints/:id/notes` | Authenticated | Add communication or internal note |
| `GET` | `/api/notices` | Authenticated | Fetch targeted campus notices |
| `POST` | `/api/notices` | Admin, Faculty, Warden, HOD | Publish campus notice |
| `GET` | `/api/notifications` | Authenticated | Retrieve user notifications & unread count |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |

---

## 🚀 Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **MongoDB** (local `mongodb://127.0.0.1:27017` or automatic in-memory fallback)
- **Redis** (optional; in-memory fallback enabled automatically)

### 2. Backend Server Setup
```powershell
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with auto-seeding on empty database.*

### 3. Frontend Client Setup
```powershell
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Verification & E2E Test Suites

Run the end-to-end test suites covering all modules:

```powershell
# 1. v1.0 SIS Integration Suite (22/22 Tests Passing)
powershell -ExecutionPolicy Bypass -File test-e2e.ps1

# 2. v2.0 Leave Management Suite (10/10 Tests Passing)
powershell -ExecutionPolicy Bypass -File test-v2-leaves.ps1

# 3. v3.0 Events & Permissions Suite (10/10 Tests Passing)
powershell -ExecutionPolicy Bypass -File test-v3-events-permissions.ps1

# 4. v3.5 & v4.0 Grievance Redressal & Notices Suite (10/10 Tests Passing)
node test-v4.mjs
```

**Total Passing Test Coverage: 52 / 52 Tests Passing (100% Pass Rate)**
