import assert from 'node:assert/strict';
import test from 'node:test';
import { processInBatches } from './aiTriageBatch';

test('processes at most five triage requests per batch and waits between batches', async () => {
  const processed: number[] = [];
  const batchSizes: number[] = [];
  const waits: number[] = [];
  const result = await processInBatches(
    Array.from({ length: 12 }, (_, index) => index),
    5,
    60_000,
    async (item) => { processed.push(item); },
    async (batch) => { batchSizes.push(batch.length); },
    async (duration) => { waits.push(duration); },
  );

  assert.deepEqual(processed.sort((a, b) => a - b), Array.from({ length: 12 }, (_, index) => index));
  assert.deepEqual(batchSizes, [5, 5, 2]);
  assert.deepEqual(waits, [60_000, 60_000]);
  assert.deepEqual(result, { completed: 12, failed: 0 });
});

test('continues after an individual triage request fails', async () => {
  const failedItems: number[] = [];
  const result = await processInBatches(
    [1, 2, 3],
    5,
    60_000,
    async (item) => { if (item === 2) throw new Error('temporary failure'); },
    undefined,
    async () => { throw new Error('no cooldown needed for a single batch'); },
    (item) => { failedItems.push(item); },
  );

  assert.deepEqual(failedItems, [2]);
  assert.deepEqual(result, { completed: 3, failed: 1 });
});
