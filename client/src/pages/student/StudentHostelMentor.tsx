import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, UserCheck, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';

export const StudentHostelMentor: React.FC = () => {
  const { user, profile } = useAuth();
  const student = profile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-spsu-navy">Residential & Mentorship Mapping</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed overview of your allocated campus residence, warden contact, and personal faculty mentor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hostel Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-spsu-lightBlue text-spsu-blue rounded-lg">
                <Home size={20} />
              </div>
              <div>
                <h2 className="font-bold text-spsu-navy text-base">Hostel Allocation</h2>
                <span className="text-[11px] text-slate-400">Campus Residential Facility</span>
              </div>
            </div>
            {student?.hostel && (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-spsu-blue border border-blue-200">
                {student.hostel.type} HOSTEL
              </span>
            )}
          </div>

          {student?.hostel ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Hostel Block</span>
                <span className="font-bold text-slate-800 text-sm">{student.hostel.name}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Allocated Room</span>
                <span className="font-mono font-bold text-spsu-blue text-sm">
                  {student.roomNumber || 'Room N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="font-medium text-slate-700">{student.hostel.description || 'Residential Block'}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Chief Warden Contact Details
                </span>
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <ShieldCheck size={16} className="text-spsu-blue" />
                    <span>{student.hostel.warden?.user?.name || 'Mr. Arvind Chauhan (BH2 Warden)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span>{student.hostel.warden?.user?.email || 'warden.bh2@spsu.ac.in'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>{student.hostel.warden?.user?.phone || '+91 98765 00005'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              You are currently registered as a Day Scholar (no campus hostel allocated).
            </div>
          )}
        </div>

        {/* Mentor Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-spsu-lightBlue text-spsu-blue rounded-lg">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="font-bold text-spsu-navy text-base">Assigned Faculty Mentor</h2>
                <span className="text-[11px] text-slate-400">Academic Guidance & Counseling</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Active Mentor
            </span>
          </div>

          {student?.mentor ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Faculty Mentor Name</span>
                <span className="font-bold text-slate-800 text-sm">{student.mentor.user?.name}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Designation</span>
                <span className="font-semibold text-slate-700">{student.mentor.designation}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold text-slate-700">{student.mentor.department?.name || 'CSE'}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Direct Communication Channels
                </span>
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail size={14} className="text-slate-400" />
                    <span>{student.mentor.user?.email}</span>
                  </div>
                  {student.mentor.user?.phone && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      <span>{student.mentor.user?.phone}</span>
                    </div>
                  )}
                  {student.mentor.officeLocation && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{student.mentor.officeLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Mentor mapping is currently being processed by the Head of Department.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
