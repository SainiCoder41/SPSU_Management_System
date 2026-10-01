import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { adminService } from '../../services/admin.service.ts';
import { SkeletonCard } from '../../components/common/Skeleton.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import {
  GraduationCap,
  Users,
  UserCheck,
  Home,
  Building2,
  Upload,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Admin Overview">
      <div className="space-y-8">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-spsu-navy to-spsu-blue text-white p-6 rounded-2xl shadow-md">
          <div>
            <h2 className="text-2xl font-bold">Good morning, Admin</h2>
            <p className="text-sm text-blue-100/90 mt-1">
              Here’s what is happening across Sir Padampat Singhania University today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/students/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-spsu-navy font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Student
            </Link>
            <Link
              to="/admin/import"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-spsu-cyan text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </Link>
          </div>
        </div>

        {/* Stats Row 1 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-cardHover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Students
                </span>
                <div className="p-2.5 rounded-xl bg-spsu-light text-spsu-blue">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-spsu-navy">
                {stats?.totalStudents || 0}
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stats?.activeStudents || 0} Currently Active</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-cardHover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Faculty & Staff
                </span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-spsu-navy">
                {stats?.totalFaculty || 0}
              </div>
              <div className="mt-1 text-xs text-slate-500">Professors & Instructors</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-cardHover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Mentors
                </span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-spsu-navy">
                {stats?.totalMentors || 0}
              </div>
              <div className="mt-1 text-xs text-slate-500">Assigned Mentorships</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-cardHover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Wardens
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Home className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-spsu-navy">
                {stats?.totalWardens || 0}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {stats?.totalHostels || 7} Hostels Managed
              </div>
            </div>
          </div>
        )}

        {/* Second Row: Breakdown Charts / Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
            <h3 className="text-base font-bold text-spsu-navy mb-4">Students by Branch</h3>
            <div className="space-y-3">
              {stats?.studentsByBranch?.map((b: any) => (
                <div key={b._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{b._id || 'Unassigned'}</span>
                    <span>{b.count} Students</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-spsu-blue rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (b.count / (stats?.totalStudents || 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semester Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
            <h3 className="text-base font-bold text-spsu-navy mb-4">Students by Semester</h3>
            <div className="space-y-3">
              {stats?.studentsBySemester?.map((s: any) => (
                <div key={s._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Semester {s._id}</span>
                    <span>{s.count} Students</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-spsu-cyan rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (s.count / (stats?.totalStudents || 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hostel Occupancy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
            <h3 className="text-base font-bold text-spsu-navy mb-4">Hostel Residents</h3>
            <div className="space-y-3">
              {stats?.studentsByHostel?.map((h: any) => (
                <div key={h._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Hostel {h._id}</span>
                    <span>{h.count} Residents</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (h.count / 40) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users Directory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-spsu-navy">Recently Onboarded Users</h3>
              <p className="text-xs text-slate-500">Latest accounts provisioned across the platform</p>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-bold text-spsu-blue hover:underline flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-6">User Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {stats?.recentUsers?.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-spsu-navy">{u.fullName}</td>
                    <td className="py-3.5 px-6 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-6">
                      <Badge variant="primary" size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
