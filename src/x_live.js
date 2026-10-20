// Live results: the model portfolio as published each week (live_log, written by live_log.py), compounded daily from the next
// trading day against the 60/40 reference (ACWI and the US Aggregate). Attribution by decision and by fund, realized against
// expected risk, and commentary written from the numbers. Look-back: since inception, 1 week, 1 month, 3 months, year to date,
// 1 year, or from any date. Data: live_log, etf_history, bond_history, multi_history and the live quotes; etf_universe and
// bond_stats for names.
(() => {
  const G = window.GMX;
  if (!G) return;
  const { el, $, isNum, ok, rows } = G;
  const LV = { h: 'inception', from: '' };
  const LIVE_DECISIONS = ['Stocks vs bonds', 'Equity country tilts', 'Holding country funds instead of ACWI', 'Fixed income tilts', 'Diversifiers'];
  const M = '\u2212';
  const fs = (v, d = 2) => (!isNum(v) ? '\u2014' : (v > 0 ? '+' : v < 0 ? M : '') + Math.abs(v * 100).toFixed(d) + '%');
  const pcl = (v, d = 2) => (!isNum(v) ? '\u2014' : (v < 0 ? M : '') + Math.abs(v * 100).toFixed(d) + '%');
  const sdl = (v, d = 1) => (!isNum(v) ? '\u2014' : (v >= 0 ? '+' : M) + Math.abs(v).toFixed(d));
  const lcd = (s) => s.replace(/^\w/, (c) => c.toLowerCase());
  let LCACHE = null, LKEY = null;
  // daily dividend-adjusted closes for every fund the portfolio can hold, plus today's move from the live quote
  const livePrices = () => {
    const P = new Map();
    for (const id of ['etf_history', 'bond_history', 'multi_history']) {
      if (!ok(id)) continue;
      for (const r of rows(id)) { if (!isNum(r.adjClose)) continue; if (!P.has(r.symbol)) P.set(r.symbol, new Map()); P.get(r.symbol).set(String(r.date).slice(0, 10), r.adjClose); }
    }
    const today = {};
    for (const id of ['etf_quotes', 'bond_quotes', 'multi_quotes']) {
      if (!ok(id)) continue;
      for (const q of rows(id)) if (isNum(q.price) && isNum(q.previousClose) && q.previousClose > 0 && isNum(q.timestamp)) today[q.symbol] = { r: q.price / q.previousClose - 1, d: new Date(q.timestamp * 1000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) };
    }
    return { P, today };
  };
  const liveSeries = () => {
    if (!ok('live_log')) return null;
    const J = (v) => (typeof v === 'string' && /^[\[{]/.test(v) ? JSON.parse(v) : v);   // nested fields arrive as JSON text
    const LOG = rows('live_log').map((l) => ({ ...l, hold: J(l.hold), ref: J(l.ref), comps: J(l.comps), exAnte: J(l.exAnte), eqTop: J(l.eqTop) })).sort((a, b) => (a.date < b.date ? -1 : 1));
    if (!LOG.length) return null;
    const { P, today } = livePrices();
    const cal = P.get('ACWI'); if (!cal) return null;
    let dates = [...cal.keys()].sort();
    const qd = today.ACWI && today.ACWI.d;
    const live = qd && qd > dates[dates.length - 1];
    if (live) dates.push(qd);
    const key = LOG.map((l) => l.date).join() + '|' + dates[dates.length - 1] + '|' + (live ? today.ACWI.r : '');
    if (LCACHE && LKEY === key) return LCACHE;
    // each entry's weights apply from the first trading day after its date
    const eff = LOG.map((l) => ({ ...l, from: dates.find((d) => d > l.date) }));
    const ret = (sym, i) => {
      const d = dates[i], p = dates[i - 1];
      if (live && i === dates.length - 1) return today[sym] ? today[sym].r : null;
      const m = P.get(sym); if (!m || !m.has(d) || !m.has(p)) return null;
      return m.get(d) / m.get(p) - 1;
    };
    const days = [], missing = new Set();
    for (let i = 1; i < dates.length; i++) {
      const d = dates[i]; const L = [...eff].reverse().find((l) => l.from && l.from <= d); if (!L) continue;
      const R = {}; for (const e of new Set([...Object.keys(L.hold), ...Object.keys(L.ref)])) { const r = ret(e, i); if (r === null) missing.add(e); R[e] = r === null ? 0 : r; }
      const dot = (m) => Object.entries(m).reduce((s, [e, w]) => s + w * (R[e] || 0), 0);
      const comp = {}; for (const k of LIVE_DECISIONS) comp[k] = L.comps[k] ? dot(L.comps[k]) : 0;
      // by fund: active weight times the fund's return over its asset class (ACWI for equity funds, the Agg for bond funds); the
      // asset-class split itself is the stocks vs bonds decision, so ACWI and the Agg show no fund contribution of their own
      const bondSet = new Set([...Object.keys(L.comps['Fixed income tilts'] || {}), 'AGG']), divSet = new Set(Object.keys(L.comps.Diversifiers || {}));
      const fund = {};
      for (const e of new Set([...Object.keys(L.hold), ...Object.keys(L.ref)])) {
        if (e === 'ACWI' || e === 'AGG') continue;
        const a = (L.hold[e] || 0) - (L.ref[e] || 0), cls = bondSet.has(e) ? (R.AGG || 0) : divSet.has(e) ? 0 : (R.ACWI || 0);
        fund[e] = a * ((R[e] || 0) - cls);
      }
      days.push({ d, m: dot(L.hold), b: dot(L.ref), comp, fund, entry: L.date, te: L.exAnte && L.exAnte.te, live: live && i === dates.length - 1 });
    }
    LCACHE = { days, log: LOG, missing: [...missing], live, start: eff[0].from }; LKEY = key;
    return LCACHE;
  };
  const windowDays = (S) => {
    const all = S.days; if (!all.length) return [];
    const last = all[all.length - 1].d, ld = new Date(last + 'T00:00:00Z');
    const back = (m, dd = 0) => { const x = new Date(ld); x.setUTCMonth(x.getUTCMonth() - m); x.setUTCDate(x.getUTCDate() - dd); return x.toISOString().slice(0, 10); };
    const from = { inception: '', w1: back(0, 7), m1: back(1), m3: back(3), ytd: last.slice(0, 4) + '-01-01', y1: back(12), custom: LV.from || '' }[LV.h] || '';
    return all.filter((x) => x.d > from || (from === '' && true));
  };
  const statsOfDays = (D) => {
    const n = D.length; if (!n) return null;
    const cum = (k) => D.reduce((g, x) => g * (1 + x[k]), 1) - 1;
    const sd = (a) => { const mu = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - mu) ** 2, 0) / Math.max(1, a.length - 1)); };
    const m = D.map((x) => x.m), b = D.map((x) => x.b), a = D.map((x) => x.m - x.b);
    const mb = b.reduce((s, x) => s + x, 0) / n, mm = m.reduce((s, x) => s + x, 0) / n;
    const cov = D.reduce((s, x) => s + (x.m - mm) * (x.b - mb), 0) / Math.max(1, n - 1), vb = sd(b) ** 2;
    const dd = (k) => { let g = 1, pk = 1, w = 0; for (const x of D) { g *= 1 + (typeof k === 'function' ? k(x) : x[k]); pk = Math.max(pk, g); w = Math.min(w, g / pk - 1); } return w; };
    const yrs = n / 252, ann = (c) => (yrs >= 1 ? (1 + c) ** (1 / yrs) - 1 : null);
    const cm = cum('m'), cb = cum('b');
    const te = sd(a) * Math.sqrt(252);
    const contrib = {}; for (const k of LIVE_DECISIONS) contrib[k] = D.reduce((s, x) => s + x.comp[k], 0);
    const fund = {}; for (const x of D) for (const [e, v] of Object.entries(x.fund)) fund[e] = (fund[e] || 0) + v;
    const exAnte = D.filter((x) => isNum(x.te)).map((x) => x.te);
    return { n, from: D[0].d, to: D[n - 1].d, cm, cb, ex: cm - cb, annM: ann(cm), annB: ann(cb), volM: sd(m) * Math.sqrt(252), volB: sd(b) * Math.sqrt(252), ddM: dd('m'), ddB: dd('b'), ddRel: dd((x) => x.m - x.b),
      te, ir: yrs >= 0.25 && te > 0 ? (a.reduce((s, x) => s + x, 0) / n * 252) / te : null, beta: vb > 0 ? cov / vb : null, corr: vb > 0 && sd(m) > 0 ? cov / (sd(m) * sd(b)) : null,
      hit: a.filter((x) => x > 0).length / n, best: Math.max(...a), worst: Math.min(...a), contrib, fund, exAnte: exAnte.length ? exAnte.reduce((s, x) => s + x, 0) / exAnte.length : null, live: D[n - 1].live };
  };
  // a simple kv table: head = column titles, rowsArr = arrays of cell text
  const kv = (tbl, head, rowsArr) => G.table(tbl, head.map((t, i) => ({ t, num: i > 0, f: (r) => r[i] })), rowsArr);
  const bullets = (ul, lines) => { if (ul) ul.replaceChildren(...lines.map((l) => G.li(l))); };
  const LAYOUT = "<div class=\"gm-block\">\n      <div class=\"gm-hrow\"><h2 class=\"gm-h2\">Live results: model portfolio against 60/40<button type=\"button\" class=\"gm-i\" data-info=\"liveTab\" aria-label=\"About the live results\">i</button></h2></div>\n      <div class=\"gm-barrow\"><span class=\"gm-label\">Look back</span><span class=\"gm-seg\" id=\"lv-h\"></span><label class=\"gm-field x-lvfrom\"><span class=\"gm-label\">From</span><input type=\"date\" id=\"lv-from\" min=\"2026-01-01\" max=\"2099-12-31\" aria-label=\"Start date\"></label></div>\n      <ul class=\"gm-bul\" id=\"lv-lead\" data-source=\"live_log\"></ul>\n    </div>\n    <div class=\"gm-grid2\">\n      <div class=\"gm-block\"><h3 class=\"gm-h3\">Growth of 100</h3><div class=\"gm-chart\" id=\"lv-cum\" data-source=\"live_log\" style=\"min-height:240px\"></div><h3 class=\"gm-h3\">Running difference from 60/40</h3><div class=\"gm-chart\" id=\"lv-rel\" data-source=\"live_log\" style=\"min-height:180px\"></div></div>\n      <div class=\"gm-block\"><h3 class=\"gm-h3\">Return and risk</h3><div class=\"gm-tablewrap\"><table class=\"gm-table gm-compact gm-static\" id=\"lv-stats\" data-source=\"live_log\"><thead></thead><tbody></tbody></table></div></div>\n    </div>\n    <div class=\"gm-grid2\">\n      <div class=\"gm-block\"><h3 class=\"gm-h3\">Attribution by decision</h3><div class=\"gm-tablewrap\"><table class=\"gm-table gm-compact gm-static\" id=\"lv-attr\" data-source=\"live_log\"><thead></thead><tbody></tbody></table></div><p class=\"gm-note\">Each decision&rsquo;s active weights times each fund&rsquo;s daily return, summed over the window. The decisions add up to each day&rsquo;s difference from 60/40 exactly; over several days compounding leaves a small residual, shown separately.</p></div>\n      <div class=\"gm-block\"><h3 class=\"gm-h3\">Largest contributions by fund</h3><div class=\"gm-tablewrap\"><table class=\"gm-table gm-compact gm-static\" id=\"lv-funds\" data-source=\"live_log\"><thead></thead><tbody></tbody></table></div><p class=\"gm-note\">Each fund&rsquo;s active weight times its return over its asset class: ACWI for equity funds, the US Aggregate for bond funds. How much sits in equities against bonds is the stocks vs bonds decision.</p></div>\n    </div>\n    <div class=\"gm-block\"><h3 class=\"gm-h3\">Portfolios published</h3><div class=\"gm-tablewrap\"><table class=\"gm-table gm-compact gm-static\" id=\"lv-log\" data-source=\"live_log\"><thead></thead><tbody></tbody></table></div><p class=\"gm-note\">Each weekly refresh records the portfolio the dashboard publishes at the default policy (60/40 neutral, &plusmn;15 points, no diversifier sleeve). It applies from the next trading day until the next refresh. Daily returns use dividend-adjusted closes, and today uses live prices; weights are held at the published level each day, with no trading costs. Backtests are on the Evidence pages and are kept apart from this record.</p></div>\n    <style>\n      #live .x-lvfrom{display:inline-flex;align-items:center;gap:.4rem;margin-left:.75rem}\n      #live .x-lvfrom input{font:inherit;font-size:.8125rem;padding:.15rem .35rem;border:1px solid var(--color-border-line);border-radius:4px;background:var(--color-bg);color:var(--color-fg)}\n      #live .gm-tablewrap{max-height:none!important}\n    </style>";
  G.page('live', (sec) => {
    if (!sec.querySelector('#lv-lead')) sec.innerHTML = LAYOUT;   // the page's own fixed markup, kept here so the main page file stays under its size limit
    const lead = $('#lv-lead', sec); if (!lead) return;
    G.seg($('#lv-h', sec), [['inception', 'Since inception'], ['w1', '1 week'], ['m1', '1 month'], ['m3', '3 months'], ['ytd', 'Year to date'], ['y1', '1 year']], LV.h, (v) => { LV.h = v; LV.from = ''; G.redraw(); });
    const fi = $('#lv-from', sec);
    if (fi && !fi._wired) { fi._wired = true; fi.addEventListener('change', () => { if (fi.value && fi.validity.valid) { LV.from = fi.value; LV.h = 'custom'; G.redraw(); } }); }
    if (fi && fi !== document.activeElement) fi.value = LV.h === 'custom' ? LV.from : '';
    if (!ok('live_log') || !ok('etf_history') || !ok('bond_history')) { G.placeholder(lead, G.bad('live_log') ? 'The live record didn\u2019t load.' : 'Loading the live record\u2026'); return; }
    const S = liveSeries();
    if (!S) { bullets(lead, ['No published portfolios recorded yet.']); return; }
    const D = windowDays(S), X = statsOfDays(D);
    const nm = new Map(); for (const u of rows('etf_universe')) nm.set(u.etf, u.label); if (ok('bond_stats')) for (const b of rows('bond_stats')) nm.set(b.etf, b.label);
    const lab = (e) => (nm.get(e) || e) + ' (' + e + ')';
    if (!X) {
      bullets(lead, [`**The live record starts with the portfolio published on ${G.mon(S.log[0].date)}.** Its first day of returns is ${S.start ? G.mon(S.start) : 'the next trading day'}; nothing has been earned or lost yet in this window.`]);
      for (const id of ['#lv-stats', '#lv-attr', '#lv-funds']) G.placeholder($(id, sec), 'No returns yet.');
      G.placeholder($('#lv-cum', sec), 'No returns yet.'); G.placeholder($('#lv-rel', sec), ' ');
    } else {
      const C = Object.entries(X.contrib).filter(([, v]) => Math.abs(v) > 1e-6).sort((a, b) => b[1] - a[1]);
      const F = Object.entries(X.fund).filter(([, v]) => Math.abs(v) > 1e-6).sort((a, b) => b[1] - a[1]);
      const noise = isNum(X.exAnte) ? X.exAnte * Math.sqrt(X.n / 252) : null;
      const b = [];
      b.push(`**${X.ex >= 0 ? 'Ahead' : 'Behind'} of 60/40 by ${pcl(Math.abs(X.ex), 2)}.** ${X.from === S.start ? 'Since the live record began on' : 'From'} ${G.mon(X.from)} ${X.from === S.start ? 'through' : 'to'} ${G.mon(X.to)}${X.live ? ' (today at live prices)' : ''}, ${X.n} trading day${X.n === 1 ? '' : 's'}: the model portfolio returned ${fs(X.cm)} against ${fs(X.cb)} for the reference.`);
      if (C.length) b.push(`**Biggest help: ${lcd(C[0][0])}** (${sdl(C[0][1] * 1e4, 0)}bp)${C.length > 1 && C[C.length - 1][1] < 0 ? `; biggest drag: ${lcd(C[C.length - 1][0])} (${sdl(C[C.length - 1][1] * 1e4, 0)}bp)` : ''}.${F.length ? ` By fund, ${lab(F[0][0])} added most${F[F.length - 1][1] < 0 ? ' and ' + lab(F[F.length - 1][0]) + ' cost most' : ''}.` : ''}`);
      if (isNum(noise)) b.push(`**${Math.abs(X.ex) < noise ? 'Within normal noise' : Math.abs(X.ex) < 2 * noise ? 'Notable, not yet significant' : 'Outside normal noise'}.** Expected tracking error is ${pcl(X.exAnte, 2)} a year, so over ${X.n} days a one-standard-deviation result is about \u00b1${pcl(noise, 2)}; the ${pcl(Math.abs(X.ex), 2)} ${X.ex >= 0 ? 'lead' : 'shortfall'} is ${Math.abs(X.ex) < noise ? 'inside it' : Math.abs(X.ex) < 2 * noise ? 'between one and two standard deviations' : 'more than two standard deviations: worth explaining'}.`);
      if (X.n >= 20) b.push(`**Risk as expected?** Realized tracking error ${pcl(X.te, 2)} against ${pcl(X.exAnte, 2)} expected; volatility ${pcl(X.volM, 1)} against ${pcl(X.volB, 1)} for 60/40${isNum(X.beta) ? `; beta ${X.beta.toFixed(2)}` : ''}.`);
      if (X.n < 63) b.push('**Too short to judge the models.** Under three months of live results; the record grows each week as the scheduled refresh adds the published portfolio.');
      if (S.missing.length) b.push(`No price on some days for ${S.missing.slice(0, 5).join(', ')}; those days count a zero return for the fund.`);
      bullets(lead, b);
      kv($('#lv-stats', sec), ['', 'Model', '60/40', 'Difference'], [
        ['Return over the window', fs(X.cm), fs(X.cb), fs(X.ex)],
        ['Return a year', isNum(X.annM) ? fs(X.annM) : 'under 1 year', isNum(X.annB) ? fs(X.annB) : '\u2014', isNum(X.annM) ? fs(X.annM - X.annB) : '\u2014'],
        ['Volatility, annualized', X.n >= 10 ? pcl(X.volM, 1) : '\u2014', X.n >= 10 ? pcl(X.volB, 1) : '\u2014', '\u2014'],
        ['Worst drawdown', fs(X.ddM), fs(X.ddB), '\u2014'],
        ['Tracking error, realized', X.n >= 10 ? pcl(X.te, 2) : '\u2014', '\u2014', '\u2014'],
        ['Tracking error, expected at the time', pcl(X.exAnte, 2), '\u2014', '\u2014'],
        ['Information ratio', isNum(X.ir) ? X.ir.toFixed(2) : 'under 3 months', '\u2014', '\u2014'],
        ['Beta to 60/40', isNum(X.beta) && X.n >= 10 ? X.beta.toFixed(2) : '\u2014', '1.00', '\u2014'],
        ['Days ahead of 60/40', pcl(X.hit, 0), '\u2014', '\u2014'],
        ['Best and worst day against 60/40', `${fs(X.best)} / ${fs(X.worst)}`, '\u2014', '\u2014'],
        ['Worst run behind 60/40', fs(X.ddRel), '\u2014', '\u2014'],
      ]);
      const sum = Object.values(X.contrib).reduce((s, v) => s + v, 0);
      kv($('#lv-attr', sec), ['Decision', 'Contribution', 'Share'], [...LIVE_DECISIONS.map((k) => [k, sdl(X.contrib[k] * 1e4) + 'bp', Math.abs(X.ex) > 1e-6 ? pcl(X.contrib[k] / X.ex, 0) : '\u2014']),
        ['Sum of daily contributions', sdl(sum * 1e4) + 'bp', '\u2014'], ['Compounding difference', sdl((X.ex - sum) * 1e4) + 'bp', '\u2014']]);
      const top = [...F.slice(0, 5), ...F.slice(-5).filter((x) => !F.slice(0, 5).includes(x))];
      const L0 = S.log[S.log.length - 1];
      kv($('#lv-funds', sec), ['Fund', 'Active weight now', 'Contribution against its asset class'], top.map(([e, v]) => [lab(e), sdl(((L0.hold[e] || 0) - (L0.ref[e] || 0)) * 100) + '%', sdl(v * 1e4) + 'bp']));
      let gm = 100, gb = 100; const pm = [], pb = [], pr = [];
      const d0 = new Date(D[0].d + 'T00:00:00Z'); d0.setUTCDate(d0.getUTCDate() - 1); pm.push([d0, 100]); pb.push([d0, 100]); pr.push([d0, 0]);
      for (const x of D) { gm *= 1 + x.m; gb *= 1 + x.b; const d = new Date(x.d + 'T00:00:00Z'); pm.push([d, gm]); pb.push([d, gb]); pr.push([d, gm / gb - 1]); }
      G.line($('#lv-cum', sec), [{ name: 'Model', color: G.PAL ? G.PAL[0] : 'var(--gm-blue)', pts: pm }, { name: '60/40', color: '#7c8798', pts: pb }], { h: 240, ref: 100, fmt: (v) => v.toFixed(2) });
      G.line($('#lv-rel', sec), [{ name: 'Model less 60/40', color: G.PAL ? G.PAL[0] : 'var(--gm-blue)', pts: pr }], { h: 180, ref: 0, yfmt: d3.format('+.2%'), fmt: (v) => fs(v) });
    }
    kv($('#lv-log', sec), ['Published', 'Equities', 'Fixed income', 'Largest equity tilts', 'Expected tracking error', 'Models as of'], S.log.slice().reverse().map((l) => [G.mon(l.date), pcl(l.equityWeight, 1), pcl(l.bondWeight, 1), (l.eqTop || []).join(', ') || '\u2014', pcl(l.exAnte && l.exAnte.te, 2), String(l.modelsAsOf || '').slice(0, 7)]));
  });
})();
