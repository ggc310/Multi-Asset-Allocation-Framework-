// Markets → Currencies: a pair explorer added below the page's tables. Any pair among the dollar and the
// twelve tracked currencies, including crosses (EUR/JPY, EUR/GBP, …), as a time series with a time frame,
// a 200-day average, and the moves, ranges and valuation of the pair.
(() => {
  const G = window.GMX, A = window.GMXA, { el, $, isNum, pct, fx } = G;
  const S = { base: 'EUR', quote: 'USD', ma: true, fv: true };
  const QUICK = [['EUR', 'USD'], ['USD', 'JPY'], ['GBP', 'USD'], ['USD', 'CHF'], ['AUD', 'USD'], ['USD', 'CAD'], ['USD', 'CNY'], ['EUR', 'JPY'], ['EUR', 'GBP'], ['EUR', 'CHF'], ['USD', 'MXN'], ['USD', 'BRL'], ['USD', 'INR'], ['USD', 'KRW']];
  const key = (d) => Math.floor(d / 864e5);
  const usdPer = (code) => (code === 'USD' ? null : A.series(code));
  const pairSeries = (b, q) => {
    const sb = usdPer(b), sq = usdPer(q);
    if (!sb && !sq) return [];
    if (!sq) return sb;                                   // base per… in USD: e.g. EUR/USD = USD per EUR
    if (!sb) return sq.map((p) => [p[0], 1 / p[1]]);       // USD/JPY = JPY per USD
    const m = new Map(sq.map((p) => [key(p[0]), p[1]]));
    return sb.filter((p) => m.has(key(p[0]))).map((p) => [p[0], p[1] / m.get(key(p[0]))]);
  };
  const at = (s, d) => { if (!s.length || s[0][0] > d) return null; let lo = 0, hi = s.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m][0] <= d) lo = m; else hi = m - 1; } return s[lo][1]; };
  const back = (d, months) => { const t = new Date(d); t.setUTCMonth(t.getUTCMonth() - months); return t; };
  const dec = (v) => (v >= 1000 ? 0 : v >= 100 ? 2 : v >= 10 ? 3 : 4);
  // fair values from the currency models (fx_model): the long-term value model's monthly fair value and PPP, both in dollars per unit
  const FM = () => { const r = G.rows('fx_model')[0]; return r ? new Map((r.currencies || []).map((c) => [c.code, c])) : null; };
  const fairSeries = (b, q) => {
    const m = FM(); if (!m) return [];
    const one = (code) => (code === 'USD' ? null : (m.get(code) || {}).fair);
    const fb = one(b), fq = one(q);
    if ((b !== 'USD' && !fb) || (q !== 'USD' && !fq)) return [];
    const mq = fq ? new Map(fq.map(([d, v]) => [d, v])) : null;
    const base = fb || fq.map(([d]) => [d, 1]);
    return base.filter(([d]) => !mq || mq.has(d)).map(([d, v]) => [new Date(d + 'T12:00:00Z'), v / (mq ? mq.get(d) : 1)]).filter((p) => p[1] > 0 && isFinite(p[1]));
  };
  const pppRate = (b, q) => {
    const m = FM(); if (!m) return null;
    const one = (code) => (code === 'USD' ? 1 : (m.get(code) || {}).pppUsdPerUnit);
    const vb = one(b), vq = one(q);
    return isNum(vb) && isNum(vq) && vq > 0 ? vb / vq : null;
  };

  G.page('fx', (sec) => {
    const box = $('#xp-chart', sec); if (!box) return;
    const fxs = G.rows('fx_stats');
    if (!fxs.length) { G.placeholder(box); return; }
    const codes = ['USD', ...fxs.map((f) => f.code)];
    const name = Object.fromEntries([['USD', 'US dollar'], ...fxs.map((f) => [f.code, f.label])]);
    for (const [id, v] of [['#xp-base', 'base'], ['#xp-quote', 'quote']]) {
      const s = $(id, sec);
      if (s.options.length !== codes.length) { s.replaceChildren(...codes.map((c) => new Option(c + ' · ' + name[c], c))); s.onchange = () => { S[v] = s.value; G.redraw(); }; }
      s.value = S[v];
    }
    $('#xp-swap', sec).onclick = () => { [S.base, S.quote] = [S.quote, S.base]; G.redraw(); };
    const quick = $('#xp-quick', sec);
    quick.replaceChildren(...QUICK.filter(([b, q]) => codes.includes(b) && codes.includes(q)).map(([b, q]) => { const c = el('button', b + '/' + q, 'x-chip'); c.type = 'button'; if (b === S.base && q === S.quote) c.setAttribute('aria-pressed', 'true'); c.onclick = () => { S.base = b; S.quote = q; G.redraw(); }; return c; }));
    const ma = $('#xp-ma', sec); ma.checked = S.ma; ma.onchange = () => { S.ma = ma.checked; G.redraw(); };
    let fvb = $('#xp-fv', sec);
    if (!fvb && ma.parentNode) {
      const lab = el('label', null, ma.parentNode.tagName === 'LABEL' ? ma.parentNode.className : ''); fvb = el('input'); fvb.type = 'checkbox'; fvb.id = 'xp-fv';
      lab.append(fvb, document.createTextNode(' Model fair values'));
      (ma.parentNode.tagName === 'LABEL' ? ma.parentNode : ma).after(lab);
    }
    if (fvb) { fvb.checked = S.fv; fvb.onchange = () => { S.fv = fvb.checked; G.redraw(); }; }
    const need = ['fx_history', 'xasset_weekly', 'fx_model'];
    if (S.base === S.quote) { G.placeholder(box, 'Pick two different currencies.'); return; }
    const s = pairSeries(S.base, S.quote);
    if (s.length < 30) { G.placeholder(box, need.some((d) => !G.ok(d)) ? undefined : 'No history for this pair.'); return; }
    const pair = S.base + '/' + S.quote;
    $('#xp-title', sec).textContent = `${pair}: ${name[S.quote]} per ${name[S.base].toLowerCase().replace(/^us dollar$/, 'US dollar')}`;
    // 200-day average on daily data (about 40 weeks on the weekly part)
    const series = [{ name: pair, pts: s, color: 'var(--gm-blue)' }];
    if (S.ma) {
      const mav = []; const dly = s.filter((p, i) => i > 0 && (p[0] - s[i - 1][0]) < 4 * 864e5);
      const startD = dly.length ? dly[0][0] : null;
      for (let i = 0; i < s.length; i++) {
        const t = s[i][0]; const daily = startD && t >= startD; const n = daily ? 200 : 40;
        if (i + 1 >= n) { let sum = 0; for (let k = i - n + 1; k <= i; k++) sum += s[k][1]; mav.push([t, sum / n]); }
      }
      series.push({ name: '200-day average', pts: mav, color: 'var(--cds-chart-muted)', dash: '4 3', w: 1.2 });
    }
    const fv = S.fv ? fairSeries(S.base, S.quote) : [];
    if (fv.length) series.push({ name: 'Value model fair value', pts: fv, color: '#c2410c', w: 1.6 });
    const ppp = S.fv ? pppRate(S.base, S.quote) : null;
    if (isNum(ppp)) series.push({ name: 'PPP fair value', pts: s.filter((p, i) => i % 5 === 0 || i === s.length - 1).map((p) => [p[0], ppp]), color: '#7c3aed', dash: '2 3', w: 1.2 });
    G.line(box, series, { h: 300, range: 'fxpair', rangeDefault: '3Y', fmt: (v) => v.toFixed(dec(v)), yfmt: (v) => d3.format('~g')(v), labels: true });

    // moves and ranges
    const last = s[s.length - 1], lt = last[0], lv = last[1];
    const H = [['1W', 0.25], ['1M', 1], ['3M', 3], ['YTD', 'ytd'], ['1Y', 12], ['3Y', 36], ['5Y', 60], ['10Y', 120]];
    const chg = (m) => { const d = m === 'ytd' ? new Date(Date.UTC(lt.getUTCFullYear() - 1, 11, 31, 12)) : m < 1 ? new Date(lt - 7 * 864e5) : back(lt, m); if (s[0][0] > d) return null; const v0 = at(s, d); return v0 ? lv / v0 - 1 : null; };
    const yr = s.filter((p) => p[0] >= back(lt, 12)); const hi = d3.max(yr, (p) => p[1]), lo = d3.min(yr, (p) => p[1]);
    const dly = s.filter((p) => p[0] >= back(lt, 12)); const rr = []; for (let i = 1; i < dly.length; i++) rr.push(Math.log(dly[i][1] / dly[i - 1][1]));
    const step = dly.length > 1 ? (dly[dly.length - 1][0] - dly[0][0]) / (dly.length - 1) / 864e5 : 7;
    const vol = rr.length > 20 ? d3.deviation(rr) * Math.sqrt(step < 3 ? 252 : 52) : null;
    const ten = s.filter((p) => p[0] >= back(lt, 120)); const m10 = d3.mean(ten, (p) => p[1]), sd10 = d3.deviation(ten, (p) => p[1]);
    const pctl = s.filter((p) => p[1] <= lv).length / s.length;
    G.table($('#xp-moves', sec), [{ t: pair, f: () => 'Change' }, ...H.map(([l, m]) => ({ t: l, num: true, f: () => pct(chg(m), 1), cls: () => G.tone(chg(m), 0.0005) }))], [0]);
    $('#xp-tiles', sec).replaceChildren(...[
      ['Rate', lv.toFixed(dec(lv)), G.mon(lt.toISOString())],
      ['52-week range', lo.toFixed(dec(lo)) + ' – ' + hi.toFixed(dec(hi)), hi > lo ? Math.round((100 * (lv - lo)) / (hi - lo)) + '% of the way up' : ''],
      ['Against 10-year average', isNum(m10) ? pct(lv / m10 - 1, 1) : '—', isNum(sd10) && sd10 ? fx((lv - m10) / sd10, 1) + ' standard deviations' : ''],
      ['Volatility, 1 year', pct(vol, 1, false), 'annualized'],
      ['Percentile', Math.round(100 * pctl) + 'th', 'of history since ' + s[0][0].getUTCFullYear()],
      ...(fv.length ? [['Value model fair value', fv[fv.length - 1][1].toFixed(dec(fv[fv.length - 1][1])), pct(fv[fv.length - 1][1] / lv - 1, 1) + ' move from spot to fair']] : []),
      ...(isNum(ppp) ? [['PPP fair value', ppp.toFixed(dec(ppp)), pct(ppp / lv - 1, 1) + ' move from spot to PPP']] : []),
    ].map(([k, v, sub]) => { const t = el('div', null, 'x-tile'); t.append(el('div', k, 'x-tile-k'), el('div', v, 'x-tile-v'), el('div', sub, 'x-tile-s')); return t; }));
    const L = [];
    const y1 = chg(12), m1 = chg(1);
    L.push(`**${S.base} ${y1 >= 0 ? 'has gained' : 'has lost'} ${pct(Math.abs(y1 ?? 0), 1, false)} against ${S.quote} over the past year**${isNum(m1) ? `, ${pct(m1, 1)} in the past month` : ''}.`);
    if (isNum(m10) && sd10) { const z = (lv - m10) / sd10; L.push(Math.abs(z) >= 1 ? `**${pair} is ${fx(Math.abs(z), 1)} standard deviations ${z > 0 ? 'above' : 'below'} its 10-year average**, ${z > 0 ? `so ${S.base} is historically strong against ${S.quote}` : `so ${S.base} is historically weak against ${S.quote}`}.` : `${pair} sits within one standard deviation of its 10-year average (${pct(lv / m10 - 1, 1)}).`); }
    if (S.ma && series[1] && series[1].pts.length) { const m = series[1].pts[series[1].pts.length - 1][1]; L.push(`Trend: ${pair} is ${pct(lv / m - 1, 1)} ${lv >= m ? 'above' : 'below'} its 200-day average — **${lv >= m ? `${S.base} in an uptrend` : `${S.base} in a downtrend`}** against ${S.quote}.`); }
    if (fv.length) { const f = fv[fv.length - 1][1], g = lv / f - 1; L.push(`Value model: fair value ${f.toFixed(dec(f))}, the rate at which the inflation-adjusted ${pair} would sit at its 10-year average; **${S.base} is ${pct(Math.abs(g), 1, false)} ${g < 0 ? 'cheap' : 'rich'} against ${S.quote}** on that measure.`); }
    if (isNum(ppp)) L.push(`PPP: ${ppp.toFixed(dec(ppp))} (purchasing-power parity, ${(FM().get(S.base === 'USD' ? S.quote : S.base) || {}).inputs?.pppYear || 'latest'}); spot is ${pct(lv / ppp - 1, 1)} from it. PPP gaps close over decades, not months.`);
    $('#xp-notes', sec).replaceChildren(...L.map(G.li));
  }, { block: 'xtpl-fx' });
})();
