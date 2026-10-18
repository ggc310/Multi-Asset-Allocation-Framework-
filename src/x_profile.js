// Companies → Company profile. The largest ~300 holdings across the universe are prepared weekly
// (profiles: FMP profile, statements, key metrics, estimates, earnings results, peers, weekly prices),
// combined with the holdings data (constituents, fund_holdings), live sleeve scores and earnings-call scores.
// Inside Claude, any other ticker loads live from FMP (cp_profile, cp_income, cp_metrics, cp_px, set by the
// cp_sym filter); on a static copy of the page those four are unavailable and the page says so.
(() => {
  const G = window.GMX, { el, $, isNum, pct, fx, money } = G;
  const SECTOR_ETF = { Technology: 'XLK', 'Communication Services': 'XLC', 'Consumer Cyclical': 'XLY', 'Consumer Defensive': 'XLP', Healthcare: 'XLV', 'Financial Services': 'XLF', Industrials: 'XLI', Energy: 'XLE', 'Basic Materials': 'XLB', Utilities: 'XLU', 'Real Estate': 'XLRE' };
  const S = { sym: null, rel: 'price' };
  const TOPIC = { ai: 'AI', tariffs: 'Tariffs', pricing: 'Pricing', costs: 'Costs', labor: 'Labor', demand_weak: 'Softer demand', consumer: 'Consumer', credit: 'Credit', rates: 'Rates', capex: 'Capex', layoffs: 'Layoffs', recession: 'Recession', china: 'China', supply: 'Supply chain' };
  G.openCompany = (sym) => { S.sym = sym; G.go('profile'); G.redraw(); };
  let IDX = null;
  const index = () => {
    const pr = G.rows('profiles');
    if (IDX && IDX.pr === pr) return IDX;
    IDX = { pr, by: new Map(pr.map((p) => [p.symbol, p])) };
    return IDX;
  };
  const D = (s) => new Date(String(s).slice(0, 10) + 'T12:00:00Z');
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '')) ? String(u) : null);
  const at = (s, d) => { if (!s || !s.length || s[0][0] > d) return null; let lo = 0, hi = s.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m][0] <= d) lo = m; else hi = m - 1; } return s[lo][1]; };
  const tile = (k, v, sub) => { const t = el('div', null, 'x-tile'); t.append(el('div', k, 'x-tile-k'), el('div', v, 'x-tile-v')); if (sub) t.append(el('div', sub, 'x-tile-s')); return t; };
  // live lookups need Claude's connector; the static copy's runtime exposes dash.manifest and has none
  const live = () => typeof dash.manifest !== 'function';

  const header = (sec, p, c, liveProf) => {
    const P = liveProf || {};
    $('#cp-name', sec).textContent = (p && p.name) || P.companyName || (c && c.name) || S.sym;
    const bits = [S.sym, (p && p.exchange) || P.exchange, (p && p.sector) || P.sector || (c && c.sector), (p && p.industry) || P.industry, (p && p.country) || P.country].filter(Boolean);
    $('#cp-sub', sec).textContent = bits.join(' · ');
    const cur = (p && p.currency) || P.currency || (c && c.currency);
    const price = (c && c.price) ?? P.price ?? (p && p.px && p.px.length ? p.px[p.px.length - 1][1] : null);
    const mc = (c && c.marketCap) ?? P.marketCap;
    const tiles = $('#cp-tiles', sec); tiles.replaceChildren();
    tiles.append(tile('Price', isNum(price) ? fx(price, price >= 1000 ? 0 : 2) + (cur && cur !== 'USD' ? ' ' + cur : '') : '—', ((p && p.range) || P.range) ? '52 weeks: ' + ((p && p.range) || P.range) : null));
    tiles.append(tile('Market value', money(mc, cur)));
    if (c) {
      tiles.append(tile('Forward P/E', fx(c.fwdPEc ?? (isNum(c.price) && isNum(c.fy1Eps) && c.fy1Eps > 0 ? c.price / c.fy1Eps : null), 1), 'P/E, trailing ' + fx(c.peTTM, 1)));
      tiles.append(tile('EV/EBITDA', fx(c.evEbitdaTTM, 1), 'P/S ' + fx(c.psTTM, 1) + ' · P/B ' + fx(c.pbTTM, 1)));
      tiles.append(tile('Free-cash-flow yield', pct(c.fcfYieldTTM, 1, false), 'Dividend yield ' + pct(c.divYieldTTM, 1, false)));
      tiles.append(tile('Return on invested capital', pct(c.roicTTM, 0, false), 'ROE ' + pct(c.roeTTM, 0, false)));
      tiles.append(tile('Margins', pct(c.opMarginTTM, 0, false) + ' operating', pct(c.netMarginTTM, 0, false) + ' net' + (isNum(c.marginTrend) ? ' · trend ' + (c.marginTrend >= 0 ? '+' : '−') + Math.abs(c.marginTrend * 100).toFixed(1) + ' pts' : '')));
      tiles.append(tile('Net debt / EBITDA', fx(c.netDebtToEbitdaTTM, 1), 'Net share issuance ' + pct(c.netIssuance, 1)));
      const up = isNum(c.targetConsensus) && isNum(c.price) ? c.targetConsensus / c.price - 1 : null;
      tiles.append(tile('Analyst target', isNum(c.targetConsensus) ? fx(c.targetConsensus, 2) : '—', up != null ? pct(up, 0) + ' from here (' + fx(c.targetLow, 0) + ' to ' + fx(c.targetHigh, 0) + ')' : null));
      const buy = (c.gradesStrongBuy || 0) + (c.gradesBuy || 0), hold = c.gradesHold || 0, sell = (c.gradesSell || 0) + (c.gradesStrongSell || 0);
      tiles.append(tile('Ratings', buy + hold + sell ? `${buy} buy · ${hold} hold · ${sell} sell` : '—', isNum(c.ratingDrift3m) ? 'Rating drift, 3 months ' + (c.ratingDrift3m >= 0 ? '+' : '−') + fx(Math.abs(c.ratingDrift3m), 2) : null));
      tiles.append(tile('EPS revisions, 4 weeks', pct(c.epsRev4w, 1), '13 weeks: ' + pct(c.epsRev13w, 1)));
    } else if (G.ok('cp_metrics') && G.rows('cp_metrics')[0]) {
      const m = G.rows('cp_metrics')[0];
      tiles.append(tile('EV/EBITDA', fx(m.evToEBITDATTM, 1), 'EV/sales ' + fx(m.evToSalesTTM, 1)));
      tiles.append(tile('Free-cash-flow yield', pct(m.freeCashFlowYieldTTM, 1, false), 'Earnings yield ' + pct(m.earningsYieldTTM, 1, false)));
      tiles.append(tile('Return on invested capital', pct(m.returnOnInvestedCapitalTTM, 0, false), 'ROE ' + pct(m.returnOnEquityTTM, 0, false)));
      tiles.append(tile('Net debt / EBITDA', fx(m.netDebtToEBITDATTM, 1)));
    }
    const about = $('#cp-about', sec); about.replaceChildren();
    const desc = (p && p.desc) || P.description;
    if (desc) {
      const cut = desc.length > 520 ? desc.slice(0, desc.lastIndexOf(' ', 500)) + '…' : null;
      about.append(el('p', cut || desc));
      if (cut) { const d = el('details', null, 'x-more'); d.append(el('summary', 'Read the full description'), el('p', desc)); d.addEventListener('toggle', () => { about.firstChild.hidden = d.open; }); about.append(d); }
    }
    const dl = el('dl', null, 'x-dl');
    const add = (k, v) => { if (v == null || v === '') return; dl.append(el('dt', k)); const dd = el('dd'); if (v instanceof Node) dd.append(v); else dd.textContent = v; dl.append(dd); };
    add('Chief executive', (p && p.ceo) || P.ceo); add('Employees', isNum((p && p.employees) || P.fullTimeEmployees) ? Number((p && p.employees) || P.fullTimeEmployees).toLocaleString('en-US') : null);
    add('Listed since', (p && p.ipo) || P.ipoDate); add('Beta', fx((p && p.beta) ?? P.beta, 2));
    const web = safeUrl((p && p.website) || P.website); if (web) { const a = el('a', web.replace(/^https?:\/\/(www\.)?/, '')); a.href = web; a.target = '_blank'; a.rel = 'noopener noreferrer'; add('Website', a); }
    about.append(dl);
  };

  const priceChart = (sec, px, sector) => {
    G.seg($('#cp-rel', sec), [['price', 'Price'], ['spy', 'vs S&P 500'], ['sector', 'vs sector']], S.rel, (v) => { S.rel = v; G.redraw(); });
    const box = $('#cp-px', sec);
    if (!px.length) return G.placeholder(box, 'No price history.');
    const bench = S.rel === 'spy' ? 'SPY' : S.rel === 'sector' ? SECTOR_ETF[sector] : null;
    if (bench) {
      const wk = G.rows('etf_weekly').filter((r) => r.symbol === bench).map((r) => [D(r.date), r.close]).sort((a, b) => a[0] - b[0]);
      if (!wk.length) return G.placeholder(box, 'No history for ' + bench + '.');
      const rel = px.map(([d, v]) => { const b = at(wk, d); return b ? [d, v / b] : null; }).filter(Boolean);
      const b0 = rel[0][1];
      G.line(box, [{ name: 'vs ' + bench, pts: rel.map(([d, v]) => [d, (100 * v) / b0]) }], { h: 260, ref: 100, yfmt: (v) => v.toFixed(0), fmt: (v) => v.toFixed(1) });
    } else G.line(box, [{ name: 'Price', pts: px }], { h: 260, yfmt: (v) => d3.format('~s')(v), fmt: (v) => fx(v, v >= 1000 ? 0 : 2) });
  };

  const statements = (sec, inc, est, cur) => {
    const yr = (r) => String(r.fy || r.d || r.date || '').slice(0, 4);
    const A = [...inc].sort((a, b) => ((a.d || a.date) < (b.d || b.date) ? -1 : 1));
    const E = (est || []).map((e) => ({ ...e, fy: String(e.d).slice(0, 4) }));
    const fm = (v) => money(v, cur).replace(' ' + cur, '');
    G.bars($('#cp-rev', sec), [...A.map((r) => ({ label: yr(r), v: r.rev ?? r.revenue })), ...E.map((e) => ({ label: e.fy, v: e.rev, est: true }))], { h: 190, fmt: (v) => d3.format('~s')(v).replace('G', 'B'), tfmt: fm });
    G.bars($('#cp-eps', sec), [...A.map((r) => ({ label: yr(r), v: r.eps ?? r.epsDiluted })), ...E.map((e) => ({ label: e.fy, v: e.eps, est: true }))], { h: 190, fmt: (v) => d3.format('.2~f')(v) });
    const m = (k) => A.map((r) => { const rev = r.rev ?? r.revenue; const v = r[k] ?? r[{ gp: 'grossProfit', op: 'operatingIncome', ni: 'netIncome' }[k]]; return isNum(rev) && rev && isNum(v) ? [D(r.d || r.date), v / rev] : null; }).filter(Boolean);
    G.line($('#cp-margins', sec), [{ name: 'Gross', pts: m('gp') }, { name: 'Operating', pts: m('op') }, { name: 'Net', pts: m('ni') }], { h: 190, yfmt: (v) => Math.round(v * 100) + '%', fmt: (v) => pct(v, 1, false), dfmt: '%Y', xfmt: '%Y', xticks: d3.utcYear.every(1) });
  };

  G.page('profile', (sec) => {
    const need = ['profiles', 'constituents'];
    const msg = $('#cp-msg', sec);
    if (need.some(G.bad)) { G.failed(msg, 'Company profiles'); return; }
    if (!need.every(G.ok)) { G.placeholder(msg); return; }
    const { pr, by } = index();
    const cons = new Map(G.rows('constituents').map((c) => [c.symbol, c]));
    if (!S.sym) S.sym = (dash.params().cp_sym && String(dash.params().cp_sym).toUpperCase()) || pr[0].symbol;

    // search
    const inp = $('#cp-in', sec), list = $('#cp-list', sec);
    if (list.childElementCount !== pr.length) list.replaceChildren(...pr.map((p) => { const o = el('option'); o.value = p.symbol; o.textContent = p.name; return o; }));
    if (!inp.dataset.wired) {
      const pick = () => {
        const v = inp.value.trim(); if (!v) return;
        const hit = pr.find((p) => p.symbol.toUpperCase() === v.toUpperCase()) || pr.find((p) => (p.name || '').toLowerCase().startsWith(v.toLowerCase())) || pr.find((p) => (p.name || '').toLowerCase().includes(v.toLowerCase()));
        S.sym = hit ? hit.symbol : v.toUpperCase();
        if (!hit) dash.setParams({ cp_sym: S.sym });
        inp.value = ''; G.redraw();
      };
      inp.addEventListener('change', pick); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
      $('#cp-go', sec).addEventListener('click', pick);
      $('#cp-quick', sec).addEventListener('click', (e) => { const b = e.target.closest('button[data-s]'); if (b) { S.sym = b.dataset.s; G.redraw(); } });
      inp.dataset.wired = '1';
    }
    $('#cp-quick', sec).replaceChildren(...pr.slice(0, 12).map((p) => { const b = el('button', p.symbol, 'x-chip'); b.type = 'button'; b.dataset.s = p.symbol; b.title = p.name; if (p.symbol === S.sym) b.setAttribute('aria-pressed', 'true'); return b; }));

    const p = by.get(S.sym), c = cons.get(S.sym);
    const body = $('#cp-body', sec);
    let liveProf = null, liveInc = [], livePx = [];
    if (!p) {
      if (!live()) { msg.textContent = `${S.sym} isn’t among the ${pr.length} companies prepared each week. In the Claude version of this dashboard, any ticker loads live from FMP.`; body.hidden = true; return; }
      if (dash.params().cp_sym !== S.sym) dash.setParams({ cp_sym: S.sym });
      const st = ['cp_profile', 'cp_income', 'cp_metrics', 'cp_px'].map((id) => dash.data(id));
      if (st.some((d) => d.status === 'loading' || d.refreshing)) { msg.textContent = 'Loading ' + S.sym + ' from FMP…'; }
      if (st[0].status !== 'ok' || !st[0].data.length) { if (st[0].status !== 'loading') msg.textContent = `FMP has no profile for ${S.sym}. Check the ticker (international listings need their exchange suffix, such as 7203.T or SAP.DE).`; body.hidden = !(st[0].status === 'ok' && st[0].data.length); if (body.hidden) return; }
      liveProf = st[0].data[0]; liveInc = st[1].status === 'ok' ? st[1].data : []; livePx = st[3].status === 'ok' ? st[3].data.map((r) => [D(r.date), Number(r.price ?? r.close)]).filter((x) => isNum(x[1])).sort((a, b) => a[0] - b[0]) : [];
      msg.textContent = `${S.sym} loaded live from FMP: profile, income statements, key metrics and prices. The fuller profile covers the ${pr.length} largest holdings.`;
    } else msg.textContent = '';
    body.hidden = false;
    header(sec, p, c, liveProf);
    const sector = (p && p.sector) || (liveProf && liveProf.sector) || (c && c.sector);
    priceChart(sec, p ? p.px.map(([d, v]) => [D(d), v]) : livePx, sector);
    const cur = (p && (p.reportedCurrency || p.currency)) || (liveInc[0] && liveInc[0].reportedCurrency) || 'USD';
    statements(sec, p ? p.inc_a : liveInc, p ? p.est : [], cur);
    for (const id of ['#cp-full']) $(id, sec).hidden = !p;
    if (!p) return;

    // quarterly
    const Q = [...p.inc_q].reverse();
    G.bars($('#cp-q', sec), Q.map((r) => ({ label: (r.p || '') + " '" + String(r.fy || '').slice(2), v: r.rev })), { h: 170, fmt: (v) => d3.format('~s')(v).replace('G', 'B'), tfmt: (v) => money(v, cur) });
    $('#cp-q-note', sec).textContent = Q.length ? 'Operating margin by quarter: ' + Q.map((r) => (r.rev ? Math.round((100 * r.op) / r.rev) + '%' : '—')).join(' · ') : '';

    // cash flow and balance sheet
    G.table($('#cp-cash', sec), [
      { t: 'Fiscal year', f: (r) => String(r.d).slice(0, 4) }, { t: 'Operating cash flow', num: true, f: (r) => money(r.cfo, cur) }, { t: 'Capex', num: true, f: (r) => money(r.capex, cur) },
      { t: 'Free cash flow', num: true, f: (r) => money(r.fcf, cur) }, { t: 'Buybacks', num: true, f: (r) => money(r.buyback, cur) }, { t: 'Dividends', num: true, f: (r) => money(r.div, cur) }, { t: 'Stock comp', num: true, f: (r) => money(r.sbc, cur) },
    ], p.cf_a);
    const b = p.bal[0] || {};
    $('#cp-bal', sec).replaceChildren(...[['Cash and investments', b.cash], ['Total debt', b.debt], ['Net debt', b.netDebt], ['Shareholders’ equity', b.equity], ['Total assets', b.assets]].map(([k, v]) => tile(k, money(v, cur))));

    // earnings record
    const today = new Date().toISOString().slice(0, 10);
    const er = p.earn.filter((r) => r.d);
    const next = er.filter((r) => r.d >= today && r.a == null).sort((a, b) => (a.d < b.d ? -1 : 1))[0];
    $('#cp-next', sec).textContent = next ? `Next report ${G.mon(next.d)}: EPS expected ${fx(next.e, 2)}, revenue ${money(next.re, cur)}.` : '';
    G.table($('#cp-earn', sec), [
      { t: 'Reported', f: (r) => r.d }, { t: 'EPS expected', num: true, f: (r) => fx(r.e, 2) }, { t: 'EPS actual', num: true, f: (r) => fx(r.a, 2) },
      { t: 'Surprise', num: true, f: (r) => (isNum(r.a) && isNum(r.e) && r.e ? pct(r.a / Math.abs(r.e) - Math.sign(r.e), 1) : '—'), cls: (r) => (isNum(r.a) && isNum(r.e) ? G.tone(r.a - r.e, 0) : '') },
      { t: 'Revenue expected', num: true, f: (r) => money(r.re, cur) }, { t: 'Revenue actual', num: true, f: (r) => money(r.ra, cur) },
      { t: 'Revenue surprise', num: true, f: (r) => (isNum(r.ra) && isNum(r.re) && r.re ? pct(r.ra / r.re - 1, 1) : '—'), cls: (r) => (isNum(r.ra) && isNum(r.re) ? G.tone(r.ra - r.re, 0) : '') },
    ], er.filter((r) => r.a != null).slice(0, 8));

    // valuation and returns history
    G.table($('#cp-km', sec), [
      { t: 'Fiscal year', f: (r) => String(r.d).slice(0, 4) }, { t: 'EV/EBITDA', num: true, f: (r) => fx(r.evEbitda, 1) }, { t: 'EV/sales', num: true, f: (r) => fx(r.evSales, 1) },
      { t: 'FCF yield', num: true, f: (r) => pct(r.fcfY, 1, false) }, { t: 'Earnings yield', num: true, f: (r) => pct(r.earnY, 1, false) }, { t: 'ROIC', num: true, f: (r) => pct(r.roic, 0, false) }, { t: 'ROE', num: true, f: (r) => pct(r.roe, 0, false) }, { t: 'Net debt/EBITDA', num: true, f: (r) => fx(r.nde, 1) },
    ], p.km);

    // estimates
    G.table($('#cp-est', sec), [
      { t: 'Fiscal year', f: (r) => String(r.d).slice(0, 4) }, { t: 'Revenue', num: true, f: (r) => money(r.rev, cur) }, { t: 'EPS', num: true, f: (r) => fx(r.eps, 2) },
      { t: 'EPS range', num: true, f: (r) => fx(r.epsLo, 2) + ' to ' + fx(r.epsHi, 2) }, { t: 'Analysts', num: true, f: (r) => r.n ?? '—' },
    ], p.est);

    // earnings-call tone (S&P 500 members)
    const callBox = $('#cp-calls', sec);
    const calls = G.ok('call_scores') ? G.rows('call_scores').filter((r) => r.symbol === S.sym && !r.missing && isNum(r.tone)).sort((a, b) => (a.date < b.date ? -1 : 1)) : [];
    $('#cp-calls-wrap', sec).hidden = !calls.length;
    if (calls.length) {
      G.line(callBox, [{ name: 'Whole call', pts: calls.map((r) => [D(r.date), r.tone]) }, { name: 'Q&A', pts: calls.filter((r) => isNum(r.qaTone)).map((r) => [D(r.date), r.qaTone]), dash: '4 3' }], { h: 200, fmt: (v) => fx(v, 3), yfmt: (v) => v.toFixed(2) });
      const lastC = calls[calls.length - 1], prev = calls.slice(-9, -1);
      const rowsT = Object.keys(TOPIC).map((k) => ({ k, now: lastC['t_' + k] || 0, avg: prev.length ? d3.mean(prev, (r) => r['t_' + k] || 0) : null })).filter((r) => r.now || r.avg).sort((a, b) => b.now - a.now);
      $('#cp-calls-note', sec).textContent = `Latest call ${G.mon(lastC.date)}: tone ${fx(lastC.tone, 3)}, Q&A ${fx(lastC.qaTone, 3)}, uncertainty ${fx(lastC.unc, 2)} per 1,000 words` + (lastC.t_guide_up > 0 ? '; mentions raising guidance' : '') + (lastC.t_guide_down > 0 ? '; mentions lowering guidance' : '') + '.';
      G.table($('#cp-topics', sec), [{ t: 'Topic', f: (r) => TOPIC[r.k] }, { t: 'Latest call, per 10,000 words', num: true, f: (r) => fx(r.now, 1) }, { t: 'Average of the eight before', num: true, f: (r) => fx(r.avg, 1) }], rowsT);
    }

    // in the universe
    const lab = Object.fromEntries(G.rows('etf_universe').map((u) => [u.etf, u.label]));
    const sh = G.rows('score_history'); const lastD = d3.max(sh, (r) => r.date);
    const scoreNow = Object.fromEntries(sh.filter((r) => r.date === lastD).map((r) => [r.etf, r.cmp_equal_contra ?? r.composite]));
    G.table($('#cp-funds', sec), [
      { t: 'Held in', f: ([e]) => (lab[e] || e) + ' (' + e + ')' }, { t: 'Weight in fund', num: true, f: ([, w]) => fx(w, 2) + '%' }, { t: 'Sleeve score now', num: true, f: ([e]) => fx(scoreNow[e], 0) },
    ], p.funds);

    // peers
    G.table($('#cp-peers', sec), [
      { t: 'Peer', f: (r) => r.n || r.s }, { t: 'Ticker', f: (r) => r.s, cls: 'td-sym' }, { t: 'Market value', num: true, f: (r) => money(r.mc, (cons.get(r.s) || {}).currency) },
      { t: 'Forward P/E', num: true, f: (r) => fx((cons.get(r.s) || {}).fwdPEc, 1) }, { t: 'EV/EBITDA', num: true, f: (r) => fx((cons.get(r.s) || {}).evEbitdaTTM, 1) }, { t: 'ROIC', num: true, f: (r) => pct((cons.get(r.s) || {}).roicTTM, 0, false) },
    ], p.peers, { onRow: (r) => { if (by.has(r.s)) { S.sym = r.s; G.redraw(); } } });
  });
})();
