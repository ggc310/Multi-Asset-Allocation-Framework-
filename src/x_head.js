// The page header under the title: market status, the current calls as a strip of chips (one per decision, with
// its evidence grade, each opening its model), a live cross-asset pulse, and an optional one-line reason per call.
// Uses the decision summary's own views (x_exec.js), so the header and the Executive summary always agree.
(() => {
  const G = window.GMX, { el, $, isNum } = G;
  const M = '−';
  const pc = (x, d = 1) => (!isNum(x) ? '—' : (x > 0 ? '+' : x < 0 ? M : '') + Math.abs(x * 100).toFixed(d) + '%');
  const bpx = (x) => (!isNum(x) ? '—' : (x > 0 ? '+' : x < 0 ? M : '') + Math.abs(x).toFixed(0) + 'bp');
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
  let showWhy = store.get('gmaaf-why') === '1';
  const PULSE = [['SPY', 'S&P 500'], ['QQQ', 'Nasdaq 100'], ['EFA', 'Dev ex-US'], ['EEM', 'EM'], ['UST10Y', '10-yr'], ['HYG', 'High yield'], ['DXUSD', 'Dollar'], ['CLUSD', 'WTI'], ['GCUSD', 'Gold'], ['BTCUSD', 'Bitcoin'], ['^VIX', 'VIX']];
  const session = () => {
    const ny = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const d = ny.getDay(), m = ny.getHours() * 60 + ny.getMinutes();
    if (d === 0 || d === 6) return ['Closed', 'off'];
    return m < 570 ? ['Pre-market', 'pre'] : m < 960 ? ['Market open', 'on'] : ['After the close', 'off'];
  };

  const draw = () => {
    const box = $('#gh'); if (!box) return;
    // status pill beside the title
    const pill = $('#gh-status');
    if (pill) { const [t, k] = session(); pill.textContent = t; pill.className = 'x-gh-pill x-gh-' + k; }
    // the calls
    let V = [];
    try { V = window.GMXD && G.ok('model_sb') && G.ok('model_fi') ? window.GMXD.views() : []; } catch (e) { console.error('header views', e); }
    const ms = G.ok('macro_state') ? G.rows('macro_state')[0] : null;
    const pick = ['sb', 'dur', 'fi', 'eqr', 'eqs', 'usd'];
    const NAME = { sb: 'Stocks vs bonds', dur: 'Duration', fi: 'Bond sectors', eqr: 'Equity regions', eqs: 'Equity style', usd: 'Dollar' };
    const calls = el('div', null, 'x-gh-calls');
    for (const id of pick) {
      const v = V.find((x) => x.id === id); if (!v) continue;
      const b = el('button', null, 'x-gh-chip'); b.type = 'button'; b.title = (v.because ? 'Why: ' + v.because + ' ' : '') + 'Evidence: ' + v.ev.label[0] + '. Click to open the model.';
      b.append(el('span', NAME[id], 'x-gh-k'), el('span', v.tilt.replace(/ equities$/, ' equity'), 'x-gh-v'), el('i', null, 'x-gh-dot x-gh-ev-' + v.ev.label[1]));
      b.addEventListener('click', () => G.go(v.go)); calls.append(b);
    }
    if (ms && ms.quadrant) {
      const b = el('button', null, 'x-gh-chip'); b.type = 'button'; b.title = Object.values(ms.axes || {}).map((a) => `${a.state} (${Math.round((a.prob || 0) * 100)}%)`).join(', ');
      b.append(el('span', 'Backdrop', 'x-gh-k'), el('span', ms.quadrant, 'x-gh-v')); b.addEventListener('click', () => G.go('macro')); calls.append(b);
    }
    const tg = el('button', showWhy ? 'Hide reasons' : 'Why?', 'x-gh-why'); tg.type = 'button'; tg.setAttribute('aria-expanded', String(showWhy));
    tg.addEventListener('click', () => { showWhy = !showWhy; store.set('gmaaf-why', showWhy ? '1' : '0'); draw(); });
    if (V.length) calls.append(tg);
    // reasons, one line per call
    const why = el('ul', null, 'x-gh-reasons'); why.hidden = !showWhy;
    for (const id of pick) { const v = V.find((x) => x.id === id); if (v && v.because) { const li = el('li'); li.append(el('b', NAME[id] + ': '), document.createTextNode(v.because.replace(/^(.)/, (c) => c.toUpperCase()))); why.append(li); } }
    // live pulse
    const pulse = el('div', null, 'x-gh-pulse');
    if (G.ok('today_moves')) {
      const by = new Map(G.rows('today_moves').map((r) => [r.symbol, r]));
      for (const [s, l] of PULSE) {
        const r = by.get(s); if (!r || !isNum(r.d1)) continue;
        const it = el('span', null, 'x-gh-p');
        const up = r.unit === 'bp' || s === '^VIX' ? -r.d1 : r.d1;
        const lvl = isNum(r.level) ? (r.unit === 'bp' ? Number(r.level).toFixed(2) + '%' : s === 'DXUSD' || s === '^VIX' ? Number(r.level).toFixed(1) : Number(r.level) >= 1000 ? Math.round(r.level).toLocaleString('en-US') : Number(r.level).toFixed(2)) : '';
        it.append(el('span', l, 'x-gh-pk'), el('span', lvl, 'x-gh-pl'), el('span', r.unit === 'bp' ? bpx(r.d1) : pc(r.d1), 'x-gh-pd ' + (Math.abs(up) < 1e-9 ? '' : up > 0 ? 'x-up' : 'x-dn')));
        pulse.append(it);
      }
    }
    box.replaceChildren(calls, why, pulse);
    if (!V.length && !pulse.childElementCount) box.append(el('p', 'Loading the calls and markets…', 'gm-note'));
  };
  let raf = 0; const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  dash.onData(schedule);
  document.addEventListener('gm-mp', schedule);
  setInterval(() => { const p = $('#gh-status'); if (p) { const [t, k] = session(); p.textContent = t; p.className = 'x-gh-pill x-gh-' + k; } }, 60000);
})();
