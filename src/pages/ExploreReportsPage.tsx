import React, { useState, useMemo } from 'react';
import { Report, ReportCategory, ReportStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Grid,
  List as ListIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  X,
  User,
  FileText,
  Tag,
  Check,
  ChevronRight,
  Recycle,
  Zap,
  Droplets,
  Leaf,
  AlertTriangle,
  Lightbulb,
  Footprints,
  Building2,
  Wrench,
  Layers,
} from 'lucide-react';

interface ExploreReportsPageProps {
  reports: Report[];
  selectedCategory: ReportCategory | 'all';
  setSelectedCategory: (cat: ReportCategory | 'all') => void;
  onSelectReport: (report: Report) => void;
  setCurrentTab: (tab: string) => void;
}

type SearchScope = 'all' | 'description' | 'location' | 'reporter';

export const ExploreReportsPage: React.FC<ExploreReportsPageProps> = ({
  reports,
  selectedCategory,
  setSelectedCategory,
  onSelectReport,
  setCurrentTab,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOwner, setFilterOwner] = useState<'all' | 'mine'>('all');

  const categories: (ReportCategory | 'all')[] = [
    'all',
    'Water Saving',
    'Electricity Saving',
    'Recycling',
    'Greener Living',
    'Roads and Potholes',
    'Streetlights',
    'Pavements',
    'Public Facilities',
    'Other Infrastructure',
  ];

  const statuses: (ReportStatus | 'all')[] = [
    'all',
    'Submitted',
    'Under Review',
    'In Progress',
    'Resolved',
  ];

  const quickSearchSuggestions = [
    { label: 'Corniche Al Qawasim', scope: 'location' as SearchScope },
    { label: 'Al Hamra Marina', scope: 'location' as SearchScope },
    { label: 'Khuzam', scope: 'location' as SearchScope },
    { label: 'Fatima Al Mansoori', scope: 'reporter' as SearchScope },
    { label: 'Pothole', scope: 'description' as SearchScope },
    { label: 'Streetlight', scope: 'description' as SearchScope },
  ];

  // Filtering & Sorting
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        // Owner filter (All vs Mine)
        if (filterOwner === 'mine') {
          if (!user || report.userId !== user.uid) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && report.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && report.status !== selectedStatus) {
          return false;
        }

        // Search query with targeted scope: description, location, or reporter name
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const descMatch = (report.description || '').toLowerCase().includes(q);
          const locMatch = (report.location || '').toLowerCase().includes(q);
          const authorMatch = (report.authorName || '').toLowerCase().includes(q) ||
            (report.authorEmail || '').toLowerCase().includes(q);
          const titleMatch = (report.title || '').toLowerCase().includes(q);
          const catMatch = (report.category || '').toLowerCase().includes(q);

          if (searchScope === 'description') {
            return descMatch;
          }
          if (searchScope === 'location') {
            return locMatch;
          }
          if (searchScope === 'reporter') {
            return authorMatch;
          }
          // 'all' searches across all key fields
          return descMatch || locMatch || authorMatch || titleMatch || catMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [reports, filterOwner, user, selectedCategory, selectedStatus, searchQuery, searchScope, sortOrder]);

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

  const getCategoryLabel = (cat: ReportCategory | 'all') => {
    if (cat === 'all') return t('cat.all');
    return t(`cat.${cat}`);
  };

  const getStatusLabel = (st: ReportStatus | 'all') => {
    if (st === 'all') return t('status.all');
    return t(`status.${st}`);
  };

  // Helper to determine match reason tag
  const getMatchReason = (report: Report): { type: string; text: string } | null => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    if ((report.authorName || '').toLowerCase().includes(q)) {
      return { type: 'reporter', text: `${t('explore.searchReporter')}: ${report.authorName}` };
    }
    if ((report.location || '').toLowerCase().includes(q)) {
      return { type: 'location', text: `${t('explore.searchLocation')}: ${report.location}` };
    }
    if ((report.description || '').toLowerCase().includes(q)) {
      return { type: 'description', text: t('explore.searchDesc') };
    }
    return null;
  };

  const myReportsTotal = user ? reports.filter((r) => r.userId === user.uid).length : 0;

  const getCategoryMeta = (cat: ReportCategory | 'all') => {
    switch (cat) {
      case 'all':
        return { icon: Layers, dot: 'bg-[#143d35]' };
      case 'Roads and Potholes':
        return { icon: AlertTriangle, dot: 'bg-[#e97950]' };
      case 'Streetlights':
        return { icon: Lightbulb, dot: 'bg-[#ca8a04]' };
      case 'Recycling':
        return { icon: Recycle, dot: 'bg-[#059669]' };
      case 'Electricity Saving':
        return { icon: Zap, dot: 'bg-[#d97706]' };
      case 'Water Saving':
        return { icon: Droplets, dot: 'bg-[#0284c7]' };
      case 'Greener Living':
        return { icon: Leaf, dot: 'bg-[#16a34a]' };
      case 'Pavements':
        return { icon: Footprints, dot: 'bg-[#0284c7]' };
      case 'Public Facilities':
        return { icon: Building2, dot: 'bg-[#7c3aed]' };
      case 'Other Infrastructure':
        return { icon: Wrench, dot: 'bg-[#e11d48]' };
      default:
        return { icon: Tag, dot: 'bg-slate-400' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#f6f7f3]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e4e9e1]">
        <div>
          <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block mb-1">
            {t('explore.badge')}
          </span>
          <h1 className="text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight mt-1">
            {t('explore.title')}
          </h1>
          <p className="text-[#74817b] text-xs sm:text-sm mt-1">
            {t('explore.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('report')}
          className="px-5 py-2.5 rounded-xl bg-[#143d35] hover:bg-[#205347] active:scale-95 text-white font-bold text-xs shadow-sm transition-all self-start md:self-auto cursor-pointer flex items-center gap-2"
        >
          <span>＋</span>
          <span>{t('nav.reportIssue')}</span>
        </button>
      </div>

      {/* Scope Bar: All Community Reports vs My Reports Bar */}
      <div className="flex items-center gap-3">
        <div className="inline-flex p-1 bg-white rounded-xl border border-[#e4e9e1] shadow-2xs">
          <button
            onClick={() => setFilterOwner('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterOwner === 'all'
                ? 'bg-[#143d35] text-white shadow-xs'
                : 'text-[#74817b] hover:text-[#143d35]'
            }`}
          >
            {t('explore.tabAll')} ({reports.length})
          </button>
          <button
            onClick={() => setFilterOwner('mine')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterOwner === 'mine'
                ? 'bg-[#143d35] text-white shadow-xs'
                : 'text-[#74817b] hover:text-[#143d35]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('explore.tabMy')}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                filterOwner === 'mine' ? 'bg-white/20 text-white' : 'bg-[#e8f1e9] text-[#143d35]'
              }`}
            >
              {myReportsTotal}
            </span>
          </button>
        </div>

        {filterOwner === 'mine' && !user && (
          <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            Sign in to view your submitted reports
          </span>
        )}
      </div>

      {/* 1. PRIMARY CATEGORY HUB (Main Anchor: All Categories, Water Saving, Electricity Saving, Recycling, Greener Living) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e4e9e1] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#143d35]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#143d35] uppercase tracking-wider">
              {t('cat.all')} &amp; Focus Areas
            </h2>
            <span className="text-[11px] text-[#74817b] font-medium hidden md:inline">
              — Choose a category or browse all submissions
            </span>
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-[#e97950] hover:text-[#d3643c] cursor-pointer flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show {t('cat.all')}</span>
            </button>
          )}
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat);
            const Icon = meta.icon;
            const count = cat === 'all' ? reports.length : reports.filter((r) => r.category === cat).length;
            const isSelected = selectedCategory === cat;
            const isAll = cat === 'all';

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 border select-none ${
                  isSelected
                    ? 'bg-[#143d35] text-white border-[#143d35] shadow-md shadow-[#143d35]/25 ring-2 ring-[#143d35]/20 scale-[1.02]'
                    : isAll
                    ? 'bg-[#eaf1e9] hover:bg-[#dce9da] text-[#143d35] border-[#c8dac5] font-extrabold shadow-2xs'
                    : 'bg-white hover:bg-[#f6f7f3] text-[#1c302c] border-[#e4e9e1] hover:border-[#143d35]/30 hover:shadow-2xs'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-[#d7edbd]'
                      : isAll
                      ? 'bg-[#143d35]/15 text-[#143d35]'
                      : 'bg-[#f6f7f3] text-[#556961]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{getCategoryLabel(cat)}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isAll
                      ? 'bg-[#143d35] text-white'
                      : 'bg-[#edf1eb] text-[#5b6c65]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. GRADUAL SECONDARY FILTERS: Search, Scope, Status & Display Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e4e9e1] shadow-2xs space-y-3.5">
        {/* Search Input & Scope Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#89958d] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('explore.searchPlaceholder')}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50 font-medium placeholder:text-[#89958d]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Scope Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none bg-[#f6f7f3] p-1 rounded-xl border border-[#e4e9e1] shrink-0">
            <span className="text-[10px] font-bold text-[#89958d] px-2 uppercase tracking-wider hidden sm:inline-block">
              Scope:
            </span>
            <button
              onClick={() => setSearchScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                searchScope === 'all'
                  ? 'bg-white text-[#143d35] shadow-2xs'
                  : 'text-[#74817b] hover:text-[#143d35]'
              }`}
            >
              {t('explore.searchAll')}
            </button>
            <button
              onClick={() => setSearchScope('description')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                searchScope === 'description'
                  ? 'bg-white text-[#143d35] shadow-2xs'
                  : 'text-[#74817b] hover:text-[#143d35]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('explore.searchDesc')}</span>
            </button>
            <button
              onClick={() => setSearchScope('location')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                searchScope === 'location'
                  ? 'bg-white text-[#143d35] shadow-2xs'
                  : 'text-[#74817b] hover:text-[#143d35]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('explore.searchLocation')}</span>
            </button>
            <button
              onClick={() => setSearchScope('reporter')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                searchScope === 'reporter'
                  ? 'bg-white text-[#143d35] shadow-2xs'
                  : 'text-[#74817b] hover:text-[#143d35]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('explore.searchReporter')}</span>
            </button>
          </div>
        </div>

        {/* Refinements: Status Dropdown, Sort Order, Quick Suggestions & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f0f3ee]">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#89958d] uppercase tracking-wider hidden sm:inline">
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'all')}
                className="py-1.5 px-3 text-xs border border-[#e4e9e1] rounded-xl bg-[#f6f7f3] font-semibold text-[#1c302c] focus:ring-2 focus:ring-[#143d35] focus:outline-hidden cursor-pointer"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {getStatusLabel(st)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#89958d] uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="py-1.5 px-3 text-xs border border-[#e4e9e1] rounded-xl bg-[#f6f7f3] font-semibold text-[#1c302c] focus:ring-2 focus:ring-[#143d35] focus:outline-hidden cursor-pointer"
              >
                <option value="newest">{t('explore.sortNewest')}</option>
                <option value="oldest">{t('explore.sortOldest')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Quick Search Suggestions (Compact) */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold text-[#89958d] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#e97950]" />
                Try:
              </span>
              {quickSearchSuggestions.slice(0, 3).map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSearchQuery(item.label);
                    setSearchScope(item.scope);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#143d35] text-[11px] font-semibold border border-[#e4e9e1] transition-colors shrink-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Grid / List Mode */}
            <div className="flex items-center gap-1 bg-[#f6f7f3] p-1 rounded-xl shrink-0 border border-[#e4e9e1]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#143d35] shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#143d35] shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <p>
          {t('explore.showing')}{' '}
          <strong className="text-slate-800 font-extrabold">{filteredReports.length}</strong>{' '}
          {t('explore.of')} {reports.length} {t('explore.reports')}
          {searchQuery && (
            <span className="ml-1">
              matching &ldquo;<span className="text-[#143d35] font-bold">{searchQuery}</span>&rdquo; (in {searchScope})
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="ml-1">
              in <strong className="text-emerald-700">{getCategoryLabel(selectedCategory)}</strong>
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="ml-1">({getStatusLabel(selectedStatus)})</span>
          )}
        </p>

        {(selectedCategory !== 'all' ||
          selectedStatus !== 'all' ||
          searchQuery ||
          filterOwner === 'mine') && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSearchQuery('');
              setSearchScope('all');
              setFilterOwner('all');
            }}
            className="text-[#e97950] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('explore.clearFilters')}</span>
          </button>
        )}
      </div>

      {/* Reports Display: Grid or List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e4e9e1] shadow-xs space-y-4">
          <div className="w-16 h-16 bg-[#f6f7f3] rounded-full flex items-center justify-center mx-auto text-[#89958d]">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#143d35] font-manrope">
            {t('explore.noReports')}
          </h3>
          <p className="text-xs text-[#74817b] max-w-md mx-auto leading-relaxed">
            {t('explore.noReportsDesc')}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSearchQuery('');
              setSearchScope('all');
              setFilterOwner('all');
            }}
            className="px-5 py-2.5 bg-[#143d35] hover:bg-[#205347] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('explore.resetFilters')}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const matchReason = getMatchReason(report);
            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-2xl border border-[#e4e9e1] overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                {/* Photo or placeholder */}
                {report.imageURL ? (
                  <div className="h-48 w-full bg-[#f6f7f3] overflow-hidden relative">
                    <img
                      src={report.imageURL}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                      {report.isVerified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#143d35] text-white shadow-xs">
                          {t('common.verified')}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full bg-[#e8f1e9]/60 p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                      {report.isVerified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#143d35] text-white shadow-xs">
                          {t('common.verified')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#143d35]">
                      {getCategoryLabel(report.category)}
                    </span>
                  </div>
                )}

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Reporter Name & Date Meta */}
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#74817b] mb-1.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(report.createdAt).toLocaleDateString('en-AE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {report.authorName && (
                        <span className="flex items-center gap-1 text-[#143d35] font-semibold text-[11px] truncate max-w-[140px]">
                          <User className="w-3 h-3 text-[#143d35]/70" />
                          {report.authorName}
                        </span>
                      )}
                    </div>

                    {/* Search Match Highlight Tag */}
                    {matchReason && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e8f1e9] text-[#143d35] border border-[#d7edbd]">
                          <Sparkles className="w-2.5 h-2.5 text-[#e97950]" />
                          {matchReason.text}
                        </span>
                      </div>
                    )}

                    <h3 className="text-base font-bold text-[#143d35] font-manrope group-hover:text-[#e97950] transition-colors line-clamp-2">
                      {report.title}
                    </h3>

                    <p className="text-xs text-[#74817b] mt-2 line-clamp-3 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#f6f7f3] flex items-center justify-between text-xs">
                    <span className="text-[#74817b] truncate max-w-[180px] flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#143d35] shrink-0" />
                      {report.location}
                    </span>
                    <span className="font-bold text-[#143d35] group-hover:text-[#e97950] shrink-0 flex items-center gap-1">
                      <span>{t('explore.viewDetails')}</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-2xl border border-[#e4e9e1] divide-y divide-[#f6f7f3] overflow-hidden shadow-xs">
          {filteredReports.map((report) => {
            const matchReason = getMatchReason(report);
            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-5 hover:bg-[#f6f7f3]/50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  {report.imageURL ? (
                    <img
                      src={report.imageURL}
                      alt={report.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 hidden sm:block"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#f6f7f3] flex items-center justify-center text-[#74817b] shrink-0 hidden sm:flex">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                      <span className="text-xs font-semibold text-[#74817b]">
                        {getCategoryLabel(report.category)}
                      </span>
                      {matchReason && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e8f1e9] text-[#143d35]">
                          {matchReason.text}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#143d35] font-manrope hover:text-[#e97950] transition-colors">
                      {report.title}
                    </h3>

                    <p className="text-xs text-[#74817b] line-clamp-1">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#89958d] pt-1">
                      <span className="flex items-center gap-1 text-[#143d35] font-medium">
                        <MapPin className="w-3 h-3 text-[#143d35]" />
                        {report.location}
                      </span>
                      <span>&bull;</span>
                      {report.authorName && (
                        <>
                          <span className="flex items-center gap-1 text-[#1c302c]">
                            <User className="w-3 h-3 text-[#143d35]" />
                            {report.authorName}
                          </span>
                          <span>&bull;</span>
                        </>
                      )}
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#143d35] font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1">
                  <span>{t('explore.viewDetails')}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
