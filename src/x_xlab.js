// Markets → Compare & correlate: pick anything the dashboard tracks — equity sleeves, bonds, real assets,
// commodities, currencies, crypto, volatility, Treasury yields and credit spreads — and compare growth,
// relative performance, drawdowns, volatility and correlation over any time frame.
(() => {
  const G = window.GMX, A = window.GMXA, { el, $, isNum, pct, fx } = G;
  const MAX = 12;
  const S = { sel: null, bench: null, mode: 'growth', log: false, freq: 'W', cls: 'All', range: '3Y' };
  const MODES = [['growth', 'Growth of 100'], ['relative', 'Relative to benchmark'], ['drawdown', 'Drawdown'], ['vol', 'Rolling volatility'], ['corr', 'Rolling correlation'], ['levels', 'Yields, spreads & VIX']];
  const RANGES = [['1M', 1 / 12], ['3M', 0.25], ['6M', 0.5], ['YTD', 'ytd'], ['1Y', 1], ['3Y', 3], ['5Y', 5], ['10Y', 10], ['Max', null]];
  const PPY = { D: 252, W: 52, M: 12 };
  const PAL = ['#1d4ed8', '#c2410c', '#0f766e', '#7c3aed', '#a16207', '#be185d', '#475569', '#16a34a', '#dc2626', '#0891b2', '#9333ea', '#65a30d'];

  const params = () => { try { return dash.params() || {}; } catch (e) { return {}; } };
  const save = () => { try { dash.setParams({ xl: S.sel.join(','), xlb: S.bench || null }); } catch (e) { /* not available */ } };
  const resample = (s, f) => (f === 'W' ? A.weeklyOf(s) : f === 'M' ? A.monthlyOf(s) : s);
  const rets = (s, kind) => { const r = []; for (let i = 1; i < s.length; i++) r.push([s[i][0], kind === 'level' ? s[i][1] - s[i - 1][1] : s[i][1] / s[i - 1][1] - 1]); return r; };
  const align = (a, b) => { const m = new Map(b.map((p) => [Math.floor(p[0] / 864e5), p[1]])); const x = [], y = []; for (const p of a) { const k = Math.floor(p[0] / 864e5); if (m.has(k)) { x.push(p[1]); y.push(m.get(k)); } } return [x, y]; };
  const corr = (x, y) => { const n = x.length; if (n < 8) return null; const mx = d3.mean(x), my = d3.mean(y); let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; } return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null; };
  const beta = (x, y) => { const n = x.length; if (n < 8) return null; const mx = d3.mean(x), my = d3.mean(y); let sxy = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); syy += (y[i] - my) ** 2; } return syy ? sxy / syy : null; };
  const window_ = (s, from) => (from ? s.filter((p) => p[0] >= from) : s);
  // use the observation just before the window as the base, so a 1-month return covers the whole month
  const withBase = (s, from) => { if (!from) return s; const i = s.findIndex((p) => p[0] >= from); return i < 0 ? [] : s.slice(Math.max(0, i - 1)); };
  const unit = (a, v, d = 2) => (a.unit === '%' ? fx(v, d) + '%' : fx(v, 1));
  const chgFmt = (a, v) => (!isNum(v) ? '—' : a.unit === '%' ? (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(0) + 'bp' : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1));

  G.page('xlab', (sec) => {
    const cat = A.catalog();
    const chart = $('#xl-chart', sec), notes = $('#xl-notes', sec);
    if (!cat.list.length) { G.placeholder(chart); return; }
    if (!S.sel) {
      const p = params(); const fromUrl = String(p.xl || '').split(',').filter((id) => cat.by.has(id));
      S.sel = fromUrl.length ? fromUrl.slice(0, MAX) : [...A.PRESETS[0][1]]; S.bench = p.xlb && cat.by.has(p.xlb) ? p.xlb : A.PRESETS[0][2];
    }
    // keep picks whose data hasn't loaded yet; only drop them from what's drawn
    const sel = S.sel.filter((id) => cat.by.has(id));

    // ---- pickers ----
    const search = $('#xl-search', sec), list = $('#xl-list', sec);
    const opts = cat.list.filter((a) => S.cls === 'All' || a.cls === S.cls);
    if (list.dataset.k !== S.cls + opts.length) { list.replaceChildren(...opts.map((a) => { const o = el('option'); o.value = a.label + ' · ' + a.id; return o; })); list.dataset.k = S.cls + opts.length; }
    if (!search.dataset.wired) {
      const pick = () => {
        const v = search.value.trim().toLowerCase(); if (!v) return;
        const hit = cat.list.find((a) => (a.label + ' · ' + a.id).toLowerCase() === v) || cat.list.find((a) => a.id.toLowerCase() === v) || cat.list.find((a) => a.label.toLowerCase().includes(v));
        if (hit && !S.sel.includes(hit.id) && S.sel.length < MAX) { S.sel.push(hit.id); if (!S.bench) S.bench = hit.id; save(); }
        search.value = ''; G.redraw();
      };
      search.addEventListener('change', pick); search.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
      search.dataset.wired = '1';
    }
    G.seg($('#xl-cls', sec), [['All', 'All'], ...A.CLASSES.filter((c) => cat.list.some((a) => a.cls === c)).map((c) => [c, c])], S.cls, (v) => { S.cls = v; G.redraw(); });
    G.seg($('#xl-presets', sec), A.PRESETS.map(([n], i) => [String(i), n]), '', (v) => { const p = A.PRESETS[+v]; S.sel = p[1].filter((id) => cat.by.has(id)); S.bench = p[2]; save(); G.redraw(); });
    // quick add by class: chips for the class picked, so browsing works without typing
    const quick = $('#xl-quick', sec);
    quick.replaceChildren(...(S.cls === 'All' ? [] : opts.slice(0, 40)).map((a) => { const b = el('button', a.short || a.label.replace(' (USD per unit)', ''), 'x-chip'); b.type = 'button'; b.title = a.id; if (S.sel.includes(a.id)) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', () => { if (S.sel.includes(a.id)) S.sel = S.sel.filter((x) => x !== a.id); else if (S.sel.length < MAX) S.sel.push(a.id); save(); G.redraw(); }); return b; }));
    $('#xl-quick-note', sec).textContent = S.cls === 'All' ? 'Search above, pick a preset, or choose an asset class to browse it.' : `Click to add or remove (up to ${MAX}).`;
    const picked = $('#xl-picked', sec);
    picked.replaceChildren(...sel.map((id, i) => {
      const a = cat.by.get(id); const b = el('button', null, 'x-pick'); b.type = 'button'; b.title = 'Remove ' + a.label;
      const sw = el('i'); sw.style.background = PAL[i % PAL.length]; b.append(sw, document.createTextNode((a.short || a.label.replace(' (USD per unit)', '')) + (id === S.bench ? ' · benchmark' : '')), el('span', '×', 'x-pick-x'));
      b.addEventListener('click', () => { S.sel = S.sel.filter((x) => x !== id); if (S.bench === id) S.bench = S.sel[0] || null; save(); G.redraw(); });
      return b;
    }));
    const bsel = $('#xl-bench', sec);
    const bopts = ['', ...sel];
    if (bsel.dataset.k !== bopts.join(',')) { bsel.replaceChildren(...bopts.map((id) => new Option(id ? (cat.by.get(id).short || cat.by.get(id).label) : 'None', id))); bsel.dataset.k = bopts.join(','); bsel.onchange = () => { S.bench = bsel.value || null; save(); G.redraw(); }; }
    bsel.value = S.bench && cat.by.has(S.bench) ? S.bench : '';
    $('#xl-clear', sec).onclick = () => { S.sel = []; S.bench = null; save(); G.redraw(); };

    G.seg($('#xl-mode', sec), MODES, S.mode, (v) => { S.mode = v; G.redraw(); });
    G.seg($('#xl-freq', sec), [['D', 'Daily'], ['W', 'Weekly'], ['M', 'Monthly']], S.freq, (v) => { S.freq = v; G.redraw(); });
    const lg = $('#xl-log', sec); lg.checked = S.log; lg.onchange = () => { S.log = lg.checked; G.redraw(); };

    const assets = sel.map((id) => cat.by.get(id));
    const loading = assets.some((a) => A.needs(a).some((d) => !G.ok(d) && !G.bad(d)));
    if (!assets.length) { G.placeholder(chart, 'Pick at least one asset.'); notes.replaceChildren(); return; }
    const full = new Map(assets.map((a) => [a.id, A.series(a.id)]));
    const lastAll = d3.max(assets, (a) => { const s = full.get(a.id); return s.length ? s[s.length - 1][0] : null; });
    if (!lastAll) { G.placeholder(chart, loading ? undefined : 'No history for this selection.'); return; }
    const firstAll = d3.min(assets, (a) => { const s = full.get(a.id); return s.length ? s[0][0] : null; });
    const yrs = (lastAll - firstAll) / (365.25 * 864e5);
    const ropts = RANGES.filter(([, r]) => r == null || r === 'ytd' || r < yrs + 0.02);
    if (!ropts.some(([l]) => l === S.range)) S.range = 'Max';
    G.seg($('#xl-range', sec), ropts.map(([l]) => [l, l]), S.range, (v) => { S.range = v; G.redraw(); });
    const r = (RANGES.find(([l]) => l === S.range) || [])[1];
    const from = G.cutoff(lastAll, r);
    // charts: daily inside three years when the data allows, weekly beyond
    const chartFreq = (r != null && r !== 'ytd' && r > 3) || r == null ? 'W' : 'D';
    const W = new Map(assets.map((a) => [a.id, withBase(resample(full.get(a.id), chartFreq), from)]));
    const B = S.bench && cat.by.has(S.bench) ? cat.by.get(S.bench) : null;
    const prices = assets.filter((a) => a.kind === 'price'), levels = assets.filter((a) => a.kind === 'level');
    const colorOf = (id) => PAL[S.sel.indexOf(id) % PAL.length];
    const nm = (a) => a.short || a.label.replace(' (USD per unit)', '');

    // ---- chart ----
    let series = [], extra = [], o = { h: 340, labels: true, dfmt: '%b %-d, %Y' };
    const note = $('#xl-chart-note', sec);
    note.textContent = '';
    if (S.mode === 'levels') {
      const pctL = levels.filter((a) => a.unit === '%'), ptL = levels.filter((a) => a.unit !== '%');
      series = (pctL.length ? pctL : ptL).map((a) => ({ name: nm(a), color: colorOf(a.id), pts: W.get(a.id) }));
      o = { ...o, fmt: (v) => fx(v, 2) + (pctL.length ? '%' : ''), yfmt: (v) => d3.format('~g')(v) + (pctL.length ? '%' : '') };
      extra = pctL.length && ptL.length ? ptL : [];
      if (!levels.length) note.textContent = 'Add a Treasury yield, real yield, breakeven, credit spread or the VIX to see levels here.';
      else if (prices.length) note.textContent = 'Prices are left out here: this view shows levels, in percent for yields and spreads' + (levels.some((a) => a.unit !== '%') ? ', with the VIX (points) in its own chart below.' : '.');
    } else {
      const P = prices.map((a) => ({ a, s: W.get(a.id) })).filter((x) => x.s.length > 1);
      if (levels.length) note.textContent = `${levels.map(nm).join(', ')} ${levels.length > 1 ? 'are levels' : 'is a level'}, not a price: see “Yields, spreads & VIX”; ${S.mode === 'corr' ? 'their changes are used for correlation.' : 'left out of this chart.'}`;
      if (S.mode === 'growth') {
        series = P.map(({ a, s }) => ({ name: nm(a), color: colorOf(a.id), pts: s.map((p) => [p[0], (100 * p[1]) / s[0][1]]) }));
        o = { ...o, ref: 100, log: S.log, fmt: (v) => v.toFixed(1), yfmt: (v) => d3.format('~s')(v) };
      } else if (S.mode === 'relative') {
        if (!B || B.kind !== 'price') { G.placeholder(chart, 'Pick a priced benchmark (an equity, bond, fund, commodity, currency or crypto) to see relative performance.'); series = null; }
        else {
          const bs = W.get(B.id); const bm = new Map(bs.map((p) => [Math.floor(p[0] / 864e5), p[1]]));
          series = P.filter(({ a }) => a.id !== B.id).map(({ a, s }) => { const pts = s.filter((p) => bm.has(Math.floor(p[0] / 864e5))).map((p) => [p[0], p[1] / bm.get(Math.floor(p[0] / 864e5))]); return { name: nm(a) + ' vs ' + nm(B), color: colorOf(a.id), pts: pts.length ? pts.map((p) => [p[0], (100 * p[1]) / pts[0][1]]) : [] }; });
          o = { ...o, ref: 100, fmt: (v) => v.toFixed(1), yfmt: (v) => v.toFixed(0) };
        }
      } else if (S.mode === 'drawdown') {
        series = P.map(({ a, s }) => { let pk = -Infinity; return { name: nm(a), color: colorOf(a.id), pts: s.map((p) => { pk = Math.max(pk, p[1]); return [p[0], p[1] / pk - 1]; }) }; });
        o = { ...o, ref: 0, fmt: (v) => pct(v, 1), yfmt: (v) => Math.round(v * 100) + '%' };
      } else if (S.mode === 'vol') {
        const n = chartFreq === 'D' ? 63 : 13, k = Math.sqrt(PPY[chartFreq]);
        series = P.map(({ a, s }) => { const rr = rets(s, 'price'); const pts = []; for (let i = n; i <= rr.length; i++) { const w = rr.slice(i - n, i).map((x) => x[1]); pts.push([rr[i - 1][0], d3.deviation(w) * k]); } return { name: nm(a), color: colorOf(a.id), pts }; });
        o = { ...o, fmt: (v) => pct(v, 1, false), yfmt: (v) => Math.round(v * 100) + '%' };
        note.textContent = `Annualized volatility over the trailing ${chartFreq === 'D' ? '3 months of daily' : '13 weeks of weekly'} returns.` + (note.textContent ? ' ' + note.textContent : '');
      } else if (S.mode === 'corr') {
        if (!B) { G.placeholder(chart, 'Pick a benchmark to see rolling correlations with it.'); series = null; }
        else {
          const n = chartFreq === 'D' ? 126 : 26;
          const br = rets(W.get(B.id), B.kind); const bm = new Map(br.map((p) => [Math.floor(p[0] / 864e5), p[1]]));
          series = assets.filter((a) => a.id !== B.id).map((a) => {
            const ar = rets(W.get(a.id), a.kind).filter((p) => bm.has(Math.floor(p[0] / 864e5))); const pts = [];
            for (let i = n; i <= ar.length; i++) { const w = ar.slice(i - n, i); pts.push([w[w.length - 1][0], corr(w.map((p) => p[1]), w.map((p) => bm.get(Math.floor(p[0] / 864e5))))]); }
            return { name: nm(a), color: colorOf(a.id), pts: pts.filter((p) => isNum(p[1])) };
          });
          o = { ...o, ref: 0, ydom: [-1, 1], fmt: (v) => fx(v, 2), yfmt: (v) => v.toFixed(1) };
          note.textContent = `Correlation with ${nm(B)} over the trailing ${chartFreq === 'D' ? 'six months of daily' : '26 weeks of weekly'} ${B.kind === 'level' ? 'changes' : 'returns'}; yields and spreads use their changes.`;
        }
      }
    }
    if (series) {
      if (!series.some((s) => s.pts.length > 1)) G.placeholder(chart, loading ? undefined : 'No overlapping history in this time frame.');
      else G.line(chart, series, o);
    }
    const chart2 = $('#xl-chart2', sec);
    if (extra.length) { chart2.hidden = false; G.line(chart2, extra.map((a) => ({ name: nm(a), color: colorOf(a.id), pts: W.get(a.id) })), { h: 180, fmt: (v) => fx(v, 1), yfmt: (v) => d3.format('~g')(v) }); } else { chart2.hidden = true; chart2.replaceChildren(); }
    $('#xl-log-wrap', sec).hidden = S.mode !== 'growth';

    // ---- stats ----
    const statFreq = r != null && r !== 'ytd' && r <= 0.5 ? 'D' : S.freq;
    const bW = B ? withBase(resample(full.get(B.id), statFreq), from) : null;
    const bR = bW ? rets(bW, B.kind) : null;
    const st = assets.map((a) => {
      const s = withBase(resample(full.get(a.id), statFreq), from), rr = rets(s, a.kind);
      const out = { a, n: s.length };
      if (s.length < 2) return out;
      const span = (s[s.length - 1][0] - s[0][0]) / (365.25 * 864e5);
      if (a.kind === 'price') {
        out.ret = s[s.length - 1][1] / s[0][1] - 1; out.ann = span >= 0.95 ? Math.pow(1 + out.ret, 1 / span) - 1 : null;
        out.vol = rr.length > 5 ? d3.deviation(rr, (x) => x[1]) * Math.sqrt(PPY[statFreq]) : null;
        let pk = -Infinity, mdd = 0; for (const p of s) { pk = Math.max(pk, p[1]); mdd = Math.min(mdd, p[1] / pk - 1); } out.mdd = mdd; out.dd = s[s.length - 1][1] / pk - 1;
        out.rv = isNum(out.ann) && out.vol ? out.ann / out.vol : null;
      } else {
        out.lvl = s[s.length - 1][1]; out.chg = s[s.length - 1][1] - s[0][1]; out.lo = d3.min(s, (p) => p[1]); out.hi = d3.max(s, (p) => p[1]);
        out.pctl = s.filter((p) => p[1] <= out.lvl).length / s.length;
        out.vol = rr.length > 5 ? d3.deviation(rr, (x) => x[1]) * Math.sqrt(PPY[statFreq]) : null;
      }
      if (bR && a.id !== B.id) { const [x, y] = align(rr, bR); out.corr = corr(x, y); out.beta = a.kind === 'price' && B.kind === 'price' ? beta(x, y) : null; }
      return out;
    });
    const fl = (x) => (isNum(x) ? x : null);
    G.table($('#xl-stats', sec), [
      { t: 'Asset', f: (x) => { const s = el('span'); const i = el('i', null, 'x-sw'); i.style.background = colorOf(x.a.id); s.append(i, document.createTextNode(nm(x.a))); return s; } },
      { t: 'Class', f: (x) => x.a.cls, cls: 'gm-note' },
      { t: 'Return / change', num: true, f: (x) => (x.a.kind === 'price' ? pct(x.ret, 1) : chgFmt(x.a, x.chg)), cls: (x) => G.tone(x.a.kind === 'price' ? x.ret : null, 0.0005) },
      { t: 'A year', num: true, f: (x) => (x.a.kind === 'price' ? pct(x.ann, 1) : '—') },
      { t: 'Volatility', num: true, title: 'Annualized; for yields and spreads, of their changes', f: (x) => (x.a.kind === 'price' ? pct(x.vol, 1, false) : x.a.unit === '%' ? (isNum(x.vol) ? Math.round(x.vol * 100) + 'bp' : '—') : fx(x.vol, 1)) },
      { t: 'Return ÷ volatility', num: true, f: (x) => fx(x.rv, 2) },
      { t: 'Worst drawdown', num: true, f: (x) => (x.a.kind === 'price' ? pct(x.mdd, 1) : '—') },
      { t: 'From peak now', num: true, f: (x) => (x.a.kind === 'price' ? pct(x.dd, 1) : '—') },
      { t: 'Level now', num: true, f: (x) => (x.a.kind === 'level' ? unit(x.a, x.lvl) : '—') },
      { t: 'Range in window', num: true, f: (x) => (x.a.kind === 'level' ? unit(x.a, x.lo) + ' – ' + unit(x.a, x.hi) : '—') },
      { t: B ? 'Correlation with ' + nm(B) : 'Correlation', num: true, f: (x) => (x.a.id === S.bench ? '1.00' : fx(fl(x.corr), 2)) },
      { t: 'Beta', num: true, f: (x) => (x.a.id === S.bench ? '1.00' : fx(fl(x.beta), 2)) },
    ], st);
    $('#xl-stats-note', sec).textContent = `Over ${S.range === 'Max' ? 'all available history' : 'the past ' + S.range.replace('YTD', 'year to date')}, using ${({ D: 'daily', W: 'weekly', M: 'monthly' })[statFreq]} data${statFreq !== S.freq ? ' (short windows use daily data)' : ''}. Funds are dividend-adjusted total returns; currencies are in dollars per unit, so a rise means the currency gained.`;

    // ---- correlation matrix ----
    const M = assets.map((a) => rets(withBase(resample(full.get(a.id), S.freq), from), a.kind));
    const cm = $('#xl-corr', sec);
    const hr = el('tr'); hr.append(el('th', ''));
    for (const a of assets) { const th = el('th', nm(a), 'gm-num x-rot'); th.title = a.label; hr.append(th); }
    cm.tHead.replaceChildren(hr);
    const cells = [];
    cm.tBodies[0].replaceChildren(...assets.map((a, i) => {
      const tr = el('tr'); tr.append(el('td', nm(a), 'x-txt'));
      assets.forEach((b, j) => {
        const td = el('td', null, 'gm-num x-cc');
        if (i === j) { td.textContent = '1'; td.style.setProperty('--c', '1'); }
        else { const [x, y] = align(M[i], M[j]); const c = corr(x, y); td.textContent = isNum(c) ? c.toFixed(2).replace('-', '−') : '—'; if (isNum(c)) { td.style.setProperty('--c', String(c)); if (j > i) cells.push([a, b, c]); } }
        tr.append(td);
      });
      return tr;
    }));
    $('#xl-corr-note', sec).textContent = `${({ D: 'Daily', W: 'Weekly', M: 'Monthly' })[S.freq]} ${levels.length ? 'returns (changes for yields, spreads and the VIX)' : 'returns'} over the same window. Blue is positive, orange negative.`;

    // ---- calendar-year returns ----
    const yrsSet = new Set(); const calRows = prices.map((a) => {
      const m = A.monthlyOf(full.get(a.id)); const yEnd = new Map(); for (const p of m) yEnd.set(p[0].getUTCFullYear(), p[1]);
      const ys = [...yEnd.keys()].sort(); const out = { a };
      for (let k = 1; k < ys.length; k++) { out[ys[k]] = yEnd.get(ys[k]) / yEnd.get(ys[k - 1]) - 1; yrsSet.add(ys[k]); }
      return out;
    });
    const years = [...yrsSet].sort((x, y) => y - x).slice(0, 12);
    G.table($('#xl-cal', sec), [{ t: 'Asset', f: (x) => nm(x.a) }, ...years.map((y) => ({ t: y === new Date().getUTCFullYear() ? y + ' YTD' : String(y), num: true, f: (x) => pct(x[y], 0), cls: (x) => 'x-heatpn ' + G.tone(x[y], 0.0005) }))], calRows);
    for (const td of $('#xl-cal', sec).querySelectorAll('td.x-heatpn')) { const v = parseFloat(td.textContent.replace('−', '-')); if (isNum(v)) td.style.setProperty('--v', String(Math.max(-1, Math.min(1, v / 40)))); }

    // ---- takeaways (bold the critical part) ----
    const L = [];
    const pr = st.filter((x) => x.a.kind === 'price' && isNum(x.ret)).sort((p, q) => q.ret - p.ret);
    const win = S.range === 'Max' ? 'over all available history' : S.range === 'YTD' ? 'year to date' : 'over ' + S.range;
    if (pr.length > 1) L.push(`**Best ${win}: ${nm(pr[0].a)} ${pct(pr[0].ret, 1)}**; worst: ${nm(pr[pr.length - 1].a)} ${pct(pr[pr.length - 1].ret, 1)}.`);
    const rv = st.filter((x) => isNum(x.rv)).sort((p, q) => q.rv - p.rv);
    if (rv.length > 1) L.push(`Best return for the risk taken: **${nm(rv[0].a)}**, ${fx(rv[0].rv, 2)} of annual return per unit of volatility (${pct(rv[0].ann, 1)} a year at ${pct(rv[0].vol, 0, false)} volatility).`);
    if (B) {
      const dv = st.filter((x) => x.a.id !== B.id && isNum(x.corr)).sort((p, q) => p.corr - q.corr);
      if (dv.length) L.push(`**Best diversifier against ${nm(B)}: ${nm(dv[0].a)}** (correlation ${fx(dv[0].corr, 2)}); most similar: ${nm(dv[dv.length - 1].a)} (${fx(dv[dv.length - 1].corr, 2)}).`);
    }
    const sb = cells.find(([a, b]) => (a.cls === 'Equities' && ['AGG', 'IEF', 'TLT', 'GOVT'].includes(b.id)) || (b.cls === 'Equities' && ['AGG', 'IEF', 'TLT', 'GOVT'].includes(a.id)));
    if (sb) L.push(sb[2] > 0.2 ? `**Stocks and bonds are moving together** (${nm(sb[0])}/${nm(sb[1])} correlation ${fx(sb[2], 2)}), so bonds have done less to cushion equity sell-offs in this window.` : sb[2] < -0.1 ? `**Bonds are hedging stocks** in this window (${nm(sb[0])}/${nm(sb[1])} correlation ${fx(sb[2], 2)}).` : `Stocks and bonds have been roughly uncorrelated (${nm(sb[0])}/${nm(sb[1])} ${fx(sb[2], 2)}).`);
    const deep = st.filter((x) => isNum(x.dd) && x.dd < -0.1).sort((p, q) => p.dd - q.dd);
    if (deep.length) L.push(`Still well below its peak: **${nm(deep[0].a)} ${pct(deep[0].dd, 0)}**${deep[1] ? `, then ${nm(deep[1].a)} ${pct(deep[1].dd, 0)}` : ''}.`);
    const lv = st.filter((x) => x.a.kind === 'level' && isNum(x.pctl));
    for (const x of lv.slice(0, 2)) L.push(`${nm(x.a)} at ${unit(x.a, x.lvl)}: **${Math.round(100 * x.pctl)}th percentile** of its range ${win} (${chgFmt(x.a, x.chg)}).`);
    notes.replaceChildren(...L.map(G.li));
  });
})();

// pointers from the equity-only tools to the cross-asset page
(() => {
  const G = window.GMX;
  for (const [page, text] of [['returns', 'Growth of 100, relative strength and the correlation matrix above cover the equity sleeves.'], ['series', 'This explorer covers equity valuation.'], ['multi', 'This page compares asset classes over fixed horizons.']]) {
    G.page(page, (sec) => {
      const b = sec.querySelector('[data-xblock="xlink"]'); if (!b) return;
      b.querySelector('.x-link-t').textContent = text + ' To chart, compare and correlate anything across asset classes — bonds, commodities, currencies, crypto, yields and spreads — over any time frame:';
      b.querySelector('button').onclick = () => G.go('xlab');
    }, { block: 'xtpl-xlink' });
  }
})();
