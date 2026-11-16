import React, { useState, useEffect } from 'react';
import { hostelService } from '../../services/hostelService';
import { staffService } from '../../services/staffService';
import { Hostel, Staff } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Home, Users, Plus, Edit2, ShieldCheck } from 'lucide-react';

export const HostelManagement: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [wardenStaff, setWardenStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentHostel, setCurrentHostel] = useState<Hostel | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'BOYS' as 'BOYS' | 'GIRLS',
    capacity: 120,
    warden: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hostelData, staffData] = await Promise.all([
        hostelService.getHostels(),
        staffService.getStaff({ role: 'WARDEN' }),
      ]);
      setHostels(hostelData);
      setWardenStaff(staffData);
    } catch (err) {
      console.error('Error loading hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: 'BOYS',
      capacity: 120,
      warden: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (h: Hostel) => {
    setCurrentHostel(h);
    setFormData({
      name: h.name,
      type: h.type,
      capacity: h.capacity,
      warden: h.warden?._id || '',
      description: h.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && currentHostel) {
        await hostelService.updateHostel(currentHostel._id, formData);
        setIsEditModalOpen(false);
      } else {
        await hostelService.createHostel(formData);
        setIsAddModalOpen(false);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving hostel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Hostel & Residential Blocks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking of Boys Hostels (BH1–BH4) and Girls Hostels (GH1–GH3), room capacities, and assigned wardens
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} icon={<Plus size={14} />}>
          Add Hostel Block
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hostels.map((h) => {
          const pct = h.capacity > 0 ? Math.min(100, Math.round((h.occupancy / h.capacity) * 100)) : 0;
          return (
            <div
              key={h._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-spsu-navy">{h.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        h.type === 'BOYS'
                          ? 'bg-blue-50 text-spsu-blue border-blue-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                    >
                      {h.type}
                    </span>
                  </div>
                  {h.description && (
                    <p className="text-xs text-slate-500 mt-1">{h.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEdit(h)}
                  className="p-1.5 text-slate-400 hover:text-spsu-blue rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit Hostel / Warden"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {/* Capacity Progress Bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Occupancy</span>
                  <span>
                    {h.occupancy} / {h.capacity} beds ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      pct > 90 ? 'bg-rose-500' : 'bg-spsu-blue'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Warden Details */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-spsu-blue" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Chief Warden
                    </span>
                    <span className="font-semibold text-slate-800">
                      {h.warden?.user?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
                {h.warden?.user?.email && (
                  <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
                    {h.warden.user.email}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Hostel Block' : 'Register New Hostel Block'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Block Name</label>
              <input
                type="text"
                required
                placeholder="e.g. BH5, GH4"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="BOYS">BOYS HOSTEL</option>
                <option value="GIRLS">GIRLS HOSTEL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Bed Capacity</label>
              <input
                type="number"
                min="10"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Warden</label>
              <select
                value={formData.warden}
                onChange={(e) => setFormData({ ...formData, warden: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Unassigned</option>
                {wardenStaff.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.user?.name} ({w.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Hall Name</label>
            <input
              type="text"
              placeholder="e.g. Vivekananda Bhawan"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Hostel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
