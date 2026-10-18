// Today page: cross-asset moves against each asset's own history, what changed, the week ahead, headlines and themes.
const tdRows = (a) => (Array.isArray(a) ? a : (a && (a.rows || a.data || a.results)) || []);
const tdFetchAll = async (call, tool, argList, parse) => {
  const out = new Array(argList.length);
  let next = 0, failed = 0, lastErr = null;
  const one = async (a) => {
    try { return parse(await call(tool, a), a); } catch (e) {
      await new Promise((r) => setTimeout(r, 1200));
      try { return parse(await call(tool, a), a); } catch (e2) { failed += 1; lastErr = e2; return []; }
    }
  };
  await Promise.all(Array.from({ length: 4 }, async () => { while (next < argList.length) { const k = next++; out[k] = await one(argList[k]); } }));
  if (failed > argList.length / 2) throw lastErr || new Error('FMP did not answer');
  return out.flat();
};

dash.loader('today_px', {
  description: 'Runs the same daily price-history call for each of the 45 priced assets on the Today page, a few at a time (dividend-adjusted closes for funds; plain closes for futures, currencies, the VIX and crypto), and keeps symbol, date and close.',
  fn: async ({ answer, call, args }) => {
    const LIGHT = ['GCUSD', 'SIUSD', 'HGUSD', 'CLUSD', 'BZUSD', 'NGUSD', 'DXUSD', 'EURUSD', 'USDJPY', 'GBPUSD', 'USDCNH', 'AUDUSD', 'USDMXN', '^VIX', 'BTCUSD', 'ETHUSD'];
    const FUNDS = ['QQQ', 'RSP', 'IWM', 'IWF', 'IWD', 'EFA', 'VGK', 'EWJ', 'EEM', 'MCHI', 'INDA', 'SMH', 'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLP', 'XLU', 'TLT', 'AGG', 'TIP', 'LQD', 'HYG', 'EMB', 'BKLN', 'DBC', 'VNQ'];
    const pick = (r) => ({ symbol: r.symbol, date: String(r.date).slice(0, 10), close: Number(r.adjClose ?? r.price ?? r.close) });
    const first = tdRows(answer);
    if (!first.length) throw new Error('FMP returned no price history for ' + args.symbol);
    const list = [...FUNDS.map((symbol) => ({ ...args, symbol })), ...LIGHT.map((symbol) => ({ ...args, symbol, endpoint: 'historical-price-eod-light' }))];
    const rest = await tdFetchAll(call, 'chart', list, (a) => tdRows(a));
    return [...first, ...rest].map(pick).filter((r) => r.symbol && isFinite(r.close) && r.close > 0);
  },
});

dash.loader('today_news', {
  description: 'Keeps the latest general market headlines from FMP with their source, time and link, and tags each by the market it is about from words in the headline.',
  fn: ({ answer }) => {
    const TAGS = [
      ['Rates & Fed', /\b(fed|fomc|powell|treasur|yield|bond|rate cut|rate hike|inflation|cpi|pce)\b/i],
      ['Earnings', /\b(earnings|results|guidance|quarter|q[1-4]|beats?|miss(es)?|revenue)\b/i],
      ['Commodities', /\b(oil|crude|opec|gold|silver|copper|gas|commodit)/i],
      ['Currencies', /\b(dollar|yen|euro|yuan|currenc|forex|fx)\b/i],
      ['Crypto', /\b(bitcoin|crypto|ether|btc)\b/i],
      ['Policy & geopolitics', /\b(tariff|trade|china|sanction|war|iran|russia|ukraine|white house|trump|congress|election|shutdown)\b/i],
      ['Equities', /\b(stocks?|s&p|nasdaq|dow|shares|equit|rally|selloff|sell-off|market)\b/i],
    ];
    return tdRows(answer).filter((r) => r.title && r.url).map((r) => {
      const t = TAGS.find(([, re]) => re.test(r.title + ' ' + (r.text || '').slice(0, 160)));
      return { published: String(r.publishedDate), title: r.title, site: r.site || r.publisher || '', url: r.url, tag: t ? t[0] : 'Markets' };
    });
  },
});

