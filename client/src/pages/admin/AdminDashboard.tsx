import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  Home,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const occupancyPercent =
    stats && stats.hostelCapacity > 0
      ? Math.round((stats.hostelOccupancy / stats.hostelCapacity) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Administrative Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sir Padampat Singhania University • Authoritative SIS v1.0
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} icon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Link to="/admin/students">
            <Button size="sm" icon={<PlusCircle size={14} />}>
              Manage Students
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Students"
          value={loading ? '...' : stats?.totalStudents || 0}
          subtitle="Enrolled active records"
          icon={<GraduationCap size={24} />}
        />
        <StatsCard
          title="Staff & Faculty"
          value={loading ? '...' : stats?.totalStaff || 0}
          subtitle="Professors, Mentors & Wardens"
          icon={<Users size={24} />}
        />
        <StatsCard
          title="Departments"
          value={loading ? '...' : stats?.totalDepartments || 0}
          subtitle="CSE, ECE, ME, CE & more"
          icon={<Building2 size={24} />}
        />
        <StatsCard
          title="Hostel Occupancy"
          value={loading ? '...' : `${stats?.hostelOccupancy || 0} / ${stats?.hostelCapacity || 0}`}
          subtitle={`${occupancyPercent}% total capacity`}
          icon={<Home size={24} />}
        />
      </div>

      {/* Department Breakdown & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-spsu-navy mb-4">Department Enrollment</h2>
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading breakdown...</div>
          ) : !stats?.deptBreakdown?.length ? (
            <div className="py-8 text-center text-slate-400 text-xs">No department data</div>
          ) : (
            <div className="space-y-4">
              {stats.deptBreakdown.map((dept) => {
                const pct =
                  stats.totalStudents > 0
                    ? Math.round((dept.count / stats.totalStudents) * 100)
                    : 0;
                return (
                  <div key={dept.code}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>
                        {dept.name} ({dept.code})
                      </span>
                      <span className="text-spsu-blue font-bold">
                        {dept.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-spsu-blue h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Student Admissions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-spsu-navy">Recently Registered Students</h2>
            <Link to="/admin/students" className="text-xs text-spsu-blue hover:underline font-semibold flex items-center gap-1">
              View All Directory <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading students...</div>
          ) : !stats?.recentStudents?.length ? (
            <div className="py-8 text-center text-slate-400 text-xs">No recent students found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Semester</th>
                    <th className="pb-3">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">
                        <div>{s.user?.name}</div>
                        <div className="text-[10px] text-slate-400">{s.user?.email}</div>
                      </td>
                      <td className="py-3 text-slate-600 font-mono">{s.rollNumber}</td>
                      <td className="py-3 text-slate-700 font-semibold">{s.department?.code}</td>
                      <td className="py-3 text-slate-600">Sem {s.semester}</td>
                      <td className="py-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          {s.cgpa.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
