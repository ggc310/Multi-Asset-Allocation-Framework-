// One catalog of everything the dashboard tracks, across asset classes, for the cross-asset tools.
// Each asset's history joins its weekly long history (etf_weekly for equity sleeves, xasset_weekly for the
// rest, since 2005–07) with its daily history (etf_history, bond_history, multi_history, fx_history,
// today_px; since late 2023). Rates and spreads are levels in percent from rates_credit (FRED, daily).
window.GMXA = (() => {
  const G = window.GMX, { isNum } = G;
  const CLASSES = ['Equities', 'Bonds', 'Real assets', 'Commodities', 'Currencies', 'Crypto', 'Volatility', 'Rates & spreads', 'Cash'];
  const FUT = { GCUSD: 'Gold futures', SIUSD: 'Silver futures', HGUSD: 'Copper futures', CLUSD: 'WTI crude futures', BZUSD: 'Brent crude futures', NGUSD: 'Natural gas futures', DXUSD: 'US dollar index (DXY)' };
  const LEVELS = [['n3m', '3-month Treasury yield'], ['n2', '2-year Treasury yield'], ['n10', '10-year Treasury yield'], ['n30', '30-year Treasury yield'], ['s2s10s', '2s10s curve (10y − 2y)'],
    ['ry10', '10-year real yield (TIPS)'], ['be10', '10-year breakeven inflation'], ['be5y5y', '5y5y forward inflation'],
    ['oas_ig', 'Investment-grade spread'], ['oas_bbb', 'BBB spread'], ['oas_hy', 'High-yield spread'], ['oas_ccc', 'CCC spread']];
  const D = (s) => new Date(String(s).slice(0, 10) + 'T12:00:00Z');
  let CAT = null, SER = {};
  const sig = () => ['etf_universe', 'bond_stats', 'multi_stats', 'fx_stats'].map((id) => G.rows(id)).concat([G.rows('etf_history'), G.rows('bond_history'), G.rows('multi_history'), G.rows('fx_history'), G.rows('today_px'), G.rows('etf_weekly'), G.rows('xasset_weekly'), G.rows('rates_credit')]);
  let lastSig = [];
  const fresh = () => { const s = sig(); if (s.length !== lastSig.length || s.some((x, i) => x !== lastSig[i])) { lastSig = s; CAT = null; SER = {}; } };

  const catalog = () => {
    fresh();
    if (CAT) return CAT;
    const A = [];
    for (const u of G.rows('etf_universe')) A.push({ id: u.etf, label: u.label, cls: 'Equities', group: u.group, kind: 'price', daily: ['etf_history', u.etf, 'adjClose'], weekly: ['etf_weekly', u.etf, 'close'] });
    for (const b of G.rows('bond_stats')) A.push({ id: b.etf, label: b.label, cls: b.etf === 'SGOV' ? 'Cash' : 'Bonds', group: b.group, kind: 'price', daily: ['bond_history', b.etf, 'adjClose'], weekly: ['xasset_weekly', b.etf, 'close'] });
    const have = new Set(A.map((a) => a.id));
    for (const m of G.rows('multi_stats')) {
      if (have.has(m.etf)) continue;
      const cls = m.cls === 'Currencies & crypto' ? (m.etf === 'BTCUSD' ? 'Crypto' : 'Currencies') : m.cls === 'Multi-asset' ? null : m.cls;
      if (!cls || !CLASSES.includes(cls)) continue;
      A.push({ id: m.etf, label: cls === 'Currencies' ? `${m.label} fund (${m.etf})` : m.label, cls, group: m.cls, kind: 'price', daily: [m.etf === 'BTCUSD' ? 'multi_history' : 'multi_history', m.etf, 'adjClose'], weekly: ['xasset_weekly', m.etf, 'close'] });
      have.add(m.etf);
    }
    for (const [s, l] of Object.entries(FUT)) A.push({ id: s, label: l, cls: s === 'DXUSD' ? 'Currencies' : 'Commodities', group: s === 'DXUSD' ? 'Dollar' : 'Futures', kind: 'price', daily: ['today_px', s, 'close'], weekly: ['xasset_weekly', s, 'close'] });
    if (!have.has('ETHUSD')) A.push({ id: 'ETHUSD', label: 'Ether', cls: 'Crypto', group: 'Crypto', kind: 'price', daily: ['today_px', 'ETHUSD', 'close'], weekly: ['xasset_weekly', 'ETHUSD', 'close'] });
    A.push({ id: '^VIX', label: 'VIX', cls: 'Volatility', group: 'Volatility', kind: 'level', unit: 'pt', daily: ['today_px', '^VIX', 'close'], weekly: ['xasset_weekly', '^VIX', 'close'] });
    for (const f of G.rows('fx_stats')) A.push({ id: f.code, label: f.label + ' (USD per unit)', short: f.label, cls: 'Currencies', group: f.group, kind: 'price', daily: ['fx_history', f.code, 'adjClose'], weekly: ['xasset_weekly', f.code, 'close'] });
    for (const [k, l] of LEVELS) A.push({ id: k, label: l, cls: 'Rates & spreads', group: k.startsWith('oas') ? 'Credit spreads' : k.startsWith('n') || k.startsWith('s2') ? 'Treasury yields' : 'Real yields & inflation', kind: 'level', unit: '%', fred: k });
    CAT = { list: A, by: new Map(A.map((a) => [a.id, a])) };
    return CAT;
  };

  // datasets an asset needs, so the page can say what's still loading
  const needs = (a) => (a.fred ? ['rates_credit'] : [a.daily && a.daily[0], a.weekly && a.weekly[0]].filter(Boolean));

  const fromRows = (id, sym, field) => {
    const out = [];
    for (const r of G.rows(id)) if (r.symbol === sym) { const v = Number(r[field] ?? r.close ?? r.adjClose); if (isNum(v) && v > 0) out.push([D(r.date), v]); }
    return out.sort((a, b) => a[0] - b[0]);
  };
  const fredSeries = (k) => {
    const rows = G.rows('rates_credit'), out = [];
    for (const r of rows) {
      const v = k === 's2s10s' ? (isNum(r.n10) && isNum(r.n2) ? r.n10 - r.n2 : null) : r[k];
      if (isNum(v)) out.push([D(r.date), Number(v)]);
    }
    return out;
  };
  // full history: weekly long history up to where the daily history starts, then daily
  const series = (id) => {
    fresh();
    if (SER[id]) return SER[id];
    const a = catalog().by.get(id); if (!a) return [];
    let s;
    if (a.fred) s = fredSeries(a.fred);
    else {
      const d = a.daily ? fromRows(...a.daily) : [], w = a.weekly ? fromRows(...a.weekly) : [];
      if (!d.length) s = w;
      else if (!w.length) s = d;
      else {
        const start = d[0][0]; const pre = w.filter((p) => p[0] < start);
        // splice: scale the weekly history to meet the daily one (adjusted closes can differ by dividends restated since)
        if (pre.length) { const wAt = w.filter((p) => p[0] <= start).pop() || pre[pre.length - 1]; const k = wAt ? d[0][1] / wAt[1] : 1; s = [...pre.map((p) => [p[0], p[1] * (a.kind === 'price' ? k : 1)]), ...d]; }
        else s = d;
      }
    }
    SER[id] = s;
    return s;
  };
  // last observation of each Monday-to-Sunday week, and of each calendar month
  const weeklyOf = (s) => { const wk = new Map(); for (const p of s) wk.set(Math.floor((p[0] / 864e5 + 3) / 7), p); return [...wk.values()]; };
  const monthlyOf = (s) => { const m = new Map(); for (const p of s) m.set(p[0].getUTCFullYear() * 12 + p[0].getUTCMonth(), p); return [...m.values()]; };
  const PRESETS = [
    ['Stocks, bonds & real assets', ['ACWI', 'AGG', 'TLT', 'TIP', 'HYG', 'GLD', 'DBC', 'VNQ'], 'ACWI'],
    ['Inflation hedges', ['TIP', 'GLD', 'DBC', 'CLUSD', 'VNQ', 'IGF', 'SPY', 'be10'], 'SPY'],
    ['Rates & risk', ['SPY', 'TLT', 'HYG', 'n10', 'ry10', 'oas_hy', '^VIX'], 'SPY'],
    ['Dollar & emerging markets', ['DXUSD', 'EEM', 'EMB', 'EMLC', 'EUR', 'JPY', 'MXN', 'BRL'], 'DXUSD'],
    ['Credit ladder', ['SGOV', 'AGG', 'LQD', 'HYG', 'BKLN', 'EMB', 'oas_ig', 'oas_hy'], 'AGG'],
    ['Defensives vs cyclicals', ['XLP', 'XLU', 'USMV', 'XLY', 'XLI', 'SMH', 'SPY'], 'SPY'],
    ['Global regions', ['SPY', 'VGK', 'EWJ', 'EWU', 'EEM', 'MCHI', 'INDA'], 'ACWI'],
    ['Crypto, gold & tech', ['BTCUSD', 'ETHUSD', 'GLD', 'SLV', 'QQQ'], 'QQQ'],
  ];
  return { CLASSES, catalog, series, needs, weeklyOf, monthlyOf, PRESETS };
})();