dash.loader('today_earnings', {
  description: 'Asks the FMP earnings calendar: it asks for the past week and the next ten days in two calls (the saved call is for fixed dates), keeps companies listed on US exchanges expecting at least $3 billion of quarterly revenue, then adds name and market value from FMP batch quotes and keeps the 40 largest.',
  fn: async ({ answer, call, args }) => {
    const iso = (t) => new Date(t).toISOString().slice(0, 10);
    const now = Date.now();
    // FMP caps a calendar answer at 4,000 rows, so the past week and the next ten days are asked for separately
    let rows = [];
    try {
      const [a, b] = await Promise.all([call('calendar', { ...args, from_date: iso(now - 7 * 864e5), to_date: iso(now) }), call('calendar', { ...args, from_date: iso(now + 864e5), to_date: iso(now + 10 * 864e5) })]);
      rows = [...tdRows(a), ...tdRows(b)];
    } catch (e) { rows = tdRows(answer); }
    const big = rows.filter((r) => /^[A-Z]{1,5}$/.test(r.symbol || '') && !(r.symbol.length === 5 && /[FY]$/.test(r.symbol)) && Number(r.revenueEstimated) >= 3e9);
    const seen = new Map();
    for (const r of big) if (!seen.has(r.symbol) || r.date > seen.get(r.symbol).date) seen.set(r.symbol, r);
    const syms = [...seen.keys()];
    const chunks = [];
    for (let i = 0; i < syms.length; i += 100) chunks.push({ endpoint: 'batch-quote', symbols: syms.slice(i, i + 100) });
    const q = await tdFetchAll(call, 'quote', chunks, (a) => tdRows(a));
    const Q = Object.fromEntries(q.map((x) => [x.symbol, x]));
    const today = iso(now);
    return syms.filter((s) => Q[s] && Number(Q[s].marketCap) > 0 && ['NYSE', 'NASDAQ', 'AMEX'].includes(Q[s].exchange)).map((s) => {
      const r = seen.get(s), x = Q[s];
      const est = r.epsEstimated == null ? null : Number(r.epsEstimated), act = r.epsActual == null ? null : Number(r.epsActual);
      return {
        symbol: s, name: x.name, date: String(r.date).slice(0, 10), reported: act !== null || String(r.date) < today,
        epsEstimated: est, epsActual: act, epsSurprise: est && act !== null && Math.abs(est) > 0.01 ? act / Math.abs(est) - (est > 0 ? 1 : -1) : null,
        revenueEstimated: Number(r.revenueEstimated), revenueActual: r.revenueActual == null ? null : Number(r.revenueActual),
        marketCap: Number(x.marketCap), change1d: Number(x.changePercentage) / 100,
      };
    }).sort((a, b) => b.marketCap - a.marketCap).slice(0, 40);
  },
});

