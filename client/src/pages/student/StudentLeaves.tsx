import React, { useState, useEffect } from 'react';
import { leaveService, SubmitLeavePayload } from '../../services/leaveService';
import { LeaveRequest, LeaveBalance, LeaveType } from '../../types/leave';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

export const StudentLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<SubmitLeavePayload>({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    attachmentUrl: '',
  });
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesData, balancesData, typesData] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getMyBalances(),
        leaveService.getLeaveTypes('STUDENT'),
      ]);
      setLeaves(leavesData);
      setBalances(balancesData);
      setLeaveTypes(typesData);
      if (typesData.length > 0 && !formData.leaveTypeId) {
        setFormData((prev) => ({ ...prev, leaveTypeId: typesData[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching leaves data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    setApplyLoading(true);

    try {
      await leaveService.submitLeave(formData);
      setIsApplyModalOpen(false);
      setFormData({
        leaveTypeId: leaveTypes[0]?._id || '',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContact: '',
        attachmentUrl: '',
      });
      fetchData();
    } catch (err: any) {
      setApplyError(err.response?.data?.message || err.message || 'Error submitting leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        await leaveService.cancelLeave(id);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to cancel leave request');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw size={12} /> Returned
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'Cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Student Leave Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit leave applications, track approval stages, and view remaining quotas (Release v2.0)
          </p>
        </div>

        <Button size="sm" onClick={() => setIsApplyModalOpen(true)} icon={<Plus size={14} />}>
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => (
          <div
            key={b.leaveType._id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-spsu-blue font-mono">
                {b.leaveType.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">Annual Quota</span>
            </div>
            <h3 className="font-bold text-slate-800 text-base">{b.leaveType.name}</h3>
            <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3 text-xs">
              <div>
                <span className="text-2xl font-extrabold text-spsu-navy">{b.remainingDays}</span>
                <span className="text-slate-400 ml-1">days left</span>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>Used: {b.usedDays}d</div>
                {b.pendingDays > 0 && <div className="text-amber-600 font-medium">Pending: {b.pendingDays}d</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Applications History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-spsu-navy text-sm">Leave Applications History</h2>
          <span className="text-xs text-slate-400">{leaves.length} total applications</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration & Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Current Approver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading your leave history...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    You haven't submitted any leave applications yet.
                  </td>
                </tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{item.leaveType?.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.leaveType?.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">
                        {item.numberOfDays} Day{item.numberOfDays > 1 ? 's' : ''}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.startDate).toLocaleDateString()} –{' '}
                        {new Date(item.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">{item.reason}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">
                        {item.currentApprover?.name || 'Assigned Mentor'}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.currentApprover?.role || 'Approver'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLeave(item);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-spsu-blue font-semibold hover:underline"
                      >
                        Timeline
                      </button>
                      {['Pending', 'Returned'].includes(item.status) && (
                        <button
                          onClick={() => handleCancel(item._id)}
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
        title="Submit Leave Application (v2.0)"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          {applyError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{applyError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
            <select
              required
              value={formData.leaveTypeId}
              onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {leaveTypes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.code}) - {t.defaultQuota} days quota
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {calculateDays() > 0 && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-spsu-blue font-semibold flex items-center justify-between">
              <span>Total Leave Duration:</span>
              <span>{calculateDays()} Day(s)</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Leave</label>
            <textarea
              required
              rows={3}
              placeholder="State the specific reason for your absence..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Emergency Contact / Parent Phone
            </label>
            <input
              type="text"
              placeholder="+91 98765 00000"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Document / Proof URL (Optional for Medical)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
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
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details & Audit Trail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Leave Timeline & Audit Trail (SH-006)"
      >
        {selectedLeave && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-slate-800 text-sm">
                <span>{selectedLeave.leaveType?.name}</span>
                <span>{getStatusBadge(selectedLeave.status)}</span>
              </div>
              <div className="text-slate-500">
                Duration: {selectedLeave.numberOfDays} day(s) •{' '}
                {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                {new Date(selectedLeave.endDate).toLocaleDateString()}
              </div>
              <div className="text-slate-600 pt-1">
                <span className="font-semibold">Reason:</span> {selectedLeave.reason}
              </div>
            </div>

            {/* Approval History */}
            <div>
              <h4 className="font-bold text-spsu-navy uppercase tracking-wider text-[11px] mb-2">
                Approval Decisions & Steps
              </h4>
              <div className="space-y-2">
                {selectedLeave.approvalHistory?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-slate-200 rounded-lg bg-white flex items-start gap-3"
                  >
                    <div className="p-1.5 bg-spsu-lightBlue text-spsu-blue rounded-md shrink-0 mt-0.5">
                      <UserCheck size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {step.approver?.name || 'Reviewer'} ({step.role})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(step.actionDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-0.5">{step.comments}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail (SH-006) */}
            <div>
              <h4 className="font-bold text-spsu-navy uppercase tracking-wider text-[11px] mb-2">
                Audit Trail (System Transitions)
              </h4>
              <div className="bg-slate-50 p-3 rounded-lg space-y-2 border border-slate-200/80 font-mono text-[10px]">
                {selectedLeave.auditTrail?.map((trail, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1 last:border-none">
                    <div>
                      <span className="font-bold text-spsu-blue">{trail.action}</span>: {trail.previousState} → {trail.newState}
                      <div className="text-slate-500 font-sans">{trail.comment}</div>
                    </div>
                    <div className="text-slate-400 shrink-0">
                      {new Date(trail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
