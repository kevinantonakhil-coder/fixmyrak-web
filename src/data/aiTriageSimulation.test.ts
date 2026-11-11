import assert from 'node:assert/strict';
import test from 'node:test';
import { createAiTriageSimulationReports } from './aiTriageSimulation';

test('creates 43 distinct, realistic-looking reports marked as simulation-only', () => {
  const reports = createAiTriageSimulationReports();

  assert.equal(reports.length, 43);
  assert.equal(new Set(reports.map((report) => report.id)).size, 43);
  assert.ok(reports.every((report) => report.isSimulation === true));
  assert.ok(reports.every((report) => report.authorName && report.title && report.description && report.location));
  assert.ok(reports.every((report) => !/^\[?test\]?/i.test(report.title)));
  assert.ok(reports.some((report) => report.status === 'Under Review'));
  assert.ok(reports.some((report) => report.status === 'In Progress'));
  assert.ok(reports.some((report) => report.status === 'Resolved'));
});
