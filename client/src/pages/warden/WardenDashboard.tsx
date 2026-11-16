import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portalService } from '../../services/portalService';
import { Student, Hostel } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { Home, Users, Search, Phone, Mail, UserCheck } from 'lucide-react';

export const WardenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [residents, setResidents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const data = await portalService.getWardenResidents();
      setHostel(data.hostel);
      setResidents(data.residents || []);
    } catch (err) {
      console.error('Error fetching warden residents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const filteredResidents = residents.filter(
    (s) =>
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const capacity = hostel?.capacity || 100;
  const occupancy = residents.length;
  const occupancyPct = Math.round((occupancy / capacity) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Hostel Administration Portal
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chief Warden • Assigned Block: <span className="font-bold text-spsu-blue">{hostel?.name || 'BH2'}</span> ({hostel?.type || 'BOYS'})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold">
          <Home size={16} />
          <span>{hostel?.description || 'Boys Hostel 2'}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Assigned Hostel Block"
          value={hostel?.name || 'BH2'}
          subtitle={`${hostel?.type || 'BOYS'} Hostel`}
          icon={<Home size={22} />}
        />
        <StatsCard
          title="Occupancy Status"
          value={`${occupancy} / ${capacity}`}
          subtitle={`${occupancyPct}% beds occupied`}
          icon={<Users size={22} />}
        />
        <StatsCard
          title="Vacant Beds"
          value={Math.max(0, capacity - occupancy)}
          subtitle="Available for allocation"
          icon={<Home size={22} />}
        />
      </div>

      {/* Residents List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-spsu-navy">Hostel Resident Directory</h2>
            <p className="text-xs text-slate-500">Students residing in {hostel?.name || 'assigned hostel block'}</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resident or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-spsu-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Room No</th>
                <th className="py-3 px-4">Resident Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Branch & Sem</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Assigned Mentor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading resident directory...
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No resident students found.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-spsu-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {s.roomNumber || 'Room N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{s.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{s.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.department?.code} • Sem {s.semester}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.user?.phone || 'Not Recorded'}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {s.mentor?.user?.name || 'Unassigned'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
