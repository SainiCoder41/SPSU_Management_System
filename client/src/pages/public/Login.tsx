import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { Role } from '../../types';

interface DemoAccount {
  role: Role;
  email: string;
  pass: string;
  label: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'ADMIN', email: 'admin@spsu.ac.in', pass: 'Admin@123', label: 'Admin (Full Access)' },
  { role: 'STUDENT', email: 'student1@spsu.ac.in', pass: 'Student@1234', label: 'Student (Aarav Verma)' },
  { role: 'FACULTY', email: 'faculty1@spsu.ac.in', pass: 'Staff@1234', label: 'Faculty (Dr. Priya Mehta)' },
  { role: 'MENTOR', email: 'mentor.cse@spsu.ac.in', pass: 'Staff@1234', label: 'Mentor (Prof. Vikram Singh)' },
  { role: 'WARDEN', email: 'warden.bh2@spsu.ac.in', pass: 'Staff@1234', label: 'Warden (Mr. Arvind Chauhan - BH2)' },
  { role: 'HOD', email: 'hod.cse@spsu.ac.in', pass: 'Staff@1234', label: 'HOD (Dr. Rajesh Sharma - CSE)' },
  { role: 'PARENT', email: 'parent1@gmail.com', pass: 'Parent@1234', label: 'Parent (Mr. Ramesh Verma)' },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (role: Role) => {
    switch (role) {
      case 'ADMIN': navigate('/admin'); break;
      case 'STUDENT': navigate('/student'); break;
      case 'FACULTY': navigate('/faculty'); break;
      case 'MENTOR': navigate('/mentor'); break;
      case 'WARDEN': navigate('/warden'); break;
      case 'HOD': navigate('/hod'); break;
      case 'PARENT': navigate('/parent'); break;
      default: navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      handleRoleRedirect(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
    setLoading(true);

    try {
      const user = await login(acc.email, acc.pass);
      handleRoleRedirect(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spsu-bgNeutral flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/spsu-logo.svg" alt="SPSU Logo" className="mx-auto h-14 w-auto mb-3" />
        <h2 className="text-2xl font-extrabold text-spsu-navy">Campus Management System</h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Sign in to your authoritative SIS account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@spsu.ac.in"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spsu-blue focus:border-spsu-blue bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spsu-blue focus:border-spsu-blue bg-white"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Sign In to Account
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-spsu-blue" />
              <span className="text-xs font-bold text-spsu-navy uppercase tracking-wider">
                1-Click Quick Demo Login (All 7 Roles)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Select any role below to automatically authenticate with pre-configured demo credentials:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickDemo(acc)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-spsu-blue hover:bg-spsu-lightBlue/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 group-hover:text-spsu-blue">
                    <span>{acc.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-white text-slate-600 font-mono">
                      {acc.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
