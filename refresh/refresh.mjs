// Refreshes the live market-data snapshots in data/live/ from FMP.
//   FMP_API_KEY=... node refresh/refresh.mjs
// Runs the same loaders the dashboard runs inside Claude (from src/data.js and
// src/pulse.js), but against FMP's REST API, so the numbers match the artifact.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.FMP_API_KEY;
if (!KEY) { console.error('FMP_API_KEY is not set'); process.exit(1); }

// MCP tool endpoint -> FMP stable REST path
const PATHS = {
  'historical-price-eod-dividend-adjusted': 'historical-price-eod/dividend-adjusted',
  'historical-price-eod-light': 'historical-price-eod/light',
  'historical-price-eod-full': 'historical-price-eod/full',
  'forex-historical-price-eod-light': 'historical-price-eod/light',
  'forex-historical-price-eod-full': 'historical-price-eod/full',
  'batch-quote': 'batch-quote',
  'quote': 'quote',
  'country-weighting': 'etf/country-weightings',
  'sector-weighting': 'etf/sector-weightings',
  'economics-calendar': 'economic-calendar',
  'treasury-rates': 'treasury-rates',
  'earnings-calendar': 'earnings-calendar',
  'general-news': 'news/general-latest',
};

let calls = 0;
async function call(tool, args) {
  const { endpoint, ...rest } = args;
  const path = PATHS[endpoint];
  if (!path) throw new Error(`No REST mapping for ${tool}/${endpoint}`);
  const q = new URLSearchParams({ apikey: KEY });
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null) continue;
    const name = k === 'from_date' ? 'from' : k === 'to_date' ? 'to' : k;
    q.set(name, Array.isArray(v) ? v.join(',') : String(v));
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    calls += 1;
    const r = await fetch(`https://financialmodelingprep.com/stable/${path}?${q}`);
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 2000 * (attempt + 1))); continue; }
    if (!r.ok) throw new Error(`${path} HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return r.json();
  }
  throw new Error(`${path} rate-limited`);
}

// Collect the page's loaders without running any of its drawing code.
const loaders = {};
const noop = () => {};
const dashStub = {
  loader: (id, spec) => { loaders[id] = spec.fn; },
  calc: noop, onData: noop, refresh: noop, setLink: noop, setParams: noop, resetParams: noop,
  params: () => ({}), data: () => ({ status: 'loading', data: [], rows: [], columns: [], meta: [] }), colors: [],
};
const ctx = vm.createContext({ dash: dashStub, console, setTimeout, clearTimeout, Promise, URLSearchParams, URL, Date, Math, JSON });
ctx.window = ctx;
for (const f of ['data.js', 'pulse.js']) {
  vm.runInContext(`(function () {\n${readFileSync(join(root, 'src', f), 'utf8')}\n})();`, ctx, { filename: f });
}

const sources = JSON.parse(readFileSync(join(root, 'refresh/sources.json'), 'utf8'));
const manifestPath = join(root, 'data/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
mkdirSync(join(root, 'data/live'), { recursive: true });

// MODE=fast refreshes only what moves intraday (quotes, headlines, calendars)
// and reuses everything else from the currently published site (PREV_SITE).
// Any dataset that fails to refresh also falls back to the published copy.
const MODE = process.env.MODE === 'fast' ? 'fast' : 'full';
const PREV = (process.env.PREV_SITE || '').replace(/\/?$/, '/');
const FAST = new Set(['etf_quotes', 'bond_quotes', 'multi_quotes', 'today_quotes', 'constituent_quotes',
  'today_news', 'calendar_live', 'today_earnings']);
let prevManifest = null;
async function previous(id) {
  if (!process.env.PREV_SITE) throw new Error('no PREV_SITE');
  if (!prevManifest) prevManifest = await (await fetch(PREV + 'data/manifest.json?t=' + Date.now())).json();
  const r = await fetch(PREV + 'data/live/' + id + '.json?t=' + Date.now());
  if (!r.ok) throw new Error('previous copy HTTP ' + r.status);
  writeFileSync(join(root, 'data/live', id + '.json'), Buffer.from(await r.arrayBuffer()));
  const u = prevManifest.datasets && prevManifest.datasets[id] && prevManifest.datasets[id].updated;
  if (u) manifest.datasets[id].updated = u;
}

const parseRows = (a) => (Array.isArray(a) ? a : (a && (a.rows || a.data || a.results)) || []);
const now = new Date().toISOString();
let ok = 0, reused = 0;
const failed = [];
// Outlet RSS feeds merged into the FMP headlines (FMP carries WSJ, CNBC and Reuters but not Bloomberg or ZeroHedge)
const FEEDS = [
  ['https://feeds.bloomberg.com/markets/news.rss', 'bloomberg.com'],
  ['https://cms.zerohedge.com/fullrss2.xml', 'zerohedge.com'],
  ['https://moxie.foxbusiness.com/google-publisher/markets.xml', 'foxbusiness.com'],
  ['https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', 'cnbc.com'],
  ['https://feeds.content.dowjones.io/public/rss/RSSMarketsMain', 'wsj.com'],
];
const ent = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ');
const unx = (s) => ent(String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&')).replace(/\s+/g, ' ').trim();
// FMP's headline times are US Eastern; put the feeds' times on the same clock
const eastern = (d) => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value])); return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`; };
async function rss() {
  const out = [];
  await Promise.all(FEEDS.map(async ([url, site]) => {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (dashboard headline reader)' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const xml = await r.text();
      let n = 0;
      for (const m of xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/g)) {
        const g = (tag) => { const x = m[1].match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>')); return x ? unx(x[1]) : ''; };
        const title = g('title'), link = g('link') || g('guid'), d = new Date(g('pubDate') || g('dc:date'));
        if (!title || !/^https?:/.test(link) || isNaN(d) || Date.now() - d > 4 * 864e5) continue;
        out.push({ title, url: link, site, publishedDate: eastern(d), text: g('description').slice(0, 300) });
        if (++n >= 25) break;
      }
      console.log(`     rss ${site}: ${n} headlines`);
    } catch (e) { console.log(`     rss ${site} unavailable (${e.message})`); }
  }));
  return out;
}

