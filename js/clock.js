// =============================================================================
//  clock.js — the deterministic extrapolation engine
// =============================================================================
//  Given the METRIC definitions, compute every metric's value at any instant.
//  Linear metrics extrapolate from an anchor; derived metrics are pure
//  functions of other live metrics. A topological pass resolves dependencies
//  each frame so "debt per citizen" tracks two independently-ticking clocks.
// =============================================================================

import { METRICS, ANCHOR_ISO } from "./data.js";

const ANCHOR_MS = new Date(ANCHOR_ISO).getTime();

// Runtime overrides (e.g. live BTC price) — base value gets replaced in place.
const overrides = new Map();

export function setOverride(metricId, baseValue) {
  overrides.set(metricId, baseValue);
}

// Evaluate one linear metric at time `nowMs`.
function evalLinear(id, def, nowMs) {
  const epochMs = def.epochISO ? new Date(def.epochISO).getTime() : ANCHOR_MS;
  const base = overrides.has(id) ? overrides.get(id) : def.base;
  const elapsedSec = (nowMs - epochMs) / 1000;
  let val = base + def.perSecond * elapsedSec;
  if (typeof def.max === "number") val = Math.min(val, def.max);
  if (typeof def.min === "number") val = Math.max(val, def.min);
  return val;
}

// Compute ALL metrics for a given instant. Returns { id: value }.
// Derived metrics are resolved iteratively (dependencies are shallow here).
export function snapshot(nowMs = Date.now()) {
  const values = {};

  // Pass 1: linear metrics.
  for (const [id, def] of Object.entries(METRICS)) {
    if (def.kind === "linear") values[id] = evalLinear(id, def, nowMs);
  }

  // Pass 2+: derived metrics, resolved until stable (deps are 1–2 deep).
  let remaining = Object.entries(METRICS).filter(([, d]) => d.kind === "derived");
  let guard = 0;
  while (remaining.length && guard++ < 10) {
    const next = [];
    for (const [id, def] of remaining) {
      const ready = def.deps.every((dep) => dep in values);
      if (ready) values[id] = def.compute(values);
      else next.push([id, def]);
    }
    if (next.length === remaining.length) break; // no progress; avoid infinite loop
    remaining = next;
  }

  return values;
}

// Drive a render callback at the display refresh rate.
export function start(onFrame) {
  let raf;
  const loop = () => {
    onFrame(snapshot(Date.now()));
    raf = requestAnimationFrame(loop);
  };
  loop();
  return () => cancelAnimationFrame(raf);
}