dash.calc('today_moves', {
  inputs: ['today_px', 'today_quotes', 'treasury'],
  title: 'Cross-asset moves',
  description: 'Each asset’s level and return over a day, week, month, three months, year to date and a year, ending at the live price, with each move in standard deviations of that asset’s own daily moves over the past year, its place in the 52-week range, and the last time it moved as much over the same span.',
  fn: (today_px, today_quotes, treasury) => {
  const META = [
    ['SPY', 'S&P 500', 'US equities'], ['QQQ', 'Nasdaq 100', 'US equities'], ['RSP', 'S&P 500 equal weight', 'US equities'], ['IWM', 'Russell 2000', 'US equities'], ['IWF', 'Russell 1000 Growth', 'US equities'], ['IWD', 'Russell 1000 Value', 'US equities'],
    ['EFA', 'Developed ex-US', 'Global equities'], ['VGK', 'Europe', 'Global equities'], ['EWJ', 'Japan', 'Global equities'], ['EEM', 'Emerging markets', 'Global equities'], ['MCHI', 'China', 'Global equities'], ['INDA', 'India', 'Global equities'],
    ['SMH', 'Semiconductors', 'Sectors'], ['XLK', 'Technology', 'Sectors'], ['XLF', 'Financials', 'Sectors'], ['XLE', 'Energy', 'Sectors'], ['XLV', 'Health care', 'Sectors'], ['XLI', 'Industrials', 'Sectors'], ['XLP', 'Consumer staples', 'Sectors'], ['XLU', 'Utilities', 'Sectors'],
    ['UST2Y', '2-year Treasury yield', 'Rates'], ['UST10Y', '10-year Treasury yield', 'Rates'], ['UST30Y', '30-year Treasury yield', 'Rates'], ['2s10s', '2s10s curve', 'Rates'],
    ['TLT', 'Long Treasuries', 'Bonds & credit'], ['AGG', 'US Aggregate', 'Bonds & credit'], ['TIP', 'TIPS', 'Bonds & credit'], ['LQD', 'IG corporates', 'Bonds & credit'], ['HYG', 'High yield', 'Bonds & credit'], ['EMB', 'EM dollar debt', 'Bonds & credit'], ['BKLN', 'Leveraged loans', 'Bonds & credit'],
    ['GCUSD', 'Gold', 'Commodities & real assets'], ['SIUSD', 'Silver', 'Commodities & real assets'], ['HGUSD', 'Copper', 'Commodities & real assets'], ['CLUSD', 'WTI crude', 'Commodities & real assets'], ['BZUSD', 'Brent crude', 'Commodities & real assets'], ['NGUSD', 'Natural gas', 'Commodities & real assets'], ['DBC', 'Broad commodities', 'Commodities & real assets'], ['VNQ', 'US REITs', 'Commodities & real assets'],
    ['DXUSD', 'Dollar index', 'Currencies'], ['EURUSD', 'Euro', 'Currencies'], ['USDJPY', 'Dollar–yen', 'Currencies'], ['GBPUSD', 'Sterling', 'Currencies'], ['USDCNH', 'Dollar–yuan', 'Currencies'], ['AUDUSD', 'Australian dollar', 'Currencies'], ['USDMXN', 'Dollar–peso', 'Currencies'],
    ['^VIX', 'VIX', 'Volatility & crypto'], ['BTCUSD', 'Bitcoin', 'Volatility & crypto'], ['ETHUSD', 'Ether', 'Volatility & crypto'],
  ];
  const H = [['d1', 1], ['w1', 5], ['m1', 21], ['m3', 63], ['ytd', 0], ['y1', 252]];
  const series = {};
  for (const r of today_px) (series[r.symbol] = series[r.symbol] || []).push([String(r.date).slice(0, 10), Number(r.close)]);
  const T = [...treasury].filter((r) => r.year2 != null && r.year10 != null).sort((a, b) => (a.date < b.date ? -1 : 1));
  series.UST2Y = T.map((r) => [r.date, Number(r.year2)]);
  series.UST10Y = T.map((r) => [r.date, Number(r.year10)]);
  series.UST30Y = T.filter((r) => r.year30 != null).map((r) => [r.date, Number(r.year30)]);
  series['2s10s'] = T.map((r) => [r.date, Number(r.year10) - Number(r.year2)]);
  const Q = {};
  for (const q of today_quotes) Q[q.symbol] = q;
  const out = [];
  for (const [symbol, asset, group] of META) {
    let s = (series[symbol] || []).filter((x) => isFinite(x[1])).sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const yld = group === 'Rates';
    const q = Q[symbol];
    if (!yld && q && Number(q.price) > 0 && s.length) {
      const qd = new Date(Number(q.timestamp) * 1000).toISOString().slice(0, 10);
      if (qd > s[s.length - 1][0]) s = [...s, [qd, Number(q.price)]];
      else s = [...s.slice(0, -1), [s[s.length - 1][0], Number(q.price)]];
    }
    if (s.length < 30) { out.push({ symbol, asset, group, unit: yld ? 'bp' : 'pct', level: null }); continue; }
    const n = s.length, v = s.map((x) => x[1]), last = v[n - 1];
    const chg = (a, b) => (yld ? (b - a) * 100 : b / a - 1);
    const daily = [];
    for (let i = Math.max(1, n - 253); i < n - 1; i++) daily.push(yld ? (v[i] - v[i - 1]) * 100 : Math.log(v[i] / v[i - 1]));
    const mu = daily.reduce((a, b) => a + b, 0) / daily.length;
    const sd = Math.sqrt(daily.reduce((a, b) => a + (b - mu) ** 2, 0) / Math.max(1, daily.length - 1));
    const row = { symbol, asset, group, unit: yld ? 'bp' : 'pct', level: last, asOf: s[n - 1][0], since: s[0][0] };
    const yr = s[n - 1][0].slice(0, 4);
    let ytdIdx = -1;
    for (let i = n - 1; i >= 0; i--) if (s[i][0].slice(0, 4) < yr) { ytdIdx = i; break; }
    for (const [k, d] of H) {
      const j = k === 'ytd' ? ytdIdx : n - 1 - d;
      if (j < 0) { row[k] = null; row['z_' + k] = null; continue; }
      const days = n - 1 - j;
      row[k] = chg(v[j], last);
      const m = yld ? row[k] : Math.log(last / v[j]);
      row['z_' + k] = sd > 0 && days > 0 ? m / (sd * Math.sqrt(days)) : null;
    }
    const w = v.slice(Math.max(0, n - 252));
    const hi = Math.max(...w), lo = Math.min(...w);
    row.high52 = hi; row.low52 = lo;
    row.pos52 = hi > lo ? (last - lo) / (hi - lo) : null;
    row.avg1y = w.reduce((a, b) => a + b, 0) / w.length;
    const w200 = v.slice(Math.max(0, n - 200));
    row.vs200 = yld ? (last - w200.reduce((a, b) => a + b, 0) / w200.length) * 100 : last / (w200.reduce((a, b) => a + b, 0) / w200.length) - 1;
    let best = null;
    for (const [k] of H.slice(0, 3)) if (row['z_' + k] != null && (!best || Math.abs(row['z_' + k]) > Math.abs(row['z_' + best]))) best = k;
    row.best = best;
    row.bestZ = best ? row['z_' + best] : null;
    row.lastAsBig = null;
    if (best) {
      const d = H.find((h) => h[0] === best)[1], cur = row[best];
      for (let i = n - 2; i - d >= 0; i--) {
        const past = chg(v[i - d], v[i]);
        if ((cur >= 0 && past >= cur) || (cur < 0 && past <= cur)) { row.lastAsBig = s[i][0]; break; }
      }
    }
    out.push(row);
  }
  return out;
},
});