async function fresh(id, tool, args) {
  let answer = await call(tool, args);
  if (id === 'today_news') answer = [...(Array.isArray(answer) ? answer : []), ...(await rss())];
  const out = loaders[id] ? await loaders[id]({ answer, call, args }) : parseRows(answer);
  const rows = JSON.parse(JSON.stringify(out));
  if (Array.isArray(rows) && !rows.length) throw new Error('no rows');
  writeFileSync(join(root, 'data/live', id + '.json'), JSON.stringify(rows));
  manifest.datasets[id].updated = { at: now, by: 'refresh job (FMP)' };
  return Array.isArray(rows) ? rows.length + ' rows' : typeof rows;
}
for (const [id, { tool, args }] of Object.entries(sources)) {
  if (MODE === 'fast' && !FAST.has(id)) {
    try { await previous(id); reused += 1; console.log(`keep ${id}`); continue; }
    catch (e) { console.log(`keep ${id} unavailable (${e.message}); fetching`); }
  }
  try {
    console.log(`ok   ${id}  ${await fresh(id, tool, args)}`);
    ok += 1;
  } catch (e) {
    console.error(`FAIL ${id}: ${e.message}`);
    try { await previous(id); reused += 1; console.error(`     ${id}: kept the published copy`); }
    catch { failed.push(id); }
  }
}
// FRED series (breakevens, real yields, credit spreads by rating): rebuilt on full runs, carried over on fast ones
if (manifest.datasets.rates_credit) {
  const rc = manifest.datasets.rates_credit;
  if (MODE === 'full') {
    try {
      execFileSync('python3', [join(root, 'refresh/fred.py'), join(root, rc.path)], { stdio: 'inherit' });
      rc.updated = { at: now, by: 'refresh job (FRED)' };
    } catch (e) { console.error('FAIL rates_credit (FRED): ' + e.message + ' — keeping the synced copy'); }
  } else if (process.env.PREV_SITE) {
    try {
      if (!prevManifest) prevManifest = await (await fetch(PREV + 'data/manifest.json?t=' + Date.now())).json();
      const pu = prevManifest.datasets && prevManifest.datasets.rates_credit && prevManifest.datasets.rates_credit.updated;
      if (pu && (!rc.updated || pu.at > rc.updated.at)) {
        const r = await fetch(PREV + rc.path + '?t=' + Date.now());
        if (r.ok) { writeFileSync(join(root, rc.path), Buffer.from(await r.arrayBuffer())); rc.updated = pu; console.log('keep rates_credit (published copy)'); }
      }
    } catch (e) { console.log('keep rates_credit: synced copy (' + e.message + ')'); }
  }
}
console.log(`mode ${MODE}: ${ok} refreshed, ${reused} kept, ${failed.length} missing`);
manifest.builtAt = now;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`\n${ok}/${Object.keys(sources).length} live sources refreshed, ${calls} FMP calls`);
if (ok === 0) process.exit(1);
