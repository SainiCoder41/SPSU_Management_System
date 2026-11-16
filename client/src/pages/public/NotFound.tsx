import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-spsu-bgNeutral flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-spsu-blue mx-auto mb-4">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-spsu-navy">Page Not Found</h2>
        <p className="text-sm text-slate-600 mt-2">
          The requested URL does not exist or has been relocated within the SIS portal.
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
