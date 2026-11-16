import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <img src="/spsu-logo.svg" alt="SPSU Logo" className="h-9 w-auto" />
        <div className="hidden sm:block">
          <span className="text-xs font-bold text-spsu-blue uppercase tracking-wider block">
            Campus Management System
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Sir Padampat Singhania University, Udaipur
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          title="Notifications"
          className="p-2 text-slate-400 hover:text-spsu-blue rounded-lg hover:bg-slate-100 transition-colors relative"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-spsu-blue rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-spsu-lightBlue text-spsu-blue flex items-center justify-center font-bold text-sm border border-blue-200">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="hidden md:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                <Badge role={user.role} />
              </div>
              <span className="text-xs text-slate-400 leading-tight block mt-0.5">{user.email}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
