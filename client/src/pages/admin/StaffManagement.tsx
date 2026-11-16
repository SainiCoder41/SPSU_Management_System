import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import { Staff, Department, Role } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { Search, Plus, Edit2, UserCheck, Mail, Building } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Staff@1234',
    phone: '',
    employeeId: '',
    department: '',
    designation: 'Assistant Professor',
    role: 'FACULTY' as Role,
    specialization: '',
    officeLocation: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffData, deptData] = await Promise.all([
        staffService.getStaff({
          department: selectedDept || undefined,
          role: selectedRole || undefined,
          search: search || undefined,
        }),
        departmentService.getDepartments(),
      ]);
      setStaffList(staffData);
      setDepartments(deptData);
      if (deptData.length > 0 && !formData.department) {
        setFormData((prev) => ({ ...prev, department: deptData[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedDept, selectedRole]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Staff@1234',
      phone: '',
      employeeId: `FAC-${Math.floor(100 + Math.random() * 900)}`,
      department: departments[0]?._id || '',
      designation: 'Assistant Professor',
      role: 'FACULTY',
      specialization: '',
      officeLocation: 'Academic Block A',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setCurrentStaff(s);
    setFormData({
      name: s.user?.name || '',
      email: s.user?.email || '',
      password: '',
      phone: s.user?.phone || '',
      employeeId: s.employeeId,
      department: s.department?._id || '',
      designation: s.designation,
      role: s.user?.role || 'FACULTY',
      specialization: s.specialization || '',
      officeLocation: s.officeLocation || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && currentStaff) {
        await staffService.updateStaff(currentStaff._id, formData);
        setIsEditModalOpen(false);
      } else {
        await staffService.createStaff(formData);
        setIsAddModalOpen(false);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Staff & Faculty Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental appointments, mentor roles, and hostel warden administration ({staffList.length} members)
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} icon={<Plus size={14} />}>
          Add Staff Member
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-spsu-blue"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Roles</option>
            <option value="FACULTY">Faculty</option>
            <option value="MENTOR">Mentor</option>
            <option value="WARDEN">Warden</option>
            <option value="HOD">Head of Dept (HOD)</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Emp ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Office Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading staff records...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {s.employeeId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {s.department?.name} ({s.department?.code})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{s.designation}</td>
                    <td className="py-3.5 px-4">
                      <Badge role={s.user?.role} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {s.officeLocation || 'Main Campus'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Staff Member"
                        className="p-1.5 text-slate-400 hover:text-spsu-blue rounded hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Update Staff Member' : 'Register New Staff Member'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                disabled={isEditModalOpen}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                required
                disabled={isEditModalOpen}
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Role Access</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="FACULTY">Faculty</option>
                <option value="MENTOR">Mentor</option>
                <option value="WARDEN">Warden</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Associate Professor"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
              <input
                type="text"
                value={formData.officeLocation}
                onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                placeholder="e.g. Block A, Room 302"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Specialization / Research Area</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Cloud Computing, AI, VLSI Design"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {isEditModalOpen ? 'Save Changes' : 'Register Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
