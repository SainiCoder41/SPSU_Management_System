import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { IComplaint, ComplaintCategory } from '../../types/complaint';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  LifeBuoy,
  Plus,
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  EyeOff,
  Send,
  MessageSquare,
  FileText,
  UserCheck,
} from 'lucide-react';

export const ComplaintPortal: React.FC = () => {
  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'submit'>('my');

  // Submit Form state
  const [category, setCategory] = useState<ComplaintCategory>('Hostel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Selected complaint detail modal
  const [selectedTicket, setSelectedTicket] = useState<IComplaint | null>(null);
  const [newNote, setNewNote] = useState('');
  const [sendingNote, setSendingNote] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await complaintService.submitComplaint({
        category,
        title,
        description,
        isAnonymous,
        attachmentUrl: attachmentUrl || undefined,
      });
      setSubmitSuccess(`Grievance registered successfully! Your ticket number is ${res.ticketNumber}`);
      setTitle('');
      setDescription('');
      setAttachmentUrl('');
      setIsAnonymous(false);
      fetchComplaints();
      setTimeout(() => {
        setActiveTab('my');
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !newNote.trim()) return;
    try {
      setSendingNote(true);
      const updated = await complaintService.addNote(selectedTicket._id, newNote.trim(), false);
      setSelectedTicket(updated);
      setNewNote('');
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending reply');
    } finally {
      setSendingNote(false);
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-[#0057B8]" />
            Grievance & Redressal Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit issues, track resolution timelines, and report urgent campus concerns with full privacy options.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={activeTab === 'my' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('my')}
          >
            My Grievances ({complaints.length})
          </Button>
          <Button
            variant={activeTab === 'submit' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('submit')}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Grievance
          </Button>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === 'submit' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0057B8]" />
            Register a Grievance Ticket
          </h2>

          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grievance Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                required
              >
                <option value="Hostel">Hostel & Living Accommodation</option>
                <option value="Academic">Academic, Exams & Teaching</option>
                <option value="Infrastructure">Campus Infrastructure & Facilities</option>
                <option value="Canteen">Canteen & Dining Services</option>
                <option value="General">General Administrative Matters</option>
                <option value="Ragging / Harassment">⚠️ Ragging / Harassment (Designated Authority Escalation)</option>
              </select>
            </div>

            {category === 'Ragging / Harassment' && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <strong>Zero-Tolerance Anti-Ragging Policy:</strong> Cases under Ragging or Harassment are flagged as <strong>Critical</strong> and routed directly to the Designated Authority (Chief Proctor & SPSU Disciplinary Board). Strict confidentiality is preserved.
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Title / Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="E.g., Low water pressure on 2nd floor BH-2 or Lab AC malfunctioning"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide specific details including dates, room/block numbers, and any steps already taken..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optional Attachment Link
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or uploaded document link"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
            </div>

            {/* Anonymous Toggle (CMP-003) */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-[#0057B8] rounded border-gray-300 focus:ring-[#0057B8]"
                />
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    Submit Anonymously (Hide My Identity)
                  </span>
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-1 pl-7">
                When enabled, your name and email will be hidden from departmental handlers and grievance queues.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab('my')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Grievance'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Grievances List */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your grievances...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700">No Grievances Logged</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                You haven't filed any complaints or grievance tickets yet.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('submit')}>
                File a Grievance
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {complaints.map((item) => (
                <div
                  key={item._id}
                  className="p-5 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setSelectedTicket(item)}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {item.ticketNumber}
                      </span>
                      {getStatusBadge(item.status)}
                      {item.isSensitive && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-700 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Sensitive
                        </span>
                      )}
                      {item.isAnonymous && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Anonymous
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    {item.resolutionNote && (
                      <div className="mt-2 text-xs bg-green-50 text-green-800 p-2 rounded border border-green-200">
                        <strong>Resolution:</strong> {item.resolutionNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {item.notes?.length || 0}
                    </span>
                    <Button variant="outline" size="sm">
                      View Ticket
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber} - Details`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Meta header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-xs text-gray-500">Category</span>
                <p className="text-sm font-semibold text-gray-800">{selectedTicket.category}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Status</span>
                <div>{getStatusBadge(selectedTicket.status)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Filed On</span>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Privacy</span>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedTicket.isAnonymous ? 'Anonymous' : 'Public to Handler'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Issue Description</h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Resolution Note if resolved */}
            {selectedTicket.resolutionNote && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-green-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  Official Resolution
                </h4>
                <p className="text-sm text-green-800">{selectedTicket.resolutionNote}</p>
              </div>
            )}

            {/* Audit Trail Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Audit & Status History</h4>
              <div className="space-y-2 border-l-2 border-blue-200 pl-4 ml-2">
                {selectedTicket.auditTrail?.map((trail, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0057B8]" />
                    <span className="font-semibold text-gray-800">{trail.action}</span>
                    <span className="text-gray-400 ml-2">
                      {new Date(trail.timestamp).toLocaleString()}
                    </span>
                    <p className="text-gray-600 mt-0.5">{trail.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Messages */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Ticket Communication</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3 p-2 bg-gray-50 rounded-lg">
                {!selectedTicket.notes || selectedTicket.notes.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No messages yet.</p>
                ) : (
                  selectedTicket.notes.map((note, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded border border-gray-200 text-xs">
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700">{note.authorName}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply box */}
              {selectedTicket.status !== 'Closed' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an update or reply to the grievance team..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddNote}
                    disabled={sendingNote || !newNote.trim()}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
