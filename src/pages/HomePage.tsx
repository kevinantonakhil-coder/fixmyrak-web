import React, { useState, useEffect } from 'react';
import { Report, ReportCategory, ReportStatus } from '../types';
import { MapComponent } from '../components/MapComponent';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Recycle,
  Zap,
  Droplets,
  Leaf,
  Footprints,
  Building2,
  Wrench,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface HomePageProps {
  reports: Report[];
  setCurrentTab: (tab: string) => void;
  setSelectedCategory: (cat: ReportCategory | 'all') => void;
  onSelectReport: (report: Report) => void;
  openAuthModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  reports,
  setCurrentTab,
  setSelectedCategory,
  onSelectReport,
  openAuthModal,
}) => {
  const { t } = useLanguage();
  const [activeLandmarkIndex, setActiveLandmarkIndex] = useState(0);

  const landmarks = [
    {
      id: 'jebel-jais',
      name: 'Jebel Jais Highway',
      tagline: 'UAE’s Highest Peak • 1,934m',
      district: 'Hajar Mountains',
      image: `${import.meta.env.BASE_URL}assets/rak/jebel-jais.jpg`,
      alt: 'Scenic winding highway through the rugged mountains of Jebel Jais in Ras Al Khaimah',
      description: 'Mountain road safety, guardrails, rockfall netting, and high-altitude rest area maintenance.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      id: 'corniche',
      name: 'Corniche Al Qawasim',
      tagline: 'Mangrove Eco-Reserve & Promenade',
      district: 'Creek & City Center',
      image: `${import.meta.env.BASE_URL}assets/rak/corniche-mangroves.jpg`,
      alt: 'Lush green mangroves and pedestrian boardwalk along Corniche Al Qawasim in Ras Al Khaimah',
      description: 'Pedestrian walkway lighting, mangrove water cleanliness, and shaded family seating.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    },
    {
      id: 'marjan',
      name: 'Al Marjan Island & Coastline',
      tagline: 'Turquoise Arabian Gulf Shores',
      district: 'Southern Coast',
      image: `${import.meta.env.BASE_URL}assets/rak/marjan-coastline.jpg`,
      alt: 'Pristine beach and modern promenade on Al Marjan Island in Ras Al Khaimah',
      description: 'Beach cleanliness, curb maintenance, pedestrian crossing safety, and coastal amenities.',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
    },
    {
      id: 'dhayah',
      name: 'Historic Dhayah Fort',
      tagline: 'Hilltop Fortress & Date Palm Oasis',
      district: 'Northern RAK (Al Rams)',
      image: `${import.meta.env.BASE_URL}assets/rak/dhayah-fort.jpg`,
      alt: '19th century hilltop Dhayah Fort surrounded by date palms and mountains in Ras Al Khaimah',
      description: 'Heritage pathway access, signage, oasis irrigation protection, and community care.',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
    },
  ];

  // Auto-cycle hero landmark every 6 seconds if user has not manually interacted
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLandmarkIndex((prev) => (prev + 1) % landmarks.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [landmarks.length]);

  // Live statistics from Firestore
  const totalCount = reports.length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  const categories = [
    {
      title: 'Water Saving' as ReportCategory,
      desc: 'Broken irrigation lines, sprinkler bursts, freshwater leaks',
      icon: Droplets,
      color: 'bg-[#e0f2fe] text-[#0284c7]',
    },
    {
      title: 'Electricity Saving' as ReportCategory,
      desc: 'Daylight lighting waste, photo-sensor faults, energy efficiency',
      icon: Zap,
      color: 'bg-[#fef9c3] text-[#b45309]',
    },
    {
      title: 'Recycling' as ReportCategory,
      desc: 'Segregated bin sorting, bottles, cans, and e-waste drop-offs',
      icon: Recycle,
      color: 'bg-[#ecfdf5] text-[#059669]',
    },
    {
      title: 'Greener Living' as ReportCategory,
      desc: 'Native Ghaf trees, community planting, mangrove eco-trails',
      icon: Leaf,
      color: 'bg-[#dcfce7] text-[#15803d]',
    },
    {
      title: 'Roads and Potholes' as ReportCategory,
      desc: 'Asphalt cracks, potholes, street surface hazards',
      icon: AlertTriangle,
      color: 'bg-[#fff0e8] text-[#e97950]',
    },
    {
      title: 'Streetlights' as ReportCategory,
      desc: 'Broken lamps, dark sections, electrical pole safety',
      icon: Lightbulb,
      color: 'bg-[#fef9c3] text-[#ca8a04]',
    },
    {
      title: 'Pavements' as ReportCategory,
      desc: 'Broken curb stones, sunken walkway tiles, pedestrian paths',
      icon: Footprints,
      color: 'bg-[#e0f2fe] text-[#0369a1]',
    },
    {
      title: 'Public Facilities' as ReportCategory,
      desc: 'Community parks, shaded benches, beach amenities',
      icon: Building2,
      color: 'bg-[#efebf8] text-[#6b21a8]',
    },
    {
      title: 'Other Infrastructure' as ReportCategory,
      desc: 'Traffic guardrails, signage, water drainage covers',
      icon: Wrench,
      color: 'bg-[#ffe4e6] text-[#be123c]',
    },
  ];

  const recentReports = reports.slice(0, 4);

  const getStatusStyle = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
      case 'Under Review':
        return 'bg-[#fff0e8] text-[#c2410c] border-[#ffedd5]';
      case 'In Progress':
        return 'bg-[#efebf8] text-[#6b21a8] border-[#e9d5ff]';
      case 'Resolved':
        return 'bg-[#e8f1e9] text-[#143d35] border-[#bbf7d0]';
    }
  };

  return (
    <div className="space-y-16 pb-16 bg-[#f6f7f3]">
      {/* Hero Section matching FixMyRak reference site */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-6 space-y-6">
            {/* Eyebrow with green pulse dot & tagline */}
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#72a879] shadow-[0_0_0_4px_rgba(114,168,121,0.2)] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-[#819087] tracking-[0.14em] uppercase">
                Your Community &bull; Your Voice &bull; A Better RAK
              </span>
            </div>

            {/* Giant Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#143d35] font-manrope tracking-tight leading-[1.08]">
              Better, <br />
              <span className="text-[#e97950]">block by block.</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#738078] leading-relaxed max-w-lg">
              A simple, community-powered way to improve Ras Al Khaimah — from safer streets and cleaner public spaces to eco-friendly choices that protect local wildlife and habitats.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentTab('report')}
                className="px-6 py-3.5 rounded-xl bg-[#143d35] hover:bg-[#205347] active:scale-95 text-white font-bold text-xs shadow-lg shadow-[#143d35]/15 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>＋ {t('nav.reportIssue')}</span>
                <span className="text-[#d7edbd]">&rarr;</span>
              </button>

              <button
                onClick={() => setCurrentTab('explore')}
                className="px-4 py-3 rounded-xl text-xs font-bold text-[#143d35] hover:bg-[#e8f1e9] border border-[#e4e9e1] flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
              >
                <span>{t('nav.explore')}</span>
                <span className="text-[#e97950] font-bold">&rarr;</span>
              </button>

              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-3 rounded-xl text-xs font-bold text-[#143d35] hover:bg-[#e8f1e9] border border-[#e4e9e1] flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
              >
                <span>{t('nav.myReports')}</span>
                <span className="text-[#143d35] font-bold">&rarr;</span>
              </button>
            </div>

            {/* Hero Note & Avatar Stack */}
            <div className="pt-2 flex items-center gap-3 text-xs text-[#839087]">
              <div className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#dcebd4] text-[#42604c] text-[9px] font-bold border-2 border-[#f6f7f3] flex items-center justify-center">
                  RA
                </span>
                <span className="w-6 h-6 rounded-full bg-[#f3d9cb] text-[#905f48] text-[9px] font-bold border-2 border-[#f6f7f3] flex items-center justify-center">
                  FM
                </span>
                <span className="w-6 h-6 rounded-full bg-[#e4def0] text-[#655484] text-[9px] font-bold border-2 border-[#f6f7f3] flex items-center justify-center">
                  TQ
                </span>
              </div>
              <p className="text-[11px]">
                Shared by community members across <strong className="text-[#4a5b52]">Ras Al Khaimah</strong>
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual with Dynamic High-Quality RAK Landmarks & Sticker */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[24px] overflow-hidden shadow-xl border border-[#e4e9e1] aspect-[4/3] bg-[#143d35] group">
              {/* Landmark Image */}
              <img
                key={landmarks[activeLandmarkIndex].id}
                src={landmarks[activeLandmarkIndex].image}
                alt={landmarks[activeLandmarkIndex].alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />

              {/* Top District Tag & Quick Switcher Pill */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#143d35] shadow-xs border border-white/60">
                  {landmarks[activeLandmarkIndex].district}
                </span>
              </div>

              {/* Bottom Gradient Shade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#142a25]/90 via-[#142a25]/30 to-transparent pointer-events-none" />

              {/* Bottom Info & Navigation Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
                <div className="space-y-1 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d7edbd] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#d7edbd] uppercase tracking-wider">
                      {landmarks[activeLandmarkIndex].tagline}
                    </span>
                  </div>
                  <strong className="block text-base sm:text-lg font-extrabold font-manrope leading-tight drop-shadow-sm">
                    {landmarks[activeLandmarkIndex].name}
                  </strong>
                  <p className="text-[11px] text-white/80 line-clamp-1">
                    {landmarks[activeLandmarkIndex].description}
                  </p>
                </div>

                {/* Thumbnail Dots Switcher */}
                <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                  {landmarks.map((landmark, idx) => (
                    <button
                      key={landmark.id}
                      type="button"
                      onClick={() => setActiveLandmarkIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeLandmarkIndex
                          ? 'w-6 bg-[#d7edbd]'
                          : 'w-2 bg-white/40 hover:bg-white/80'
                      }`}
                      aria-label={`Show ${landmark.name}`}
                      title={landmark.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rotated Hero Sticker: RAK ✳ TOGETHER */}
            <div className="absolute -top-4 -right-3 sm:-right-4 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#d7edbd] text-[#143d35] flex flex-col items-center justify-center font-manrope font-extrabold text-[10px] sm:text-[11px] leading-tight rotate-12 shadow-lg border-2 border-[#f6f7f3] pointer-events-none z-20">
              <span className="text-base text-[#143d35]">✳</span>
              <span>RAK</span>
              <span className="text-[9px] font-bold text-[#143d35]/80">TOGETHER</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Row (Clean Pastel Cards from reference style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Reports */}
          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#e4e9e1] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1e9] text-[#143d35] flex items-center justify-center font-bold text-base shrink-0">
              ◎
            </div>
            <div>
              <strong className="block text-2xl font-extrabold text-[#143d35] font-manrope leading-none">
                {totalCount}
              </strong>
              <small className="text-[11px] text-[#74817b] font-medium mt-1 block">
                Total community reports
              </small>
            </div>
          </div>

          {/* Card 2: Under Review */}
          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#e4e9e1] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#fff0e8] text-[#e97950] flex items-center justify-center font-bold text-base shrink-0">
              ◷
            </div>
            <div>
              <strong className="block text-2xl font-extrabold text-[#143d35] font-manrope leading-none">
                {underReviewCount}
              </strong>
              <small className="text-[11px] text-[#74817b] font-medium mt-1 block">
                Being reviewed
              </small>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#e4e9e1] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#efebf8] text-[#6b21a8] flex items-center justify-center font-bold text-base shrink-0">
              ⚙
            </div>
            <div>
              <strong className="block text-2xl font-extrabold text-[#143d35] font-manrope leading-none">
                {inProgressCount}
              </strong>
              <small className="text-[11px] text-[#74817b] font-medium mt-1 block">
                In progress
              </small>
            </div>
          </div>

          {/* Card 4: Resolved */}
          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#e4e9e1] flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1e9] text-[#143d35] flex items-center justify-center font-bold text-base shrink-0">
              ✓
            </div>
            <div>
              <strong className="block text-2xl font-extrabold text-[#143d35] font-manrope leading-none">
                {resolvedCount}
              </strong>
              <small className="text-[11px] text-[#74817b] font-medium mt-1 block">
                Resolved & verified
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block mb-1">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
            How FixMyRAK works
          </h2>
          <p className="text-[#74817b] text-xs sm:text-sm mt-1">
            Community transparency designed to make civic infrastructure reporting simple, respectful, and visible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#e4e9e1] shadow-xs hover:border-[#143d35]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1e9] text-[#143d35] font-extrabold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-sm text-[#143d35] mb-1 font-manrope">
              Notice an Issue
            </h3>
            <p className="text-xs text-[#74817b] leading-relaxed">
              Describe a road hazard, streetlight, or cleanliness concern in your neighborhood.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e4e9e1] shadow-xs hover:border-[#143d35]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#fff0e8] text-[#e97950] font-extrabold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-sm text-[#143d35] mb-1 font-manrope">
              Gemini AI Categorization
            </h3>
            <p className="text-xs text-[#74817b] leading-relaxed">
              AI automatically classifies the issue, suggests a clear title, and checks for duplicates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e4e9e1] shadow-xs hover:border-[#143d35]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] font-extrabold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-sm text-[#143d35] mb-1 font-manrope">
              Pinpoint on Map
            </h3>
            <p className="text-xs text-[#74817b] leading-relaxed">
              Drop the pin directly on the Ras Al Khaimah map with GPS precision or district shortcuts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e4e9e1] shadow-xs hover:border-[#143d35]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#efebf8] text-[#6b21a8] font-extrabold flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="font-bold text-sm text-[#143d35] mb-1 font-manrope">
              Follow Progress
            </h3>
            <p className="text-xs text-[#74817b] leading-relaxed">
              Follow transparent status updates with notifications from submission to resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block mb-1">
              Issue Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
              Browse by infrastructure category
            </h2>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentTab('explore');
            }}
            className="text-xs font-bold text-[#143d35] hover:text-[#e97950] flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>View all reports</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const count = reports.filter((r) => r.category === cat.title).length;
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                onClick={() => {
                  setSelectedCategory(cat.title);
                  setCurrentTab('explore');
                }}
                className="bg-white p-6 rounded-2xl border border-[#e4e9e1] hover:border-[#143d35]/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#f6f7f3] text-[#143d35] rounded-full border border-[#e4e9e1]">
                      {count} {count === 1 ? 'Report' : 'Reports'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#143d35] font-manrope group-hover:text-[#e97950] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#74817b] mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#f6f7f3] flex items-center justify-between text-xs font-bold text-[#143d35]">
                  <span>Filter by category</span>
                  <span className="text-[#e97950] font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High Quality RAK Landscapes & Communities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#143d35]" />
              <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest">
                From Peaks to Coastline • Ras Al Khaimah
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
              Caring for our emirate's distinct environments
            </h2>
            <p className="text-[#74817b] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Every neighborhood across Ras Al Khaimah has unique infrastructure and ecological needs. See where community reports are actively protecting shared spaces.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('map')}
            className="text-xs font-bold text-[#143d35] hover:text-[#e97950] flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>Explore all districts on map</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>

        {/* 4 Cards Grid with High Quality RAK Photography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {landmarks.map((landmark, idx) => (
            <div
              key={landmark.id}
              onClick={() => {
                setActiveLandmarkIndex(idx);
                setCurrentTab('map');
              }}
              className="group bg-white rounded-2xl border border-[#e4e9e1] overflow-hidden hover:shadow-xl hover:border-[#143d35]/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Photo container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#143d35]">
                  <img
                    src={landmark.image}
                    alt={landmark.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* District badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/95 backdrop-blur-md text-[#143d35] shadow-xs">
                    {landmark.district}
                  </span>

                  {/* Tagline */}
                  <span className="absolute bottom-3 left-3 right-3 text-[10px] font-bold text-white/90 drop-shadow-sm truncate">
                    {landmark.tagline}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#143d35] font-manrope group-hover:text-[#e97950] transition-colors">
                    {landmark.name}
                  </h3>
                  <p className="text-xs text-[#74817b] leading-relaxed line-clamp-2">
                    {landmark.description}
                  </p>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 pt-2 border-t border-[#f6f7f3] flex items-center justify-between text-xs font-bold text-[#143d35]">
                <span className="text-[11px] text-[#74817b] group-hover:text-[#143d35] transition-colors">
                  View local map pins
                </span>
                <span className="text-[#e97950] group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e4e9e1] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block mb-1">
                Geographic Presence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
                Ras Al Khaimah Map
              </h2>
              <p className="text-[#74817b] text-xs sm:text-sm mt-1">
                Explore real community reports across Al Nakheel, Corniche Al Qawasim, Al Hamra, Mina Al Arab, and Jebel Jais.
              </p>
            </div>

            <button
              onClick={() => setCurrentTab('map')}
              className="px-5 py-2.5 rounded-xl bg-[#143d35] text-white hover:bg-[#205347] text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#d7edbd]" />
              <span>Open Full Interactive Map</span>
            </button>
          </div>

          <MapComponent
            reports={reports}
            onSelectReport={onSelectReport}
            height="460px"
            zoomLevel={11}
          />
        </div>
      </section>

      {/* Recent Community Reports Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block mb-1">
              Community Feed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
              Recent infrastructure reports
            </h2>
          </div>

          <button
            onClick={() => setCurrentTab('explore')}
            className="text-xs font-bold text-[#143d35] hover:text-[#e97950] flex items-center gap-1"
          >
            <span>View all ({reports.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="bg-white rounded-2xl border border-[#e4e9e1] overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Photo thumbnail */}
              {report.imageURL ? (
                <div className="h-44 w-full bg-[#f6f7f3] overflow-hidden relative">
                  <img
                    src={report.imageURL}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${getStatusStyle(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>
              ) : (
                <div className="h-32 w-full bg-[#e8f1e9]/60 p-4 flex flex-col justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start shadow-xs ${getStatusStyle(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                  <span className="text-[11px] font-bold text-[#143d35]">
                    {report.category}
                  </span>
                </div>
              )}

              {/* Card info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#74817b] mb-1.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(report.createdAt).toLocaleDateString('en-AE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="text-[#143d35] font-semibold">{report.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#143d35] font-manrope group-hover:text-[#e97950] transition-colors line-clamp-2">
                    {report.title}
                  </h3>

                  <p className="text-xs text-[#74817b] mt-1.5 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f6f7f3] flex items-center justify-between text-xs">
                  <span className="text-[#74817b] truncate max-w-[160px] flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-[#143d35] shrink-0" />
                    {report.location}
                  </span>
                  <span className="font-bold text-[#143d35] group-hover:text-[#e97950] shrink-0">&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Track Report Callout Section matching reference site */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e4e9e1] relative overflow-hidden shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute right-4 top-2 text-[#d7e4d3] text-8xl font-serif pointer-events-none opacity-40 select-none">
            ✳
          </div>

          <div className="space-y-3 max-w-xl z-10">
            <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block">
              Every cared-for place starts with someone who cares
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#143d35] font-manrope tracking-tight leading-tight">
              See something?<br />
              <span className="text-[#e97950]">Say something.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#74817b] leading-relaxed">
              Help your neighbors and make Ras Al Khaimah cleaner and safer. It takes less than 60 seconds with Gemini AI assistance.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('report')}
            className="px-8 py-4 rounded-xl bg-[#143d35] hover:bg-[#205347] active:scale-95 text-white font-bold text-xs shadow-lg shadow-[#143d35]/15 transition-all shrink-0 flex items-center gap-2 cursor-pointer z-10"
          >
            <span>＋ Report an issue</span>
            <span className="text-[#d7edbd]">&rarr;</span>
          </button>
        </div>
      </section>
    </div>
  );
};
