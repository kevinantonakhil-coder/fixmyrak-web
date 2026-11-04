import test from 'node:test';
import assert from 'node:assert/strict';
import type { Report } from '../types';
import { filterHeatmapReports, findNearbyReports, hasValidCoordinates } from './smartHeatmap';

function report(overrides: Partial<Report> = {}): Report {
  return {
    id: 'r1',
    userId: 'u1',
    title: 'Test report',
    description: 'A valid report description',
    category: 'Roads and Potholes',
    location: 'Al Nakheel',
    latitude: 25.79,
    longitude: 55.94,
    status: 'Submitted',
    createdAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

test('coordinate validation accepts valid zero coordinates and rejects missing or out-of-range values', () => {
  assert.equal(hasValidCoordinates(report({ latitude: 0, longitude: 0 })), true);
  assert.equal(hasValidCoordinates(report({ latitude: Number.NaN })), false);
  assert.equal(hasValidCoordinates(report({ longitude: 181 })), false);
  assert.equal(hasValidCoordinates(report({ latitude: undefined as unknown as number })), false);
});

test('heatmap filters category, status, date bounds, and missing coordinates together', () => {
  const reports = [
    report({ id: 'in', createdAt: '2026-11-01T08:00:00.000Z' }),
    report({ id: 'old', createdAt: '2026-10-31T23:59:59.000Z' }),
    report({ id: 'wrong-category', category: 'Streetlights' }),
    report({ id: 'wrong-status', status: 'Resolved' }),
    report({ id: 'missing-coordinates', latitude: Number.NaN }),
  ];

  const filtered = filterHeatmapReports(reports, {
    category: 'Roads and Potholes',
    status: 'Submitted',
    startDate: '2026-11-01',
    endDate: '2026-11-01',
  });

  assert.deepEqual(filtered.map((item) => item.id), ['in']);
});

test('nearby report lookup returns only real coordinate-bearing reports sorted by distance', () => {
  const reports = [
    report({ id: 'near', latitude: 25.7901, longitude: 55.94 }),
    report({ id: 'far', latitude: 26.1, longitude: 56.1 }),
    report({ id: 'missing', latitude: Number.NaN }),
  ];
  assert.deepEqual(findNearbyReports(reports, 25.79, 55.94, 500).map((item) => item.id), ['near']);
});
