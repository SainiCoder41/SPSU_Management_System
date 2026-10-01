import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { studentService } from '../../services/student.service.ts';
import { hostelService } from '../../services/hostel.service.ts';
import { adminService } from '../../services/admin.service.ts';
import { Button } from '../../components/common/Button.tsx';
import { ArrowLeft, ArrowRight, CheckCircle2, User, BookOpen, Home, Shield, Sparkles } from 'lucide-react';

export const CreateStudentPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hostels, setHostels] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);

  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',

    enrollmentNumber: '',
    registrationNumber: '',
    admissionYear: new Date().getFullYear(),
    academicYear: '2024-2028',
    program: 'B.Tech',
    degree: 'Bachelor of Technology',
    branch: 'CSE',
    semester: 1,
    batch: '2024-2028',
    section: 'A',
    rollNumber: '',

    mentorId: '',
    hostelId: '',
  });

  useEffect(() => {
    const loadMappings = async () => {
      try {
        const [hData, uData] = await Promise.all([
          hostelService.getHostels(),
          adminService.getUsers({ role: 'MENTOR' }),
        ]);
        setHostels(hData || []);
        setMentors(uData?.data || []);
      } catch (err) {
        console.error('Failed to load mentor/hostel mappings:', err);
      }
    };
    loadMappings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'semester' || name === 'admissionYear' ? Number(value) : value,
    }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please enter required personal details (First Name, Last Name, Email)');
        return;
      }
    } else if (step === 2) {
      if (!formData.enrollmentNumber || !formData.registrationNumber || !formData.rollNumber) {
        setError('Please enter required academic numbers (Enrollment, Registration, Roll No)');
        return;
      }
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        mentorId: formData.mentorId || null,
        hostelId: formData.hostelId || null,
      };
      await studentService.createStudent(payload);
      navigate('/admin/students');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Student Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-spsu-navy">Onboard New Student</h2>
            <p className="text-xs text-slate-500">
              Provision student identity, academic metadata, mentor, and hostel assignment
            </p>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { id: 1, label: 'Personal', icon: User },
              { id: 2, label: 'Academic', icon: BookOpen },
              { id: 3, label: 'Mappings', icon: Home },
              { id: 4, label: 'Guardian', icon: Shield },
              { id: 5, label: 'Review', icon: CheckCircle2 },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;

              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-spsu-blue text-white ring-4 ring-spsu-light'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        isCurrent ? 'text-spsu-blue font-bold' : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div
                      className={`flex-1 h-1 rounded transition-all ${
                        step > s.id ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-spsu-navy pb-2 border-b border-slate-100">
                Step 1: Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="e.g. Singh"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Kapur"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">University Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="aarav.kapur@spsu.ac.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-spsu-navy pb-2 border-b border-slate-100">
                Step 2: Academic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Enrollment No. *</label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    value={formData.enrollmentNumber}
                    onChange={handleChange}
                    placeholder="SPSU2024CSE010"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Registration No. *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="REG2024010"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="24CSE010"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Program</label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue font-bold text-spsu-blue"
                  >
                    <option value="CSE">Computer Science and Engineering (CSE)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="ME">Mechanical Engineering (ME)</option>
                    <option value="CE">Civil Engineering (CE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    placeholder="2024-2028"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="A"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MAPPINGS */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-spsu-navy pb-2 border-b border-slate-100">
                Step 3: College Mappings (Mentor & Hostel)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assigned Mentor</label>
                  <select
                    name="mentorId"
                    value={formData.mentorId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  >
                    <option value="">-- No Mentor Assigned --</option>
                    {mentors.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.fullName} ({m.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Student will be accessible under this mentor's dashboard.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Hostel Residence</label>
                  <select
                    name="hostelId"
                    value={formData.hostelId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-spsu-blue"
                  >
                    <option value="">-- Day Scholar (No Hostel) --</option>
                    {hostels.map((h) => (
                      <option key={h._id} value={h._id}>
                        Hostel {h.code} ({h.gender})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Selecting a hostel grants residence visibility to that hostel's Warden.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GUARDIAN */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-spsu-navy pb-2 border-b border-slate-100">
                Step 4: Guardian & Emergency Information
              </h3>
              <p className="text-xs text-slate-500">
                Parent linkages can be created or attached to existing Parent profiles. Initial setup defaults to unlinked or linked on parent registration.
              </p>
              <div className="p-4 rounded-xl bg-spsu-light/50 border border-spsu-blue/20 text-xs text-slate-700">
                Parents can log in independently using their parent account to view their linked student's profile.
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-spsu-navy pb-2 border-b border-slate-100">
                Step 5: Review & Submit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-spsu-navy">Personal Details</div>
                  <div>Name: {formData.firstName} {formData.middleName} {formData.lastName}</div>
                  <div>Email: {formData.email}</div>
                  <div>Phone: {formData.phone || 'N/A'}</div>
                  <div>Gender: {formData.gender}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-spsu-navy">Academic Details</div>
                  <div>Enrollment: {formData.enrollmentNumber}</div>
                  <div>Branch: {formData.branch} (Sem {formData.semester})</div>
                  <div>Section: {formData.section} | Batch: {formData.batch}</div>
                  <div>Roll No: {formData.rollNumber}</div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>

            {step < 5 ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                isLoading={loading}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Provision Student Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
