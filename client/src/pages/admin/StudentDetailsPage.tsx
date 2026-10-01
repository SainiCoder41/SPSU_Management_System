import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { studentService } from '../../services/student.service.ts';
import { Badge } from '../../components/common/Badge.tsx';
import { SkeletonCard } from '../../components/common/Skeleton.tsx';
import { ArrowLeft, User, BookOpen, Shield, Home, UserCheck, Phone, Mail, MapPin } from 'lucide-react';

export const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'guardian' | 'hierarchy'>('overview');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
      } catch (err) {
        console.error('Failed to load student details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Student Details">
        <SkeletonCard />
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout title="Student Details">
        <div className="p-8 text-center text-slate-500">Student record not found.</div>
      </DashboardLayout>
    );
  }

  const u = student.userId || {};

  return (
    <DashboardLayout title={`Student Details - ${u.fullName}`}>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-spsu-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        {/* HEADER CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-spsu-blue to-spsu-cyan text-white font-extrabold flex items-center justify-center text-2xl shadow-md border border-spsu-blue/20">
              {u.firstName?.charAt(0) || 'S'}
            </div>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h2 className="text-2xl font-bold text-spsu-navy">{u.fullName}</h2>
                <Badge variant={student.currentStatus === 'ACTIVE' ? 'success' : 'danger'}>
                  {student.currentStatus}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Enrollment: <span className="font-bold text-slate-800">{student.enrollmentNumber}</span> • Reg: {student.registrationNumber}
              </div>
              <div className="text-xs font-semibold text-spsu-blue">
                {student.program} {student.branch} • Semester {student.semester} (Section {student.section})
              </div>
            </div>
          </div>

          <div className="flex flex-col text-right text-xs text-slate-500 gap-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 justify-end">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{u.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{u.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview & Personal', icon: User },
            { id: 'academic', label: 'Academic Record', icon: BookOpen },
            { id: 'guardian', label: 'Guardian / Parents', icon: Shield },
            { id: 'hierarchy', label: 'Hierarchy & Mapping', icon: Home },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                  isActive
                    ? 'border-spsu-blue text-spsu-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="space-y-3">
                <h3 className="font-bold text-spsu-navy uppercase text-[11px] tracking-wider">Personal Identity</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div><span className="font-semibold text-slate-500">Full Name:</span> {u.fullName}</div>
                  <div><span className="font-semibold text-slate-500">Gender:</span> {u.gender || 'OTHER'}</div>
                  <div><span className="font-semibold text-slate-500">Date of Birth:</span> {u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="font-semibold text-slate-500">Account Status:</span> {u.isActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-spsu-navy uppercase text-[11px] tracking-wider">Contact & Address</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div><span className="font-semibold text-slate-500">Email:</span> {u.email}</div>
                  <div><span className="font-semibold text-slate-500">Phone:</span> {u.phone || 'N/A'}</div>
                  <div>
                    <span className="font-semibold text-slate-500">Address:</span>{' '}
                    {student.address?.line1 || 'SPSU Campus'}, {student.address?.city || 'Udaipur'}, {student.address?.state || 'Rajasthan'} ({student.address?.postalCode || '313601'})
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-spsu-navy">Enrollment Specifications</h4>
                <div><span className="font-semibold text-slate-500">Enrollment Number:</span> {student.enrollmentNumber}</div>
                <div><span className="font-semibold text-slate-500">Registration Number:</span> {student.registrationNumber}</div>
                <div><span className="font-semibold text-slate-500">Roll Number:</span> {student.rollNumber}</div>
                <div><span className="font-semibold text-slate-500">Admission Year:</span> {student.admissionYear}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-spsu-navy">Academic Placement</h4>
                <div><span className="font-semibold text-slate-500">Degree & Program:</span> {student.degree} ({student.program})</div>
                <div><span className="font-semibold text-slate-500">Branch:</span> <span className="font-bold text-spsu-blue">{student.branch}</span></div>
                <div><span className="font-semibold text-slate-500">Semester:</span> {student.semester}</div>
                <div><span className="font-semibold text-slate-500">Batch & Section:</span> {student.batch} • Section {student.section}</div>
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="space-y-4">
              <h3 className="font-bold text-spsu-navy text-xs uppercase tracking-wider">Parent & Guardian Linkages</h3>
              {student.parentIds && student.parentIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.parentIds.map((p: any) => (
                    <div key={p._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-spsu-navy">{p.userId?.fullName}</div>
                      <div className="text-slate-500 font-semibold">{p.relation}</div>
                      <div>Email: {p.userId?.email}</div>
                      <div>Phone: {p.userId?.phone || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-200">
                  No parent/guardian accounts explicitly linked to this student profile yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-spsu-light/50 border border-spsu-blue/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-spsu-navy text-sm">
                  <UserCheck className="w-4 h-4 text-spsu-blue" />
                  <span>Assigned Mentor</span>
                </div>
                {student.mentorId ? (
                  <div>
                    <div className="font-bold text-slate-800">{student.mentorId.fullName}</div>
                    <div className="text-slate-600">{student.mentorId.email}</div>
                    <div className="text-slate-600">{student.mentorId.phone || 'N/A'}</div>
                  </div>
                ) : (
                  <div className="text-amber-600 font-semibold italic">No mentor currently assigned</div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-spsu-navy text-sm">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>Hostel & Warden</span>
                </div>
                {student.hostelId ? (
                  <div>
                    <div className="font-bold text-emerald-800">Hostel {student.hostelId.code}</div>
                    <div className="text-slate-600">
                      Warden: {student.hostelId.wardenId ? student.hostelId.wardenId.fullName : 'Unassigned'}
                    </div>
                    {student.hostelId.wardenId?.email && (
                      <div className="text-slate-600">Warden Email: {student.hostelId.wardenId.email}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-600 italic">Day Scholar (No hostel room assigned)</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
