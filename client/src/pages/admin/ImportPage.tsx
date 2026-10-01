import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.tsx';
import { adminService } from '../../services/admin.service.ts';
import { Button } from '../../components/common/Button.tsx';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

export const ImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setReport(null);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await adminService.importStudents(formData);
      setReport(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Bulk Student Import">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-spsu-navy">CSV / Excel Bulk Import</h2>
          <p className="text-xs text-slate-500">
            Batch onboard new students into SPSU Student Information System
          </p>
        </div>

        {/* UPLOAD CARD */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-spsu-blue transition-colors bg-slate-50/50">
              <FileSpreadsheet className="w-12 h-12 text-spsu-blue mx-auto mb-3" />
              <div className="text-sm font-bold text-spsu-navy">Select Spreadsheet File (.csv or .xlsx)</div>
              <div className="text-xs text-slate-500 mt-1">
                Expected columns: firstName, lastName, email, phone, enrollmentNumber, branch, semester, batch, section, hostelCode
              </div>

              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />

              <div className="mt-4">
                <label
                  htmlFor="file-upload-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-spsu-light text-spsu-blue font-bold text-xs cursor-pointer hover:bg-spsu-blue hover:text-white transition-colors"
                >
                  <Upload className="w-4 h-4" /> Browse File
                </label>
              </div>

              {file && (
                <div className="mt-4 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                  Selected File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end">
              <Button type="submit" variant="primary" size="lg" disabled={!file} isLoading={loading}>
                Process Import Batch
              </Button>
            </div>
          </form>
        </div>

        {/* REPORT DISPLAY */}
        {report && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-spsu-navy">Import Result Summary</h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Total Processed</div>
                <div className="text-2xl font-extrabold text-spsu-navy">{report.total}</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-700 font-bold uppercase">Successful</div>
                <div className="text-2xl font-extrabold text-emerald-700">{report.successful}</div>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-xs text-rose-700 font-bold uppercase">Failed</div>
                <div className="text-2xl font-extrabold text-rose-700">{report.failed}</div>
              </div>
            </div>

            {report.errors && report.errors.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Row Errors & Skipped Items
                </h4>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-rose-50 text-rose-800 font-bold border-b border-rose-200">
                        <th className="py-2 px-3">Row #</th>
                        <th className="py-2 px-3">Field</th>
                        <th className="py-2 px-3">Error Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 text-slate-700">
                      {report.errors.map((err: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono font-bold">Row {err.row}</td>
                          <td className="py-2 px-3 font-semibold text-rose-600">{err.field}</td>
                          <td className="py-2 px-3">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
