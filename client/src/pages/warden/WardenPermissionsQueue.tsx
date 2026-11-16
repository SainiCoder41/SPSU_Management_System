import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { permissionService } from '../../services/permissionService';
import { PermissionRequest } from '../../types/permission';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
} from 'lucide-react';

export const WardenPermissionsQueue: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedReq, setSelectedReq] = useState<PermissionRequest | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [comments, setComments] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await permissionService.getWardenQueue();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching warden queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenReview = (req: PermissionRequest, action: 'Approved' | 'Rejected') => {
    setSelectedReq(req);
    setActionType(action);
    setComments(
      action === 'Approved'
        ? 'Warden approved. Return before curfew.'
        : 'Outing request denied due to hostel discipline policy or timings.'
    );
    setIsModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setReviewLoading(true);
    try {
      await permissionService.reviewWardenPermission(selectedReq._id, actionType, comments);
      setIsModalOpen(false);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording review');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Hostel Warden Outing Gate Pass Approvals (v3.0)
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">Resident Permission Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review daytime outings, late arrivals, and overnight stays for hostel residents
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold">
          <Clock size={16} />
          <span>{requests.length} Requests Awaiting Sign-Off</span>
        </div>
      </div>

      {/* Queue Cards */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
          Loading warden queue...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
          No pending resident permission requests at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {req.permissionType?.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Departure:{' '}
                    <strong className="text-slate-800">
                      {new Date(req.startDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </strong>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Expected Return:{' '}
                    <strong className="text-slate-800">
                      {new Date(req.endDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </strong>
                  </span>
                </div>

                {/* Overlap Conflict Banner (PER-005, BR-005) */}
                {req.hasLeaveConflict && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs flex items-center gap-2 font-semibold">
                    <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                    <span>{req.leaveConflictDetails}</span>
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-800">{req.applicant?.name}</h3>
                  <p className="text-xs text-slate-400">
                    {req.applicant?.email} • Contact: {req.emergencyContact}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100 flex items-start gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Destination:</span> {req.destination}
                    <div className="text-slate-600 mt-0.5">
                      <span className="font-semibold">Reason:</span> {req.reason}
                    </div>
                  </div>
                </div>

                {req.permissionType?.requiresParentSignOff && (
                  <div className="text-xs text-slate-500">
                    <span>Parent Sign-off status: </span>
                    <strong
                      className={
                        req.parentSignOff?.status === 'Approved'
                          ? 'text-emerald-600'
                          : req.parentSignOff?.status === 'Rejected'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }
                    >
                      {req.parentSignOff?.status || 'Pending'}
                    </strong>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleOpenReview(req, 'Approved')}
                  icon={<CheckCircle size={14} />}
                >
                  Approve Pass
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleOpenReview(req, 'Rejected')}
                  icon={<XCircle size={14} />}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Warden Decision: ${actionType}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <div className="font-semibold text-slate-800">
              Student: {selectedReq?.applicant?.name} ({selectedReq?.permissionType?.name})
            </div>
            <div className="text-slate-500">Destination: {selectedReq?.destination}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Warden Comments / Instructions (Mandatory)
            </label>
            <textarea
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
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
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
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
