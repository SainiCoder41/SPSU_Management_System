import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { CampusEvent, EventCategory } from '../../types/event';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  CheckCircle,
  Download,
  Clock,
  Filter,
  Sparkles,
} from 'lucide-react';

export const EventsCatalog: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Create Event Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General' as EventCategory,
    dateTime: '',
    endDateTime: '',
    venue: '',
    capacity: 100,
    isRegistrationOpen: true,
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching campus events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRsvp = async (eventId: string, isRegistered: boolean) => {
    try {
      if (isRegistered) {
        await eventService.withdrawRsvp(eventId);
      } else {
        await eventService.rsvpEvent(eventId);
      }
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'RSVP action failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await eventService.createEvent(formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        dateTime: '',
        endDateTime: '',
        venue: '',
        capacity: 100,
        isRegistrationOpen: true,
      });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating event');
    } finally {
      setCreateLoading(false);
    }
  };

  const categories = ['All', 'Technical', 'Cultural', 'Academic', 'Sports', 'Workshop', 'General'];

  const filteredEvents =
    selectedCategory === 'All'
      ? events
      : events.filter((e) => e.category === selectedCategory);

  const canCreate = ['ADMIN', 'FACULTY', 'HOD', 'MENTOR'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Campus Events & Activities</h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover workshops, fests, technical competitions, and RSVP for seats (Release v3.0)
          </p>
        </div>

        {canCreate && (
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={14} />}>
            Publish New Event
          </Button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-spsu-blue text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
          Loading campus events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
          No events found under this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isRegistered = ev.registrations?.some(
              (r) => r.user?._id === user?.id || (r.user as any) === user?.id && r.status === 'Confirmed'
            );
            const isFull = ev.registeredCount >= ev.capacity;
            const pct = ev.capacity > 0 ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100)) : 0;
            const isOrganizer = ev.organizer?._id === user?.id || user?.role === 'ADMIN';

            return (
              <div
                key={ev._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-spsu-lightBlue text-spsu-blue border border-blue-200">
                      {ev.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(ev.dateTime).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base leading-tight mt-1">{ev.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{ev.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400 shrink-0" />
                      <span>
                        {new Date(ev.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(ev.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar (EVT-005) */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>RSVP Registrations</span>
                      <span>
                        {ev.registeredCount} / {ev.capacity} seats ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : 'bg-spsu-blue'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isOrganizer && (
                    <a
                      href={eventService.getExportUrl(ev._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-spsu-blue p-1.5 rounded hover:bg-slate-50 border border-slate-200"
                      title="Download Registered Participants (.xlsx)"
                    >
                      <Download size={13} />
                      Export
                    </a>
                  )}

                  {user?.role === 'STUDENT' && (
                    <Button
                      size="sm"
                      variant={isRegistered ? 'outline' : 'primary'}
                      className={`ml-auto ${
                        isRegistered ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : ''
                      }`}
                      disabled={!isRegistered && isFull}
                      onClick={() => handleRsvp(ev._id, !!isRegistered)}
                    >
                      {isRegistered ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle size={14} /> Registered (Withdraw)
                        </span>
                      ) : isFull ? (
                        'Capacity Full'
                      ) : (
                        'RSVP / Register'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish Campus Event (EVT-001)"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Technical Symposium 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Capacity</label>
              <input
                type="number"
                min="5"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date & Time</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Venue / Hall</label>
            <input
              type="text"
              required
              placeholder="e.g. Sir Padampat Memorial Auditorium"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Rules</label>
            <textarea
              required
              rows={3}
              placeholder="Event details, schedule, agenda, and guidelines..."
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
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={createLoading}>
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
