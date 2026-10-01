import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { hostelService } from '../../services/hostel.service.ts';
import { adminService } from '../../services/admin.service.ts';
import { Button } from '../../components/common/Button.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { Home, UserCheck } from 'lucide-react';

export const HostelsPage: React.FC = () => {
  const [hostels, setHostels] = useState<any[]>([]);
  const [wardenUsers, setWardenUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showWardenModal, setShowWardenModal] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [selectedWardenId, setSelectedWardenId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hData, wData] = await Promise.all([
        hostelService.getHostels(),
        adminService.getUsers({ role: 'WARDEN' }),
      ]);
      setHostels(hData || []);
      const allUsers = await adminService.getUsers({ limit: 100 });
      setWardenUsers(allUsers.data?.filter((u: any) => ['WARDEN', 'FACULTY'].includes(u.role)) || []);
    } catch (err) {
      console.error('Failed to load hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostelId || !selectedWardenId) return;
    try {
      await hostelService.assignWarden(selectedHostelId, selectedWardenId);
      setShowWardenModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign warden');
    }
  };

  return (
    <DashboardLayout title="Hostel Administration">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-spsu-navy">Hostel Residences</h2>
          <p className="text-xs text-slate-500">
            Overview of Boys Hostels (BH1-BH4) & Girls Hostels (GH1-GH3) and Warden assignments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((h) => (
            <div key={h._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base ${
                      h.gender === 'MALE' ? 'bg-blue-50 text-spsu-blue' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {h.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-spsu-navy text-base">Hostel {h.code}</h3>
                    <span className="text-xs text-slate-500 font-semibold">{h.gender} Residence</span>
                  </div>
                </div>
                <Badge variant="primary">{h.residentCount || 0} Residents</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Appointed Warden</div>
                  <div className="font-bold text-spsu-navy mt-0.5">
                    {h.wardenId ? h.wardenId.fullName : 'No Warden Assigned'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedHostelId(h._id);
                    setSelectedWardenId(h.wardenId?._id || '');
                    setShowWardenModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-spsu-blue/10 text-spsu-blue font-bold hover:bg-spsu-blue hover:text-white transition-all text-xs"
                >
                  Assign Warden
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ASSIGN WARDEN MODAL */}
        {showWardenModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-spsu-navy">Assign Hostel Warden</h3>
              <form onSubmit={handleAssignWarden} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Warden / Staff User</label>
                  <select
                    value={selectedWardenId}
                    onChange={(e) => setSelectedWardenId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg font-medium"
                  >
                    <option value="">-- Select Warden --</option>
                    {wardenUsers.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.fullName} ({w.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowWardenModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Warden
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
