import React, { useState, useEffect } from 'react';
import { communicationService } from '../../services/communicationService';
import { INotice, CreateNoticeInput, NoticePriority } from '../../types/communication';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Pin,
  AlertTriangle,
  Plus,
  Calendar,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);

  // Publish Notice Modal
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('Normal');
  const [isPinned, setIsPinned] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('ALL');
  const [publishing, setPublishing] = useState(false);

  const canPublish = ['ADMIN', 'FACULTY', 'HOD', 'WARDEN'].includes(user?.role || '');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await communicationService.getNotices();
      setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleOpenNotice = async (notice: INotice) => {
    setSelectedNotice(notice);
    try {
      await communicationService.getNoticeById(notice._id);
    } catch (err) {
      // Ignore background view count error
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPublishing(true);
      const payload: CreateNoticeInput = {
        title,
        body,
        priority,
        isPinned,
        targetAudience: {
          roles: targetRole === 'ALL' ? [] : [targetRole],
        },
      };

      await communicationService.publishNotice(payload);
      setIsPublishOpen(false);
      setTitle('');
      setBody('');
      setPriority('Normal');
      setIsPinned(false);
      setTargetRole('ALL');
      fetchNotices();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error publishing notice');
    } finally {
      setPublishing(false);
    }
  };

  const getPriorityBadge = (p: NoticePriority) => {
    switch (p) {
      case 'Urgent':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Urgent Notice
          </span>
        );
      case 'Important':
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
            Important
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            General
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#0057B8]" />
            Campus Notice Board
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Official announcements, examination schedules, hostel guidelines, and circulars from University Administration.
          </p>
        </div>

        {canPublish && (
          <Button variant="primary" onClick={() => setIsPublishOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Publish Notice
          </Button>
        )}
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200">
          Loading campus announcements...
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No Announcements Active</h3>
          <p className="text-sm text-gray-500 mt-1">All clear! Check back later for campus updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <div
              key={notice._id}
              onClick={() => handleOpenNotice(notice)}
              className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer relative ${
                notice.isPinned
                  ? 'border-blue-400 ring-1 ring-blue-300/50 bg-blue-50/20'
                  : notice.priority === 'Urgent'
                  ? 'border-red-300 ring-1 ring-red-200/50 bg-red-50/15'
                  : 'border-gray-200'
              }`}
            >
              {notice.isPinned && (
                <div className="absolute top-4 right-4 text-[#0057B8] flex items-center gap-1 text-xs font-semibold">
                  <Pin className="w-3.5 h-3.5 fill-[#0057B8]" /> Pinned
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(notice.priority)}
                  <span className="text-xs text-gray-400">
                    {new Date(notice.publishDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                  {notice.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
                  {notice.body}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <span>By:</span>
                  <span className="font-medium text-gray-700 truncate">
                    {notice.publisher?.name || 'Administration'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{notice.viewCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedNotice(null)}
          title={selectedNotice.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg text-xs">
              <div>{getPriorityBadge(selectedNotice.priority)}</div>
              {selectedNotice.isPinned && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0057B8] font-semibold flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-[#0057B8]" /> Pinned Announcement
                </span>
              )}
              <span className="text-gray-500">
                Published on: {new Date(selectedNotice.publishDate).toLocaleString()}
              </span>
              <span className="text-gray-500">
                By: {selectedNotice.publisher?.name} ({selectedNotice.publisher?.role})
              </span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {selectedNotice.body}
            </div>

            {selectedNotice.attachmentUrl && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                <span className="font-semibold text-blue-900 block mb-1">Official Attachment</span>
                <a
                  href={selectedNotice.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0057B8] underline break-all"
                >
                  {selectedNotice.attachmentUrl}
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Publish Notice Modal */}
      {isPublishOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPublishOpen(false)}
          title="Publish New Campus Notice"
          size="lg"
        >
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="E.g., End-Term Practical Exam Schedule or Library Extended Hours"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NoticePriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                >
                  <option value="Normal">Normal Notice</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent (Triggers Instant Notifications)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                >
                  <option value="ALL">Entire Campus (All Roles)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty & Staff Only</option>
                  <option value="PARENT">Parents Only</option>
                  <option value="WARDEN">Hostel Wardens Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Body / Announcement Text <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                minLength={10}
                placeholder="Write the full circular or announcement details..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinnedNotice"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-[#0057B8] focus:ring-[#0057B8]"
              />
              <label htmlFor="pinnedNotice" className="text-sm font-medium text-gray-700 cursor-pointer">
                Pin to top of Notice Board & Dashboards
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsPublishOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish Announcement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
