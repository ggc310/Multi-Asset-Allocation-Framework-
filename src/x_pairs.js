// Today → Relative performance: the big pairs. Fifteen relative trades across and within asset classes, each the
// first leg's total return against the second's over a day, week, month, three months, year to date and a year,
// ending at the live price. Shading is how unusual the move is against the pair's own daily relative moves over the
// past year. Click a row for the ratio over the past year. Built from today_px (daily closes) and today_quotes (live).
(() => {
  const G = window.GMX, { el, $, isNum } = G;
  const M = '−';
  const pc = (x, d = 1) => (!isNum(x) ? '—' : (x > 0 ? '+' : x < 0 ? M : '') + Math.abs(x * 100).toFixed(d) + '%');
  const PAIRS = [
    // [group, name, long leg(s), short leg(s), long label, short label]
    ['Across asset classes', 'Stocks vs bonds', ['ACWI'], ['AGG'], 'Global equities (ACWI)', 'US Aggregate (AGG)'],
    ['Across asset classes', 'Credit vs Treasuries', ['HYG'], ['IEF'], 'High yield (HYG)', '7–10y Treasuries (IEF)'],
    ['Across asset classes', 'TIPS vs Treasuries', ['TIP'], ['IEF'], 'TIPS (TIP)', '7–10y Treasuries (IEF)'],
    ['Across asset classes', 'Commodities vs stocks', ['DBC'], ['ACWI'], 'Broad commodities (DBC)', 'Global equities (ACWI)'],
    ['Across asset classes', 'Copper vs gold', ['HGUSD'], ['GCUSD'], 'Copper', 'Gold'],
    ['Within equities', 'US vs non-US', ['SPY'], ['ACWX'], 'S&P 500 (SPY)', 'ACWI ex-US (ACWX)'],
    ['Within equities', 'EM vs developed ex-US', ['EEM'], ['EFA'], 'Emerging markets (EEM)', 'Developed ex-US (EFA)'],
    ['Within equities', 'US growth vs value', ['IWF'], ['IWD'], 'Russell 1000 Growth (IWF)', 'Russell 1000 Value (IWD)'],
    ['Within equities', 'Small vs large caps', ['IWM'], ['SPY'], 'Russell 2000 (IWM)', 'S&P 500 (SPY)'],
    ['Within equities', 'Equal vs cap weight', ['RSP'], ['SPY'], 'S&P 500 equal weight (RSP)', 'S&P 500 (SPY)'],
    ['Within equities', 'Semiconductors vs market', ['SMH'], ['SPY'], 'Semiconductors (SMH)', 'S&P 500 (SPY)'],
    ['Within equities', 'Cyclicals vs defensives', ['XLI', 'XLF', 'XLE'], ['XLP', 'XLU', 'XLV'], 'Industrials, financials, energy', 'Staples, utilities, health care'],
    ['Within fixed income', 'High yield vs investment grade', ['HYG'], ['LQD'], 'High yield (HYG)', 'IG corporates (LQD)'],
    ['Within fixed income', 'Long vs intermediate Treasuries', ['TLT'], ['IEF'], '20y+ Treasuries (TLT)', '7–10y Treasuries (IEF)'],
    ['Within fixed income', 'EM debt vs Treasuries', ['EMB'], ['IEF'], 'EM dollar debt (EMB)', '7–10y Treasuries (IEF)'],
  ];
  const HK = [['d1', 'Today', 1], ['w1', '1 week', 5], ['m1', '1 month', 21], ['m3', '3 months', 63], ['ytd', 'Year to date', 0], ['y1', '1 year', 252]];
  const shade = (z) => (!isNum(z) || Math.abs(z) < 1 ? '' : (z > 0 ? 'td-up' : 'td-dn') + (Math.abs(z) >= 3 ? 3 : Math.abs(z) >= 2 ? 2 : 1));
  let sel = null, sig = '';

  const build = () => {
    const px = G.rows('today_px'), qs = G.rows('today_quotes');
    const S = {};
    for (const r of px) (S[r.symbol] = S[r.symbol] || new Map()).set(String(r.date).slice(0, 10), Number(r.close));
    for (const q of qs) {
      const m = S[q.symbol]; if (!m || !(Number(q.price) > 0) || !q.timestamp) continue;
      const qd = new Date(Number(q.timestamp) * 1000).toISOString().slice(0, 10);
      const last = [...m.keys()].sort().pop();
      m.set(qd >= last ? qd : last, Number(q.price));
    }
    const out = [];
    for (const [group, name, A, B, la, lb] of PAIRS) {
      const legs = [...A, ...B];
      if (legs.some((s) => !S[s])) { out.push({ group, name, A, B, la, lb, n: 0 }); continue; }
      const dates = [...S[legs[0]].keys()].filter((d) => legs.every((s) => S[s].has(d))).sort();
      if (dates.length < 30) { out.push({ group, name, A, B, la, lb, n: 0 }); continue; }
      const basket = (ss) => dates.map((d) => ss.reduce((a, s) => a + S[s].get(d) / S[s].get(dates[0]), 0) / ss.length);
      const a = basket(A), b = basket(B), v = a.map((x, i) => x / b[i]), n = v.length, last = v[n - 1];
      const daily = [];
      for (let i = Math.max(1, n - 253); i < n - 1; i++) daily.push(Math.log(v[i] / v[i - 1]));
      const mu = daily.reduce((s, x) => s + x, 0) / daily.length;
      const sd = Math.sqrt(daily.reduce((s, x) => s + (x - mu) ** 2, 0) / Math.max(1, daily.length - 1));
      const r = { group, name, A, B, la, lb, n, asOf: dates[n - 1], sd, pts: dates.map((d, i) => [new Date(d + 'T12:00:00Z'), v[i]]) };
      const yr = dates[n - 1].slice(0, 4);
      let ytdIdx = -1;
      for (let i = n - 1; i >= 0; i--) if (dates[i].slice(0, 4) < yr) { ytdIdx = i; break; }
      for (const [k, , d] of HK) {
        const j = k === 'ytd' ? ytdIdx : n - 1 - d;
        if (j < 0) { r[k] = null; r['z_' + k] = null; continue; }
        r[k] = last / v[j] - 1;
        r['z_' + k] = sd > 0 ? Math.log(last / v[j]) / (sd * Math.sqrt(n - 1 - j)) : null;
      }
      const w = v.slice(Math.max(0, n - 252)), hi = Math.max(...w), lo = Math.min(...w);
      r.pos52 = hi > lo ? (last - lo) / (hi - lo) : null;
      out.push(r);
    }
    return out;
  };

  const bullets = (R) => {
    const ok = R.filter((r) => r.n);
    const b = [];
    const lc = (t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
    const say = (r, k) => `**${r.name}**: ${r.la.replace(/ \(.*\)$/, '')} ${r[k] >= 0 ? 'beat' : 'trailed'} ${lc(r.lb.replace(/ \(.*\)$/, ''))} by ${pc(Math.abs(r[k])).replace('+', '')}`;
    const today = ok.filter((r) => isNum(r.z_d1)).sort((x, y) => Math.abs(y.z_d1) - Math.abs(x.z_d1));
    const big = today.filter((r) => Math.abs(r.z_d1) >= 1.5);
    if (big.length) b.push('Unusual today: ' + big.slice(0, 3).map((r) => `${say(r, 'd1')} (${Math.abs(r.z_d1).toFixed(1)} sd)`).join('; ') + '.');
    else if (today.length) b.push(`A quiet day for the big relative trades: the largest move against its own history was ${say(today[0], 'd1')}, within ${Math.max(1, Math.ceil(Math.abs(today[0].z_d1) * 2) / 2).toFixed(1)} sd of normal.`);
    const mo = ok.filter((r) => isNum(r.z_m1)).sort((x, y) => Math.abs(y.z_m1) - Math.abs(x.z_m1)).slice(0, 2);
    if (mo.length) b.push('Biggest shifts over the past month: ' + mo.map((r) => `${say(r, 'm1')} (${Math.abs(r.z_m1).toFixed(1)} sd)`).join('; ') + '.');
    const hiR = ok.filter((r) => isNum(r.pos52) && r.pos52 >= 0.95), loR = ok.filter((r) => isNum(r.pos52) && r.pos52 <= 0.05);
    if (hiR.length || loR.length) b.push([hiR.length ? 'At or near a 52-week high: ' + hiR.map((r) => lc(r.name)).join(', ') : '', loR.length ? 'at or near a 52-week low: ' + loR.map((r) => lc(r.name)).join(', ') : ''].filter(Boolean).join('; ').replace(/^at/, 'At') + '.');
    return b;
  };

  const drawChart = (R) => {
    const box = $('#td-pairs-chart'); if (!box) return;
    const r = R.find((x) => x.name === sel && x.n);
    if (!r) { box.replaceChildren(); return; }
    const cut = new Date(r.pts[r.pts.length - 1][0].getTime() - 365.25 * 864e5);
    const pts = r.pts.filter((p) => p[0] >= cut), base = pts[0][1];
    const head = el('div', null, 'td-pairs-ch');
    const close = el('button', 'Close'); close.type = 'button'; close.className = 'gm-linkbtn';
    close.addEventListener('click', () => { sel = null; draw(); });
    head.append(el('h4', `${r.name}: ${r.la} against ${r.lb}, past year (start = 100; rising means the first leg is ahead)`, 'gm-h4'), close);
    const c = el('div');
    box.replaceChildren(head, c);
    G.line(c, [{ name: r.name, pts: pts.map((p) => [p[0], (100 * p[1]) / base]) }], { h: 220, ref: 100, labels: false, yfmt: (v) => v.toFixed(0) });
  };

  const draw = () => {
    const sec = document.getElementById('today'); if (!sec || sec.hidden) return;
    let wrap = $('#td-pairs', sec);
    if (!wrap) {
      wrap = el('div'); wrap.id = 'td-pairs'; wrap.dataset.source = 'today_px today_quotes';
      const h = el('h3', 'Relative performance: the big pairs', 'gm-h3');
      const note = el('p', 'Each row is the first leg’s total return against the second’s (dividends included for funds; copper and gold are front-month futures). Shading shows how unusual the move is against that pair’s own daily relative moves over the past year: 1, 2 or 3 sd, green when the first leg is ahead and red when it is behind. Click a row to chart the pair.', 'td-key');
      const lead = el('ul', null, 'td-list'); lead.id = 'td-pairs-lead';
      const tw = el('div', null, 'gm-tablewrap td-wrap'); const t = el('table', null, 'gm-table td-table'); t.id = 'td-pairs-t'; tw.append(t);
      const ch = el('div'); ch.id = 'td-pairs-chart';
      wrap.append(h, lead, tw, ch);
      const anchor = $('.td-lead', sec);
      if (anchor) anchor.after(wrap); else sec.append(wrap);
    }
    const t = $('#td-pairs-t', wrap), lead = $('#td-pairs-lead', wrap);
    if (!G.ok('today_px')) { if (G.bad('today_px')) G.failed(t, 'Price history'); else G.placeholder(t, 'Loading prices…'); lead.replaceChildren(); return; }
    const R = build();
    const key = R.map((r) => r.name + (r.asOf || '') + (isNum(r.d1) ? r.d1.toFixed(5) : '')).join('|') + '|' + sel + '|' + document.documentElement.clientWidth;
    if (key === sig) return; sig = key;
    lead.replaceChildren(...bullets(R).map((s) => G.li(s)));
    let g0 = null;
    const data = [];
    for (const r of R) { if (r.group !== g0) { data.push({ head: r.group }); g0 = r.group; } data.push(r); }
    if (!t.tHead || !t.tBodies[0]) t.replaceChildren(document.createElement('thead'), document.createElement('tbody'));
    const hr = el('tr');
    for (const [l, num] of [['Pair', 0], ['First leg / second leg', 0], ...HK.map(([, l]) => [l, 1]), ['52-week range', 0]]) hr.append(el('th', l, num ? 'gm-num' : 'x-txt'));
    t.tHead.replaceChildren(hr);
    t.tBodies[0].replaceChildren(...data.map((r) => {
      const tr = el('tr');
      if (r.head) { const td = el('td', r.head, 'td-pairs-g'); td.colSpan = HK.length + 3; tr.append(td); return tr; }
      tr.className = 'x-click' + (sel === r.name ? ' td-pairs-sel' : ''); tr.tabIndex = 0;
      const pick = () => { sel = sel === r.name ? null : r.name; draw(); };
      tr.addEventListener('click', pick); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
      tr.append(el('td', r.name, 'x-txt'), el('td', `${r.la} / ${r.lb}`, 'td-sym'));
      for (const [k] of HK) {
        const td = el('td', r.n ? pc(r[k]) : '—', 'gm-num ' + shade(r['z_' + k]));
        if (isNum(r['z_' + k])) td.title = Math.abs(r['z_' + k]) >= 1 ? r['z_' + k].toFixed(1).replace('-', M) + ' sd against the pair’s own moves' : 'within 1 sd of normal';
        tr.append(td);
      }
      const tdr = el('td', null, 'td-rng');
      if (isNum(r.pos52)) {
        const bar = el('span', null, 'td-bar'), dot = el('span', null, 'td-dot');
        dot.style.left = 'calc(' + (r.pos52 * 100).toFixed(1) + '% - 4px)';
        bar.append(dot); tdr.append(bar, el('span', Math.round(r.pos52 * 100) + '%', 'td-rngv'));
      } else tdr.textContent = '—';
      tr.append(tdr);
      return tr;
    }));
    drawChart(R);
  };

  if (!document.getElementById('td-pairs-css')) {
    const st = document.createElement('style'); st.id = 'td-pairs-css';
    st.textContent = '#today #td-pairs{margin:0 0 1.25rem}#today .td-pairs-g{font-size:.75rem;text-transform:uppercase;letter-spacing:.03em;color:var(--color-fg-muted);font-weight:600;padding-top:.6rem}'
      + '#today #td-pairs tr.td-pairs-sel td{box-shadow:inset 0 -2px 0 var(--gm-blue,#1f5fa8)}#today .td-pairs-ch{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin:.75rem 0 .25rem}'
      + '#today #td-pairs-lead{margin:.25rem 0 .5rem}';
    document.head.append(st);
  }
  (G.todayAlso = G.todayAlso || []).push(draw);
  G.redraw();
})();
