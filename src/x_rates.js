// Markets → Inflation, real yields & credit. Data: rates_credit (FRED: Treasury breakevens and TIPS
// real yields since 2003; ICE BofA spreads and total returns by rating for the past three years).
(() => {
  const G = window.GMX, { el, $, isNum, pct, bp, fx } = G;
  const S = { range: '10Y', oas: 'ig', per: 'ytd' };
  const LAB = {
    be5: '5-year breakeven', be10: '10-year breakeven', be5y5y: '5y5y forward inflation', ry5: '5-year real yield', ry10: '10-year real yield', ry30: '30-year real yield',
    n5: '5-year Treasury', n10: '10-year Treasury', n30: '30-year Treasury',
    oas_ig: 'Investment grade', oas_aaa: 'AAA', oas_aa: 'AA', oas_a: 'A', oas_bbb: 'BBB', oas_hy: 'High yield', oas_bb: 'BB', oas_b: 'B', oas_ccc: 'CCC and lower',
  };
  const BUCKETS = [['ig', 'Investment grade (all)'], ['aaa', 'AAA'], ['aa', 'AA'], ['a', 'A'], ['bbb', 'BBB'], ['hy', 'High yield (all)'], ['bb', 'BB'], ['b', 'B'], ['ccc', 'CCC and lower']];
  let cache = null;
  const prep = (rows) => {
    if (cache && cache.src === rows) return cache;
    const ser = {};
    for (const r of rows) { const d = new Date(r.date + 'T12:00:00Z'); for (const k in r) if (k !== 'date' && isNum(r[k])) (ser[k] = ser[k] || []).push([d, Number(r[k])]); }
    cache = { src: rows, ser };
    return cache;
  };
  const at = (s, d) => { if (!s || !s.length) return null; let lo = 0, hi = s.length - 1; if (s[0][0] > d) return null; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m][0] <= d) lo = m; else hi = m - 1; } return s[lo][1]; };
  const last = (s) => (s && s.length ? s[s.length - 1] : null);
  const back = (d, per) => {
    const t = new Date(d);
    if (per === '1w') t.setUTCDate(t.getUTCDate() - 7); else if (per === '1m') t.setUTCMonth(t.getUTCMonth() - 1); else if (per === '3m') t.setUTCMonth(t.getUTCMonth() - 3);
    else if (per === '1y') t.setUTCFullYear(t.getUTCFullYear() - 1); else if (per === '3y') t.setUTCFullYear(t.getUTCFullYear() - 3); else if (per === 'ytd') return new Date(Date.UTC(d.getUTCFullYear() - 1, 11, 31, 12));
    return t;
  };
  const chg = (s, per) => { const l = last(s); if (!l) return null; const v0 = at(s, back(l[0], per)); return v0 == null ? null : (l[1] - v0) * 100; };
  const ret = (s, per) => { const l = last(s); if (!l) return null; const t0 = back(l[0], per); if (s[0][0] > new Date(t0.getTime() + 7 * 864e5)) return null; const v0 = at(s, t0) ?? s[0][1]; return v0 ? l[1] / v0 - 1 : null; };
  const ann = (s, years) => { const r = ret(s, '3y'); return r == null ? null : Math.pow(1 + r, 1 / years) - 1; };
  const vol1y = (s) => {
    const l = last(s); if (!l) return null; const t0 = back(l[0], '1y'); const pts = s.filter((p) => p[0] >= t0);
    const r = []; for (let i = 5; i < pts.length; i += 5) r.push(Math.log(pts[i][1] / pts[i - 5][1]));
    if (r.length < 20) return null; const m = d3.mean(r); return Math.sqrt(d3.mean(r.map((x) => (x - m) ** 2)) * 52);
  };
  const pctile = (s, from) => { const l = last(s); if (!l) return null; const xs = s.filter((p) => !from || p[0] >= from).map((p) => p[1]); return xs.filter((x) => x <= l[1]).length / xs.length; };
  const since = (s) => (s && s.length ? s[0][0].getUTCFullYear() : '');
  const rangeStart = (s) => { const l = last(s)[0]; const y = { '1Y': 1, '3Y': 3, '5Y': 5, '10Y': 10 }[S.range]; return y ? new Date(Date.UTC(l.getUTCFullYear() - y, l.getUTCMonth(), l.getUTCDate())) : null; };
  const cut = (s, from) => (from ? s.filter((p) => p[0] >= from) : s);
  const thin = (s) => (s.length > 1400 ? s.filter((_, i) => i % Math.ceil(s.length / 1400) === 0 || i === s.length - 1) : s);
  const pf = (v) => fx(v, 2) + '%';

  G.page('credit', (sec) => {
    const notes = $('#cr-notes', sec);
    const boxes = ['#cr-be', '#cr-ry', '#cr-dec', '#cr-oas', '#cr-ret'].map((s) => $(s, sec));
    if (G.bad('rates_credit')) { G.failed(notes, 'Rates and credit data'); return; }
    if (!G.ok('rates_credit')) { for (const b of [notes, ...boxes]) G.placeholder(b); return; }
    const { ser } = prep(G.rows('rates_credit'));
    const asof = last(ser.be10 || ser.oas_ig);
    $('#cr-asof', sec).textContent = asof ? 'FRED data to ' + G.mon(asof[0].toISOString()) : '';

    // ---- takeaways ----
    const L = [];
    const be10 = last(ser.be10), ry10 = last(ser.ry10), n10 = last(ser.n10), f55 = last(ser.be5y5y);
    if (be10) L.push(`10-year breakeven inflation ${pf(be10[1])}: ${bp(chg(ser.be10, '1m'))} over a month, ${bp(chg(ser.be10, '1y'))} over a year; ${Math.round(100 * pctile(ser.be10))}th percentile since ${since(ser.be10)}.` + (f55 ? ` The 5y5y forward, the market's read on longer-run inflation, is ${pf(f55[1])}.` : ''));
    if (ry10 && n10 && be10) L.push(`The 10-year Treasury at ${pf(n10[1])} splits into a ${pf(ry10[1])} real yield and ${pf(be10[1])} of inflation compensation. Over the past year the real yield moved ${bp(chg(ser.ry10, '1y'))} and breakevens ${bp(chg(ser.be10, '1y'))}, so ${Math.abs(chg(ser.ry10, '1y')) > Math.abs(chg(ser.be10, '1y')) ? 'real rates' : 'inflation expectations'} did more of the work.`);
    const ig = last(ser.oas_ig), hy = last(ser.oas_hy), ccc = last(ser.oas_ccc), bb = last(ser.oas_bb);
    const from3 = ig ? new Date(Date.UTC(ig[0].getUTCFullYear() - 3, ig[0].getUTCMonth(), ig[0].getUTCDate())) : null;
    if (ig && hy) L.push(`Credit spreads: investment grade ${Math.round(ig[1] * 100)}bp (${bp(chg(ser.oas_ig, '1m'))} on the month), high yield ${Math.round(hy[1] * 100)}bp (${bp(chg(ser.oas_hy, '1m'))}); ${Math.round(100 * pctile(ser.oas_ig, from3))}th and ${Math.round(100 * pctile(ser.oas_hy, from3))}th percentiles of the past three years, the history FRED provides.`);
    if (ccc && bb) L.push(`Quality spread: CCC minus BB at ${Math.round((ccc[1] - bb[1]) * 100)}bp, ${bp(chg(ser.oas_ccc, '3m') - chg(ser.oas_bb, '3m'))} over three months — ${chg(ser.oas_ccc, '3m') - chg(ser.oas_bb, '3m') > 0 ? 'the weakest credits are underperforming' : 'the weakest credits are keeping up'}.`);
    const rr = BUCKETS.map(([k, l]) => ({ l, r: ret(ser['tr_' + k], 'ytd') })).filter((x) => isNum(x.r)).sort((a, b) => b.r - a.r);
    if (rr.length) L.push(`Year to date by rating: best ${rr[0].l} ${pct(rr[0].r)}, worst ${rr[rr.length - 1].l} ${pct(rr[rr.length - 1].r)}.`);
    notes.replaceChildren(...L.map((t) => el('li', t)));

    // ---- long-history charts ----
    G.seg($('#cr-range', sec), [['1Y', '1Y'], ['3Y', '3Y'], ['5Y', '5Y'], ['10Y', '10Y'], ['All', 'Since 2003']], S.range, (v) => { S.range = v; G.redraw(); });
    const from = ser.be10 ? rangeStart(ser.be10) : null;
    const lines = (keys) => keys.filter((k) => ser[k]).map((k) => ({ name: LAB[k].replace(' breakeven', '').replace(' real yield', '').replace(' forward inflation', ''), pts: thin(cut(ser[k], from)) }));
    G.line(boxes[0], lines(['be5', 'be10', 'be5y5y']), { yfmt: (v) => v.toFixed(1) + '%', fmt: pf, h: 240 });
    G.line(boxes[1], lines(['ry5', 'ry10', 'ry30']), { yfmt: (v) => v.toFixed(1) + '%', fmt: pf, h: 240, ref: 0 });
    G.line(boxes[2], [{ name: 'Nominal', pts: thin(cut(ser.n10 || [], from)) }, { name: 'Real', pts: thin(cut(ser.ry10 || [], from)) }, { name: 'Breakeven', pts: thin(cut(ser.be10 || [], from)), dash: '4 3' }], { yfmt: (v) => v.toFixed(1) + '%', fmt: pf, h: 240, ref: 0 });

    const rt = $('#cr-rates', sec);
    const RK = ['n5', 'n10', 'n30', 'ry5', 'ry10', 'ry30', 'be5', 'be10', 'be5y5y'].filter((k) => ser[k]);
    G.table(rt, [
      { t: 'Measure', f: (k) => LAB[k] }, { t: 'Level', num: true, f: (k) => pf(last(ser[k])[1]) },
      ...['1w', '1m', '3m', 'ytd', '1y'].map((p) => ({ t: p.toUpperCase(), num: true, f: (k) => bp(chg(ser[k], p)) })),
      { t: 'Percentile', num: true, title: 'Where today sits in the full history shown', f: (k) => Math.round(100 * pctile(ser[k])) + 'th' },
      { t: 'Since', num: true, f: (k) => since(ser[k]) },
    ], RK);

    // ---- spreads ----
    const OPT = { ig: ['oas_aaa', 'oas_aa', 'oas_a', 'oas_bbb'], hy: ['oas_bb', 'oas_b', 'oas_ccc'], both: ['oas_ig', 'oas_hy'] };
    G.seg($('#cr-oas-seg', sec), [['ig', 'Investment grade by rating'], ['hy', 'High yield by rating'], ['both', 'IG vs HY']], S.oas, (v) => { S.oas = v; G.redraw(); });
    G.line(boxes[3], OPT[S.oas].filter((k) => ser[k]).map((k) => ({ name: LAB[k].replace('CCC and lower', 'CCC'), pts: ser[k].map((p) => [p[0], p[1] * 100]) })), { yfmt: (v) => v.toFixed(0), fmt: (v) => v.toFixed(0) + 'bp', h: 240 });
    const SK = ['oas_ig', 'oas_aaa', 'oas_aa', 'oas_a', 'oas_bbb', 'oas_hy', 'oas_bb', 'oas_b', 'oas_ccc'].filter((k) => ser[k]);
    G.table($('#cr-spreads', sec), [
      { t: 'Spread over Treasuries', f: (k) => LAB[k] }, { t: 'Now', num: true, f: (k) => Math.round(last(ser[k])[1] * 100) + 'bp' },
      ...['1w', '1m', '3m', 'ytd', '1y'].map((p) => ({ t: p.toUpperCase(), num: true, f: (k) => bp(chg(ser[k], p)), cls: (k) => G.tone(-chg(ser[k], p), 0.5) })),
      { t: '3Y low', num: true, f: (k) => Math.round(d3.min(ser[k], (p) => p[1]) * 100) + 'bp' }, { t: '3Y median', num: true, f: (k) => Math.round(d3.median(ser[k], (p) => p[1]) * 100) + 'bp' },
      { t: '3Y high', num: true, f: (k) => Math.round(d3.max(ser[k], (p) => p[1]) * 100) + 'bp' }, { t: 'Percentile', num: true, f: (k) => Math.round(100 * pctile(ser[k])) + 'th' },
    ], SK);

    // ---- returns by credit quality ----
    const PERS = [['1w', '1W'], ['1m', '1M'], ['3m', '3M'], ['ytd', 'YTD'], ['1y', '1Y'], ['3y', '3Y']];
    G.seg($('#cr-ret-per', sec), PERS, S.per, (v) => { S.per = v; G.redraw(); });
    const BK = BUCKETS.filter(([k]) => ser['tr_' + k]);
    G.hbars(boxes[4], BK.map(([k, l]) => ({ label: l, v: ret(ser['tr_' + k], S.per) })).filter((d) => isNum(d.v)), { left: 160 });
    G.table($('#cr-returns', sec), [
      { t: 'Rating bucket', f: ([, l]) => l },
      ...PERS.map(([p, l]) => ({ t: l, num: true, f: ([k]) => pct(ret(ser['tr_' + k], p)), cls: ([k]) => G.tone(ret(ser['tr_' + k], p), 0.0005) })),
      { t: '3Y a year', num: true, f: ([k]) => pct(ann(ser['tr_' + k], 3)) }, { t: 'Volatility, 1Y', num: true, f: ([k]) => pct(vol1y(ser['tr_' + k]), 1, false) },
      { t: 'Spread now', num: true, f: ([k]) => (ser['oas_' + k] ? Math.round(last(ser['oas_' + k])[1] * 100) + 'bp' : '—') },
    ], BK);
  });
})();
