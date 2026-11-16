import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Building,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'STUDENT': return '/student';
      case 'FACULTY': return '/faculty';
      case 'MENTOR': return '/mentor';
      case 'WARDEN': return '/warden';
      case 'HOD': return '/hod';
      case 'PARENT': return '/parent';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/spsu-logo.svg" alt="SPSU Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-sm font-bold text-spsu-navy leading-none">Sir Padampat Singhania University</h1>
            <p className="text-[11px] text-spsu-blue font-semibold mt-0.5">Campus Management System (v1.0 SIS)</p>
          </div>
        </div>

        <div>
          {user ? (
            <Link to={getDashboardPath()}>
              <Button size="sm" icon={<ArrowRight size={16} />}>
                Go to Portal ({user.role})
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign In to Portal</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-100 py-20 px-6 md:px-12 border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-spsu-lightBlue border border-blue-200 text-spsu-blue text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-spsu-blue animate-pulse"></span>
            A JK Cement Initiative • Udaipur, Rajasthan
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-spsu-navy tracking-tight leading-tight">
            Centralized Student Information & Academic Administration
          </h2>
          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Authoritative, role-guarded Student Information System foundation connecting students, faculty, mentors, wardens, department heads, and parents in one unified campus network.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/login">
              <Button size="lg" icon={<ArrowRight size={18} />}>
                Access Portal Login
              </Button>
            </Link>
            <a
              href="#roles"
              className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-xs"
            >
              Explore 7 User Roles
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-spsu-navy">Core Capabilities in v1.0</h3>
          <p className="text-slate-500 text-sm mt-1">Built specifically around SPSU's academic and residential infrastructure</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 bg-spsu-lightBlue rounded-xl flex items-center justify-center text-spsu-blue mb-4">
              <GraduationCap size={24} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Student Identity & Academics</h4>
            <p className="text-sm text-slate-600">
              Complete tracking of Enrollment Numbers, Roll Numbers, Programs (B.Tech, M.Tech), Department, Semesters, Sections, and CGPA metrics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 bg-spsu-lightBlue rounded-xl flex items-center justify-center text-spsu-blue mb-4">
              <Building size={24} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Hostel & Residential Blocks</h4>
            <p className="text-sm text-slate-600">
              Boys Hostels (BH1–BH4) and Girls Hostels (GH1–GH3) room allocations, capacity tracking, and assigned warden contact channels.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 bg-spsu-lightBlue rounded-xl flex items-center justify-center text-spsu-blue mb-4">
              <Users size={24} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Faculty Mentorship Mapping</h4>
            <p className="text-sm text-slate-600">
              Direct 1:N faculty mentor-to-mentee assignments ensuring student academic progress and pastoral care are prioritized.
            </p>
          </div>
        </div>
      </section>

      {/* RBAC Roles Matrix */}
      <section id="roles" className="py-16 px-6 md:px-12 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-spsu-blue uppercase tracking-wider">Granular Security</span>
            <h3 className="text-2xl font-bold text-spsu-navy mt-1">7 Role-Based Portals</h3>
            <p className="text-slate-500 text-sm mt-1">Pre-configured demo accounts are available on the login page</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'ADMIN', desc: 'Full SIS control, student/staff CRUD, Excel batch import/export, department & hostel setup.' },
              { role: 'STUDENT', desc: 'Academic profile, semester & branch, CGPA, assigned mentor and hostel room info.' },
              { role: 'FACULTY', desc: 'Departmental curriculum, student directory search, academic information.' },
              { role: 'MENTOR', desc: 'Assigned student mentees list, academic guidance and progress tracking.' },
              { role: 'WARDEN', desc: 'Hostel block management, resident directory, room occupancy metrics.' },
              { role: 'HOD', desc: 'Department-wide faculty roster, student breakdown, academic overview.' },
              { role: 'PARENT', desc: 'Direct visibility into child academic standing, hostel info, and mentor contacts.' },
            ].map((item) => (
              <div key={item.role} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-spsu-lightBlue text-spsu-blue border border-blue-200">
                  {item.role}
                </span>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-spsu-navy text-slate-300 py-8 px-6 text-center text-xs">
        <p className="font-semibold text-white">Sir Padampat Singhania University (SPSU), Udaipur</p>
        <p className="text-slate-400 mt-1">A JK Cement Initiative • Digital Campus Management Initiative (SIS v1.0)</p>
      </footer>
    </div>
  );
};
