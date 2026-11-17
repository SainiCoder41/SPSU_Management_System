import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import { StudentResultsSummary, DigitalIdCard } from '../../types/academic';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import {
  Award,
  GraduationCap,
  QrCode,
  CheckCircle,
  FileText,
  AlertTriangle,
  Building,
  ShieldCheck,
  Phone,
  User,
} from 'lucide-react';

export const StudentResults: React.FC = () => {
  const [data, setData] = useState<StudentResultsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<number>(4);

  // Digital ID Card Modal State
  const [idModalOpen, setIdModalOpen] = useState(false);
  const [idCard, setIdCard] = useState<DigitalIdCard | null>(null);
  const [loadingId, setLoadingId] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await academicService.getMyResults();
        setData(res);
        if (res.marksheets.length > 0) {
          setSelectedSemester(res.marksheets[res.marksheets.length - 1].semester);
        }
      } catch (err) {
        console.error('Error fetching academic results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleOpenIdCard = async () => {
    try {
      setLoadingId(true);
      const card = await academicService.getMyIdCard();
      setIdCard(card);
      setIdModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(false);
    }
  };

  const currentMarksheet = data?.marksheets.find((m) => m.semester === selectedSemester);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'O':
      case 'A+':
      case 'A':
        return 'bg-emerald-100 text-emerald-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-[#0057B8]';
      case 'C':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-rose-100 text-rose-800 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-[#0057B8]" />
            Academic Transcripts & Grade Sheets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Official semester marksheets, CGPA progression, and verifiable digital student identity (ACD-001, ACD-002, ACD-005).
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenIdCard} disabled={loadingId}>
          <QrCode className="w-4 h-4 mr-1.5" />
          {loadingId ? 'Loading ID Card...' : 'Digital Student ID Card'}
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200">
          Loading academic grade sheets...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cumulative CGPA */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Cumulative GPA (CGPA)
                </span>
                <span className="text-3xl font-extrabold text-gray-900">
                  {data?.currentCGPA ? data.currentCGPA.toFixed(2) : '8.60'} / 10.0
                </span>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  First Class with Distinction
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-[#0057B8] rounded-xl border border-blue-200">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            {/* Total Credits */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Credits Completed
                </span>
                <span className="text-3xl font-extrabold text-gray-900">
                  {currentMarksheet?.earnedCredits || 22} Credits
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Out of {currentMarksheet?.totalCredits || 22} semester credits
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Backlog Status */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Active Backlogs
                </span>
                <span className="text-3xl font-extrabold text-gray-900">
                  {currentMarksheet?.backlogs || 0}
                </span>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  Clean Academic Standing
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Marksheet Details */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Semester {selectedSemester} Marksheet
                </h3>
                <p className="text-xs text-gray-500">
                  Academic Session: {currentMarksheet?.academicYear || 2026} • Status: Published
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Select Semester:</span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                >
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Course / Subject</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Internal (40)</th>
                    <th className="py-3 px-4">Mid-Term (20)</th>
                    <th className="py-3 px-4">End-Term (40)</th>
                    <th className="py-3 px-4">Total (100)</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {!currentMarksheet || currentMarksheet.courses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500 text-xs">
                        No examination marks recorded yet for Semester {selectedSemester}.
                      </td>
                    </tr>
                  ) : (
                    currentMarksheet.courses.map((crs, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">{crs.subject?.name || 'Subject'}</div>
                          <div className="text-xs font-mono text-gray-400">{crs.subject?.code || 'CS201'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700">{crs.credits}</td>
                        <td className="py-3.5 px-4 text-gray-700">{crs.internalMarks}</td>
                        <td className="py-3.5 px-4 text-gray-700">{crs.midTermMarks}</td>
                        <td className="py-3.5 px-4 text-gray-700">{crs.endTermMarks}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">{crs.totalMarks}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(crs.grade)}`}>
                            {crs.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-gray-900">{crs.gradePoints}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {currentMarksheet && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-700">
                <span className="font-medium">
                  Semester Grade Point Average (SGPA):{' '}
                  <strong className="text-base text-[#0057B8] font-bold">
                    {currentMarksheet.sgpa.toFixed(2)}
                  </strong>
                </span>
                <span className="font-medium">
                  Cumulative GPA (CGPA):{' '}
                  <strong className="text-base text-gray-900 font-bold">
                    {currentMarksheet.cgpa.toFixed(2)}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Digital Student ID Card Modal (ACD-005) */}
      {idModalOpen && idCard && (
        <Modal
          isOpen={true}
          onClose={() => setIdModalOpen(false)}
          title="SPSU Verified Digital Student Identity Card"
          size="md"
        >
          <div className="space-y-5">
            {/* ID Card Front Surface */}
            <div className="bg-gradient-to-br from-[#0B2545] to-[#0057B8] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-blue-400/30">
              {/* Background watermark badge */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/spsu-logo.svg" alt="SPSU" className="h-8 w-auto brightness-0 invert" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider leading-none">
                      Sir Padampat Singhania University
                    </h3>
                    <p className="text-[10px] text-blue-200 mt-0.5">Udaipur, Rajasthan • Estd. 2007</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400 text-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-2xl text-white overflow-hidden shrink-0 shadow-inner">
                  <User className="w-10 h-10 text-white/80" />
                </div>

                <div className="space-y-1 text-xs">
                  <h4 className="text-base font-extrabold text-white leading-tight">
                    {idCard.studentName}
                  </h4>
                  <p className="text-blue-200 font-mono text-[11px] font-bold">
                    Roll: {idCard.rollNumber}
                  </p>
                  <p className="text-blue-200 text-[11px]">
                    {idCard.program} • {idCard.department}
                  </p>
                  <p className="text-blue-300 text-[10px]">
                    Hostel: {idCard.hostelBlock} • Room: {idCard.roomNumber}
                  </p>
                </div>
              </div>

              {/* QR Code and verification bar */}
              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] text-blue-200">
                <div>
                  <p className="font-semibold text-white">Enrollment: {idCard.enrollmentNumber}</p>
                  <p className="text-blue-300">Valid Through: {idCard.validUntil}</p>
                </div>

                <div className="bg-white p-1.5 rounded-lg shrink-0 shadow-md">
                  {/* Generated QR Placeholder */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(
                      idCard.verificationUrl
                    )}`}
                    alt="QR Verification"
                    className="w-14 h-14"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center justify-between">
              <span>Security verification token:</span>
              <span className="font-mono text-[#0057B8] font-bold">{idCard.idCardNumber}</span>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIdModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
