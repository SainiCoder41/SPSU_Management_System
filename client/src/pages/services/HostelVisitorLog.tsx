import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { campusServices } from '../../services/campusServicesService';
import { IVisitorLog } from '../../types/campusServices';
import {
  Users,
  DoorOpen,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  CheckCircle,
  LogOut,
  Plus,
} from 'lucide-react';

export const HostelVisitorLog: React.FC = () => {
  const [logs, setLogs] = useState<IVisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    relation: 'Parent / Family',
    purpose: '',
    gateNumber: 'Gate 1 (Main Entrance)',
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await campusServices.getVisitorLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCheckOut = async (logId: string) => {
    try {
      await campusServices.checkOutVisitor(logId);
      fetchLogs();
    } catch (err) {
      alert('Failed to check out visitor');
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campusServices.checkInVisitor(formData);
      setShowModal(false);
      setFormData({
        visitorName: '',
        phone: '',
        relation: 'Parent / Family',
        purpose: '',
        gateNumber: 'Gate 1 (Main Entrance)',
      });
      fetchLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Check-in failed');
    }
  };

  const insideVisitors = logs.filter((l) => l.status === 'Inside');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-spsu-navy">Hostel & Campus Gate Visitor Register</h1>
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> Release v7.0
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time campus perimeter monitoring, guest check-in, and departure confirmation
          </p>
        </div>

        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Record Visitor Entry
        </Button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#0057B8] uppercase">Currently Inside Campus</span>
            <h3 className="text-3xl font-extrabold text-spsu-navy mt-1">{insideVisitors.length}</h3>
          </div>
          <DoorOpen size={28} className="text-[#0057B8]" />
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Logged Today</span>
            <h3 className="text-3xl font-extrabold text-slate-700 mt-1">{logs.length}</h3>
          </div>
          <Users size={28} className="text-slate-500" />
        </div>
      </div>

      {/* Visitor Log Table */}
      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase">
                <th className="py-3 px-4">Visitor & Contact</th>
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Departure Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading visitor records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No visitor records logged today.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.visitorName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {log.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{log.relation}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{log.purpose}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {log.checkOut
                        ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'Inside'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {log.status === 'Inside' ? 'Inside Campus' : 'Checked Out'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.status === 'Inside' && (
                        <button
                          onClick={() => handleCheckOut(log._id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-spsu-navy mb-4">Record Visitor Entry</h3>
            <form onSubmit={handleCheckIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Ramesh Verma"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="+91 94140 12345"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Meeting ward in hostel"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
