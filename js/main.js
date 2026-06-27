// =============================================================================
//  main.js — bind the engine to the DOM
// =============================================================================
//  Each on-screen number is an element with:
//     data-metric="federalDebt"   (which metric to read)
//     data-format="money"         (how to format it)
//  This loop formats every bound element each frame. No framework needed.
// =============================================================================

import { start } from "./clock.js";
import { startLive } from "./live.js";
import * as fmt from "./format.js";

const FORMATTERS = {
  money: fmt.money,
  moneyCents: fmt.moneyCents,
  count: fmt.count,
  abbrev: fmt.abbrevMoney,
  pct: fmt.pct,
  pct2: (n) => fmt.pct(n, 2),
  btc: fmt.btc,
  sats: fmt.sats,
  ppower: (n) => fmt.moneyCents(n).replace("CA", ""), // $0.71
  plain1: (n) => n.toFixed(1),
};

// Collect bound elements once.
const bound = [...document.querySelectorAll("[data-metric]")].map((el) => ({
  el,
  metric: el.dataset.metric,
  format: FORMATTERS[el.dataset.format] || fmt.count,
  last: null,
}));

// BTC "mined toward 21M" progress ring.
const ring = document.querySelector("#btc-ring-progress");
const RING_CIRC = ring ? 2 * Math.PI * Number(ring.getAttribute("r")) : 0;

function render(values) {
  for (const b of bound) {
    const v = values[b.metric];
    if (v === undefined) continue;
    const text = b.format(v);
    if (text !== b.last) {
      b.el.textContent = text;
      b.last = text;
    }
  }

  if (ring && values.btcMinedPct !== undefined) {
    const offset = RING_CIRC * (1 - values.btcMinedPct / 100);
    ring.style.strokeDashoffset = String(offset);
  }
}

// Live data (BTC price) — update the status pill.
const statusPill = document.querySelector("#live-status");
startLive((s) => {
  if (!statusPill) return;
  if (s.ok) {
    statusPill.textContent = "● LIVE — BTC price from CoinGecko";
    statusPill.classList.add("live");
    statusPill.classList.remove("seed");
  } else {
    statusPill.textContent = "● SEED — using stored estimates (offline)";
    statusPill.classList.add("seed");
    statusPill.classList.remove("live");
  }
});

// Stamp the "data as of" line.
const asOfEl = document.querySelector("#as-of");
if (asOfEl) asOfEl.textContent = new Date().toLocaleString("en-CA");

start(render);
