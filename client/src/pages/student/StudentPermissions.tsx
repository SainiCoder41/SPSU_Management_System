import React, { useState, useEffect } from 'react';
import { permissionService, SubmitPermissionPayload } from '../../services/permissionService';
import { PermissionRequest, PermissionType } from '../../types/permission';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Shield,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';

export const StudentPermissions: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionRequest[]>([]);
  const [types, setTypes] = useState<PermissionType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState<SubmitPermissionPayload>({
    permissionTypeId: '',
    startDateTime: '',
    endDateTime: '',
    destination: '',
    reason: '',
    emergencyContact: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permData, typesData] = await Promise.all([
        permissionService.getMyPermissions(),
        permissionService.getPermissionTypes(),
      ]);
      setPermissions(permData);
      setTypes(typesData);
      if (typesData.length > 0 && !formData.permissionTypeId) {
        setFormData((prev) => ({ ...prev, permissionTypeId: typesData[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError(null);

    try {
      await permissionService.submitPermission(formData);
      setIsApplyModalOpen(false);
      setFormData({
        permissionTypeId: types[0]?._id || '',
        startDateTime: '',
        endDateTime: '',
        destination: '',
        reason: '',
        emergencyContact: '',
      });
      fetchData();
    } catch (err: any) {
      setApplyError(err.response?.data?.message || err.message || 'Error submitting request');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this gate pass request?')) {
      try {
        await permissionService.cancelPermission(id);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to cancel');
      }
    }
  };

  const getSignOffBadge = (status: string, roleName: string) => {
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <Check size={11} /> {roleName}: Signed
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <XCircle size={11} /> {roleName}: Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
        <Clock size={11} /> {roleName}: Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Outing & Gate Pass Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Request day outings, overnight passes, and late campus entries with warden & parent approvals (v3.0)
          </p>
        </div>

        <Button size="sm" onClick={() => setIsApplyModalOpen(true)} icon={<Plus size={14} />}>
          Request Gate Pass
        </Button>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-spsu-navy text-sm">Gate Pass Applications</h2>
          <span className="text-xs text-slate-400">{permissions.length} total requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Pass Type</th>
                <th className="py-3 px-4">Departure & Return</th>
                <th className="py-3 px-4">Destination & Reason</th>
                <th className="py-3 px-4">Warden / Parent Sign-Off</th>
                <th className="py-3 px-4">Overall Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading permission records...
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No outing or gate pass requests found.
                  </td>
                </tr>
              ) : (
                permissions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{p.permissionType?.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.permissionType?.code}
                      </span>
                      {p.hasLeaveConflict && (
                        <div
                          className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                          title={p.leaveConflictDetails}
                        >
                          <AlertTriangle size={11} /> Overlaps Approved Leave
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">
                        {new Date(p.startDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        to {new Date(p.endDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1 text-slate-800 font-medium truncate">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{p.destination}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.reason}</p>
                    </td>

                    <td className="py-3 px-4 space-y-1">
                      <div>{getSignOffBadge(p.wardenSignOff?.status || 'Pending', 'Warden')}</div>
                      {p.permissionType?.requiresParentSignOff && (
                        <div>{getSignOffBadge(p.parentSignOff?.status || 'Pending', 'Parent')}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : p.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {p.status === 'Pending' && (
                        <button
                          onClick={() => handleCancel(p._id)}
                          className="text-rose-600 font-semibold hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Request Campus Outing / Gate Pass (v3.0)"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          {applyError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{applyError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pass Category</label>
            <select
              required
              value={formData.permissionTypeId}
              onChange={(e) => setFormData({ ...formData, permissionTypeId: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {types.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.maxDurationHours}h limit){t.requiresParentSignOff ? ' - Requires Parent Sign-Off' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Departure Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.startDateTime}
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Return Time</label>
              <input
                type="datetime-local"
                required
                value={formData.endDateTime}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Exact Destination / City</label>
            <input
              type="text"
              required
              placeholder="e.g. Celebration Mall / Shobhagpura, Udaipur"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purpose / Reason</label>
            <textarea
              required
              rows={3}
              placeholder="Provide specific reason for campus departure..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Active Contact / Guardian Phone
            </label>
            <input
              type="text"
              required
              placeholder="+91 94140 12345"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={applyLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
