// =============================================================================
//  data.js — THE SINGLE SOURCE OF TRUTH
// =============================================================================
//  Every number on the clock is anchored here: a known value at a known date,
//  plus a rate of change. The engine (clock.js) extrapolates between updates.
//
//  HONESTY POLICY (this is the whole point of the project):
//    - Each figure carries an `asOf` date and a `source`.
//    - Figures marked VERIFY are defensible estimates seeded for launch and
//      MUST be reconciled against the live source before you publish.
//    - Where a number can be pulled live (BTC price, USD/CAD), live.js
//      overrides the seed at runtime and falls back to the seed on failure.
//
//  PRIMARY SOURCES:
//    - Bank of Canada Valet API ........ https://www.bankofcanada.ca/valet/
//    - Statistics Canada (population) .. https://www150.statcan.gc.ca/
//    - Dept. of Finance, Fiscal Ref. Tables / Budget / Fall Econ. Statement
//    - Public Accounts of Canada (federal debt, public debt charges)
//    - Provincial public accounts (Ontario, Quebec, etc.)
//    - CoinGecko (BTC price, live) ..... https://api.coingecko.com/
// =============================================================================

const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; // 31,557,600

// Anchor moment for all seeded values. Update when you refresh the numbers.
export const ANCHOR_ISO = "2026-06-27T00:00:00Z";

// Fiscal year in Canada starts April 1.
export const FISCAL_YEAR_START_ISO = "2026-04-01T00:00:00Z";

// Bitcoin's defining property: the cap never moves.
export const BTC_HARD_CAP = 21_000_000;

// Helper: convert an annual flow ($/year) into a per-second rate.
const perSecond = (perYear) => perYear / SECONDS_PER_YEAR;

// =============================================================================
//  RAW FIGURES  (edit these; everything else is derived)
// =============================================================================
//  NOTE: all dollar figures are CANADIAN DOLLARS.
//  All values below are seeded estimates for 2026-06-27 — marked VERIFY where
//  they need reconciliation against the live primary source.

export const FIGURES = {
  // ---- Federal government -------------------------------------------------
  federalDebt: {
    value: 1_420_000_000_000,            // ~$1.42T accumulated deficit  // VERIFY
    perYear: 50_000_000_000,             // grows by the annual deficit  // VERIFY
    asOf: ANCHOR_ISO,
    source: "Public Accounts of Canada / Dept. of Finance Fiscal Tables",
  },
  federalDeficitPerYear: {
    value: 50_000_000_000,               // ~$50B/yr                     // VERIFY
    asOf: ANCHOR_ISO,
    source: "Budget 2026 / Fall Economic Statement",
  },
  federalInterestPerYear: {
    value: 55_000_000_000,               // public debt charges ~$55B/yr // VERIFY
    asOf: ANCHOR_ISO,
    source: "Public Accounts of Canada — Public Debt Charges",
  },

  // ---- All governments combined (federal + provincial + municipal) --------
  totalGovDebt: {
    value: 2_550_000_000_000,            // ~$2.55T combined gross       // VERIFY
    perYear: 75_000_000_000,             // combined annual borrowing    // VERIFY
    asOf: ANCHOR_ISO,
    source: "Federal Public Accounts + provincial public accounts + FCM",
  },

  // ---- People -------------------------------------------------------------
  population: {
    value: 41_600_000,                   // ~41.6M                        // VERIFY
    perYear: 500_000,                    // ~+1.2%/yr                     // VERIFY
    asOf: ANCHOR_ISO,
    source: "Statistics Canada — Quarterly Population Estimates",
  },
  taxpayers: {
    value: 28_500_000,                   // tax filers                    // VERIFY
    perYear: 350_000,
    asOf: ANCHOR_ISO,
    source: "Canada Revenue Agency — tax filer statistics",
  },

  // ---- Monetary (the Austrian centerpiece) --------------------------------
  moneySupplyM2: {
    value: 2_050_000_000_000,            // M2 ~$2.05T                    // VERIFY
    perYear: 123_000_000_000,            // ~+6%/yr debasement            // VERIFY
    asOf: ANCHOR_ISO,
    source: "Statistics Canada / Bank of Canada — Monetary Aggregates (M2)",
  },
  cpiInflationRate: {
    value: 0.028,                        // official CPI ~2.8%/yr         // VERIFY
    asOf: ANCHOR_ISO,
    source: "Statistics Canada — Consumer Price Index (Valet: CPIXCORE/STATIC)",
  },
  gdp: {
    value: 3_050_000_000_000,            // nominal GDP ~$3.05T           // VERIFY
    perYear: 122_000_000_000,            // ~+4% nominal                  // VERIFY
    asOf: ANCHOR_ISO,
    source: "Statistics Canada — GDP, income & expenditure",
  },

  // ---- Bitcoin ------------------------------------------------------------
  btcMined: {
    value: 19_880_000,                   // circulating supply            // VERIFY
    perYear: 450 * 365.25,               // ~450 BTC/day @ 3.125 reward
    asOf: ANCHOR_ISO,
    source: "Bitcoin network — block subsidy (3.125 BTC/block post-2024 halving)",
  },
  btcPriceCAD: {
    value: 120_000,                      // seed; overridden live         // LIVE
    asOf: ANCHOR_ISO,
    source: "CoinGecko (live) — simple/price?ids=bitcoin&vs_currencies=cad",
  },
};

