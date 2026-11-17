import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Public pages
import { Landing } from '../pages/public/Landing';
import { Login } from '../pages/public/Login';
import { Unauthorized } from '../pages/public/Unauthorized';
import { NotFound } from '../pages/public/NotFound';

// Role-specific pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { StudentDirectory } from '../pages/admin/StudentDirectory';
import { StaffManagement } from '../pages/admin/StaffManagement';
import { DepartmentManagement } from '../pages/admin/DepartmentManagement';
import { HostelManagement } from '../pages/admin/HostelManagement';
import { LeaveManagement } from '../pages/admin/LeaveManagement';

import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentHostelMentor } from '../pages/student/StudentHostelMentor';
import { StudentLeaves } from '../pages/student/StudentLeaves';
import { StudentPermissions } from '../pages/student/StudentPermissions';

import { ApproverLeaveQueue } from '../pages/approver/ApproverLeaveQueue';

import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { WardenDashboard } from '../pages/warden/WardenDashboard';
import { WardenPermissionsQueue } from '../pages/warden/WardenPermissionsQueue';
import { HodDashboard } from '../pages/hod/HodDashboard';
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { EventsCatalog } from '../pages/events/EventsCatalog';
import { ComplaintPortal } from '../pages/complaints/ComplaintPortal';
import { ComplaintManagement } from '../pages/complaints/ComplaintManagement';
import { NoticeBoard } from '../pages/communication/NoticeBoard';
import { StudentAttendance } from '../pages/attendance/StudentAttendance';
import { FacultyAttendance } from '../pages/attendance/FacultyAttendance';
import { TimetableManagement } from '../pages/attendance/TimetableManagement';
import { StudentResults } from '../pages/academics/StudentResults';
import { FacultyMarksEntry } from '../pages/academics/FacultyMarksEntry';
import { DepartmentAnalytics } from '../pages/academics/DepartmentAnalytics';
import { MentorAttentionList } from '../pages/ai/MentorAttentionList';
import { LibraryCatalog } from '../pages/services/LibraryCatalog';
import { PlacementPortal } from '../pages/services/PlacementPortal';
import { HostelVisitorLog } from '../pages/services/HostelVisitorLog';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentDirectory />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/hostels" element={<HostelManagement />} />
            <Route path="/admin/leaves" element={<LeaveManagement />} />
            <Route path="/admin/timetable" element={<TimetableManagement />} />
          </Route>

          {/* Student & Parent Shared Academic & Attendance Routes */}
          <Route element={<RoleRoute allowedRoles={['STUDENT', 'PARENT']} />}>
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/results" element={<StudentResults />} />
          </Route>

          {/* Student-only Routes */}
          <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/hostel-mentor" element={<StudentHostelMentor />} />
            <Route path="/student/leaves" element={<StudentLeaves />} />
            <Route path="/student/permissions" element={<StudentPermissions />} />
          </Route>

          {/* Campus Events & Notice Board (Accessible to All Authenticated Roles) */}
          <Route path="/events" element={<EventsCatalog />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/library" element={<LibraryCatalog />} />
          <Route path="/placements" element={<PlacementPortal />} />

          {/* Grievance Portal for Submissions */}
          <Route path="/complaints" element={<ComplaintPortal />} />

          {/* Grievance Desk / Management for Handlers */}
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'HOD', 'WARDEN', 'FACULTY', 'MENTOR']} />}>
            <Route path="/complaints/manage" element={<ComplaintManagement />} />
          </Route>

          {/* Approver Shared Routes (Mentors, Wardens, HODs, Faculty, Admin) */}
          <Route element={<RoleRoute allowedRoles={['MENTOR', 'WARDEN', 'HOD', 'FACULTY', 'ADMIN']} />}>
            <Route path="/approver/leaves" element={<ApproverLeaveQueue />} />
          </Route>

          {/* Warden Permission Queue */}
          <Route element={<RoleRoute allowedRoles={['WARDEN', 'ADMIN']} />}>
            <Route path="/warden/permissions" element={<WardenPermissionsQueue />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<RoleRoute allowedRoles={['FACULTY', 'ADMIN']} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/students" element={<FacultyDashboard />} />
            <Route path="/faculty/attendance" element={<FacultyAttendance />} />
            <Route path="/faculty/marks" element={<FacultyMarksEntry />} />
          </Route>

          {/* Mentor Routes */}
          <Route element={<RoleRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/mentor/mentees" element={<MentorDashboard />} />
            <Route path="/mentor/attention-list" element={<MentorAttentionList />} />
          </Route>

          {/* Warden Routes */}
          <Route element={<RoleRoute allowedRoles={['WARDEN', 'ADMIN']} />}>
            <Route path="/warden" element={<WardenDashboard />} />
            <Route path="/warden/residents" element={<WardenDashboard />} />
            <Route path="/warden/visitors" element={<HostelVisitorLog />} />
          </Route>

          {/* HOD Routes */}
          <Route element={<RoleRoute allowedRoles={['HOD', 'ADMIN']} />}>
            <Route path="/hod" element={<HodDashboard />} />
            <Route path="/hod/faculty" element={<HodDashboard />} />
            <Route path="/hod/students" element={<HodDashboard />} />
            <Route path="/hod/analytics" element={<DepartmentAnalytics />} />
            <Route path="/hod/attention-list" element={<MentorAttentionList />} />
          </Route>

          {/* Parent Routes */}
          <Route element={<RoleRoute allowedRoles={['PARENT']} />}>
            <Route path="/parent" element={<ParentDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
