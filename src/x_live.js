// Live results: the model portfolios as published each week (live_log, written by live_log.py), compounded daily from the next
// trading day against the 60/40 reference (ACWI and the US Aggregate). Two versions share one record: the tracked portfolio (no
// diversifiers) and the same policy with a 10% diversifier sleeve; a toggle switches every section between them. Sections: what is
// being tracked (the portfolio at any published date), allocation over time, the investable universe and its changes, returns,
// attribution by decision and by fund, realized against expected risk, and commentary written from the numbers.
// Data: live_log, etf_history, bond_history, multi_history and the live quotes; etf_universe and bond_stats for names.
(() => {
  const G = window.GMX;
  if (!G) return;
  const { el, $, isNum, ok, rows } = G;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } } };
  const LV = { h: 'inception', from: '', v: store.get('gm-live-v') === 'div' ? 'div' : 'base', at: '', histView: 'class' };
  const VARIANTS = { base: { short: 'Tracked portfolio', long: 'the tracked portfolio (no diversifiers)' }, div: { short: 'With diversifiers', long: 'the portfolio with a 10% diversifier sleeve' } };
  const LIVE_DECISIONS = ['Stocks vs bonds', 'Equity country tilts', 'Sector, style and industry sleeves', 'Holding country funds instead of ACWI', 'Fixed income tilts', 'Diversifiers'];
  const CLASSES = [['equity', 'Equities'], ['fixedIncome', 'Fixed income'], ['diversifiers', 'Diversifiers']];
  const CLASS_COLOR = { equity: 'var(--gm-blue, #1f5fa8)', fixedIncome: '#7c8798', diversifiers: '#0f766e' };
  const M = '−';
  const fs = (v, d = 2) => (!isNum(v) ? '—' : (v > 0 ? '+' : v < 0 ? M : '') + Math.abs(v * 100).toFixed(d) + '%');
  const pcl = (v, d = 2) => (!isNum(v) ? '—' : (v < 0 ? M : '') + Math.abs(v * 100).toFixed(d) + '%');
  const sdl = (v, d = 1) => (!isNum(v) ? '—' : (v >= 0 ? '+' : M) + Math.abs(v).toFixed(d));
  const lcd = (s) => s.replace(/^\w/, (c) => c.toLowerCase());
  const J = (v) => (typeof v === 'string' && /^[\[{]/.test(v) ? JSON.parse(v) : v);   // nested fields arrive as JSON text
  let LCACHE = null, LKEY = null;

  // the record: every published entry, in date order, with nested fields parsed
  const logRows = () => rows('live_log').map((l) => ({ ...l, hold: J(l.hold), ref: J(l.ref), comps: J(l.comps), exAnte: J(l.exAnte), eqTop: J(l.eqTop), div: J(l.div), universe: J(l.universe), policy: J(l.policy), sleeves: J(l.sleeves) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  // one version of an entry: the tracked portfolio, or its with-diversifiers twin (null when that entry has none)
  const pick = (l, v) => (v === 'div' ? (l.div ? { ...l, ...l.div, ref: l.ref, isDiv: true } : null) : l);
  // which asset class a fund belongs to, from the entry's universe (older entries: from the decisions)
  const classOf = (l) => {
    const m = new Map();
    const U = l.universe;
    if (U) for (const [k] of CLASSES) for (const x of U[k] || []) if (!m.has(x.etf)) m.set(x.etf, k);
    for (const e of Object.keys((l.comps && l.comps['Fixed income tilts']) || {})) if (!m.has(e)) m.set(e, 'fixedIncome');
    for (const e of Object.keys((l.comps && l.comps.Diversifiers) || {})) if (!m.has(e) && e !== 'ACWI' && e !== 'AGG') m.set(e, 'diversifiers');
    m.set('ACWI', 'equity'); m.set('AGG', 'fixedIncome');
    return (e) => m.get(e) || 'equity';
  };

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
  const liveSeries = (v) => {
    if (!ok('live_log')) return null;
    const ALL = logRows();
    const LOG = ALL.map((l) => pick(l, v)).filter(Boolean);
    if (!LOG.length) return { days: [], log: [], all: ALL, missing: [], live: false, start: null };
    const { P, today } = livePrices();
    const cal = P.get('ACWI'); if (!cal) return null;
    let dates = [...cal.keys()].sort();
    const qd = today.ACWI && today.ACWI.d;
    const live = qd && qd > dates[dates.length - 1];
    if (live) dates.push(qd);
    const key = v + '|' + ALL.map((l) => l.date).join() + '|' + dates[dates.length - 1] + '|' + (live ? today.ACWI.r : '');
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
      const R = {}; for (const e of new Set([...Object.keys(L.hold), ...Object.keys(L.ref)])) { const r = ret(e, i); if (r === null && Math.abs(L.hold[e] || 0) + Math.abs(L.ref[e] || 0) > 0) missing.add(e); R[e] = r === null ? 0 : r; }
      const dot = (m) => Object.entries(m).reduce((s, [e, w]) => s + w * (R[e] || 0), 0);
      const comp = {}; for (const k of LIVE_DECISIONS) comp[k] = L.comps[k] ? dot(L.comps[k]) : 0;
      // by fund: active weight times the fund's return over its asset class (ACWI for equity funds, the Agg for bond funds; a
      // diversifier's whole return, since the reference holds none); the asset-class split itself is the stocks vs bonds decision
      const cls = classOf(L), fund = {};
      for (const e of new Set([...Object.keys(L.hold), ...Object.keys(L.ref)])) {
        if (e === 'ACWI' || e === 'AGG') continue;
        const a = (L.hold[e] || 0) - (L.ref[e] || 0), c = cls(e), base = c === 'fixedIncome' ? (R.AGG || 0) : c === 'diversifiers' ? 0 : (R.ACWI || 0);
        fund[e] = a * ((R[e] || 0) - base);
      }
      days.push({ d, m: dot(L.hold), b: dot(L.ref), comp, fund, entry: L.date, te: L.exAnte && L.exAnte.te, live: live && i === dates.length - 1 });
    }
    LCACHE = { days, log: LOG, all: ALL, missing: [...missing], live, start: eff[0].from }; LKEY = key;
    return LCACHE;
  };
  const windowDays = (S) => {
    const all = S.days; if (!all.length) return [];
    const last = all[all.length - 1].d, ld = new Date(last + 'T00:00:00Z');
    const back = (m, dd = 0) => { const x = new Date(ld); x.setUTCMonth(x.getUTCMonth() - m); x.setUTCDate(x.getUTCDate() - dd); return x.toISOString().slice(0, 10); };
    const from = { inception: '', w1: back(0, 7), m1: back(1), m3: back(3), ytd: last.slice(0, 4) + '-01-01', y1: back(12), custom: LV.from || '' }[LV.h] || '';
    return all.filter((x) => x.d > from || from === '');
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

  // names: the entry's own universe first, then the dashboard's fund lists
  const nameMap = (ALL) => {
    const nm = new Map();
    for (const u of rows('etf_universe')) nm.set(u.etf, u.label);
    if (ok('bond_stats')) for (const b of rows('bond_stats')) nm.set(b.etf, b.label);
    for (const l of ALL) if (l.universe) for (const k of Object.keys(l.universe)) for (const x of l.universe[k] || []) if (x.label && !nm.has(x.etf)) nm.set(x.etf, x.label);
    nm.set('ACWI', 'Global equities'); nm.set('AGG', 'US Aggregate'); nm.set('ACWX', 'All other countries (ACWI ex-US)');
    return nm;
  };

  // ---- what is being tracked: the portfolio at one published date, grouped by asset class ----
  const drawTracked = (sec, S, nm) => {
    const box = $('#lv-port', sec), sel = $('#lv-at', sec), lead = $('#lv-port-lead', sec), foot = $('#lv-port-foot', sec);
    const dates = S.log.map((l) => l.date);
    if (!dates.length) { G.placeholder(box, 'No published portfolio for this version yet.'); lead.textContent = ''; return; }
    if (!dates.includes(LV.at)) LV.at = dates[dates.length - 1];
    const sig = dates.join();
    if (sel.dataset.sig !== sig) {
      sel.replaceChildren(...dates.slice().reverse().map((d, i) => { const o = el('option', G.mon(d) + (i === 0 ? ' (latest)' : '')); o.value = d; return o; }));
      sel.dataset.sig = sig;
      if (!sel._wired) { sel._wired = true; sel.addEventListener('change', () => { LV.at = sel.value; G.redraw(); }); }
    }
    sel.value = LV.at;
    const L = S.log.find((l) => l.date === LV.at), cls = classOf(L);
    const i = dates.indexOf(LV.at), next = dates[i + 1];
    const P = L.policy || { neutral: L.neutral || 0.6, band: 0.15 };
    lead.textContent = `${VARIANTS[LV.v].short}, published ${G.mon(L.date)}: ${pcl(L.equityWeight, 1)} equities, ${pcl(L.bondWeight, 1)} fixed income${L.divWeight ? ', ' + pcl(L.divWeight, 0) + ' diversifiers' : ''}, against 60% global equities (ACWI) and 40% US Aggregate (AGG). Policy: ${Math.round((P.neutral || 0.6) * 100)}/${Math.round((1 - (P.neutral || 0.6)) * 100)} neutral, ±${Math.round((P.band || 0.15) * 100)} points for stocks vs bonds, ${P.sleeveBudget ? 'equities in country funds plus up to ' + Math.round(P.sleeveBudget * 100) + '% of equities in the best-scoring sector, industry, style, factor, theme and regional sleeves (' + (L.sleeves || []).length + ' held, at most ' + Math.round((P.sleeveCap || 0.05) * 100) + '% of equities each)' : 'equities in country funds only'}, ${L.divWeight ? pcl(L.divWeight, 0) + ' diversifier sleeve funded pro rata from stocks and bonds' : 'no diversifier sleeve'}.${L.note ? ' ' + L.note : ''} ${next ? 'Held from the next trading day until the portfolio of ' + G.mon(next) + '.' : 'Held from the next trading day; it is the portfolio being tracked now.'}`;
    const funds = new Set([...Object.keys(L.hold), ...Object.keys(L.ref)]);
    const tbody = [];
    const fmtW = (w) => (Math.abs(w) < 5e-5 ? '—' : pcl(w, 1));
    for (const [k, label] of CLASSES) {
      const list = [...funds].filter((e) => cls(e) === k).map((e) => ({ e, w: L.hold[e] || 0, r: L.ref[e] || 0 })).filter((x) => Math.abs(x.w) >= 5e-4 || Math.abs(x.r) > 1e-6).sort((a, b) => b.w - a.w || b.r - a.r);
      if (!list.length) continue;
      const tw = list.reduce((s, x) => s + x.w, 0), tr = list.reduce((s, x) => s + x.r, 0);
      tbody.push({ grp: true, cells: [label, '', pcl(tw, 1), pcl(tr, 1), sdl((tw - tr) * 100) + ' pts'] });
      for (const x of list) tbody.push({ cells: [x.e, nm.get(x.e) || x.e, fmtW(x.w), fmtW(x.r), Math.abs(x.w - x.r) < 5e-5 ? '—' : sdl((x.w - x.r) * 100) + ' pts'], neg: x.w < 0 });
    }
    const tbl = box;
    if (!tbl.tHead || !tbl.tBodies[0]) tbl.replaceChildren(document.createElement('thead'), document.createElement('tbody'));
    const hr = el('tr'); ['Fund', 'Name', 'Weight', '60/40 weight', 'Active'].forEach((t, j) => hr.append(el('th', t, j > 1 ? 'gm-num' : 'x-txt')));
    tbl.tHead.replaceChildren(hr);
    tbl.tBodies[0].replaceChildren(...tbody.map((r) => { const tr = el('tr', null, r.grp ? 'x-lvgrp' : ''); r.cells.forEach((c, j) => tr.append(el('td', c, j > 1 ? 'gm-num' : 'x-txt'))); return tr; }));
    const notes = [];
    if (L.isDiv && L.recreated) notes.push(`Recreated on ${G.mon(L.recreated)}: the with-diversifiers version began after this date, so this entry was rebuilt from the models exactly as published on ${G.mon(L.date)}, with the diversifier sleeve at the real assets model's weights that week. Every later entry is recorded when it is published.`);
    if (Object.values(L.hold).some((w) => w < 0)) notes.push('Negative weights are the funding legs of fixed income tilts (for example, holding TIPS funded from intermediate Treasuries); they net within the fixed income sleeve.');
    foot.textContent = notes.join(' ');
    foot.hidden = !notes.length;
  };

  // ---- allocation over time: one stacked bar per published portfolio ----
  const drawHistory = (sec, S, nm) => {
    const box = $('#lv-hist', sec);
    G.seg($('#lv-hv', sec), [['class', 'Asset classes'], ['fund', 'Funds']], LV.histView, (v) => { LV.histView = v; G.redraw(); });
    if (!S.log.length) { G.placeholder(box, 'No published portfolio yet.'); return; }
    let keys, color, val;
    if (LV.histView === 'class') {
      keys = CLASSES.map(([k]) => k); color = (k) => CLASS_COLOR[k];
      val = (l) => { const c = classOf(l), o = {}; for (const [e, w] of Object.entries(l.hold)) o[c(e)] = (o[c(e)] || 0) + w; return o; };
    } else {
      const tot = new Map(); for (const l of S.log) for (const [e, w] of Object.entries(l.hold)) tot.set(e, (tot.get(e) || 0) + Math.abs(w));
      const top = [...tot.entries()].sort((a, b) => b[1] - a[1]).slice(0, 9).map(([e]) => e);
      keys = [...top, 'Other'];
      const pal = ['#1f5fa8', '#4f86c6', '#8fb3e0', '#7c8798', '#a7b0bd', '#0f766e', '#5aa69b', '#2f4b6e', '#c4cfdc', '#d9dee5'];
      color = (k) => pal[keys.indexOf(k) % pal.length];
      val = (l) => { const o = {}; for (const [e, w] of Object.entries(l.hold)) { const k = top.includes(e) ? e : 'Other'; o[k] = (o[k] || 0) + w; } return o; };
    }
    const data = S.log.map((l) => ({ date: l.date, ...Object.fromEntries(keys.map((k) => [k, val(l)[k] || 0])) }));
    const W = Math.max(300, box.clientWidth || 600), H = 220, m = { t: 10, r: 10, b: 26, l: 44 };
    const x = d3.scaleBand().domain(data.map((d) => d.date)).range([m.l, W - m.r]).padding(0.3);
    const series = d3.stack().keys(keys).offset(d3.stackOffsetDiverging)(data);
    const lo = Math.min(0, d3.min(series, (s) => d3.min(s, (p) => p[0]))), hi = Math.max(1, d3.max(series, (s) => d3.max(s, (p) => p[1])));
    const y = d3.scaleLinear().domain([lo, hi]).nice(5).range([H - m.b, m.t]);
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'x-svg').attr('role', 'img').attr('aria-label', 'Published portfolio weights over time');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')).tickSize(-(W - m.l - m.r))).attr('class', 'x-axis x-grid').call((g) => g.select('.domain').remove());
    const lab = data.length > 14 ? (d) => (d.slice(8) <= '07' ? G.mon(d).replace(/ \d+,/, '') : '') : (d) => G.mon(d).replace(/, \d{4}$/, '');
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickFormat(lab).tickSizeOuter(0)).attr('class', 'x-axis');
    const bw = Math.min(x.bandwidth(), 56), off = (x.bandwidth() - bw) / 2;
    for (const s of series) for (const p of s) {
      const v = p.data[s.key]; if (Math.abs(v) < 1e-6) continue;
      svg.append('rect').attr('x', x(p.data.date) + off).attr('width', bw).attr('y', y(Math.max(p[0], p[1]))).attr('height', Math.abs(y(p[0]) - y(p[1])))
        .attr('fill', color(s.key)).attr('stroke', 'var(--color-bg, #fff)').attr('stroke-width', 0.5).style('cursor', 'pointer')
        .on('pointermove', (ev) => G.showTip(ev, [G.mon(p.data.date), `${LV.histView === 'class' ? CLASSES.find((c) => c[0] === s.key)[1] : s.key === 'Other' ? 'Other funds' : (nm.get(s.key) || s.key) + ' (' + s.key + ')'}: ${pcl(v, 1)}`]))
        .on('pointerleave', G.hideTip).on('click', () => { LV.at = p.data.date; G.redraw(); const t = $('#lv-at-row', sec); if (t) t.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    }
    const legend = el('div', null, 'x-lvleg');
    for (const k of keys) { const s = el('span'); const sw = el('i'); sw.style.background = color(k); s.append(sw, document.createTextNode(LV.histView === 'class' ? CLASSES.find((c) => c[0] === k)[1] : k === 'Other' ? 'Other funds' : k)); legend.append(s); }
    box.replaceChildren(svg.node(), legend);
  };

  // ---- the investable universe, as recorded with each entry, and its changes ----
  const drawUniverse = (sec, S, nm) => {
    const box = $('#lv-univ', sec), chg = $('#lv-univ-chg', sec);
    const withU = S.all.filter((l) => l.universe);
    if (!withU.length) { G.placeholder(box, 'The universe is recorded with each published portfolio from October 2026.'); chg.replaceChildren(); return; }
    const first = new Map(), events = [];
    let prev = null;
    for (const l of withU) {
      const cur = new Map(); for (const [k] of CLASSES) for (const x of l.universe[k] || []) cur.set(x.etf, k);
      for (const e of cur.keys()) if (!first.has(e)) first.set(e, l.date);
      if (prev) {
        for (const [k, label] of CLASSES) {
          const add = [...cur.keys()].filter((e) => !prev.has(e) && cur.get(e) === k), rem = [...prev.keys()].filter((e) => !cur.has(e) && prev.get(e) === k);
          const nm2 = (e) => `${nm.get(e) || e} (${e})`;
          if (add.length) events.push({ d: l.date, t: `Added ${add.length} to ${label.toLowerCase()}: ${add.map(nm2).join(', ')}` });
          if (rem.length) events.push({ d: l.date, t: `Removed ${rem.length} from ${label.toLowerCase()}: ${rem.map(nm2).join(', ')}` });
        }
      }
      prev = cur;
    }
    const U = withU[withU.length - 1].universe, start = withU[0].date, lastL = S.all[S.all.length - 1];
    const heldNow = (e) => { const L = pick(lastL, LV.v); return L && Math.abs(L.hold[e] || 0) > 1e-6; };
    const out = [];
    for (const [k, label] of CLASSES) {
      const list = U[k] || []; if (!list.length) continue;
      out.push({ grp: true, cells: [`${label} (${list.length})`, '', '', ''] });
      for (const x of list) out.push({ cells: [x.etf, x.label + (x.note && x.label !== x.note ? ' · ' + x.note : ''), first.get(x.etf) === start ? 'From the start' : 'Added ' + G.mon(first.get(x.etf)), heldNow(x.etf) ? 'Held' : 'Eligible, not held'] });
    }
    const tbl = box;
    if (!tbl.tHead || !tbl.tBodies[0]) tbl.replaceChildren(document.createElement('thead'), document.createElement('tbody'));
    const hr = el('tr'); ['Fund', 'What it is', 'In the universe', `Now (${VARIANTS[LV.v].short.toLowerCase()})`].forEach((t) => hr.append(el('th', t, 'x-txt')));
    tbl.tHead.replaceChildren(hr);
    tbl.tBodies[0].replaceChildren(...out.map((r) => { const tr = el('tr', null, r.grp ? 'x-lvgrp' : ''); r.cells.forEach((c) => tr.append(el('td', c, 'x-txt'))); return tr; }));
    bullets(chg, events.length ? events.slice().reverse().map((e) => `**${G.mon(e.d)}:** ${e.t}.`) : [`No additions or removals since the universe was first recorded on ${G.mon(start)}. New assets will appear here, dated from the first portfolio that could hold them.`]);
  };

  const LAYOUT = `<div class="gm-block">
      <div class="gm-hrow"><h2 class="gm-h2" id="lv-title">Live results<button type="button" class="gm-i" data-info="liveTab" aria-label="About the live results">i</button></h2></div>
      <div class="gm-barrow"><span class="gm-label">Portfolio</span><span class="gm-seg" id="lv-v"></span></div>
      <div class="gm-barrow"><span class="gm-label">Look back</span><span class="gm-seg" id="lv-h"></span><label class="gm-field x-lvfrom"><span class="gm-label">From</span><input type="date" id="lv-from" min="2026-01-01" max="2099-12-31" aria-label="Start date"></label></div>
      <ul class="gm-bul" id="lv-lead" data-source="live_log"></ul>
    </div>
    <div class="gm-block" id="lv-at-row">
      <div class="gm-hrow"><h3 class="gm-h3">What is being tracked</h3><label class="gm-field x-lvfrom"><span class="gm-label">Published</span><select id="lv-at" aria-label="Published portfolio"></select></label></div>
      <p class="gm-note x-lvlead" id="lv-port-lead"></p>
      <div class="gm-tablewrap"><table class="gm-table gm-compact gm-static" id="lv-port" data-source="live_log"><thead></thead><tbody></tbody></table></div>
      <p class="gm-note" id="lv-port-foot" hidden></p>
    </div>
    <div class="gm-grid2">
      <div class="gm-block"><div class="gm-hrow"><h3 class="gm-h3">Allocation over time</h3><span class="gm-seg" id="lv-hv"></span></div><div class="gm-chart" id="lv-hist" data-source="live_log" style="min-height:220px"></div><p class="gm-note">One bar per published portfolio; click a bar to open that week above. History builds up as each weekly portfolio is published.</p></div>
      <div class="gm-block"><h3 class="gm-h3">Changes to the investable universe</h3><ul class="gm-bul" id="lv-univ-chg" data-source="live_log"></ul><p class="gm-note">The universe is saved with every published portfolio, so an asset added to the models shows here from the first week it could be held.</p></div>
    </div>
    <div class="gm-grid2">
      <div class="gm-block"><h3 class="gm-h3">Growth of 100</h3><div class="gm-chart" id="lv-cum" data-source="live_log" style="min-height:240px"></div><h3 class="gm-h3">Running difference from 60/40</h3><div class="gm-chart" id="lv-rel" data-source="live_log" style="min-height:180px"></div></div>
      <div class="gm-block"><h3 class="gm-h3">Return and risk</h3><div class="gm-tablewrap"><table class="gm-table gm-compact gm-static" id="lv-stats" data-source="live_log"><thead></thead><tbody></tbody></table></div></div>
    </div>
    <div class="gm-grid2">
      <div class="gm-block"><h3 class="gm-h3">Attribution by decision</h3><div class="gm-tablewrap"><table class="gm-table gm-compact gm-static" id="lv-attr" data-source="live_log"><thead></thead><tbody></tbody></table></div><p class="gm-note">Each decision&rsquo;s active weights times each fund&rsquo;s daily return, summed over the window. The decisions add up to each day&rsquo;s difference from 60/40 exactly; over several days compounding leaves a small residual, shown separately. With diversifiers, the diversifier decision is the sleeve funded pro rata from the 60/40 reference.</p></div>
      <div class="gm-block"><h3 class="gm-h3">Largest contributions by fund</h3><div class="gm-tablewrap"><table class="gm-table gm-compact gm-static" id="lv-funds" data-source="live_log"><thead></thead><tbody></tbody></table></div><p class="gm-note">Each fund&rsquo;s active weight times its return over its asset class: ACWI for equity funds, the US Aggregate for bond funds, and the whole return for a diversifier. How much sits in equities against bonds is the stocks vs bonds decision.</p></div>
    </div>
    <div class="gm-block"><h3 class="gm-h3">Investable universe</h3><p class="gm-note">Everything the tracked portfolios may hold as of the latest published portfolio. Equities start from country funds at ACWI&rsquo;s country weights tilted by the country scores, with every country lacking its own fund in ACWX. Since Oct 21, 2026, up to 20% of equities also moves into the best-scoring sleeves of the whole equity universe (sectors, industries, US and international style and size, factors, themes and regions), at most 5% of equities each and 10 in all, each funded from its own region so regional weights stay where the country layer put them.</p><div class="gm-tablewrap"><table class="gm-table gm-compact gm-static" id="lv-univ" data-source="live_log"><thead></thead><tbody></tbody></table></div></div>
    <div class="gm-block"><h3 class="gm-h3">Portfolios published</h3><div class="gm-tablewrap"><table class="gm-table gm-compact gm-static" id="lv-log" data-source="live_log"><thead></thead><tbody></tbody></table></div><p class="gm-note" id="lv-log-note"></p></div>
    <style>
      #live .x-lvfrom{display:inline-flex;align-items:center;gap:.4rem;margin-left:.75rem}
      #live .x-lvfrom input,#live .x-lvfrom select{font:inherit;font-size:.8125rem;padding:.15rem .35rem;border:1px solid var(--color-border-line);border-radius:4px;background:var(--color-bg);color:var(--color-fg)}
      #live .gm-tablewrap{max-height:none!important}
      #live tr.x-lvgrp td{font-weight:600;background:var(--color-panel,#f4f6f9)}
      #live .x-lvlead{color:var(--color-fg);font-size:.875rem;line-height:1.5}
      #live .x-lvleg{display:flex;flex-wrap:wrap;gap:.25rem .9rem;font-size:.75rem;color:var(--color-fg-muted);margin-top:.25rem}
      #live .x-lvleg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:.3rem;vertical-align:-1px}
      #live .gm-barrow+.gm-barrow{margin-top:.35rem}
    </style>`;
  G.page('live', (sec) => {
    if (!sec.querySelector('#lv-port')) sec.innerHTML = LAYOUT;   // the page's own fixed markup, kept here so the main page file stays under its size limit
    const lead = $('#lv-lead', sec); if (!lead) return;
    G.seg($('#lv-v', sec), [['base', 'Tracked portfolio (no diversifiers)'], ['div', 'With 10% diversifiers']], LV.v, (v) => { LV.v = v; store.set('gm-live-v', v); G.redraw(); });
    G.seg($('#lv-h', sec), [['inception', 'Since inception'], ['w1', '1 week'], ['m1', '1 month'], ['m3', '3 months'], ['ytd', 'Year to date'], ['y1', '1 year']], LV.h, (v) => { LV.h = v; LV.from = ''; G.redraw(); });
    const fi = $('#lv-from', sec);
    if (fi && !fi._wired) { fi._wired = true; fi.addEventListener('change', () => { if (fi.value && fi.validity.valid) { LV.from = fi.value; LV.h = 'custom'; G.redraw(); } }); }
    if (fi && fi !== document.activeElement) fi.value = LV.h === 'custom' ? LV.from : '';
    const title = $('#lv-title', sec); if (title && title.firstChild) title.firstChild.nodeValue = `Live results: ${VARIANTS[LV.v].short.toLowerCase()} against 60/40`;
    if (!ok('live_log') || !ok('etf_history') || !ok('bond_history')) { G.placeholder(lead, G.bad('live_log') ? 'The live record didn’t load.' : 'Loading the live record…'); return; }
    const S = liveSeries(LV.v);
    if (!S) { bullets(lead, ['No published portfolios recorded yet.']); return; }
    const nm = nameMap(S.all);
    const lab = (e) => (nm.get(e) || e) + ' (' + e + ')';
    drawTracked(sec, S, nm);
    drawHistory(sec, S, nm);
    drawUniverse(sec, S, nm);
    const D = windowDays(S), X = statsOfDays(D);
    const vname = VARIANTS[LV.v].long;
    if (!X) {
      bullets(lead, [S.log.length ? `**The live record of ${vname} starts with the portfolio published on ${G.mon(S.log[0].date)}.** Its first day of returns is ${S.start ? G.mon(S.start) : 'the next trading day'}; nothing has been earned or lost yet in this window.` : `**No published portfolio for ${vname} yet.**`]);
      for (const id of ['#lv-stats', '#lv-attr', '#lv-funds']) G.placeholder($(id, sec), 'No returns yet.');
      G.placeholder($('#lv-cum', sec), 'No returns yet.'); G.placeholder($('#lv-rel', sec), ' ');
    } else {
      const C = Object.entries(X.contrib).filter(([, v]) => Math.abs(v) > 1e-6).sort((a, b) => b[1] - a[1]);
      const F = Object.entries(X.fund).filter(([, v]) => Math.abs(v) > 1e-6).sort((a, b) => b[1] - a[1]);
      const noise = isNum(X.exAnte) ? X.exAnte * Math.sqrt(X.n / 252) : null;
      const b = [];
      b.push(`**${X.ex >= 0 ? 'Ahead' : 'Behind'} of 60/40 by ${pcl(Math.abs(X.ex), 2)}.** ${X.from === S.start ? 'Since the live record began on' : 'From'} ${G.mon(X.from)} ${X.from === S.start ? 'through' : 'to'} ${G.mon(X.to)}${X.live ? ' (today at live prices)' : ''}, ${X.n} trading day${X.n === 1 ? '' : 's'}: ${vname} returned ${fs(X.cm)} against ${fs(X.cb)} for the reference.`);
      if (C.length) b.push(`**Biggest help: ${lcd(C[0][0])}** (${sdl(C[0][1] * 1e4, 0)}bp)${C.length > 1 && C[C.length - 1][1] < 0 ? `; biggest drag: ${lcd(C[C.length - 1][0])} (${sdl(C[C.length - 1][1] * 1e4, 0)}bp)` : ''}.${F.length ? ` By fund, ${lab(F[0][0])} added most${F[F.length - 1][1] < 0 ? ' and ' + lab(F[F.length - 1][0]) + ' cost most' : ''}.` : ''}`);
      if (isNum(noise)) b.push(`**${Math.abs(X.ex) < noise ? 'Within normal noise' : Math.abs(X.ex) < 2 * noise ? 'Notable, not yet significant' : 'Outside normal noise'}.** Expected tracking error is ${pcl(X.exAnte, 2)} a year, so over ${X.n} days a one-standard-deviation result is about ±${pcl(noise, 2)}; the ${pcl(Math.abs(X.ex), 2)} ${X.ex >= 0 ? 'lead' : 'shortfall'} is ${Math.abs(X.ex) < noise ? 'inside it' : Math.abs(X.ex) < 2 * noise ? 'between one and two standard deviations' : 'more than two standard deviations: worth explaining'}.`);
      if (X.n >= 20) b.push(`**Risk as expected?** Realized tracking error ${pcl(X.te, 2)} against ${pcl(X.exAnte, 2)} expected; volatility ${pcl(X.volM, 1)} against ${pcl(X.volB, 1)} for 60/40${isNum(X.beta) ? `; beta ${X.beta.toFixed(2)}` : ''}.`);
      if (X.n < 63) b.push('**Too short to judge the models.** Under three months of live results; the record grows each week as the scheduled refresh adds the published portfolio.');
      if (S.missing.length) b.push(`No price on some days for ${S.missing.slice(0, 5).join(', ')}; those days count a zero return for the fund.`);
      bullets(lead, b);
      kv($('#lv-stats', sec), ['', 'Model', '60/40', 'Difference'], [
        ['Return over the window', fs(X.cm), fs(X.cb), fs(X.ex)],
        ['Return a year', isNum(X.annM) ? fs(X.annM) : 'under 1 year', isNum(X.annB) ? fs(X.annB) : '—', isNum(X.annM) ? fs(X.annM - X.annB) : '—'],
        ['Volatility, annualized', X.n >= 10 ? pcl(X.volM, 1) : '—', X.n >= 10 ? pcl(X.volB, 1) : '—', '—'],
        ['Worst drawdown', fs(X.ddM), fs(X.ddB), '—'],
        ['Tracking error, realized', X.n >= 10 ? pcl(X.te, 2) : '—', '—', '—'],
        ['Tracking error, expected at the time', pcl(X.exAnte, 2), '—', '—'],
        ['Information ratio', isNum(X.ir) ? X.ir.toFixed(2) : 'under 3 months', '—', '—'],
        ['Beta to 60/40', isNum(X.beta) && X.n >= 10 ? X.beta.toFixed(2) : '—', '1.00', '—'],
        ['Days ahead of 60/40', pcl(X.hit, 0), '—', '—'],
        ['Best and worst day against 60/40', `${fs(X.best)} / ${fs(X.worst)}`, '—', '—'],
        ['Worst run behind 60/40', fs(X.ddRel), '—', '—'],
      ]);
      const sum = Object.values(X.contrib).reduce((s, v) => s + v, 0);
      kv($('#lv-attr', sec), ['Decision', 'Contribution', 'Share'], [...LIVE_DECISIONS.filter((k) => k !== 'Diversifiers' || LV.v === 'div').map((k) => [k, sdl(X.contrib[k] * 1e4) + 'bp', Math.abs(X.ex) > 1e-6 ? pcl(X.contrib[k] / X.ex, 0) : '—']),
        ['Sum of daily contributions', sdl(sum * 1e4) + 'bp', '—'], ['Compounding difference', sdl((X.ex - sum) * 1e4) + 'bp', '—']]);
      const top = [...F.slice(0, 5), ...F.slice(-5).filter((x) => !F.slice(0, 5).includes(x))];
      const L0 = S.log[S.log.length - 1];
      kv($('#lv-funds', sec), ['Fund', 'Active weight now', 'Contribution against its asset class'], top.map(([e, v]) => [lab(e), sdl(((L0.hold[e] || 0) - (L0.ref[e] || 0)) * 100) + '%', sdl(v * 1e4) + 'bp']));
      let gm = 100, gb = 100; const pm = [], pb = [], pr = [];
      const d0 = new Date(D[0].d + 'T00:00:00Z'); d0.setUTCDate(d0.getUTCDate() - 1); pm.push([d0, 100]); pb.push([d0, 100]); pr.push([d0, 0]);
      for (const x of D) { gm *= 1 + x.m; gb *= 1 + x.b; const d = new Date(x.d + 'T00:00:00Z'); pm.push([d, gm]); pb.push([d, gb]); pr.push([d, gm / gb - 1]); }
      G.line($('#lv-cum', sec), [{ name: VARIANTS[LV.v].short, color: G.PAL ? G.PAL[0] : 'var(--gm-blue)', pts: pm }, { name: '60/40', color: '#7c8798', pts: pb }], { h: 240, ref: 100, fmt: (v) => v.toFixed(2) });
      G.line($('#lv-rel', sec), [{ name: 'Less 60/40', color: G.PAL ? G.PAL[0] : 'var(--gm-blue)', pts: pr }], { h: 180, ref: 0, yfmt: d3.format('+.2%'), fmt: (v) => fs(v) });
    }
    kv($('#lv-log', sec), ['Published', 'Equities', 'Fixed income', 'Diversifiers', 'Largest country and sleeve tilts', 'Expected tracking error', 'Scores as of'], S.log.slice().reverse().map((l) => [G.mon(l.date) + (l.recreated ? ' (recreated)' : ''), pcl(l.equityWeight, 1), pcl(l.bondWeight, 1), l.divWeight ? pcl(l.divWeight, 0) : '—', [...(l.eqTop || []), ...((l.sleeves || []).slice(0, 3).map((s) => s.etf))].join(', ') || '—', pcl(l.exAnte && l.exAnte.te, 2), l.scoresAsOf ? G.mon(l.scoresAsOf) : '—']));
    const ln = $('#lv-log-note', sec);
    if (ln) ln.textContent = `Each weekly refresh records both portfolios the dashboard publishes at the default policy (60/40 neutral, ±15 points): the tracked portfolio with no diversifier sleeve, and the same portfolio with a 10% diversifier sleeve at the real assets model's weights. Each applies from the next trading day until the next refresh. Daily returns use dividend-adjusted closes, and today uses live prices; weights are held at the published level each day, gross of costs. Backtests are on the Evidence pages and are kept apart from this record.`;
  });
})();