dash.calc('today_flags', {
  inputs: ['today_moves'],
  title: 'Most unusual moves',
  description: 'The assets whose latest day, week or month stands out most against their own daily moves over the past year (2 standard deviations or more), plus new 52-week highs and lows, most unusual first, each as one line.',
  fn: (today_moves) => {
  const SPAN = { d1: 'today', w1: 'over the week', m1: 'over the month' };
  const NOUN = { d1: 'daily', w1: 'weekly', m1: 'monthly' };
  const f = (r, k) => (r.unit === 'bp' ? (r[k] >= 0 ? '+' : '−') + Math.abs(r[k]).toFixed(0) + 'bp' : (r[k] >= 0 ? '+' : '−') + Math.abs(r[k] * 100).toFixed(1) + '%');
  const mon = (d) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(d.slice(5, 7)) - 1] + ' ' + d.slice(0, 4);
  const out = [];
  for (const r of today_moves) {
    if (r.level == null) continue;
    const z = r.bestZ;
    const big = z != null && Math.abs(z) >= 2;
    const atHi = r.pos52 != null && r.pos52 >= 0.995, atLo = r.pos52 != null && r.pos52 <= 0.005;
    if (!big && !atHi && !atLo) continue;
    let text = '';
    if (big) {
      const dir = r[r.best] >= 0 ? (r.unit === 'bp' ? 'rise' : 'gain') : (r.unit === 'bp' ? 'fall' : 'drop');
      text = `${r.asset} ${f(r, r.best)} ${SPAN[r.best]}, ${Math.abs(z).toFixed(1)} sd against its own ${NOUN[r.best]} moves; ` +
        (r.lastAsBig ? `biggest ${NOUN[r.best]} ${dir} since ${mon(r.lastAsBig)}` : `biggest ${NOUN[r.best]} ${dir} since at least ${mon(r.since)}`);
    } else text = `${r.asset} at a new 52-week ${atHi ? 'high' : 'low'}, ${f(r, 'ytd')} year to date`;
    if (big && (atHi || atLo)) text += `, and at a new 52-week ${atHi ? 'high' : 'low'}`;
    out.push({ symbol: r.symbol, group: r.group, score: big ? Math.abs(z) : 1.5, text: text + '.' });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 8);
},
});

