// This week: one screen with every decision the models make, what changed since the last saved review, what to watch,
// and the data warnings. Each card links to the full page. Data: model_sb, model_fi, model_ra, model_pm, fx_model,
// model_log, weekly_note, dq_report.
(() => {
  const G = window.GMX;
  if (!G) return;
  const { el, $, isNum } = G;
  const M = '−';
  const pc = (x, d = 0) => (!isNum(x) ? '—' : (x * 100).toFixed(d) + '%');
  const sp = (x, d = 0) => (!isNum(x) ? '—' : (x >= 0 ? '+' : M) + Math.abs(x * 100).toFixed(d) + '%');
  const s2 = (x) => (!isNum(x) ? '—' : (x >= 0 ? '+' : M) + Math.abs(x).toFixed(2));
  const one = (id) => (G.ok(id) ? G.rows(id)[0] : null);
  const IDS = ['model_sb', 'model_fi', 'model_ra', 'model_pm', 'fx_model', 'model_log', 'weekly_note', 'dq_report', 'pipeline_checks'];
  const card = (title, go, head, lines, tone) => {
    const c = el('div', null, 'x-wk-card' + (tone ? ' x-wk-' + tone : ''));
    const h = el('div', null, 'x-wk-ch');
    h.append(el('span', title, 'x-wk-t'));
    if (go) { const b = el('button', 'Open', 'gm-linkbtn'); b.type = 'button'; b.addEventListener('click', () => G.go(go)); h.append(b); }
    c.append(h, el('div', head, 'x-wk-head'));
    const ul = el('ul', null, 'x-wk-l');
    for (const l of lines.filter(Boolean)) ul.append(G.li(l));
    c.append(ul);
    return c;
  };
  G.page('week', (sec) => {
    const box = $('#wk', sec);
    if (!box) return;
    if (IDS.some(G.bad)) { /* draw what loaded; a card says what is missing */ }
    if (!['model_sb', 'model_fi', 'model_log'].every(G.ok)) { G.placeholder(box, 'Loading this week’s calls…'); return; }
    const sb = one('model_sb'), fi = one('model_fi'), ra = one('model_ra'), pm = one('model_pm'), fx = one('fx_model');
    const log = G.rows('model_log'), cur = log[log.length - 1] || {}, prev = log.length > 1 ? log[log.length - 2] : null;
    const note = G.ok('weekly_note') ? G.rows('weekly_note') : [];
    const sect = (h) => { const s = note.find((x) => x.heading === h); return s ? String(s.text || '').split('\n').filter(Boolean) : []; };
    const cards = [];
    // 1. stocks vs bonds
    const w = sb.equityWeight, n = sb.neutral, tilt = (w - n) * 100;
    cards.push(card('Stocks vs bonds', 'sb', `${pc(w)} equities`,
      [`${Math.abs(tilt) < 1 ? 'Neutral' : (tilt > 0 ? 'Overweight' : 'Underweight') + ' by ' + Math.abs(tilt).toFixed(0) + ' points'} against a ${pc(n)} neutral (signal ${s2(sb.score)}).`,
        prev && isNum(prev.sbWeight) ? `${Math.abs(w - prev.sbWeight) < 0.005 ? 'Unchanged' : (w > prev.sbWeight ? 'Up ' : 'Down ') + Math.abs((w - prev.sbWeight) * 100).toFixed(0) + ' points'} since ${prev.date}.` : ''], Math.abs(tilt) >= 5 ? 'on' : null));
    // 2. bonds
    const L = fi.levers || [], dur = L.find((l) => l.key === 'duration');
    const durYrs = dur && isNum(dur.position) ? dur.position * (dur.durGap || 14) : null;
    const held = L.filter((l) => l.key !== 'duration' && isNum(l.position) && Math.abs(l.position) >= 0.005).sort((a, b) => Math.abs(b.position) - Math.abs(a.position));
    cards.push(card('Bonds against the Agg', 'firv', held.length ? held.map((l) => `${l.label} ${sp(l.position)}`).join(', ') : 'At benchmark',
      [`Duration ${isNum(durYrs) && Math.abs(durYrs) >= 0.05 ? (durYrs > 0 ? '+' : M) + Math.abs(durYrs).toFixed(1) + ' years' : 'at the Agg'}.`,
        isNum(fi.durationDiff) ? `All tilts together: ${(fi.durationDiff >= 0 ? '+' : M) + Math.abs(fi.durationDiff).toFixed(2)} years of US-rate exposure against the Agg.` : '',
        `${L.filter((l) => !isNum(l.position)).map((l) => l.label).join(' and ') || 'No lever'} without a live signal.`], held.length ? 'on' : null));
    // 3. equities
    const top = cur.eqTop || [], bot = cur.eqBottom || [];
    const bl = sect('Equities: bottom line'), watchEq = bl.find((x) => /^Watch/.test(x));
    cards.push(card('Equities', 'scoreboard', top.length ? 'Prefer ' + top.slice(0, 3).join(', ') : 'No strong preferences',
      [bot.length ? `Avoid ${bot.slice(0, 3).join(', ')}.` : '', prev && prev.eqTop && JSON.stringify(prev.eqTop) !== JSON.stringify(top) ? `Changed since ${prev.date}: was ${prev.eqTop.slice(0, 4).join(', ')}.` : 'Same preferences as the last review.', watchEq ? watchEq.replace(/\*\*/g, '') : ''], 'on'));
    // 4. diversifiers
    if (ra) {
      const A = (ra.assets || []).filter((a) => a.sleeveWeight > 0.005).sort((a, b) => b.sleeveWeight - a.sleeveWeight);
      cards.push(card('Diversifiers', 'ra', A.length ? A.slice(0, 4).map((a) => `${a.label.replace('Broad commodities', 'Commodities')} ${pc(a.sleeveWeight)}`).join(', ') : 'None favored',
        [A.length > 4 ? `Also ${A.slice(4).map((a) => `${a.label} ${pc(a.sleeveWeight)}`).join(', ')}.` : '', 'Shares of the diversifier sleeve, weighted by score over volatility; the sleeve is 0% of the portfolio unless you set it.',
          (ra.assets || []).filter((a) => a.score < -0.15).length ? `Out: ${(ra.assets || []).filter((a) => a.score < -0.15).map((a) => a.label).join(', ')}.` : ''], null));
    }
    // 5. currencies
    if (fx) {
      const dxy = (fx.aggregates || []).find((a) => a.code === 'DXY'), C = fx.currencies || [];
      const big = C.filter((c) => isNum(c.combined) && Math.abs(c.combined) >= 0.25).sort((a, b) => b.combined - a.combined);
      const hedge = C.filter((c) => ['EUR', 'JPY', 'GBP'].includes(c.code) && isNum(c.hedgeRatio));
      cards.push(card('Currencies', 'fxm', dxy && isNum(dxy.combined) ? `Dollar ${Math.abs(dxy.combined) < 0.1 ? 'neutral' : dxy.combined > 0 ? 'favored' : 'disfavored'} (${s2(dxy.combined)})` : 'No dollar view',
        [big.length ? `Strongest views: ${big.slice(0, 4).map((c) => `${c.code} ${s2(c.combined)}`).join(', ')}.` : 'No currency view beyond ±0.25.',
          hedge.length ? `Suggested hedge on developed equities: ${hedge.map((c) => `${c.code} ${pc(c.hedgeRatio)}`).join(', ')}.` : '',
          prev && isNum(prev.dxy) && dxy && isNum(dxy.combined) && Math.abs(dxy.combined - prev.dxy) >= 0.05 ? `Dollar view moved ${s2(dxy.combined - prev.dxy)} since ${prev.date}.` : ''], null));
    }
    // 6. private markets
    if (pm) {
      const P = pm.pairs || [], call = (p) => (!isNum(p.score) ? 'no call' : p.score > 0.1 ? 'favor ' + p.long : p.score < -0.1 ? 'favor ' + p.short : 'neutral');
      cards.push(card('Private markets (listed proxies)', 'ra', P.map((p) => `${p.long}/${p.short}: ${call(p)}`).join('; '),
        [isNum(pm.bdcPriceToBook) ? `BDCs at ${pm.bdcPriceToBook.toFixed(2)}x book (median ${pm.bdcPriceToBookMedian.toFixed(2)}x).` : '', 'Relative-value calls only; not held in the model portfolio.'], P.some((p) => isNum(p.score) && Math.abs(p.score) > 0.1) ? 'on' : null));
    }
    // what changed and what to watch
    const ch = [];
    if (prev) {
      if (Math.abs((cur.sbWeight || 0) - (prev.sbWeight || 0)) >= 0.01) ch.push(`Equity weight ${pc(cur.sbWeight)} from ${pc(prev.sbWeight)}.`);
      for (const l of L) { const a = (prev.fi || {})[l.key] || 0, b = (cur.fi || {})[l.key] || 0; if (Math.abs(b - a) >= 0.01 && l.key !== 'duration') ch.push(`${l.label}: ${sp(b)} from ${sp(a)}.`); }
      for (const [k, v] of Object.entries(cur.ra || {})) { const p = (prev.ra || {})[k]; if (isNum(p) && isNum(v) && (p > 0.1) !== (v > 0.1)) ch.push(`Diversifier ${k}: score ${s2(v)} from ${s2(p)}.`); }
      for (const [k, v] of Object.entries(cur.pm || {})) { const p = (prev.pm || {})[k]; if (k in (prev.pm || {}) && (isNum(p) ? Math.sign(Math.round(p * 5)) : 0) !== (isNum(v) ? Math.sign(Math.round(v * 5)) : 0)) ch.push(`Private markets ${k}: ${isNum(v) ? s2(v) : 'no call'} from ${isNum(p) ? s2(p) : 'no call'}.`); }
      if (cur.regime && prev.regime && cur.regime !== prev.regime) ch.push(`Backdrop: ${prev.regime} to ${cur.regime}.`);
    }
    const watch = sect("What's changing").slice(0, 3).map((x) => x.replace(/\*\*/g, ''));
    const dq = G.ok('dq_report') ? G.rows('dq_report').filter((x) => x.level === 'Warning') : [];
    const pc_ = G.ok('pipeline_checks') ? G.rows('pipeline_checks')[0] : null;
    box.replaceChildren();
    const hd = el('div', null, 'gm-hrow');
    hd.append(el('h2', 'This week', 'gm-h2'), el('span', `Calls saved ${cur.date || '—'}${prev ? ', compared with ' + prev.date : ''}`, 'gm-note'));
    const grid = el('div', null, 'x-wk-grid'); grid.append(...cards);
    const low = el('div', null, 'x-wk-low');
    const col = (h, items, empty) => { const c = el('div', null, 'x-wk-col'); c.append(el('h3', h, 'gm-h3')); const u = el('ul', null, 'gm-bul'); u.append(...(items.length ? items : [empty]).map(G.li)); c.append(u); return c; };
    low.append(col('What changed', ch, prev ? 'No material change in the calls since the last review.' : 'No earlier saved review yet.'),
      col('Watch', watch, 'Nothing unusual this week.'),
      col('Data and build checks', [...(dq.length ? [`${dq.length} data warning${dq.length > 1 ? 's' : ''}: ${[...new Set(dq.map((x) => x.etf))].join(', ')}; those sleeves’ scores are less reliable.`] : ['No data warnings.']),
        ...(pc_ ? (pc_.failures && pc_.failures.length ? [`**${pc_.failures.length} build check${pc_.failures.length > 1 ? 's' : ''} failed** (${pc_.date}): ${pc_.failures.slice(0, 2).join('; ')}${pc_.failures.length > 2 ? '…' : ''}`] : [`Build checks: all ${pc_.passed} passed (${pc_.date}).`]) : [])], 'No data warnings.'));
    const foot = el('p', 'Every figure is the latest Saturday rebuild. The Executive summary has the evidence and the conditions that would reverse each call.', 'gm-note');
    box.append(hd, grid, low, foot);
  });
})();
