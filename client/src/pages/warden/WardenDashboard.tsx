import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { SkeletonTable } from '../../components/common/Skeleton.tsx';
import { Home, Search, Users } from 'lucide-react';

export const WardenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hostel, setHostel] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchWardenData = async () => {
      try {
        const [hRes, rRes] = await Promise.all([
          api.get('/warden/hostel'),
          api.get('/warden/students'),
        ]);
        setHostel(hRes.data.data);
        setResidents(rRes.data.data || []);
      } catch (err) {
        console.error('Failed to load warden data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWardenData();
  }, []);

  const filteredResidents = residents.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.userId?.fullName?.toLowerCase().includes(q) ||
      r.enrollmentNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Hostel Warden Portal">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-700 to-spsu-navy text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {hostel ? `Hostel ${hostel.code} Dashboard` : 'Warden Residence Portal'}
            </h2>
            <p className="text-xs text-emerald-100 mt-1">Appointed Warden: {user?.fullName}</p>
          </div>
          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl font-extrabold text-xl">
            {hostel?.residentCount || residents.length} Residents
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hostel residents by name, enrollment..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
          />
        </div>

        {/* Resident List Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredResidents.length === 0 ? (
          <EmptyState
            title="No hostel residents found"
            description="There are currently no students registered in your assigned hostel."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Resident Student</th>
                    <th className="py-3.5 px-4">Enrollment No</th>
                    <th className="py-3.5 px-4">Branch & Sem</th>
                    <th className="py-3.5 px-4">Mentor Contact</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredResidents.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-spsu-navy">{r.userId?.fullName}</td>
                      <td className="py-3.5 px-4 font-mono">{r.enrollmentNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-spsu-blue">{r.branch}</span> (Sem {r.semester})
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {r.mentorId ? r.mentorId.fullName : 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={r.currentStatus === 'ACTIVE' ? 'success' : 'danger'}>
                          {r.currentStatus}
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
