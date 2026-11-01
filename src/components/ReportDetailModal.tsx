import React, { useEffect, useState } from 'react';
import { Report, ReportStatus, ReportUpdate, AIMapsGroundingResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import { aiService } from '../services/aiService';
import {
  X,
  MapPin,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Share2,
  Trash2,
  Check,
  ChevronRight,
  RefreshCw,
  Globe,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: Report | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
  onReportDeleted?: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onStatusUpdated,
  onReportDeleted,
}) => {
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [updates, setUpdates] = useState<ReportUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Translation State
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showingTranslation, setShowingTranslation] = useState(false);

  // Admin Quick Status Controls
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminStatus, setAdminStatus] = useState<ReportStatus>(report?.status || 'Submitted');
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmittingAdminUpdate, setIsSubmittingAdminUpdate] = useState(false);

  // AI Triage
  const [aiTriage, setAiTriage] = useState<any | null>(null);
  const [loadingAiTriage, setLoadingAiTriage] = useState(false);

  // Google Maps Grounding
  const [mapsGrounding, setMapsGrounding] = useState<AIMapsGroundingResult | null>(null);
  const [loadingMapsGrounding, setLoadingMapsGrounding] = useState(false);

  const handleFetchMapsGrounding = async () => {
    if (!report) return;
    setLoadingMapsGrounding(true);
    try {
      const res = await aiService.getMapsGrounding({ report });
      setMapsGrounding(res);
    } catch (err) {
      console.warn('Maps Grounding error:', err);
    } finally {
      setLoadingMapsGrounding(false);
    }
  };

  useEffect(() => {
    if (!report) return;
    setAdminStatus(report.status);
    setTranslatedText(null);
    setShowingTranslation(false);
    setLoadingUpdates(true);
    reportService
      .fetchReportUpdates(report.id)
      .then((res) => setUpdates(res))
      .catch((err) => console.warn(err))
      .finally(() => setLoadingUpdates(false));
  }, [report]);

  if (!report) return null;

  const isAuthor = user && user.uid === report.userId;
  const canDelete = (isAuthor && report.status === 'Submitted') || isAdmin;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: 'Submitted',
        };
      case 'Under Review':
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          dot: 'bg-sky-500',
          label: 'Under Review',
        };
      case 'In Progress':
        return {
          bg: 'bg-violet-100 text-violet-800 border-violet-300',
          dot: 'bg-violet-500',
          label: 'In Progress',
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Resolved',
        };
    }
  };

  const statusConfig = getStatusBadge(report.status);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '?reportId=' + report.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTranslate = async () => {
    if (translatedText) {
      setShowingTranslation(!showingTranslation);
      return;
    }
    if (!report) return;
    setIsTranslating(true);
    try {
      const targetLang = language === 'ar' ? 'en' : 'ar';
      const result = await aiService.translateText(report.description, targetLang);
      setTranslatedText(result);
      setShowingTranslation(true);
    } catch (err) {
      console.warn('Translate error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDeleteReport = async () => {
    setIsDeleting(true);
    try {
      await reportService.deleteReport(report.id);
      if (onReportDeleted) onReportDeleted();
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingAdminUpdate(true);
    try {
      await reportService.updateReportStatus({
        reportId: report.id,
        targetUserId: report.userId,
        previousStatus: report.status,
        newStatus: adminStatus,
        message: adminMessage.trim(),
        adminId: user.uid,
        adminName: user.displayName || user.email || 'Municipal Coordinator',
      });
      setShowAdminPanel(false);
      setAdminMessage('');
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err) {
      console.error('Admin update failed:', err);
      alert('Failed to update status.');
    } finally {
      setIsSubmittingAdminUpdate(false);
    }
  };

  const handleGenerateAiTriage = async () => {
    setLoadingAiTriage(true);
    try {
      const summary = await aiService.summarizeReport(report);
      setAiTriage(summary);
    } catch (err) {
      console.error('AI Triage error:', err);
    } finally {
      setLoadingAiTriage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#f6f7f3] rounded-3xl shadow-2xl border border-[#e4e9e1] overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#1c302c]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-white border-b border-[#e4e9e1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#e8f1e9] text-[#143d35] rounded-full border border-[#d7edbd]">
              {report.category}
            </span>
            {report.isVerified && (
              <span className="text-[10px] font-bold text-[#143d35] bg-[#d7edbd]/60 border border-[#d7edbd] px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="p-2 text-stone-500 hover:text-[#143d35] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#143d35]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-[#1c302c] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#f6f7f3]">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c302c] font-serif leading-snug">
              {report.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500">
              <span className="flex items-center gap-1 text-[#143d35] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                {report.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.createdAt).toLocaleDateString('en-AE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {report.authorName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {report.authorName}
                </span>
              )}
            </div>
          </div>

          {/* Photograph if available */}
          {report.imageURL && (
            <div className="rounded-2xl overflow-hidden border border-[#e4e9e1] bg-stone-100 max-h-72 flex items-center justify-center">
              <img
                src={report.imageURL}
                alt={report.title}
                className="w-full h-full object-cover max-h-72 hover:scale-102 transition-transform duration-300"
              />
            </div>
          )}

          {/* Description with Translate Button */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4e9e1] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f6f7f3]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#89958d]">
                Issue Details & Context
              </h4>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#e8f1e9] hover:bg-[#d7edbd] text-[#143d35] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Translate report content"
              >
                <Globe className={`w-3.5 h-3.5 text-[#143d35] ${isTranslating ? 'animate-spin' : ''}`} />
                <span>
                  {isTranslating
                    ? t('modal.translating')
                    : showingTranslation
                    ? t('modal.showOriginal')
                    : `${t('modal.translateBtn')} (${language === 'ar' ? 'English' : 'العربية'})`}
                </span>
              </button>
            </div>

            {showingTranslation && (
              <div className="px-2.5 py-1 bg-[#e8f1e9]/60 rounded-lg text-[11px] font-bold text-[#143d35] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#e97950]" />
                <span>FixMyRAK AI Translation:</span>
              </div>
            )}

            <p className={`text-sm text-[#1c302c] whitespace-pre-line leading-relaxed ${showingTranslation && language === 'en' ? 'text-right' : ''}`}>
              {showingTranslation && translatedText ? translatedText : report.description}
            </p>
          </div>

          {/* AI Summary Banner */}
          {report.aiSummary && (
            <div className="p-3.5 bg-[#e8f1e9] border border-[#d7edbd] rounded-2xl flex items-start gap-3 text-xs text-[#143d35]">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-950">AI Overview</p>
                <p className="mt-0.5 text-sky-800">{report.aiSummary}</p>
              </div>
            </div>
          )}

          {/* GPS Coordinates Tag */}
          <div className="p-3 bg-white rounded-xl border border-[#e4e9e1] flex items-center justify-between text-xs text-stone-600 font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#143d35]" />
              Lat: {report.latitude.toFixed(5)}, Lng: {report.longitude.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#143d35] font-sans font-semibold hover:underline flex items-center gap-1"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Google Maps AI Grounding Card */}
          <div className="p-4 bg-white rounded-2xl border border-[#e4e9e1] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#143d35]">
                  Google Maps AI Verification
                </h4>
              </div>
              <button
                type="button"
                onClick={handleFetchMapsGrounding}
                disabled={loadingMapsGrounding}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#143d35] hover:bg-[#205347] text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-[#d7edbd] ${loadingMapsGrounding ? 'animate-spin' : ''}`} />
                <span>{loadingMapsGrounding ? 'Verifying with Maps...' : mapsGrounding ? 'Re-verify' : 'Verify with Google Maps'}</span>
              </button>
            </div>

            {mapsGrounding ? (
              <div className="space-y-2.5 pt-2 border-t border-[#f6f7f3] text-xs">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
                  <span className="font-extrabold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Confirmed Real Civic Location
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    {(mapsGrounding.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line bg-[#f6f7f3] p-3 rounded-xl border border-[#e4e9e1]">
                  {mapsGrounding.analysis}
                </p>

                {mapsGrounding.groundedPlaces && mapsGrounding.groundedPlaces.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                      Nearby Places on Google Maps:
                    </p>
                    <div className="space-y-1">
                      {mapsGrounding.groundedPlaces.map((pl, idx) => (
                        <a
                          key={idx}
                          href={pl.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 bg-[#f0f4ee] hover:bg-[#e4ede1] rounded-lg text-xs font-semibold text-[#143d35] transition-colors"
                        >
                          <span className="truncate pr-2">{pl.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#143d35] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                Click verify to ground this report against real-world Google Maps place knowledge, nearby municipal infrastructure, and physical landmarks.
              </p>
            )}
          </div>

          {/* Status Timeline History */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" />
              Status Tracking Timeline
            </h4>

            <div className="border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
              {/* Initial Submission point */}
              <div className="relative">
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p className="text-xs font-bold text-slate-800">Report Registered</p>
                <p className="text-[11px] text-slate-500">
                  {new Date(report.createdAt).toLocaleString()} &bull; Initial community submission
                </p>
              </div>

              {/* Subcollection Updates */}
              {updates.map((upd) => (
                <div key={upd.id} className="relative">
                  <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-white" />
                  <p className="text-xs font-bold text-slate-800">
                    Status moved to: <span className="text-sky-700">{upd.newStatus}</span>
                  </p>
                  {upd.message && (
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{upd.message}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {new Date(upd.createdAt).toLocaleString()} &bull; By {upd.adminName || 'Admin'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin AI Triage Section */}
          {isAdmin && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Gemini Executive Triage Assistant
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiTriage}
                  disabled={loadingAiTriage}
                  className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {loadingAiTriage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate Briefing
                </button>
              </div>

              {aiTriage && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs space-y-2 text-purple-950 animate-in fade-in">
                  <p>
                    <strong>Executive Summary:</strong> {aiTriage.executiveSummary}
                  </p>
                  <p>
                    <strong>Main Issue:</strong> {aiTriage.mainIssue}
                  </p>
                  <p>
                    <strong>Urgency Level:</strong>{' '}
                    <span className="font-bold text-red-700">{aiTriage.urgencyLevel}</span>
                  </p>
                  <p>
                    <strong>Recommended Action:</strong> {aiTriage.suggestedAction}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Admin Management Section */}
          {isAdmin && (
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Administrative Status Controls
                </span>
                <ChevronRight
                  className={`w-4 h-4 transform transition-transform ${showAdminPanel ? 'rotate-90' : ''}`}
                />
              </button>

              {showAdminPanel && (
                <form
                  onSubmit={handleAdminUpdate}
                  className="mt-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={adminStatus}
                      onChange={(e) => setAdminStatus(e.target.value as ReportStatus)}
                      className="w-full p-2 text-xs border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrative Note (Visible to citizen)
                    </label>
                    <textarea
                      rows={2}
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="e.g. Field inspection team dispatched to site. Work scheduled for tomorrow morning."
                      className="w-full p-2 text-xs border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAdminUpdate}
                    className="w-full py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingAdminUpdate ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Apply Status Change & Notify Citizen
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-[#e4e9e1] flex items-center justify-between shrink-0">
          <div>
            {canDelete && (
              <div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Report
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-700 font-bold">Confirm delete?</span>
                    <button
                      type="button"
                      onClick={handleDeleteReport}
                      disabled={isDeleting}
                      className="px-2.5 py-1 text-xs bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-stone-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-[#1c302c] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
