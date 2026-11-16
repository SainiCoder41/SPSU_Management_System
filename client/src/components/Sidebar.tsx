import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Home,
  UserCheck,
  Shield,
  FileSpreadsheet,
  Award,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
          { label: 'Student Directory', path: '/admin/students', icon: <GraduationCap size={18} /> },
          { label: 'Staff Management', path: '/admin/staff', icon: <Users size={18} /> },
          { label: 'Departments', path: '/admin/departments', icon: <Building2 size={18} /> },
          { label: 'Hostel Blocks', path: '/admin/hostels', icon: <Home size={18} /> },
        ];
      case 'STUDENT':
        return [
          { label: 'My Student Portal', path: '/student', icon: <GraduationCap size={18} /> },
          { label: 'Mentor & Residential', path: '/student/hostel-mentor', icon: <Home size={18} /> },
        ];
      case 'FACULTY':
        return [
          { label: 'Faculty Dashboard', path: '/faculty', icon: <LayoutDashboard size={18} /> },
          { label: 'Students Directory', path: '/faculty/students', icon: <GraduationCap size={18} /> },
        ];
      case 'MENTOR':
        return [
          { label: 'Mentor Portal', path: '/mentor', icon: <UserCheck size={18} /> },
          { label: 'Assigned Mentees', path: '/mentor/mentees', icon: <GraduationCap size={18} /> },
        ];
      case 'WARDEN':
        return [
          { label: 'Hostel Dashboard', path: '/warden', icon: <Home size={18} /> },
          { label: 'Resident Directory', path: '/warden/residents', icon: <Users size={18} /> },
        ];
      case 'HOD':
        return [
          { label: 'HOD Overview', path: '/hod', icon: <Award size={18} /> },
          { label: 'Faculty Roster', path: '/hod/faculty', icon: <Users size={18} /> },
          { label: 'Department Students', path: '/hod/students', icon: <GraduationCap size={18} /> },
        ];
      case 'PARENT':
        return [
          { label: 'Parent Portal', path: '/parent', icon: <Shield size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-spsu-navy text-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Role Access Level
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-sm font-semibold text-white tracking-wide">{role} PORTAL</span>
        </div>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {navLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/student' || item.path === '/faculty' || item.path === '/mentor' || item.path === '/warden' || item.path === '/hod' || item.path === '/parent'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-spsu-lightBlue text-spsu-blue font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400 text-center">
        <p className="font-semibold text-slate-300">SPSU Campus v1.0</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Udaipur, Rajasthan</p>
      </div>
    </aside>
  );
};
