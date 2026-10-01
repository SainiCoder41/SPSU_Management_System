import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-spsu-bg p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-spsu-light text-spsu-blue flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-spsu-navy">Page Not Found (404)</h2>
        <p className="text-sm text-slate-600">
          The page or record you requested could not be located in the SPSU Campus Management Portal.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-spsu-blue text-white font-semibold text-sm hover:bg-[#004799] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
