import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { Subject, Timetable, TimetableSlot } from '../../types/attendance';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  BookOpen,
  Layers,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const TimetableManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [department, setDepartment] = useState('67389a00b123456789abcdef');
  const [semester, setSemester] = useState(4);
  const [section, setSection] = useState('A');
  const [timetable, setTimetable] = useState<Timetable | null>(null);

  // New Subject Modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subCredits, setSubCredits] = useState(3);
  const [subType, setSubType] = useState<'Theory' | 'Practical' | 'Elective'>('Theory');
  const [creatingSub, setCreatingSub] = useState(false);

  // Slot Editor Modal
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [slotSubjectId, setSlotSubjectId] = useState('');
  const [room, setRoom] = useState('LT-101');
  const [savingSlot, setSavingSlot] = useState(false);
  const [clashError, setClashError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const data = await attendanceService.getSubjects({ semester });
      setSubjects(data);
      if (data.length > 0 && !slotSubjectId) setSlotSubjectId(data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    try {
      const data = await attendanceService.getTimetable({ department, semester, section });
      setTimetable(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTimetable();
  }, [semester, section]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingSub(true);
      await attendanceService.createSubject({
        name: subName,
        code: subCode,
        department: department as any,
        semester,
        credits: subCredits,
        type: subType,
      });
      setSubjectModalOpen(false);
      setSubName('');
      setSubCode('');
      fetchSubjects();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error creating subject');
    } finally {
      setCreatingSub(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setClashError(null);
    try {
      setSavingSlot(true);
      const existingSlots = timetable?.slots || [];
      const newSlot = {
        dayOfWeek,
        startTime,
        endTime,
        subjectId: slotSubjectId,
        facultyId: '67389a00b123456789abcde2', // Default faculty ID
        room,
      };

      const payload = {
        departmentId: department,
        semester,
        section,
        slots: [
          ...existingSlots.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            subjectId: typeof s.subject === 'object' ? s.subject._id : s.subject,
            facultyId: typeof s.faculty === 'object' ? s.faculty._id : s.faculty,
            room: s.room,
          })),
          newSlot,
        ],
      };

      await attendanceService.saveTimetable(payload);
      setSlotModalOpen(false);
      fetchTimetable();
    } catch (err: any) {
      setClashError(err.response?.data?.message || err.message || 'Clash detected!');
    } finally {
      setSavingSlot(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#0057B8]" />
            Timetable & Curriculum Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Section schedules, academic subjects catalog, and room/faculty conflict detection (ATT-004, ATT-005).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setSubjectModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subject
          </Button>
          <Button variant="primary" onClick={() => setSlotModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Schedule Slot
          </Button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          Semester {semester} - Section {section} Weekly Grid
        </h3>

        {!timetable || !timetable.slots || timetable.slots.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No schedule slots published for Semester {semester} Section {section}. Click "Add Schedule Slot" above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.slots.map((slot, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0057B8] uppercase">{slot.dayOfWeek}</span>
                  <span className="font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{slot.subject?.name || 'Subject'}</h4>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                  <span>Faculty: {slot.faculty?.name || 'Faculty Member'}</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <MapPin className="w-3 h-3 text-red-500" /> {slot.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {subjectModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSubjectModalOpen(false)}
          title="Add New Academic Subject"
          size="md"
        >
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name</label>
              <input
                type="text"
                required
                placeholder="E.g. Computer Networks"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                placeholder="E.g. CS205"
                value={subCode}
                onChange={(e) => setSubCode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={subCredits}
                  onChange={(e) => setSubCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Elective">Elective</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setSubjectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={creatingSub}>
                {creatingSub ? 'Creating...' : 'Create Subject'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Slot Modal with Clash Detection */}
      {slotModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSlotModalOpen(false)}
          title="Add Class Schedule Slot"
          size="md"
        >
          <form onSubmit={handleAddSlot} className="space-y-4">
            {clashError && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{clashError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
              <select
                value={slotSubjectId}
                onChange={(e) => setSlotSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Room / Lecture Theatre</label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="E.g. LT-101, Lab 3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setSlotModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSlot}>
                {savingSlot ? 'Verifying...' : 'Add Slot'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
