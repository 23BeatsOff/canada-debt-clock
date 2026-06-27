# The Canadian Debt Clock 🍁₿

A real-time visualization of Canada's debt — federal and total government — with two things the U.S. Debt Clock leaves out:

1. **The hidden tax.** The honest inflation rate isn't CPI; it's how fast the money supply (M2) expands. The clock shows the decaying purchasing power of the loonie alongside the debt it measures.
2. **Hard money.** Every figure is also priced against Bitcoin's **21,000,000** cap — debt per BTC, and *your* share of the debt denominated in sats.

> A loonie is a promise. Bitcoin is a number that doesn't move. This clock shows the gap widening.

## Run it locally

It's a **zero-build static site** — no Node, no bundler. You only need a static file server (ES modules don't load over `file://`):

```bash
cd canada-debt-clock
python3 -m http.server 8000
# open http://localhost:8000
```

## How it works

A debt clock is a **deterministic extrapolation engine**. Each metric is anchored to a known value at a known date plus a rate of change; the browser tweens between updates at 60fps.

| File | Role |
|------|------|
| `js/data.js`  | **Single source of truth** — every figure, its `asOf` date, and its source. Edit here. |
| `js/clock.js` | The engine: linear extrapolation + derived metrics (e.g. *debt per citizen* tracks two live clocks). |
| `js/live.js`  | Progressive enhancement — pulls the live BTC price (CoinGecko), falls back to the seed offline. |
| `js/format.js`| CAD / count / BTC / sats formatting. |
| `js/main.js`  | Binds metrics to the DOM via `data-metric` / `data-format` attributes. |

### Adding or changing a number

1. Edit the entry in `FIGURES` in `js/data.js` (set `value`, `perYear`, `asOf`, `source`).
2. If it's a new on-screen number, add a `METRICS` entry (linear or derived).
3. Bind it in `index.html`: `<span data-metric="yourMetric" data-format="money"></span>`.

## Data sources

- **Bank of Canada — Valet API** (`bankofcanada.ca/valet`) — FX, yields, CPI series.
- **Statistics Canada** — population estimates, monetary aggregates (M2).
- **Department of Finance** — Fiscal Reference Tables, Budget, Fall Economic Statement.
- **Public Accounts of Canada** — federal debt, public debt charges.
- **Provincial public accounts** — provincial debt.
- **CoinGecko** — live BTC/CAD price.

## Honesty policy

Figures marked `VERIFY` in `js/data.js` are defensible launch estimates and **must be reconciled against the primary source before publishing**. The point of this project is to be *more* honest than the thing it's modeled on — never less.

## Roadmap

- [ ] Wire BoC Valet for live USD/CAD, CPI, and bond yields.
- [ ] Pull StatCan population & M2 via their API on a schedule.
- [ ] Odometer roll animation on the headline digits.
- [ ] Per-province breakdown view.
- [ ] "Share your number" — sats owed per citizen as an image card.
- [ ] Deploy to Cloudflare Pages / GitHub Pages.

---

*Fix the money, fix the country.*
