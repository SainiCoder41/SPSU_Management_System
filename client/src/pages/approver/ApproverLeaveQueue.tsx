import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leaveService, ReviewLeavePayload } from '../../services/leaveService';
import { LeaveRequest } from '../../types/leave';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const ApproverLeaveQueue: React.FC = () => {
  const { user } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | 'Returned'>('Approved');
  const [comments, setComments] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getPendingApprovals();
      setPendingLeaves(data);
    } catch (err) {
      console.error('Error fetching pending approvals queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenReview = (leave: LeaveRequest, action: 'Approved' | 'Rejected' | 'Returned') => {
    setSelectedLeave(leave);
    setActionType(action);
    setComments(
      action === 'Approved'
        ? 'Leave request approved as per academic and attendance standing.'
        : action === 'Rejected'
        ? 'Request cannot be granted due to upcoming examinations or low attendance.'
        : 'Please update reason or clarify exact return travel time.'
    );
    setReviewError(null);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewLoading(true);
    setReviewError(null);

    try {
      await leaveService.reviewLeave(selectedLeave._id, {
        action: actionType,
        comments,
      });
      setIsReviewModalOpen(false);
      fetchQueue();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Error processing decision');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-spsu-blue uppercase tracking-wider block">
            Approver Workflow Engine (v2.0)
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">Pending Leave Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and act on leave requests routed to you based on the SIS hierarchy ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold">
          <Clock size={16} />
          <span>{pendingLeaves.length} Requests Awaiting Your Decision</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
            Loading approval queue...
          </div>
        ) : pendingLeaves.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
            No pending leave requests assigned to you at this time. All caught up!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingLeaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-spsu-lightBlue text-spsu-blue border border-blue-200">
                      {leave.leaveType?.name} ({leave.leaveType?.code})
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Duration: <span className="text-spsu-navy font-bold">{leave.numberOfDays} Day(s)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({new Date(leave.startDate).toLocaleDateString()} to{' '}
                      {new Date(leave.endDate).toLocaleDateString()})
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-800">{leave.applicant?.name}</h3>
                    <p className="text-xs text-slate-400">
                      {leave.applicant?.email} • {leave.applicantRole}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900">Reason: </span>
                    {leave.reason}
                  </div>

                  {leave.emergencyContact && (
                    <div className="text-xs text-slate-500">
                      <span className="font-medium">Emergency Contact:</span> {leave.emergencyContact}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleOpenReview(leave, 'Approved')}
                    icon={<CheckCircle size={14} />}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-700 hover:bg-blue-50 border-blue-200"
                    onClick={() => handleOpenReview(leave, 'Returned')}
                    icon={<RotateCcw size={14} />}
                  >
                    Return
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleOpenReview(leave, 'Rejected')}
                    icon={<XCircle size={14} />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Confirm Decision: ${actionType}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          {reviewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <div className="font-semibold text-slate-800">
              Applicant: {selectedLeave?.applicant?.name} ({selectedLeave?.leaveType?.name})
            </div>
            <div className="text-slate-500">
              Duration: {selectedLeave?.numberOfDays} day(s) from{' '}
              {selectedLeave && new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
              {selectedLeave && new Date(selectedLeave.endDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Decision Comments / Justification (Mandatory per LEV-005)
            </label>
            <textarea
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="State your reasons or instructions for the applicant..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={reviewLoading}
              className={
                actionType === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : actionType === 'Rejected'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-spsu-blue hover:bg-spsu-secondary text-white'
              }
            >
              Confirm {actionType}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
