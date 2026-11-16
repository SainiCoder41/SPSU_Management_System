# 🏛️ SPSU Campus Management System (v3.0 — SIS, Leaves, Events & Permissions)

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
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
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Quick Start & Setup Guide](#-quick-start--setup-guide)
- [Verification & Build Commands](#-verification--build-commands)
- [Future System Roadmap (v3.5 - v4.0)](#-future-system-roadmap-v35---v40)

---

## 🏛️ Executive Summary

The SPSU Campus Management System delivers an authoritative, unified campus operating system spanning:
1. **Release v1.0 — Student Information System (SIS)**: Central identity foundation for students, faculty records, parent accounts, academic tracking, hostel room assignments, mentor-mentee mapping, and departmental hierarchy across **7 user roles**.
2. **Release v2.0 — Leave Management & Approval Engine**: Student & staff leave applications, date-order and overlap validation, multi-stage approval routing using SIS reporting relationships, decision recording with audit trails, and annual quota balance tracking.
3. **Release v3.0 — Event & Permission Management (Gate Passes)**: Campus-wide event publishing, audience targeting, capacity-limited RSVPs, participant roster export, outing and gate-pass workflows with **dual Warden and Parent sign-off**, and automated **Leave Overlap Conflict Detection**.

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
| **ADMIN** | `admin@spsu.ac.in` | `Admin@123` | Full CMS access: Student & Staff CRUD, batch CSV/Excel import/export, leave policies, event publishing, system statistics. |
| **STUDENT** | `student1@spsu.ac.in` | `Student@1234` | Academic profile, hostel room, assigned mentor, leave applications, gate pass requests, event RSVP. |
| **FACULTY** | `faculty1@spsu.ac.in` | `Staff@1234` | Faculty dashboard, event publishing, participant exports, student directory access, leave queue. |
| **MENTOR** | `mentor.cse@spsu.ac.in` | `Staff@1234` | Mentor dashboard, assigned mentees, mentee leave approvals queue, progress overview. |
| **WARDEN** | `warden.bh2@spsu.ac.in` | `Staff@1234` | Warden dashboard, resident directory, hostel leave approvals, resident outing gate pass review. |
| **HOD** | `hod.cse@spsu.ac.in` | `Staff@1234` | Head of Department overview, faculty roster, student directory, event publishing, department leave approvals. |
| **PARENT** | `parent1@gmail.com` | `Parent@1234` | Parent portal, linked child profile overview, academic placement, overnight outing pass sign-off authorization. |

---

## ⚡ Release Architecture & Modules

### v1.0 — Student Information System (SIS)
- 👤 **Student Identity Management**: Enrollment numbers, roll numbers, academic programs, branches, semesters, sections, CGPA, and admission years.
- 🏢 **Hostel & Residential Allocation**: Tracking of Boys Hostels (BH1–BH4) and Girls Hostels (GH1–GH3), room numbers, and warden mappings.
- 🧑‍🏫 **Faculty & Departmental Organization**: Management of academic departments (CSE, ECE, ME, CE) and HOD appointments.
- 🤝 **Mentorship Program**: Direct 1:N mapping of faculty mentors to assigned student mentees.
- 📊 **Bulk Excel/CSV Batch Import & Export**: Fast batch ingestion of student records with standard template download and instant Excel exports.

### v2.0 — Leave Management & Approval Engine
- 📝 **Leave Application Form (`LEV-001`)**: Submission with leave type, start date, end date, reason, emergency contact, and proof URL.
- 🛡️ **Validation & Overlap Check (`LEV-002`)**: Date sequence verification and overlap rejection against existing approved or pending leaves.
- 🔄 **SIS Hierarchy Routing (`LEV-003`, `SH-007`)**: Dynamic routing to Mentor, Warden, HOD, or Administrator.
- ✍️ **Approver Decisions (`LEV-004`, `LEV-005`)**: Approvers can Approve, Reject, or Return for Correction with mandatory comments.
- 💳 **Balance Tracking (`LEV-008`)**: Real-time quota calculation for Casual Leave (CL), Medical Leave (ML), Home Visit (HV), and On-Duty Leave (OD).

### v3.0 — Event & Permission Management (Gate Passes)
- 🎪 **Campus Event Publishing (`EVT-001`, `EVT-002`)**: Title, category, timing, venue, organizer, and capacity limits.
- 🎯 **Target Audience Filtering (`EVT-003`)**: Events targeted by role, department, or semester.
- 🎟️ **Capacity-Constrained RSVP (`EVT-004`, `EVT-005`)**: Live seat counter with over-capacity prevention and withdrawal capability.
- 📊 **Participant Roster Export (`EVT-006`)**: One-click download of registered attendees as `.xlsx`.
- 🎫 **Gate Pass & Outing Workflows (`PER-001` – `PER-004`)**: Day outings, overnight stays, late campus entries, and lab passes.
- 👨‍👩‍👧 **Multi-Party Sign-Off (`PER-003`)**: Night outings require **both Hostel Warden review and Parent sign-off** before final gate release.
- ⚠️ **Leave Overlap Conflict Detection (`PER-005`, `BR-005`)**: Automated check that flags an outing request if the student has an overlapping approved leave.

---

## 📡 API Endpoint Documentation

### Campus Events (`/api/events`) — *v3.0*
- `GET /api/events` — Retrieve targeted campus events for the authenticated user
- `POST /api/events` — (Faculty/Admin) Publish a new campus event
- `GET /api/events/:id` — Event details and organizer information
- `PUT /api/events/:id` — Update event details or capacity
- `POST /api/events/:id/rsvp` — RSVP / register for event seat
- `POST /api/events/:id/withdraw` — Cancel RSVP registration
- `GET /api/events/:id/export` — Download registered participants list as `.xlsx`

### Outing & Gate Passes (`/api/permissions`) — *v3.0*
- `GET /api/permissions/types` — List active permission categories
- `POST /api/permissions/types` — (Admin) Configure new permission category
- `POST /api/permissions` — (Student) Submit outing / gate pass request (with leave conflict check)
- `GET /api/permissions/my` — (Student) View personal gate pass history and sign-off statuses
- `GET /api/permissions/warden-queue` — (Warden) View resident outing requests
- `POST /api/permissions/:id/warden-review` — (Warden) Approve or reject outing request
- `GET /api/permissions/parent-queue` — (Parent) View child overnight outing passes
- `POST /api/permissions/:id/parent-signoff` — (Parent) Grant or deny parental sign-off authorization
- `POST /api/permissions/:id/cancel` — Cancel pending gate pass request

### Leaves (`/api/leaves`) — *v2.0*
- `GET /api/leaves/types`, `GET /api/leaves/balances`, `GET /api/leaves/my`, `GET /api/leaves/pending`
- `POST /api/leaves`, `POST /api/leaves/:id/review`, `POST /api/leaves/:id/cancel`

### Authentication & SIS Core (`/api/auth`, `/api/students`, `/api/staff`, `/api/departments`, `/api/hostels`)
- `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/students`, `POST /api/students`, `GET /api/students/export`

---

## 🧪 Verification & Build Commands

```bash
# Run v1.0 SIS E2E Integration Suite (22 test cases)
powershell -ExecutionPolicy Bypass -File .\test-e2e.ps1

# Run v2.0 Leave Management Integration Suite (10 test cases)
powershell -ExecutionPolicy Bypass -File .\test-v2-leaves.ps1

# Run v3.0 Events & Permissions Integration Suite (10 test cases)
powershell -ExecutionPolicy Bypass -File .\test-v3-events-permissions.ps1

# Build backend and frontend production distributions
cd server && npm run build
cd client && npm run build
```

---

## 🔮 Future System Roadmap (v3.5 - v4.0)

- 🛡️ **v3.5 — Complaint / Grievance Portal**: Ticketing system with category routing, anonymous complaint privacy, and sensitive case escalation to Designated Authority.
- 📢 **v4.0 — Communication & Notice Board**: Audience-targeted announcements, urgent notice pinning, and unified in-app notification center.

---

<p center="align">
  <strong>Sir Padampat Singhania University (SPSU), Udaipur</strong> • Digital Campus Management Initiative
</p>
