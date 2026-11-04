import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CalendarDays, Flame, MapPin, RotateCcw } from 'lucide-react';
import type { Report, ReportCategory, ReportStatus } from '../types';
import { filterHeatmapReports, findNearbyReports } from '../utils/smartHeatmap';

interface SmartHeatmapProps {
  reports: Report[];
  onOpenReport: (report: Report) => void;
}

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
  'Waste Management',
];

const statuses: (ReportStatus | 'all')[] = [
  'all',
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
];

export const SmartHeatmap: React.FC<SmartHeatmapProps> = ({ reports, onOpenReport }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reportsRef = useRef<Report[]>([]);
  const redrawRef = useRef<(() => void) | null>(null);
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [status, setStatus] = useState<ReportStatus | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nearbyReports, setNearbyReports] = useState<Report[] | null>(null);

  const filteredReports = useMemo(
    () => filterHeatmapReports(reports, { category, status, startDate, endDate }),
    [reports, category, status, startDate, endDate]
  );

  useEffect(() => {
    reportsRef.current = filteredReports;
    setNearbyReports(null);
    redrawRef.current?.();
  }, [filteredReports]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const map = L.map(container, { zoomControl: false, preferCanvas: true }).setView([25.7895, 55.9432], 11);
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '450';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    let frame = 0;
    const draw = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const size = map.getSize();
        const scale = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = Math.max(1, Math.round(size.x * scale));
        canvas.height = Math.max(1, Math.round(size.y * scale));
        canvas.style.width = `${size.x}px`;
        canvas.style.height = `${size.y}px`;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.clearRect(0, 0, size.x, size.y);
        context.globalCompositeOperation = 'lighter';

        reportsRef.current.forEach((report) => {
          const point = map.latLngToContainerPoint([report.latitude, report.longitude]);
          const radius = 38;
          const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
          gradient.addColorStop(0, 'rgba(211, 53, 43, 0.52)');
          gradient.addColorStop(0.3, 'rgba(242, 111, 54, 0.38)');
          gradient.addColorStop(0.68, 'rgba(255, 194, 78, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 224, 125, 0)');
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(point.x, point.y, radius, 0, Math.PI * 2);
          context.fill();
        });

        context.globalCompositeOperation = 'source-over';
      });
    };
    redrawRef.current = draw;
    map.on('move zoom resize', draw);
    map.on('click', (event) => {
      const point = map.latLngToContainerPoint(event.latlng);
      const edge = map.containerPointToLatLng(point.add([42, 0]));
      const radiusMeters = Math.max(100, map.distance(event.latlng, edge));
      setNearbyReports(findNearbyReports(reportsRef.current, event.latlng.lat, event.latlng.lng, radiusMeters));
    });

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);
    map.invalidateSize();
    draw();

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      redrawRef.current = null;
      canvasRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  const resetFilters = () => {
    setCategory('all');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setNearbyReports(null);
  };

  return (
    <section className="space-y-4" aria-label="Smart community report heatmap">
      <div className="rounded-2xl border border-[#e4e9e1] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-[11px] font-bold text-[#74817b]">
              <span>Issue category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as ReportCategory | 'all')} className="block min-w-40 rounded-lg border border-[#dce5dc] bg-[#f6f7f3] px-3 py-2 text-xs text-[#1c302c]">
                {categories.map((item) => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-[11px] font-bold text-[#74817b]">
              <span>Report status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as ReportStatus | 'all')} className="block min-w-36 rounded-lg border border-[#dce5dc] bg-[#f6f7f3] px-3 py-2 text-xs text-[#1c302c]">
                {statuses.map((item) => <option key={item} value={item}>{item === 'all' ? 'All statuses' : item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-[11px] font-bold text-[#74817b]">
              <span>From</span>
              <span className="flex items-center gap-2 rounded-lg border border-[#dce5dc] bg-[#f6f7f3] px-3 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <input aria-label="Start date" type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="bg-transparent text-xs text-[#1c302c] outline-none" />
              </span>
            </label>
            <label className="space-y-1 text-[11px] font-bold text-[#74817b]">
              <span>To</span>
              <span className="flex items-center gap-2 rounded-lg border border-[#dce5dc] bg-[#f6f7f3] px-3 py-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <input aria-label="End date" type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="bg-transparent text-xs text-[#1c302c] outline-none" />
              </span>
            </label>
          </div>
          <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#dce5dc] px-3 py-2 text-xs font-bold text-[#143d35] hover:bg-[#f2f6f0] xl:self-auto">
            <RotateCcw className="h-3.5 w-3.5" /> Reset filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-[#eaf0f2] shadow-sm">
        <div ref={mapContainerRef} className="relative h-[420px] w-full sm:h-[560px]" aria-label="Interactive report density map. Click a colored area to see nearby reports." />
        <div className="flex flex-col gap-3 border-t border-[#e4e9e1] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#143d35]">
            <Flame className="h-4 w-4 text-[#e97950]" />
            <span>{filteredReports.length} reports represented</span>
            {reports.length !== filteredReports.length && <span className="text-[10px] font-medium text-[#74817b]">({reports.length - filteredReports.length} filtered or missing valid coordinates)</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#74817b]" aria-label="Heatmap legend">
            <span className="font-bold uppercase tracking-wide">Report concentration</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-amber-200" /> Low</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-orange-400" /> Medium</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-red-600" /> High</span>
            <span className="hidden text-[#89958d] md:inline">Click a colored area to inspect nearby reports</span>
          </div>
        </div>
      </div>

      {nearbyReports !== null && (
        <div className="rounded-2xl border border-[#e4e9e1] bg-white p-4 shadow-xs">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#143d35]">
            <MapPin className="h-4 w-4 text-[#e97950]" /> Nearby reports ({nearbyReports.length})
          </div>
          {nearbyReports.length === 0 ? (
            <p className="py-3 text-xs text-[#74817b]">No reports close to this point. Try clicking a brighter area.</p>
          ) : (
            <ul className="divide-y divide-[#edf1eb]">
              {nearbyReports.map((report) => (
                <li key={report.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#143d35]">{report.title}</p>
                    <p className="mt-0.5 text-[11px] text-[#74817b]">{report.category} · {report.location} · {report.status}</p>
                  </div>
                  <button type="button" onClick={() => onOpenReport(report)} className="shrink-0 rounded-lg bg-[#143d35] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#205347]">Open report</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
