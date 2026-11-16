import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../../components/StatsCard';
import {
  GraduationCap,
  Award,
  BookOpen,
  Home,
  UserCheck,
  Calendar,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const student = profile;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-spsu-navy to-spsu-blue text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              Student Identity & Academic Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2">{user?.name}</h1>
            <p className="text-blue-100 text-xs mt-1">
              Roll No: <span className="font-mono font-semibold">{student?.rollNumber || 'N/A'}</span> •
              Enrollment: <span className="font-mono font-semibold">{student?.enrollmentNumber || 'N/A'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div className="text-right">
              <span className="text-[11px] text-blue-200 uppercase font-semibold block">Academic Standing</span>
              <span className="text-xl font-bold">{student?.cgpa ? `${student.cgpa.toFixed(2)} CGPA` : 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-white/20 rounded-lg">
              <Award size={24} className="text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Degree Program"
          value={student?.program || 'B.Tech'}
          subtitle={student?.department?.name || 'Computer Science'}
          icon={<GraduationCap size={22} />}
        />
        <StatsCard
          title="Current Semester"
          value={`Semester ${student?.semester || 1}`}
          subtitle={`Section ${student?.section || 'A'}`}
          icon={<BookOpen size={22} />}
        />
        <StatsCard
          title="Residential Block"
          value={student?.hostel?.name || 'Day Scholar'}
          subtitle={student?.roomNumber ? `Room ${student.roomNumber}` : 'Local Commuter'}
          icon={<Home size={22} />}
        />
        <StatsCard
          title="Faculty Mentor"
          value={student?.mentor?.user?.name || 'Assigned'}
          subtitle="Academic Guidance"
          icon={<UserCheck size={22} />}
        />
      </div>

      {/* Academic Identity Details & Mentor / Hostel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Identity Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2">
          <h2 className="text-base font-bold text-spsu-navy mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-spsu-blue" />
            Official Academic Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase block text-[10px]">Student Name</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{user?.name}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase block text-[10px]">Institutional Email</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{user?.email}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase block text-[10px]">Roll Number</span>
              <span className="font-mono font-bold text-spsu-navy text-sm mt-0.5 block">
                {student?.rollNumber || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase block text-[10px]">Enrollment Number</span>
              <span className="font-mono font-bold text-spsu-navy text-sm mt-0.5 block">
                {student?.enrollmentNumber || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase block text-[10px]">Department & Code</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {student?.department?.name} ({student?.department?.code})
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase block text-[10px]">Admission Batch</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                Class of {student?.admissionYear || 2023}
              </span>
            </div>
          </div>
        </div>

        {/* Mentor & Hostel Summary Card */}
        <div className="space-y-6">
          {/* Mentor Quick Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-spsu-navy">Assigned Mentor</h3>
              <UserCheck size={16} className="text-spsu-blue" />
            </div>

            {student?.mentor ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">{student.mentor.user?.name}</div>
                <div className="text-slate-500">{student.mentor.designation}</div>
                <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail size={13} className="text-slate-400" />
                  <span>{student.mentor.user?.email}</span>
                </div>
                {student.mentor.user?.phone && (
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>{student.mentor.user?.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Mentor assignment pending with Dean.</p>
            )}
          </div>

          {/* Hostel Quick Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-spsu-navy">Residential Allocation</h3>
              <Home size={16} className="text-spsu-blue" />
            </div>

            {student?.hostel ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{student.hostel.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-spsu-blue font-semibold border border-blue-200">
                    Room {student.roomNumber || 'Assigned'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{student.hostel.description}</p>
                <Link
                  to="/student/hostel-mentor"
                  className="text-spsu-blue font-semibold text-xs inline-block pt-1 hover:underline"
                >
                  View Warden Contact & Details →
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Registered as Day Scholar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
