import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { staffService } from '../../services/staffService';
import { Department, Staff } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Building2, Users, GraduationCap, Plus, Edit2, UserCheck } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    hod: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, staffData] = await Promise.all([
        departmentService.getDepartments(),
        staffService.getStaff(),
      ]);
      setDepartments(deptData);
      setFacultyMembers(staffData);
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      hod: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setCurrentDept(d);
    setFormData({
      name: d.name,
      code: d.code,
      description: d.description || '',
      hod: d.hod?._id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && currentDept) {
        await departmentService.updateDepartment(currentDept._id, formData);
        setIsEditModalOpen(false);
      } else {
        await departmentService.createDepartment(formData);
        setIsAddModalOpen(false);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Academic Departments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental hierarchy, curriculum structure, and appointed Head of Department (HOD)
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} icon={<Plus size={14} />}>
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow relative"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-spsu-lightBlue text-spsu-blue border border-blue-200 uppercase">
                  {dept.code}
                </span>
                <h3 className="text-lg font-bold text-spsu-navy mt-2">{dept.name}</h3>
                {dept.description && (
                  <p className="text-xs text-slate-500 mt-1">{dept.description}</p>
                )}
              </div>
              <button
                onClick={() => handleOpenEdit(dept)}
                className="p-1.5 text-slate-400 hover:text-spsu-blue rounded-lg hover:bg-slate-100 transition-colors"
                title="Edit Department / HOD"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <GraduationCap size={14} />
                  <span>Enrolled Students</span>
                </div>
                <div className="text-xl font-bold text-slate-800">{dept.studentCount || 0}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Users size={14} />
                  <span>Faculty Members</span>
                </div>
                <div className="text-xl font-bold text-slate-800">{dept.facultyCount || 0}</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-spsu-blue" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Head of Department
                  </span>
                  <span className="font-semibold text-slate-800">
                    {dept.hod?.user?.name || 'No HOD Assigned'}
                  </span>
                </div>
              </div>
              {dept.hod?.user?.email && (
                <span className="text-slate-400 text-[11px]">{dept.hod.user.email}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Department & HOD' : 'Create Department'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science & Engineering"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
            <input
              type="text"
              required
              placeholder="e.g. CSE"
              disabled={isEditModalOpen}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg uppercase disabled:bg-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Appointed HOD</label>
            <select
              value={formData.hod}
              onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">No HOD Assigned</option>
              {facultyMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.user?.name} ({m.employeeId} - {m.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
