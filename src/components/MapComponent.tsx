import React, { useEffect, useRef, useState, useMemo } from 'react';
import L, { type Map as LeafletMap } from 'leaflet';
import { Report, ReportCategory, ReportStatus, RAK_PRESET_LOCATIONS } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { loadGoogleMaps, isGoogleMapsAuthFailed } from '../utils/googleMapsLoader';
import { LeafletMapFallback } from './LeafletMapFallback';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  X,
  Search,
  Maximize2,
  Minimize2,
  Info,
  Sparkles,
  Eye,
  Satellite,
  Mountain,
  Map as MapIcon,
} from 'lucide-react';

interface MapComponentProps {
  reports?: Report[];
  selectedReport?: Report | null;
  onSelectReport?: (report: Report) => void;
  // Picker mode props
  isPickerMode?: boolean;
  pickerLat?: number;
  pickerLng?: number;
  onPickerLocationChange?: (lat: number, lng: number, label?: string) => void;
  height?: string;
  zoomLevel?: number;
  showDistrictPills?: boolean;
}

const DEFAULT_MAPS_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  firebaseConfig.apiKey ||
  'AIzaSyCP5B74DWW4bOxBtnR6uX1DKMSa895jsHw';

export const MapComponent: React.FC<MapComponentProps> = ({
  reports = [],
  selectedReport,
  onSelectReport,
  isPickerMode = false,
  pickerLat = 25.7895,
  pickerLng = 55.9432,
  onPickerLocationChange,
  height = '500px',
  zoomLevel = 11,
  showDistrictPills = true,
}) => {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapFrameRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletMapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<any[]>([]);
  const pickerMarkerRef = useRef<any>(null);
  const activeInfoWindowRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [usingFallbackMap, setUsingFallbackMap] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<ReportStatus | 'all'>('all');

  const mapsApiKey = DEFAULT_MAPS_KEY;

  // Initialize Google Maps Platform
  useEffect(() => {
    let isCancelled = false;

    if (!mapContainerRef.current) return;

    setIsLoading(true);
    setUsingFallbackMap(false);
    setLoadError(null);

    const showFallbackMap = (message: string) => {
      if (isCancelled) return;
      mapInstanceRef.current = null;
      setIsLoading(false);
      setUsingFallbackMap(true);
      setLoadError(message);
    };
    const handleGoogleMapsAuthFailure = () => {
      showFallbackMap('Google Maps could not authenticate its key. Showing the OpenStreetMap view instead.');
    };

    window.addEventListener('google-maps-auth-failure', handleGoogleMapsAuthFailure);
    if (isGoogleMapsAuthFailed()) {
      handleGoogleMapsAuthFailure();
    }

    loadGoogleMaps(mapsApiKey)
      .then((googleMaps) => {
        if (isCancelled || isGoogleMapsAuthFailed() || !mapContainerRef.current) return;

        const initialLat = isPickerMode ? pickerLat : 25.7895;
        const initialLng = isPickerMode ? pickerLng : 55.9432;

        const map = new googleMaps.Map(mapContainerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: zoomLevel,
          mapTypeId: mapTypeId,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: googleMaps.ControlPosition.RIGHT_BOTTOM,
          },
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }],
            },
          ],
        });

        mapInstanceRef.current = map;
        setIsLoading(false);

        // Click listener for picker mode
        if (isPickerMode) {
          const pickerPin = new googleMaps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map,
            draggable: true,
            title: 'Drag or click to choose report location',
            icon: {
              path: googleMaps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#143d35',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            animation: googleMaps.Animation.DROP,
          });

          pickerMarkerRef.current = pickerPin;

          const geocoder = new googleMaps.Geocoder();

          const updatePickerLocation = (lat: number, lng: number) => {
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              let label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              if (status === 'OK' && results?.[0]?.formatted_address) {
                label = results[0].formatted_address;
              }
              if (onPickerLocationChange) {
                onPickerLocationChange(lat, lng, label);
              }
            });
          };

          map.addListener('click', (e: any) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            pickerPin.setPosition({ lat, lng });
            updatePickerLocation(lat, lng);
          });

          pickerPin.addListener('dragend', () => {
            const pos = pickerPin.getPosition();
            if (pos) {
              updatePickerLocation(pos.lat(), pos.lng());
            }
          });
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Google Maps loading notice:', err);
          showFallbackMap('Google Maps is unavailable. Showing the OpenStreetMap view instead.');
        }
      });

    return () => {
      isCancelled = true;
      window.removeEventListener('google-maps-auth-failure', handleGoogleMapsAuthFailure);
    };
  }, [mapsApiKey, isPickerMode]);

  // Sync Map Type (Roadmap / Satellite / Terrain)
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(mapTypeId);
    }
  }, [mapTypeId]);

  // Sync picker position if updated externally
  useEffect(() => {
    if (isPickerMode && pickerMarkerRef.current && mapInstanceRef.current) {
      const pos = pickerMarkerRef.current.getPosition();
      if (!pos || Math.abs(pos.lat() - pickerLat) > 0.0001 || Math.abs(pos.lng() - pickerLng) > 0.0001) {
        const newPos = { lat: pickerLat, lng: pickerLng };
        pickerMarkerRef.current.setPosition(newPos);
        mapInstanceRef.current.panTo(newPos);
      }
    }
  }, [pickerLat, pickerLng, isPickerMode]);

  // Filter reports
  const filteredMapReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.latitude || !r.longitude) return false;
      if (activeStatusFilter !== 'all' && r.status !== activeStatusFilter) return false;
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase().trim();
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchLoc = (r.location || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchCat = (r.category || '').toLowerCase().includes(q);
        return matchTitle || matchLoc || matchDesc || matchCat;
      }
      return true;
    });
  }, [reports, activeStatusFilter, mapSearchQuery]);

  // Get status color
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return '#f59e0b'; // amber
      case 'Under Review':
        return '#0284c7'; // sky
      case 'In Progress':
        return '#8b5cf6'; // violet
      case 'Resolved':
        return '#10b981'; // emerald
      default:
        return '#64748b';
    }
  };

  // Render Markers on Google Maps
  useEffect(() => {
    if (isPickerMode || !mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const googleMaps = window.google.maps;

    filteredMapReports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      const color = getStatusColor(report.status);
      const isCurrentSelected = selectedReport?.id === report.id;

      // Custom SVG Pin for Google Maps
      const svgMarker = {
        path: 'M 12,2 C 6.48,2 2,6.48 2,12 c 0,7 10,18 10,18 0,0 10,-11 10,-18 0,-5.52 -4.48,-10 -10,-10 z M 12,16 a 4,4 0 1,1 0,-8 4,4 0 0,1 0,8 z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: isCurrentSelected ? 1.6 : 1.3,
        anchor: new googleMaps.Point(12, 30),
      };

      const marker = new googleMaps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        map: mapInstanceRef.current,
        icon: svgMarker,
        title: report.title,
        zIndex: isCurrentSelected ? 999 : 1,
      });

      // InfoWindow on click
      marker.addListener('click', () => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }

        if (onSelectReport) {
          onSelectReport(report);
        }

        const contentString = `
          <div style="font-family: inherit; max-width: 260px; padding: 4px; color: #1e293b;">
            ${
              report.imageURL
                ? `<div style="height: 100px; width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 6px;">
                    <img src="${report.imageURL}" style="width: 100%; height: 100%; object-fit: cover;" />
                   </div>`
                : ''
            }
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="background-color: ${color}; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
                ${report.status}
              </span>
              <span style="font-size: 10px; color: #64748b; font-weight: 600;">
                ${report.category}
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #143d35; margin: 0 0 4px 0; line-height: 1.3;">
              ${report.title}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${report.description}
            </p>
            <div style="font-size: 10px; color: #047857; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
              <span>📍</span> <span>${report.location}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #0284c7; font-weight: 700; margin-bottom: 8px;">
              <span>✨</span> <span>Google Maps Grounded Report</span>
            </div>
            <button id="info-btn-${report.id}" style="width: 100%; background-color: #143d35; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Open Full Report Timeline &rarr;
            </button>
          </div>
        `;

        const infoWindow = new googleMaps.InfoWindow({
          content: contentString,
          maxWidth: 280,
        });

        infoWindow.open(mapInstanceRef.current, marker);
        activeInfoWindowRef.current = infoWindow;

        googleMaps.event.addListenerOnce(infoWindow, 'domready', () => {
          const btn = document.getElementById(`info-btn-${report.id}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectReport) {
                onSelectReport(report);
              }
            };
          }
        });
      });

      markersRef.current.push(marker);
    });
  }, [filteredMapReports, selectedReport, isPickerMode, onSelectReport]);

  // Center on Selected Report
  useEffect(() => {
    if (selectedReport && !isPickerMode) {
      if (selectedReport.latitude && selectedReport.longitude) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({
            lat: selectedReport.latitude,
            lng: selectedReport.longitude,
          });
          mapInstanceRef.current.setZoom(15);
        } else {
          leafletMapInstanceRef.current?.setView([selectedReport.latitude, selectedReport.longitude], 15);
        }
      }
    }
  }, [selectedReport]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: 25.7895, lng: 55.9432 });
      mapInstanceRef.current.setZoom(11);
    } else {
      leafletMapInstanceRef.current?.setView([25.7895, 55.9432], 11);
    }
  };

  const handleFlyToDistrict = (lat: number, lng: number, zoom = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(zoom);
    } else {
      leafletMapInstanceRef.current?.setView([lat, lng], zoom);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        if (mapInstanceRef.current && window.google?.maps) {
          const googleMaps = window.google.maps;
          const userPos = { lat: latitude, lng: longitude };
          mapInstanceRef.current.panTo(userPos);
          mapInstanceRef.current.setZoom(15);

          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setMap(null);
          }

          const circle = new googleMaps.Circle({
            center: userPos,
            radius: Math.max(accuracy || 50, 40),
            map: mapInstanceRef.current,
            fillColor: '#0284c7',
            fillOpacity: 0.15,
            strokeColor: '#0284c7',
            strokeWeight: 2,
          });
          accuracyCircleRef.current = circle;
        } else if (leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.setView([latitude, longitude], 15);
          accuracyCircleRef.current?.remove();
          accuracyCircleRef.current = L.circle([latitude, longitude], {
            radius: Math.max(accuracy || 50, 40),
            color: '#0284c7',
            fillColor: '#0284c7',
            fillOpacity: 0.15,
            weight: 2,
          }).addTo(leafletMapInstanceRef.current);
        }

        if (isPickerMode && onPickerLocationChange) {
          onPickerLocationChange(latitude, longitude, 'Current GPS Location');
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not retrieve your current location. Please tap or drop the pin manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleToggleFullscreen = () => {
    if (!mapFrameRef.current) return;
    if (!document.fullscreenElement) {
      mapFrameRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={mapFrameRef} className="relative w-full rounded-2xl overflow-hidden border border-[#e4e9e1] shadow-xs bg-slate-50 group/map">
      {/* Map Canvas */}
      <div
        style={{ height: isFullscreen ? '100vh' : height }}
        className="relative w-full z-0 bg-slate-100"
      >
        {usingFallbackMap ? (
          <LeafletMapFallback
            reports={filteredMapReports}
            selectedReport={selectedReport}
            onSelectReport={onSelectReport}
            isPickerMode={isPickerMode}
            pickerLat={pickerLat}
            pickerLng={pickerLng}
            onPickerLocationChange={onPickerLocationChange}
            mapRef={leafletMapInstanceRef}
          />
        ) : (
          <div ref={mapContainerRef} className="w-full h-full bg-slate-100" />
        )}
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-xs">
          <div className="w-9 h-9 border-3 border-[#143d35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#143d35] mt-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#e97950]" />
            Loading Google Maps Platform...
          </p>
        </div>
      )}

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Tools: Reset, My Location, Map Type Switches */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleResetView}
            className="bg-white/95 backdrop-blur-md text-[#143d35] hover:bg-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-[#e4e9e1] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Reset Map to All Ras Al Khaimah"
          >
            <Compass className="w-3.5 h-3.5 text-[#143d35]" />
            <span>{t('map.resetView')}</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="bg-white/95 backdrop-blur-md text-[#143d35] hover:bg-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-[#e4e9e1] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Locate Me via GPS"
          >
            <Navigation className={`w-3.5 h-3.5 text-[#e97950] ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : t('map.myLocation')}</span>
          </button>

          {usingFallbackMap ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e4e9e1] bg-white/95 text-[11px] font-bold text-[#143d35] shadow-sm">
              <MapIcon className="w-3.5 h-3.5" /> OpenStreetMap
            </span>
          ) : (
          /* Google Maps Type Selector: Roadmap / Satellite / Terrain */
          <div className="inline-flex p-0.5 bg-white/95 backdrop-blur-md rounded-xl border border-[#e4e9e1] shadow-sm text-xs">
            <button
              type="button"
              onClick={() => setMapTypeId('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                mapTypeId === 'roadmap' ? 'bg-[#143d35] text-white shadow-2xs' : 'text-[#74817b] hover:text-[#143d35]'
              }`}
              title="Standard Roadmap"
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => setMapTypeId('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                mapTypeId === 'satellite' ? 'bg-[#143d35] text-white shadow-2xs' : 'text-[#74817b] hover:text-[#143d35]'
              }`}
              title="Satellite Aerial View"
            >
              <Satellite className="w-3 h-3" />
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setMapTypeId('terrain')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                mapTypeId === 'terrain' ? 'bg-[#143d35] text-white shadow-2xs' : 'text-[#74817b] hover:text-[#143d35]'
              }`}
              title="Topographic Terrain View"
            >
              <Mountain className="w-3 h-3" />
              <span className="hidden sm:inline">Terrain</span>
            </button>
          </div>
          )}
        </div>

        {/* Right Tools: Map Search, Legend & Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {!isPickerMode && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#89958d] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Search pins..."
                className="pl-8 pr-7 py-1.5 text-xs bg-white/95 backdrop-blur-md border border-[#e4e9e1] rounded-xl w-32 sm:w-44 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#143d35] shadow-sm"
              />
              {mapSearchQuery && (
                <button
                  onClick={() => setMapSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="bg-white/95 backdrop-blur-md text-[#143d35] p-2 rounded-xl text-xs font-bold shadow-sm border border-[#e4e9e1] flex items-center justify-center transition-all cursor-pointer"
            title="Toggle Map Legend"
          >
            <Info className="w-3.5 h-3.5 text-[#143d35]" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="bg-white/95 backdrop-blur-md text-[#143d35] p-2 rounded-xl text-xs font-bold shadow-sm border border-[#e4e9e1] flex items-center justify-center transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating District Quick Jump Pills (Viewer Mode) */}
      {!isPickerMode && showDistrictPills && (
        <div className="absolute top-14 left-3 right-3 z-10 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
          <button
            onClick={() => handleResetView()}
            className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#143d35] text-[11px] font-bold rounded-lg border border-[#e4e9e1] shadow-2xs shrink-0 cursor-pointer backdrop-blur-xs transition-colors"
          >
            All RAK
          </button>
          {RAK_PRESET_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleFlyToDistrict(loc.lat, loc.lng, 14)}
              className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#1c302c] hover:text-[#143d35] text-[11px] font-semibold rounded-lg border border-[#e4e9e1] shadow-2xs shrink-0 cursor-pointer backdrop-blur-xs transition-colors"
            >
              {loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>
      )}

      {/* Quick Status Filter Pills (Floating Overlay on Map) */}
      {!isPickerMode && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-[#e4e9e1] shadow-md flex items-center gap-1 text-xs">
          <span className="text-[10px] font-bold text-[#89958d] px-2 uppercase tracking-wider hidden sm:inline-block">
            Status:
          </span>
          {(['all', 'Submitted', 'Under Review', 'In Progress', 'Resolved'] as (ReportStatus | 'all')[]).map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatusFilter(st)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeStatusFilter === st
                  ? 'bg-[#143d35] text-white shadow-2xs'
                  : 'text-[#74817b] hover:bg-[#e8f1e9] hover:text-[#143d35]'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      )}

      {/* Preset Location Pills (In Picker Mode) */}
      {isPickerMode && (
        <div className="absolute bottom-3 left-3 right-12 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-[#e4e9e1] shadow-md">
          <p className="text-[11px] font-bold text-[#143d35] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#e97950]" />
            Quick RAK Districts (Click to pin)
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {RAK_PRESET_LOCATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  if (onPickerLocationChange) {
                    onPickerLocationChange(preset.lat, preset.lng, preset.name);
                  }
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo({ lat: preset.lat, lng: preset.lng });
                    mapInstanceRef.current.setZoom(14);
                  } else {
                    leafletMapInstanceRef.current?.setView([preset.lat, preset.lng], 14);
                  }
                }}
                className="whitespace-nowrap px-3 py-1 text-xs bg-[#f6f7f3] hover:bg-[#e8f1e9] hover:text-[#143d35] text-[#1c302c] rounded-xl font-semibold border border-[#e4e9e1] transition-colors shrink-0 cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Map Legend Drawer */}
      {showLegend && !isPickerMode && (
        <div className="absolute top-24 right-3 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#e4e9e1] shadow-xl w-60 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#e4e9e1]">
            <h4 className="text-xs font-extrabold text-[#143d35] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#143d35]" />
              {t('map.legend')}
            </h4>
            <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs"></span>
              <span className="font-medium text-[#1c302c]">Submitted (Awaiting review)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shadow-xs"></span>
              <span className="font-medium text-[#1c302c]">Under Review (Inspecting)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500 border border-white shadow-xs"></span>
              <span className="font-medium text-[#1c302c]">In Progress (Work crew active)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs"></span>
              <span className="font-medium text-[#1c302c]">Resolved (Completed)</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-800">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Grounded with Google Maps places data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
