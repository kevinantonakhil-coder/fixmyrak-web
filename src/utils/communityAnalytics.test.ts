import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCommunityAnalytics, hasSufficientCommunityData, sanitizeCommunityInsights, getSupportedCommunityInsightPeriods } from './communityAnalytics';
import { Report } from '../types';

const report = (overrides: Partial<Report> = {}): Report => ({
  id: 'r1', userId: 'u1', title: 'Issue', description: 'A report', category: 'Streetlights',
  location: 'Al Nakheel, Block 2', latitude: 25.8, longitude: 55.9, status: 'Submitted',
  createdAt: '2026-11-01T00:00:00.000Z', ...overrides,
});

test('calculates category, status, area, coordinate and temporal statistics from actual reports', () => {
  const now = new Date('2026-11-04T12:00:00.000Z');
  const result = calculateCommunityAnalytics([
    report(),
    report({ id: 'r2', category: 'Recycling', status: 'Resolved', createdAt: '2026-09-10T00:00:00.000Z' }),
    report({ id: 'r3', location: '', latitude: Number.NaN, createdAt: 'invalid' }),
  ], now);
  assert.equal(result.totalReports, 3);
  assert.equal(result.geocodedReports, 2);
  assert.equal(result.categoryCounts[0].count, 2);
  assert.equal(result.statusCounts.find((item) => item.label === 'Resolved')?.count, 1);
  assert.equal(result.areaCounts[0].label, 'Al Nakheel');
  assert.equal(result.recentPeriod.count, 1);
  assert.equal(result.previousPeriod.count, 1);
  assert.equal(result.periodChangePercent, 0);
  assert.equal(result.reportsWithValidDates, 2);
  assert.equal(result.weeklyCounts.length, 8);
});

test('returns null for percent change when the previous period has no reports', () => {
  const result = calculateCommunityAnalytics([report()], new Date('2026-11-04T12:00:00Z'));
  assert.equal(result.periodChangePercent, null);
});

test('requires five reports before requesting AI interpretations', () => {
  assert.equal(hasSufficientCommunityData(4), false);
  assert.equal(hasSufficientCommunityData(5), true);
  assert.equal(hasSufficientCommunityData(Number.NaN), false);
});

test('accepts only AI insight counts and periods present in the real aggregates', () => {
  const analytics = calculateCommunityAnalytics([report()], new Date('2026-11-04T12:00:00Z'));
  const periods = getSupportedCommunityInsightPeriods(analytics);
  const result = sanitizeCommunityInsights({ insights: [
    { heading: 'Observed category', explanation: 'One report is in this category.', period: periods[0], reportCount: 1, kind: 'pattern' },
    { heading: 'Fabricated total', explanation: 'A fabricated count.', period: periods[0], reportCount: 999, kind: 'summary' },
    { heading: 'Fabricated period', explanation: 'An unsupported date range.', period: 'Last year', reportCount: 1, kind: 'activity' },
  ] }, analytics);
  assert.equal(result.length, 1);
  assert.equal(result[0].heading, 'Observed category');
});
