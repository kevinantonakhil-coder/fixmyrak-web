import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Report,
  ReportCategory,
  ReportStatus,
  UserFeedback,
  AISummarizeResult,
} from '../types';
import { reportService } from '../services/reportService';
import { aiService } from '../services/aiService';
import {
  Shield,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Flag,
  MessageSquare,
  BarChart3,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Star,
  Check,
} from 'lucide-react';

interface AdminDashboardPageProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  openAuthModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  reports,
  onSelectReport,
  openAuthModal,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics' | 'feedback'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');

  // Status Update Modal inside Admin
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('Under Review');
  const [updateMessage, setUpdateMessage] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // AI Summarization
  const [aiSummaries, setAiSummaries] = useState<Record<string, AISummarizeResult>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  // Feedback list
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    if (activeTab === 'feedback') {
      setLoadingFeedback(true);
      reportService
        .fetchAllFeedback()
        .then((res) => setFeedbackList(res))
        .catch((err) => console.warn(err))
        .finally(() => setLoadingFeedback(false));
    }
  }, [activeTab]);

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Admin Authentication Required</h2>
        <p className="text-xs text-slate-500">
          This administration console is restricted to authorized municipal coordinators and platform administrators.
        </p>
        {!user ? (
          <button
            onClick={openAuthModal}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Sign In with Admin Account
          </button>
        ) : (
          <p className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
            Current account ({user.email}) does not hold administrator privileges.
          </p>
        )}
      </div>
    );
  }

  // Filtered reports for admin table
  const filteredReports = reports.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.authorName && r.authorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Analytics counts
  const total = reports.length;
  const submittedCount = reports.filter((r) => r.status === 'Submitted').length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const handleOpenStatusModal = (report: Report) => {
    setEditingReport(report);
    setNewStatus(report.status);
    setUpdateMessage('');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport || !user) return;
    setIsUpdatingStatus(true);
    try {
      await reportService.updateReportStatus({
        reportId: editingReport.id,
        targetUserId: editingReport.userId,
        previousStatus: editingReport.status,
        newStatus,
        message: updateMessage.trim(),
        adminId: user.uid,
        adminName: user.displayName || user.email || 'Municipal Coordinator',
      });
      setEditingReport(null);
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleVerified = async (report: Report) => {
    const nextVal = !report.isVerified;
    await reportService.setVerified(report.id, nextVal);
  };

  const handleToggleFlagged = async (report: Report) => {
    const nextVal = !report.flagged;
    await reportService.setFlagged(report.id, nextVal);
  };

  const handleRunAiSummary = async (report: Report) => {
    setLoadingAiId(report.id);
    try {
      const summary = await aiService.summarizeReport(report);
      setAiSummaries((prev) => ({ ...prev, [report.id]: summary }));
    } catch (err) {
      console.error('AI summary error:', err);
      alert('Failed to generate AI executive summary.');
    } finally {
      setLoadingAiId(null);
    }
  };

  const getStatusStyle = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Under Review':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'In Progress':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#f6f7f3]">
      {/* Top Banner */}
      <div className="bg-[#143d35] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 text-[#d7edbd] rounded-lg border border-white/20">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-[#d7edbd] uppercase tracking-widest">
              FixMyRAK Coordination Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight mt-2">
            Municipal Administration & AI Triage
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            Review community issues, update resolution progression, and dispatch field teams across Ras Al Khaimah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70">Admin Account:</span>
          <span className="text-xs font-mono font-bold text-[#d7edbd] bg-black/20 px-3 py-1.5 rounded-xl border border-white/15">
            {user.email}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e4e9e1] gap-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'border-[#143d35] text-[#143d35]'
              : 'border-transparent text-[#74817b] hover:text-[#143d35]'
          }`}
        >
          Report Management ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#143d35] text-[#143d35]'
              : 'border-transparent text-[#74817b] hover:text-[#143d35]'
          }`}
        >
          Analytics & Trends
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'feedback'
              ? 'border-[#143d35] text-[#143d35]'
              : 'border-transparent text-[#74817b] hover:text-[#143d35]'
          }`}
        >
          Community Feedback
        </button>
      </div>

      {/* TAB 1: Report Management Table */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title, citizen name, area, or description..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ReportCategory | 'all')}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Roads and Potholes">Roads and Potholes</option>
                <option value="Streetlights">Streetlights</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Pavements">Pavements</option>
                <option value="Public Facilities">Public Facilities</option>
                <option value="Other Infrastructure">Other Infrastructure</option>
              </select>
            </div>

            <div className="w-full md:w-44">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Incident Title & Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Triage & Verification</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No reports match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Title & Photo */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            {report.imageURL ? (
                              <img
                                src={report.imageURL}
                                alt={report.title}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 cursor-pointer"
                                onClick={() => onSelectReport(report)}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p
                                onClick={() => onSelectReport(report)}
                                className="font-bold text-slate-900 hover:text-purple-700 cursor-pointer"
                              >
                                {report.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                                {report.description}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                By {report.authorName || 'Citizen'} &bull;{' '}
                                {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {report.category}
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                          {report.location}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </td>

                        {/* Triage / AI */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRunAiSummary(report)}
                              disabled={loadingAiId === report.id}
                              className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors flex items-center gap-1"
                              title="Generate AI summary"
                            >
                              {loadingAiId === report.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-purple-600" />
                              )}
                              AI Triage
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVerified(report)}
                              className={`p-1 rounded-md transition-colors ${
                                report.isVerified
                                  ? 'text-sky-600 bg-sky-50'
                                  : 'text-slate-300 hover:text-slate-500'
                              }`}
                              title={report.isVerified ? 'Marked as verified' : 'Mark as verified'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleFlagged(report)}
                              className={`p-1 rounded-md transition-colors ${
                                report.flagged
                                  ? 'text-rose-600 bg-rose-50'
                                  : 'text-slate-300 hover:text-slate-500'
                              }`}
                              title={report.flagged ? 'Flagged submission' : 'Flag submission'}
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          </div>

                          {aiSummaries[report.id] && (
                            <div className="mt-1 text-[10px] text-purple-900 bg-purple-50 p-1.5 rounded-md border border-purple-200 max-w-xs whitespace-normal">
                              <strong>Urgency:</strong> {aiSummaries[report.id].urgencyLevel} &bull;{' '}
                              {aiSummaries[report.id].suggestedAction}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(report)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Analytics & Trends */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Submissions
              </p>
              <p className="text-3xl font-black text-slate-900 mt-2">{total}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Submitted
              </p>
              <p className="text-3xl font-black text-amber-900 mt-2">{submittedCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                In Progress
              </p>
              <p className="text-3xl font-black text-violet-900 mt-2">{inProgressCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Resolved
              </p>
              <p className="text-3xl font-black text-emerald-900 mt-2">{resolvedCount}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Category Distribution in Ras Al Khaimah
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{cat}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Community Feedback */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Citizen Platform Feedback
          </h3>
          {loadingFeedback ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading feedback...</div>
          ) : feedbackList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No platform feedback submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {fb.userName || 'Anonymous Citizen'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700">{fb.message}</p>
                  <p className="text-[10px] text-slate-400">
                    {fb.category || 'General'} &bull;{' '}
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Administrative Status Update Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Update Report Status
            </h3>
            <p className="text-xs text-slate-500">
              Modifying status for: <strong className="text-slate-800">{editingReport.title}</strong>
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Message (Notifies citizen)
                </label>
                <textarea
                  rows={3}
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="e.g. Municipal asphalt crew has completed resurfacing. Inspection verified."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isUpdatingStatus ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save & Notify Citizen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
