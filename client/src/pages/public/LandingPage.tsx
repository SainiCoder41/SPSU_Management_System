import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  Home,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageSquare,
  Bell,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { SpsuLogo } from '../../components/common/SpsuLogo.tsx';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-spsu-bg font-sans">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-subtle">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <SpsuLogo size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#hero" className="hover:text-spsu-blue transition-colors">
              Home
            </a>
            <a href="#features" className="hover:text-spsu-blue transition-colors">
              Platform Features
            </a>
            <a href="#future" className="hover:text-spsu-blue transition-colors">
              Future Roadmap
            </a>
            <a href="#about" className="hover:text-spsu-blue transition-colors">
              About SPSU
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-spsu-blue text-white font-semibold text-sm hover:bg-[#004799] transition-all shadow-sm hover:shadow"
            >
              <span>Login to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-white via-spsu-light/30 to-spsu-bg">
        {/* Subtle background abstract shapes */}
        <div className="absolute top-12 right-0 -mr-20 w-96 h-96 bg-spsu-blue/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-spsu-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-spsu-light text-spsu-blue text-xs font-bold uppercase tracking-wider border border-spsu-blue/20">
              <Sparkles className="w-4 h-4 text-spsu-blue" />
              SPSU Digital Campus • v1.0 Release
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-spsu-navy leading-tight tracking-tight">
              One Campus.{' '}
              <span className="bg-gradient-to-r from-spsu-blue to-spsu-cyan bg-clip-text text-transparent">
                One Connected System.
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              A secure digital platform connecting students, faculty, parents, wardens, and university administration across Sir Padampat Singhania University (JK Cement Initiative), Udaipur.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/login"
                className="px-7 py-3.5 rounded-xl bg-spsu-blue text-white font-bold text-base hover:bg-[#004799] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Login to Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-all shadow-sm"
              >
                Explore Platform
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80">
              <div>
                <div className="text-2xl font-extrabold text-spsu-navy">7 Roles</div>
                <div className="text-xs text-slate-500 font-medium">Single Authority Access</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-spsu-navy">100%</div>
                <div className="text-xs text-slate-500 font-medium">Digital SIS Foundation</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-spsu-navy">7 Hostels</div>
                <div className="text-xs text-slate-500 font-medium">Integrated Warden Mapping</div>
              </div>
            </div>
          </div>

          {/* Right Visual Illustration */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <SpsuLogo size="sm" />
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Portal
                </span>
              </div>

              {/* Sample Card Previews */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-spsu-light/50 border border-spsu-blue/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-spsu-blue text-white flex items-center justify-center font-bold text-sm">
                      AK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-spsu-navy">Aarav Kapur</div>
                      <div className="text-[11px] text-slate-500">B.Tech CSE • Semester 5</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-spsu-blue text-white">
                    BH2 Resident
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-spsu-navy text-white flex items-center justify-center font-bold text-sm">
                      HOD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-spsu-navy">Dept. of Computer Science</div>
                      <div className="text-[11px] text-slate-500">Dr. Rajesh Sharma • CSE</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Department
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                      MNT
                    </div>
                    <div>
                      <div className="text-xs font-bold text-spsu-navy">Mentor Mapping</div>
                      <div className="text-[11px] text-slate-500">Prof. Sanya Mehta • 24 Mentees</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Faculty
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400 font-medium">
                SPSU Enterprise Infrastructure • Encryption Enabled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-spsu-blue">
              Core SIS Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-spsu-navy">
              One Platform for the SPSU Community
            </p>
            <p className="text-slate-600 text-sm">
              Version 1.0 establishes the authoritative foundation for all student, staff, hostel, and institutional data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-spsu-bg border border-slate-200/80 hover:shadow-cardHover transition-all">
              <div className="w-12 h-12 rounded-xl bg-spsu-light text-spsu-blue flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-spsu-navy mb-2">Student Information System</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Centralized student profiles containing academic history, enrollment numbers, branches, semesters, sections, and emergency contact details.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-spsu-bg border border-slate-200/80 hover:shadow-cardHover transition-all">
              <div className="w-12 h-12 rounded-xl bg-spsu-light text-spsu-blue flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-spsu-navy mb-2">Faculty & Mentor Mapping</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct mentor-mentee linkages enabling professors to monitor assigned students, track academic progress, and provide institutional guidance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-spsu-bg border border-slate-200/80 hover:shadow-cardHover transition-all">
              <div className="w-12 h-12 rounded-xl bg-spsu-light text-spsu-blue flex items-center justify-center mb-4">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-spsu-navy mb-2">Hostel Administration</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Integrated mapping across BH1-BH4 and GH1-GH3 hostels with dedicated warden access control and privacy enforcement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-spsu-bg border border-slate-200/80 hover:shadow-cardHover transition-all">
              <div className="w-12 h-12 rounded-xl bg-spsu-light text-spsu-blue flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-spsu-navy mb-2">Department & HOD Hierarchy</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Departmental organization (CSE, ECE, ME, CE) with HOD supervisory access over departmental faculty and enrolled students.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-spsu-bg border border-slate-200/80 hover:shadow-cardHover transition-all">
              <div className="w-12 h-12 rounded-xl bg-spsu-light text-spsu-blue flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-spsu-navy mb-2">Secure RBAC Access Control</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                7 distinct role-based permissions (Admin, Student, Faculty, Mentor, Warden, HOD, Parent) ensuring data privacy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-spsu-bg border border-slate-200/80 hover:shadow-cardHover transition-all">
              <div className="w-12 h-12 rounded-xl bg-spsu-light text-spsu-blue flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-spsu-navy mb-2">Bulk CSV / Excel Import</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seamless onboarding for new admissions via batch spreadsheet parsing, validation checking, and automated hostel resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FUTURE MODULES TEASER */}
      <section id="future" className="py-20 bg-spsu-bg border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              System Expansion
            </span>
            <h2 className="text-3xl font-extrabold text-spsu-navy">Future Platform Modules</h2>
            <p className="text-slate-600 text-sm">
              Version 1.0 identity relationships are built to power subsequent enterprise modules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle opacity-90 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v2.0 • Coming Soon
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Leave Management</h4>
              <p className="text-xs text-slate-500">
                Multi-tier leave requests & digital outing permissions for hostel residents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle opacity-90 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v3.0 • Coming Soon
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Events & Permissions</h4>
              <p className="text-xs text-slate-500">
                Campus event approvals, venue reservations, and student RSVPs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle opacity-90 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v3.5 • Coming Soon
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Grievance Portal</h4>
              <p className="text-xs text-slate-500">
                Hostel and academic grievance registration with ticket resolution tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle opacity-90 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v4.0 • Coming Soon
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Notice Board & Comms</h4>
              <p className="text-xs text-slate-500">
                Broadcast circulars, departmental announcements, and emergency alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-spsu-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-white/10 pb-8">
          <div className="md:col-span-6 space-y-2">
            <SpsuLogo variant="white" size="md" />
            <p className="text-xs text-slate-400 max-w-md pt-2">
              Sir Padampat Singhania University (JK Cement Initiative), Bhatewar, Udaipur, Rajasthan 313601.
            </p>
          </div>
          <div className="md:col-span-6 text-left md:text-right text-xs text-slate-400 space-y-1">
            <div>SPSU Campus Management System • Version 1.0 (SIS Foundation)</div>
            <div>© {new Date().getFullYear()} Sir Padampat Singhania University. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