// =============================================================================
//  METRIC DEFINITIONS  — what the engine ticks.
// =============================================================================
//  A metric is either:
//    { kind: "linear", base, perSecond }                  ← extrapolates in time
//    { kind: "derived", deps: [...], compute(values) }    ← function of others
//  `values` passed to compute() is a map of metricId -> current live value.
// =============================================================================

export const METRICS = {
  // --- Linear (time-extrapolated) -----------------------------------------
  federalDebt: {
    kind: "linear",
    base: FIGURES.federalDebt.value,
    perSecond: perSecond(FIGURES.federalDebt.perYear),
  },
  totalGovDebt: {
    kind: "linear",
    base: FIGURES.totalGovDebt.value,
    perSecond: perSecond(FIGURES.totalGovDebt.perYear),
  },
  federalInterest: {
    // Interest paid SINCE the start of this fiscal year (resets April 1).
    kind: "linear",
    base: 0,
    perSecond: perSecond(FIGURES.federalInterestPerYear.value),
    epochISO: FISCAL_YEAR_START_ISO,
  },
  federalDeficitYTD: {
    // Deficit accumulated since the start of this fiscal year.
    kind: "linear",
    base: 0,
    perSecond: perSecond(FIGURES.federalDeficitPerYear.value),
    epochISO: FISCAL_YEAR_START_ISO,
  },
  population: {
    kind: "linear",
    base: FIGURES.population.value,
    perSecond: perSecond(FIGURES.population.perYear),
  },
  taxpayers: {
    kind: "linear",
    base: FIGURES.taxpayers.value,
    perSecond: perSecond(FIGURES.taxpayers.perYear),
  },
  moneySupplyM2: {
    kind: "linear",
    base: FIGURES.moneySupplyM2.value,
    perSecond: perSecond(FIGURES.moneySupplyM2.perYear),
  },
  gdp: {
    kind: "linear",
    base: FIGURES.gdp.value,
    perSecond: perSecond(FIGURES.gdp.perYear),
  },
  btcMined: {
    kind: "linear",
    base: FIGURES.btcMined.value,
    perSecond: perSecond(FIGURES.btcMined.perYear),
    max: BTC_HARD_CAP, // never exceeds the cap
  },

  // --- Live / static singletons -------------------------------------------
  btcPriceCAD: {
    kind: "linear",
    base: FIGURES.btcPriceCAD.value,
    perSecond: 0, // flat unless live.js overrides
  },

  // --- Derived (the persuasive framings) ----------------------------------
  debtPerCitizen: {
    kind: "derived",
    deps: ["federalDebt", "population"],
    compute: (v) => v.federalDebt / v.population,
  },
  debtPerTaxpayer: {
    kind: "derived",
    deps: ["federalDebt", "taxpayers"],
    compute: (v) => v.federalDebt / v.taxpayers,
  },
  totalDebtPerCitizen: {
    kind: "derived",
    deps: ["totalGovDebt", "population"],
    compute: (v) => v.totalGovDebt / v.population,
  },

  // Bitcoin framings — the heart of the project.
  // The cap is FIXED at 21,000,000. That is the entire argument.
  federalDebtPerBTC: {
    kind: "derived",
    deps: ["federalDebt"],
    compute: (v) => v.federalDebt / BTC_HARD_CAP,
  },
  totalDebtPerBTC: {
    kind: "derived",
    deps: ["totalGovDebt"],
    compute: (v) => v.totalGovDebt / BTC_HARD_CAP,
  },
  yourShareInBTC: {
    // A citizen's share of the federal debt, priced in Bitcoin.
    kind: "derived",
    deps: ["debtPerCitizen", "btcPriceCAD"],
    compute: (v) => v.debtPerCitizen / v.btcPriceCAD,
  },
  yourShareInSats: {
    kind: "derived",
    deps: ["debtPerCitizen", "btcPriceCAD"],
    compute: (v) => (v.debtPerCitizen / v.btcPriceCAD) * 100_000_000,
  },
  btcRemaining: {
    kind: "derived",
    deps: ["btcMined"],
    compute: (v) => BTC_HARD_CAP - v.btcMined,
  },
  btcMinedPct: {
    kind: "derived",
    deps: ["btcMined"],
    compute: (v) => (v.btcMined / BTC_HARD_CAP) * 100,
  },

  // Debt-to-GDP (federal and total)
  federalDebtToGDP: {
    kind: "derived",
    deps: ["federalDebt", "gdp"],
    compute: (v) => (v.federalDebt / v.gdp) * 100,
  },
  totalDebtToGDP: {
    kind: "derived",
    deps: ["totalGovDebt", "gdp"],
    compute: (v) => (v.totalGovDebt / v.gdp) * 100,
  },

  // Austrian: purchasing power of a dollar relative to a base year, decaying
  // at the (broad-money) debasement rate. Shows the hidden tax.
  dollarPurchasingPower: {
    kind: "derived",
    deps: [],
    compute: () => {
      // Money-supply debasement is the honest inflation rate.
      const debasement = FIGURES.moneySupplyM2.perYear / FIGURES.moneySupplyM2.value;
      const baseYear = 2020;
      const now = new Date();
      const years =
        (now - new Date(`${baseYear}-01-01T00:00:00Z`)) / (SECONDS_PER_YEAR * 1000);
      return Math.pow(1 - debasement, years); // $1 (2020) in today's dollars
    },
  },
};
