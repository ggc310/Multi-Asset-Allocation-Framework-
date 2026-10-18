// Decide → Relative trends. Every relative call the dashboard makes, as the model's score over time paired with the
// price of the thing it favors relative to what it funds it from, so you can see whether the score led:
//   equities: every sleeve against its benchmark and classic pairs (equity composite scores, point-in-time);
//   allocation: stocks vs bonds, each fixed income lever (long fund against its funding leg), and the dollar;
//   real assets: each diversifier against a 60/40 mix; currencies: each currency against the dollar.
// The diagnostics answer two questions: how predictive has the score been overall, and how predictive at readings
// like today's, with the whole range of readings shown in buckets.
// Data: sleeve_series, score_history, etf_weekly, etf_universe; model_sb, model_fi, model_ra, fx_model; xasset_weekly.
(() => {
  const G = window.GMX, { el, $, isNum, pct, fx } = G;
  const M = '−';
  const BENCH = { 'Core': 'ACWI', 'US style & size': 'SPY', 'US factors': 'SPY', 'Intl style & size': 'EFA', 'Sectors': 'SPY', 'Industries': 'SPY', 'Developed countries': 'EFA', 'Emerging countries': 'EEM' };
  const BENCH_OVR = { EMXC: 'EEM', ACWI: 'SPY' };
  const PAIR_DIMS = {
    'Growth vs value': [['IWF', 'IWD', 'US large growth vs large value'], ['IWO', 'IWN', 'US small growth vs small value'], ['EFG', 'EFV', 'Intl growth vs value'], ['QQQ', 'IWD', 'Nasdaq-100 vs US large value'],
      ['IWF', 'SPY', 'US large growth vs market'], ['IWD', 'SPY', 'US large value vs market'], ['EFV', 'IWD', 'Intl value vs US value'], ['EFG', 'IWF', 'Intl growth vs US growth']],
    'Size': [['IWM', 'SPY', 'US small vs large (Russell 2000)'], ['IJR', 'SPY', 'US small vs large (S&P 600)'], ['IJH', 'SPY', 'US mid vs large'], ['RSP', 'SPY', 'Equal weight vs cap weight'],
      ['IWN', 'IWD', 'Small value vs large value'], ['IWO', 'IWF', 'Small growth vs large growth'], ['IJR', 'IWM', 'S&P 600 vs Russell 2000 (quality screen)'], ['SCZ', 'EFA', 'Intl small vs large']],
    'Factors': [['MTUM', 'USMV', 'Momentum vs min volatility'], ['MTUM', 'SPY', 'Momentum vs market'], ['USMV', 'SPY', 'Min volatility vs market'], ['QUAL', 'SPY', 'Quality vs market'],
      ['SCHD', 'SPY', 'Dividend vs market'], ['QQQ', 'SPY', 'Nasdaq-100 vs S&P 500'], ['XLY', 'XLP', 'Cyclicals vs defensives (XLY/XLP)']],
    'Commodities & themes': [['CPER', 'GLD', 'Copper vs gold (a growth gauge)'], ['URA', 'ACWI', 'Uranium miners vs global equities'], ['GDX', 'GLD', 'Gold miners vs gold'], ['AMLP', 'XLE', 'Pipelines vs energy stocks'],
      ['BTCUSD', 'GLD', 'Bitcoin vs gold'], ['DBMF', 'AGG', 'Managed futures vs bonds']],
    'Regions': [['ACWX', 'SPY', 'Global ex-US vs US'], ['EFA', 'SPY', 'Intl developed vs US'], ['EEM', 'EFA', 'Emerging vs developed'], ['EEM', 'SPY', 'Emerging vs US'], ['EMXC', 'MCHI', 'EM ex-China vs China']],
  };
  const LEVERS = { duration: ['TLT', 'SHY', 'Duration: long vs short Treasuries'], ig: ['LQD', 'IEF', 'IG credit vs Treasuries'], hy: ['HYG', 'IEI', 'High yield vs Treasuries'], mbs: ['MBB', 'IEF', 'Agency MBS vs Treasuries'],
    emd: ['EMB', 'IEF', 'EM dollar debt vs Treasuries'], tips: ['TIP', 'IEI', 'TIPS vs nominal Treasuries'], fx: ['EMLC', 'SHY', 'EM local currency vs short Treasuries'], intl: ['BNDX', 'IEF', 'International bonds (hedged) vs Treasuries'] };
  const DIMS = [['Asset allocation', 'Asset allocation'], ...Object.keys(PAIR_DIMS).map((k) => [k, k]), ...Object.keys(BENCH).map((k) => [k, k]), ['Real assets', 'Real assets'], ['Private markets', 'Private markets'], ['Currencies', 'Currencies']];
  const FWD = [6, 12, 24, 36], BACK = [1, 3, 6, 12, 24, 36];
  const MODEL_DIMS = new Set(['Asset allocation', 'Real assets', 'Private markets', 'Currencies']);
  const PRICE_ONLY = new Set(['Commodities & themes']);   // pairs with no model reading: only the trailing-return statistics apply
  const S = { dim: 'Asset allocation', range: '10Y', sel: null, fwd: 12, back: 12, sample: 'All' };
  // the sample the statistics are calculated over: readings dated within the last N years (outcomes then run up to today)
  const SAMPLES = [['All', 'All history'], ['20', '20Y'], ['15', '15Y'], ['10', '10Y'], ['5', '5Y']];
  const sampleStart = () => { if (S.sample === 'All') return null; const t = new Date(); t.setUTCFullYear(t.getUTCFullYear() - Number(S.sample)); return t; };
  const D = (s) => new Date(String(s).slice(0, 10) + 'T12:00:00Z');
  const one = (id) => (G.ok(id) ? G.rows(id)[0] : null);
  let C = null;

  const build = () => {
    const ss = G.rows('sleeve_series'), sh = G.rows('score_history'), wk = G.rows('etf_weekly'), xw = G.rows('xasset_weekly'), uni = G.rows('etf_universe');
    const mods = ['model_sb', 'model_fi', 'model_ra', 'fx_model', 'model_pm'].map((k) => G.rows(k));
    if (C && C.ss === ss && C.sh === sh && C.wk === wk && C.xw === xw && C.mods.every((m, i) => m === mods[i])) return C;
    const score = {};
    for (const r of ss) if (isNum(r.composite)) (score[r.etf] = score[r.etf] || []).push([D(r.month), Number(r.composite)]);
    for (const k in score) score[k].sort((a, b) => a[0] - b[0]);
    for (const r of sh) {
      const v = r.cmp_equal_contra ?? r.composite; if (!isNum(v)) continue;
      const s = (score[r.etf] = score[r.etf] || []); const d = D(r.date);
      if (!s.length || d > s[s.length - 1][0]) s.push([d, Number(v)]); else if (+d === +s[s.length - 1][0]) s[s.length - 1][1] = Number(v);
    }
    const px = {};
    for (const r of [...wk, ...xw]) if (isNum(r.close) && !(r.symbol in px && wk.length && r === undefined)) (px[r.symbol] = px[r.symbol] || []).push([D(r.date), Number(r.close)]);
    for (const k in px) { px[k].sort((a, b) => a[0] - b[0]); px[k] = px[k].filter((p, i, a) => !i || +p[0] !== +a[i - 1][0]); }
    // a weekly-rebalanced 60/40 of ACWI and AGG, for the diversifiers
    if (px.ACWI && px.AGG) {
      const g = new Map(px.AGG.map((p) => [+p[0], p[1]])); const a = px.ACWI.filter((p) => g.has(+p[0])); const out = [];
      let v = 100; for (let i = 0; i < a.length; i++) { if (i) v *= 1 + 0.6 * (a[i][1] / a[i - 1][1] - 1) + 0.4 * (g.get(+a[i][0]) / g.get(+a[i - 1][0]) - 1); out.push([a[i][0], v]); }
      px['6040'] = out;
    }
    const lab = Object.fromEntries(uni.map((u) => [u.etf, u.label]));
    const grp = {}; for (const u of uni) (grp[u.group] = grp[u.group] || []).push(u.etf);
    C = { ss, sh, wk, xw, mods, score, px, lab, grp, stats: {}, model: {} };
    // model score series
    const sb = one('model_sb'), fi = one('model_fi'), ra = one('model_ra'), fm = one('fx_model'), pmm = one('model_pm');
    if (pmm) for (const p of pmm.pairs || []) C.model['pm_' + p.key] = (p.history || []).map((r) => [D(r[0]), r[1]]).filter((r) => isNum(r[1]));
    const ser = (rows, f) => rows.map((r) => { const v = f(r); return isNum(v) ? [D(r[0] || r.month), Number(v)] : null; }).filter(Boolean);
    if (sb) C.model.sb = (sb.history || []).filter((r) => isNum(r.score)).map((r) => [D(r.month), r.score]);
    if (fi) for (const k of Object.keys(LEVERS)) C.model['fi_' + k] = (fi.history || []).filter((r) => isNum(r[k])).map((r) => [D(r.month), r[k]]);
    if (ra) for (const a of ra.assets || []) C.model['ra_' + a.etf] = ser(a.history || [], (r) => r[1]);
    if (fm) {
      for (const c of fm.currencies || []) C.model['fx_' + c.code] = ser(c.history || [], (r) => (isNum(r[1]) ? 0.6 * r[1] + 0.4 * (isNum(r[2]) ? r[2] : 0) : null));
      const dx = (fm.aggregates || []).find((a) => a.code === 'DXY'); if (dx) C.model.fx_DXY = ser(dx.history || [], (r) => (isNum(r[1]) ? 0.6 * r[1] + 0.4 * (isNum(r[2]) ? r[2] : 0) : null));
    }
    return C;
  };
  const at = (s, d) => { if (!s || !s.length || s[0][0] > d) return null; let lo = 0, hi = s.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m][0] <= d) lo = m; else hi = m - 1; } return s[lo][1]; };
  const ratio = (a, b) => { const A = C.px[a], B = C.px[b]; if (!A) return []; if (!b) return A; if (!B) return []; const bm = new Map(B.map((p) => [+p[0], p[1]])); return A.filter((p) => bm.has(+p[0])).map((p) => [p[0], p[1] / bm.get(+p[0])]); };
  const scoreOf = (spec) => {
    if (spec.kind === 'model') return C.model[spec.key] || [];
    if (spec.kind === 'px') return [];
    if (spec.kind === 'pair') { const A = C.score[spec.a], B = C.score[spec.b]; if (!A || !B) return []; return A.map((p) => { const v = at(B, p[0]); return v == null ? null : [p[0], p[1] - v]; }).filter(Boolean); }
    return C.score[spec.a] || [];
  };
  const relOf = (spec) => { const r = ratio(spec.a, spec.b); return spec.invert ? r.map((p) => [p[0], 1 / p[1]]) : r; };
  const rebase = (s, from) => { const c = from ? s.filter((p) => p[0] >= from) : s; if (!c.length) return []; const b = c[0][1]; return c.map((p) => [p[0], (100 * p[1]) / b]); };
  const spearman = (x, y) => {
    const rk = (v) => { const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r = new Array(v.length); o.forEach(([, i], k) => { r[i] = k; }); return r; };
    if (x.length < 24) return null; const a = rk(x), b = rk(y), n = x.length; let d = 0; for (let i = 0; i < n; i++) d += (a[i] - b[i]) ** 2; return 1 - (6 * d) / (n * (n * n - 1));
  };
  const tstat = (ic, n, h = 12) => (isNum(ic) && n / h > 2 ? ic * Math.sqrt((n / h - 2) / Math.max(1e-9, 1 - ic * ic)) : null);
  const verdict = (ic, t) => {
    if (!isNum(ic)) return ['Not enough history', 'muted'];
    if (ic <= -0.1) return ['Contrary: high readings were followed by underperformance', 'bad'];
    if (ic < 0.05) return ['No reliable edge', 'warn'];
    const strength = ic >= 0.3 ? 'Strong' : ic >= 0.15 ? 'Useful' : 'Weak';
    return [strength + (isNum(t) && t >= 2 ? ', statistically meaningful' : isNum(t) && t >= 1 ? ', but not statistically conclusive' : ', and statistically thin'), ic >= 0.15 && t >= 1.5 ? 'ok' : 'mid'];
  };
  // R²: share of the variation in forward relative returns a straight line through the predictor explains; sign is the slope's
  const rsq = (x, y) => {
    const n = x.length; if (n < 24) return null;
    const mx = d3.mean(x), my = d3.mean(y); let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; }
    if (!sxx || !syy) return null; const r = sxy / Math.sqrt(sxx * syy); return { r2: r * r, sign: Math.sign(r), r, n };
  };
  const addM = (d, m) => { const t = new Date(d); t.setUTCMonth(t.getUTCMonth() + m); return t; };
  const monthEnds = (s) => { const m = new Map(); for (const p of s) m.set(p[0].getUTCFullYear() * 12 + p[0].getUTCMonth(), p); return [...m.values()]; };
  // every month: the trailing B-month relative return and the reading, against the next F-month relative return
  const panel = (spec, back, fwd) => {
    const key = spec.id + '|p|' + back + '|' + fwd + '|' + S.sample, from = sampleStart(); if (C.stats[key]) return C.stats[key];
    const rel = relOf(spec), out = { xs: [], ys: [], ds: [] };
    if (rel.length) {
      const first = rel[0][0], last = rel[rel.length - 1][0];
      for (const [d, v] of monthEnds(rel)) {
        const b0 = addM(d, -back), f1 = addM(d, fwd);
        if (b0 < first || f1 > last || (from && d < from)) continue;
        const pb = at(rel, b0), pf = at(rel, f1); if (!pb || !pf) continue;
        out.xs.push(v / pb - 1); out.ys.push(pf / v - 1); out.ds.push(d);
      }
    }
    out.fit = rsq(out.xs, out.ys); C.stats[key] = out; return out;
  };
  const r2grid = (spec) => {
    const key = spec.id + '|grid|' + S.sample; if (C.stats[key]) return C.stats[key];
    const rows = [{ k: 'reading', label: scoreName(spec), cells: FWD.map((h) => { const o = S.fwd; S.fwd = h; const st = lead(spec); S.fwd = o; return st.r2; }) }];
    for (const b of BACK) rows.push({ k: b, label: `Trailing ${b}-month relative return`, cells: FWD.map((h) => panel(spec, b, h).fit) });
    C.stats[key] = rows; return rows;
  };
  const r2fmt = (f) => (f ? (f.r2 * 100).toFixed(f.r2 < 0.1 ? 1 : 0) + '%' : '—');
  // monthly reading against the next S.fwd months' relative return, with the reading split into fifths
  const lead = (spec) => {
    const H = S.fwd, key = spec.id + '|' + H + '|' + S.sample, from = sampleStart(); if (C.stats[key]) return C.stats[key];
    const all = scoreOf(spec), rel = relOf(spec);
    const byMonth = new Map(); for (const p of all) byMonth.set(p[0].getUTCFullYear() * 12 + p[0].getUTCMonth(), p);
    const sc = [...byMonth.values()];
    const xs = [], ys = [], ds = [];
    const lastRel = rel.length ? rel[rel.length - 1][0] : null;
    for (const [d, v] of sc) {
      if (from && d < from) continue;
      const d12 = new Date(d); d12.setUTCMonth(d12.getUTCMonth() + H);
      if (!lastRel || lastRel < d12) continue;
      const r0 = at(rel, d), r1 = at(rel, d12);
      if (r0 && r1) { xs.push(v); ys.push(r1 / r0 - 1); ds.push(d); }
    }
    const ic = spearman(xs, ys), t = tstat(ic, xs.length, H), r2 = rsq(xs, ys), curNow = all.length ? all[all.length - 1][1] : null;
    let buckets = [];
    if (xs.length >= 30) {
      const srt = xs.slice().sort((a, b) => a - b), q = (p) => srt[Math.min(srt.length - 1, Math.floor(p * srt.length))];
      const cuts = [-Infinity, q(0.2), q(0.4), q(0.6), q(0.8), Infinity];
      buckets = [0, 1, 2, 3, 4].map((i) => {
        const idx = xs.map((x, k) => k).filter((k) => xs[k] >= cuts[i] && (i === 4 ? true : xs[k] < cuts[i + 1]));
        const r = idx.map((k) => ys[k]);
        return { i, lo: i ? cuts[i] : Math.min(srt[0], isNum(curNow) ? curNow : srt[0]), hi: i < 4 ? cuts[i + 1] : Math.max(srt[srt.length - 1], isNum(curNow) ? curNow : -Infinity), n: r.length, avg: r.length ? d3.mean(r) : null, hit: r.length ? r.filter((v) => v > 0).length / r.length : null };
      });
    }
    const cur = all.length ? all[all.length - 1][1] : null;
    const curB = buckets.length && isNum(cur) ? buckets.find((b, i) => (i === 0 ? cur < b.hi : i === 4 ? cur >= b.lo : cur >= b.lo && cur < b.hi)) : null;
    const spread = buckets.length ? buckets[4].avg - buckets[0].avg : null;
    const out = { ic, t, r2, n: xs.length, xs, ys, ds, buckets, cur, curB, spread, verdict: verdict(ic, t) };
    C.stats[key] = out;
    return out;
  };
  const specs = () => {
    const out = [];
    if (S.dim === 'Asset allocation') {
      if (C.model.sb && C.model.sb.length) out.push({ id: 'sb', kind: 'model', key: 'sb', a: 'ACWI', b: 'AGG', label: 'Stocks vs bonds', vs: 'AGG' });
      for (const [k, [a, b, l]] of Object.entries(LEVERS)) if (C.model['fi_' + k] && C.model['fi_' + k].length && C.px[a] && C.px[b]) out.push({ id: 'fi_' + k, kind: 'model', key: 'fi_' + k, a, b, label: l, vs: b });
      if (C.model.fx_DXY && C.px.DXUSD) out.push({ id: 'fx_DXY', kind: 'model', key: 'fx_DXY', a: 'DXUSD', b: null, label: 'The dollar index', vs: 'its own level' });
    } else if (S.dim === 'Real assets') {
      const ra = one('model_ra');
      for (const x of (ra && ra.assets) || []) if (C.px[x.etf] && C.px['6040']) out.push({ id: 'ra_' + x.etf, kind: 'model', key: 'ra_' + x.etf, a: x.etf, b: '6040', label: x.label + ' vs 60/40', vs: '60/40' });
    } else if (S.dim === 'Private markets') {
      const pmm = one('model_pm');
      for (const p of (pmm && pmm.pairs) || []) if (C.px[p.long] && C.px[p.short]) out.push({ id: 'pm_' + p.key, kind: 'model', key: 'pm_' + p.key, a: p.long, b: p.short, label: p.label, vs: p.short });
    } else if (S.dim === 'Currencies') {
      const fm = one('fx_model');
      for (const c of (fm && fm.currencies) || []) if (C.px[c.code] && C.model['fx_' + c.code] && C.model['fx_' + c.code].length) out.push({ id: 'fx_' + c.code, kind: 'model', key: 'fx_' + c.code, a: c.code, b: null, label: c.label + ' vs the dollar', vs: 'USD' });
    } else if (PAIR_DIMS[S.dim]) return PAIR_DIMS[S.dim].filter(([a, b]) => C.px[a] && C.px[b]).map(([a, b, l]) => ({ id: a + '|' + b, kind: PRICE_ONLY.has(S.dim) ? 'px' : 'pair', a, b, label: l, vs: b }));
    else {
      const bench = BENCH[S.dim];
      return (C.grp[S.dim] || []).filter((e) => (BENCH_OVR[e] || bench) !== e).map((e) => ({ id: e + '|' + (BENCH_OVR[e] || bench), kind: 'eq', a: e, b: BENCH_OVR[e] || bench, label: C.lab[e] || e, vs: BENCH_OVR[e] || bench }));
    }
    return out;
  };
  const fromDate = () => { const y = { '1Y': 1, '3Y': 3, '5Y': 5, '10Y': 10, '20Y': 20 }[S.range]; if (!y) return null; const t = new Date(); t.setUTCFullYear(t.getUTCFullYear() - y); return t; };
  const chg = (s, months) => { if (!s.length) return null; const l = s[s.length - 1]; const d = new Date(l[0]); d.setUTCMonth(d.getUTCMonth() - months); const v = at(s, d); return v == null ? null : l[1] - v; };
  const relRet = (rel, months) => { if (!rel.length) return null; const l = rel[rel.length - 1]; const d = new Date(l[0]); d.setUTCMonth(d.getUTCMonth() - months); const v = at(rel, d); return v ? l[1] / v - 1 : null; };
  const scoreFmt = (spec) => (spec.kind === 'pair' ? (v) => (v >= 0 ? '+' : M) + Math.abs(v).toFixed(0) : spec.kind === 'model' ? (v) => (v >= 0 ? '+' : M) + Math.abs(v).toFixed(2) : (v) => v.toFixed(0));
  const scoreName = (spec) => (spec.kind === 'pair' ? 'Score gap' : spec.kind === 'model' ? 'Model signal' : 'Score');

  const pairChart = (box, spec, h1, h2, opts = {}) => {
    const from = fromDate();
    const sc = scoreOf(spec).filter((p) => !from || p[0] >= from);
    const rel = rebase(relOf(spec), from);
    const xdom = rel.length && sc.length ? [d3.min([rel[0][0], sc[0][0]]), d3.max([rel[rel.length - 1][0], sc[sc.length - 1][0]])] : undefined;
    const top = el('div'), bot = el('div');
    box.replaceChildren(top, bot);
    const isM = spec.kind === 'model';
    G.line(top, [{ name: scoreName(spec), pts: sc, color: 'var(--gm-blue)' }], { h: h1, xdom, ref: spec.kind === 'eq' ? 50 : 0, band: spec.kind === 'eq' ? [40, 60] : isM ? [-0.2, 0.2] : null, yfmt: scoreFmt(spec), fmt: scoreFmt(spec), labels: opts.labels, dfmt: '%b %Y', aria: 'Model score', ydom: isM ? [-1, 1] : undefined });
    G.line(bot, [{ name: spec.b ? spec.a + ' vs ' + spec.vs : spec.a, pts: rel, color: 'var(--gm-navy)' }], { h: h2, xdom, ref: 100, yfmt: (v) => v.toFixed(0), fmt: (v) => v.toFixed(1), labels: opts.labels, dfmt: '%b %-d, %Y', aria: 'Relative price' });
  };

  // predictiveness across the full range of readings: fifths of the score's history
  const bucketChart = (box, spec, st) => {
    box.replaceChildren();
    if (!st.buckets.length) { box.append(el('p', 'Not enough history to split the readings into fifths.', 'gm-note')); return; }
    const W = Math.max(280, box.clientWidth || 520), H = 210, m = { t: 22, r: 10, b: 46, l: 44 };
    const svg = d3.select(box).append('svg').attr('class', 'x-svg').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);
    const B = st.buckets, x = d3.scaleBand().domain(B.map((b) => b.i)).range([m.l, W - m.r]).padding(0.25);
    const ext = d3.extent(B.map((b) => b.avg).concat([0])), pad = (ext[1] - ext[0]) * 0.15 || 0.01;
    const y = d3.scaleLinear().domain([ext[0] - (ext[0] < 0 ? pad : 0), ext[1] + pad]).range([H - m.b, m.t]);
    svg.append('g').attr('class', 'x-grid').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r)).tickFormat('')).call((g) => g.select('.domain').remove());
    svg.append('g').attr('class', 'x-axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat((v) => (v > 0 ? '+' : v < 0 ? M : '') + Math.abs(v * 100).toFixed(0) + '%')).call((g) => g.select('.domain').remove());
    svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', 'var(--cds-chart-axis)');
    const f = scoreFmt(spec);
    const g = svg.selectAll('g.b').data(B).join('g').attr('class', 'b');
    g.append('rect').attr('x', (b) => x(b.i)).attr('width', x.bandwidth()).attr('y', (b) => Math.min(y(0), y(b.avg))).attr('height', (b) => Math.abs(y(b.avg) - y(0)) || 1)
      .attr('fill', (b) => (b.avg >= 0 ? 'var(--color-ok)' : 'var(--color-bad)')).attr('opacity', (b) => (b === st.curB ? 0.95 : 0.45))
      .attr('stroke', (b) => (b === st.curB ? 'var(--color-fg)' : 'none')).attr('stroke-width', 1.5);
    g.append('text').attr('x', (b) => x(b.i) + x.bandwidth() / 2).attr('y', (b) => (b.avg >= 0 ? y(b.avg) - 5 : y(b.avg) + 13)).attr('text-anchor', 'middle').attr('class', 'x-lab2')
      .text((b) => `${Math.round(b.hit * 100)}% won`);
    g.append('text').attr('x', (b) => x(b.i) + x.bandwidth() / 2).attr('y', H - m.b + 15).attr('text-anchor', 'middle').attr('class', 'x-lab').style('fill', 'var(--color-fg-muted)').text((b) => ['Lowest fifth', '2nd', 'Middle', '4th', 'Highest fifth'][b.i]);
    g.append('text').attr('x', (b) => x(b.i) + x.bandwidth() / 2).attr('y', H - m.b + 29).attr('text-anchor', 'middle').attr('class', 'x-lab').style('fill', 'var(--color-fg-muted)').text((b) => `${f(b.lo)} to ${f(b.hi)}`);
    if (st.curB) svg.append('text').attr('x', x(st.curB.i) + x.bandwidth() / 2).attr('y', 12).attr('text-anchor', 'middle').attr('class', 'x-lab2').style('font-weight', 600).text('Now: ' + f(st.cur));
    g.on('pointerenter', (ev, b) => G.showTip(ev, [`${['Lowest fifth', 'Second fifth', 'Middle fifth', 'Fourth fifth', 'Highest fifth'][b.i]} of readings (${f(b.lo)} to ${f(b.hi)})`, `Next ${S.fwd} months, relative: average ${pct(b.avg)}`, `Beat ${spec.vs}: ${Math.round(b.hit * 100)}% of ${b.n} months`])).on('pointerleave', G.hideTip);
  };
  // every month's reading against what followed
  const scatter = (box, spec, st) => {
    box.replaceChildren(); if (st.xs.length < 24) return;
    const W = Math.max(280, box.clientWidth || 520), H = 190, m = { t: 10, r: 10, b: 30, l: 44 };
    const svg = d3.select(box).append('svg').attr('class', 'x-svg').attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain(d3.extent(st.xs.concat(isNum(st.cur) ? [st.cur] : []))).nice().range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain(d3.extent(st.ys)).nice().range([H - m.b, m.t]);
    svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat(spec.kind === 'trail' ? (v) => (v > 0 ? '+' : v < 0 ? M : '') + Math.abs(v * 100).toFixed(0) + '%' : scoreFmt(spec)));
    svg.append('g').attr('class', 'x-axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat((v) => (v > 0 ? '+' : v < 0 ? M : '') + Math.abs(v * 100).toFixed(0) + '%'));
    svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('class', 'x-ref');
    const recent = st.ds.length ? +st.ds[st.ds.length - 1] - 3 * 365 * 864e5 : 0;
    svg.append('g').selectAll('circle').data(st.xs.map((v, i) => [v, st.ys[i], st.ds[i]])).join('circle').attr('cx', (d) => x(d[0])).attr('cy', (d) => y(d[1])).attr('r', 2.6)
      .attr('fill', (d) => (+d[2] >= recent ? 'var(--gm-navy)' : 'var(--gm-blue2)')).attr('opacity', 0.6);
    // least-squares line
    const n = st.xs.length, mx = d3.mean(st.xs), my = d3.mean(st.ys); let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (st.xs[i] - mx) * (st.ys[i] - my); sxx += (st.xs[i] - mx) ** 2; }
    const b1 = sxx ? sxy / sxx : 0, x0 = x.domain()[0], x1 = x.domain()[1];
    svg.append('line').attr('x1', x(x0)).attr('x2', x(x1)).attr('y1', y(my + b1 * (x0 - mx))).attr('y2', y(my + b1 * (x1 - mx))).attr('stroke', 'var(--color-fg)').attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');
    if (isNum(st.cur)) { svg.append('line').attr('x1', x(st.cur)).attr('x2', x(st.cur)).attr('y1', m.t).attr('y2', H - m.b).attr('stroke', 'var(--color-warn)').attr('stroke-width', 1.5); svg.append('text').attr('x', x(st.cur) + 4).attr('y', m.t + 10).attr('class', 'x-lab2').text('now'); }
  };

  G.page('reltrend', (sec) => {
    const grid = $('#rt-grid', sec), focus = $('#rt-focus', sec), tbl = $('#rt-table', sec);
    const need = MODEL_DIMS.has(S.dim) ? ['model_sb', 'model_fi', 'model_ra', 'fx_model', 'model_pm', 'xasset_weekly', 'etf_weekly', 'etf_universe'] : PRICE_ONLY.has(S.dim) ? ['xasset_weekly', 'etf_weekly', 'etf_universe'] : ['sleeve_series', 'score_history', 'etf_weekly', 'etf_universe'];
    G.seg($('#rt-dim', sec), DIMS, S.dim, (v) => { S.dim = v; S.sel = null; G.redraw(); });
    G.seg($('#rt-range', sec), [['1Y', '1Y'], ['3Y', '3Y'], ['5Y', '5Y'], ['10Y', '10Y'], ['20Y', '20Y'], ['All', 'All']], S.range, (v) => { S.range = v; G.redraw(); });
    G.seg($('#rt-fwd', sec), FWD.map((h) => [String(h), h + 'M']), String(S.fwd), (v) => { S.fwd = Number(v); G.redraw(); });
    G.seg($('#rt-sample', sec), SAMPLES, S.sample, (v) => { S.sample = v; G.redraw(); });
    if (need.some(G.bad)) { G.failed(grid, 'The score or price history'); return; }
    if (!need.every(G.ok)) { G.placeholder(grid); G.placeholder(focus); return; }
    build();
    const list = specs();
    if (!list.length) { G.placeholder(grid, 'Nothing to show in this dimension yet.'); return; }
    const sel = list.find((s) => s.id === S.sel) || list[0];
    $('#rt-dim-note', sec).textContent = PRICE_ONLY.has(S.dim) ? 'Price-only pairs: no model makes these calls, so there is no reading on top; the R² grid and the trailing-return scatter show whether each relative trend has tended to persist or reverse.'
      : S.dim === 'Private markets' ? 'Listed proxies for private markets, each against what it would replace: BDCs (BIZD) against high yield and listed private equity (PSP) against global equities. The signal (−1 to +1) uses only inputs that passed the evidence test; listed proxies move more than the private funds they stand in for.'
      : PAIR_DIMS[S.dim]
      ? 'Each pair shows the gap between the two sleeves’ composite scores (positive favors the first) above the price of the first relative to the second, rebased to 100.'
      : S.dim === 'Asset allocation' ? 'Each allocation model’s signal (−1 to +1; positive favors the first leg) above the price of the first leg relative to the second, rebased to 100. Stocks vs bonds is ACWI against AGG; each fixed income lever is the fund it buys against the Treasury fund that pays for it; the dollar index is shown on its own.'
      : S.dim === 'Real assets' ? 'Each diversifier’s score (−1 to +1) above its price relative to a 60/40 mix of ACWI and AGG, rebased to 100.'
      : S.dim === 'Currencies' ? 'Each currency model’s combined view (60% cyclical, 40% long-term; −1 to +1, positive expects the currency to gain) above the currency in dollars, rebased to 100.'
      : `Each sleeve’s composite score (0 to 100; the shaded band is 40 to 60, neutral) above its price relative to ${BENCH[S.dim]}${S.dim === 'Intl style & size' ? ' (EM ex-China against EEM)' : ''}, rebased to 100.`;

    // focus chart and the diagnostics
    const st = lead(sel), sc = scoreOf(sel), rel = relOf(sel), f = scoreFmt(sel);
    $('#rt-focus-h', sec).textContent = sel.label + (sel.b ? ` (${sel.a} vs ${sel.vs})` : ` (${sel.a})`);
    pairChart(focus, sel, 220, 200, {});
    const vd = $('#rt-verdict', sec);
    if (vd) { vd.textContent = st.verdict[0]; vd.className = 'x-rt-verdict x-dchip x-dchip-' + st.verdict[1]; }
    const facts = [];
    const smp = st.ds.length ? `${G.mon(st.ds[0].toISOString())} to ${G.mon(st.ds[st.ds.length - 1].toISOString())}` : '';
    if (smp) facts.push(`**Sample:** readings from ${smp}${S.sample === 'All' ? ' (all history)' : ` (last ${S.sample} years)`}, each matched with the ${S.fwd} months that followed.`);
    if (isNum(st.ic)) facts.push(`**Overall:** rank correlation between the monthly reading and the next ${S.fwd} months’ relative return is **${fx(st.ic, 2)}** over ${st.n} months (about ${Math.max(1, Math.round(st.n / S.fwd))} independent ${S.fwd}-month periods; t ${fx(st.t, 1)})${st.r2 ? `; the reading explains **${r2fmt(st.r2)}** of the variation (R²)` : ''}. As a guide: 0.05 to 0.15 is weak, 0.15 to 0.3 useful, above 0.3 strong; a t of 2 or more is statistically meaningful.`);
    if (isNum(st.spread)) facts.push(`**Across the range:** the highest fifth of readings was followed by ${pct(st.buckets[4].avg)} relative over ${S.fwd} months on average, the lowest fifth by ${pct(st.buckets[0].avg)}: a spread of **${pct(st.spread)}**${st.buckets.every((b, i) => !i || b.avg >= st.buckets[i - 1].avg) ? ', rising steadily from bottom to top' : st.buckets.every((b, i) => !i || b.avg <= st.buckets[i - 1].avg) ? ', falling steadily from bottom to top' : ', but not in a straight line'}.`);
    if (st.curB) facts.push(`**At today’s reading (${f(st.cur)}):** it sits in the ${['lowest', 'second', 'middle', 'fourth', 'highest'][st.curB.i]} fifth (${f(st.curB.lo)} to ${f(st.curB.hi)}). Months there were followed by **${pct(st.curB.avg)}** against ${sel.vs} on average and **won ${Math.round(st.curB.hit * 100)}% of the time** (${st.curB.n} months).`);
    if (sc.length) { const c3 = chg(sc, 3), tiny = isNum(c3) && Math.abs(c3) < (sel.kind === 'model' ? 0.005 : 0.5); facts.push(`${scoreName(sel)} ${!isNum(c3) ? 'with no three-month history' : tiny ? 'unchanged over three months' : (c3 >= 0 ? 'up ' : 'down ') + f(Math.abs(c3)).replace(/^[+−]/, '') + ' over three months'}; relative performance ${pct(relRet(rel, 3))} over three months, ${pct(relRet(rel, 12))} over a year.`); }
    facts.push(sel.kind === 'model' ? 'Signals are the model’s own month-end readings using only data available at the time. Overlapping ' + S.fwd + '-month windows mean month counts overstate the independent evidence, and R² on overlapping windows looks better than it is: treat 24 and 36 months with extra caution.' : 'Scores before the live record are the backtest’s point-in-time scores, monthly; overlapping ' + S.fwd + '-month windows mean the month counts overstate the independent evidence, and R² at 24 and 36 months more so.');
    $('#rt-facts', sec).replaceChildren(...facts.map(G.li));
    bucketChart($('#rt-buckets', sec), sel, st);
    scatter($('#rt-scatter', sec), sel, st);
    $('#rt-bk-h', sec).textContent = `Next ${S.fwd} months, by fifth of the reading`;
    $('#rt-sc-h', sec).textContent = `Every month: reading against the next ${S.fwd} months`;
    // R² grid: the reading and every trailing relative return, against each forward horizon
    const grid2 = r2grid(sel), gt = $('#rt-r2', sec);
    if (gt) {
      const hr = el('tr'); hr.append(el('th', 'Predictor', 'x-txt'), ...FWD.map((h) => { const th = el('th', `Next ${h}M`, 'gm-num'); if (h === S.fwd) th.classList.add('x-r2-on'); return th; }));
      gt.tHead.replaceChildren(hr);
      gt.tBodies[0].replaceChildren(...grid2.map((r) => {
        const tr = el('tr'); if (r.k === S.back || r.k === 'reading') tr.classList.add(r.k === 'reading' ? 'x-r2-read' : 'x-r2-row');
        tr.append(el('td', r.label));
        FWD.forEach((h, i) => { const f = r.cells[i]; const td = el('td', f ? (f.sign < 0 ? '−' : '+') + ' ' + r2fmt(f) : '—', 'gm-num x-r2c');
          if (f) { const a = Math.min(1, Math.sqrt(f.r2 / 0.25)); td.style.background = `color-mix(in srgb, ${f.sign < 0 ? 'var(--color-bad)' : 'var(--color-ok)'} ${Math.round(a * 45)}%, transparent)`; td.title = `R² ${(f.r2 * 100).toFixed(1)}%, correlation ${fx(f.r, 2)}, ${f.n} months`; }
          if (h === S.fwd && (r.k === S.back || r.k === 'reading')) td.classList.add('x-r2-sel');
          tr.append(td); });
        tr.style.cursor = r.k === 'reading' ? 'default' : 'pointer';
        if (r.k !== 'reading') tr.onclick = () => { S.back = r.k; G.redraw(); };
        return tr;
      }));
    }
    const pn = panel(sel, S.back, S.fwd);
    $('#rt-sc2-h', sec).textContent = `Trailing ${S.back}-month relative return against the next ${S.fwd} months`;
    scatter($('#rt-scatter2', sec), { ...sel, kind: 'trail' }, { xs: pn.xs, ys: pn.ys, ds: pn.ds, cur: (() => { const r = relOf(sel); return r.length ? relRet(r, S.back) : null; })() });
    $('#rt-sc2-note', sec).textContent = pn.fit
      ? `R² ${r2fmt(pn.fit)} over ${pn.fit.n} months${S.sample === 'All' ? '' : ` in the last ${S.sample} years`} (correlation ${fx(pn.fit.r, 2)}): ${pn.fit.r2 < 0.02 ? 'the trailing return says almost nothing about what follows' : pn.fit.sign > 0 ? `${sel.a} has tended to keep going: past winners kept winning over the next ${S.fwd} months` : `${sel.a} has tended to reverse: past winners lagged over the next ${S.fwd} months`}. Dark dots are the last three years; the orange line is today’s trailing return.`
      : 'Not enough price history for this pair of horizons.';

    // small multiples
    grid.replaceChildren(...list.map((s) => {
      const card = el('button', null, 'x-card' + (s === sel ? ' x-card-on' : '')); card.type = 'button';
      const ssc = scoreOf(s), rr = relOf(s), ls = lead(s);
      const h = el('div', null, 'x-card-h'); h.append(el('span', s.label, 'x-card-t'), el('span', ssc.length ? scoreFmt(s)(ssc[ssc.length - 1][1]) : '—', 'x-card-v'));
      const sub = el('div', `${pct(relRet(rr, 12))} vs ${s.vs}, 1Y · lead ${fx(ls.ic, 2)}`, 'gm-note');
      const ch = el('div', null, 'x-card-c');
      card.append(h, sub, ch);
      card.addEventListener('click', () => { S.sel = s.id; G.redraw(); $('#rt-focus-h', sec).scrollIntoView({ block: 'nearest' }); });
      return card;
    }));
    for (const [i, s] of list.entries()) pairChart(grid.children[i].querySelector('.x-card-c'), s, 90, 80, { labels: false });

    // table
    G.table(tbl, [
      { t: PAIR_DIMS[S.dim] ? 'Pair' : 'Call', f: (s) => s.label }, { t: 'Against', f: (s) => s.vs },
      { t: 'Reading now', num: true, f: (s) => { const x = scoreOf(s); return x.length ? scoreFmt(s)(x[x.length - 1][1]) : '—'; } },
      { t: '3M change', num: true, f: (s) => { const v = chg(scoreOf(s), 3); return isNum(v) ? (s.kind === 'eq' ? (Math.round(v) > 0 ? '+' : Math.round(v) < 0 ? M : '') + Math.abs(Math.round(v)) : scoreFmt(s)(v)) : '—'; } },
      { t: 'Relative 1Y', num: true, f: (s) => pct(relRet(relOf(s), 12)), cls: (s) => G.tone(relRet(relOf(s), 12), 0.001) },
      { t: 'How predictive', f: (s) => lead(s).verdict[0].split(',')[0].replace(': high readings were followed by underperformance', '') },
      { t: `R², reading → ${S.fwd}M`, num: true, title: 'Share of the variation in forward relative returns explained by the reading (sign: direction of the relationship)', f: (s) => { const f = lead(s).r2; return f ? (f.sign < 0 ? M : '+') + r2fmt(f) : '—'; } },
      { t: `R², trailing ${S.back}M → ${S.fwd}M`, num: true, title: 'Share of the variation in forward relative returns explained by the trailing relative return (+ trend persists, − it reverses)', f: (s) => { const f = panel(s, S.back, S.fwd).fit; return f ? (f.sign < 0 ? M : '+') + r2fmt(f) : '—'; } },
      { t: 'Lead correlation', num: true, title: `Rank correlation of the monthly reading with the next ${S.fwd} months’ relative return`, f: (s) => fx(lead(s).ic, 2), cls: (s) => G.tone(lead(s).ic, 0.05) },
      { t: 'Top minus bottom fifth', num: true, title: `Average next-${S.fwd}-month relative return after the highest fifth of readings, less after the lowest fifth`, f: (s) => pct(lead(s).spread), cls: (s) => G.tone(lead(s).spread, 0.001) },
      { t: 'Won at today’s level', num: true, title: `Share of months in today’s fifth of readings that beat the comparison over the next ${S.fwd} months`, f: (s) => (lead(s).curB ? Math.round(lead(s).curB.hit * 100) + '%' : '—') },
      { t: 'Months', num: true, f: (s) => lead(s).n || '—' },
    ], list, { onRow: (s) => { S.sel = s.id; G.redraw(); } });
  });
})();
