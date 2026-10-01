import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { departmentService } from '../../services/department.service.ts';
import { adminService } from '../../services/admin.service.ts';
import { Button } from '../../components/common/Button.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { Building2, Plus, UserCheck } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [facultyUsers, setFacultyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHodModal, setShowHodModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Form State
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
  const [selectedHodId, setSelectedHodId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dData, uData] = await Promise.all([
        departmentService.getDepartments(),
        adminService.getUsers({ role: 'HOD' }),
      ]);
      setDepartments(dData || []);
      const allStaff = await adminService.getUsers({ limit: 100 });
      setFacultyUsers(allStaff.data?.filter((u: any) => ['FACULTY', 'HOD'].includes(u.role)) || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment(newDept);
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleAssignHod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !selectedHodId) return;
    try {
      await departmentService.assignHod(selectedDeptId, selectedHodId);
      setShowHodModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign HOD');
    }
  };

  return (
    <DashboardLayout title="Academic Departments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-spsu-navy">Departments Directory</h2>
            <p className="text-xs text-slate-500">
              Manage academic units and assign Heads of Department (HOD)
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Department
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-spsu-light text-spsu-blue font-extrabold flex items-center justify-center text-sm">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-spsu-navy text-base">{dept.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">Code: {dept.code}</span>
                  </div>
                </div>
                <Badge variant={dept.isActive ? 'success' : 'danger'}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {dept.description || 'Department offers degree programs and academic research.'}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Head of Department (HOD)</div>
                  <div className="font-bold text-spsu-navy mt-0.5">
                    {dept.hodId ? dept.hodId.fullName : 'No HOD Assigned'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDeptId(dept._id);
                    setSelectedHodId(dept.hodId?._id || '');
                    setShowHodModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-spsu-blue/10 text-spsu-blue font-bold hover:bg-spsu-blue hover:text-white transition-all text-xs"
                >
                  Assign HOD
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE DEPT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-spsu-navy">Add Department</h3>
              <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    placeholder="Computer Science and Engineering"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                    placeholder="CSE"
                    className="w-full p-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  ></textarea>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Create
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ASSIGN HOD MODAL */}
        {showHodModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-spsu-navy">Assign Head of Department</h3>
              <form onSubmit={handleAssignHod} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Professor / Faculty</label>
                  <select
                    value={selectedHodId}
                    onChange={(e) => setSelectedHodId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg font-medium"
                  >
                    <option value="">-- Select HOD --</option>
                    {facultyUsers.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.fullName} ({f.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowHodModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Assignment
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
