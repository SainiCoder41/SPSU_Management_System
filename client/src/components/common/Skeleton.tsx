import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-subtle animate-pulse space-y-3">
    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
    <div className="h-3 bg-slate-150 rounded w-2/3"></div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200 w-full"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 border-b border-slate-100 px-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-150 rounded w-1/6"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);
