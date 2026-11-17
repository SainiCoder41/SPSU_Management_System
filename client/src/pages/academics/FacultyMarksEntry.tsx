import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import { attendanceService } from '../../services/attendanceService';
import { Subject } from '../../types/attendance';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import {
  Award,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

interface CourseEntry {
  subjectId: string;
  internalMarks: number;
  midTermMarks: number;
  endTermMarks: number;
}

export const FacultyMarksEntry: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [semester, setSemester] = useState(4);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [courseRows, setCourseRows] = useState<CourseEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [studRes, subList] = await Promise.all([
          api.get('/students', { params: { semester, limit: 30 } }),
          attendanceService.getSubjects({ semester }),
        ]);

        setStudents(studRes.data.data);
        if (studRes.data.data.length > 0) {
          setSelectedStudentId(studRes.data.data[0]._id);
        }

        setSubjects(subList);
        if (subList.length > 0) {
          setCourseRows(
            subList.map((s) => ({
              subjectId: s._id,
              internalMarks: 32,
              midTermMarks: 16,
              endTermMarks: 34,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadInitial();
  }, [semester]);

  const handleRowChange = (index: number, field: keyof CourseEntry, value: any) => {
    setCourseRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || courseRows.length === 0) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const res = await academicService.enterMarks({
        studentId: selectedStudentId,
        semester,
        courses: courseRows,
      });

      setSuccessMessage(`Marks saved successfully! Computed SGPA: ${res.sgpa.toFixed(2)}, Cumulative CGPA: ${res.cgpa.toFixed(2)}.`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error recording marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-[#0057B8]" />
            Faculty Grade & Marks Entry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Input continuous internal evaluations, mid-term, and end-term examination marks (ACD-001).
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Target Selector */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
          >
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.rollNumber} - {s.user?.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grading Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900">Course Examination Scorecard</h3>
            <span className="text-xs text-gray-500">Scale: Internal (40) + Mid (20) + End (40) = 100</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Internal (Max 40)</th>
                  <th className="py-3 px-4">Mid-Term (Max 20)</th>
                  <th className="py-3 px-4">End-Term (Max 40)</th>
                  <th className="py-3 px-4 text-right">Total (100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {courseRows.map((row, idx) => {
                  const sub = subjects.find((s) => s._id === row.subjectId);
                  const total = row.internalMarks + row.midTermMarks + row.endTermMarks;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{sub?.name || 'Subject'}</div>
                        <div className="text-xs font-mono text-gray-400">{sub?.code}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={row.internalMarks}
                          onChange={(e) => handleRowChange(idx, 'internalMarks', Number(e.target.value))}
                          className="w-24 px-2.5 py-1 text-sm border border-gray-300 rounded-md focus:ring-[#0057B8]"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={row.midTermMarks}
                          onChange={(e) => handleRowChange(idx, 'midTermMarks', Number(e.target.value))}
                          className="w-24 px-2.5 py-1 text-sm border border-gray-300 rounded-md focus:ring-[#0057B8]"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={row.endTermMarks}
                          onChange={(e) => handleRowChange(idx, 'endTermMarks', Number(e.target.value))}
                          className="w-24 px-2.5 py-1 text-sm border border-gray-300 rounded-md focus:ring-[#0057B8]"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">{total} / 100</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={saving || courseRows.length === 0}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Computing SGPA & Saving...' : 'Save & Compute SGPA/CGPA'}
          </Button>
        </div>
      </form>
    </div>
  );
};
