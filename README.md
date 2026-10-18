# Global Equity Opportunity Monitor (standalone)

A public, no-login copy of the Claude dashboard artifact
"Global Equity Opportunity Monitor", published with GitHub Pages.

## How it stays current

| Part | What updates it | When |
| --- | --- | --- |
| Live market data (`data/live/`): ETF, bond, cross-asset, FX and constituent prices, Treasury curve, calendar, earnings, headlines | GitHub Actions runs `refresh/refresh.mjs` against FMP, using the same loaders the artifact uses | Quotes, headlines and calendars every 5 minutes on weekdays, about 6am–2:55pm PT; full price history before the open and after the close; and on every push. An open page picks up each new snapshot within about 2 minutes |
| Model outputs and narrative (`data/files/`, `src/`): scores, backtests, model calls, weekly note, the page itself | A Claude scheduled task copies the artifact's latest files here and pushes | Saturdays, 8:20am PT, after the weekly model rebuild |

Live data is fetched at build time and deployed straight to Pages; it is never committed.

## Pages added October 2026

- **Commentary**: Week in Review (Fri after the close), The Week Ahead (Sun afternoon), Month and Quarter in Review; written by Claude scheduled tasks into `data/files/commentary.json` and pushed here when published.
- **Markets → Inflation, real yields & credit**: FRED breakevens, TIPS real yields, ICE BofA spreads and returns by rating (`rates_credit`, rebuilt by `refresh/fred.py` on full runs).
- **Decide → Relative trends**: model score vs relative price for every equity dimension and classic pairs.
- **Companies → Earnings calls** and **Company profile** (top 300 holdings, `profiles`). Any-ticker lookup (`cp_*` datasets) needs Claude's FMP connector, so it works only in the Claude version.
- **Markets → Compare & correlate** and the **currency pair explorer**: any asset across classes over any time frame (`xasset_weekly` adds weekly history since 2005–07 for non-equity assets). Every time-series chart has a time-frame control.
- **Today**: event filters; headlines limited to major financial outlets, with Bloomberg, ZeroHedge, Fox Business, CNBC and WSJ RSS feeds merged in by the refresh job.

## Layout

- `src/` — the artifact's page files, unchanged (`index.html` body + scripts)
- `data/files/` — the artifact's saved datasets
- `data/manifest.json` — every dataset, where its file lives, and when it was updated
- `assets/runtime.js` — stands in for the Claude dashboard runtime (`dash.data`, `dash.calc`, `dash.onData`, …)
- `tools/build.mjs` — builds `index.html` and `page/` from `src/`
- `refresh/refresh.mjs` + `refresh/sources.json` — the live FMP calls

## Setup

1. Repo **Settings → Secrets and variables → Actions → New repository secret**: `FMP_API_KEY`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Actions → Refresh and publish dashboard → Run workflow** for the first build.

## Local preview

```
FMP_API_KEY=... node refresh/refresh.mjs
node tools/build.mjs
python3 -m http.server
```
