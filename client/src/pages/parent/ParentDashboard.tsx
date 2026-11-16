import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portalService } from '../../services/portalService';
import { permissionService } from '../../services/permissionService';
import { Student, ParentRecord } from '../../types';
import { PermissionRequest } from '../../types/permission';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import {
  Shield,
  GraduationCap,
  Award,
  BookOpen,
  Home,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [parentRecord, setParentRecord] = useState<ParentRecord | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [pendingPasses, setPendingPasses] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParentInfo = async () => {
    setLoading(true);
    try {
      const [res, queue] = await Promise.all([
        portalService.getParentStudent(),
        permissionService.getParentQueue(),
      ]);
      setParentRecord(res.parent);
      setStudent(res.student);
      setPendingPasses(queue);
    } catch (err) {
      console.error('Error fetching parent student info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentInfo();
  }, []);

  const handleSignOff = async (id: string, action: 'Approved' | 'Rejected') => {
    const comments =
      action === 'Approved'
        ? 'Parent confirmed and granted permission for overnight stay.'
        : 'Parent denied overnight stay permission.';
    try {
      await permissionService.signOffParentPermission(id, action, comments);
      fetchParentInfo();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating sign-off');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
            Parent & Guardian Portal
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {parentRecord?.relation || 'Parent'} of{' '}
            <span className="font-bold text-spsu-blue">{student?.user?.name || 'Aarav Verma'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-800 text-xs font-semibold">
          <Shield size={16} />
          <span>Verified Family Account</span>
        </div>
      </div>

      {/* KPI Stats of Linked Student */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatsCard
          title="Student Ward"
          value={student?.user?.name || 'N/A'}
          subtitle={`Roll: ${student?.rollNumber || 'N/A'}`}
          icon={<GraduationCap size={22} />}
        />
        <StatsCard
          title="Academic Progress"
          value={student?.cgpa ? `${student.cgpa.toFixed(2)} CGPA` : 'N/A'}
          subtitle="Cumulative Grade Point"
          icon={<Award size={22} />}
        />
        <StatsCard
          title="Current Standing"
          value={`Semester ${student?.semester || 1}`}
          subtitle={`${student?.department?.code || 'CSE'} - Section ${student?.section || 'A'}`}
          icon={<BookOpen size={22} />}
        />
        <StatsCard
          title="Campus Residence"
          value={student?.hostel?.name || 'Day Scholar'}
          subtitle={student?.roomNumber ? `Room ${student.roomNumber}` : 'Day Scholar'}
          icon={<Home size={22} />}
        />
      </div>

      {/* Outing / Gate Pass Sign-Off Requests (PER-003) */}
      {pendingPasses.length > 0 && (
        <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <Clock size={18} />
            <h2 className="text-base font-bold">
              Parental Authorization Required ({pendingPasses.length} Outing Requests)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Your ward has applied for an overnight stay that requires formal parent approval before the hostel warden can release the gate pass.
          </p>

          <div className="space-y-3">
            {pendingPasses.map((pass) => (
              <div
                key={pass._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {pass.permissionType?.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                      Parent Sign-off Pending
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium">Destination:</span> {pass.destination} •{' '}
                    <span className="font-medium">Departure:</span>{' '}
                    {new Date(pass.startDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} •{' '}
                    <span className="font-medium">Return:</span>{' '}
                    {new Date(pass.endDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="text-slate-500">
                    <span className="font-medium">Reason:</span> {pass.reason}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleSignOff(pass._id, 'Approved')}
                    icon={<CheckCircle size={14} />}
                  >
                    Grant Parent Approval
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleSignOff(pass._id, 'Rejected')}
                    icon={<XCircle size={14} />}
                  >
                    Deny Permission
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Child Academic & Residential Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-spsu-navy flex items-center gap-2">
            <GraduationCap size={18} className="text-spsu-blue" />
            Ward Academic Information
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="text-slate-500 font-medium">Program & Degree</span>
              <span className="font-bold text-slate-800 text-sm">
                {student?.program} in {student?.department?.name}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="text-slate-500 font-medium">Enrollment Number</span>
              <span className="font-mono font-bold text-spsu-navy text-sm">
                {student?.enrollmentNumber}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="text-slate-500 font-medium">Admission Batch</span>
              <span className="font-semibold text-slate-700">
                Class of {student?.admissionYear}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <span className="text-slate-500 font-medium">Institutional Email</span>
              <span className="font-medium text-slate-700">{student?.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Assigned Mentor & Hostel Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-spsu-navy flex items-center gap-2">
            <UserCheck size={18} className="text-spsu-blue" />
            Mentor & Hostel Warden Inquiries
          </h2>

          <div className="space-y-4 text-xs">
            {/* Mentor info */}
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-spsu-blue block">
                Assigned Faculty Mentor
              </span>
              <div className="font-bold text-slate-800 text-sm">
                {student?.mentor?.user?.name || 'Prof. Vikram Singh'}
              </div>
              <div className="text-slate-500">
                {student?.mentor?.designation || 'Assistant Professor & Chief Student Mentor'}
              </div>
              <div className="flex items-center gap-2 text-slate-600 pt-1">
                <Mail size={13} className="text-slate-400" />
                <span>{student?.mentor?.user?.email || 'mentor.cse@spsu.ac.in'}</span>
              </div>
            </div>

            {/* Hostel info */}
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Hostel Residential Warden
              </span>
              <div className="font-bold text-slate-800 text-sm">
                {student?.hostel?.name || 'BH2'} - Room {student?.roomNumber || 'B-204'}
              </div>
              <div className="text-slate-500">
                Chief Warden: {student?.hostel?.warden?.user?.name || 'Mr. Arvind Chauhan'}
              </div>
              <div className="flex items-center gap-2 text-slate-600 pt-1">
                <Mail size={13} className="text-slate-400" />
                <span>{student?.hostel?.warden?.user?.email || 'warden.bh2@spsu.ac.in'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
