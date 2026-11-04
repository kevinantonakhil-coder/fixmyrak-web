import React, { useState, useMemo } from 'react';
import { Report, ReportCategory, ReportStatus, RAK_PRESET_LOCATIONS, AIMapsGroundingResult } from '../types';
import { MapComponent } from '../components/MapComponent';
import { SmartHeatmap } from '../components/SmartHeatmap';
import { useLanguage } from '../context/LanguageContext';
import { aiService } from '../services/aiService';
import {
  MapPin,
  Flame,
  Filter,
  Layers,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Compass,
  Sparkles,
  Building,
  User,
  PlusCircle,
  Recycle,
  Zap,
  Droplets,
  Leaf,
  Tag,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

interface MapPageProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  setCurrentTab: (tab: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  reports,
  onSelectReport,
  setCurrentTab,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [mapView, setMapView] = useState<'reports' | 'heatmap'>('reports');

  // AI Maps Grounding State
  const [sidebarTab, setSidebarTab] = useState<'details' | 'ai'>('details');
  const [aiGrounding, setAiGrounding] = useState<Record<string, AIMapsGroundingResult>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [districtAiAnalysis, setDistrictAiAnalysis] = useState<{
    districtName: string;
    result: AIMapsGroundingResult;
  } | null>(null);

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

  // Filter reports with valid coordinates
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.latitude || !r.longitude) return false;
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      return true;
    });
  }, [reports, selectedCategory, selectedStatus]);

  const handleMarkerClick = (report: Report) => {
    setActiveReport(report);
  };

  const handleVerifyWithGoogleMaps = async (report: Report) => {
    if (aiGrounding[report.id]) {
      setSidebarTab('ai');
      return;
    }

    setIsLoadingAi(true);
    setSidebarTab('ai');
    try {
      const result = await aiService.getMapsGrounding({ report });
      setAiGrounding((prev) => ({ ...prev, [report.id]: result }));
    } catch (err) {
      console.warn('AI Grounding error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleExploreDistrict = async (district: { name: string; lat: number; lng: number }) => {
    setIsLoadingAi(true);
    try {
      const result = await aiService.getMapsGrounding({
        query: `Public municipal facilities, recycling centers, parks, and water/energy saving infrastructure in ${district.name}, Ras Al Khaimah`,
        latitude: district.lat,
        longitude: district.lng,
      });
      setDistrictAiAnalysis({ districtName: district.name, result });
    } catch (err) {
      console.warn('District AI analysis error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-500';
      case 'Under Review':
        return 'bg-sky-500';
      case 'In Progress':
        return 'bg-violet-500';
      case 'Resolved':
        return 'bg-emerald-500';
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

  const currentAiData = activeReport ? aiGrounding[activeReport.id] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-[#f6f7f3]">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block">
              {t('map.badge')}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e8f1e9] text-[#143d35] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#e97950]" />
              Google Maps &amp; Gemini 3.8 Flash Grounded
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight mt-1">
            {t('map.title')}
          </h1>
          <p className="text-[#74817b] text-xs sm:text-sm">
            {t('map.subtitle')} Real civic issues verified with Google Maps live location data.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('report')}
          className="px-5 py-2.5 rounded-xl bg-[#143d35] hover:bg-[#205347] text-white font-bold text-xs shadow-sm self-start sm:self-auto transition-all cursor-pointer flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#d7edbd]" />
          <span>{t('nav.reportIssue')}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4e9e1] bg-white p-3 shadow-xs">
        <div>
          <p className="text-xs font-bold text-[#143d35]">Map view</p>
          <p className="text-[11px] text-[#74817b]">Switch between individual reports and report concentration.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-[#f1f4ef] p-1">
          <button type="button" onClick={() => setMapView('reports')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${mapView === 'reports' ? 'bg-[#143d35] text-white shadow-xs' : 'text-[#74817b] hover:text-[#143d35]'}`}>
            <MapPin className="h-3.5 w-3.5" /> Reports
          </button>
          <button type="button" onClick={() => setMapView('heatmap')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${mapView === 'heatmap' ? 'bg-[#143d35] text-white shadow-xs' : 'text-[#74817b] hover:text-[#143d35]'}`}>
            <Flame className="h-3.5 w-3.5" /> Smart Heatmap
          </button>
        </div>
      </div>

      {mapView === 'reports' ? (
      <>
      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#e4e9e1] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-[#819087] uppercase tracking-wider shrink-0 mr-1">
            {t('cat.all')}:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'all'
                ? reports.length
                : reports.filter((r) => r.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border select-none ${
                  isSelected
                    ? 'bg-[#143d35] text-white border-[#143d35] shadow-xs'
                    : 'bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#1c302c] border-[#e4e9e1]'
                }`}
              >
                <span>{getCategoryLabel(cat)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#74817b]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-[#819087] uppercase tracking-wider shrink-0">
            {t('status.all')}:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#143d35] text-white shadow-xs'
                  : 'bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#1c302c] border border-[#e4e9e1]'
              }`}
            >
              {getStatusLabel(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map View */}
        <div className="lg:col-span-3 space-y-3">
          <MapComponent
            reports={filteredReports}
            selectedReport={activeReport}
            onSelectReport={handleMarkerClick}
            height="620px"
            zoomLevel={11}
          />
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <span>Showing <strong className="text-slate-800">{filteredReports.length}</strong> geocoded reports</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                Google Maps Platform
              </span>
            </span>
            <span className="text-slate-400">
              {t('map.inspectHint')}
            </span>
          </div>
        </div>

        {/* Report Preview & AI Grounding Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {activeReport ? (
            <div className="bg-white p-5 rounded-3xl border border-[#e4e9e1] shadow-md space-y-4 animate-in fade-in">
              {/* Header & Tab Switcher (Details vs AI Grounding) */}
              <div className="flex items-center justify-between pb-2 border-b border-[#e4e9e1]">
                <div className="flex items-center gap-1 p-0.5 bg-[#f6f7f3] rounded-xl border border-[#e4e9e1]">
                  <button
                    onClick={() => setSidebarTab('details')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      sidebarTab === 'details'
                        ? 'bg-white text-[#143d35] shadow-2xs'
                        : 'text-[#74817b] hover:text-[#143d35]'
                    }`}
                  >
                    Report
                  </button>
                  <button
                    onClick={() => handleVerifyWithGoogleMaps(activeReport)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      sidebarTab === 'ai'
                        ? 'bg-[#143d35] text-white shadow-2xs'
                        : 'text-[#143d35] hover:bg-white/50'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#d7edbd]" />
                    <span>AI Grounding</span>
                  </button>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${getStatusColor(
                    activeReport.status
                  )}`}
                >
                  {getStatusLabel(activeReport.status)}
                </span>
              </div>

              {sidebarTab === 'details' ? (
                /* Standard Report Details Tab */
                <div className="space-y-4">
                  {activeReport.imageURL && (
                    <div className="h-36 rounded-2xl overflow-hidden bg-slate-100 border border-[#e4e9e1]">
                      <img
                        src={activeReport.imageURL}
                        alt={activeReport.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-bold text-[#143d35] bg-[#e8f1e9] px-2.5 py-0.5 rounded-md">
                      {getCategoryLabel(activeReport.category)}
                    </span>
                    <h3 className="text-base font-bold text-[#143d35] mt-2 leading-snug font-manrope">
                      {activeReport.title}
                    </h3>
                    <p className="text-xs text-[#74817b] mt-2 line-clamp-4 leading-relaxed">
                      {activeReport.description}
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-slate-500 space-y-1.5 border-t border-[#f6f7f3]">
                    <div className="flex items-center gap-1.5 font-medium text-[#1c302c]">
                      <MapPin className="w-3.5 h-3.5 text-[#143d35] shrink-0" />
                      <span className="truncate">{activeReport.location}</span>
                    </div>
                    {activeReport.authorName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#74817b]">
                        <User className="w-3.5 h-3.5 text-[#89958d]" />
                        <span>Reported by {activeReport.authorName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(activeReport.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerifyWithGoogleMaps(activeReport)}
                    disabled={isLoadingAi}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#143d35] to-[#205347] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-[#d7edbd]" />
                    <span>Verify with Google Maps AI</span>
                  </button>

                  <button
                    onClick={() => onSelectReport(activeReport)}
                    className="w-full py-2.5 rounded-xl bg-[#f0f4ee] hover:bg-[#e4ede1] text-[#143d35] font-bold text-xs border border-[#d3ded0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Full Report Timeline</span>
                  </button>
                </div>
              ) : (
                /* AI Google Maps Grounding Tab */
                <div className="space-y-3 animate-in fade-in">
                  {isLoadingAi ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="w-7 h-7 border-2 border-[#143d35] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-[#143d35]">
                        Grounding location with Google Maps...
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Analyzing nearby landmarks and infrastructure in RAK
                      </p>
                    </div>
                  ) : currentAiData ? (
                    <div className="space-y-3">
                      {/* Verification Badge */}
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-extrabold flex items-center gap-1.5">
                            <span>Google Maps Verified Real Incident</span>
                            <span className="text-[10px] bg-emerald-200/60 px-1.5 rounded-full">
                              {(currentAiData.confidence * 100).toFixed(0)}%
                            </span>
                          </p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Location cross-referenced with public street coordinates in Ras Al Khaimah.
                          </p>
                        </div>
                      </div>

                      {/* AI Analysis Text */}
                      <div className="text-xs text-[#243c36] bg-[#f6f7f3] p-3 rounded-2xl border border-[#e4e9e1] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                        {currentAiData.analysis}
                      </div>

                      {/* Grounded Google Maps Places (Always listed as links as required) */}
                      {currentAiData.groundedPlaces && currentAiData.groundedPlaces.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#89958d]">
                            Google Maps Places &amp; Landmarks:
                          </p>
                          <div className="space-y-1">
                            {currentAiData.groundedPlaces.map((place, idx) => (
                              <a
                                key={idx}
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-white border border-[#e4e9e1] hover:border-[#143d35]/40 hover:bg-[#f0f4ee] transition-all flex items-center justify-between text-xs font-semibold text-[#143d35] group"
                              >
                                <span className="truncate pr-2">{place.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#143d35] shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Back button */}
                      <button
                        onClick={() => setSidebarTab('details')}
                        className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        &larr; Back to report details
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <button
                        onClick={() => handleVerifyWithGoogleMaps(activeReport)}
                        className="px-4 py-2 bg-[#143d35] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Start Google Maps Grounding
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-[#e4e9e1] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f1e9] text-[#143d35] flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#143d35] font-manrope">
                Select a Marker on the Map
              </h4>
              <p className="text-xs text-[#74817b] leading-relaxed">
                Click any status pin on the Google Map to inspect real citizen reports and run AI Google Maps Grounding.
              </p>
            </div>
          )}

          {/* District Quick AI Explorer & Shortcuts */}
          <div className="bg-white p-5 rounded-3xl border border-[#e4e9e1] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#89958d] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#143d35]" />
                {t('map.districts')}
              </h4>
              <span className="text-[10px] text-[#143d35] font-bold bg-[#e8f1e9] px-2 py-0.5 rounded-full">
                AI Enabled
              </span>
            </div>

            <div className="divide-y divide-[#f6f7f3] text-xs">
              {RAK_PRESET_LOCATIONS.slice(0, 6).map((loc) => {
                const count = reports.filter((r) =>
                  r.location.toLowerCase().includes(loc.name.split(' ')[0].toLowerCase())
                ).length;
                return (
                  <div
                    key={loc.name}
                    className="py-2.5 flex items-center justify-between text-[#1c302c] hover:text-[#143d35] hover:bg-[#f6f7f3] px-2 rounded-lg cursor-pointer font-medium transition-colors group"
                  >
                    <div
                      onClick={() => {
                        const match = reports.find((r) =>
                          r.location.toLowerCase().includes(loc.name.split(' ')[0].toLowerCase())
                        );
                        if (match) {
                          setActiveReport(match);
                        }
                      }}
                      className="truncate flex-1"
                    >
                      <span>{loc.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#e8f1e9] text-[#143d35]">
                        {count}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExploreDistrict(loc);
                        }}
                        title={`Explore ${loc.name} with Google Maps AI`}
                        className="p-1 text-slate-400 hover:text-[#143d35] hover:bg-white rounded-md transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-[#e97950]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* District AI Analysis Modal / Drawer */}
            {districtAiAnalysis && (
              <div className="p-3 bg-[#eaf1e9] border border-[#c8dac5] rounded-2xl text-xs space-y-2 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#143d35] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#e97950]" />
                    {districtAiAnalysis.districtName} Intel
                  </span>
                  <button
                    onClick={() => setDistrictAiAnalysis(null)}
                    className="text-slate-500 hover:text-slate-800 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-[#1c302c] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
                  {districtAiAnalysis.result.analysis}
                </div>
                {districtAiAnalysis.result.groundedPlaces && (
                  <div className="pt-1.5 border-t border-[#c8dac5]/50 space-y-1">
                    {districtAiAnalysis.result.groundedPlaces.slice(0, 2).map((place, idx) => (
                      <a
                        key={idx}
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[#143d35] hover:underline flex items-center justify-between"
                      >
                        <span className="truncate">{place.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      ) : (
        <SmartHeatmap reports={reports} onOpenReport={onSelectReport} />
      )}
    </div>
  );
};