dash.calc('today_summary', {
  inputs: ['today_moves'],
  title: 'What changed, by market',
  description: 'One line per market: the lead asset’s day and week, the strongest and weakest over the week with how unusual each move is, and for volatility its level against its one-year average.',
  fn: (today_moves) => {
  const by = {};
  for (const r of today_moves) if (r.level != null) (by[r.group] = by[r.group] || []).push(r);
  const p = (x) => (x == null ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(1) + '%');
  const b = (x) => (x == null ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(0) + 'bp');
  const zs = (z) => (z != null && Math.abs(z) >= 1.5 ? `, ${Math.abs(z).toFixed(1)} sd` : '');
  const ext = (g) => { const s = [...g].filter((r) => r.w1 != null).sort((a, c) => c.w1 - a.w1); return [s[0], s[s.length - 1]]; };
  const out = [];
  const eq = by['US equities'], spy = eq && eq.find((r) => r.symbol === 'SPY'), hyg = (by['Bonds & credit'] || []).find((r) => r.symbol === 'HYG'), vix = (by['Volatility & crypto'] || []).find((r) => r.symbol === '^VIX');
  if (spy && vix) {
    const tone = spy.z_w1 <= -1 && vix.w1 > 0.1 ? 'Risk-off week' : spy.z_w1 >= 1 && vix.w1 < 0 ? 'Risk-on week' : spy.z_d1 <= -1.5 ? 'Risk-off day' : spy.z_d1 >= 1.5 ? 'Risk-on day' : 'Quiet tape overall';
    out.push({ group: 'Bottom line', text: `${tone}: the S&P 500 ${p(spy.d1)} today and ${p(spy.w1)} this week, the VIX at ${vix.level.toFixed(1)} against a one-year average of ${vix.avg1y.toFixed(1)}` + (hyg ? `, high yield ${p(hyg.w1)} on the week.` : '.') });
  }
  for (const g of ['US equities', 'Global equities', 'Sectors', 'Bonds & credit', 'Commodities & real assets', 'Currencies']) {
    const rs = by[g]; if (!rs || !rs.length) continue;
    const lead = rs[0], [hi, lo] = ext(rs);
    const head = g === 'Sectors' ? `Spread between the best and worst sector this week: ${((hi.w1 - lo.w1) * 100).toFixed(1)} points.` : `${lead.asset} ${p(lead.d1)} today, ${p(lead.w1)} on the week, ${p(lead.ytd)} YTD.`;
    out.push({ group: g, text: `${head} Strongest this week: ${hi.asset} ${p(hi.w1)}${zs(hi.z_w1)}; weakest: ${lo.asset} ${p(lo.w1)}${zs(lo.z_w1)}.` });
  }
  const R = by.Rates;
  if (R) {
    const y = (s) => R.find((r) => r.symbol === s);
    const t2 = y('UST2Y'), t10 = y('UST10Y'), c = y('2s10s');
    if (t2 && t10 && c) out.push({ group: 'Rates', text: `10-year ${t10.level.toFixed(2)}% (${b(t10.w1)} on the week${zs(t10.z_w1)}, ${b(t10.ytd)} YTD); 2-year ${t2.level.toFixed(2)}% (${b(t2.w1)}); 2s10s ${(c.level * 100).toFixed(0)}bp, ${b(c.w1)} on the week — ${t2.w1 != null && t10.w1 != null ? (Math.abs(t10.w1 - t2.w1) < 1 ? 'curve little changed' : t10.w1 > t2.w1 ? (t10.w1 > 0 ? 'bear steepening' : 'bull steepening') : (t2.w1 > 0 ? 'bear flattening' : 'bull flattening')) : ''}.` });
  }
  const V = by['Volatility & crypto'];
  if (V) { const btc = V.find((r) => r.symbol === 'BTCUSD'); if (vix && btc) out.push({ group: 'Volatility & crypto', text: `VIX ${vix.level.toFixed(1)} (${p(vix.w1)} on the week, ${vix.level > vix.avg1y ? 'above' : 'below'} its one-year average of ${vix.avg1y.toFixed(1)}); bitcoin ${p(btc.w1)} on the week, ${p(btc.ytd)} YTD.` }); }
  return out;
},
});

