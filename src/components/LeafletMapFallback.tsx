import { useEffect, useRef, type FC, type MutableRefObject } from 'react';
import L, { type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report } from '../types';

interface LeafletMapFallbackProps {
  reports: Report[];
  selectedReport?: Report | null;
  onSelectReport?: (report: Report) => void;
  isPickerMode: boolean;
  pickerLat: number;
  pickerLng: number;
  onPickerLocationChange?: (lat: number, lng: number, label?: string) => void;
  mapRef: MutableRefObject<LeafletMap | null>;
}

const statusColors: Record<string, string> = {
  Submitted: '#f59e0b',
  'Under Review': '#0284c7',
  'In Progress': '#8b5cf6',
  Resolved: '#10b981',
};

export const LeafletMapFallback: FC<LeafletMapFallbackProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  isPickerMode,
  pickerLat,
  pickerLng,
  onPickerLocationChange,
  mapRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [isPickerMode ? pickerLat : 25.7895, isPickerMode ? pickerLng : 55.9432],
      isPickerMode ? 15 : 11
    );
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);

    if (isPickerMode) {
      const pickerIcon = L.divIcon({
        className: '',
        html: '<div style="width:24px;height:24px;border:3px solid white;border-radius:50% 50% 50% 0;background:#143d35;transform:rotate(-45deg);box-shadow:0 2px 8px #0005"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });
      const pickerMarker = L.marker([pickerLat, pickerLng], {
        draggable: true,
        icon: pickerIcon,
      }).addTo(map);
      pickerMarkerRef.current = pickerMarker;

      const reportLocation = (lat: number, lng: number) => {
        onPickerLocationChange?.(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      };
      map.on('click', (event) => {
        pickerMarker.setLatLng(event.latlng);
        reportLocation(event.latlng.lat, event.latlng.lng);
      });
      pickerMarker.on('dragend', () => {
        const position = pickerMarker.getLatLng();
        reportLocation(position.lat, position.lng);
      });
    }

    const refreshSize = window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      window.clearTimeout(refreshSize);
      mapRef.current = null;
      markerLayerRef.current = null;
      pickerMarkerRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([pickerLat, pickerLng]);
    }
  }, [pickerLat, pickerLng, mapRef]);

  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    reports.forEach((report) => {
      if (report.latitude == null || report.longitude == null) return;
      const selected = selectedReport?.id === report.id;
      const marker = L.circleMarker([report.latitude, report.longitude], {
        radius: selected ? 10 : 7,
        color: '#ffffff',
        weight: 2,
        fillColor: statusColors[report.status] || '#64748b',
        fillOpacity: 1,
      });
      marker.bindTooltip(report.title, { direction: 'top', offset: [0, -6] });
      marker.on('click', () => onSelectReport?.(report));
      marker.addTo(layer);
    });
  }, [reports, selectedReport, onSelectReport]);

  useEffect(() => {
    if (selectedReport?.latitude != null && selectedReport.longitude != null) {
      mapRef.current?.setView([selectedReport.latitude, selectedReport.longitude], 15);
    }
  }, [selectedReport, mapRef]);

  return <div ref={containerRef} className="absolute inset-0 z-0" aria-label="Interactive map of Ras Al Khaimah" />;
};
