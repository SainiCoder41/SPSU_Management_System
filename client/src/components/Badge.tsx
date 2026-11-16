import React from 'react';
import { Role } from '../types';

interface BadgeProps {
  role?: Role;
  variant?: 'blue' | 'navy' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ role, variant, children, className = '' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (role) {
    switch (role) {
      case 'ADMIN':
        colorStyles = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'STUDENT':
        colorStyles = 'bg-spsu-lightBlue text-spsu-blue border-blue-200';
        break;
      case 'FACULTY':
        colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'MENTOR':
        colorStyles = 'bg-teal-50 text-teal-700 border-teal-200';
        break;
      case 'WARDEN':
        colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'HOD':
        colorStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'PARENT':
        colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'blue':
        colorStyles = 'bg-spsu-lightBlue text-spsu-blue border-blue-200';
        break;
      case 'navy':
        colorStyles = 'bg-slate-800 text-white border-slate-700';
        break;
      case 'green':
        colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'amber':
        colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'red':
        colorStyles = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'purple':
        colorStyles = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'gray':
      default:
        colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyles} ${className}`}
    >
      {children || role}
    </span>
  );
};
