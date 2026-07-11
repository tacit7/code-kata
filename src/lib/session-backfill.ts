// A practice session records an attempt row only when a kata is passed. The
// results view shows the whole session roster, and a kata that was failed or
// skipped counts as a fail — so at finish time every roster index without an
// attempt gets a fail row. This is the gap computation: which indexes those are.
//
// The session's roster is otherwise unrecoverable — loadSession() reconstructs
// it from the attempt rows, so a skipped kata that never gets a row vanishes
// from history entirely. Backfilling at finish is what preserves it.

/**
 * The roster indexes `0..rosterLength-1` that have no attempt yet, in order.
 *
 * `recordedIndexes` may contain duplicates or out-of-range values (defensive
 * against a corrupted attempts table); both are ignored.
 */
export function unrecordedKataIndexes(
  rosterLength: number,
  recordedIndexes: readonly number[],
): number[] {
  const recorded = new Set(recordedIndexes);
  const missing: number[] = [];
  for (let i = 0; i < rosterLength; i++) {
    if (!recorded.has(i)) missing.push(i);
  }
  return missing;
}
