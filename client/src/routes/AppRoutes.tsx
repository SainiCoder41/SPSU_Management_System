import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { RoleRoute } from './RoleRoute.tsx';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage.tsx';
import { LoginPage } from '../pages/public/LoginPage.tsx';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage.tsx';
import { NotFoundPage } from '../pages/public/NotFoundPage.tsx';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard.tsx';
import { StudentsPage } from '../pages/admin/StudentsPage.tsx';
import { CreateStudentPage } from '../pages/admin/CreateStudentPage.tsx';
import { StudentDetailsPage } from '../pages/admin/StudentDetailsPage.tsx';
import { StaffPage } from '../pages/admin/StaffPage.tsx';
import { DepartmentsPage } from '../pages/admin/DepartmentsPage.tsx';
import { HostelsPage } from '../pages/admin/HostelsPage.tsx';
import { ImportPage } from '../pages/admin/ImportPage.tsx';

// Role Pages
import { StudentDashboard } from '../pages/student/StudentDashboard.tsx';
import { StudentProfilePage } from '../pages/student/StudentProfile.tsx';
import { FacultyDashboard } from '../pages/faculty/FacultyDashboard.tsx';
import { MentorDashboard } from '../pages/mentor/MentorDashboard.tsx';
import { WardenDashboard } from '../pages/warden/WardenDashboard.tsx';
import { HodDashboard } from '../pages/hod/HodDashboard.tsx';
import { ParentDashboard } from '../pages/parent/ParentDashboard.tsx';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Authenticated Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/students/new" element={<CreateStudentPage />} />
          <Route path="/admin/students/:id" element={<StudentDetailsPage />} />
          <Route path="/admin/staff" element={<StaffPage />} />
          <Route path="/admin/departments" element={<DepartmentsPage />} />
          <Route path="/admin/hostels" element={<HostelsPage />} />
          <Route path="/admin/import" element={<ImportPage />} />
        </Route>

        {/* Student Routes */}
        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Faculty Routes */}
        <Route element={<RoleRoute allowedRoles={['FACULTY']} />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        </Route>

        {/* Mentor Routes */}
        <Route element={<RoleRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        </Route>

        {/* Warden Routes */}
        <Route element={<RoleRoute allowedRoles={['WARDEN', 'ADMIN']} />}>
          <Route path="/warden/dashboard" element={<WardenDashboard />} />
        </Route>

        {/* HOD Routes */}
        <Route element={<RoleRoute allowedRoles={['HOD', 'ADMIN']} />}>
          <Route path="/hod/dashboard" element={<HodDashboard />} />
        </Route>

        {/* Parent Routes */}
        <Route element={<RoleRoute allowedRoles={['PARENT', 'ADMIN']} />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
