import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceSummary, Timetable } from '../../types/attendance';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable'>('attendance');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getMyAttendance();
        setSummary(data);

        // Fetch sample timetable
        if (user) {
          const tt = await attendanceService.getTimetable({
            department: (user as any).department?._id || '67389a00b123456789abcdef',
            semester: 4,
            section: 'A',
          });
          setTimetable(tt);
        }
      } catch (err) {
        console.error('Error fetching student attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getPercentageColor = (pct: number) => {
    if (pct >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 65) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-[#0057B8]" />
            Attendance & Timetable
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Subject-wise attendance tracking, approved leave waivers, and weekly academic timetable.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'attendance'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Attendance Breakdown
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'timetable'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Weekly Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200">
          Loading academic attendance records...
        </div>
      ) : activeTab === 'attendance' ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Overall Attendance */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Cumulative Attendance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {summary?.cumulativePercentage || 100}%
                  </span>
                  <span className="text-xs text-gray-500">
                    ({summary?.attendedClasses || 0} / {summary?.totalClasses || 0} classes)
                  </span>
                </div>
                <div className="w-48 bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${getProgressBarColor(
                      summary?.cumulativePercentage || 100
                    )}`}
                    style={{ width: `${summary?.cumulativePercentage || 100}%` }}
                  />
                </div>
              </div>
              <div
                className={`p-3 rounded-xl border ${getPercentageColor(
                  summary?.cumulativePercentage || 100
                )}`}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Threshold Compliance */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  UGC / Exam Criteria
                </span>
                <span
                  className={`text-sm font-bold px-2.5 py-1 rounded-md inline-block mt-1 ${
                    (summary?.cumulativePercentage || 100) >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {(summary?.cumulativePercentage || 100) >= 75
                    ? 'Eligible for End-Term Exams'
                    : 'Below Mandatory 75% Threshold'}
                </span>
                <p className="text-xs text-gray-400 mt-2">Requires minimum 75% attendance</p>
              </div>
              <div className="p-3 bg-blue-50 text-[#0057B8] rounded-xl border border-blue-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Excused Absences */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Excused Leaves (v2.0)
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {summary?.subjectBreakdown.reduce((sum, s) => sum + s.excusedLeaves, 0) || 0}
                </span>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Approved leave days waived from absences
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Warning Banner if Low Attendance */}
          {summary?.isLowAttendance && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 leading-relaxed">
                <strong>Attention Required:</strong> Your cumulative attendance is currently below the university's <strong>75% mandatory threshold</strong>. Please connect with your Faculty Mentor to avoid semester examination debarment.
              </div>
            </div>
          )}

          {/* Subject Breakdown Table */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0057B8]" />
                Subject-Wise Attendance Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Total Held</th>
                    <th className="py-3 px-4">Attended</th>
                    <th className="py-3 px-4">Excused (Leave)</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {!summary || summary.subjectBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 text-xs">
                        No subject attendance marked yet for current semester.
                      </td>
                    </tr>
                  ) : (
                    summary.subjectBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">{item.subject.name}</div>
                          <div className="text-xs font-mono text-gray-400">
                            {item.subject.code} • {item.subject.credits} Credits
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                            {item.subject.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700">{item.totalClasses}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-700">{item.attendedClasses}</td>
                        <td className="py-3.5 px-4 font-semibold text-purple-700">{item.excusedLeaves}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{item.percentage}%</span>
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${getProgressBarColor(item.percentage)}`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getPercentageColor(
                              item.percentage
                            )}`}
                          >
                            {item.percentage >= 75 ? 'Safe' : 'Critical'}
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
        /* Weekly Timetable Schedule */
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Official Class Schedule</h3>
              <p className="text-xs text-gray-500">Computer Science & Engineering • Semester 4, Section A</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable?.slots?.map((slot, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0057B8] uppercase">{slot.dayOfWeek}</span>
                  <span className="font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{slot.subject?.name || 'Class'}</h4>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                  <span>Faculty: {slot.faculty?.name || 'Faculty'}</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <MapPin className="w-3 h-3 text-red-500" /> {slot.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
