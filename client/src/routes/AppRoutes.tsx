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

import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentHostelMentor } from '../pages/student/StudentHostelMentor';

import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { WardenDashboard } from '../pages/warden/WardenDashboard';
import { HodDashboard } from '../pages/hod/HodDashboard';
import { ParentDashboard } from '../pages/parent/ParentDashboard';

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
          </Route>

          {/* Student Routes */}
          <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/hostel-mentor" element={<StudentHostelMentor />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<RoleRoute allowedRoles={['FACULTY', 'ADMIN']} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/students" element={<FacultyDashboard />} />
          </Route>

          {/* Mentor Routes */}
          <Route element={<RoleRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/mentor/mentees" element={<MentorDashboard />} />
          </Route>

          {/* Warden Routes */}
          <Route element={<RoleRoute allowedRoles={['WARDEN', 'ADMIN']} />}>
            <Route path="/warden" element={<WardenDashboard />} />
            <Route path="/warden/residents" element={<WardenDashboard />} />
          </Route>

          {/* HOD Routes */}
          <Route element={<RoleRoute allowedRoles={['HOD', 'ADMIN']} />}>
            <Route path="/hod" element={<HodDashboard />} />
            <Route path="/hod/faculty" element={<HodDashboard />} />
            <Route path="/hod/students" element={<HodDashboard />} />
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
