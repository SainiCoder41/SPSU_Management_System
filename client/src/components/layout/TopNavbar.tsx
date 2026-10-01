import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../common/Badge.tsx';
import { Search, Bell, User as UserIcon, LogOut } from 'lucide-react';

interface TopNavbarProps {
  title?: string;
  isCollapsed: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ title = 'Dashboard', isCollapsed }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'STUDENT':
        return 'primary';
      case 'FACULTY':
        return 'info';
      case 'MENTOR':
        return 'warning';
      case 'WARDEN':
        return 'success';
      case 'HOD':
        return 'neutral';
      case 'PARENT':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-6 ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Title & Page Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-spsu-navy tracking-tight">{title}</h1>
      </div>

      {/* Right Side Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Search Placeholder */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, enrollment..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-full bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spsu-blue/30 w-56 text-slate-700 transition-all"
          />
        </div>

        {/* Notification bell placeholder */}
        <button
          className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-spsu-blue rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-spsu-blue to-spsu-cyan text-white font-bold flex items-center justify-center text-sm shadow-sm border border-spsu-blue/20">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-slate-800">{user?.fullName || 'User'}</span>
            <div className="mt-0.5">
              <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
