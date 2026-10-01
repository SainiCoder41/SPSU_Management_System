import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { SkeletonTable } from '../../components/common/Skeleton.tsx';
import { UserCheck, Search, GraduationCap } from 'lucide-react';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const res = await api.get('/mentor/students');
        setMentees(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch mentees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const filteredMentees = mentees.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.userId?.fullName?.toLowerCase().includes(q) ||
      m.enrollmentNumber?.toLowerCase().includes(q) ||
      m.branch?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Mentor Portal">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-600 to-spsu-blue text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.fullName}</h2>
            <p className="text-xs text-amber-100 mt-1">Assigned Mentees Dashboard</p>
          </div>
          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl font-extrabold text-xl">
            {mentees.length} Mentees
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentees by name, enrollment, branch..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
          />
        </div>

        {/* Mentee List Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredMentees.length === 0 ? (
          <EmptyState
            title="No mentees found"
            description="No students are currently assigned under your mentorship."
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
                    <th className="py-3.5 px-4">Section</th>
                    <th className="py-3.5 px-4">Hostel</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredMentees.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-spsu-navy">{m.userId?.fullName}</td>
                      <td className="py-3.5 px-4 font-mono">{m.enrollmentNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-spsu-blue">{m.branch}</span> (Sem {m.semester})
                      </td>
                      <td className="py-3.5 px-4">Section {m.section}</td>
                      <td className="py-3.5 px-4">
                        {m.hostelId ? <Badge variant="info">{m.hostelId.code}</Badge> : 'Day Scholar'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={m.currentStatus === 'ACTIVE' ? 'success' : 'danger'}>
                          {m.currentStatus}
                        </Badge>
                      </td>
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
