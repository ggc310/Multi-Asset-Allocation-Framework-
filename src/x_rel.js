// Decide → Relative trends. For every relative dimension of the equity model (core, styles and size,
// factors, sectors, industries, countries, regions, and classic pairs), the model's composite score over
// time paired with the sleeve's price relative to its benchmark, so you can see whether the score led.
// Data: sleeve_series (monthly point-in-time scores since 2005), score_history (weekly live scores),
// etf_weekly (weekly closes since 2005), etf_universe (labels and groups).
(() => {
  const G = window.GMX, { el, $, isNum, pct, fx } = G;
  const BENCH = { 'Core': 'ACWI', 'US style & size': 'SPY', 'US factors': 'SPY', 'Intl style & size': 'EFA', 'Sectors': 'SPY', 'Industries': 'SPY', 'Developed countries': 'EFA', 'Emerging countries': 'EEM' };
  const BENCH_OVR = { EMXC: 'EEM', ACWI: 'SPY' };
  const PAIRS = [['IWF', 'IWD', 'US growth vs value'], ['IWM', 'SPY', 'US small vs large'], ['RSP', 'SPY', 'Equal weight vs cap weight'], ['QQQ', 'SPY', 'Nasdaq-100 vs S&P 500'],
    ['IWO', 'IWN', 'Small growth vs small value'], ['MTUM', 'USMV', 'Momentum vs min volatility'], ['QUAL', 'SPY', 'Quality vs market'], ['XLY', 'XLP', 'Cyclicals vs defensives (XLY/XLP)'],
    ['ACWX', 'SPY', 'Global ex-US vs US'], ['EFA', 'SPY', 'Intl developed vs US'], ['EEM', 'EFA', 'Emerging vs developed'], ['EFG', 'EFV', 'Intl growth vs value'], ['SCZ', 'EFA', 'Intl small vs large'], ['EMXC', 'MCHI', 'EM ex-China vs China']];
  const S = { dim: 'Pairs', range: '10Y', sel: null };
  let C = null;
  const build = () => {
    const ss = G.rows('sleeve_series'), sh = G.rows('score_history'), wk = G.rows('etf_weekly'), uni = G.rows('etf_universe');
    if (C && C.ss === ss && C.sh === sh && C.wk === wk) return C;
    const D = (s) => new Date(String(s).slice(0, 10) + 'T12:00:00Z');
    const score = {};
    for (const r of ss) if (isNum(r.composite)) (score[r.etf] = score[r.etf] || []).push([D(r.month), Number(r.composite)]);
    for (const k in score) score[k].sort((a, b) => a[0] - b[0]);
    for (const r of sh) {
      const v = r.cmp_equal_contra ?? r.composite; if (!isNum(v)) continue;
      const s = (score[r.etf] = score[r.etf] || []); const d = D(r.date);
      if (!s.length || d > s[s.length - 1][0]) s.push([d, Number(v)]); else if (+d === +s[s.length - 1][0]) s[s.length - 1][1] = Number(v);
    }
    const px = {};
    for (const r of wk) if (isNum(r.close)) (px[r.symbol] = px[r.symbol] || []).push([D(r.date), Number(r.close)]);
    for (const k in px) px[k].sort((a, b) => a[0] - b[0]);
    const lab = Object.fromEntries(uni.map((u) => [u.etf, u.label]));
    const grp = {}; for (const u of uni) (grp[u.group] = grp[u.group] || []).push(u.etf);
    C = { ss, sh, wk, score, px, lab, grp, stats: {} };
    return C;
  };
  const at = (s, d) => { if (!s || !s.length || s[0][0] > d) return null; let lo = 0, hi = s.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m][0] <= d) lo = m; else hi = m - 1; } return s[lo][1]; };
  const ratio = (a, b) => { const A = C.px[a], B = C.px[b]; if (!A || !B) return []; const bm = new Map(B.map((p) => [+p[0], p[1]])); return A.filter((p) => bm.has(+p[0])).map((p) => [p[0], p[1] / bm.get(+p[0])]); };
  const scoreOf = (spec) => {
    if (spec.b && spec.pair) { const A = C.score[spec.a], B = C.score[spec.b]; if (!A || !B) return []; return A.map((p) => { const v = at(B, p[0]); return v == null ? null : [p[0], p[1] - v]; }).filter(Boolean); }
    return C.score[spec.a] || [];
  };
  const rebase = (s, from) => { const c = from ? s.filter((p) => p[0] >= from) : s; if (!c.length) return []; const b = c[0][1]; return c.map((p) => [p[0], (100 * p[1]) / b]); };
  const spearman = (x, y) => {
    const rk = (v) => { const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r = new Array(v.length); o.forEach(([, i], k) => { r[i] = k; }); return r; };
    if (x.length < 24) return null; const a = rk(x), b = rk(y), n = x.length; let d = 0; for (let i = 0; i < n; i++) d += (a[i] - b[i]) ** 2; return 1 - (6 * d) / (n * (n * n - 1));
  };
  // does the score lead? monthly score vs the next 12 months' relative return
  const lead = (spec) => {
    const key = spec.a + '|' + spec.b + '|' + (spec.pair ? 1 : 0);
    if (C.stats[key]) return C.stats[key];
    const sc = scoreOf(spec).filter((p) => p[0].getUTCDate() >= 25 || p === undefined); // month-end points (backtest)
    const rel = ratio(spec.a, spec.b);
    const xs = [], ys = [];
    for (const [d, v] of sc) {
      const d12 = new Date(d); d12.setUTCFullYear(d12.getUTCFullYear() + 1);
      const r0 = at(rel, d), r1 = at(rel, d12);
      if (r0 && r1 && rel.length && rel[rel.length - 1][0] >= d12) { xs.push(v); ys.push(r1 / r0 - 1); }
    }
    const hi = spec.pair ? 10 : 60, lo = spec.pair ? -10 : 40;
    const H = ys.filter((_, i) => xs[i] >= hi), Lo = ys.filter((_, i) => xs[i] <= lo);
    const out = { ic: spearman(xs, ys), n: xs.length, hitHi: H.length >= 6 ? H.filter((r) => r > 0).length / H.length : null, nHi: H.length, hitLo: Lo.length >= 6 ? Lo.filter((r) => r < 0).length / Lo.length : null, nLo: Lo.length,
      avgHi: H.length >= 6 ? d3.mean(H) : null, avgLo: Lo.length >= 6 ? d3.mean(Lo) : null };
    C.stats[key] = out;
    return out;
  };
  const specs = () => {
    if (S.dim === 'Pairs') return PAIRS.filter(([a, b]) => C.px[a] && C.px[b]).map(([a, b, l]) => ({ a, b, label: l, pair: true }));
    const bench = BENCH[S.dim];
    return (C.grp[S.dim] || []).filter((e) => (BENCH_OVR[e] || bench) !== e).map((e) => ({ a: e, b: BENCH_OVR[e] || bench, label: C.lab[e] || e }));
  };
  const fromDate = () => { const y = { '3Y': 3, '5Y': 5, '10Y': 10 }[S.range]; if (!y) return null; const t = new Date(); t.setUTCFullYear(t.getUTCFullYear() - y); return t; };
  const chg = (s, months) => { if (!s.length) return null; const l = s[s.length - 1]; const d = new Date(l[0]); d.setUTCMonth(d.getUTCMonth() - months); const v = at(s, d); return v == null ? null : l[1] - v; };
  const relRet = (rel, months) => { if (!rel.length) return null; const l = rel[rel.length - 1]; const d = new Date(l[0]); d.setUTCMonth(d.getUTCMonth() - months); const v = at(rel, d); return v ? l[1] / v - 1 : null; };
  const scoreFmt = (spec) => (spec.pair ? (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(0) : (v) => v.toFixed(0));

  const pairChart = (box, spec, h1, h2, opts = {}) => {
    const from = fromDate();
    const sc = scoreOf(spec).filter((p) => !from || p[0] >= from);
    const rel = rebase(ratio(spec.a, spec.b), from);
    const xdom = rel.length && sc.length ? [d3.min([rel[0][0], sc[0][0]]), d3.max([rel[rel.length - 1][0], sc[sc.length - 1][0]])] : undefined;
    const top = el('div'), bot = el('div');
    box.replaceChildren(top, bot);
    G.line(top, [{ name: spec.pair ? 'Score gap' : 'Score', pts: sc, color: 'var(--gm-blue)' }], { h: h1, xdom, ref: spec.pair ? 0 : 50, band: spec.pair ? null : [40, 60], yfmt: scoreFmt(spec), fmt: scoreFmt(spec), labels: opts.labels, dfmt: '%b %Y', aria: 'Model score' });
    G.line(bot, [{ name: spec.pair ? spec.a + '/' + spec.b : 'vs ' + spec.b, pts: rel, color: 'var(--gm-navy)' }], { h: h2, xdom, ref: 100, yfmt: (v) => v.toFixed(0), fmt: (v) => v.toFixed(1), labels: opts.labels, dfmt: '%b %-d, %Y', aria: 'Relative price' });
  };

  G.page('reltrend', (sec) => {
    const grid = $('#rt-grid', sec), focus = $('#rt-focus', sec), tbl = $('#rt-table', sec);
    const need = ['sleeve_series', 'score_history', 'etf_weekly', 'etf_universe'];
    if (need.some(G.bad)) { G.failed(grid, 'The score or price history'); return; }
    if (!need.every(G.ok)) { G.placeholder(grid); G.placeholder(focus); return; }
    build();
    const dims = [...Object.keys(BENCH).filter((g) => C.grp[g]), 'Pairs'];
    G.seg($('#rt-dim', sec), [['Pairs', 'Classic pairs'], ...dims.filter((d) => d !== 'Pairs').map((d) => [d, d])], S.dim, (v) => { S.dim = v; S.sel = null; G.redraw(); });
    G.seg($('#rt-range', sec), [['3Y', '3Y'], ['5Y', '5Y'], ['10Y', '10Y'], ['All', 'Since 2005']], S.range, (v) => { S.range = v; G.redraw(); });
    const list = specs();
    if (!list.length) { G.placeholder(grid, 'No sleeves in this dimension.'); return; }
    const sel = list.find((s) => s.a + '|' + s.b === S.sel) || list[0];
    $('#rt-dim-note', sec).textContent = S.dim === 'Pairs'
      ? 'Each pair shows the gap between the two sleeves’ composite scores (positive favors the first) above the price of the first relative to the second, rebased to 100.'
      : `Each sleeve’s composite score (0 to 100; the shaded band is 40 to 60, neutral) above its price relative to ${BENCH[S.dim]}${S.dim === 'Intl style & size' ? ' (EM ex-China against EEM)' : ''}, rebased to 100.`;

    // focus chart
    const st = lead(sel), sc = scoreOf(sel), rel = ratio(sel.a, sel.b);
    $('#rt-focus-h', sec).textContent = sel.label + (sel.pair ? ` (${sel.a} vs ${sel.b})` : ` (${sel.a} vs ${sel.b})`);
    pairChart(focus, sel, 220, 200, {});
    const sf = scoreFmt(sel);
    const facts = [];
    if (sc.length) facts.push(`${sel.pair ? 'Score gap' : 'Score'} now ${sf(sc[sc.length - 1][1])}, ${isNum(chg(sc, 3)) ? (chg(sc, 3) >= 0 ? 'up ' : 'down ') + Math.abs(chg(sc, 3)).toFixed(0) + ' points over three months' : 'no three-month history'}.`);
    if (rel.length) facts.push(`Relative performance: ${pct(relRet(rel, 3))} over three months, ${pct(relRet(rel, 12))} over a year.`);
    if (isNum(st.ic)) facts.push(`**Did the score lead?** Rank correlation between the monthly score and the next 12 months’ relative return: ${fx(st.ic, 2)} over ${st.n} months since 2005 (**${Math.abs(st.ic) < 0.1 ? 'little evidence either way' : st.ic > 0 ? 'higher scores were followed by outperformance' : 'higher scores were followed by underperformance'}**).`);
    if (isNum(st.hitHi)) facts.push(`When the ${sel.pair ? 'gap was +10 or more' : 'score was 60 or higher'}, the next 12 months **beat the benchmark ${Math.round(st.hitHi * 100)}% of the time** (${st.nHi} months, average ${pct(st.avgHi)}).`);
    if (isNum(st.hitLo)) facts.push(`When it was ${sel.pair ? '−10 or lower' : '40 or lower'}, it lagged ${Math.round(st.hitLo * 100)}% of the time (${st.nLo} months, average ${pct(st.avgLo)}).`);
    facts.push('Scores before the live record are the backtest’s point-in-time scores, monthly; overlapping 12-month windows mean the month counts overstate the independent evidence.');
    $('#rt-facts', sec).replaceChildren(...facts.map(G.li));

    // small multiples
    grid.replaceChildren(...list.map((s) => {
      const card = el('button', null, 'x-card' + (s === sel ? ' x-card-on' : '')); card.type = 'button';
      const ssc = scoreOf(s), rr = ratio(s.a, s.b);
      const h = el('div', null, 'x-card-h'); h.append(el('span', s.label, 'x-card-t'), el('span', ssc.length ? (s.pair ? 'gap ' : 'score ') + scoreFmt(s)(ssc[ssc.length - 1][1]) : '—', 'x-card-v'));
      const sub = el('div', `${pct(relRet(rr, 12))} vs ${s.b}, 1Y`, 'gm-note');
      const ch = el('div', null, 'x-card-c');
      card.append(h, sub, ch);
      card.addEventListener('click', () => { S.sel = s.a + '|' + s.b; G.redraw(); $('#rt-focus-h', sec).scrollIntoView({ block: 'nearest' }); });
      return card;
    }));
    for (const [i, s] of list.entries()) pairChart(grid.children[i].querySelector('.x-card-c'), s, 90, 80, { labels: false });

    // table for the dimension
    G.table(tbl, [
      { t: S.dim === 'Pairs' ? 'Pair' : 'Sleeve', f: (s) => s.label }, { t: 'Against', f: (s) => s.b },
      { t: S.dim === 'Pairs' ? 'Score gap' : 'Score', num: true, f: (s) => { const x = scoreOf(s); return x.length ? scoreFmt(s)(x[x.length - 1][1]) : '—'; } },
      { t: '3M change', num: true, f: (s) => { const v = chg(scoreOf(s), 3); return isNum(v) ? (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(0) : '—'; } },
      { t: 'Relative 3M', num: true, f: (s) => pct(relRet(ratio(s.a, s.b), 3)), cls: (s) => G.tone(relRet(ratio(s.a, s.b), 3), 0.001) },
      { t: 'Relative 1Y', num: true, f: (s) => pct(relRet(ratio(s.a, s.b), 12)), cls: (s) => G.tone(relRet(ratio(s.a, s.b), 12), 0.001) },
      { t: 'Lead correlation', num: true, title: 'Rank correlation of the monthly score with the next 12 months’ relative return, since 2005', f: (s) => fx(lead(s).ic, 2), cls: (s) => G.tone(lead(s).ic, 0.05) },
      { t: 'Hit rate, high score', num: true, f: (s) => (isNum(lead(s).hitHi) ? Math.round(100 * lead(s).hitHi) + '%' : '—') },
      { t: 'Hit rate, low score', num: true, f: (s) => (isNum(lead(s).hitLo) ? Math.round(100 * lead(s).hitLo) + '%' : '—') },
      { t: 'Months', num: true, f: (s) => lead(s).n || '—' },
    ], list, { onRow: (s) => { S.sel = s.a + '|' + s.b; G.redraw(); } });
  });
})();
