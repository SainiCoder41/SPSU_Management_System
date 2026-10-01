import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Home,
  Upload,
  UserCheck,
  Shield,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { SpsuLogo } from '../common/SpsuLogo.tsx';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Students', path: '/admin/students', icon: GraduationCap },
          { label: 'Add Student', path: '/admin/students/new', icon: Users },
          { label: 'Faculty & Staff', path: '/admin/staff', icon: UserCheck },
          { label: 'Departments', path: '/admin/departments', icon: Building2 },
          { label: 'Hostels', path: '/admin/hostels', icon: Home },
          { label: 'Bulk Import', path: '/admin/import', icon: Upload },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'My Academic Profile', path: '/student/profile', icon: GraduationCap },
        ];
      case 'FACULTY':
        return [
          { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
        ];
      case 'MENTOR':
        return [
          { label: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
        ];
      case 'WARDEN':
        return [
          { label: 'Dashboard', path: '/warden/dashboard', icon: LayoutDashboard },
        ];
      case 'HOD':
        return [
          { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
        ];
      case 'PARENT':
        return [
          { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-spsu-navy text-white transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Logo */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <SpsuLogo variant={isCollapsed ? 'icon' : 'white'} size="sm" />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-spsu-blue text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
