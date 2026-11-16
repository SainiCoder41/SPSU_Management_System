import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaveService';
import { LeaveRequest, LeaveType } from '../../types/leave';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Calendar,
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Search,
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'types'>('requests');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Modals
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    applicableRole: 'ALL',
    defaultQuota: 15,
    requiresAttachment: false,
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesData, typesData] = await Promise.all([
        leaveService.getAllLeaves({
          status: selectedStatus || undefined,
          role: selectedRole || undefined,
        }),
        leaveService.getLeaveTypes(),
      ]);
      setLeaves(leavesData);
      setLeaveTypes(typesData);
    } catch (err) {
      console.error('Error fetching admin leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedRole]);

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leaveService.createLeaveType(typeForm);
      setIsAddTypeModalOpen(false);
      setTypeForm({
        name: '',
        code: '',
        applicableRole: 'ALL',
        defaultQuota: 15,
        requiresAttachment: false,
        description: '',
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating leave type');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Campus Leave Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional leave governance, routing rules, and quota configurations (Release v2.0)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'types' && (
            <Button size="sm" onClick={() => setIsAddTypeModalOpen(true)} icon={<Plus size={14} />}>
              Configure Leave Type
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-spsu-blue text-spsu-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Institutional Leave Records ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'types'
              ? 'border-spsu-blue text-spsu-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Leave Types & Quota Policy ({leaveTypes.length})
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 bg-white"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="FACULTY">Faculty</option>
              <option value="WARDEN">Wardens</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration & Dates</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Assigned Approver</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading leave records...
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{l.applicant?.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {l.applicantRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {l.leaveType?.name} ({l.leaveType?.code})
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-700">{l.numberOfDays} Day(s)</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(l.startDate).toLocaleDateString()} to{' '}
                            {new Date(l.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-600">{l.reason}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {l.currentApprover?.name || 'Admin'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              l.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : l.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : l.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Leave Types Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaveTypes.map((t) => (
            <div key={t._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-spsu-lightBlue text-spsu-blue px-2 py-0.5 rounded border border-blue-200">
                  {t.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">Role: {t.applicableRole}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-base mt-2">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Default Annual Quota:</span>{' '}
                  <span className="font-bold text-spsu-navy">{t.defaultQuota} Days</span>
                </div>
                <div>
                  {t.requiresAttachment ? (
                    <span className="text-amber-600 font-semibold text-[11px]">
                      Proof Required
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">No Proof Needed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Leave Type Modal */}
      <Modal
        isOpen={isAddTypeModalOpen}
        onClose={() => setIsAddTypeModalOpen(false)}
        title="Configure New Leave Type (LEV-009)"
      >
        <form onSubmit={handleCreateType} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Leave Type Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sabbatical Leave"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SL"
                value={typeForm.code}
                onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Quota (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={typeForm.defaultQuota}
                onChange={(e) => setTypeForm({ ...typeForm, defaultQuota: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Applicable Audience</label>
            <select
              value={typeForm.applicableRole}
              onChange={(e) => setTypeForm({ ...typeForm, applicableRole: e.target.value as any })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Campus (Students & Staff)</option>
              <option value="STUDENT">Students Only</option>
              <option value="STAFF">Staff & Faculty Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reqAttach"
              checked={typeForm.requiresAttachment}
              onChange={(e) => setTypeForm({ ...typeForm, requiresAttachment: e.target.checked })}
              className="rounded border-slate-300 text-spsu-blue focus:ring-spsu-blue"
            />
            <label htmlFor="reqAttach" className="font-semibold text-slate-700 cursor-pointer">
              Mandatory Proof / Medical Certificate Attachment
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddTypeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Leave Type
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
