import { AICommunityInsight, CommunityAnalytics, Report, ReportStatus } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const STATUSES: ReportStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export function hasSufficientCommunityData(totalReports: number): boolean {
  return Number.isInteger(totalReports) && totalReports >= 5;
}

export function getSupportedCommunityInsightPeriods(analytics: CommunityAnalytics): string[] {
  return [
    'All submitted reports',
    `${analytics.recentPeriod.start} to ${analytics.recentPeriod.end}`,
    `${analytics.previousPeriod.start} to ${analytics.previousPeriod.end}`,
    'Last 8 weeks',
  ];
}

export function sanitizeCommunityInsights(
  response: unknown,
  analytics: CommunityAnalytics
): AICommunityInsight[] {
  const source = response && typeof response === 'object' ? (response as { insights?: unknown }).insights : null;
  if (!Array.isArray(source)) return [];
  const counts = new Set<number>([
    analytics.totalReports,
    analytics.recentPeriod.count,
    analytics.previousPeriod.count,
    ...analytics.categoryCounts.map((item) => item.count),
    ...analytics.statusCounts.map((item) => item.count),
    ...analytics.areaCounts.map((item) => item.count),
    ...analytics.weeklyCounts.map((item) => item.count),
  ]);
  const periods = new Set(getSupportedCommunityInsightPeriods(analytics));
  return source.filter((item): item is AICommunityInsight => {
    if (!item || typeof item !== 'object') return false;
    const insight = item as AICommunityInsight;
    return typeof insight.heading === 'string' && insight.heading.length > 0 && insight.heading.length <= 100 &&
      typeof insight.explanation === 'string' && insight.explanation.length > 0 && insight.explanation.length <= 500 &&
      periods.has(insight.period) && Number.isInteger(insight.reportCount) && counts.has(insight.reportCount) &&
      ['summary', 'pattern', 'area', 'activity', 'emerging'].includes(insight.kind);
  }).slice(0, 5);
}

export function calculateCommunityAnalytics(reports: Report[], now = new Date()): CommunityAnalytics {
  const categories = new Map<string, number>();
  const statuses = new Map<string, number>(STATUSES.map((status) => [status, 0]));
  const areas = new Map<string, number>();
  const validDates: number[] = [];
  let geocodedReports = 0;

  reports.forEach((report) => {
    categories.set(report.category, (categories.get(report.category) || 0) + 1);
    statuses.set(report.status, (statuses.get(report.status) || 0) + 1);
    if (Number.isFinite(report.latitude) && Number.isFinite(report.longitude) &&
      report.latitude >= -90 && report.latitude <= 90 && report.longitude >= -180 && report.longitude <= 180) {
      geocodedReports += 1;
    }
    const area = (report.location || '').split(',')[0]?.trim().slice(0, 80) || '';
    if (area) areas.set(area, (areas.get(area) || 0) + 1);
    const created = Date.parse(report.createdAt);
    if (Number.isFinite(created)) validDates.push(created);
  });

  const end = new Date(now);
  const recentStart = new Date(end.getTime() - 30 * DAY);
  const previousStart = new Date(end.getTime() - 60 * DAY);
  const recentCount = validDates.filter((date) => date >= recentStart.getTime() && date <= end.getTime()).length;
  const previousCount = validDates.filter((date) => date >= previousStart.getTime() && date < recentStart.getTime()).length;
  const periodChangePercent = previousCount > 0
    ? Math.round(((recentCount - previousCount) / previousCount) * 100)
    : null;

  const startOfWeek = new Date(end);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setDate(startOfWeek.getDate() - 7 * 7);
  const weeklyCounts = Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(startOfWeek.getTime() + index * 7 * DAY);
    const nextWeek = new Date(weekStart.getTime() + 7 * DAY);
    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      count: validDates.filter((date) => date >= weekStart.getTime() && date < nextWeek.getTime()).length,
    };
  });

  return {
    totalReports: reports.length,
    geocodedReports,
    categoryCounts: [...categories].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    statusCounts: [...statuses].map(([label, count]) => ({ label, count })),
    areaCounts: [...areas].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    weeklyCounts,
    recentPeriod: { start: recentStart.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), count: recentCount },
    previousPeriod: { start: previousStart.toISOString().slice(0, 10), end: recentStart.toISOString().slice(0, 10), count: previousCount },
    periodChangePercent,
    reportsWithValidDates: validDates.length,
  };
}
