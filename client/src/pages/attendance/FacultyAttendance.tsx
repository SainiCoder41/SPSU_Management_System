import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { Subject, AttendanceStatus } from '../../types/attendance';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import {
  CalendarCheck2,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Save,
  CheckCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface StudentRosterItem {
  _id: string;
  rollNumber: string;
  name: string;
  status: AttendanceStatus;
  remarks?: string;
}

export const FacultyAttendance: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState(4);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const list = await attendanceService.getSubjects();
        setSubjects(list);
        if (list.length > 0) setSelectedSubjectId(list[0]._id);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    const loadRoster = async () => {
      try {
        setLoadingStudents(true);
        const res = await api.get('/students', { params: { semester, section, limit: 50 } });
        const roster = res.data.data.map((s: any) => ({
          _id: s._id,
          rollNumber: s.rollNumber,
          name: s.user?.name || 'Student',
          status: 'Present' as AttendanceStatus,
          remarks: '',
        }));
        setStudents(roster);
      } catch (err) {
        console.error('Error loading student roster:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadRoster();
  }, [semester, section]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || students.length === 0) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const subject = subjects.find((s) => s._id === selectedSubjectId);
      const departmentId = typeof subject?.department === 'object' ? subject.department._id : subject?.department;

      const payload = {
        subjectId: selectedSubjectId,
        departmentId: departmentId || '67389a00b123456789abcdef',
        semester,
        section,
        date,
        startTime,
        endTime,
        records: students.map((s) => ({
          studentId: s._id,
          status: s.status,
          remarks: s.remarks,
        })),
      };

      await attendanceService.markAttendance(payload);
      setSuccessMessage(`Attendance successfully recorded for ${students.length} students.`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error recording attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-[#0057B8]" />
            Mark Class Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Daily roll-call entry with automatic approved-leave verification (ATT-001, ATT-007).
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Class Selector Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Session Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Time Slot</label>
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll('Present')}
              className="w-full"
            >
              <CheckCheck className="w-4 h-4 mr-1 text-emerald-600" />
              Mark All Present
            </Button>
          </div>
        </div>
      </div>

      {/* Roster & Mark Action */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-gray-900">Student Roll Call</span>
              <span className="text-xs text-gray-500">({students.length} students registered)</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                Present: {presentCount}
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold">
                Absent: {absentCount}
              </span>
            </div>
          </div>

          {loadingStudents ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading student cohort...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No students found for Section {section}, Semester {semester}.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded mr-2">
                      {student.rollNumber}
                    </span>
                    <span className="font-medium text-gray-900 text-sm">{student.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student._id, 'Present')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                        student.status === 'Present'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student._id, 'Absent')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                        student.status === 'Absent'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student._id, 'Late')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                        student.status === 'Late'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Late
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={saving || students.length === 0}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Submitting Attendance...' : 'Save Attendance Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};
