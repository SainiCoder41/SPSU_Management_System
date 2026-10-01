import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { studentService } from '../../services/student.service.ts';
import { adminService } from '../../services/admin.service.ts';
import { Button } from '../../components/common/Button.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { SkeletonTable } from '../../components/common/Skeleton.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { Pagination } from '../../components/common/Pagination.tsx';
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  UserX,
  UserCheck,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [hostel, setHostel] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        page,
        limit: 20,
        search,
        branch,
        semester,
        hostel,
        gender,
        status,
      });
      setStudents(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [search, branch, semester, hostel, gender, status]);

  const handleStatusToggle = async (userId: string, currentIsActive: boolean) => {
    try {
      await adminService.updateUserStatus(userId, !currentIsActive);
      fetchStudents(pagination.page);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <DashboardLayout title="Student Directory">
      <div className="space-y-6">
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-spsu-navy">Student Records</h2>
            <p className="text-xs text-slate-500">
              Manage and search authoritative student profiles across SPSU
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/admin/export"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Directory
            </a>
            <Link to="/admin/import">
              <Button variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
                Import Students
              </Button>
            </Link>
            <Link to="/admin/students/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Add Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, enrollment, email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>

            {/* Semester Filter */}
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>

            {/* Hostel Filter */}
            <select
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue"
            >
              <option value="">All Hostels</option>
              <option value="BH1">BH1</option>
              <option value="BH2">BH2</option>
              <option value="BH3">BH3</option>
              <option value="BH4">BH4</option>
              <option value="GH1">GH1</option>
              <option value="GH2">GH2</option>
              <option value="GH3">GH3</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spsu-blue"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="GRADUATED">GRADUATED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <SkeletonTable rows={8} />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="No student profiles matched your query or filter parameters."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Enrollment No</th>
                    <th className="py-3.5 px-4">Branch & Sem</th>
                    <th className="py-3.5 px-4">Sec / Batch</th>
                    <th className="py-3.5 px-4">Hostel</th>
                    <th className="py-3.5 px-4">Mentor</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-spsu-light text-spsu-blue font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {s.userId?.firstName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-spsu-navy">{s.userId?.fullName}</div>
                            <div className="text-[11px] text-slate-400">{s.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {s.enrollmentNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-spsu-blue">{s.branch}</span>
                        <span className="text-slate-500 font-normal"> (Sem {s.semester})</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        Sec {s.section} • {s.batch}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.hostelId ? (
                          <Badge variant="info">{s.hostelId.code}</Badge>
                        ) : (
                          <span className="text-slate-400 italic">Day Scholar</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.mentorId ? (
                          <span className="text-slate-800 font-medium">{s.mentorId.fullName}</span>
                        ) : (
                          <span className="text-amber-600 text-[11px] font-semibold">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={s.currentStatus === 'ACTIVE' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {s.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/students/${s._id}`}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-spsu-blue transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(s.userId?._id, s.userId?.isActive)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-rose-600 transition-colors"
                            title={s.userId?.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {s.userId?.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination meta={pagination} onPageChange={(p) => fetchStudents(p)} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
