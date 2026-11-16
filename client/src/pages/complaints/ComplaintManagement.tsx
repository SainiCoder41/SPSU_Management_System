import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { IComplaint, ComplaintStatus, ComplaintCategory } from '../../types/complaint';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  EyeOff,
  User,
  MessageSquare,
  Lock,
  Send,
  LifeBuoy,
} from 'lucide-react';

export const ComplaintManagement: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'sensitive' | 'resolved'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal action state
  const [selectedTicket, setSelectedTicket] = useState<IComplaint | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Under Review');
  const [resolutionNote, setResolutionNote] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Note state
  const [noteText, setNoteText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const isSensitiveOnly = activeTab === 'sensitive';
      const statusParam = statusFilter !== 'ALL' ? (statusFilter as ComplaintStatus) : undefined;
      const categoryParam = categoryFilter !== 'ALL' ? categoryFilter : undefined;

      const data = await complaintService.getComplaintsQueue({
        status: statusParam,
        category: categoryParam,
        sensitiveOnly: isSensitiveOnly,
      });

      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaint queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeTab, statusFilter, categoryFilter]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (['Resolved', 'Closed'].includes(newStatus) && !resolutionNote.trim()) {
      alert('A resolution note is mandatory when resolving or closing a grievance ticket.');
      return;
    }

    try {
      setUpdatingStatus(true);
      const updated = await complaintService.updateStatus(
        selectedTicket._id,
        newStatus,
        resolutionNote.trim() || undefined,
        statusComment.trim() || undefined
      );
      setSelectedTicket(updated);
      setStatusModalOpen(false);
      setResolutionNote('');
      setStatusComment('');
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !noteText.trim()) return;
    try {
      setAddingNote(true);
      const updated = await complaintService.addNote(
        selectedTicket._id,
        noteText.trim(),
        isInternalNote
      );
      setSelectedTicket(updated);
      setNoteText('');
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error adding note');
    } finally {
      setAddingNote(false);
    }
  };

  const filteredTickets = complaints.filter((c) => {
    if (activeTab === 'pending') {
      return ['Submitted', 'Under Review', 'Escalated'].includes(c.status);
    }
    if (activeTab === 'resolved') {
      return ['Resolved', 'Closed'].includes(c.status);
    }
    if (activeTab === 'sensitive') {
      return c.isSensitive;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Under Review</span>;
      case 'Escalated':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Escalated</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-[#0057B8]" />
            Grievance Redressal Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Official redressal desk for student, staff, and parent grievances across academic and campus facilities.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-[#0057B8] text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Complaints
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'pending'
              ? 'bg-[#0057B8] text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Active / In Progress
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'resolved'
              ? 'bg-[#0057B8] text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Resolved / Closed
        </button>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('sensitive')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'sensitive'
                ? 'bg-red-700 text-white'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Designated Authority: Sensitive Cases
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Filter className="w-4 h-4" /> Filter:
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
        >
          <option value="ALL">All Categories</option>
          <option value="Hostel">Hostel</option>
          <option value="Academic">Academic</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Canteen">Canteen</option>
          <option value="General">General</option>
          <option value="Ragging / Harassment">Ragging / Harassment</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
        >
          <option value="ALL">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading complaints...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No Tickets Found</h3>
            <p className="text-sm text-gray-500 mt-1">
              There are currently no grievances matching your selected criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Complainant</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredTickets.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-[#0057B8]">
                      {item.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isAnonymous ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <EyeOff className="w-3.5 h-3.5" /> Anonymous
                        </span>
                      ) : (
                        <div>
                          <div className="font-medium text-gray-900">{item.complainant?.name || 'Complainant'}</div>
                          <div className="text-xs text-gray-400">{item.complainant?.email}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-gray-900 truncate">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(item)}
                      >
                        Inspect & Resolve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Inspector Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket Redressal: ${selectedTicket.ticketNumber}`}
          size="2xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg text-xs">
              <div>
                <span className="text-gray-500 block">Complainant</span>
                <span className="font-semibold text-gray-800">
                  {selectedTicket.isAnonymous ? 'Anonymous Submitter' : selectedTicket.complainant?.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Category</span>
                <span className="font-semibold text-gray-800">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Current Status</span>
                <div>{getStatusBadge(selectedTicket.status)}</div>
              </div>
              <div>
                <span className="text-gray-500 block">Priority</span>
                <span className={`font-semibold ${selectedTicket.priority === 'Critical' ? 'text-red-700' : 'text-gray-800'}`}>
                  {selectedTicket.priority}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Issue Details</h4>
              <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Official Resolution if any */}
            {selectedTicket.resolutionNote && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-green-900 mb-1">Official Resolution Note</h4>
                <p className="text-sm text-green-800">{selectedTicket.resolutionNote}</p>
              </div>
            )}

            {/* Status change action trigger */}
            <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-blue-950">Grievance Status Workflow</h4>
                <p className="text-xs text-blue-800">Advance or resolve this ticket with an audit update.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setNewStatus(selectedTicket.status === 'Submitted' ? 'Under Review' : 'Resolved');
                  setStatusModalOpen(true);
                }}
              >
                Update Status
              </Button>
            </div>

            {/* Communication & Internal Notes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Communication & Staff Notes ({selectedTicket.notes?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3 p-3 bg-gray-50 rounded-lg">
                {!selectedTicket.notes || selectedTicket.notes.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No notes recorded yet.</p>
                ) : (
                  selectedTicket.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border text-xs ${
                        note.isInternal
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : 'bg-white border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold flex items-center gap-1.5">
                          {note.isInternal && <Lock className="w-3 h-3 text-amber-600" />}
                          {note.authorName} {note.isInternal ? '(Internal Staff Note)' : ''}
                        </span>
                        <span className="text-gray-400">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <textarea
                  rows={2}
                  placeholder="Add reply or internal investigation update..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-gray-300 text-[#0057B8] focus:ring-[#0057B8]"
                    />
                    <Lock className="w-3 h-3 text-amber-600" />
                    Internal Note (Hidden from Complainant)
                  </label>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddNote}
                    disabled={addingNote || !noteText.trim()}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Post Update
                  </Button>
                </div>
              </div>
            </div>

            {/* Audit History */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Audit Trail</h4>
              <div className="space-y-1.5 border-l-2 border-gray-200 pl-3 ml-2 text-xs text-gray-600">
                {selectedTicket.auditTrail?.map((trail, idx) => (
                  <div key={idx}>
                    <span className="font-semibold text-gray-800">{trail.action}</span>
                    <span className="text-gray-400 ml-2">
                      {new Date(trail.timestamp).toLocaleString()}
                    </span>
                    <p className="text-gray-500">{trail.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Sub-Modal */}
      {statusModalOpen && selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Status: ${selectedTicket.ticketNumber}`}
          size="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Grievance Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              >
                <option value="Under Review">Under Review</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {['Resolved', 'Closed'].includes(newStatus) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mandatory Resolution Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the remedial actions taken, technician reports, or policy adjustments..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audit Trail Comment
              </label>
              <input
                type="text"
                placeholder="Brief reason or reference for status change..."
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={updatingStatus}>
                {updatingStatus ? 'Updating...' : 'Confirm Status Update'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
