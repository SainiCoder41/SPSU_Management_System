import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import {
  GraduationCap,
  Building,
  Users,
  CalendarCheck,
  Sparkles,
  Ticket,
  LifeBuoy,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  CalendarCheck2,
  Award,
  Bot,
  BrainCircuit,
  BookOpen,
  Briefcase,
  DoorOpen,
  Smartphone,
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
            <p className="text-[11px] text-[#0057B8] font-semibold mt-0.5">Enterprise Campus Management Suite (v1.0 – v7.0 Complete)</p>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0057B8] text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0057B8] animate-pulse"></span>
            A JK Cement Initiative • Udaipur, Rajasthan • Complete Enterprise Platform (v1.0 to v7.0)
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-spsu-navy tracking-tight leading-tight">
            Next-Gen Campus Life, Academics & AI-Driven Administration
          </h2>
          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive, role-governed ERP unifying students, faculty, mentors, wardens, department heads, and parents — featuring SIS, automated leaves, campus events, gate passes, grievance redressal, attendance, UGC grading, early warning AI, NLP automation, library, and campus placements.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/login">
              <Button size="lg" icon={<ArrowRight size={18} />}>
                Access Portal Login
              </Button>
            </Link>
            <a
              href="#modules"
              className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-xs"
            >
              Explore All 11 Modules (v1.0 – v7.0)
            </a>
          </div>
        </div>
      </section>

      {/* Enterprise Modules Grid (v1.0 to v7.0) */}
      <section id="modules" className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0057B8] uppercase tracking-wider">Enterprise Architecture</span>
          <h3 className="text-2xl font-bold text-spsu-navy mt-1">Integrated Campus Platform Roadmap (v1.0 – v7.0)</h3>
          <p className="text-slate-500 text-sm mt-1">Full production lifecycle implemented and rigorously tested across 11 core iterations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* v1.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0057B8]">
                <GraduationCap size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#0057B8]">v1.0 SIS</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Student Information System</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Complete student profiles, enrollment numbers, program degrees (B.Tech, M.Tech), hostel blocks (BH1–BH4, GH1–GH3), room allocations, and mentor mapping across 7 RBAC roles.
            </p>
          </div>

          {/* v2.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <CalendarCheck size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">v2.0 Leaves</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Multi-Tier Leave Workflow</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automated leave applications with date-overlap guards, sequential hierarchy routing (Mentors, Wardens, HODs), dynamic quota balances, and full audit logs.
            </p>
          </div>

          {/* v3.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Ticket size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">v3.0 Events & Passes</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Events & Outing Gate Passes</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Campus event catalog with capacity-limited RSVPs, participant Excel export, gate passes with dual Warden & Parent sign-off, and leave overlap conflict checks.
            </p>
          </div>

          {/* v3.5 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <LifeBuoy size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">v3.5 Grievances</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Grievance & Redressal Desk</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transparent ticket tracking (GRV-2026-XXXX), anonymous reporting toggle, direct zero-tolerance Anti-Ragging escalation to Designated Authority, and internal notes.
            </p>
          </div>

          {/* v4.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Bell size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">v4.0 Notices & Alerts</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Campus Circulars & Notification Hub</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Audience-targeted university notices with urgent priority and pinned announcements, paired with a unified top-bar real-time notification bell and unread badge.
            </p>
          </div>

          {/* v4.5 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">v4.5 Hardening</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Hardening & Compliance</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive audit log trail, soft-deactivation preserving data integrity, multi-role user authorization, 5-attempt account lockout, and staff bulk import/export.
            </p>
          </div>

          {/* v5.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <CalendarCheck2 size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">v5.0 Attendance</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Attendance & Timetable</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Subject roll-call, cumulative and subject-wise attendance percentages, room/faculty double-booking clash detection, and automated approved leave waivers (ATT-007).
            </p>
          </div>

          {/* v5.5 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
                <Award size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">v5.5 Academics</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Academics & Analytics</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Continuous evaluation marks entry, automated UGC/AICTE letter grading, SGPA/CGPA computation, HOD department metrics, and Digital Student ID Cards with verifiable QR.
            </p>
          </div>

          {/* v6.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-700">
                <Bot size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-900">v6.0 AI Insights</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Dropout Predictor & Assistant</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Early warning risk index evaluating attendance and marks dips with plain-English factors, strict non-punitive advisory constraint (AI-007), and privacy-guarded Campus AI Chatbot.
            </p>
          </div>

          {/* v6.5 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-700">
                <BrainCircuit size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-100 text-violet-900">v6.5 AI Automation</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Smart NLP & Anomaly Detection</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              NLP complaint classifier, automated anti-ragging escalation, leave pattern anomaly detection (Friday-Monday habitual clustering), natural language search, and Hindi notice translation.
            </p>
          </div>

          {/* v7.0 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-700">
                <BookOpen size={24} />
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-900">v7.0 Services & Reach</span>
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2">Campus Services & PWA</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Central Library catalog with loan tracking and overdue fine calculation, Training & Placement recruitment portal, hostel gate visitor registers, and installable PWA mobile readiness.
            </p>
          </div>
        </div>
      </section>

      {/* RBAC Roles Matrix */}
      <section id="roles" className="py-16 px-6 md:px-12 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#0057B8] uppercase tracking-wider">Granular Security</span>
            <h3 className="text-2xl font-bold text-spsu-navy mt-1">7 Role-Based Portals</h3>
            <p className="text-slate-500 text-sm mt-1">Pre-configured demo accounts are available on the login page</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'ADMIN', desc: 'Full SIS control, student/staff CRUD, Excel batch import/export, leave policies, grievance desk, notice board, and sensitive cases designated authority.' },
              { role: 'STUDENT', desc: 'Academic profile, hostel room, leave applications, gate passes, event RSVP, grievance portal, attendance summary, marksheet, and library borrowing.' },
              { role: 'FACULTY', desc: 'Faculty dashboard, marks & grading entry, roll-call attendance, participant roster export, student directory, leave approvals, and grievance desk.' },
              { role: 'MENTOR', desc: 'Assigned student mentees list, AI early warning needs-attention list, academic guidance, mentee leave approvals queue, and grievance desk.' },
              { role: 'WARDEN', desc: 'Hostel block management, resident directory, hostel leave approvals, resident outing gate pass review, campus visitor registers, and grievance resolution.' },
              { role: 'HOD', desc: 'Department-wide faculty roster, student breakdown, timetable coordination, department analytics, and department leave approvals.' },
              { role: 'PARENT', desc: 'Direct visibility into child academic standing, attendance progress, hostel info, overnight outing pass sign-off authorization, and campus circulars.' },
            ].map((item) => (
              <div key={item.role} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-[#0057B8] border border-blue-200">
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
        <p className="text-slate-400 mt-1">A JK Cement Initiative • Digital Campus Management Suite (Release v1.0 – v7.0 Complete)</p>
      </footer>
    </div>
  );
};
