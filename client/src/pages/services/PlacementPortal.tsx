import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { campusServices } from '../../services/campusServicesService';
import { IPlacementDrive } from '../../types/campusServices';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle,
  Building,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export const PlacementPortal: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<IPlacementDrive[]>([]);
  const [appliedDriveIds, setAppliedDriveIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const data = await campusServices.getPlacementDrives();
      setDrives(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleApply = async (driveId: string) => {
    setApplyingId(driveId);
    setMessage(null);
    try {
      await campusServices.applyForDrive(driveId);
      setAppliedDriveIds((prev) => [...prev, driveId]);
      setMessage('Application submitted successfully! Track status on this dashboard.');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Application failed');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-spsu-navy">Training & Placement Cell</h1>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> Release v7.0
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse active campus recruitment drives, verify CGPA cutoff criteria, and submit online applications
          </p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading placement drives...</div>
        ) : drives.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No active recruitment drives at this time.</div>
        ) : (
          drives.map((d) => {
            const isApplied = appliedDriveIds.includes(d._id);

            return (
              <Card key={d._id} className="p-6 border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {d.companyName}
                      </span>
                      <h3 className="text-lg font-bold text-spsu-navy mt-0.5">{d.roleTitle}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Package CTC</span>
                      <span className="text-lg font-extrabold text-emerald-600">{d.ctcPackageLPA} LPA</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">{d.description}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Min CGPA</span>
                      <span className="font-bold text-slate-700">{d.eligibilityCgpa.toFixed(1)} / 10.0</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Drive Date</span>
                      <span className="font-bold text-slate-700">{new Date(d.driveDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={13} className="text-[#0057B8]" />
                    <span>{d.location}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Deadline: {new Date(d.registrationDeadline).toLocaleDateString()}
                  </span>

                  {user?.role === 'STUDENT' && (
                    <Button
                      size="sm"
                      disabled={isApplied || applyingId === d._id}
                      onClick={() => handleApply(d._id)}
                    >
                      {isApplied ? 'Application Submitted' : applyingId === d._id ? 'Submitting...' : 'Apply for Drive'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
