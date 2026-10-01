import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { studentService } from '../../services/student.service.ts';
import { Badge } from '../../components/common/Badge.tsx';
import { Button } from '../../components/common/Button.tsx';
import { SkeletonCard } from '../../components/common/Skeleton.tsx';
import { User, BookOpen, Lock, ShieldCheck } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getMyProfile();
        setProfile(data);
        setPhone(data.userId?.phone || '');
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await studentService.updateStudent(profile._id, { user: { phone } });
      setSuccessMsg('Personal contact info updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to update contact info');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Student Profile">
        <SkeletonCard />
      </DashboardLayout>
    );
  }

  const u = profile?.userId || {};

  return (
    <DashboardLayout title="My Academic Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-spsu-blue text-white font-extrabold flex items-center justify-center text-2xl">
              {u.firstName?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-spsu-navy">{u.fullName}</h2>
              <div className="text-xs text-slate-500 font-mono">
                Enrollment: {profile?.enrollmentNumber} • Reg: {profile?.registrationNumber}
              </div>
            </div>
          </div>
          <Badge variant="success">Authoritative Profile</Badge>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* LOCKED ACADEMIC DATA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-spsu-navy text-sm">
              <BookOpen className="w-4 h-4 text-spsu-blue" />
              <span>Academic Specification (Institutional Lock)</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5" /> Read-Only for Students
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold block">Degree & Program</span>
              <span className="font-bold text-slate-800">{profile?.degree}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold block">Branch</span>
              <span className="font-bold text-spsu-blue">{profile?.branch}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold block">Semester & Section</span>
              <span className="font-bold text-slate-800">Sem {profile?.semester} (Sec {profile?.section})</span>
            </div>
          </div>
        </div>

        {/* EDITABLE PERSONAL CONTACT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-spsu-navy text-sm border-b border-slate-100 pb-3">
            Personal Contact Information
          </h3>

          <form onSubmit={handleUpdateContact} className="space-y-4 text-xs max-w-md">
            <div>
              <label className="block font-bold text-slate-700 mb-1">University Email (Read-Only)</label>
              <input
                type="email"
                disabled
                value={u.email}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number (Editable)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-spsu-blue"
              />
            </div>

            <Button type="submit" variant="primary" size="sm">
              Save Contact Info
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
