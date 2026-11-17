import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { aiService } from '../../services/aiService';
import { IStudentRiskProfile } from '../../types/ai';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  UserCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

export const MentorAttentionList: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<IStudentRiskProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<IStudentRiskProfile | null>(null);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'HOD' && user.department) {
        const deptId = typeof user.department === 'string' ? user.department : (user.department as any)._id;
        const data = await aiService.getDepartmentRisk(deptId);
        setProfiles(data);
      } else {
        const data = await aiService.getMentorMenteesRisk();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Failed to load risk analysis profiles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, [user]);

  const filtered = profiles.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.riskLevel === filter;
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const highRiskCount = profiles.filter((p) => p.riskLevel === 'HIGH').length;
  const mediumRiskCount = profiles.filter((p) => p.riskLevel === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-spsu-navy">AI Student Early Warning & Needs Attention</h1>
            <span className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> Release v6.0 AI
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Algorithmic early-intervention index evaluating attendance drops, academic dips, and leave irregularities
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />} onClick={fetchRiskData}>
          Refresh Risk Engine
        </Button>
      </div>

      {/* Advisory Mandatory Notice (AI-007) */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex items-start gap-3">
        <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Strict Advisory Notice (AI-007): </span>
          The risk scores and priority rankings below are generated algorithmically solely to guide proactive mentor
          counseling, remedial academic support, and student welfare outreach. Under university policy, this index is
          never to be utilized for automated punitive, disciplinary, or exclusionary decisions.
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">High Attention Priority</span>
            <h3 className="text-3xl font-extrabold text-red-700 mt-1">{highRiskCount}</h3>
            <p className="text-xs text-red-600/80 mt-0.5">Critical attendance or marks drop</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Moderate Attention</span>
            <h3 className="text-3xl font-extrabold text-amber-700 mt-1">{mediumRiskCount}</h3>
            <p className="text-xs text-amber-600/80 mt-0.5">Approaching 75% cutoff threshold</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Good Academic Standing</span>
            <h3 className="text-3xl font-extrabold text-emerald-700 mt-1">
              {profiles.filter((p) => p.riskLevel === 'LOW').length}
            </h3>
            <p className="text-xs text-emerald-600/80 mt-0.5">Regular attendance & stable CGPA</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === lvl
                  ? 'bg-spsu-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl === 'ALL' ? 'All Mentees' : `${lvl} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked Students List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-[#0057B8]" />
              <p className="text-sm">Evaluating student risk parameters...</p>
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-base font-semibold">No students in this attention category</p>
              <p className="text-xs text-slate-400 mt-1">All monitored students meet positive academic milestones.</p>
            </Card>
          ) : (
            filtered.map((p) => {
              const isSelected = selectedProfile?.studentId === p.studentId;
              const badgeBg =
                p.riskLevel === 'HIGH'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : p.riskLevel === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={p.studentId}
                  onClick={() => setSelectedProfile(p)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                    isSelected
                      ? 'border-[#0057B8] ring-2 ring-blue-100 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{p.studentName}</h4>
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {p.rollNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                          {p.riskLevel} PRIORITY ({p.riskScore}/100)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {p.department} • Semester {p.semester} • Mentor: {p.mentorName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">Attendance</div>
                      <div
                        className={`text-sm font-bold ${
                          p.metrics.attendancePercentage < 75 ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {p.metrics.attendancePercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Primary Trigger Factors */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.factors.slice(0, 2).map((f, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                    {p.factors.length > 2 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{p.factors.length - 2} more factors
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Inspection & Intervention Sidepane */}
        <div className="lg:col-span-1">
          {selectedProfile ? (
            <Card className="p-5 sticky top-20 border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{selectedProfile.studentName}</h3>
                  <span className="text-xs text-slate-500 font-mono">{selectedProfile.rollNumber}</span>
                </div>
                <div className="text-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Risk Score</div>
                  <div className="text-xl font-extrabold text-spsu-navy">{selectedProfile.riskScore}</div>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 gap-2 my-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Attendance</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedProfile.metrics.attendancePercentage}%
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Current CGPA</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProfile.metrics.cgpa.toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Active Backlogs</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProfile.metrics.backlogs}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Rejected Leaves</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProfile.metrics.rejectedLeaves}</span>
                </div>
              </div>

              {/* Plain-English Contributory Factors (AI-002) */}
              <div className="mb-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info size={14} className="text-[#0057B8]" /> Detected Factors
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedProfile.factors.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Mentoring Interventions (AI-003) */}
              <div className="mb-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-600" /> Recommended Actions
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedProfile.recommendedActions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 italic leading-snug">{selectedProfile.disclaimer}</p>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 border-dashed border-2">
              <UserCheck size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Select any student profile to inspect factors and recommended mentoring interventions</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
