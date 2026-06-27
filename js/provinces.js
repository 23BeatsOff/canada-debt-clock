// =============================================================================
//  provinces.js — per-province debt breakdown
// =============================================================================
//  Combined federal + provincial NET debt as a share of provincial GDP, 2025/26.
//  Source: Fraser Institute, "The Growing Debt Burden for Canadians: 2026".
//  `perPerson` is the combined federal+provincial net debt per resident where
//  Fraser published it (the four extremes); null otherwise.
// =============================================================================

export const PROVINCES = [
  { code: "MB", name: "Manitoba", debtToGDP: 91.3, perPerson: null },
  { code: "NL", name: "Newfoundland & Labrador", debtToGDP: 89.7, perPerson: 71611 },
  { code: "QC", name: "Quebec", debtToGDP: 89.1, perPerson: 63488 },
  { code: "NS", name: "Nova Scotia", debtToGDP: 89.1, perPerson: null },
  { code: "PE", name: "Prince Edward Island", debtToGDP: 88.8, perPerson: null },
  { code: "NB", name: "New Brunswick", debtToGDP: 88.1, perPerson: null },
  { code: "ON", name: "Ontario", debtToGDP: 82.7, perPerson: 63574 },
  { code: "BC", name: "British Columbia", debtToGDP: 69.0, perPerson: null },
  { code: "SK", name: "Saskatchewan", debtToGDP: 53.2, perPerson: null },
  { code: "AB", name: "Alberta", debtToGDP: 43.4, perPerson: 42368 },
];

// Green (low burden) → red (high burden), by debt-to-GDP.
function severityColor(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const hue = 140 - t * 140; // 140 = green, 0 = red
  return `hsl(${hue}, 75%, 52%)`;
}

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);

export function renderProvinces(container) {
  if (!container) return;
  const values = PROVINCES.map((p) => p.debtToGDP);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sorted = [...PROVINCES].sort((a, b) => b.debtToGDP - a.debtToGDP);

  container.innerHTML = sorted
    .map((p) => {
      const color = severityColor(p.debtToGDP, min - 5, max);
      const width = (p.debtToGDP / max) * 100;
      const perPerson = p.perPerson ? ` · ${fmtMoney(p.perPerson)}/person` : "";
      return `
      <div class="prov-row">
        <span class="prov-name" title="${p.name}">${p.code}</span>
        <div class="prov-track">
          <div class="prov-fill" style="width:${width}%; background:${color}; color:${color}"></div>
        </div>
        <span class="prov-val">${p.debtToGDP.toFixed(1)}%<span class="prov-pp">${perPerson}</span></span>
      </div>`;
    })
    .join("");
}
