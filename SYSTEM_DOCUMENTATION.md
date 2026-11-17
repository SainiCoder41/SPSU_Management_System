# 📖 Sir Padampat Singhania University (SPSU)
## Campus Management System — Comprehensive Platform Documentation

Welcome to the official system documentation for the **SPSU Campus Management System (v1.0 – v7.0 Complete Enterprise Suite)**. This guide explains how the platform operates, how each user role interacts with the system, and how the underlying modules work together.

---

## 📑 Table of Contents

1. [System Overview & Purpose](#1-system-overview--purpose)
2. [Target Audiences & 7 Role Portals](#2-target-audiences--7-role-portals)
3. [Architecture & Roadmap Progression (v1.0 – v7.0)](#3-architecture--roadmap-progression-v10--v70)
   - [v1.0: Student & Staff Information System (SIS)](#v10-student--staff-information-system-sis)
   - [v2.0: Leave Management & Hierarchy Approval Engine](#v20-leave-management--hierarchy-approval-engine)
   - [v3.0: Campus Life, Events & Gate Passes](#v30-campus-life-events--gate-passes)
   - [v3.5: Grievance Redressal & Anti-Ragging Escrow](#v35-grievance-redressal--anti-ragging-escrow)
   - [v4.0: Central Circulars & Real-Time Notification Bell](#v40-central-circulars--real-time-notification-bell)
   - [v4.5: Hardening, Security, Audit Logs & Account Protection](#v45-hardening-security-audit-logs--account-protection)
   - [v5.0: Attendance Management & Timetable Clash Detection](#v50-attendance-management--timetable-clash-detection)
   - [v5.5: Academics, Grading, SGPA/CGPA & Digital ID Card](#v55-academics-grading-sggacgpa--digital-id-card)
   - [v6.0: AI Insights, Dropout Early Warning & Campus Chatbot](#v60-ai-insights-dropout-early-warning--campus-chatbot)
   - [v6.5: AI Workflow Automation (NLP & Anomaly Detection)](#v65-ai-workflow-automation-nlp--anomaly-detection)
   - [v7.0: Campus Services (Library, Placements, Gate Logs & PWA)](#v70-campus-services-library-placements-gate-logs--pwa)
4. [Role-by-Role User Walkthrough Guide](#4-role-by-role-user-walkthrough-guide)
5. [Key Automated Safeguards & Business Rules](#5-key-automated-safeguards--business-rules)
6. [Testing & Verification Summary](#6-testing--verification-summary)
7. [Running the Application](#7-running-the-application)

---

## 1. System Overview & Purpose

The **SPSU Campus Management System** is a full-lifecycle university ERP designed specifically for the physical, academic, and residential realities of **Sir Padampat Singhania University (SPSU) in Udaipur, Rajasthan** (a JK Cement initiative).

It unifies daily campus operations across:
- **Academics**: Course enrollment, timetable generation, roll-call attendance, continuous evaluation, UGC 10-point scale grade cards, and verifiable digital student IDs.
- **Residential Life**: Hostel room allocations (BH-1 to BH-4, GH-1 to GH-3), curfew checks, outstation gate passes with parent verification, mess schedules, and campus gate logs.
- **Student Welfare & Support**: Mentor-mentee counseling, AI early-warning dropout risk index, anonymous grievances, and automated zero-tolerance anti-ragging escalation.
- **Career & Campus Services**: Central library lending with overdue fine audits, training & placement recruitment drives, and mobile PWA offline access.

---

## 2. Target Audiences & 7 Role Portals

Every user accesses a tailored portal strictly governed by Role-Based Access Control (RBAC):

| Role | Primary User Group | Core Responsibility |
|:---|:---|:---|
| **ADMIN** | Registrar & IT Office | Master data management, user activation/deactivation, staff bulk Excel import, audit logs, and institutional policies. |
| **STUDENT** | Undergraduate & Postgraduates | Timetable, attendance stats, leave/pass requests, marksheet downloads, grievance filing, AI campus chatbot, library borrowing, and job placement drives. |
| **FACULTY** | Professors & Lecturers | Subject lecture delivery, daily roll-call attendance, exam marks entry, leave application approvals, and student directory inspection. |
| **MENTOR** | Assigned Faculty Advisors | Mentee progress monitoring, AI "Needs Attention" early intervention dashboard, pastoral counseling, and mentee leave approvals. |
| **WARDEN** | Hostel Wardens | Hostel block occupancy, resident directories, night outing gate-pass sign-offs, hostel leave approvals, and campus visitor gate logs. |
| **HOD** | Department Chairs | Department academic analytics, faculty workloads, timetable clash reviews, curriculum management, and departmental leave authorizations. |
| **PARENT** | Guardians & Parents | Real-time visibility into child attendance percentages, academic SGPA/CGPA grade sheets, and mandatory outing pass authorizations. |

---

## 3. Architecture & Roadmap Progression (v1.0 – v7.0)

### v1.0: Student & Staff Information System (SIS)
- Central repository for student enrollment (`SPSU2023CSE001`), roll numbers, branches (CSE, ECE, ME, Civil), semesters, and hostel room assignments.
- Faculty profiles mapped to designations, departments, and mentorship cohorts.
- Bulk Excel ingestion service parsing multi-column spreadsheets with format validation and duplicate prevention.

### v2.0: Leave Management & Hierarchy Approval Engine
- Students and staff apply for leaves (`Academic`, `Medical`, `Casual`, `Outstation`).
- Multi-tier sequential approval workflow: Student ➔ Mentor ➔ Hostel Warden ➔ Department HOD.
- Automatic balance quota tracking, date overlap validation, and historical audit stamps.

### v3.0: Campus Life, Events & Gate Passes
- University events catalog with audience filters (department, semester) and capacity-limited RSVP slots.
- Formatted participant roster export for event organizers.
- Residential gate passes for day outings and night travel requiring **dual sign-off from both Hostel Warden and Parent**.
- **Leave Overlap Conflict Detection**: Prevents requesting an outing pass during dates of an already approved leave.

### v3.5: Grievance Redressal & Anti-Ragging Escrow
- Formatted ticket tracking (`GRV-YYYY-XXXX`) across Academic, Hostel, Mess, Infrastructure, and Ragging categories.
- Optional anonymous filing protecting complainant identity from departmental handlers.
- Internal staff investigation notes invisible to complainants.
- Mandatory closing remarks before resolving any grievance.

### v4.0: Central Circulars & Real-Time Notification Bell
- Target-filtered campus notices pinned by urgency (`Urgent`, `Normal`).
- Top navigation notification bell with real-time unread badge counter.
- Automated system notifications triggered whenever leaves are decided, passes are signed, or marks are published.

### v4.5: Hardening, Security, Audit Logs & Account Protection
- **Compliance Audit Trail**: Every sensitive state change (status toggle, policy update) logged with actor ID, timestamp, and IP.
- **Soft Deactivation**: Prevents hard deletes of graduated students or departed staff, preserving historical academic records.
- **Account Lockout (`NFR-004`)**: Automatically locks user accounts for 15 minutes after 5 consecutive failed login attempts (HTTP 429).
- **Multi-Role Authorization (`SH-003`)**: Allows staff to hold secondary roles (e.g. Faculty acting as Hostel Warden) without multiple accounts.

### v5.0: Attendance Management & Timetable Clash Detection
- Subject timetable scheduler with **automated clash detection** preventing room double-booking or faculty overlap.
- Section roll-call interface for professors to record attendance (`Present`, `Absent`, `Late`, `OnLeave`).
- **Approved Leave Waiver Integration (`ATT-007`)**: Students with officially approved university leaves automatically receive `OnLeave` status, preventing unfair penalties to their attendance percentage.
- Real-time attendance breakdown with visual progress bars and alert notifications for records below 75%.

### v5.5: Academics, Grading, SGPA/CGPA & Digital ID Card
- Continuous evaluation marks entry (Internal: max 50, Mid-Term: max 30, End-Term: max 60).
- Automatic UGC/AICTE letter grade allocation (`O`, `A+`, `A`, `B+`, `B`, `C`, `F`) and grade points (0 to 10).
- Automated SGPA calculation per semester and progressive CGPA updates on student profiles.
- HOD Department Analytics Dashboard with merit grade distribution and residential vs. day-scholar ratios.
- **Verifiable Digital Student ID Card (`ACD-005`)**: Live interactive identity card featuring student photo, blood group, emergency contact, and a signed QR code that security guards can scan to instantly verify enrollment status.

### v6.0: AI Insights, Dropout Early Warning & Campus Chatbot
- **Student Early Warning Risk Engine (`AI-001`)**: Evaluates attendance dips below 75%, CGPA decline, active backlogs, unapproved absences, and unresolved complaints to compute an engagement risk score (0 to 100).
- **Mentor "Needs Attention" List (`AI-002`, `AI-003`)**: Ranks mentees by priority, highlights plain-English contributing factors, and suggests targeted counseling steps.
- **Strict Non-Punitive Advisory Guardrail (`AI-007`)**: Every AI payload explicitly enforces `isAdvisory: true` and includes the mandatory disclaimer prohibiting automated disciplinary action.
- **Campus AI Assistant (`AI-004`, `AI-005`)**: In-app conversational assistant answering queries about hostel curfew, mess schedules, library hours, and emergency contacts.
- **Privacy Guardrail (`AI-006`)**: Rejects any attempt to query other students' confidential data or system administrative secrets.

### v6.5: AI Workflow Automation (NLP & Anomaly Detection)
- **NLP Complaint Classifier (`AIW-001`)**: Suggests category, urgency level, and assignee based on complaint text.
- **Smart Anti-Ragging Escrow (`AIW-002`)**: Detects hazing and harassment keywords, flags `isRaggingSuspected: true`, and escalates ticket priority to `Critical`.
- **Leave Pattern Anomaly Detector (`AIW-004`)**: Analyzes 30-day leave history to flag habitual Friday-departure/Monday-return patterns and pre-exam absence clusters.
- **Natural Language Directory Search (`AIW-005`)**: Allows searching students using plain English phrases (e.g. *"4th semester CSE students with CGPA > 8"*).
- **Bilingual Notice Generator (`AIW-006`)**: Translates official notices into standard Hindi circular formatting.

### v7.0: Campus Services (Library, Placements, Gate Logs & PWA)
- **Central Library Management (`SRV-001`)**: Book catalog search, 14-day borrowing tracking, and automated overdue fine calculation (₹5/day).
- **Training & Placement Cell (`SRV-002`)**: Campus recruitment drives with package details (LPA), CGPA cutoff enforcement, and online student applications.
- **Hostel Visitor & Gate Register (`SRV-003`)**: Security gate register logging guest details, visited students, check-in time, and departure timestamps.
- **Progressive Web App (PWA) (`SRV-004`)**: Mobile web app manifest and offline asset caching for mobile devices.
- **Multi-Channel Dispatch Adapter (`SRV-005`)**: Extensible adapter simulating real-world email and SMS alerts.

---

## 4. Role-by-Role User Walkthrough Guide

### A. How a Student Uses the System
1. **Dashboard**: View overall attendance percentage, upcoming class schedule, and urgent circulars.
2. **Attendance**: View subject-by-subject attendance progress bars. Green indicates safe standing (>= 75%); red indicates an attendance warning.
3. **Academics & ID Card**: Download semester marksheets and click "View Digital ID Card" to display the official student ID with scannable verification QR.
4. **Leaves & Gate Passes**: Apply for day outings or home leave. Track approval progress through Mentor ➔ Warden ➔ HOD.
5. **Campus AI Assistant**: Click the purple **AI Assistant** button in the top navbar to ask about mess menus, curfew times, or check personal attendance progress.
6. **Library & Placements**: Search available library books or apply for corporate placement drives matching your CGPA.

### B. How a Faculty Member Uses the System
1. **Attendance Roll-Call**: Select your department, semester, subject, and section. Mark students Present, Absent, Late, or view excused leaves.
2. **Marks Entry**: Select the student, enter Internal, Mid-Term, and End-Term scores. The system automatically computes grades and updates the student's SGPA and CGPA.
3. **Leave Queue**: Approve or return academic leave requests submitted by students.

### C. How a Mentor Uses the System
1. **Needs Attention List**: Open the **AI Needs Attention** tab to inspect the ranked list of mentees at risk.
2. **Factor Analysis**: Click any at-risk student to see plain-English explanations (e.g., *"Attendance dropped to 62% in CS201"*).
3. **Counseling Action**: Use the recommended interventions to schedule advisory meetings with the student and parent.

### D. How a Hostel Warden Uses the System
1. **Gate Passes & Leaves**: Review night outstation requests. Check whether the student's parent has provided authorization.
2. **Visitor Log**: Click **Gate & Visitor Log** to record visitor arrivals at the main gate and confirm their checkout when leaving campus.

### E. How an HOD Uses the System
1. **Department Analytics**: Inspect average CGPA, first-class honor distributions, backlog counts, and residential student percentages.
2. **Timetable Management**: View the weekly schedule and ensure no room or faculty clashes exist.
3. **Department Leave Authorizations**: Finalize multi-day departmental leave requests.

### F. How a Parent Uses the System
1. **Child Academic Standing**: Review live attendance percentages and semester grade reports.
2. **Outing Authorizations**: Authorize or decline your child's night outstation gate passes directly from your phone or computer.

---

## 5. Key Automated Safeguards & Business Rules

1. **Leave Waiver Rule (`ATT-007`)**: Students on approved university leave are automatically excused during roll-call attendance, ensuring medical or university sports absences do not lower attendance percentages.
2. **Timetable Anti-Clash Rule (`ATT-005`)**: The system rejects any timetable entry if the room or the faculty member is already booked for that time slot.
3. **Anti-Ragging Immediate Escalation (`AIW-002`)**: Complaints containing hazing or physical threat keywords automatically bypass standard triage and are immediately routed to the University Proctorial Board and Admin at Critical priority.
4. **Advisory AI Protection (`AI-007`)**: AI early warning scores are strictly advisory for pastoral care and cannot be used for automated disciplinary penalties.
5. **Account Lockout Rule (`NFR-004`)**: 5 incorrect password attempts trigger a 15-minute account lockout to protect against unauthorized access.

---

## 6. Testing & Verification Summary

The entire platform is covered by automated integration test suites:

| Suite Name | Scope | Result |
|:---|:---|:---:|
| `test-e2e.ps1` | v1.0 SIS & 7 User Roles | **22 / 22 PASS** |
| `test-v2-leaves.ps1` | v2.0 Multi-Tier Leave Engine | **10 / 10 PASS** |
| `test-v3-events-permissions.ps1` | v3.0 Events & Outing Passes | **10 / 10 PASS** |
| `test-v4.mjs` | v3.5 Grievances & v4.0 Notices | **10 / 10 PASS** |
| `test-v4-5.mjs` | v4.5 Audit Logs, Lockout & Soft-Deactivate | **7 / 7 PASS** |
| `test-v5.mjs` | v5.0 Attendance & Timetable Clashes | **6 / 6 PASS** |
| `test-v5-5.mjs` | v5.5 Academics, UGC Grading & ID Card QR | **6 / 6 PASS** |
| `test-v6.mjs` | v6.0 AI Early Warning & Campus Chatbot | **6 / 6 PASS** |
| `test-v6-5.mjs` | v6.5 NLP Complaints & Leave Anomalies | **5 / 5 PASS** |
| `test-v7.mjs` | v7.0 Library, Placements & Visitor Logs | **6 / 6 PASS** |
| **Total Test Suite** | **Complete Platform (v1.0 – v7.0)** | **88 / 88 PASS (100%)** |

---

## 7. Running the Application

### 1. Start the Backend API Server:
```powershell
cd server
npm run dev
```
*API runs at `http://localhost:5000`.*

### 2. Start the Frontend Client:
```powershell
cd client
npm run dev
```
*Web application runs at `http://localhost:5173`.*

### 3. Demo Login Accounts:
- **Admin**: `admin@spsu.ac.in` / `Admin@123`
- **Student**: `student1@spsu.ac.in` / `Student@1234`
- **Faculty**: `faculty1@spsu.ac.in` / `Staff@1234`
- **Mentor**: `mentor.cse@spsu.ac.in` / `Staff@1234`
- **Warden**: `warden.bh2@spsu.ac.in` / `Staff@1234`
- **HOD**: `hod.cse@spsu.ac.in` / `Staff@1234`
- **Parent**: `parent1@gmail.com` / `Parent@1234`
