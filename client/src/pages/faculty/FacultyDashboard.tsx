import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../../components/common/Badge.tsx';
import { GraduationCap, Users, BookOpen } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademicDirectory = async () => {
      try {
        const res = await api.get('/students?limit=20');
        setStudents(res.data.data || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademicDirectory();
  }, []);

  return (
    <DashboardLayout title="Faculty Portal">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-spsu-navy to-spsu-blue text-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold">Welcome, {user?.fullName}</h2>
          <p className="text-xs text-blue-100/90 mt-1">SPSU Academic Faculty Portal</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-spsu-navy text-sm">Academic Directory Preview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b">
                  <th className="p-3">Student</th>
                  <th className="p-3">Enrollment No</th>
                  <th className="p-3">Branch & Sem</th>
                  <th className="p-3">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id}>
                    <td className="p-3 font-bold text-spsu-navy">{s.userId?.fullName}</td>
                    <td className="p-3 font-mono">{s.enrollmentNumber}</td>
                    <td className="p-3">{s.branch} (Sem {s.semester})</td>
                    <td className="p-3">Section {s.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
