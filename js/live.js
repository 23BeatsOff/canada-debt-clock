// =============================================================================
//  live.js — progressive enhancement with real-time data
// =============================================================================
//  Pulls live numbers where a free, CORS-friendly source exists, and overrides
//  the seeded values in the engine. EVERYTHING here is best-effort: any failure
//  falls back to the seed in data.js, so the clock never breaks offline.
// =============================================================================

import { setOverride } from "./clock.js";

const COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad";

// Bank of Canada Valet — most recent USD/CAD noon-ish rate (kept for future use).
const BOC_USDCAD =
  "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1";

async function fetchJSON(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Returns true if a live BTC price was applied.
async function refreshBTCPrice(onStatus) {
  try {
    const data = await fetchJSON(COINGECKO);
    const cad = data?.bitcoin?.cad;
    if (typeof cad === "number" && cad > 0) {
      setOverride("btcPriceCAD", cad);
      onStatus?.({ ok: true, btcPriceCAD: cad });
      return true;
    }
    throw new Error("malformed response");
  } catch (err) {
    onStatus?.({ ok: false, error: String(err) });
    return false;
  }
}

// Kick off live updates; refresh BTC price every 60s.
export function startLive(onStatus) {
  refreshBTCPrice(onStatus);
  setInterval(() => refreshBTCPrice(onStatus), 60_000);
}

export { BOC_USDCAD };
