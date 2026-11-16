# 🏛️ SPSU Campus Management System (v1.0 — Student Information System)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript_%7C_Vite-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_%7C_Express_%7C_TypeScript-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_%7C_Mongoose-47A248?logo=mongodb)
![Redis](https://img.shields.io/badge/Cache-Redis_with_Fallback-DC382D?logo=redis)

Production-ready, multi-tenant Student Information System (SIS) foundation for **Sir Padampat Singhania University (SPSU), Udaipur** (A JK Cement Initiative).

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Official SPSU Visual Identity](#-official-spsu-visual-identity)
- [Technology Stack](#-technology-stack)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Key Modules & Features](#-key-modules--features)
- [System Architecture & Data Hierarchy](#-system-architecture--data-hierarchy)
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Quick Start & Setup Guide](#-quick-start--setup-guide)
- [Verification & Build Commands](#-verification--build-commands)
- [Future System Roadmap](#-future-system-roadmap)

---

## 🏛️ Executive Summary

Version 1.0 establishes an authoritative, centralized source for student identities, faculty records, parent accounts, academic tracking, hostel room assignments, mentor-mentee mapping, and departmental hierarchy across **7 distinct role-based access levels**.

Designed specifically for **Sir Padampat Singhania University (SPSU)**, this portal streamlines administrative operations, provides secure access to academic profiles, and ensures data integrity through strong validation, audit logs, and automated database seeding.

---

## 🎨 Official SPSU Visual Identity

The UI components adhere strictly to SPSU's primary brand guidelines:

| Color Element | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary Brand Blue** | `#0057B8` | Top navbar, active tabs, primary call-to-action buttons |
| **Secondary Blue** | `#0076CE` | Secondary accents, interactive hover states |
| **Dark Navy** | `#0B2545` | Sidebar background, primary typography headings |
| **Light Blue Accent** | `#EAF4FF` | Selected navigation items, badge backgrounds |
| **Background Neutral** | `#F7F9FC` | Application body background |
| **Card Surface** | `#FFFFFF` | Container cards, tables, modal surfaces |

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (with custom SPSU brand palette config)
- **Routing**: React Router DOM (v6) with declarative RBAC route guards
- **Data Fetching & State**: TanStack Query (React Query v5) + Axios (with auto cookie handling)
- **Forms & Schema Validation**: React Hook Form + Zod
- **Icons & Animations**: Lucide React + Framer Motion
- **Spreadsheet Operations**: SheetJS (`xlsx`) for client-side batch processing

### Backend (`/server`)
- **Runtime & Language**: Node.js + Express.js + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache Strategy**: Redis via `ioredis` with an automated in-memory fallback mechanism when Redis server is offline
- **Authentication & Security**: JWT stored in secure HTTP-only cookies, `bcryptjs` password hashing, `helmet` header protection, CORS configuration, rate limiting
- **File Parsing**: Multer + SheetJS (`xlsx`) for Excel/CSV student batch imports
- **Validation**: Zod schema validation middleware

---

## 🔐 Role-Based Access Control (RBAC)

The system supports **7 distinct user roles**. Pre-configured demo accounts can be populated via `npm run seed` in `server/`:

| Role | Email | Password | Scope & Key Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@spsu.ac.in` | `Admin@123` | Full SIS v1.0 access: Student & Staff CRUD, batch CSV/Excel import/export, mentor/warden/HOD assignments, system statistics. |
| **STUDENT** | `student1@spsu.ac.in` | `Student@1234` | Personal profile viewing, enrollment details, academic branch & semester info, assigned mentor details, hostel room & warden contact. |
| **FACULTY** | `faculty1@spsu.ac.in` | `Staff@1234` | Faculty dashboard, departmental assignment, student directory access. |
| **MENTOR** | `mentor.cse@spsu.ac.in` | `Staff@1234` | Mentor dashboard, list of assigned mentees, student progress overview, contact information. |
| **WARDEN** | `warden.bh2@spsu.ac.in` | `Staff@1234` | Warden dashboard, assigned hostel (e.g., BH2), hostel resident directory, occupancy status. |
| **HOD** | `hod.cse@spsu.ac.in` | `Staff@1234` | Head of Department overview, departmental faculty listing, departmental student directory. |
| **PARENT** | `parent1@gmail.com` | `Parent@1234` | Parent portal, linked child profile overview, academic placement, hostel & mentor summary. |

---

## ⚡ Key Modules & Features

- 👤 **Student Identity Management**: Comprehensive record keeping for enrollment numbers, roll numbers, academic programs, branches, semesters, sections, CGPA, and admission years.
- 🏢 **Hostel & Residential Allocation**: Tracking of Boys Hostels (BH1–BH4) and Girls Hostels (GH1–GH3), room numbers, and warden mappings.
- 🧑‍🏫 **Faculty & Departmental Organization**: Management of academic departments (CSE, ECE, ME, CE), designations (Professor, Assoc. Professor, Asst. Professor), and HOD appointments.
- 🤝 **Mentorship Program**: Direct 1:N mapping of faculty mentors to assigned student mentees.
- 📊 **Bulk Excel/CSV Batch Import & Export**: Fast batch ingestion of student records with downloadable template standard and instant Excel report exports.
- 🛡️ **Role-Guarded UI & API**: Secure frontend routing and backend middleware enforcing granular access privileges per role.

---

## 🏗️ System Architecture & Data Hierarchy

```
                               ┌───────────────────┐
                               │    ADMIN USER     │
                               └─────────┬─────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌───────────────┐               ┌─────────────────┐              ┌────────────────┐
│   DEPARTMENT  │               │     HOSTEL      │              │  STAFF PROFILE │
│ (CSE, ECE...) │               │ (BH1-4, GH1-3)  │              │ (Faculty, HOD) │
└───────┬───────┘               └────────┬────────┘              └───────┬────────┘
        │                                │                               │
        │ HOD Mapping                    │ Warden Mapping                │ Mentor Mapping
        ▼                                ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                STUDENT PROFILE                                  │
│                 (Roll No, Enrollment, Branch, Sem, Hostel, Mentor)              │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │  PARENT PROFILE  │
                               └──────────────────┘
```

---

## 📡 API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user, issue HTTP-only JWT cookie
- `POST /api/auth/logout` — Clear session authentication cookie
- `GET /api/auth/me` — Retrieve current authenticated user profile & permissions

### Admin Management (`/api/admin`)
- `GET /api/admin/stats` — High-level dashboard counter metrics & statistics
- `POST /api/admin/import/students` — Process bulk student upload via Excel/CSV

### Student Management (`/api/students`)
- `GET /api/students` — Paginated student search with filters (branch, sem, section, query)
- `POST /api/students` — Register a new student profile
- `GET /api/students/export` — Download full student directory as an `.xlsx` file
- `GET /api/students/:id` — Get detailed student profile
- `PUT /api/students/:id` — Update student record
- `DELETE /api/students/:id` — Remove student record

### Staff & Faculty (`/api/staff`)
- `GET /api/staff` — List all staff profiles (filterable by department and role)
- `POST /api/staff` — Register new staff member
- `GET /api/staff/:id` — Get specific staff details
- `PUT /api/staff/:id` — Update staff profile

### Departments & Hostels (`/api/departments` & `/api/hostels`)
- `GET /api/departments` — List departments with HOD associations
- `POST /api/departments` — Create new academic department
- `GET /api/hostels` — List hostels with capacity, warden details, and residents count
- `POST /api/hostels` — Register new hostel block

### Special Role Portals
- `GET /api/mentor/mentees` — Retrieve list of mentees for the logged-in mentor
- `GET /api/warden/residents` — Retrieve resident students for warden's hostel
- `GET /api/hod/overview` — Fetch departmental overview & student/faculty directory
- `GET /api/parent/student` — Retrieve linked child student information for parent

---

## 📂 Project Directory Structure

```text
SPSU_Website/
├── README.md
├── client/                     # Frontend Application (React + Vite + TS)
│   ├── public/                 # Static assets & logos
│   ├── src/
│   │   ├── components/         # Shared UI components (Badge, Button, Layout, Navbar, Sidebar)
│   │   ├── context/            # Global Auth Context & State
│   │   ├── pages/              # Role-specific page components
│   │   │   ├── admin/          # Admin portal pages
│   │   │   ├── faculty/        # Faculty dashboard
│   │   │   ├── hod/            # HOD analytics dashboard
│   │   │   ├── mentor/         # Mentor mentee portal
│   │   │   ├── parent/         # Parent overview page
│   │   │   ├── public/         # Landing, Login, 404, Unauthorized pages
│   │   │   ├── student/        # Student dashboard & profile
│   │   │   └── warden/         # Hostel warden management
│   │   ├── routes/             # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── services/           # Axios API services for each module
│   │   ├── types/              # TypeScript interfaces & types
│   │   ├── main.tsx            # Application entry point
│   │   └── index.css           # Tailwind CSS directives & custom theme
│   ├── package.json
│   ├── tailwind.config.js      # SPSU custom brand color configuration
│   ├── tsconfig.json
│   └── vite.config.ts          # Vite build & proxy settings
│
└── server/                     # Backend API Server (Node + Express + TS)
    ├── src/
    │   ├── config/             # Database, Redis, and Env configurations
    │   ├── controllers/        # Express route handlers
    │   ├── middlewares/        # Auth JWT check, Role validation, Error handling
    │   ├── models/             # Mongoose schemas (User, Student, Staff, Dept, Hostel)
    │   ├── routes/             # Express API routes
    │   ├── seed/               # Database seeder script
    │   ├── services/           # Business logic & bulk parsing services
    │   ├── types/              # Server TypeScript type definitions
    │   ├── validators/         # Zod payload validation schemas
    │   ├── app.ts              # Express application configuration
    │   └── server.ts           # Server listener entry point
    ├── package.json
    └── tsconfig.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory if custom parameters are needed (defaults are pre-configured in `src/config/env.ts`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/spsu_cms
JWT_SECRET=spsu_cms_super_secret_jwt_key_2026_v1_0
JWT_EXPIRES_IN=7d
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Quick Start & Setup Guide

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or a MongoDB Atlas URI
- *(Optional)* **Redis**: Local Redis server running on port `6379` (In-memory fallback activates automatically if Redis is unavailable)

### 1. Server Setup & Database Seeding

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Seed default database records (Depts, Hostels, Admin, Staff, Students, Parents)
npm run seed

# Start development backend API server
npm run dev
```
*API Server will run at `http://localhost:5000`*

### 2. Client Setup & Launch

```bash
# Open a new terminal tab and navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Client application will launch at `http://localhost:5173`*

---

## 🧪 Verification & Build Commands

To test production TypeScript compilation and builds:

```bash
# Build backend distribution
cd server
npm run build

# Build frontend production bundle
cd client
npm run build
```

Both build processes output clean, type-checked production distributions in `server/dist` and `client/dist`.

---

## 🔮 Future System Roadmap

- 🗓️ **v2.0 — Leave & Outing Management**: Gate pass requests, online parental approvals, warden sign-offs.
- 📋 **v3.0 — Attendance & Course Management**: Daily attendance tracking, subject registration, timetable scheduling.
- 📢 **v3.5 — Notice Board & Grievances**: Campus announcements, departmental notices, grievance ticketing portal.
- 💳 **v4.0 — Fee & Payment Integration**: Online tuition fee payments, hostel fee tracking, receipt generation.

---

<p center="align">
  <strong>Sir Padampat Singhania University (SPSU), Udaipur</strong> • Digital Campus Management Initiative
</p>
