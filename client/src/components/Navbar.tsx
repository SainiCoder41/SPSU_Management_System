import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import { LogOut, User as UserIcon, Bell, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { communicationService } from '../services/communicationService';
import { IAppNotification } from '../types/communication';
import { AIChatModal } from './AIChatModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<IAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await communicationService.getMyNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      // Background poll failure tolerated
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await communicationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setIsDropdownOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await communicationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <img src="/spsu-logo.svg" alt="SPSU Logo" className="h-9 w-auto" />
        <div className="hidden sm:block">
          <span className="text-xs font-bold text-[#0057B8] uppercase tracking-wider block">
            Campus Management System
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Sir Padampat Singhania University, Udaipur
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* SPSU AI Campus Assistant (AI-004) */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
          title="SPSU Campus AI Assistant (v6.0)"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notifications Dropdown (COM-006) */}
        <div className="relative" ref={dropdownRef}>
          <button
            title="Notifications"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 text-slate-500 hover:text-[#0057B8] rounded-lg hover:bg-slate-100 transition-colors relative"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-[#0057B8]">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#0057B8] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkAsRead(n._id, n.link)}
                      className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left ${
                        !n.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                              {n.sourceModule}
                            </span>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0057B8]" />
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                            {n.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-gray-400 block pt-0.5">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0057B8] flex items-center justify-center font-bold text-sm border border-blue-200">
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

      <AIChatModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </header>
  );
};
