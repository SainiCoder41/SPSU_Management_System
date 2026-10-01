import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { studentService } from '../../services/student.service.ts';
import { Badge } from '../../components/common/Badge.tsx';
import { SkeletonCard } from '../../components/common/Skeleton.tsx';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Home,
  Shield,
  Clock,
  Calendar,
  MessageSquare,
  Bell,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Student Portal">
        <SkeletonCard />
      </DashboardLayout>
    );
  }

  const u = profile?.userId || user;

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-8">
        {/* Student Welcome Banner */}
        <div className="bg-gradient-to-r from-spsu-navy via-spsu-blue to-spsu-cyan text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white text-spsu-blue font-extrabold flex items-center justify-center text-3xl shadow-md border-2 border-white/20">
                {u?.firstName?.charAt(0) || 'S'}
              </div>
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Enrolled Student
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {u?.firstName}</h2>
                <p className="text-xs sm:text-sm text-blue-100/90 font-mono">
                  Enrollment: <span className="font-bold text-white">{profile?.enrollmentNumber}</span> • Roll: {profile?.rollNumber}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-bold">
                {profile?.branch} Dept
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-bold">
                Semester {profile?.semester}
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-bold">
                Sec {profile?.section}
              </span>
            </div>
          </div>
        </div>

        {/* Core Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Academic Placement */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-spsu-blue font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Academic Overview
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div><span className="font-semibold text-slate-500">Degree:</span> {profile?.degree}</div>
              <div><span className="font-semibold text-slate-500">Branch:</span> <span className="font-bold text-spsu-blue">{profile?.branch}</span></div>
              <div><span className="font-semibold text-slate-500">Semester:</span> {profile?.semester}</div>
              <div><span className="font-semibold text-slate-500">Batch / Sec:</span> {profile?.batch} ({profile?.section})</div>
            </div>
          </div>

          {/* Assigned Mentor Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4" /> Faculty Mentor
            </div>
            {profile?.mentorId ? (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-bold text-spsu-navy text-sm">{profile.mentorId.fullName}</div>
                <div className="text-slate-500">{profile.mentorId.email}</div>
                <div className="text-slate-500">{profile.mentorId.phone || 'N/A'}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No mentor assigned yet</div>
            )}
          </div>

          {/* Assigned Hostel & Warden Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Home className="w-4 h-4" /> Hostel Residence
            </div>
            {profile?.hostelId ? (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-bold text-emerald-800 text-sm">Hostel {profile.hostelId.code}</div>
                <div className="text-slate-600">
                  Warden: {profile.hostelId.wardenId ? profile.hostelId.wardenId.fullName : 'Mr/Ms Warden'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">Day Scholar (No Hostel Residence)</div>
            )}
          </div>

          {/* Parent Mapping Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Linked Guardian
            </div>
            {profile?.parentIds && profile.parentIds.length > 0 ? (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-bold text-spsu-navy">{profile.parentIds[0].userId?.fullName}</div>
                <div className="text-slate-500 font-medium">{profile.parentIds[0].relation}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">Parent profile linked</div>
            )}
          </div>
        </div>

        {/* FUTURE MODULE PLACEHOLDERS (DISABLED / COMING SOON CARDS) */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-spsu-navy uppercase tracking-wider">
              Upcoming Student Modules
            </h3>
            <span className="text-xs text-slate-400 font-medium">Future System Release</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2 opacity-75 relative">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v2.0 • Coming Soon
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Leave Applications</h4>
              <p className="text-xs text-slate-500">
                Apply for outstation leave, day outings, and gate pass approvals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2 opacity-75 relative">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v3.0 • Coming Soon
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Campus Events</h4>
              <p className="text-xs text-slate-500">
                Browse university events, workshops, cultural fests, and RSVPs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2 opacity-75 relative">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v3.5 • Coming Soon
              </span>
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Grievance Portal</h4>
              <p className="text-xs text-slate-500">
                Submit complaints regarding hostel, IT, or academic facilities.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2 opacity-75 relative">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                v4.0 • Coming Soon
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Notice Board</h4>
              <p className="text-xs text-slate-500">
                View official SPSU circulars, examination timetables, and alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
