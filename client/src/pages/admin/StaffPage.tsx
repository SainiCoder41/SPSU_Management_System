import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { api } from '../../services/api.ts';
import { Button } from '../../components/common/Button.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { SkeletonTable } from '../../components/common/Skeleton.tsx';
import { Users, UserPlus, Mail, Phone, Building2 } from 'lucide-react';

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'FACULTY',
    employeeId: '',
    designation: 'Assistant Professor',
    departmentId: '',
    employmentType: 'FULL_TIME',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([
        api.get('/staff'),
        api.get('/departments'),
      ]);
      setStaff(sRes.data.data || []);
      setDepartments(dRes.data.data || []);
    } catch (err) {
      console.error('Failed to load staff/departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff', form);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create staff member');
    }
  };

  return (
    <DashboardLayout title="Faculty & Staff Directory">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-spsu-navy">Faculty & Staff Records</h2>
            <p className="text-xs text-slate-500">
              Manage professors, mentors, wardens, and HODs across SPSU
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Add Staff Member
          </Button>
        </div>

        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Employee ID</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Employment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {staff.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {st.userId?.firstName?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <div className="font-bold text-spsu-navy">{st.userId?.fullName}</div>
                            <div className="text-[11px] text-slate-400">{st.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{st.employeeId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{st.designation}</td>
                      <td className="py-3.5 px-4">
                        {st.departmentId ? (
                          <Badge variant="neutral">{st.departmentId.code}</Badge>
                        ) : (
                          <span className="text-slate-400 italic">General Staff</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="info">{st.userId?.role}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{st.employmentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-spsu-navy">Add New Staff Member</h3>
              <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      placeholder="EMP-101"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full p-2 border rounded-lg font-bold text-spsu-blue"
                    >
                      <option value="FACULTY">FACULTY</option>
                      <option value="MENTOR">MENTOR</option>
                      <option value="WARDEN">WARDEN</option>
                      <option value="HOD">HOD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Create Staff
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
