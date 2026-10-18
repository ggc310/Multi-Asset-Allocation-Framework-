// Shared helpers for the newer pages (rates & credit, relative trends, earnings calls,
// company profile, commentary). Each page registers a draw function with GMX.page(id, fn);
// it runs when that page is showing and again whenever data or the width changes.
window.GMX = (() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const el = (tag, txt, cls) => { const e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; };
  const ok = (id) => dash.data(id).status === 'ok';
  const rows = (id) => { const d = dash.data(id); return d.status === 'ok' ? d.data : []; };
  const bad = (id) => ['error', 'connect', 'declined', 'missing'].includes(dash.data(id).status);
  const isNum = (x) => x != null && x !== '' && Number.isFinite(Number(x));
  const pct = (x, d = 1, sign = true) => (!isNum(x) ? '—' : (sign ? (x >= 0 ? '+' : '−') : x < 0 ? '−' : '') + Math.abs(x * 100).toFixed(d) + '%');
  const pp = (x, d = 0) => (!isNum(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(d));
  const bp = (x) => (!isNum(x) ? '—' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(0) + 'bp');
  const fx = (x, d = 2) => (!isNum(x) ? '—' : Number(x).toFixed(d).replace('-', '−'));
  const money = (x, cur) => {
    if (!isNum(x)) return '—';
    const a = Math.abs(x), s = x < 0 ? '−' : '', c = !cur || cur === 'USD' ? '$' : '';
    const t = a >= 1e12 ? (a / 1e12).toFixed(2) + 'T' : a >= 1e9 ? (a / 1e9).toFixed(a >= 1e11 ? 0 : 1) + 'bn' : a >= 1e6 ? (a / 1e6).toFixed(0) + 'm' : a.toFixed(0);
    return s + c + t + (c ? '' : ' ' + (cur || ''));
  };
  const mon = (d) => { const t = new Date(String(d).slice(0, 10) + 'T12:00:00Z'); return isNaN(t) ? String(d) : t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); };
  // a table keeps its header and body; its message goes in a single full-width row
  const say = (box, p) => {
    if (!box) return;
    if (box.tagName === 'TABLE') { if (!box.tHead || !box.tBodies[0]) box.replaceChildren(document.createElement('thead'), document.createElement('tbody')); box.tHead.replaceChildren(); const tr = el('tr'), td = el('td'); td.append(p); tr.append(td); box.tBodies[0].replaceChildren(tr); return; }
    box.replaceChildren(p);
  };
  const placeholder = (box, msg) => say(box, el('p', msg || '—', 'gm-note'));
  const failed = (box, what) => say(box, el('p', (what || 'This data') + " didn't load.", 'gm-note x-fail'));

  // a segmented control: <span class="gm-seg" id=..><button data-v=..>
  const seg = (box, opts, cur, onPick) => {
    if (!box) return;
    box._pick = onPick;
    const sig = opts.map(([v, l]) => v + '=' + l).join('|');
    if (box.dataset.built !== sig) {
      box.replaceChildren(...opts.map(([v, l]) => { const b = el('button', l); b.type = 'button'; b.dataset.v = v; return b; }));
      if (!box._wired) { box.addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b && box._pick) box._pick(b.dataset.v); }); box._wired = true; }
      box.dataset.built = sig;
    }
    for (const b of $$('button', box)) b.setAttribute('aria-pressed', String(b.dataset.v === String(cur)));
  };

  // a table from column specs [{t, f(row), cls, num}] ; rows plain objects
  const table = (tbl, cols, data, opts = {}) => {
    if (!tbl) return;
    if (!tbl.tHead || !tbl.tBodies[0]) { tbl.replaceChildren(document.createElement('thead'), document.createElement('tbody')); }
    const hr = el('tr');
    for (const c of cols) { const th = el('th', c.t); th.className = c.num ? 'gm-num' : 'x-txt'; if (c.field) th.dataset.field = c.field; if (c.title) th.title = c.title; hr.append(th); }
    tbl.tHead.replaceChildren(hr);
    tbl.tBodies[0].replaceChildren(...data.map((r) => {
      const tr = el('tr');
      if (opts.key) tr.dataset.key = encodeURIComponent(String(opts.key(r)));
      if (opts.onRow) { tr.classList.add('x-click'); tr.tabIndex = 0; tr.addEventListener('click', () => opts.onRow(r)); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') opts.onRow(r); }); }
      for (const c of cols) {
        const v = c.f(r);
        const td = el('td', null, (c.num ? 'gm-num ' : 'x-txt ') + (c.cls ? (typeof c.cls === 'function' ? c.cls(r) : c.cls) : ''));
        if (v instanceof Node) td.append(v); else td.textContent = v == null ? '—' : v;
        tr.append(td);
      }
      return tr;
    }));
  };
  const tone = (x, lo = 0) => (!isNum(x) ? '' : x > lo ? 'x-up' : x < -lo ? 'x-dn' : '');

  // ---- charts ----
  const tip = (() => { let t; return () => { if (!t) { t = el('div', null, 'x-tip'); t.hidden = true; document.body.append(t); } return t; }; })();
  const showTip = (ev, lines) => {
    const t = tip(); t.replaceChildren(...lines.map((l, i) => el('div', l, i ? '' : 'x-tip-h'))); t.hidden = false;
    const r = t.getBoundingClientRect(), W = document.documentElement.clientWidth;
    let x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + r.width > W - 8) x = ev.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 14;
    t.style.left = Math.max(8, x) + 'px'; t.style.top = Math.max(8, y) + 'px';
  };
  const hideTip = () => { tip().hidden = true; };
  const PAL = ['var(--gm-blue)', 'var(--gm-blue3)', '#c2410c', '#7c3aed', '#0f766e', '#a16207', '#be185d', '#475569', '#16a34a', '#dc2626'];

  // line chart: series [{name, color, pts: [[Date, v]], dash}], opts {h, fmt, yfmt, ref, zero, labels, band:[lo,hi]}
  // time frame: o.range = a key; adds 1M…Max buttons above the chart, filtering every series to the window
  const RANGES = [['1M', 1 / 12], ['3M', 0.25], ['6M', 0.5], ['YTD', 'ytd'], ['1Y', 1], ['3Y', 3], ['5Y', 5], ['10Y', 10], ['Max', null]];
  const rangeState = {};
  const cutoff = (last, r) => { if (r == null) return null; if (r === 'ytd') return new Date(Date.UTC(last.getUTCFullYear() - 1, 11, 31, 12)); return new Date(last.getTime() - r * 365.25 * 864e5); };
  const rangeBar = (box, key, series, onPick, dflt) => {
    const all = series.flatMap((s) => s.pts || []); if (!all.length) return null;
    const lo = d3.min(all, (p) => p[0]), hi = d3.max(all, (p) => p[0]), yrs = (hi - lo) / (365.25 * 864e5);
    const opts = RANGES.filter(([, r]) => r == null || r === 'ytd' || r < yrs + 0.02);
    let cur = rangeState[key] || dflt || 'Max'; if (!opts.some(([l]) => l === cur)) cur = 'Max';
    const bar = el('span', null, 'gm-seg x-range'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Time frame');
    for (const [l] of opts) { const b = el('button', l); b.type = 'button'; b.setAttribute('aria-pressed', String(l === cur)); b.addEventListener('click', () => { rangeState[key] = l; onPick(); }); bar.append(b); }
    const r = (RANGES.find(([l]) => l === cur) || [])[1];
    return { bar, from: cutoff(hi, r), cur };
  };
  const line = (box, series, o = {}) => {
    if (o.range && !o._inner) {
      const rb = rangeBar(box, o.range, series, () => line(box, series, o), o.rangeDefault);
      if (!rb) return line(box, series, { ...o, _inner: true });
      const row = el('div', null, 'x-rangerow'); row.append(rb.bar);
      const inner = el('div');
      box.replaceChildren(row, inner);
      const cut = (s) => ({ ...s, pts: rb.from ? s.pts.filter((p) => p[0] >= rb.from) : s.pts });
      let ss = series.map(cut);
      if (o.rebase) ss = ss.map((s) => { const b = s.pts.find((p) => p[1] > 0); return { ...s, pts: b ? s.pts.map((p) => [p[0], (100 * p[1]) / b[1]]) : [] }; });
      return line(inner, ss, { ...o, _inner: true });
    }
    series = series.filter((s) => s.pts && s.pts.length);
    if (!series.length) return placeholder(box, o.empty || 'No data for this range.');
    const W = Math.max(280, box.clientWidth || 600), H = o.h || 260, labW = d3.max(series, (s) => String(s.name).length + 7) * 6.2, m = { t: 12, r: o.labels === false ? 14 : Math.max(96, Math.min(labW, W * 0.3)), b: 24, l: 44 };
    const all = series.flatMap((s) => s.pts);
    const x = d3.scaleUtc().domain(o.xdom || d3.extent(all, (p) => p[0])).range([m.l, W - m.r]);
    let [lo, hi] = d3.extent(all, (p) => p[1]);
    if (o.ref != null) { lo = Math.min(lo, o.ref); hi = Math.max(hi, o.ref); }
    if (o.ydom) [lo, hi] = o.ydom;
    const pad = o.ydom ? 0 : (hi - lo) * 0.06 || 1;
    const nt = H < 140 ? 3 : 5;
    const y = o.log && lo > 0 ? d3.scaleLog().domain([lo * 0.95, hi * 1.05]).range([H - m.b, m.t]) : d3.scaleLinear().domain([lo >= 0 && lo - pad < 0 ? 0 : lo - pad, hi + pad]).nice(nt).range([H - m.b, m.t]);
    const yf = o.yfmt || ((v) => d3.format('~g')(v));
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'x-svg').attr('role', 'img').attr('aria-label', o.aria || series.map((s) => s.name).join(', '));
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(o.xticks || Math.max(2, Math.floor((W - m.l - m.r) / 90))).tickFormat(o.xfmt ? d3.utcFormat(o.xfmt) : null).tickSizeOuter(0)).attr('class', 'x-axis');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(nt).tickFormat(yf).tickSize(-(W - m.l - m.r))).attr('class', 'x-axis x-grid').call((g) => g.select('.domain').remove());
    if (o.band) svg.append('rect').attr('x', m.l).attr('width', W - m.l - m.r).attr('y', y(o.band[1])).attr('height', Math.max(0, y(o.band[0]) - y(o.band[1]))).attr('class', 'x-band');
    if (o.ref != null) svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(o.ref)).attr('y2', y(o.ref)).attr('class', 'x-ref');
    const ln = d3.line().defined((p) => p[1] != null && isFinite(p[1])).x((p) => x(p[0])).y((p) => y(p[1]));
    series.forEach((s, i) => {
      s.color = s.color || PAL[i % PAL.length];
      svg.append('path').datum(s.pts).attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', s.w || 1.6).attr('stroke-dasharray', s.dash || null).attr('d', ln);
    });
    if (o.labels !== false) {
      const lab = series.map((s) => { const p = s.pts[s.pts.length - 1]; return { s, y: y(p[1]), v: p[1] }; }).sort((a, b) => a.y - b.y);
      for (let i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 12) lab[i].y = lab[i - 1].y + 12;
      for (const l of lab) svg.append('text').attr('x', W - m.r + 6).attr('y', l.y + 4).attr('fill', l.s.color).attr('class', 'x-lab').text(`${l.s.name} ${(o.fmt || yf)(l.v)}`);
    }
    const cross = svg.append('line').attr('y1', m.t).attr('y2', H - m.b).attr('class', 'x-cross').attr('visibility', 'hidden');
    const bis = d3.bisector((p) => p[0]).center;
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev); const d = x.invert(px);
        cross.attr('x1', px).attr('x2', px).attr('visibility', 'visible');
        const lines = [d3.utcFormat(o.dfmt || '%b %-d, %Y')(d)];
        for (const s of series) { const p = s.pts[bis(s.pts, d)]; if (p) lines.push(`${s.name}: ${(o.fmt || yf)(p[1])}`); }
        showTip(ev, lines);
      })
      .on('pointerleave', () => { cross.attr('visibility', 'hidden'); hideTip(); });
    box.replaceChildren(svg.node());
    if (o.legend) {
      const lg = el('div', null, 'x-legend');
      for (const s of series) { const k = el('span'); const sw = el('i'); sw.style.background = s.color; k.append(sw, document.createTextNode(s.name)); lg.append(k); }
      box.append(lg);
    }
  };

  // vertical bars: items [{label, v, color, est}], opts {h, fmt}
  const bars = (box, items, o = {}) => {
    if (!items.length) return placeholder(box);
    const W = Math.max(260, box.clientWidth || 500), H = o.h || 200, m = { t: 16, r: 8, b: 26, l: 48 };
    const x = d3.scaleBand().domain(items.map((d) => d.label)).range([m.l, W - m.r]).padding(0.25);
    const ext = d3.extent([0, ...items.map((d) => d.v).filter(isNum)]);
    const y = d3.scaleLinear().domain(ext).nice(4).range([H - m.b, m.t]);
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'x-svg');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(o.fmt || d3.format('~s')).tickSize(-(W - m.l - m.r))).attr('class', 'x-axis x-grid').call((g) => g.select('.domain').remove());
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSizeOuter(0)).attr('class', 'x-axis');
    for (const d of items) {
      if (!isNum(d.v)) continue;
      svg.append('rect').attr('x', x(d.label)).attr('width', x.bandwidth()).attr('y', Math.min(y(0), y(d.v))).attr('height', Math.abs(y(d.v) - y(0)))
        .attr('fill', d.color || (d.v >= 0 ? 'var(--gm-blue)' : 'var(--color-bad)')).attr('opacity', d.est ? 0.45 : 1).attr('stroke', d.est ? 'var(--gm-blue)' : null).attr('stroke-dasharray', d.est ? '3 2' : null)
        .on('pointermove', (ev) => showTip(ev, [d.label + (d.est ? ' (estimate)' : ''), (o.tfmt || o.fmt || d3.format(',.3~s'))(d.v)])).on('pointerleave', hideTip);
    }
    box.replaceChildren(svg.node());
  };

  // horizontal bars for rankings: items [{label, v}]
  const hbars = (box, items, o = {}) => {
    if (!items.length) return placeholder(box);
    const W = Math.max(280, box.clientWidth || 500), rowH = 18, m = { t: 4, r: 56, b: 4, l: o.left || 150 }, H = m.t + m.b + rowH * items.length;
    const ext = d3.extent([0, ...items.map((d) => d.v)]);
    const x = d3.scaleLinear().domain(ext).nice().range([m.l, W - m.r]);
    const svg = d3.create('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'x-svg');
    items.forEach((d, i) => {
      const yy = m.t + i * rowH;
      svg.append('text').attr('x', m.l - 6).attr('y', yy + 13).attr('text-anchor', 'end').attr('class', 'x-lab2').text(d.label);
      svg.append('rect').attr('x', Math.min(x(0), x(d.v))).attr('y', yy + 3).attr('height', rowH - 6).attr('width', Math.abs(x(d.v) - x(0))).attr('fill', d.v >= 0 ? 'var(--color-ok)' : 'var(--color-bad)');
      svg.append('text').attr('x', d.v >= 0 ? x(d.v) + 4 : x(0) + 4).attr('y', yy + 13).attr('class', 'x-lab2').text((o.fmt || pct)(d.v));
    });
    svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', H).attr('class', 'x-ref');
    box.replaceChildren(svg.node());
  };

  // ---- a small, safe Markdown renderer for commentary (headings, paragraphs, lists, bold, italics, tables) ----
  const inline = (txt) => {
    const frag = document.createDocumentFragment();
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g; let last = 0, m;
    while ((m = re.exec(txt))) {
      if (m.index > last) frag.append(document.createTextNode(txt.slice(last, m.index)));
      const t = m[0]; const b = t.startsWith('**');
      frag.append(el(b ? 'strong' : 'em', t.slice(b ? 2 : 1, b ? -2 : -1)));
      last = m.index + t.length;
    }
    if (last < txt.length) frag.append(document.createTextNode(txt.slice(last)));
    return frag;
  };
  const md = (text) => {
    const out = el('div', null, 'x-md');
    const L = String(text || '').replace(/\r/g, '').split('\n');
    let list = null, para = [];
    const flush = () => { if (para.length) { const p = el('p'); p.append(inline(para.join(' '))); out.append(p); para = []; } };
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (/^\s*$/.test(l)) { flush(); list = null; continue; }
      const h = l.match(/^(#{1,4})\s+(.*)$/);
      if (h) { flush(); list = null; const e = el(['h3', 'h3', 'h4', 'h5'][h[1].length - 1]); e.append(inline(h[2])); out.append(e); continue; }
      const li = l.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
      if (li) { flush(); if (!list) { list = el(/^\s*\d/.test(l) ? 'ol' : 'ul'); out.append(list); } const e = el('li'); e.append(inline(li[1])); list.append(e); continue; }
      if (/^\s*\|/.test(l) && L[i + 1] && /^\s*\|[\s:|-]+\|\s*$/.test(L[i + 1])) {
        flush(); list = null;
        const cells = (s) => s.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const t = el('table', null, 'gm-table gm-compact'); const th = el('thead'); const hr = el('tr');
        for (const c of cells(l)) { const e = el('th'); e.append(inline(c)); hr.append(e); }
        th.append(hr); t.append(th); const tb = el('tbody'); i += 2;
        while (i < L.length && /^\s*\|/.test(L[i])) { const tr = el('tr'); for (const c of cells(L[i])) { const e = el('td', null, /^[−+\-]?[\d.,]+%?(bp)?$/.test(c) ? 'gm-num' : ''); e.append(inline(c)); tr.append(e); } tb.append(tr); i++; }
        i--; t.append(tb); const w = el('div', null, 'gm-tablewrap'); w.append(t); out.append(w); continue;
      }
      if (/^>\s?/.test(l)) { flush(); const q = el('blockquote'); q.append(inline(l.replace(/^>\s?/, ''))); out.append(q); continue; }
      list = null; para.push(l.trim());
    }
    flush();
    return out;
  };

  // a list item from text with **bold** markup (critical insight emphasis)
  const li = (text) => { const e = el('li'); e.append(inline(String(text))); return e; };

  // emphasis for the older pages' insight bullets: bold the lead phrase before the first colon
  const emphasize = (root) => {
    for (const item of root.querySelectorAll('ul.gm-bul > li, ul#td-sum > li, ul.td-list > li, .gm-insights .gm-v')) {
      if (item.dataset.xem === item.textContent || item.querySelector('strong, b, a, button, svg')) continue;
      const tx = item.textContent, k = tx.indexOf(': ');
      if (k > 2 && k <= 64 && item.childNodes.length === 1 && item.firstChild.nodeType === 3) {
        const s = document.createElement('strong'); s.textContent = tx.slice(0, k + 1);
        item.replaceChildren(s, document.createTextNode(tx.slice(k + 1)));
      }
      item.dataset.xem = item.textContent;
    }
  };
  let emT = 0;
  new MutationObserver(() => { clearTimeout(emT); emT = setTimeout(() => { const r = document.getElementById('dash-root') || document.body; emphasize(r); }, 60); })
    .observe(document.getElementById('dash-root') || document.body, { childList: true, subtree: true });

  // ---- page registry ----
  const pages = {}, built = {}, blocks = {};
  const current = () => document.body.dataset.page || '';
  const draw = () => {
    const p = current(), fn = pages[p];
    if (!fn) return;
    const sec = document.getElementById(p);
    if (!sec || sec.hidden) return;
    if (!built[p]) { const t = document.getElementById(blocks[p] || 'tpl-' + p); if (t && (!blocks[p] || !sec.querySelector('[data-xblock]'))) sec.append(t.content.cloneNode(true)); built[p] = !!t || !blocks[p]; }
    try { fn(sec); } catch (e) { console.error('GMX page ' + p, e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e); }
  };
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['data-page'] });
  let lastW = 0;
  window.addEventListener('resize', () => { const w = document.documentElement.clientWidth; if (Math.abs(w - lastW) > 20) { lastW = w; schedule(); } });
  dash.onData(schedule);
  const go = (page) => { const b = document.querySelector(`.gm-sub[data-page="${page}"]`) || document.querySelector(`.gm-tab[data-sec="${page}"]`); if (b) b.click(); };

  return { $, $$, el, ok, rows, bad, isNum, pct, pp, bp, fx, money, mon, placeholder, failed, seg, table, tone, line, bars, hbars, md, showTip, hideTip, PAL,
    page: (id, fn, opt) => { pages[id] = fn; if (opt && opt.block) blocks[id] = opt.block; schedule(); }, redraw: schedule, go, li, rangeBar, cutoff };
})();
