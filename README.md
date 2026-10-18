# Global Equity Opportunity Monitor (standalone)

A public, no-login copy of the Claude dashboard artifact
"Global Equity Opportunity Monitor", published with GitHub Pages.

## How it stays current

| Part | What updates it | When |
| --- | --- | --- |
| Live market data (`data/live/`): ETF, bond, cross-asset, FX and constituent prices, Treasury curve, calendar, earnings, headlines | GitHub Actions runs `refresh/refresh.mjs` against FMP, using the same loaders the artifact uses | Every 30 minutes on weekdays, about 6am–2:30pm PT, and on every push |
| Model outputs and narrative (`data/files/`, `src/`): scores, backtests, model calls, weekly note, the page itself | A Claude scheduled task copies the artifact's latest files here and pushes | Saturdays, 8:20am PT, after the weekly model rebuild |

Live data is fetched at build time and deployed straight to Pages; it is never committed.

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
