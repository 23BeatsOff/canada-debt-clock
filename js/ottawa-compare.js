// =============================================================================
//  ottawa-compare.js — rotating "More than Ottawa spends on …" comparison
// =============================================================================
//  The interest bill runs ~$94 billion a year. Each phrase below names a
//  federal program that costs less than that, so "More than Ottawa spends on X"
//  stays true. The line cycles to the next item every couple of hours, picked
//  deterministically from the clock so every visitor sees the same one.
// =============================================================================

// Each string completes "More than Ottawa spends on ___". All comfortably
// below the ~$94B/year interest bill (approximate annual federal spending).
export const COMPARISONS = [
  "the Canada Child Benefit and national childcare combined", // ~$35B
  "national defence", // ~$41B
  "the Canada Health Transfer to every province", // ~$52B
  "Employment Insurance benefits for every jobless worker", // ~$26B
  "all of Indigenous Services Canada", // ~$40B
  "the GST credit and carbon rebate combined", // ~$20B
];

const ROTATE_MS = 2 * 60 * 60 * 1000; // a couple of hours

// Deterministic pick: same window → same phrase for everyone.
function currentIndex(now = Date.now()) {
  return Math.floor(now / ROTATE_MS) % COMPARISONS.length;
}

export function initOttawaCompare(el) {
  if (!el) return;
  const apply = () => {
    const text = COMPARISONS[currentIndex()];
    if (el.textContent !== text) el.textContent = text;
  };
  apply();
  // Re-check periodically so a long-open tab rolls over on schedule.
  setInterval(apply, 60 * 1000);
}
