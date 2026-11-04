import type { Report, ReportCategory, ReportStatus } from '../types';

export interface HeatmapFilters {
  category: ReportCategory | 'all';
  status: ReportStatus | 'all';
  startDate: string;
  endDate: string;
}

export function hasValidCoordinates(report: Pick<Report, 'latitude' | 'longitude'>): boolean {
  return Number.isFinite(report.latitude) &&
    Number.isFinite(report.longitude) &&
    report.latitude >= -90 && report.latitude <= 90 &&
    report.longitude >= -180 && report.longitude <= 180;
}

export function filterHeatmapReports(reports: Report[], filters: HeatmapFilters): Report[] {
  return reports.filter((report) => {
    if (!hasValidCoordinates(report)) return false;
    if (filters.category !== 'all' && report.category !== filters.category) return false;
    if (filters.status !== 'all' && report.status !== filters.status) return false;

    if (filters.startDate || filters.endDate) {
      const reportDate = typeof report.createdAt === 'string' ? report.createdAt.slice(0, 10) : '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) return false;
      if (filters.startDate && reportDate < filters.startDate) return false;
      if (filters.endDate && reportDate > filters.endDate) return false;
    }

    return true;
  });
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radians = (degrees: number) => degrees * (Math.PI / 180);
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearbyReports(
  reports: Report[],
  latitude: number,
  longitude: number,
  radiusMeters = 500,
  limit = 6
): Report[] {
  return reports
    .filter(hasValidCoordinates)
    .map((report) => ({
      report,
      distance: distanceMeters(latitude, longitude, report.latitude, report.longitude),
    }))
    .filter(({ distance }) => distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ report }) => report);
}
