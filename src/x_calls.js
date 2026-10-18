// Companies → Earnings calls. Every S&P 500 earnings call since 2014, scored for tone, Q&A tone,
// uncertainty, topic mentions and guidance changes (the weekly pipeline's transcripts.py; transcript text is
// not kept). Data: call_scores, call_index, call_sleeves, call_tests, call_meta, commentary.
(() => {
  const G = window.GMX, { el, $, isNum, pct, fx } = G;
  const TOPIC = { ai: 'AI and data centers', tariffs: 'Tariffs and trade', pricing: 'Pricing power', costs: 'Cost inflation', labor: 'Labor and hiring', demand_weak: 'Softer demand',
    consumer: 'The consumer', credit: 'Credit quality', rates: 'Interest rates', capex: 'Capex and capacity', layoffs: 'Layoffs and restructuring', recession: 'Recession', china: 'China', supply: 'Supply chains' };
  const METRIC = { tone: ['Tone of the whole call', (v) => fx(v, 3)], qaTone: ['Tone in Q&A', (v) => fx(v, 3)], gap: ['Prepared remarks minus Q&A', (v) => fx(v, 3)], unc: ['Uncertainty words per 1,000', (v) => fx(v, 2)], guide: ['Net guidance raised (share of calls)', (v) => pct(v, 0)] };
  const S = { metric: 'tone', sector: 'All', mover: 'improved' };
  let C = null;
  const qOf = (d) => { const y = +d.slice(0, 4), m = +d.slice(5, 7); return y * 10 + Math.ceil(m / 3); };
  const qLab = (q) => ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'][(q % 10) - 1] + ' ' + Math.floor(q / 10);
  const qDate = (q) => new Date(Date.UTC(Math.floor(q / 10), ((q % 10) - 1) * 3 + 1, 15, 12));
  const build = () => {
    const sc = G.rows('call_scores'), meta = G.rows('call_meta');
    if (C && C.sc === sc && C.meta === meta) return C;
    const calls = sc.filter((r) => !r.missing && isNum(r.tone) && r.date).map((r) => ({ ...r, Q: qOf(r.date) }));
    const name = new Map(meta.map((m) => [m.symbol, m])); const sector = (s) => (name.get(s) && name.get(s).sector) || 'Other';
    const byQ = d3.group(calls.filter((r) => r.member !== false), (r) => r.Q);
    const quarters = [...byQ.keys()].sort((a, b) => a - b);
    const agg = (xs) => ({ n: xs.length, tone: d3.mean(xs, (r) => r.tone), qaTone: d3.mean(xs.filter((r) => isNum(r.qaTone)), (r) => r.qaTone), gap: d3.mean(xs.filter((r) => isNum(r.qaTone)), (r) => r.tone - r.qaTone),
      unc: d3.mean(xs, (r) => r.unc), up: xs.filter((r) => r.t_guide_up > 0).length / xs.length, dn: xs.filter((r) => r.t_guide_down > 0).length / xs.length,
      topics: Object.fromEntries(Object.keys(TOPIC).map((k) => [k, xs.filter((r) => r['t_' + k] > 0).length / xs.length])) });
    const allQ = quarters.map((q) => ({ q, ...agg(byQ.get(q)) }));
    const series = allQ.filter((x) => x.n >= 40);
    // the same company's call a year earlier
    const key = (r) => r.symbol + '|' + r.Q;
    const idx = new Map(calls.map((r) => [key(r), r]));
    const prevYear = (r) => idx.get(r.symbol + '|' + (r.Q - 10));
    const latest = d3.max(calls, (r) => r.date);
    C = { sc, meta, calls, series, allQ, name, sector, prevYear, latest, agg };
    return C;
  };
  // the current season: the latest quarter with at least 40 member calls, else the one before it
  // the current season: the latest calendar quarter with at least 25 member calls
  const season = () => { const s = C.allQ.filter((x) => x.n >= 25); return s.length ? s[s.length - 1] : null; };

  G.page('calls', (sec) => {
    const need = ['call_scores', 'call_meta'];
    const notes = $('#cl-notes', sec);
    if (need.some(G.bad)) { G.failed(notes, 'Earnings-call scores'); return; }
    if (!need.every(G.ok)) { for (const b of [notes, $('#cl-trend', sec), $('#cl-heat', sec)]) G.placeholder(b); return; }
    build();
    const cur = season(); if (!cur) { G.placeholder(notes, 'No scored calls yet.'); return; }
    const ya = C.allQ.find((x) => x.q === cur.q - 10);
    const curCalls = C.calls.filter((r) => r.Q === cur.q);
    $('#cl-season', sec).textContent = `${qLab(cur.q)} calls · ${cur.n} S&P 500 companies so far · latest ${G.mon(C.latest)}`;

    // ---- takeaways ----
    const L = [];
    const paired = curCalls.map((r) => [r, C.prevYear(r)]).filter(([, p]) => p);
    const dTone = d3.mean(paired, ([r, p]) => r.tone - p.tone);
    L.push(`**Tone this season ${fx(cur.tone, 3)}** against ${ya ? fx(ya.tone, 3) + ' a year ago' : 'no year-ago season'}; the same companies are **${isNum(dTone) ? (dTone >= 0 ? 'more upbeat by ' : 'less upbeat by ') + fx(Math.abs(dTone), 3) : 'not yet comparable'}** (${paired.length} companies with a call a year earlier).`);
    L.push(`Script vs questions: whole-call tone runs ${fx(cur.gap, 3)} above Q&A tone${ya ? `, against ${fx(ya.gap, 3)} a year ago — ${cur.gap > ya.gap ? 'a wider gap, so answers under questioning are less upbeat than the script' : 'a narrower gap, so answers under questioning are holding up'}` : ''}.`);
    L.push(`Guidance: **${pct(cur.up, 0, false)} of calls mention raising guidance and ${pct(cur.dn, 0, false)} lowering it** (${ya ? pct(ya.up, 0, false) + ' and ' + pct(ya.dn, 0, false) + ' a year ago' : '—'}). Uncertainty language ${fx(cur.unc, 2)} words per 1,000 (${ya ? fx(ya.unc, 2) : '—'} a year ago).`);
    if (ya) {
      const mv = Object.keys(TOPIC).map((k) => ({ k, d: cur.topics[k] - ya.topics[k] })).sort((a, b) => b.d - a.d);
      L.push(`**Rising most since a year ago:** ${mv.slice(0, 3).map((x) => `${TOPIC[x.k]} (${pct(cur.topics[x.k], 0, false)} of calls, ${x.d >= 0 ? '+' : '−'}${Math.abs(Math.round(x.d * 100))} pts)`).join('; ')}. Fading: ${mv.slice(-3).reverse().map((x) => `${TOPIC[x.k]} (${pct(cur.topics[x.k], 0, false)}, ${x.d >= 0 ? '+' : '−'}${Math.abs(Math.round(x.d * 100))} pts)`).join('; ')}.`);
    }
    if (cur.n < 150) L.push(`Early in the season: ${cur.n} calls so far, so these readings will move as more companies report.`);
    notes.replaceChildren(...L.map(G.li));

    // ---- what management is saying (Claude-written, from commentary) ----
    const said = $('#cl-said', sec);
    const cm = G.ok('commentary') ? G.rows('commentary').filter((r) => r.kind === 'calls').sort((a, b) => (a.date < b.date ? 1 : -1)) : [];
    if (cm.length) { said.replaceChildren(el('p', `${cm[0].title} · ${G.mon(cm[0].date)}`, 'gm-note'), G.md(cm[0].body)); }
    else said.replaceChildren(el('p', 'Claude’s read of the week’s most important calls appears here after each Friday’s Week in Review during earnings season.', 'gm-note'));

    // ---- trend ----
    G.seg($('#cl-metric', sec), Object.entries(METRIC).map(([k, [l]]) => [k, l]), S.metric, (v) => { S.metric = v; G.redraw(); });
    const [ml, mf] = METRIC[S.metric];
    const val = (x) => (S.metric === 'guide' ? x.up - x.dn : x[S.metric]);
    G.line($('#cl-trend', sec), [{ name: ml, pts: C.series.map((x) => [qDate(x.q), val(x)]) }], { h: 240, fmt: mf, yfmt: S.metric === 'guide' ? (v) => Math.round(v * 100) + '%' : (v) => d3.format('.2~f')(v), dfmt: '%b %Y', labels: false, range: 'cl-trend' });

    // ---- topic heat map ----
    const last12 = C.series.slice(-12);
    const heat = $('#cl-heat', sec);
    const hr = el('tr'); hr.append(el('th', 'Topic: share of calls mentioning it'));
    for (const x of last12) { const th = el('th', qLab(x.q).replace(/ (\d\d)(\d\d)$/, " '$2"), 'gm-num'); hr.append(th); }
    heat.tHead.replaceChildren(hr);
    const mx = d3.max(last12.flatMap((x) => Object.values(x.topics)));
    heat.tBodies[0].replaceChildren(...Object.keys(TOPIC).sort((a, b) => cur.topics[b] - cur.topics[a]).map((k) => {
      const tr = el('tr'); tr.append(el('td', TOPIC[k]));
      for (const x of last12) { const v = x.topics[k]; const td = el('td', Math.round(v * 100) + '%', 'gm-num x-heat'); td.style.setProperty('--h', String(Math.min(1, v / mx))); tr.append(td); }
      return tr;
    }));

    // ---- sectors ----
    const bySec = d3.group(curCalls, (r) => C.sector(r.symbol));
    const secRows = [...bySec].map(([s, xs]) => {
      const a = C.agg(xs); const pr = xs.map((r) => [r, C.prevYear(r)]).filter(([, p]) => p);
      const top = Object.keys(TOPIC).sort((p, q) => a.topics[q] - a.topics[p]).slice(0, 3).map((k) => TOPIC[k]).join(', ');
      return { s, ...a, d: pr.length ? d3.mean(pr, ([r, p]) => r.tone - p.tone) : null, top };
    }).filter((r) => r.n >= 3).sort((a, b) => (b.d ?? -9) - (a.d ?? -9));
    G.table($('#cl-sectors', sec), [
      { t: 'Sector', f: (r) => r.s }, { t: 'Calls', num: true, f: (r) => r.n }, { t: 'Tone', num: true, f: (r) => fx(r.tone, 3) },
      { t: 'Change vs a year ago', num: true, title: 'The same companies’ tone against their call a year earlier', f: (r) => (isNum(r.d) ? (r.d >= 0 ? '+' : '−') + fx(Math.abs(r.d), 3) : '—'), cls: (r) => G.tone(r.d, 0.005) },
      { t: 'Q&A tone', num: true, f: (r) => fx(r.qaTone, 3) }, { t: 'Uncertainty', num: true, f: (r) => fx(r.unc, 2) },
      { t: 'Raising guidance', num: true, f: (r) => pct(r.up, 0, false) }, { t: 'Lowering', num: true, f: (r) => pct(r.dn, 0, false) }, { t: 'Most-discussed topics', f: (r) => r.top },
    ], secRows, { onRow: (r) => { S.sector = r.s; G.redraw(); } });

    // ---- company movers ----
    const sel = $('#cl-sector', sec);
    const secs = ['All', ...[...bySec.keys()].sort()];
    if (sel.options.length !== secs.length) { sel.replaceChildren(...secs.map((s) => new Option(s === 'All' ? 'All sectors' : s, s))); sel.onchange = () => { S.sector = sel.value; G.redraw(); }; }
    sel.value = S.sector;
    G.seg($('#cl-mover', sec), [['improved', 'Most improved tone'], ['worse', 'Most deteriorated'], ['raised', 'Raised guidance'], ['lowered', 'Lowered guidance'], ['unc', 'Most uncertain']], S.mover, (v) => { S.mover = v; G.redraw(); });
    let pool = curCalls.filter((r) => S.sector === 'All' || C.sector(r.symbol) === S.sector).map((r) => { const p = C.prevYear(r); return { ...r, p, d: p ? r.tone - p.tone : null }; });
    const sorters = { improved: (a, b) => (b.d ?? -9) - (a.d ?? -9), worse: (a, b) => (a.d ?? 9) - (b.d ?? 9), raised: (a, b) => (b.t_guide_up || 0) - (a.t_guide_up || 0), lowered: (a, b) => (b.t_guide_down || 0) - (a.t_guide_down || 0), unc: (a, b) => b.unc - a.unc };
    if (S.mover === 'improved' || S.mover === 'worse') pool = pool.filter((r) => isNum(r.d));
    if (S.mover === 'raised') pool = pool.filter((r) => r.t_guide_up > 0);
    if (S.mover === 'lowered') pool = pool.filter((r) => r.t_guide_down > 0);
    pool.sort(sorters[S.mover]);
    const topTopics = (r) => Object.keys(TOPIC).filter((k) => r['t_' + k] > 0).sort((a, b) => r['t_' + b] - r['t_' + a]).slice(0, 3).map((k) => TOPIC[k]).join(', ');
    G.table($('#cl-movers', sec), [
      { t: 'Company', f: (r) => (C.name.get(r.symbol) || {}).name || r.symbol }, { t: 'Ticker', f: (r) => r.symbol, cls: 'td-sym' }, { t: 'Sector', f: (r) => C.sector(r.symbol) },
      { t: 'Call', num: true, f: (r) => r.date }, { t: 'Tone', num: true, f: (r) => fx(r.tone, 3) },
      { t: 'vs a year ago', num: true, f: (r) => (isNum(r.d) ? (r.d >= 0 ? '+' : '−') + fx(Math.abs(r.d), 3) : '—'), cls: (r) => G.tone(r.d, 0.01) },
      { t: 'Q&A tone', num: true, f: (r) => fx(r.qaTone, 3) }, { t: 'Uncertainty', num: true, f: (r) => fx(r.unc, 2) },
      { t: 'Guidance', f: (r) => (r.t_guide_up > 0 && !(r.t_guide_down > 0) ? 'Raised' : r.t_guide_down > 0 && !(r.t_guide_up > 0) ? 'Lowered' : r.t_guide_up > 0 ? 'Mixed' : '—') },
      { t: 'Topics', f: topTopics },
    ], pool.slice(0, 25), { onRow: (r) => G.openCompany && G.openCompany(r.symbol) });
    $('#cl-movers-note', sec).textContent = pool.length ? `${Math.min(25, pool.length)} of ${pool.length} companies. Click a row to open its company profile, where one is available.` : 'No companies match yet this season.';

    // ---- sleeves and evidence ----
    if (G.ok('call_sleeves')) {
      const lab = Object.fromEntries(G.rows('etf_universe').map((u) => [u.etf, u.label]));
      G.table($('#cl-sleeves', sec), [
        { t: 'Sleeve', f: (r) => lab[r.etf] || r.etf }, { t: 'Companies', num: true, f: (r) => r.companies }, { t: 'Weight covered', num: true, f: (r) => pct(r.coverage, 0, false) },
        { t: 'Tone', num: true, f: (r) => fx(r.tone, 3) }, { t: 'Change', num: true, f: (r) => (isNum(r.toneChg) ? (r.toneChg >= 0 ? '+' : '−') + fx(Math.abs(r.toneChg), 3) : '—'), cls: (r) => G.tone(r.toneChg, 0.005) },
        { t: 'Raising guidance', num: true, f: (r) => pct(r.guideUp, 0, false) }, { t: 'Top topics', f: (r) => (r.topTopics || []).map((k) => TOPIC[k] || k).join(', ') },
        { t: 'Most improved', f: (r) => (r.mostImproved || []).join(', ') }, { t: 'Most deteriorated', f: (r) => (r.mostDeteriorated || []).join(', ') },
      ], [...G.rows('call_sleeves')].sort((a, b) => (b.toneChg ?? -9) - (a.toneChg ?? -9)));
    }
    if (G.ok('call_tests')) {
      const t = (G.rows('call_tests')[0] || {}).tests || [];
      G.table($('#cl-tests', sec), [
        { t: 'Model', f: (r) => r.model }, { t: 'Signal', f: (r) => r.signal }, { t: 'Predicting', f: (r) => r.target },
        { t: 'Rank correlation, to 2018', num: true, f: (r) => fx(r.icPre2019, 2) }, { t: 'From 2020', num: true, f: (r) => fx(r.icFrom2020, 2) }, { t: 'All, t-stat', num: true, f: (r) => fx(r.tAll, 1) }, { t: 'Status', f: (r) => r.status },
      ], t);
    }
  });
})();