dash.calc('today_ahead', {
  inputs: ['calendar_live', 'today_earnings'],
  title: 'Week ahead',
  description: 'High-impact economic releases from today through the next ten days for the US, euro area, UK, Japan and China, and the largest US companies reporting earnings in the same window, in date order.',
  fn: (calendar_live, today_earnings) => {
  const today = new Date().toISOString().slice(0, 10);
  const KEEP = new Set(['US', 'EU', 'UK', 'JP', 'CN', 'DE']);
  const out = [];
  for (const r of calendar_live) {
    const d = String(r.date).slice(0, 10);
    if (d < today || r.impact !== 'High' || !KEEP.has(r.country)) continue;
    out.push({ date: d, kind: 'Data', what: `${r.country} ${r.event}`, detail: r.estimate != null && r.estimate !== '' ? `expected ${r.estimate}${r.unit || ''}, previous ${r.previous ?? '—'}${r.unit || ''}` : `previous ${r.previous ?? '—'}${r.unit || ''}` });
  }
  for (const r of today_earnings) {
    if (r.reported || r.date < today) continue;
    out.push({ date: r.date, kind: 'Earnings', what: `${r.name} (${r.symbol})`, detail: `$${(r.marketCap / 1e9).toFixed(0)}bn company` + (r.epsEstimated != null ? `, EPS expected ${r.epsEstimated.toFixed(2)}` : '') });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.kind < b.kind ? -1 : 1)).slice(0, 30);
},
});

