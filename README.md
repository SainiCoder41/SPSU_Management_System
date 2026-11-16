# 🏛️ SPSU Campus Management System (v2.0 — SIS & Leave Management)

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
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
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Quick Start & Setup Guide](#-quick-start--setup-guide)
- [Verification & Build Commands](#-verification--build-commands)
- [Future System Roadmap (v3.0 - v4.0)](#-future-system-roadmap-v30---v40)

---

## 🏛️ Executive Summary

The SPSU Campus Management System delivers an integrated, role-guarded platform spanning:
1. **Release v1.0 — Student Information System (SIS)**: Authoritative identity management for students, faculty records, parent accounts, academic tracking, hostel room assignments, mentor-mentee mapping, and departmental hierarchy across **7 distinct user roles**.
2. **Release v2.0 — Leave Management & Approval Engine**: Student & staff leave applications, date-order and overlap validation, multi-stage approval routing using SIS reporting relationships, decision recording with audit trails, and annual quota balance tracking.

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
| **ADMIN** | `admin@spsu.ac.in` | `Admin@123` | Full CMS access: Student & Staff CRUD, batch CSV/Excel import/export, leave policies, system statistics. |
| **STUDENT** | `student1@spsu.ac.in` | `Student@1234` | Academic profile, hostel room, assigned mentor, leave applications, remaining balances. |
| **FACULTY** | `faculty1@spsu.ac.in` | `Staff@1234` | Faculty dashboard, departmental assignment, student directory access, leave queue. |
| **MENTOR** | `mentor.cse@spsu.ac.in` | `Staff@1234` | Mentor dashboard, assigned mentees, mentee leave approvals queue, progress overview. |
| **WARDEN** | `warden.bh2@spsu.ac.in` | `Staff@1234` | Warden dashboard, assigned hostel (BH2), resident directory, hostel leave approvals. |
| **HOD** | `hod.cse@spsu.ac.in` | `Staff@1234` | Head of Department overview, faculty roster, student directory, department leave approvals. |
| **PARENT** | `parent1@gmail.com` | `Parent@1234` | Parent portal, linked child profile overview, academic placement, hostel & mentor summary. |

---

## ⚡ Release Architecture & Modules

### v1.0 — Student Information System (SIS)
- 👤 **Student Identity Management**: Enrollment numbers, roll numbers, academic programs, branches, semesters, sections, CGPA, and admission years.
- 🏢 **Hostel & Residential Allocation**: Tracking of Boys Hostels (BH1–BH4) and Girls Hostels (GH1–GH3), room numbers, and warden mappings.
- 🧑‍🏫 **Faculty & Departmental Organization**: Management of academic departments (CSE, ECE, ME, CE) and HOD appointments.
- 🤝 **Mentorship Program**: Direct 1:N mapping of faculty mentors to assigned student mentees.
- 📊 **Bulk Excel/CSV Batch Import & Export**: Fast batch ingestion of student records with standard template download and instant Excel exports.

### v2.0 — Leave Management & Approval Engine
- 📝 **Leave Application Form (`LEV-001`)**: Submission with leave type, start date, end date, reason, emergency contact, and optional attachment.
- 🛡️ **Validation & Overlap Check (`LEV-002`)**: Date sequence verification and overlap rejection against existing approved or pending leaves.
- 🔄 **SIS Hierarchy Routing (`LEV-003`, `SH-007`)**:
  - Student requests route dynamically to their **Assigned Faculty Mentor**; if unassigned, to the **Hostel Warden** or **Department HOD**.
  - Staff requests route to their **Department HOD** or **Administrator**.
- ✍️ **Approver Decisions (`LEV-004`, `LEV-005`)**: Approvers can **Approve**, **Reject**, or **Return for Correction** with mandatory review comments.
- 📜 **Audit Trail & State Machine (`SH-006`, State Model 6.3)**: Full transition history (`Draft` -> `Pending` -> `Approved` / `Rejected` / `Returned` / `Cancelled`).
- 💳 **Balance & Quota Tracking (`LEV-008`)**: Real-time quota calculation for Casual Leave (CL), Medical Leave (ML), Home Visit (HV), and On-Duty Leave (OD).
- ⚙️ **Admin Policy Configuration (`LEV-009`)**: Add and configure leave types, codes, audience scopes, and default quotas.

---

## 📡 API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user, issue HTTP-only JWT cookie
- `POST /api/auth/logout` — Clear session authentication cookie
- `GET /api/auth/me` — Retrieve current authenticated user profile & permissions

### Leave Management (`/api/leaves`) — *v2.0*
- `GET /api/leaves/types` — List active leave types and quotas
- `POST /api/leaves/types` — (Admin) Configure new leave type
- `GET /api/leaves/balances` — Retrieve user's remaining, used, and pending leave balances
- `GET /api/leaves/my` — Applicant's personal leave applications history
- `GET /api/leaves/pending` — Approver queue for pending leave requests routed by SIS hierarchy
- `POST /api/leaves` — Submit new leave application
- `POST /api/leaves/:id/review` — Approver decision (`Approved`, `Rejected`, `Returned`) with comments
- `POST /api/leaves/:id/cancel` — Applicant self-service cancellation
- `GET /api/leaves/:id` — Detailed leave view with full approval history and audit trail
- `GET /api/leaves` — (Admin/HOD/Warden) Campus-wide leave records with filters

### SIS & Directories (`/api/students`, `/api/staff`, `/api/departments`, `/api/hostels`)
- `GET /api/students` — Paginated student directory with search & filters
- `POST /api/students` — Register a student profile
- `GET /api/students/export` — Download student directory as `.xlsx`
- `GET /api/staff` — List staff members filterable by role & department
- `GET /api/departments` & `GET /api/hostels` — Departmental & residential blocks

### Role Portals (`/api/mentor`, `/api/warden`, `/api/hod`, `/api/parent`)
- `GET /api/mentor/mentees` — Retrieve list of mentees for the logged-in mentor
- `GET /api/warden/residents` — Retrieve resident students for warden's hostel
- `GET /api/hod/overview` — Fetch departmental overview & student/faculty directory
- `GET /api/parent/student` — Retrieve linked child student information for parent

---

## 🚀 Quick Start & Setup Guide

### 1. Server Setup & Database Seeding

```bash
cd server
npm install
npm run seed
npm run dev
```
*API Server runs at `http://localhost:5000`*

### 2. Client Setup & Launch

```bash
cd client
npm install
npm run dev
```
*Web application runs at `http://localhost:5173`*

---

## 🧪 Verification & Build Commands

```bash
# Run v1.0 SIS E2E Integration Suite (22 test cases)
powershell -ExecutionPolicy Bypass -File .\test-e2e.ps1

# Run v2.0 Leave Management Integration Suite (10 test cases)
powershell -ExecutionPolicy Bypass -File .\test-v2-leaves.ps1

# Build backend and frontend production distributions
cd server && npm run build
cd client && npm run build
```

---

## 🔮 Future System Roadmap (v3.0 - v4.0)

- 🎫 **v3.0 — Event & Permission Management**: Campus event publishing, RSVP limits, gate pass / outing requests with parent & warden sign-offs, and leave overlap conflict checks.
- 🛡️ **v3.5 — Complaint / Grievance Portal**: Ticketing system with category routing, anonymous complaint privacy, and sensitive case escalation to Designated Authority.
- 📢 **v4.0 — Communication & Notice Board**: Audience-targeted announcements, urgent notice pinning, and unified in-app notification center.

---

<p center="align">
  <strong>Sir Padampat Singhania University (SPSU), Udaipur</strong> • Digital Campus Management Initiative
</p>
