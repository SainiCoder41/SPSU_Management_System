import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { SpsuLogo } from '../../components/common/SpsuLogo.tsx';
import { Button } from '../../components/common/Button.tsx';
import { Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, getDashboardRouteForRole } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const role = await login({ email, password });
      const targetRoute = getDashboardRouteForRole(role);
      navigate(targetRoute);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-spsu-bg">
      {/* LEFT SPLIN SCREEN VISUAL */}
      <div className="lg:col-span-6 bg-gradient-to-br from-[#0B2545] via-[#0057B8] to-[#0076CE] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-spsu-cyan/20 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <SpsuLogo variant="white" size="lg" />
        </div>

        <div className="my-12 space-y-6 max-w-lg z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-semibold uppercase tracking-wider border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Secure SIS Portal v1.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Welcome to SPSU <br />
            Campus Management System
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            The authoritative digital gateway connecting students, faculty, parents, wardens, and administrative leaders across Sir Padampat Singhania University.
          </p>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Institutional Privacy Standard
            </div>
            <div className="text-xs text-blue-100/90 leading-relaxed">
              Protected by Role-Based Access Control (RBAC) and HTTP-only encrypted session cookies.
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-200/70 z-10">
          © {new Date().getFullYear()} Sir Padampat Singhania University • Udaipur, Rajasthan
        </div>
      </div>

      {/* RIGHT SPLIT SCREEN FORM */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-spsu-navy">Sign In to Your Account</h2>
            <p className="text-sm text-slate-500">
              Enter your university email address and password to access your role dashboard.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@spsu.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue focus:border-transparent text-sm bg-white text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue focus:border-transparent text-sm bg-white text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-spsu-blue focus:ring-spsu-blue" />
                <span>Remember me</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact SPSU System Administrator at admin@spsu.ac.in to reset your portal password."); }} className="text-spsu-blue font-semibold hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
              Login to Portal
            </Button>
          </form>

          {/* QUICK DEMO LOGIN BUTTONS */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-spsu-blue" /> Evaluator Quick Role Switcher
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Click to fill credentials</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@spsu.ac.in', 'Admin@123')}
                className="px-2.5 py-1.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 text-left transition-colors truncate"
              >
                1. ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student1@spsu.ac.in', 'Student@1234')}
                className="px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100 text-left transition-colors truncate"
              >
                2. STUDENT
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('mentor.cse@spsu.ac.in', 'Staff@1234')}
                className="px-2.5 py-1.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200 hover:bg-amber-100 text-left transition-colors truncate"
              >
                3. MENTOR
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('warden.bh2@spsu.ac.in', 'Staff@1234')}
                className="px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 text-left transition-colors truncate"
              >
                4. WARDEN
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hod.cse@spsu.ac.in', 'Staff@1234')}
                className="px-2.5 py-1.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 text-left transition-colors truncate"
              >
                5. HOD
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('parent1@gmail.com', 'Parent@1234')}
                className="px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-100 text-left transition-colors truncate"
              >
                6. PARENT
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('faculty1@spsu.ac.in', 'Staff@1234')}
                className="px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200 hover:bg-slate-200 text-left transition-colors truncate col-span-2 sm:col-span-2"
              >
                7. FACULTY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
