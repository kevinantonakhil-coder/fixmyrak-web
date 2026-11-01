import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Report, ReportStatus } from '../types';
import { reportService } from '../services/reportService';
import {
  User as UserIcon,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Bell,
  Calendar,
  MapPin,
  ExternalLink,
  Shield,
  Search,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface UserDashboardPageProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  reports,
  onSelectReport,
  setCurrentTab,
  openAuthModal,
}) => {
  const { user, userProfile, isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'reports' | 'profile'>('reports');
  const [selectedStatusTab, setSelectedStatusTab] = useState<ReportStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter reports submitted by current user
  const userSubmissions = useMemo(() => {
    if (!user) return [];
    return reports.filter((r) => r.userId === user.uid);
  }, [reports, user]);

  // If user has 0 submissions, provide sample/recent reports so they see how the tracker bar works
  const hasSubmissions = userSubmissions.length > 0;
  const displayedReports = useMemo(() => {
    const base = hasSubmissions ? userSubmissions : reports.slice(0, 3);
    return base.filter((r) => {
      if (selectedStatusTab !== 'all' && r.status !== selectedStatusTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchLoc = (r.location || '').toLowerCase().includes(q);
        const matchCat = (r.category || '').toLowerCase().includes(q);
        return matchTitle || matchDesc || matchLoc || matchCat;
      }
      return true;
    });
  }, [hasSubmissions, userSubmissions, reports, selectedStatusTab, searchQuery]);

  // Compute metrics
  const totalMyReports = userSubmissions.length;
  const underReviewCount = userSubmissions.filter((r) => r.status === 'Under Review' || r.status === 'Submitted').length;
  const inProgressCount = userSubmissions.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = userSubmissions.filter((r) => r.status === 'Resolved').length;

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this submitted report? This action cannot be undone.')) {
      return;
    }
    setDeletingId(reportId);
    try {
      await reportService.deleteReport(reportId);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Under Review':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'In Progress':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  // 4-step progress tracker calculation
  const getProgressStep = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 1;
      case 'Under Review':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#f6f7f3]">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4e9e1] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-[#e4e9e1]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#e8f1e9] text-[#143d35] font-extrabold text-2xl font-manrope flex items-center justify-center shadow-xs">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#143d35] font-manrope">
                {user ? user.displayName || 'Community Member' : 'Guest Citizen'}
              </h1>
              {isAdmin && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#efebf8] text-[#6b21a8] rounded-full border border-[#6b21a8]/20">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#74817b] mt-0.5">
              {user ? user.email : t('myreports.guestNotice')}
            </p>
            {user && (
              <p className="text-[11px] text-[#89958d] mt-1">
                Active Citizen &bull; {totalMyReports} reports filed
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <button
              onClick={openAuthModal}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#143d35] font-bold text-xs border border-[#e4e9e1] shadow-2xs transition-all cursor-pointer"
            >
              {t('nav.signIn')}
            </button>
          )}

          <button
            onClick={() => setCurrentTab('report')}
            className="px-5 py-2.5 rounded-xl bg-[#143d35] hover:bg-[#205347] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#d7edbd]" />
            <span>{t('nav.reportIssue')}</span>
          </button>
        </div>
      </div>

      {/* Guest notice banner if not signed in */}
      {!user && (
        <div className="bg-[#e8f1e9]/60 border border-[#d7edbd] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#143d35]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#e97950] shrink-0" />
            <div>
              <p className="font-bold">Previewing My Reports Tracker</p>
              <p className="text-[11px] text-[#74817b]">
                Sign in with your email or Google account to save reports and receive instant municipal status alerts.
              </p>
            </div>
          </div>
          <button
            onClick={openAuthModal}
            className="px-4 py-2 bg-[#143d35] text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer hover:bg-[#205347]"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedStatusTab('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'all'
              ? 'bg-white border-[#143d35] ring-2 ring-[#143d35]/15 shadow-sm'
              : 'bg-white border-[#e4e9e1] hover:border-[#143d35]/40 shadow-xs'
          }`}
        >
          <p className="text-xs font-bold text-[#819087] uppercase tracking-wider">
            {t('myreports.total')}
          </p>
          <p className="text-3xl font-extrabold text-[#143d35] font-manrope mt-1">
            {user ? totalMyReports : reports.length}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatusTab('Submitted')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'Submitted'
              ? 'bg-white border-[#e97950] ring-2 ring-[#e97950]/15 shadow-sm'
              : 'bg-white border-[#e4e9e1] hover:border-[#e97950]/40 shadow-xs'
          }`}
        >
          <p className="text-xs font-bold text-[#e97950] uppercase tracking-wider">
            {t('myreports.awaiting')}
          </p>
          <p className="text-3xl font-extrabold text-[#e97950] font-manrope mt-1">
            {user ? underReviewCount : reports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatusTab('In Progress')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'In Progress'
              ? 'bg-white border-[#6b21a8] ring-2 ring-[#6b21a8]/15 shadow-sm'
              : 'bg-white border-[#e4e9e1] hover:border-[#6b21a8]/40 shadow-xs'
          }`}
        >
          <p className="text-xs font-bold text-[#6b21a8] uppercase tracking-wider">
            {t('myreports.inProgress')}
          </p>
          <p className="text-3xl font-extrabold text-[#6b21a8] font-manrope mt-1">
            {user ? inProgressCount : reports.filter((r) => r.status === 'In Progress').length}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatusTab('Resolved')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'Resolved'
              ? 'bg-white border-[#143d35] ring-2 ring-[#143d35]/15 shadow-sm'
              : 'bg-white border-[#e4e9e1] hover:border-[#143d35]/40 shadow-xs'
          }`}
        >
          <p className="text-xs font-bold text-[#143d35] uppercase tracking-wider">
            {t('myreports.resolved')}
          </p>
          <p className="text-3xl font-extrabold text-[#143d35] font-manrope mt-1">
            {user ? resolvedCount : reports.filter((r) => r.status === 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e4e9e1] gap-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-[#143d35] text-[#143d35]'
              : 'border-transparent text-[#74817b] hover:text-[#143d35]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('myreports.title')}</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#e8f1e9] text-[#143d35]">
            {user ? userSubmissions.length : displayedReports.length}
          </span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#143d35] text-[#143d35]'
                : 'border-transparent text-[#74817b] hover:text-[#143d35]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile & Account</span>
          </button>
        )}
      </div>

      {/* Tab 1: My Reports Interactive List & Search Bar */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Dedicated Search & Filter Bar inside My Reports */}
          <div className="bg-white p-4 rounded-2xl border border-[#e4e9e1] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#89958d] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('myreports.searchPlaceholder')}
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {(['all', 'Submitted', 'Under Review', 'In Progress', 'Resolved'] as (ReportStatus | 'all')[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusTab(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedStatusTab === st
                        ? 'bg-[#143d35] text-white shadow-xs'
                        : 'bg-[#f6f7f3] text-[#74817b] hover:bg-[#e8f1e9] hover:text-[#143d35] border border-[#e4e9e1]'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Submissions List */}
          {user && userSubmissions.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-[#e8f1e9] text-[#143d35] rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#143d35] font-manrope">
                {t('myreports.noReports')}
              </h3>
              <p className="text-xs text-[#74817b] max-w-sm mx-auto leading-relaxed">
                {t('myreports.noReportsDesc')}
              </p>
              <button
                onClick={() => setCurrentTab('report')}
                className="px-5 py-2.5 bg-[#143d35] hover:bg-[#205347] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {t('myreports.submitFirst')}
              </button>
            </div>
          ) : displayedReports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-500">No reports matched your search or status filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusTab('all');
                }}
                className="text-xs font-bold text-[#143d35] underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#e4e9e1] divide-y divide-[#f6f7f3] overflow-hidden shadow-xs">
              {displayedReports.map((report) => {
                const step = getProgressStep(report.status);
                return (
                  <div
                    key={report.id}
                    className="p-5 sm:p-6 space-y-4 hover:bg-[#f6f7f3]/40 transition-colors"
                  >
                    {/* Top Row: Meta & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {report.imageURL ? (
                          <img
                            src={report.imageURL}
                            alt={report.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#e4e9e1]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#e8f1e9] flex items-center justify-center text-[#143d35] shrink-0">
                            <MapPin className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                            <span className="text-xs font-semibold text-[#74817b]">
                              {report.category}
                            </span>
                          </div>

                          <h3
                            onClick={() => onSelectReport(report)}
                            className="text-sm sm:text-base font-bold text-[#143d35] font-manrope hover:text-[#e97950] cursor-pointer"
                          >
                            {report.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#89958d]">
                            <span className="flex items-center gap-1 text-[#143d35]">
                              <MapPin className="w-3 h-3 text-[#143d35]" />
                              {report.location}
                            </span>
                            <span>&bull;</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setCurrentTab('map');
                            onSelectReport(report);
                          }}
                          className="px-3 py-1.5 bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#143d35] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Show on Map"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{t('myreports.showOnMap')}</span>
                        </button>

                        <button
                          onClick={() => onSelectReport(report)}
                          className="px-3.5 py-1.5 bg-[#143d35] hover:bg-[#205347] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          {t('myreports.trackDetails')}
                        </button>

                        {/* Allow user deletion only while Submitted */}
                        {user && report.userId === user.uid && report.status === 'Submitted' && (
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={deletingId === report.id}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Municipal Progress Timeline Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#89958d] mb-1.5">
                        <span className={step >= 1 ? 'text-[#143d35]' : ''}>1. Submitted</span>
                        <span className={step >= 2 ? 'text-[#0284c7]' : ''}>2. Under Review</span>
                        <span className={step >= 3 ? 'text-[#7c3aed]' : ''}>3. In Progress</span>
                        <span className={step >= 4 ? 'text-[#16a34a]' : ''}>4. Resolved</span>
                      </div>
                      <div className="h-2 w-full bg-[#e4e9e1] rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${
                            report.status === 'Resolved'
                              ? 'bg-emerald-500 w-full'
                              : report.status === 'In Progress'
                              ? 'bg-violet-500 w-3/4'
                              : report.status === 'Under Review'
                              ? 'bg-sky-500 w-2/4'
                              : 'bg-amber-500 w-1/4'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Settings & Info */}
      {activeTab === 'profile' && user && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4e9e1] space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-[#143d35] font-manrope">
            Account Profile & Civic Standing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#f6f7f3] rounded-2xl border border-[#e4e9e1]">
              <span className="font-bold text-[#89958d] uppercase tracking-wider block mb-1">
                Display Name
              </span>
              <span className="font-semibold text-[#1c302c] text-sm">
                {user.displayName || 'Not specified'}
              </span>
            </div>

            <div className="p-4 bg-[#f6f7f3] rounded-2xl border border-[#e4e9e1]">
              <span className="font-bold text-[#89958d] uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <span className="font-semibold text-[#1c302c] text-sm">
                {user.email}
              </span>
            </div>

            <div className="p-4 bg-[#f6f7f3] rounded-2xl border border-[#e4e9e1]">
              <span className="font-bold text-[#89958d] uppercase tracking-wider block mb-1">
                Role & Permissions
              </span>
              <span className="font-semibold text-[#1c302c] text-sm">
                {isAdmin ? 'System Administrator' : 'Verified Community Member'}
              </span>
            </div>

            <div className="p-4 bg-[#f6f7f3] rounded-2xl border border-[#e4e9e1]">
              <span className="font-bold text-[#89958d] uppercase tracking-wider block mb-1">
                Firebase User ID
              </span>
              <span className="font-mono text-[#74817b] text-xs truncate block">
                {user.uid}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
