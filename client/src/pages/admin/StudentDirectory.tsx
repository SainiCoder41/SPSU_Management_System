import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { departmentService } from '../../services/departmentService';
import { hostelService } from '../../services/hostelService';
import { staffService } from '../../services/staffService';
import { adminService } from '../../services/adminService';
import { Student, Department, Hostel, Staff } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentDirectory: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [mentors, setMentors] = useState<Staff[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Student@1234',
    phone: '',
    enrollmentNumber: '',
    rollNumber: '',
    program: 'B.Tech',
    department: '',
    semester: 1,
    section: 'A',
    cgpa: 8.0,
    admissionYear: 2024,
    hostel: '',
    roomNumber: '',
    mentor: '',
  });

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const fetchDropdownData = async () => {
    try {
      const [deptData, hostelData, staffData] = await Promise.all([
        departmentService.getDepartments(),
        hostelService.getHostels(),
        staffService.getStaff({ role: 'MENTOR' }),
      ]);
      setDepartments(deptData);
      setHostels(hostelData);
      setMentors(staffData);
      if (deptData.length > 0 && !formData.department) {
        setFormData((prev) => ({ ...prev, department: deptData[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        page,
        limit: 10,
        query: query || undefined,
        department: selectedDept || undefined,
        semester: selectedSemester ? Number(selectedSemester) : undefined,
        section: selectedSection || undefined,
        hostel: selectedHostel || undefined,
      });
      setStudents(res.data);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalStudents(res.pagination.total || 0);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, query, selectedDept, selectedSemester, selectedSection, selectedHostel]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Student@1234',
      phone: '',
      enrollmentNumber: `SPSU${new Date().getFullYear()}CSE${Math.floor(100 + Math.random() * 900)}`,
      rollNumber: `24BCSE${Math.floor(10 + Math.random() * 90)}`,
      program: 'B.Tech',
      department: departments[0]?._id || '',
      semester: 1,
      section: 'A',
      cgpa: 8.0,
      admissionYear: new Date().getFullYear(),
      hostel: '',
      roomNumber: '',
      mentor: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setCurrentStudent(s);
    setFormData({
      name: s.user?.name || '',
      email: s.user?.email || '',
      password: '',
      phone: s.user?.phone || '',
      enrollmentNumber: s.enrollmentNumber,
      rollNumber: s.rollNumber,
      program: s.program,
      department: s.department?._id || '',
      semester: s.semester,
      section: s.section,
      cgpa: s.cgpa,
      admissionYear: s.admissionYear,
      hostel: s.hostel?._id || '',
      roomNumber: s.roomNumber || '',
      mentor: s.mentor?._id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student '${name}'? This cannot be undone.`)) {
      try {
        await studentService.deleteStudent(id);
        loadStudents();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentStudent && isEditModalOpen) {
        await studentService.updateStudent(currentStudent._id, formData);
        setIsEditModalOpen(false);
      } else {
        await studentService.createStudent(formData);
        setIsAddModalOpen(false);
      }
      loadStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving student');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const res = await adminService.importStudents(importFile);
      setImportResult(res.result);
      loadStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const templateData = [
      {
        Name: 'Demo Student',
        Email: 'demo.student@spsu.ac.in',
        RollNumber: '24BCSE99',
        EnrollmentNumber: 'SPSU2024CSE999',
        Department: 'CSE',
        Semester: 1,
        Section: 'A',
        CGPA: 8.5,
        AdmissionYear: 2024,
        Hostel: 'BH2',
        RoomNumber: 'B-101',
        MentorEmail: 'mentor.cse@spsu.ac.in',
        Phone: '+91 98765 43210',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'spsu_student_import_template.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-spsu-navy">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student identities, enrollment details, and hostel assignments ({totalStudents} total records)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={studentService.exportStudentsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download size={14} />
            Export Excel
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            icon={<Upload size={14} />}
          >
            Import Batch
          </Button>
          <Button size="sm" onClick={handleOpenAdd} icon={<Plus size={14} />}>
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll no, enrollment..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-spsu-blue"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
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
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={selectedHostel}
            onChange={(e) => {
              setSelectedHostel(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll / Enrollment</th>
                <th className="py-3.5 px-4">Dept / Sem</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Hostel & Room</th>
                <th className="py-3.5 px-4">Mentor</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading students directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-700 font-medium">{s.rollNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.enrollmentNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-spsu-navy">{s.department?.code}</div>
                      <div className="text-[11px] text-slate-500">
                        Sem {s.semester} • Sec {s.section}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        {s.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.hostel ? (
                        <div>
                          <span className="font-medium text-slate-700">{s.hostel.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({s.roomNumber || 'Room N/A'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Day Scholar</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 font-medium">
                        {s.mentor?.user?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Student"
                        className="p-1.5 text-slate-400 hover:text-spsu-blue rounded hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.user?.name)}
                        title="Delete Student"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {page} of {totalPages} ({totalStudents} records)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Update Student Profile' : 'Register New Student'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Student Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                disabled={isEditModalOpen}
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enrollment Number</label>
              <input
                type="text"
                required
                disabled={isEditModalOpen}
                value={formData.enrollmentNumber}
                onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block font-semibold text-slate-700 mb-1">Semester (1 - 8)</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CGPA (0.00 - 10.00)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty Mentor</label>
              <select
                value={formData.mentor}
                onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Unassigned</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.user?.name} ({m.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Allocation</label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Day Scholar (No Hostel)</option>
                {hostels.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.type}) - {h.occupancy}/{h.capacity}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                placeholder="e.g. B-204"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
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
              {isEditModalOpen ? 'Save Changes' : 'Register Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Batch Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportResult(null);
          setImportFile(null);
        }}
        title="Batch Student Import (.xlsx / .csv)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Upload an Excel or CSV file containing student records. The system will automatically link departments, assign hostels, and create student accounts with default login credentials.
          </p>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-semibold text-spsu-blue">Standard Ingestion Template</span>
              <p className="text-[11px] text-slate-500">Includes all required SIS headers</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadSampleTemplate}
              icon={<Download size={14} />}
            >
              Download Template
            </Button>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-spsu-blue transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-spsu-lightBlue file:text-spsu-blue hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-2">Accepted formats: .xlsx, .xls, .csv</p>
            </div>

            {importResult && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle size={16} />
                  <span>
                    Successfully imported {importResult.importedCount} of {importResult.totalRows} records!
                  </span>
                </div>
                {importResult.errors?.length > 0 && (
                  <div className="text-rose-600 mt-2 max-h-32 overflow-y-auto">
                    <p className="font-semibold">Row Warnings / Errors:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {importResult.errors.map((e: any, idx: number) => (
                        <li key={idx}>
                          Row {e.row}: {e.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!importFile || importLoading}
                isLoading={importLoading}
                icon={<Upload size={14} />}
              >
                Start Ingestion
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
