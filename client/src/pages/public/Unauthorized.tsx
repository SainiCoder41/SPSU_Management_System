import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/Button';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-spsu-bgNeutral flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-spsu-navy">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-2">
          Your current account role does not have authorization to view this module.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button variant="outline" icon={<ArrowLeft size={16} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
