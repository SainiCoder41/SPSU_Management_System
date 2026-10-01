import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth, getDashboardRouteForRole } from '../../context/AuthContext.tsx';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  const homeRoute = getDashboardRouteForRole(user?.role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-spsu-bg p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-spsu-navy">Access Denied (403)</h2>
        <p className="text-sm text-slate-600">
          You do not have permission to view this section of the SPSU Campus Management System.
        </p>
        <div className="pt-4">
          <Link
            to={homeRoute}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-spsu-blue text-white font-semibold text-sm hover:bg-[#004799] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
