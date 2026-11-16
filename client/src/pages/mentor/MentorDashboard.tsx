import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portalService } from '../../services/portalService';
import { Student } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { UserCheck, Award, Mail, Phone, Home, BookOpen, AlertCircle } from 'lucide-react';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentees = async () => {
    setLoading(true);
    try {
      const data = await portalService.getMentorMentees();
      setMentees(data.mentees || []);
    } catch (err) {
      console.error('Error fetching mentees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
  }, []);

  const averageCgpa =
    mentees.length > 0
      ? (mentees.reduce((acc, m) => acc + (m.cgpa || 0), 0) / mentees.length).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            Faculty Mentorship Program
          </span>
          <h1 className="text-2xl font-extrabold text-spsu-navy mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student Guidance & Academic Counseling Portal
          </p>
        </div>

        <div className="flex items-center gap-2 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200 text-teal-800 text-xs font-semibold">
          <UserCheck size={16} />
          <span>{mentees.length} Assigned Mentees</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Assigned Mentees"
          value={loading ? '...' : mentees.length}
          subtitle="Students under guidance"
          icon={<UserCheck size={22} />}
        />
        <StatsCard
          title="Cohort Average CGPA"
          value={loading ? '...' : averageCgpa}
          subtitle="Overall academic performance"
          icon={<Award size={22} />}
        />
        <StatsCard
          title="Hostel Residents"
          value={loading ? '...' : mentees.filter((m) => m.hostel).length}
          subtitle="On-campus hostel dwellers"
          icon={<Home size={22} />}
        />
      </div>

      {/* Mentees Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-spsu-navy">Assigned Mentees Roster</h2>
          <span className="text-xs text-slate-400">Direct 1:N Student Mentorship</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading mentees...</div>
        ) : mentees.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No student mentees are currently assigned to your profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentees.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{student.user?.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {student.rollNumber} • {student.enrollmentNumber}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                      {student.cgpa.toFixed(2)} CGPA
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Branch & Semester:</span>
                      <span className="font-semibold text-slate-700">
                        {student.department?.code} • Sem {student.semester} ({student.section})
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Residential Status:</span>
                      <span className="font-semibold text-slate-700">
                        {student.hostel ? `${student.hostel.name} (${student.roomNumber || 'Room N/A'})` : 'Day Scholar'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{student.user?.email}</span>
                  </div>
                  {student.user?.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{student.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
