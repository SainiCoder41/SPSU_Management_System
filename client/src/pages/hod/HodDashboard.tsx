import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portalService } from '../../services/portalService';
import { Department, Staff, Student } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { Award, Users, GraduationCap, Building2, BookOpen } from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    department?: Department;
    facultyCount?: number;
    studentCount?: number;
    semesterDistribution?: Record<number, number>;
    facultyMembers?: Staff[];
    students?: Student[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await portalService.getHodOverview();
      setData(res);
    } catch (err) {
      console.error('Error fetching HOD overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
            Department Leadership Portal
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Head of Department (HOD) • {data?.department?.name} ({data?.department?.code})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 text-indigo-800 text-xs font-semibold">
          <Award size={16} />
          <span>Department Chair</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Department Students"
          value={loading ? '...' : data?.studentCount || 0}
          subtitle="Enrolled under this branch"
          icon={<GraduationCap size={22} />}
        />
        <StatsCard
          title="Faculty Members"
          value={loading ? '...' : data?.facultyCount || 0}
          subtitle="Professors & Lecturers"
          icon={<Users size={22} />}
        />
        <StatsCard
          title="Academic Program"
          value="B.Tech"
          subtitle="4-Year Undergraduate Track"
          icon={<BookOpen size={22} />}
        />
      </div>

      {/* Semester Breakdown */}
      {data?.semesterDistribution && Object.keys(data.semesterDistribution).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-spsu-navy uppercase tracking-wider mb-3">
            Semester-Wise Student Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
              const count = data.semesterDistribution?.[sem] || 0;
              return (
                <div key={sem} className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Sem {sem}</div>
                  <div className="text-lg font-bold text-spsu-navy mt-0.5">{count}</div>
                  <div className="text-[10px] text-slate-400">students</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabbed View: Students / Faculty */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'students'
                ? 'border-spsu-blue text-spsu-blue font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Enrolled Students ({data?.students?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'faculty'
                ? 'border-spsu-blue text-spsu-blue font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Department Faculty Roster ({data?.facultyMembers?.length || 0})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'students' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading students...
                      </td>
                    </tr>
                  ) : !data?.students?.length ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No students enrolled in this department.
                      </td>
                    </tr>
                  ) : (
                    data.students.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{s.user?.name}</div>
                          <div className="text-[11px] text-slate-400">{s.user?.email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">{s.rollNumber}</td>
                        <td className="py-3 px-4 text-slate-600">Sem {s.semester}</td>
                        <td className="py-3 px-4 text-slate-600 font-semibold">{s.section}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                            {s.cgpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {s.mentor?.user?.name || 'Unassigned'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Office</th>
                    <th className="py-3 px-4">Contact Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Loading faculty roster...
                      </td>
                    </tr>
                  ) : !data?.facultyMembers?.length ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No faculty members registered in this department.
                      </td>
                    </tr>
                  ) : (
                    data.facultyMembers.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{f.user?.name}</div>
                          <div className="text-[11px] text-slate-400">{f.user?.email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">{f.employeeId}</td>
                        <td className="py-3 px-4 text-slate-600">{f.designation}</td>
                        <td className="py-3 px-4 text-slate-600">{f.officeLocation || 'Main Campus'}</td>
                        <td className="py-3 px-4 text-slate-600">{f.user?.phone || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
