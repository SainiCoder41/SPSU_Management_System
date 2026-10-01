import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spsu-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-spsu-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-spsu-navy">Loading SPSU Campus System...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
