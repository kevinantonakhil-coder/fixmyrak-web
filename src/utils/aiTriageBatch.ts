type Wait = (milliseconds: number) => Promise<void>;

const waitFor = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function processInBatches<T>(
  items: T[],
  batchSize: number,
  cooldownMs: number,
  processItem: (item: T) => Promise<void>,
  onBatchComplete?: (batch: T[]) => void,
  wait: Wait = waitFor,
  onItemError?: (item: T, error: unknown) => void,
  onItemComplete?: (completed: number) => void,
): Promise<{ completed: number; failed: number }> {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError('Batch size must be a positive integer.');

  let completed = 0;
  let failed = 0;

  for (let offset = 0; offset < items.length; offset += batchSize) {
    const batch = items.slice(offset, offset + batchSize);
    await Promise.all(batch.map(async (item) => {
      try {
        await processItem(item);
      } catch (error) {
        failed += 1;
        onItemError?.(item, error);
      } finally {
        completed += 1;
        onItemComplete?.(completed);
      }
    }));

    onBatchComplete?.(batch);
    if (offset + batch.length < items.length) await wait(cooldownMs);
  }

  return { completed, failed };
}
