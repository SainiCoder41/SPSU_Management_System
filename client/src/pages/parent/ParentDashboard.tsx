import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { SkeletonCard } from '../../components/common/Skeleton.tsx';
import { GraduationCap, UserCheck, Home, Clock, ShieldCheck } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedStudents = async () => {
      try {
        const res = await api.get('/parent/students');
        setStudents(res.data.data || []);
      } catch (err) {
        console.error('Failed to load linked students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinkedStudents();
  }, []);

  return (
    <DashboardLayout title="Parent Portal">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-800 to-spsu-navy text-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold">Welcome, {user?.fullName}</h2>
          <p className="text-xs text-indigo-100 mt-1">SPSU Parent Guardian Portal</p>
        </div>

        {loading ? (
          <SkeletonCard />
        ) : students.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border text-slate-500">
            No student profile is currently linked to your parent account.
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-spsu-navy uppercase tracking-wider">Linked Student Record</h3>

            {students.map((s) => (
              <div key={s._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-spsu-blue text-white font-extrabold flex items-center justify-center text-xl">
                    {s.userId?.firstName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-spsu-navy">{s.userId?.fullName}</h4>
                    <div className="text-xs text-slate-500 font-mono">
                      Enrollment: <span className="font-bold text-slate-800">{s.enrollmentNumber}</span> • Roll: {s.rollNumber}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Program & Branch</span>
                    <span className="font-extrabold text-spsu-blue text-sm">{s.branch}</span>
                    <span className="text-slate-600 block mt-0.5">{s.degree}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Current Progress</span>
                    <span className="font-bold text-slate-800 text-sm">Semester {s.semester}</span>
                    <span className="text-slate-600 block mt-0.5">Section {s.section} ({s.batch})</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Faculty Mentor</span>
                    <span className="font-bold text-slate-800 block text-sm">
                      {s.mentorId ? s.mentorId.fullName : 'Unassigned'}
                    </span>
                    {s.mentorId?.email && <span className="text-slate-500 block truncate">{s.mentorId.email}</span>}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Hostel Residence</span>
                    <span className="font-bold text-emerald-700 block text-sm">
                      {s.hostelId ? `Hostel ${s.hostelId.code}` : 'Day Scholar'}
                    </span>
                    {s.hostelId?.wardenId && (
                      <span className="text-slate-500 block truncate">Warden: {s.hostelId.wardenId.fullName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* FUTURE PLACEHOLDER */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-2 opacity-80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-spsu-blue">
                  Future Module Feature
                </span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                  v2.0 Leave Management
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Parent Outing & Leave Approvals</h4>
              <p className="text-xs text-slate-500">
                In v2.0, parents will receive real-time notifications to review and approve student outstation leave requests online.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
