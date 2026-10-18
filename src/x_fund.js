// Equity scorecard detail: a fund profile for the selected sleeve. Fund facts (cost, size, flows, concentration)
// and the look-through mix by sector, region, country, company size and listing currency, each next to the
// sleeve's broad benchmark (SPY for US sleeves, EFA for developed ex-US, EEM for emerging, ACWI otherwise).
// The block is inserted into #detail once; it follows the row selected in the scorecard (read from the
// data-where that app.js sets on the detail's price mark).
(() => {
  const G = window.GMX;
  if (!G) return;
  const { el, isNum, pct, money } = G;

  dash.calc('fund_mix', {
    inputs: ['etf_universe', 'fund_holdings', 'constituents', 'fx'],
    title: 'Look-through mix',
    description: 'Sector, region, country, company size (in US dollars) and listing-currency weights of each fund’s look-through holdings, as a share of the weight covered, next to its broad benchmark.',
    fn: (etf_universe, fund_holdings, constituents, fx) => {
      const REG = {
        US: 'United States', PR: 'United States', CA: 'Canada', JP: 'Japan',
        AU: 'Pacific ex-Japan', HK: 'Pacific ex-Japan', SG: 'Pacific ex-Japan', NZ: 'Pacific ex-Japan',
        GB: 'Europe & Israel', SE: 'Europe & Israel', CH: 'Europe & Israel', DE: 'Europe & Israel', FR: 'Europe & Israel', NL: 'Europe & Israel', IT: 'Europe & Israel', ES: 'Europe & Israel', NO: 'Europe & Israel', DK: 'Europe & Israel', IE: 'Europe & Israel', FI: 'Europe & Israel', BE: 'Europe & Israel', AT: 'Europe & Israel', LU: 'Europe & Israel', PT: 'Europe & Israel', JE: 'Europe & Israel', GG: 'Europe & Israel', MC: 'Europe & Israel', FO: 'Europe & Israel', LT: 'Europe & Israel', IL: 'Europe & Israel',
        CN: 'EM Asia', IN: 'EM Asia', TW: 'EM Asia', KR: 'EM Asia', TH: 'EM Asia', MY: 'EM Asia', ID: 'EM Asia', MO: 'EM Asia', PH: 'EM Asia',
        BR: 'EM Latin America', MX: 'EM Latin America', CL: 'EM Latin America', PE: 'EM Latin America', CO: 'EM Latin America', UY: 'EM Latin America', PA: 'EM Latin America',
        ZA: 'EM Europe, Middle East & Africa', SA: 'EM Europe, Middle East & Africa', AE: 'EM Europe, Middle East & Africa', KW: 'EM Europe, Middle East & Africa', QA: 'EM Europe, Middle East & Africa', EG: 'EM Europe, Middle East & Africa', TR: 'EM Europe, Middle East & Africa', PL: 'EM Europe, Middle East & Africa', GR: 'EM Europe, Middle East & Africa', HU: 'EM Europe, Middle East & Africa', CZ: 'EM Europe, Middle East & Africa', GE: 'EM Europe, Middle East & Africa',
        BM: 'Offshore domiciles', KY: 'Offshore domiciles',
      };
      const BENCH = { US: 'SPY', 'Intl developed': 'EFA', Emerging: 'EEM', 'Global ex-US': 'ACWI', Global: 'ACWI' };
      const usd = {};
      for (const r of fx) usd[r.currency] = Number(r.usdPerUnit);
      const c = {};
      for (const r of constituents) c[r.symbol] = r;
      const size = (cap) => (cap >= 200e9 ? 'Mega cap (over $200bn)' : cap >= 10e9 ? 'Large cap ($10–200bn)' : cap >= 2e9 ? 'Mid cap ($2–10bn)' : 'Small cap (under $2bn)');
      const mix = {};
      for (const h of fund_holdings) {
        const s = c[h.symbol];
        if (!s) continue;
        const m = (mix[h.etf] = mix[h.etf] || { tot: 0, sector: {}, region: {}, country: {}, size: {}, currency: {} });
        const w = Number(h.weight) || 0, add = (k, n) => { m[k][n] = (m[k][n] || 0) + w; };
        m.tot += w;
        add('sector', s.sector || 'Other');
        add('region', REG[s.country] || 'Other');
        add('country', s.country || 'Other');
        const cap = Number(s.marketCap) * (usd[s.currency] || (s.currency === 'USD' ? 1 : NaN));
        if (cap > 0) add('size', size(cap));
        add('currency', s.currency || 'Other');
      }
      const out = [];
      for (const u of etf_universe) {
        const m = mix[u.etf];
        if (!m || !m.tot) continue;
        let b = BENCH[u.region] || null;
        if (b === u.etf) b = u.etf === 'ACWI' ? null : 'ACWI';
        const bm = b ? mix[b] : null;
        for (const kind of ['sector', 'region', 'country', 'size', 'currency']) {
          const share = (mm, n) => (mm && mm.tot ? (mm[kind][n] || 0) / mm.tot : null);
          const cap = kind === 'country' || kind === 'currency' ? 10 : 99;
          const pool = new Set(Object.keys(m[kind]));
          if (bm && cap > 10) for (const n of Object.keys(bm[kind])) pool.add(n);
          let names = [...pool].sort((x, y) => (m[kind][y] || 0) - (m[kind][x] || 0) || ((bm && bm[kind][y]) || 0) - ((bm && bm[kind][x]) || 0));
          const rest = names.slice(cap);
          names = names.slice(0, cap);
          for (const n of names) {
            const w = share(m, n), bw = bm ? share(bm, n) : null;
            out.push({ etf: u.etf, kind, name: n, weight: w, bench: b, benchWeight: bw, active: bw == null ? null : w - bw });
          }
          if (rest.length) {
            const w = rest.reduce((a, n) => a + share(m, n), 0);
            const bw = bm ? Object.keys(bm[kind]).filter((n) => !names.includes(n)).reduce((a, n) => a + share(bm, n), 0) : null;
            out.push({ etf: u.etf, kind, name: 'All others', weight: w, bench: b, benchWeight: bw, active: bw == null ? null : w - bw });
          }
        }
      }
      return out;
    },
  });

  dash.calc('fund_stats', {
    inputs: ['fund_holdings', 'constituents', 'fx'],
    title: 'Look-through company size',
    description: 'Weighted average and weighted median market value (US dollars) of each fund’s look-through holdings, and the number of countries and sectors they span.',
    fn: (fund_holdings, constituents, fx) => {
      const usd = {};
      for (const r of fx) usd[r.currency] = Number(r.usdPerUnit);
      const c = {};
      for (const r of constituents) c[r.symbol] = r;
      const by = {};
      for (const h of fund_holdings) {
        const s = c[h.symbol];
        if (!s) continue;
        const cap = Number(s.marketCap) * (usd[s.currency] || (s.currency === 'USD' ? 1 : NaN));
        (by[h.etf] = by[h.etf] || []).push({ w: Number(h.weight) || 0, cap: cap > 0 ? cap : null, country: s.country, sector: s.sector });
      }
      return Object.entries(by).map(([etf, xs]) => {
        const v = xs.filter((x) => x.cap).sort((a, b) => a.cap - b.cap);
        const tw = v.reduce((a, x) => a + x.w, 0);
        let acc = 0, med = null;
        for (const x of v) { acc += x.w; if (acc >= tw / 2) { med = x.cap; break; } }
        return {
          etf,
          avgMarketCap: tw ? v.reduce((a, x) => a + x.w * x.cap, 0) / tw : null,
          medianMarketCap: med,
          countries: new Set(xs.map((x) => x.country).filter(Boolean)).size,
          sectors: new Set(xs.map((x) => x.sector).filter(Boolean)).size,
        };
      });
    },
  });

  // ---- styles (scoped to this block) ----
  const css = el('style');
  css.textContent = `
.x-fp { margin-top: var(--cds-gap-lg, 16px); padding-top: var(--cds-gap-lg, 16px); border-top: 1px solid var(--color-border-line); }
.x-fp-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; }
.x-fp-strip { margin: 4px 0 2px; }
.x-fp-strip dd { font-size: var(--cds-font-size-heading, 18px); }
.x-fp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); gap: var(--cds-gap-lg, 16px) var(--cds-gap-xl, 24px); align-items: start; }
.x-fp-t { width: 100%; border-collapse: collapse; font-size: var(--cds-font-size-caption, 12px); font-variant-numeric: tabular-nums; }
.x-fp-t caption { text-align: left; font-weight: var(--cds-font-weight-medium, 500); font-size: var(--cds-font-size-body, 14px); padding-bottom: 4px; }
.x-fp-t th { font-weight: 400; color: var(--color-fg-muted); text-align: right; padding: 2px 4px; border-bottom: 1px solid var(--color-border-line); white-space: nowrap; }
.x-fp-t th:first-child, .x-fp-t td:first-child { text-align: left; padding-left: 0; }
.x-fp-t td { padding: 3px 4px; text-align: right; white-space: nowrap; border-bottom: 1px solid color-mix(in srgb, var(--color-border-line) 50%, transparent); }
.x-fp-t td:first-child { white-space: normal; }
.x-fp-t td.x-fp-w { position: relative; min-width: 72px; }
.x-fp-t .x-fp-bar { position: absolute; left: 4px; top: 4px; bottom: 4px; background: var(--gm-blue, var(--color-fg-muted)); opacity: .22; border-radius: 2px; }
.x-fp-t .x-fp-tick { position: absolute; top: 2px; bottom: 2px; width: 2px; background: var(--color-fg); opacity: .55; }
.x-fp-t .x-fp-v { position: relative; }
.x-fp-t .x-pos { color: var(--color-ok); } .x-fp-t .x-neg { color: var(--color-bad); }
`;
  document.head.append(css);

  // ---- markup ----
  const fact = (label, src, field) => {
    const d = el('div'), dt = el('dt', label), dd = el('dd', '—');
    dd.dataset.source = src; dd.dataset.field = field; dd.dataset.fpf = field;
    d.append(dt, dd);
    return d;
  };
  const mixTable = (kind, cap) => {
    const t = el('table', null, 'x-fp-t');
    t.id = 'fp-' + kind;
    t.dataset.source = 'fund_mix'; t.dataset.rowKey = 'etf,kind,name';
    t.append(el('caption', cap));
    const hr = el('tr');
    for (const [txt, f] of [['', 'name'], ['Fund', 'weight'], ['Benchmark', 'benchWeight'], ['Difference', 'active']]) { const th = el('th', txt); th.dataset.field = f; hr.append(th); }
    const th = el('thead'); th.append(hr);
    t.append(th, el('tbody'));
    return t;
  };
  let box = null;
  const build = () => {
    const det = document.getElementById('detail');
    if (!det) return null;
    if (box && det.contains(box)) return box;
    box = el('div', null, 'gm-block x-fp'); box.id = 'd-profile';
    const head = el('div', null, 'x-fp-head');
    const h = el('h3', 'Fund profile', 'gm-h3'); h.id = 'fp-h';
    const sub = el('span', '', 'gm-note'); sub.id = 'fp-bench';
    head.append(h, sub);
    const strip = el('dl', null, 'gm-strip gm-num x-fp-strip'); strip.id = 'fp-strip';
    strip.append(
      fact('Expense ratio', 'etf_extras', 'expenseRatio'),
      fact('Fund assets', 'etf_extras', 'aum'),
      fact('Launched', 'etf_extras', 'inception'),
      fact('Flows, 12 months', 'etf_extras', 'flow12m'),
      fact('Holdings', 'concentration', 'holdingsCount'),
      fact('Top 10 weight', 'concentration', 'top10Weight'),
      fact('Effective holdings', 'concentration', 'effectiveHoldings'),
      fact('Median company', 'fund_stats', 'medianMarketCap'),
      fact('Countries', 'fund_stats', 'countries'),
    );
    const note = el('p', 'Shares of the look-through holdings covered (see the coverage line under the holdings table), by the company’s sector, country of domicile, market value and listing currency. Benchmark is the broad fund for the sleeve’s region; the tick on each bar marks its weight.', 'gm-note');
    const grid = el('div', null, 'x-fp-grid');
    grid.append(mixTable('sector', 'Sectors'), mixTable('region', 'Regions'), mixTable('country', 'Countries'));
    const col = el('div', null, 'gm-block'); col.append(mixTable('size', 'Company size'), mixTable('currency', 'Listing currency'));
    grid.append(col);
    box.append(head, strip, grid, note);
    const anchor = det.querySelector('.gm-grid');
    if (anchor) det.insertBefore(box, anchor); else det.append(box);
    return box;
  };

  // ---- drawing ----
  let names = null;
  try { names = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { names = null; }
  const cname = (code) => { if (!/^[A-Z]{2}$/.test(code)) return code; try { return (names && names.of(code)) || code; } catch (e) { return code; } };
  const SIZE_ORDER = ['Mega cap (over $200bn)', 'Large cap ($10–200bn)', 'Mid cap ($2–10bn)', 'Small cap (under $2bn)'];
  const selected = () => {
    const p = document.getElementById('d-price');
    const w = p && p.dataset.where;
    if (!w || !w.startsWith('etf=')) return null;
    return decodeURIComponent(w.slice(4)) || null;
  };
  const enc = encodeURIComponent;
  const ppt = (x) => (!isNum(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(1));
  const fmtFact = (f, v) => {
    if (!isNum(v) && f !== 'inception') return '—';
    switch (f) {
      case 'expenseRatio': return (v * 100).toFixed(2) + '%';
      case 'aum': case 'medianMarketCap': return money(v);
      case 'inception': return v ? String(v).slice(0, 4) : '—';
      case 'flow12m': return pct(v, 1);
      case 'top10Weight': return pct(v, 0, false);
      case 'effectiveHoldings': return Math.round(v).toLocaleString('en-US');
      default: return Number(v).toLocaleString('en-US');
    }
  };
  const fillTable = (t, etf, data, kind) => {
    const tb = t.tBodies[0];
    const st = dash.data('fund_mix').status;
    if (st !== 'ok') {
      const tr = el('tr'), td = el('td', st === 'loading' ? '' : '—'); td.colSpan = 4;
      if (st === 'loading') td.className = 'dash-skeleton', td.style.height = '80px';
      tr.append(td); tb.replaceChildren(tr); return;
    }
    let rs = data.filter((r) => r.etf === etf && r.kind === kind);
    if (kind === 'size') rs.sort((a, b) => SIZE_ORDER.indexOf(a.name) - SIZE_ORDER.indexOf(b.name));
    if (!rs.length) { const tr = el('tr'), td = el('td', '—'); td.colSpan = 4; tr.append(td); tb.replaceChildren(tr); return; }
    const max = Math.max(...rs.map((r) => Math.max(r.weight || 0, r.benchWeight || 0)), 0.0001);
    tb.replaceChildren(...rs.map((r) => {
      const tr = el('tr'); tr.dataset.key = [r.etf, r.kind, r.name].map(enc).join(',');
      const n = el('td', kind === 'country' ? cname(r.name) : r.name);
      const w = el('td', null, 'x-fp-w');
      const bar = el('span', null, 'x-fp-bar'); bar.style.width = `calc((100% - 8px) * ${((r.weight || 0) / max).toFixed(4)})`;
      w.append(bar);
      if (isNum(r.benchWeight)) { const tk = el('span', null, 'x-fp-tick'); tk.style.left = `calc(4px + (100% - 8px) * ${(r.benchWeight / max).toFixed(4)} - 1px)`; w.append(tk); }
      w.append(el('span', pct(r.weight, 1, false), 'x-fp-v'));
      const b = el('td', isNum(r.benchWeight) ? pct(r.benchWeight, 1, false) : '—');
      const a = el('td', ppt(r.active), isNum(r.active) ? (r.active > 0.005 ? 'x-pos' : r.active < -0.005 ? 'x-neg' : '') : '');
      tr.append(n, w, b, a);
      return tr;
    }));
  };
  const draw = () => {
    const etf = selected();
    const b = build();
    if (!b) return;
    if (!etf) { b.hidden = true; return; }
    b.hidden = false;
    for (const dd of b.querySelectorAll('dd[data-fpf]')) {
      dd.dataset.where = 'etf=' + enc(etf);
      const d = dash.data(dd.dataset.source), f = dd.dataset.fpf;
      const row = d.status === 'ok' ? (d.data || []).find((r) => r.etf === etf) : null;
      dd.textContent = row ? fmtFact(f, row[f]) : '—';
    }
    const mix = dash.data('fund_mix');
    const data = mix.status === 'ok' ? mix.data : [];
    const any = data.find((r) => r.etf === etf);
    const U = G.rows('etf_universe'), bl = any && any.bench ? U.find((u) => u.etf === any.bench) : null;
    b.querySelector('#fp-bench').textContent = bl ? `Benchmark: ${bl.label} (${bl.etf})` : any ? 'No broader benchmark for this fund' : '';
    for (const k of ['sector', 'region', 'country', 'size', 'currency']) fillTable(b.querySelector('#fp-' + k), etf, data, k);
  };
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { try { draw(); } catch (e) { console.error('fund profile', e); } }); };
  dash.onData(schedule);
  const watch = () => {
    const p = document.getElementById('d-price');
    if (!p) return setTimeout(watch, 300);
    new MutationObserver(schedule).observe(p, { attributes: true, attributeFilter: ['data-where'] });
    schedule();
  };
  watch();
})();