(() => {
  const $ = (s) => document.querySelector(s);
  const el = (tag, txt, cls) => { const e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; };
  const pct = (x, d = 1) => (x == null || !isFinite(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(d) + '%');
  const bp = (x) => (x == null || !isFinite(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(0) + 'bp');
  const lvl = (r) => {
    if (r.level == null) return '—';
    if (r.unit === 'bp') return r.symbol === '2s10s' ? (r.level * 100).toFixed(0) + 'bp' : r.level.toFixed(2) + '%';
    const v = r.level;
    return v >= 10000 ? v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : v >= 100 ? v.toFixed(1) : v >= 10 ? v.toFixed(2) : v.toFixed(v < 2 ? 4 : 3);
  };
  const shade = (z) => {
    if (z == null || !isFinite(z)) return '';
    const a = Math.abs(z);
    if (a < 1) return '';
    return (z > 0 ? 'td-up' : 'td-dn') + (a >= 3 ? '3' : a >= 2 ? '2' : '1');
  };
  const GROUPS = ['US equities', 'Global equities', 'Sectors', 'Rates', 'Bonds & credit', 'Commodities & real assets', 'Currencies', 'Volatility & crypto'];
  const HK = [['d1', '1D'], ['w1', '1W'], ['m1', '1M'], ['m3', '3M'], ['ytd', 'YTD'], ['y1', '1Y']];
  const ok = (id) => dash.data(id).status === 'ok';
  const mon = (d) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(d.slice(5, 7)) - 1] + ' ' + Number(d.slice(8, 10));
  const placeholder = (box, msg) => box.replaceChildren(el('p', msg || '—', 'gm-note'));

  const drawList = (sel, id, field, showGroup) => {
    const box = $(sel); if (!box) return;
    if (!ok(id)) return placeholder(box);
    const rows = dash.data(id).data;
    if (!rows.length) return placeholder(box, 'Nothing unusual: every asset’s latest day, week and month sits within 2 standard deviations of its normal moves.');
    box.replaceChildren(...rows.map((r) => { const li = el('li'); if (showGroup && r.group) li.append(el('b', r.group + ': ')); li.append(document.createTextNode(r[field])); return li; }));
  };

  const drawGrid = () => {
    const box = $('#td-grid'); if (!box) return;
    if (!ok('today_moves')) return placeholder(box);
    const rows = dash.data('today_moves').data;
    const frag = [];
    for (const g of GROUPS) {
      const rs = rows.filter((r) => r.group === g);
      if (!rs.length) continue;
      frag.push(el('h3', g, 'gm-h4'));
      const wrap = el('div', null, 'gm-tablewrap td-wrap');
      const t = el('table', null, 'gm-table td-table');
      t.dataset.source = 'today_moves'; t.dataset.rowKey = 'symbol';
      const hr = el('tr');
      const cols = [['symbol', 'Ticker'], ['asset', 'Asset'], ['level', 'Level'], ...HK, ['pos52', '52-week range']];
      for (const [f, l] of cols) { const th = el('th', l); th.dataset.field = f; hr.append(th); }
      const th = el('thead'); th.append(hr); t.append(th);
      const tb = el('tbody');
      for (const r of rs) {
        const tr = el('tr');
        tr.append(el('td', r.symbol, 'td-sym'), el('td', r.asset), el('td', lvl(r), 'gm-num'));
        for (const [k] of HK) {
          const td = el('td', r.unit === 'bp' ? bp(r[k]) : pct(r[k]), 'gm-num ' + shade(r['z_' + k]));
          if (r['z_' + k] != null) td.title = Math.abs(r['z_' + k]) >= 1 ? r['z_' + k].toFixed(1) + ' sd against its own moves' : 'within 1 sd of normal';
          tr.append(td);
        }
        const tdr = el('td', null, 'td-rng');
        if (r.pos52 != null) {
          const bar = el('span', null, 'td-bar'), dot = el('span', null, 'td-dot');
          dot.style.left = 'calc(' + (r.pos52 * 100).toFixed(1) + '% - 4px)';
          bar.append(dot); tdr.append(bar, el('span', Math.round(r.pos52 * 100) + '%', 'td-rngv'));
        } else tdr.textContent = '—';
        tr.append(tdr);
        tb.append(tr);
      }
      t.append(tb); wrap.append(t); frag.push(wrap);
    }
    box.replaceChildren(...frag);
    const any = rows.find((r) => r.asOf);
    const asof = $('#td-asof'); if (asof && any) asof.textContent = 'Prices to ' + mon(any.asOf) + ', live where markets are open';
  };

  const drawAhead = () => {
    const box = $('#td-ahead'); if (!box) return;
    if (!ok('today_ahead')) return placeholder(box);
    const rows = dash.data('today_ahead').data;
    if (!rows.length) return placeholder(box, 'No high-impact releases or large-company earnings in the next ten days.');
    const t = el('table', null, 'gm-table td-table');
    t.dataset.source = 'today_ahead'; t.dataset.rowKey = 'date,what';
    const hr = el('tr');
    for (const [f, l] of [['date', 'Date'], ['kind', 'Type'], ['what', 'Event'], ['detail', 'Detail']]) { const h = el('th', l); h.dataset.field = f; hr.append(h); }
    const th = el('thead'); th.append(hr); t.append(th);
    const tb = el('tbody');
    for (const r of rows) {
      const tr = el('tr');
      tr.dataset.key = encodeURIComponent(r.date) + ',' + encodeURIComponent(r.what);
      tr.append(el('td', r.date, 'gm-num'), el('td', r.kind), el('td', r.what), el('td', r.detail, 'gm-note'));
      tb.append(tr);
    }
    t.append(tb);
    const w = el('div', null, 'gm-tablewrap td-wrap'); w.append(t);
    box.replaceChildren(w);
  };

  const drawReported = () => {
    const box = $('#td-reported'); if (!box) return;
    if (!ok('today_earnings')) return placeholder(box);
    const rows = dash.data('today_earnings').data.filter((r) => r.reported && r.epsActual != null).slice(0, 12);
    if (!rows.length) return placeholder(box, 'None of the largest companies reported in the past week.');
    const t = el('table', null, 'gm-table td-table');
    t.dataset.source = 'today_earnings'; t.dataset.rowKey = 'symbol';
    const hr = el('tr');
    for (const [f, l] of [['symbol', 'Ticker'], ['name', 'Company'], ['date', 'Reported'], ['epsActual', 'EPS'], ['epsEstimated', 'Expected'], ['epsSurprise', 'Surprise']]) { const h = el('th', l); h.dataset.field = f; hr.append(h); }
    const th = el('thead'); th.append(hr); t.append(th);
    const tb = el('tbody');
    for (const r of rows) {
      const tr = el('tr');
      tr.append(el('td', r.symbol, 'td-sym'), el('td', r.name), el('td', r.date, 'gm-num'), el('td', r.epsActual.toFixed(2), 'gm-num'), el('td', r.epsEstimated != null ? r.epsEstimated.toFixed(2) : '—', 'gm-num'),
        el('td', pct(r.epsSurprise, 0), 'gm-num ' + (r.epsSurprise == null ? '' : r.epsSurprise >= 0.05 ? 'td-up1' : r.epsSurprise <= -0.05 ? 'td-dn1' : '')));
      tb.append(tr);
    }
    t.append(tb);
    const w = el('div', null, 'gm-tablewrap td-wrap'); w.append(t);
    box.replaceChildren(w);
  };

  const drawNews = () => {
    const box = $('#td-news'); if (!box) return;
    if (!ok('today_news')) return placeholder(box);
    const rows = dash.data('today_news').data.slice(0, 15);
    if (!rows.length) return placeholder(box, 'No headlines from FMP right now.');
    box.replaceChildren(...rows.map((r) => {
      const li = el('li');
      li.append(el('span', r.tag, 'td-tag'));
      const a = el('a', r.title); a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      li.append(a, el('span', ` ${r.site}, ${mon(r.published)} ${r.published.slice(11, 16)}`, 'gm-note'));
      return li;
    }));
  };

  const drawThemes = () => {
    const box = $('#td-themes'); if (!box) return;
    const items = [];
    if (ok('call_index')) {
      const ci = dash.data('call_index').data;
      const c = Array.isArray(ci) ? ci[0] : ci;
      const tops = ((c && c.topics) || []).filter((t) => t.z != null && !String(t.key).startsWith('guide'));
      const up = tops.filter((t) => t.z >= 1).sort((a, b) => b.z - a.z).slice(0, 4);
      const dn = tops.filter((t) => t.z <= -1).sort((a, b) => a.z - b.z).slice(0, 3);
      if (up.length) items.push(['Rising on earnings calls', up.map((t) => `${t.label} (${Math.round(t.share * 100)}% of calls, ${Math.round(t.shareYearAgo * 100)}% a year ago)`).join('; ')]);
      if (dn.length) items.push(['Fading on earnings calls', dn.map((t) => `${t.label} (${Math.round(t.share * 100)}%, ${Math.round(t.shareYearAgo * 100)}% a year ago)`).join('; ')]);
    }
    if (ok('positioning')) {
      const pd = dash.data('positioning').data;
      const p = Array.isArray(pd) ? pd[0] : pd;
      const L = p && p.latest, arr = Array.isArray(L) ? L : L && typeof L === 'object' ? Object.entries(L).map(([k, v]) => ({ what: (v && v.what) || k, z: v && v.z })) : [];
      const ex = arr.filter((x) => x.z != null && Math.abs(x.z) >= 1.5).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).slice(0, 5);
      if (ex.length) items.push(['Crowded futures positioning', ex.map((x) => `${x.what} ${x.z > 0 ? 'long' : 'short'} (${Math.abs(x.z).toFixed(1)} sd against three years)`).join('; ')]);
    }
    if (ok('today_moves')) {
      const m = dash.data('today_moves').data.filter((r) => r.unit === 'pct' && r.vs200 != null && r.group !== 'Volatility & crypto' && r.group !== 'Currencies');
      const above = m.filter((r) => r.vs200 > 0).length;
      if (m.length) items.push(['Trend breadth', `${above} of ${m.length} assets on this page trade above their 200-day average`]);
    }
    if (!items.length) return placeholder(box);
    box.replaceChildren(...items.map(([h, t]) => { const li = el('li'); li.append(el('b', h + ': '), document.createTextNode(t + '.')); return li; }));
  };

  dash.onData(() => {
    if (!$('#today')) return;
    const safe = (f) => { try { f(); } catch (e) { console.error(e); } };
    safe(() => drawList('#td-sum', 'today_summary', 'text', true));
    safe(() => drawList('#td-flags', 'today_flags', 'text'));
    for (const f of [drawGrid, drawAhead, drawReported, drawNews, drawThemes]) safe(f);
  });
})();
