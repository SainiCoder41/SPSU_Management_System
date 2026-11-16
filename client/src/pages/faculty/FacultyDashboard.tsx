import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { GraduationCap, BookOpen, Users, Search, Mail, Building } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const staff = profile;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        query: query || undefined,
        department: staff?.department?._id || undefined,
        limit: 20,
      });
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-spsu-blue uppercase tracking-wider block">
            Faculty Academic Portal
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {staff?.designation} • {staff?.department?.name} ({staff?.department?.code})
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <Building size={16} className="text-spsu-blue" />
          <span>{staff?.officeLocation || 'Academic Block A'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="My Department"
          value={staff?.department?.code || 'CSE'}
          subtitle={staff?.department?.name}
          icon={<Building size={22} />}
        />
        <StatsCard
          title="Designation"
          value={staff?.designation || 'Faculty'}
          subtitle={`ID: ${staff?.employeeId || 'N/A'}`}
          icon={<Users size={22} />}
        />
        <StatsCard
          title="Student Records"
          value={students.length}
          subtitle="Directory records in scope"
          icon={<GraduationCap size={22} />}
        />
      </div>

      {/* Student Directory Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-spsu-navy">Departmental Student Directory</h2>
            <p className="text-xs text-slate-500">Access student academic standing and contact information</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-spsu-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Hostel / Day Scholar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{s.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{s.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-600">Semester {s.semester}</td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{s.section}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        {s.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.hostel ? `${s.hostel.name} (${s.roomNumber || 'Room N/A'})` : 'Day Scholar'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
