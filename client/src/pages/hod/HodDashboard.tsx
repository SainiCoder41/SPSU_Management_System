import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { SkeletonTable } from '../../components/common/Skeleton.tsx';
import { Building2, Users, GraduationCap } from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const { user } = useAuth();
  const [department, setDepartment] = useState<any>(null);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHodData = async () => {
      try {
        const [dRes, fRes, sRes] = await Promise.all([
          api.get('/hod/department'),
          api.get('/hod/faculty'),
          api.get('/hod/students'),
        ]);
        setDepartment(dRes.data.data);
        setFaculty(fRes.data.data || []);
        setStudents(sRes.data.data || []);
      } catch (err) {
        console.error('Failed to load HOD dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHodData();
  }, []);

  return (
    <DashboardLayout title="HOD Departmental Portal">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-800 to-spsu-navy text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Departmental Head Overview
            </span>
            <h2 className="text-2xl font-bold">
              {department ? department.name : 'Department Portal'}
            </h2>
            <p className="text-xs text-purple-100 mt-1">HOD: {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-center">
              <div className="text-xl font-extrabold">{students.length}</div>
              <div className="text-[10px] text-purple-200 uppercase font-semibold">Students</div>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-center">
              <div className="text-xl font-extrabold">{faculty.length}</div>
              <div className="text-[10px] text-purple-200 uppercase font-semibold">Faculty</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'students'
                ? 'border-spsu-blue text-spsu-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Enrolled Department Students ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'faculty'
                ? 'border-spsu-blue text-spsu-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Department Faculty ({faculty.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : activeTab === 'students' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Enrollment No</th>
                    <th className="py-3.5 px-4">Semester & Section</th>
                    <th className="py-3.5 px-4">Mentor</th>
                    <th className="py-3.5 px-4">Hostel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-spsu-navy">{s.userId?.fullName}</td>
                      <td className="py-3.5 px-4 font-mono">{s.enrollmentNumber}</td>
                      <td className="py-3.5 px-4">
                        Sem {s.semester} (Sec {s.section})
                      </td>
                      <td className="py-3.5 px-4">{s.mentorId ? s.mentorId.fullName : 'Unassigned'}</td>
                      <td className="py-3.5 px-4">
                        {s.hostelId ? <Badge variant="info">{s.hostelId.code}</Badge> : 'Day Scholar'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Employee ID</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Qualification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {faculty.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-spsu-navy">{f.userId?.fullName}</td>
                      <td className="py-3.5 px-4 font-mono">{f.employeeId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{f.designation}</td>
                      <td className="py-3.5 px-4 text-slate-600">{f.qualification || 'M.Tech / Ph.D'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
