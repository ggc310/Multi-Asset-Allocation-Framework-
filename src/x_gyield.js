// Markets → Inflation, real yields & credit: government bond yields abroad. Data: global_yields (OECD monthly averages
// on FRED: 10-year government yields and 3-month interbank rates). x_rates.js calls window.GMX_GY(sec) when the page draws.
(() => {
  const G = window.GMX;
  if (!G) return;
  const { el, $, isNum, fx } = G;
  const S = { range: '10Y' };
  const SHOW = ['US', 'DE', 'JP', 'GB', 'IT', 'FR', 'CA', 'AU'];
  const BW = { JP: 0.18, FR: 0.13, DE: 0.12, IT: 0.10, GB: 0.08, CA: 0.06, AU: 0.03 };   // the hedged international bond index, roughly
  const COL = { US: 'var(--gm-navy)', DE: '#c2410c', JP: '#be185d', GB: '#7c3aed', IT: '#0f766e', FR: '#a16207', CA: '#dc2626', AU: '#16a34a' };
  let cache = null;
  const prep = (rows) => {
    if (cache && cache.src === rows) return cache;
    const by = {}, name = {};
    for (const r of rows) {
      name[r.country] = r.name;
      const d = new Date(r.month + '-15T12:00:00Z'), o = (by[r.country] = by[r.country] || { y10: [], r3m: [] });
      if (isNum(r.y10)) o.y10.push([d, Number(r.y10)]);
      if (isNum(r.r3m)) o.r3m.push([d, Number(r.r3m)]);
    }
    for (const c in by) for (const k of ['y10', 'r3m']) by[c][k].sort((a, b) => a[0] - b[0]);
    cache = { src: rows, by, name };
    return cache;
  };
  const last = (s) => (s && s.length ? s[s.length - 1] : null);
  const ago = (s, months) => { const l = last(s); if (!l) return null; const t = new Date(l[0]); t.setUTCMonth(t.getUTCMonth() - months); let v = null; for (const p of s) { if (p[0] <= t) v = p[1]; else break; } return v; };
  const pp = (x) => (!isNum(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2));
  const bps = (x) => (!isNum(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(Math.round(x * 100)) + 'bp');
  const ensure = (sec) => {
    let box = $('#gy-block', sec);
    if (box) return box;
    box = el('div', null, 'gm-block'); box.id = 'gy-block';
    const hr = el('div', null, 'gm-hrow');
    const h = el('h3', 'Government bond yields abroad', 'gm-h3');
    const asof = el('span', '', 'gm-note'); asof.id = 'gy-asof'; asof.dataset.source = 'global_yields';
    hr.append(h, asof);
    const notes = el('ul', null, 'gm-bul'); notes.id = 'gy-notes'; notes.dataset.source = 'global_yields';
    const hr2 = el('div', null, 'gm-hrow'); const h4 = el('h4', '10-year government yields', 'gm-h4'); const rg = el('span', null, 'gm-seg'); rg.id = 'gy-range'; hr2.append(h4, rg);
    const ch = el('div', null, 'gm-chart'); ch.id = 'gy-chart'; ch.dataset.source = 'global_yields';
    const tw = el('div', null, 'gm-tablewrap'); const t = el('table', null, 'gm-table gm-compact'); t.id = 'gy-table'; t.dataset.source = 'global_yields'; tw.append(t);
    const n = el('p', 'OECD monthly averages (FRED), published early the following month. Curve is the 10-year yield less the 3-month interbank rate. The fixed income model’s international lever uses these, one month late.', 'gm-note');
    box.append(hr, notes, hr2, ch, tw, n);
    sec.append(box);
    return box;
  };
  window.GMX_GY = (sec) => {
    const box = ensure(sec);
    const tbl = $('#gy-table', box), ch = $('#gy-chart', box);
    if (G.bad('global_yields')) { G.failed(tbl, 'Government yields abroad'); ch.replaceChildren(); return; }
    if (!G.ok('global_yields')) { G.placeholder(tbl); G.placeholder(ch); return; }
    const { by, name } = prep(G.rows('global_yields'));
    const cs = Object.keys(by).filter((c) => by[c].y10.length).sort((a, b) => (a === 'US' ? -1 : b === 'US' ? 1 : last(by[b].y10)[1] - last(by[a].y10)[1]));
    const us = by.US, us10 = us ? last(us.y10) : null, us3 = us ? last(us.r3m) : null;
    const lm = d3.max(cs, (c) => +last(by[c].y10)[0]);
    $('#gy-asof', box).textContent = lm ? 'Monthly averages to ' + new Date(lm).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
    G.seg($('#gy-range', box), [['3Y', '3Y'], ['5Y', '5Y'], ['10Y', '10Y'], ['20Y', '20Y'], ['All', 'All']], S.range, (v) => { S.range = v; G.redraw(); });
    const yrs = { '3Y': 3, '5Y': 5, '10Y': 10, '20Y': 20 }[S.range], from = yrs ? new Date(Date.now() - yrs * 365.25 * 864e5) : null;
    G.line(ch, SHOW.filter((c) => by[c] && by[c].y10.length).map((c) => ({ name: name[c] || c, pts: by[c].y10.filter((p) => !from || p[0] >= from), color: COL[c] || 'var(--cds-chart-muted)', w: c === 'US' ? 2 : 1.3 })),
      { h: 280, fmt: (v) => v.toFixed(2) + '%', yfmt: (v) => v + '%', labels: true, dfmt: '%b %Y' });
    G.table(tbl, [
      { t: 'Country', f: (c) => name[c] || c },
      { t: '10-year', num: true, f: (c) => fx(last(by[c].y10)[1], 2) + '%' },
      { t: '3-month', num: true, f: (c) => (last(by[c].r3m) ? fx(last(by[c].r3m)[1], 2) + '%' : '—') },
      { t: 'Curve', num: true, title: '10-year less 3-month', f: (c) => (last(by[c].r3m) ? pp(last(by[c].y10)[1] - last(by[c].r3m)[1]) : '—') },
      { t: 'vs US 10-year', num: true, f: (c) => (c === 'US' || !us10 ? '—' : bps(last(by[c].y10)[1] - us10[1])) },
      { t: '6M change', num: true, f: (c) => bps(last(by[c].y10)[1] - ago(by[c].y10, 6)), cls: (c) => G.tone(-(last(by[c].y10)[1] - ago(by[c].y10, 6)), 0.05) },
      { t: '1Y change', num: true, f: (c) => bps(last(by[c].y10)[1] - ago(by[c].y10, 12)), cls: (c) => G.tone(-(last(by[c].y10)[1] - ago(by[c].y10, 12)), 0.05) },
      { t: 'Hedged into dollars', num: true, title: 'What the 10-year yields to a dollar investor who hedges the currency: its 10-year yield plus the US 3-month rate less its own 3-month rate', f: (c) => (c === 'US' || !us3 || !last(by[c].r3m) ? '—' : fx(last(by[c].y10)[1] + us3[1] - last(by[c].r3m)[1], 2) + '%') },
    ], cs);
    // notes: the hedged basket against the US, and the biggest moves
    const L = [];
    if (us10 && us3) {
      let w = 0, hy = 0, y = 0;
      for (const [c, wt] of Object.entries(BW)) { const a = by[c] && last(by[c].y10), b = by[c] && last(by[c].r3m); if (a && b) { w += wt; hy += wt * (a[1] + us3[1] - b[1]); y += wt * a[1]; } }
      if (w >= 0.4) {
        const h = hy / w, gap = h - us10[1];
        L.push(`Hedged into dollars, a basket of the main foreign 10-year bonds yields **${fx(h, 2)}%** against **${fx(us10[1], 2)}%** on the US 10-year: ${gap >= 0 ? `a pickup of ${bps(gap)} for owning them hedged` : `${bps(-gap)} less than staying in Treasuries`}. Unhedged they yield ${fx(y / w, 2)}%.`);
      }
    }
    const mv = cs.filter((c) => c !== 'US').map((c) => [c, last(by[c].y10)[1] - ago(by[c].y10, 6)]).filter(([, v]) => isNum(v)).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    if (mv.length && us10) { const u6 = us10[1] - ago(us.y10, 6); L.push(`Over six months the US 10-year moved ${bps(u6)}; the largest moves abroad were ${mv.slice(0, 3).map(([c, v]) => `${name[c]} ${bps(v)}`).join(', ')}.`); }
    $('#gy-notes', box).replaceChildren(...L.map(G.li));
  };
})();
