// Executive summary → decision summary. One compact hierarchy at the top of the page:
// the views and tilts, what changed since the previous saved review, the observations behind each view,
// how strong the evidence is and what weakens it, what dominates the resulting portfolio, and what would
// neutralize or reverse each call. Built from the same datasets as the model pages; nothing here is a new model.
(() => {
  const G = window.GMX, A = window.GMXA, { el, $, isNum } = G;
  const IDS = ['model_sb', 'model_fi', 'model_ra', 'model_log', 'macro_state', 'signal_registry', 'bt_ic', 'bt_honesty', 'dq_report', 'positioning', 'fx_model', 'rates_credit', 'score_history', 'etf_universe', 'model_bt', 'model_pm'];
  const n = (x) => (isNum(x) ? Number(x) : null);
  const one = (id) => { const r = G.rows(id); const e = r && r.length ? r[0] : null; return e && window.GM_LABOV && window.GM_LABOV[id] ? window.GM_LABOV[id](e) : e; };
  const atanh = (x) => 0.5 * Math.log((1 + x) / (1 - x));
  const M = '−';
  const sg = (x, d = 1, u = '') => (!isNum(x) ? '—' : (x > 0 ? '+' : x < 0 ? M : '') + Math.abs(x).toFixed(d) + u);
  const pc = (x, d = 1) => (!isNum(x) ? '—' : (x < 0 ? M : '') + Math.abs(x * 100).toFixed(d) + '%');
  const spc = (x, d = 1) => sg(isNum(x) ? x * 100 : null, d, '%');
  const pts = (x, d = 1) => sg(isNum(x) ? x * 100 : null, d, ' pts');
  const bps = (x) => sg(isNum(x) ? x * 100 : null, 0, 'bp');
  const f2 = (x, d = 2) => (!isNum(x) ? '—' : Number(x).toFixed(d).replace('-', M));
  const day = (d) => (d ? G.mon(d) : '—');
  const ym = (d) => { if (!d) return '—'; const t = new Date(String(d).slice(0, 7) + '-15T12:00:00Z'); return isNaN(t) ? String(d) : t.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }); };
  const daysOld = (d) => (d ? (Date.now() - new Date(String(d).slice(0, 10) + 'T21:00:00Z')) / 864e5 : null);
  const P = (t, cls) => { const li = G.li(t); const p = el('p', null, cls); p.append(...li.childNodes); return p; };
  const UL = (items, cls) => { const u = el('ul', null, 'gm-bul ' + (cls || '')); for (const t of items.filter(Boolean)) u.append(G.li(t)); return u; };
  const chip = (t, kind, title) => { const c = el('span', t, 'x-dchip' + (kind ? ' x-dchip-' + kind : '')); if (title) c.title = title; return c; };
  const DEV_NO_FUND = new Set(['Netherlands', 'Sweden', 'Denmark', 'Spain', 'Italy', 'Hong Kong', 'Singapore', 'Belgium', 'Finland', 'Norway', 'Israel', 'Ireland', 'New Zealand', 'Austria', 'Portugal', 'Luxembourg']);

  // ---------- evidence: a fixed, visible rubric applied the same way to every view ----------
  // +1 every live signal predicted in both halves (rank correlation > 0 to 2018 and from 2020), −1 if any turned negative from 2020;
  // +1 a live signal with t ≥ 1.5 from 2020; +1 the backtest's 90% range is above zero (−1 if the timing itself lost money);
  // +1 the live inputs agree in sign (−1 if they offset). Strong ≥ 3, Moderate 2, Mixed 1, Weak ≤ 0.
  const grade = (pts_) => (pts_ >= 3 ? ['Strong', 'ok'] : pts_ === 2 ? ['Moderate', 'mid'] : pts_ === 1 ? ['Mixed', 'warn'] : ['Weak', 'bad']);
  const regSig = (model, prefix) => G.rows('signal_registry').filter((r) => r.model === model && String(r.status).startsWith('Live') && (!prefix || String(r.signal).startsWith(prefix)));
  const rubric = (sigs, bt, agree, timing) => {
    let s = 0; const sup = [], weak = [];
    if (sigs.length) {
      const both = sigs.every((r) => n(r.icPre2019) > 0 && n(r.icFrom2020) > 0), decayed = sigs.filter((r) => n(r.icFrom2020) < 0);
      const strip = new Set(sigs.map((r) => String(r.signal).split(':')[0])).size === 1;
      const ics = sigs.map((r) => `${strip ? r.signal.replace(/^[^:]+: /, '') : r.signal} ${f2(r.icPre2019)} to 2018, ${f2(r.icFrom2020)} from 2020`).join('; ');
      if (decayed.length) { s -= 1; weak.push(`**Signal has faded since 2020**: rank correlation with later returns ${ics}.`); }
      else if (both) { s += 1; sup.push(`Live signal${sigs.length > 1 ? 's' : ''} worked before and after 2020: ${ics}.`); }
      const tmax = Math.max(...sigs.map((r) => Math.abs(n(r.tFrom2020) || 0)));
      if (tmax >= 1.5) { s += 1; sup.push(`Statistically meaningful since 2020 (t ${tmax.toFixed(1)}).`); }
      else weak.push(`Not statistically significant on its own: t-stats since 2020 of ${sigs.map((r) => f2(r.tFrom2020, 1)).join(', ')} (about 1.5 or more would be meaningful).`);
    } else weak.push('**No signal passed the promotion rule**, so the position is held at its benchmark weight.');
    if (bt && isNum(bt.lo)) {
      if (bt.lo > 0) { s += 1; sup.push(`Backtest ${spc(bt.ex, 2)} a year over ${bt.what} since ${ym(bt.start)} (90% range ${spc(bt.lo, 2)} to ${spc(bt.hi, 2)}).`); }
      else weak.push(`Backtest ${spc(bt.ex, 2)} a year over ${bt.what} since ${ym(bt.start)}, but the 90% range (${spc(bt.lo, 2)} to ${spc(bt.hi, 2)}) includes zero.`);
    }
    if (timing && isNum(timing.t)) {
      if (timing.hi < 0) { s -= 1; weak.push(`**The timing itself has cost money**: ${spc(timing.ex, 2)} a year (t ${f2(timing.t, 1)}); the edge came from sitting above neutral on average (${spc(timing.tilt, 2)} a year), not from moving the weight.`); }
      else if (timing.lo > 0) { s += 1; sup.push(`Timing has added ${spc(timing.ex, 2)} a year on top of the average tilt.`); }
    }
    if (agree === true) { s += 1; sup.push('The live inputs point the same way.'); }
    if (agree === false) { s -= 1; weak.push('The live inputs point in opposite directions and largely cancel.'); }
    return { pts: s, label: grade(s), sup, weak };
  };

  // ---------- stocks vs bonds: the live score's exact arithmetic, so reversal levels are consistent with the model ----------
  const SBC = { val_erp: ['valuation', 'US equity risk premium'], val_term: ['valuation', 'bond term premium (2s10s curve)'], mom_rel: ['momentum', 'equities vs bonds, 12 months'], mom_trend: ['momentum', 'equities vs 10-month average'],
    mac_credit: ['macro', 'high yield vs Treasuries'], mac_growth: ['macro', 'US growth nowcast'], mac_surprise: ['macro', 'global growth surprises'], risk_vol: ['risk', 'equity volatility'], risk_pos: ['risk', 'S&P 500 futures positioning'] };
  const SCALE = { mac_surprise: 1.5 };
  const sbIn = (sb, prefix) => { for (const rows of Object.values(sb.inputs || {})) for (const r of rows) if (String(r[0]).startsWith(prefix)) return n(r[1]); return null; };
  const sbParts = (sb) => {
    const wv = sb.pillarWeights || {}, live = sb.live || {}, comp = sb.components || {};
    const pil = {}; let W = 0;
    for (const [p, ks] of Object.entries(live)) { const ks2 = ks.filter((k) => isNum(comp[k])); if (ks2.length && wv[p]) { pil[p] = ks2; W += wv[p]; } }
    const parts = [];
    for (const [p, ks] of Object.entries(pil)) for (const k of ks) parts.push({ k, p, c: comp[k], coef: wv[p] / ks.length / W, label: (SBC[k] || [p, k])[1] });
    for (const x of parts) x.contrib = x.c * x.coef;
    return { parts, W };
  };
  // the 2s10s curve's mean and spread over the model's history, recovered from the model's own "what would change the call" levels
  const curveMap = (sb) => {
    const t = (sb.triggers || []).find((r) => /2s10s/.test(r.input)); const c = n((sb.components || {}).val_term);
    if (!t || !isNum(t.now) || !isNum(t.down5) || !isNum(c)) return null;
    const wv = sb.pillarWeights || {}, tot = Object.values(wv).filter((v) => v).reduce((a, b) => a + b, 0);
    const d = 0.05 / sb.band / ((wv.valuation || 0) / 2 / tot), tt = Math.max(-0.98, Math.min(0.98, c - d));
    const s = (t.down5 - t.now) / (atanh(c) - atanh(tt)), m = t.now + s * atanh(c);
    if (!(s > 0) || Math.abs(Math.tanh(-(t.now - m) / s) - c) > 0.02) return null;
    return { m, s };
  };

  const views = () => {
    const out = [];
    const sb = one('model_sb'), fi = one('model_fi'), ra = one('model_ra'), ms = one('macro_state'), fxm = one('fx_model'), rc = G.rows('rates_credit');
    const MP = window.GM_MP && window.GM_MP.p;
    const rcLast = (k) => { for (let i = rc.length - 1; i >= 0; i--) if (isNum(rc[i][k])) return [rc[i].date, Number(rc[i][k])]; return [null, null]; };
    const [ryD, ry10] = rcLast('ry10'), [beD, be10] = rcLast('be10'), [hyD, oasHy] = rcLast('oas_hy'), [, n10] = rcLast('n10');
    const cpi = n((ms && ms.levels || {}).cpiYoY);

    // 1. Stocks vs bonds
    if (sb) {
      const N0 = MP ? MP.N : sb.neutral, B0 = sb.band, w = MP && isNum(MP.e0) ? MP.e0 : sb.equityWeight, tilt = (w - N0) * 100;
      const { parts } = sbParts(sb), score = n(sb.score), tot = parts.reduce((a, x) => a + x.contrib, 0) || 1;
      const curve = sbIn(sb, '2s10s'), curveMed = sbIn(sb, 'Its median since 2008'), erp = sbIn(sb, 'Equity risk premium, US'), erpMed = sbIn(sb, 'Its median since 2004');
      const gs = sbIn(sb, 'Global growth surprises'), vol = sbIn(sb, 'Equity volatility, 3 months'), volMed = sbIn(sb, 'Its 3-year median'), vix = sbIn(sb, 'VIX'), pos = sbIn(sb, 'S&P 500 futures positioning');
      const hy6 = sbIn(sb, 'High yield vs Treasuries'), now_ = sbIn(sb, 'US growth nowcast'), real = sbIn(sb, 'Real 10-year yield');
      const desc = (x) => x.k === 'val_term' ? `2s10s curve ${bps(curve)} against a ${bps(curveMed)} median since 2008: a flat curve leaves little term premium in bonds`
        : x.k === 'mac_surprise' ? `global growth surprises ${sg(gs, 2)} (positive = data beating forecasts)` : x.label;
      const drivers = parts.slice().sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib)).map((x) => `**${Math.round(x.contrib / tot * 100)}% of the call: ${x.label}** (${x.p}). ${desc(x)[0].toUpperCase() + desc(x).slice(1)}.`);
      const context = [
        isNum(erp) ? `Shown, not used (failed the promotion rule): US equity risk premium ${f2(erp)} points against a ${f2(erpMed)} median since 2004 — **on valuation, equities look expensive against bonds**, the opposite of the call.` : null,
        isNum(vol) ? `Risk backdrop, not used: equity volatility ${pc(vol, 1)} (3-month) against a ${pc(volMed, 1)} three-year median; VIX ${f2(vix, 1)}; S&P 500 futures positioning ${sg(pos, 2)} standard deviations.` : null,
        isNum(hy6) ? `Macro, not used: high yield ${hy6 >= 0 ? 'ahead of' : 'behind'} Treasuries by ${pc(Math.abs(hy6), 1)} over six months; US growth nowcast ${sg(now_, 2)} sd.` : null,
      ];
      // reversal: solve the live score for neutral and for the mirror-image underweight, one input at a time
      const cm = curveMap(sb), rev = [];
      for (const x of parts) {
        const sc = SCALE[x.k] || 1, cap = Math.tanh(2 / sc);
        for (const [tgt, what] of [[0, 'neutral'], [-score, 'mirror']]) {
          const cs = x.c + (tgt - score) / x.coef, wt = Math.max(N0 - B0, Math.min(N0 + B0, N0 + B0 * tgt));
          if (Math.abs(cs) > cap) { if (what === 'neutral') rev.push(`${x.label[0].toUpperCase() + x.label.slice(1)} alone cannot take the call to neutral; it would need a reading beyond anything the signal allows.`); break; }
          if (x.k === 'val_term' && cm) {
            const lvl = cm.m + cm.s * -atanh(cs);
            rev.push(what === 'neutral' ? `**Neutral (${Math.round(N0 * 100)}% equities)** if the 2s10s curve steepens to about **${bps(lvl)}** (now ${bps(curve)}), other inputs unchanged.` : `**Underweight (${Math.round(wt * 100)}%)** at about **${bps(lvl)}**.`);
          } else rev.push(what === 'neutral' ? `Neutral if the ${x.label} signal falls from ${f2(x.c)} to ${f2(cs)} on its own.` : `Underweight (${Math.round(wt * 100)}%) at ${f2(cs)}.`);
        }
      }
      const live = Object.values(sb.live || {}).flat().length, all = Object.keys(sb.components || {}).filter((k) => k !== 'risk').length;
      const zero = Object.entries(sb.live || {}).filter(([p, v]) => !v.length).map(([p]) => p);
      const st = sb.stats || {};
      const ev = rubric(regSig('Stocks vs bonds'), { ex: st.excess, lo: st.excessLo90, hi: st.excessHi90, start: (st.model || {}).start, what: 'a 60/40 of ACWI and AGG' }, parts.length > 1 ? parts.every((x) => Math.sign(x.c) === Math.sign(parts[0].c)) : null, { ex: st.timing, lo: st.timingLo90, hi: st.timingHi90, t: st.timingT, tilt: st.tilt });
      const curReg = (sb.regimes || []).find((r) => r.current && r.variable === 'Growth and inflation');
      if (curReg) (curReg.excess > 0 ? ev.sup : ev.weak).push(`In past ${curReg.state.toLowerCase()} months (${curReg.months}), the model ${curReg.excess > 0 ? 'added' : 'lost'} ${pc(Math.abs(curReg.excess), 2)} a year, right ${Math.round(curReg.hitRate * 100)}% of the time.`);
      if (isNum(erp) && erp < erpMed) ev.weak.push(`The equity risk premium (${f2(erp)} vs ${f2(erpMed)} median) argues against the overweight, though it has not predicted well since 2020.`);
      out.push({
        id: 'sb', name: 'Stocks vs bonds', go: 'sb',
        tilt: `${Math.round(w * 100)}% equities`, sub: `${sg(tilt, 0)} pts vs ${Math.round(N0 * 100)}% neutral · ${Math.abs(tilt) < 1 ? 'neutral' : (Math.abs(tilt) < 5 ? 'slight' : Math.abs(tilt) < 10 ? 'modest' : 'large') + (tilt > 0 ? ' overweight equities' : ' underweight equities')}`,
        because: parts.length ? `${parts.slice().sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib)).map((x) => `${x.k === 'val_term' ? `a flat yield curve (2s10s ${bps(curve)} against a ${bps(curveMed)} median) that leaves little term premium in bonds` : x.k === 'mac_surprise' ? `global growth surprises of ${sg(gs, 2)}` : x.label + ' ' + sg(x.c, 2)} (${Math.round(x.contrib / tot * 100)}% of the score)`).join(', and ')}.` : '',
        drivers, context, ev, rev,
        cover: [`**Rests on ${live} of ${all} signals.** ${zero.length ? zero.map((p) => p[0].toUpperCase() + p.slice(1)).join(' and ') + ' carr' + (zero.length > 1 ? 'y' : 'ies') + ' no weight: no signal there passed the promotion rule.' : ''}`,
          isNum(real) && isNum(ry10) ? `The model's "real yield" is the 10-year less CPI inflation (${f2(real)}%); the market's 10-year TIPS real yield is ${f2(ry10)}% (${day(ryD)}). On the TIPS measure the equity risk premium would be about ${f2(erp + real - ry10)} points.` : null].filter(Boolean),
        key: { w, tilt },
      });
    }

    // 2. Duration and 3. bond sectors
    if (fi) {
      const lv = (k) => (fi.levers || []).find((x) => x.key === k);
      const d = lv('duration');
      const trig = (lab) => (fi.triggers || []).find((t) => t.lever === lab);
      if (d) {
        const ratio = Math.abs(d.score) > 1e-6 ? d.position / d.score : 0.1, yrsPer = ratio * (d.durGap || 14), yrs = d.position * (d.durGap || 14);
        const [ri, ci] = d.inputs; const tr = trig('Duration');
        const rmap = tr ? { m: tr.neutralAt, s: (tr.fullAt - tr.neutralAt) / atanh(0.9) } : null, cmap = sb ? curveMap(sb) : null;
        const drivers = [
          ri ? `**Real yield argues for longer duration**: the 10-year less CPI inflation is ${f2(sbIn(sb || {}, 'Real 10-year yield'))}%, ${sg(ri.value, 1)} sd against its history (signal ${f2(ri.signal)}).` : null,
          ci ? `**A flat curve argues against it**: the slope is ${sg(ci.value, 1)} sd against its history (signal ${f2(ci.signal)}), so investors are paid little to extend.` : null,
          isNum(ry10) ? `Market cross-check: 10-year Treasury ${f2(n10)}%, 10-year TIPS real yield ${f2(ry10)}%, 10-year breakeven ${f2(be10)}% (${day(ryD)}).` : null];
        const rev = [];
        if (ri && ci) {
          const tgtY = 0.5, need = (sNow, other) => (2 * tgtY / yrsPer) - other;
          // the slope back to its average (signal 0)
          if (cmap) { const sc = (ri.signal + 0) / 2; rev.push(`**Long ${f2(sc * yrsPer, 1)} years** if the 2s10s curve steepens back to its average of about ${bps(cmap.m)}.`); }
          const rs = -2 * tgtY / yrsPer - ci.signal;
          if (rmap && Math.abs(rs) < Math.tanh(2)) rev.push(`**Short ${tgtY.toFixed(1)} years** if the 10-year less CPI falls to about ${f2(rmap.m + rmap.s * atanh(rs))}% (now ${f2(sbIn(sb || {}, 'Real 10-year yield'))}%): a lower 10-year yield or higher inflation.`);
          const rl = 2 * tgtY / yrsPer - ci.signal;
          if (rmap && Math.abs(rl) < Math.tanh(2)) rev.push(`Long ${tgtY.toFixed(1)} years if it rises to about ${f2(rmap.m + rmap.s * atanh(rl))}% with the curve unchanged.`);
          rev.push(`The lever is small by design: at full strength it moves duration ${f2(yrsPer, 1)} years against the Agg.`);
        }
        const sigs = regSig('Fixed income', 'Duration:');
        const ev = rubric(sigs, { ex: (fi.stats || {}).excess, lo: (fi.stats || {}).excessLo90, hi: (fi.stats || {}).excessHi90, start: (fi.stats || {}).start, what: 'the US Aggregate (all fixed income tilts)' }, ri && ci ? Math.sign(ri.signal) === Math.sign(ci.signal) : null);
        out.push({ id: 'dur', name: 'Duration', go: 'firv', tilt: Math.abs(yrs) < 0.15 ? 'Neutral' : (yrs > 0 ? 'Long ' : 'Short ') + Math.abs(yrs).toFixed(1) + ' yrs', sub: `${sg(yrs, 2)} years against the US Aggregate (${f2(fi.aggDuration, 1)} years)`, because: ri && ci ? `real yields (${sg(ri.value, 1)} sd) argue for longer duration and a flat curve (${sg(ci.value, 1)} sd) argues against${Math.abs(yrs) < 0.15 ? '; they cancel' : ''}.` : '', drivers, ev, rev, cover: [], key: { yrs } });
      }
      // sector levers
      const sect = (fi.levers || []).filter((x) => x.key !== 'duration');
      const held = sect.filter((x) => isNum(x.position) && x.position > 0.005).sort((a, b) => b.position - a.position);
      const avoid = sect.filter((x) => isNum(x.score) && x.score < -0.15 && !(x.position > 0.005));
      const none = sect.filter((x) => !(x.inputs || []).length);
      const LBL = { 'Investment-grade credit': 'IG credit' };
      const lab = (x) => LBL[x.label] || x.label;
      const drivers = [], rev = [], weakAll = [], supAll = [];
      for (const x of [...held, ...avoid]) {
        const i0 = (x.inputs || [])[0]; if (!i0) continue;
        const t = trig(x.label);
        let obs = '';
        if (x.key === 'tips') obs = `6-month change in CPI ${sg(i0.value, 2)} pts; CPI ${f2(cpi, 1)}% a year${isNum(be10) ? `, against a 10-year breakeven of ${f2(be10)}% (${day(beD)}): **the market prices less inflation than the economy is running**` : ''}`;
        else if (x.key === 'fx') obs = `the dollar ${i0.value >= 0 ? 'up' : 'down'} ${pc(Math.abs(i0.value), 1)} over six months, which has left EM currencies cheaper`;
        else if (t) obs = `pays ${f2(t.now)} pts over Treasuries against a ${f2(t.neutralAt)} average (${sg(i0.value, 1)} sd)${x.key === 'hy' && isNum(oasHy) ? `; ICE BofA HY spread ${f2(oasHy)}% (${day(hyD)})` : ''}: **paid too little to own it**`;
        else obs = `${i0.name} ${f2(i0.value)}`;
        drivers.push(`**${lab(x)} ${x.position > 0.005 ? spc(x.position, 1) : 'not held'}**: ${obs}.`);
        if (t) rev.push(`${lab(x)}: comes back in above a ${f2(t.neutralAt)}-point yield over Treasuries (now ${f2(t.now)}); full position at ${f2(t.fullAt)}.`);
        else if (x.key === 'tips') rev.push('TIPS: the tilt fades to zero as the 6-month change in CPI falls back to its historical average, and reverses only if inflation decelerates faster than usual.');
        else if (x.key === 'fx') rev.push('EM local currency: the tilt fades as the dollar\'s 6-month gain unwinds (a weaker dollar makes EM currencies less cheap).');
        const r = rubric(regSig('Fixed income', x.label + ':'), null, null);
        (r.pts > 0 ? supAll : weakAll).push(`${lab(x)}: ${r.pts > 0 ? r.sup.join(' ') : r.weak.join(' ')}`);
      }
      const emfx = fxm && (fxm.aggregates || []).find((a) => a.code === 'EMFX');
      if (held.some((x) => x.key === 'fx') && emfx && emfx.combined < -0.1) weakAll.push(`**The currency model leans against EM currencies** (${f2(emfx.combined)} for the EM basket), so the two models disagree on EM local debt.`);
      const st = fi.stats || {};
      const evp = rubric([...held, ...avoid].flatMap((x) => regSig('Fixed income', x.label + ':')), { ex: st.excess, lo: st.excessLo90, hi: st.excessHi90, start: st.start, what: 'the US Aggregate (all fixed income tilts)' }, null, { ex: st.timing, lo: null, hi: null, t: st.timingT, tilt: st.tilt });
      if (isNum(st.timingT) && Math.abs(st.timingT) < 1) weakAll.push(`Most of the fixed income edge came from the average tilt (${spc(st.tilt, 2)} a year), not timing (${spc(st.timing, 2)}, t ${f2(st.timingT, 1)}).`);
      out.push({ id: 'fi', name: 'Bond sectors', go: 'firv',
        tilt: held.length ? held.slice(0, 2).map((x) => lab(x) + ' ' + spc(x.position, 0)).join(', ') : 'Benchmark weights',
        sub: `${avoid.length ? 'none in ' + avoid.map(lab).join(' or ') + '; ' : ''}yield ${spc(fi.yieldPickup, 2)} vs the Agg`,
        because: [...held.map((x) => { const i0 = (x.inputs || [])[0] || {}; return x.key === 'tips' ? `inflation is picking up (6-month change in CPI ${sg(i0.value, 2)} pts, CPI ${f2(cpi, 1)}%) while 10-year breakevens are ${f2(be10)}%` : x.key === 'fx' ? `a ${pc(Math.abs(i0.value), 1)} dollar gain over six months has cheapened EM currencies` : lab(x); }),
          avoid.length ? `${avoid.map(lab).join(' and ')} pay${avoid.length > 1 ? '' : 's'} well under ${avoid.length > 1 ? 'their' : 'its'} average over Treasuries (${avoid.map((x) => { const t = trig(x.label); return t ? `${f2(t.now)} vs ${f2(t.neutralAt)} pts` : ''; }).filter(Boolean).join('; ')})` : ''].filter(Boolean).join('; ') + '.',
        drivers, ev: { ...evp, sup: [...evp.sup.filter((t) => /Backtest/.test(t)), ...supAll], weak: [...evp.weak.filter((t) => /Backtest|timing/i.test(t)), ...weakAll] }, rev,
        cover: none.length ? [`**${none.map(lab).join(' and ')} ha${none.length > 1 ? 've' : 's'} no live signal** and stay${none.length > 1 ? '' : 's'} at the Aggregate's weight.`] : [], key: { held: held.map((x) => [x.key, x.position]) } });
    }

    // 4–5. Equities: where in the world first, then style and size; sectors stay on the scorecard
    const EQ = window.GM_EQ;
    if (EQ && EQ.rows && EQ.rows.length) {
      const by = new Map(EQ.rows.map((r) => [r.etf, r])), sc = (e) => n(by.get(e) && EQ.score(by.get(e)));
      const U = new Map(G.rows('etf_universe').map((u) => [u.etf, u]));
      // within-equity region shares, model against ACWI, with ACWX split by ACWI country weights
      let reg = null;
      if (MP) {
        const ac = G.rows('acwi_countries'), withFund = new Set(Object.keys(MP.eq).map((e) => (U.get(e) || {}).country).filter(Boolean));
        const rest = ac.filter((c) => !withFund.has(c.country)), rs = rest.reduce((a, c) => a + c.weight, 0) || 1;
        const exDev = rest.filter((c) => DEV_NO_FUND.has(c.country)).reduce((a, c) => a + c.weight, 0) / rs;
        const regOf = (e) => { const r = (U.get(e) || {}).region; return e === 'SPY' || r === 'US' ? 'US' : r === 'Emerging' ? 'EM' : 'DEV'; };
        const agg = (wts, scale) => { const o = { US: 0, DEV: 0, EM: 0 }; for (const [e, w] of Object.entries(wts)) { if (e === 'AGG') continue; const v = w / scale; if (e === 'ACWX') { o.DEV += v * exDev; o.EM += v * (1 - exDev); } else if (U.has(e) || e === 'SPY') o[regOf(e)] += v; } return o; };
        reg = { m: agg(MP.eq, 1), r: agg(MP.refLook, MP.N) };
      }
      const R3 = [['US', 'SPY', 'US'], ['DEV', 'EFA', 'Developed ex-US'], ['EM', 'EEM', 'Emerging markets']];
      const ll = (t) => t.replace(/^Developed/, 'developed').replace(/^Emerging/, 'emerging');
      const scored = R3.map(([k, e, l]) => ({ k, e, l, s: sc(e), r: by.get(e) })).filter((x) => isNum(x.s));
      const act = reg ? R3.map(([k, , l]) => ({ k, l, a: reg.m[k] - reg.r[k], m: reg.m[k], r: reg.r[k] })) : [];
      // the call is the preferred region against the US (the largest weight), or the US against the best of the rest
      const lean0 = act.slice().sort((a, b) => b.a - a.a)[0], top = scored.slice().sort((a, b) => b.s - a.s)[0];
      const leaning = !!(lean0 && Math.abs(lean0.a) >= 0.01);
      const best = scored.find((x) => x.k === (leaning ? lean0.k : top && top.k)) || top;
      const worst = best && best.k === 'US' ? scored.filter((x) => x.k !== 'US').sort((a, b) => b.s - a.s)[0] : scored.find((x) => x.k === 'US');
      const pil = ['fundamentals', 'valuation', 'technicals', 'sentiment'];
      const gaps = best && worst && best !== worst ? pil.map((p) => ({ p, g: n(best.r[p]) - n(worst.r[p]), b: n(best.r[p]), w: n(worst.r[p]) })).filter((x) => isNum(x.g)).sort((a, b) => b.g - a.g) : [];
      const metric = (r) => r ? `forward P/E ${f2(r.fwdPE, 1)}×, shareholder yield ${pc(r.shareholderYield, 1)}, 12-month momentum ${spc(r.mom12_1, 0)}` : '';
      const drivers = [
        best && worst ? `**Scores: ${scored.map((x) => `${x.l} ${Math.round(x.s)}`).join(', ')}** (composite, 0 to 100; ${ll(best.l)} ${best.s >= worst.s ? 'leads' : 'trails'} ${ll(worst.l)} by ${Math.abs(Math.round(best.s - worst.s))} points).` : null,
        ...scored.map((x) => `${x.l} (${x.e}): ${metric(x.r)}.`),
        gaps.length ? `Widest gap between ${ll(best.l)} and ${ll(worst.l)}: **${gaps[0].p} ${Math.round(gaps[0].b)} vs ${Math.round(gaps[0].w)}**${gaps[1] && gaps[1].g > 5 ? `, then ${gaps[1].p} ${Math.round(gaps[1].b)} vs ${Math.round(gaps[1].w)}` : ''}${gaps[gaps.length - 1].g < -5 ? `; ${gaps[gaps.length - 1].p} favors ${ll(worst.l)} (${Math.round(gaps[gaps.length - 1].w)} vs ${Math.round(gaps[gaps.length - 1].b)})` : ''}.` : null,
      ];
      const ctry = window.GM_MP && window.GM_MP.risk && (window.GM_MP.risk.parts || []).find((p) => p.k === 'Equity country tilts');
      const te = window.GM_MP && window.GM_MP.risk && window.GM_MP.risk.te;
      const evq = (() => {
        const ic = G.rows('bt_ic').find((r) => r.window === 'full' && r.signal === 'composite' && r.horizon === 12), icf = G.rows('bt_ic').find((r) => r.window === 'filed' && r.signal === 'composite' && r.horizon === 12);
        const tb = G.rows('bt_honesty').find((r) => r.kind === 'strategy' && r.window === 'full' && r.strategy === 'Top fifth, composite, buffered');
        const sel = G.rows('bt_honesty').find((r) => r.kind === 'selection' && r.window === 'filed');
        let s = 0; const sup = [], weak = [];
        if (ic && icf) { if (ic.ic > 0 && icf.ic > 0) { s += 1; sup.push(`Composite ranks have predicted 12-month relative returns: rank correlation ${f2(ic.ic)} since 2011 (t ${f2(ic.icT, 1)}), ${f2(icf.ic)} in the point-in-time filings window.`); } else { s -= 1; weak.push(`Composite rank correlation ${f2(ic.ic)} since 2011 but ${f2(icf.ic)} in the filings window.`); } }
        if (ic && ic.icT >= 1.5) s += 1;
        if (icf && icf.icT < 1.5) weak.push(`In the point-in-time window (${icf.months} months) the edge is not significant (t ${f2(icf.icT, 1)}).`);
        if (tb && tb.lo90 > 0) { s += 1; sup.push(`Buffered top fifth beat the equal-weight universe by ${spc(tb.excess, 1)} a year (90% range ${spc(tb.lo90, 1)} to ${spc(tb.hi90, 1)}); treat as an upper bound.`); }
        if (sel && isNum(sel.defaultExcess) && sel.defaultExcess < 0) { s -= 1; weak.push(`**The default settings lost ${pc(Math.abs(sel.defaultExcess), 1)} a year in the filings window** (rank ${sel.defaultRank} of ${sel.settings} settings).`); }
        if (best && worst && best.s - worst.s < 10) { weak.push(`The regional gap is small (${Math.round(best.s - worst.s)} points).`); s -= 1; }
        return { pts: s, label: grade(s), sup, weak };
      })();
      if (ctry && te) evq.weak.push(`The country tilts are a small bet: ${G.pct(ctry.alone, 2, false)} tracking error on their own, ${sg(ctry.contrib / te * 100, 0, '%')} of the portfolio's active risk.`);
      const dq = G.rows('dq_report');
      const heldEq = MP ? Object.keys(MP.eq) : [];
      const dqHit = (etfs, lvl) => dq.filter((x) => etfs.includes(x.etf) && (!lvl || x.level === lvl));
      const merge = (list) => { const m = new Map(); for (const x of list) { if (!m.has(x.etf)) m.set(x.etf, []); m.get(x.etf).push(x.detail.replace(/ (Outside a plausible range|Extreme but plausible)[^.]*\.( check[^.]*\.)?/i, '')); } return [...m.entries()]; };
      const coverR = merge(dqHit([...heldEq, 'EFA', 'EEM'], 'Warning')).map(([e, d]) => `**${(U.get(e) || {}).label || e} (${e})**: ${d.join(' ')} Flagged as outside a plausible range: check its largest holdings before relying on its score.`);
      const lean = act.length ? act.slice().sort((a, b) => b.a - a.a) : [];
      const rev = best && worst && best !== worst ? [`The regional lean reverses if ${ll(worst.l)} (${Math.round(worst.s)}) overtakes ${ll(best.l)} (${Math.round(best.s)}).${gaps.length ? ` Watch ${gaps[0].p} first, the widest pillar gap (${Math.round(gaps[0].b)} vs ${Math.round(gaps[0].w)}).` : ''}`,
        'Country weights follow the Equity allocation settings; the view goes neutral if the scores converge to within the allocation band.'] : [];
      out.push({ id: 'eqr', name: 'Equities: where in the world', go: 'scoreboard',
        tilt: leaning ? 'Lean to ' + ll(lean[0].l) : act.length ? 'Close to ACWI by region' : best ? 'Scores prefer ' + ll(best.l) : '—',
        sub: act.length ? act.map((x) => `${x.l} ${pc(x.m, 0)} of equities (${pts(x.a, 1)})`).join(' · ') : 'scores only',
        because: (act.length && !leaning ? `country weights land within a point of ACWI in every region, although the scores favor ${ll(top.l)}. ` : '') + (best && worst ? `${act.length && !leaning ? best.l : ll(best.l)} scores ${Math.round(best.s)} against ${Math.round(worst.s)} for ${ll(worst.l)}${gaps.length ? `, mostly on ${gaps[0].p} (${Math.round(gaps[0].b)} vs ${Math.round(gaps[0].w)})` : ''}.` : ''),
        drivers, ev: evq, rev, cover: coverR, key: { act } });

      // style and size, as pairs; deliberately the broad pairs only
      const PAIRS = [['RSP', 'SPY', 'Equal weight over cap weight'], ['IWD', 'IWF', 'US value over US growth'], ['IJR', 'SPY', 'US small over US large'], ['EFV', 'EFG', 'Intl value over intl growth'], ['SCZ', 'EFA', 'Intl small over intl large']];
      const pr = PAIRS.map(([a, b, l]) => ({ a, b, l, g: sc(a) - sc(b), sa: sc(a), sb: sc(b) })).filter((x) => isNum(x.g)).sort((x, y) => Math.abs(y.g) - Math.abs(x.g));
      const name = (e) => (by.get(e) || {}).label || e;
      const flip = (x) => (x.g >= 0 ? x.l : x.l.replace(/(.+) over (.+)/, '$2 over $1'));
      const ijr = sc('IJR'), iwm = sc('IWM');
      const sDrivers = pr.slice(0, 4).map((x) => `**${flip(x)}**: ${name(x.a)} ${Math.round(x.sa)} vs ${name(x.b)} ${Math.round(x.sb)} (${sg(x.g, 0)}).`);
      if (isNum(ijr) && isNum(iwm) && Math.abs(ijr - iwm) >= 10) sDrivers.push(`**Quality decides the small-cap call**: the S&P 600 (which requires profits) scores ${Math.round(ijr)}, the Russell 2000 ${Math.round(iwm)}.`);
      const sCover = dqHit(pr.slice(0, 4).flatMap((x) => [x.a, x.b]).concat(['IWM'])).filter((x) => /Thin valuation|Proxy/.test(x.check) || x.level === 'Warning').map((x) => `**${name(x.etf)} (${x.etf})**: ${x.detail}`);
      out.push({ id: 'eqs', name: 'Equities: style and size', go: 'scoreboard',
        tilt: pr.length ? flip(pr[0]) : '—', sub: (() => { const st = window.GMX_PORT && window.GMX_PORT.state && window.GMX_PORT.state(); const mp = window.GM_MP && window.GM_MP.p, held = st && st.picks ? st.picks.filter((x) => !mp || (mp.hold[x.etf] || 0) > 0) : []; return held.length ? `in the portfolio through ${held.length} sleeves (${held.slice(0, 4).map((x) => x.etf).join(', ')}${held.length > 4 ? '…' : ''}), ${G.pct(held.reduce((a, x) => a + (mp && mp.E > 0 ? mp.eq[x.etf] || 0 : x.w), 0), 0, false)} of equities` : 'scores only: no sleeve clears the bar for the model portfolio'; })(),
        because: pr.length ? pr.slice(0, 2).map((x) => `${name(x.a)} ${Math.round(x.sa)} vs ${name(x.b)} ${Math.round(x.sb)}`).join('; ') + '.' : '',
        drivers: sDrivers, ev: { ...evq, weak: evq.weak.filter((t) => !/regional|country tilts/.test(t)) }, rev: pr.slice(0, 3).map((x) => `${flip(x)} reverses if the ${Math.abs(Math.round(x.g))}-point gap closes.`), cover: sCover,
        more: 'Sector and industry calls sit one level down, on the equity scorecard; the best-scoring ones are held in the model portfolio within the sleeve budget.', key: {} });
    }

    // 6. Diversifiers / real assets
    if (ra) {
      const D = MP ? MP.D : 0, A_ = ra.assets || [];
      const fav = A_.filter((a) => a.sleeveWeight > 0).sort((a, b) => b.sleeveWeight - a.sleeveWeight), bad = A_.filter((a) => a.score < -0.15);
      const bt = (one('model_bt') || {}).ra;
      const drivers = A_.slice().sort((a, b) => b.score - a.score).map((a) => `**${a.label} ${f2(a.score)}**: 12 months ${spc(a.ret12m, 0)}, ${spc(a.vs10m, 0)} vs its 10-month average, correlation with 60/40 ${f2(a.corr60_40)}.`);
      const sigs = A_.flatMap((a) => regSig('Real assets', a.label + ':'));
      const ev = rubric(sigs.filter((r) => !/Diversification/.test(r.signal)), bt ? { ex: bt.excess, lo: bt.excessLo90, hi: bt.excessHi90, start: (bt.model || {}).start, what: 'a real-asset sleeve holding every asset at equal risk' } : null, null);
      out.push({ id: 'ra', name: 'Diversifiers', go: 'ra',
        tilt: fav.length ? fav.map((a) => a.label.replace('Broad commodities', 'Commodities') + ' ' + pc(a.sleeveWeight, 0)).join(', ') : 'None favored',
        sub: D > 0 ? `${pc(D, 0)} diversifier sleeve in the portfolio` : 'not in the portfolio (diversifier sleeve set to 0%); shares of the sleeve if one is used',
        because: fav.length ? fav.map((a) => `${a.label.toLowerCase()} ${spc(a.vs10m, 0)} vs its 10-month average with a ${f2(a.corr60_40)} correlation to 60/40`).join('; ') + '; the score rewards trend and low correlation.' : '',
        drivers, ev, rev: [...fav.map((a) => a.vs10m >= 0 ? `${a.label} drops out if its trend breaks (price below its 10-month average; now ${spc(a.vs10m, 0)} above) and its correlation with 60/40 rises.` : `${a.label} is held for its low correlation with 60/40 (${f2(a.corr60_40)}) despite a broken trend (${spc(a.vs10m, 0)} vs its 10-month average); it drops out if that correlation rises or the trend weakens further.`), bad.length ? `${bad.map((a) => a.label).join(' and ')} come back only if ${bad.length > 1 ? 'their' : 'its'} correlation with 60/40 falls well below today's ${bad.map((a) => f2(a.corr60_40)).join(' and ')}.` : null].filter(Boolean),
        cover: [], key: {} });
    }

    // 6b. Private markets, through listed proxies
    const pmm = one('model_pm');
    if (pmm && (pmm.pairs || []).length) {
      const PP = pmm.pairs, side = (p) => (!isNum(p.score) ? null : p.score > 0.1 ? p.long : p.score < -0.1 ? p.short : null);
      const calls = PP.filter((p) => side(p));
      const sigs = regSig('Private markets');
      const ev = rubric(sigs, null, null);
      const pc_ = PP.find((p) => p.key === 'pc');
      out.push({ id: 'pm', name: 'Private markets (listed proxies)', go: 'ra',
        tilt: calls.length ? calls.map((p) => `${side(p)} over ${side(p) === p.long ? p.short : p.long}`).join('; ') : 'No call',
        sub: 'relative-value calls on BDCs and listed private equity; not held in the model portfolio',
        because: [pc_ && isNum(pc_.score) && isNum(pmm.bdcPriceToBook) ? `BDCs trade at ${f2(pmm.bdcPriceToBook)}x book against a ${f2(pmm.bdcPriceToBookMedian)}x median` : '', ...PP.filter((p) => !isNum(p.score)).map((p) => `${p.label.toLowerCase()}: no signal has passed the evidence test`)].filter(Boolean).join('; ') + '.',
        drivers: PP.map((p) => `**${p.label} ${isNum(p.score) ? f2(p.score) : 'no call'}**: ${p.components.map((c) => `${c.name.split(':')[0].toLowerCase()} ${isNum(c.value) ? f2(c.value) : '—'}${c.live ? '' : ' (evidence only)'}`).join(', ')}; 12-month relative return ${spc(p.rel12m, 0)}.`),
        ev, rev: calls.map((p) => p.key === 'pc' ? `The BDC call fades as the discount to book closes toward the ${f2(pmm.bdcPriceToBookMedian)}x median or the yield gap over high yield narrows.` : `The ${p.label.toLowerCase()} call reverses if its live signals turn.`),
        cover: [pmm.note], more: 'Listed proxies trade daily and move more than the private funds they stand in for. Full history on Relative trends, Private markets.', key: { pm: Object.fromEntries(PP.map((p) => [p.key, p.score])) } });
    }

    // 7. The dollar
    const dxy = fxm && (fxm.aggregates || []).find((a) => a.code === 'DXY');
    if (dxy) {
      const ev = { pts: null, label: (dxy.ic || {}).longTerm12 > 0 && (dxy.ic || {}).cyclical6 > 0 ? ['Moderate', 'mid'] : ['Mixed', 'warn'], sup: [], weak: [] };
      const ic = dxy.ic || {};
      (ic.longTerm12 > 0 ? ev.sup : ev.weak).push(`Long-term (valuation and real rates) view has a 12-month rank correlation of ${f2(ic.longTerm12)} with later moves.`);
      (ic.cyclical6 > 0 ? ev.sup : ev.weak).push(`**The cyclical view has a negative track record for the index** (${f2(ic.cyclical6)} at 6 months), so it is weighted down.`);
      out.push({ id: 'usd', name: 'The dollar', go: 'fx', tilt: Math.abs(dxy.combined) < 0.1 ? 'Neutral' : dxy.combined > 0 ? 'Stronger dollar' : 'Weaker dollar',
        sub: `model view ${sg(dxy.combined, 2)} (cyclical ${sg(dxy.cyclical, 2)}, long-term ${sg(dxy.longTerm, 2)}); index ${f2(dxy.level, 1)}, ${spc(dxy.m3, 1)} over 3 months`,
        because: `the cyclical and long-term views roughly cancel (${sg(dxy.cyclical, 2)} and ${sg(dxy.longTerm, 2)}).`,
        drivers: [`Dollar index ${f2(dxy.level, 1)}; speculative positioning ${sg(dxy.positioningZ, 1)} sd.`, 'Matters for the portfolio through EM local currency debt and the unhedged international equity funds (see exposures below).'],
        ev, rev: [`A combined view beyond ±0.10 would make the dollar an active call; it is ${sg(dxy.combined, 2)} now.`], cover: [], key: { dxy: dxy.combined } });
    }
    return out;
  };

  // ---------- what changed since the previous saved review ----------
  const reviews = () => {
    const L = G.rows('model_log').slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    return { L, cur: L[L.length - 1] || null, prev: L.length > 1 ? L[L.length - 2] : null };
  };
  const obsNow = () => {
    const sb = one('model_sb') || {}, fi = one('model_fi') || {}, ms = one('macro_state') || {}, rc = G.rows('rates_credit');
    const o = { erp: sbIn(sb, 'Equity risk premium, US'), real10: sbIn(sb, 'Real 10-year yield'), curve: sbIn(sb, '2s10s curve'), eqbond12: sbIn(sb, 'Global equities less US bonds'), trend10: sbIn(sb, 'Global equities vs 10-month'),
      hy6: sbIn(sb, 'High yield vs Treasuries'), nowcast: sbIn(sb, 'US growth nowcast'), gsurp: sbIn(sb, 'Global growth surprises'), vol3m: sbIn(sb, 'Equity volatility, 3 months'), vix: sbIn(sb, 'VIX'), spxpos: sbIn(sb, 'S&P 500 futures positioning'),
      cpi: (ms.levels || {}).cpiYoY, unemp: (ms.levels || {}).unemployment, fedfunds: (ms.levels || {}).fedFunds, fi: Object.fromEntries((fi.levers || []).map((l) => [l.key, (l.inputs || []).map((i) => i.value)])), rc: {} };
    for (const k of ['n2', 'n10', 'ry10', 'be10', 'oas_ig', 'oas_hy']) for (let i = rc.length - 1; i >= 0; i--) if (isNum(rc[i][k])) { o.rc[k] = [rc[i].date, rc[i][k]]; break; }
    return o;
  };
  const OBS = [['curve', '2s10s curve', (x) => bps(x), (a, b) => bps(b - a)], ['erp', 'US equity risk premium', (x) => f2(x) + ' pts', (a, b) => sg(b - a, 2) + ' pts'], ['real10', '10-year less CPI', (x) => f2(x) + '%', (a, b) => bps(b - a)],
    ['gsurp', 'Global growth surprises', (x) => sg(x, 2), (a, b) => sg(b - a, 2)], ['nowcast', 'US growth nowcast (sd)', (x) => sg(x, 2), (a, b) => sg(b - a, 2)], ['cpi', 'CPI inflation, a year', (x) => f2(x, 1) + '%', (a, b) => sg(b - a, 1) + ' pts'],
    ['vix', 'VIX', (x) => f2(x, 1), (a, b) => sg(b - a, 1)], ['hy6', 'High yield vs Treasuries, 6 months', (x) => spc(x, 1), (a, b) => pts(b - a, 1)], ['spxpos', 'S&P 500 futures positioning (sd)', (x) => sg(x, 2), (a, b) => sg(b - a, 2)]];
  const RCO = [['n10', '10-year Treasury'], ['ry10', '10-year TIPS real yield'], ['be10', '10-year breakeven'], ['oas_hy', 'High-yield spread (ICE BofA)']];
  const rcAt = (k, date) => { const rc = G.rows('rates_credit'); let v = null; for (const r of rc) { if (r.date > date) break; if (isNum(r[k])) v = [r.date, r[k]]; } return v; };

  const drawChanges = (box, V) => {
    const { L, cur, prev } = reviews();
    box.replaceChildren(el('h3', 'What changed since the previous saved review', 'gm-h3'));
    if (!cur) { box.append(P('No saved review yet: the review log is empty, so there is nothing to compare against.', 'gm-note')); return; }
    if (!prev) {
      const next = new Date(cur.date + 'T12:00:00Z'); next.setUTCDate(next.getUTCDate() + 7);
      box.append(P(`**No earlier saved review to compare with.** The review log starts with the ${day(cur.date)} review, so a change cannot be shown without reconstructing it. The first comparison will appear after the next weekly rebuild (about ${day(next.toISOString().slice(0, 10))}). The model pages' earlier values are backtest reconstructions, not saved reviews, and are not used here.`, 'x-dnone'));
      if (cur.obs) box.append(P(`The observations behind this review were saved with it (${Object.keys(cur.obs).length} groups), so next week's comparison will use the values actually seen on ${day(cur.date)}.`, 'gm-note'));
      return;
    }
    const sb = one('model_sb'), fi = one('model_fi'), ra = one('model_ra'), fxm = one('fx_model');
    const rows = [];
    const add = (what, a, b, d, big) => rows.push({ what, a, b, d, big, same: String(a) === String(b) });
    add('Stocks vs bonds: equity weight', pc(prev.sbWeight, 0), pc(sb ? sb.equityWeight : cur.sbWeight, 0), pts((sb ? sb.equityWeight : cur.sbWeight) - prev.sbWeight, 1), Math.abs((sb ? sb.equityWeight : cur.sbWeight) - prev.sbWeight) >= 0.03);
    const LBL = { duration: 'Duration', ig: 'IG credit', hy: 'High yield', mbs: 'Agency MBS', emd: 'EM dollar debt', tips: 'TIPS', fx: 'EM local currency', intl: 'International bonds, hedged' };
    for (const l of (fi && fi.levers) || []) {
      const a = (prev.fi || {})[l.key], b = l.position; if (!isNum(a) && !isNum(b)) continue;
      if (l.key === 'duration') { const g = l.durGap || 14; add('Duration vs the Agg', sg((a || 0) * g, 2, ' yrs'), sg((b || 0) * g, 2, ' yrs'), sg(((b || 0) - (a || 0)) * g, 2, ' yrs'), Math.abs(((b || 0) - (a || 0)) * g) >= 0.5); }
      else add((LBL[l.key] || l.label || l.key) + ' tilt', spc(a || 0, 1), spc(b || 0, 1), pts((b || 0) - (a || 0), 1), Math.abs((b || 0) - (a || 0)) >= 0.05 || (a > 1e-3) !== (b > 1e-3));
    }
    for (const x of (ra && ra.assets) || []) { const a = (prev.ra || {})[x.etf]; if (isNum(a)) add(x.label + ' diversifier score', f2(a), f2(x.score), sg(x.score - a, 2), (a > 0) !== (x.score > 0)); }
    const dxy = fxm && (fxm.aggregates || []).find((a) => a.code === 'DXY');
    if (dxy && isNum(prev.dxy)) add('Dollar view', sg(prev.dxy, 2), sg(dxy.combined, 2), sg(dxy.combined - prev.dxy, 2), Math.abs(dxy.combined - prev.dxy) >= 0.2);
    const ms = one('macro_state');
    if (prev.regime && ms) add('Growth and inflation regime', prev.regime, ms.quadrant, prev.regime === ms.quadrant ? 'unchanged' : 'changed', prev.regime !== ms.quadrant);
    // equity layer scores from the saved weekly score history (default composite)
    const SH = G.rows('score_history'), at = (d, e) => (SH.find((r) => r.date === d && r.etf === e) || {}).cmp_equal_contra;
    const shDates = [...new Set(SH.map((r) => r.date))].sort(), pd = shDates.filter((d) => d <= prev.date).pop(), cd = shDates[shDates.length - 1];
    for (const [e, l] of [['SPY', 'US'], ['EFA', 'Developed ex-US'], ['EEM', 'Emerging markets'], ['RSP', 'US equal weight'], ['IJR', 'US small cap (S&P 600)']]) {
      const a = pd ? at(pd, e) : null, b = at(cd, e);
      if (isNum(a) && isNum(b)) add(`Equity score: ${l}`, Math.round(a), Math.round(b), sg(b - a, 0), Math.abs(b - a) >= 8);
    }
    if (prev.eqTop && cur.eqTop && prev.eqTop.join() !== cur.eqTop.join()) add('Top equity sleeves', prev.eqTop.slice(0, 3).join(', '), cur.eqTop.slice(0, 3).join(', '), 'changed', true);
    const t = el('table', null, 'gm-table gm-compact gm-static'); const wrap = el('div', null, 'gm-tablewrap'); wrap.append(t);
    box.append(P(`Against the review saved on **${day(prev.date)}** (current: ${day(cur.date)}). Bold rows are material: at least 3 points of equity weight, 5 points in a bond tilt or half a year of duration, a sign change, a regime change, or 8 points of equity score.`, 'gm-note'), wrap);
    const moved = rows.filter((r) => !r.same), still = rows.filter((r) => r.same);
    G.table(t, [{ t: 'Call', f: (r) => r.what }, { t: day(prev.date), f: (r) => String(r.a), num: true }, { t: 'Now', f: (r) => String(r.b), num: true }, { t: 'Change', f: (r) => r.d, num: true }], moved);
    [...t.tBodies[0].rows].forEach((tr, i) => { if (moved[i].big) tr.classList.add('x-dbig'); });
    if (!moved.length) G.placeholder(t, 'No call changed.');
    if (still.length) box.append(P('Unchanged: ' + still.map((r) => r.what.replace(/ (tilt|diversifier score)$/, '')).join(', ') + '.', 'gm-note'));
    // observations: the values saved with that review; FRED series are read at that date (they are recorded data, not model output)
    const o0 = prev.obs, o1 = obsNow(), orows = [];
    for (const [k, l, fmt, dfmt] of OBS) {
      if (!o0) break; const a = o0[k], b = o1[k];
      if (isNum(a) && isNum(b)) orows.push({ l, a: fmt(a), b: fmt(b), d: dfmt(a, b) });
    }
    for (const [k, l] of RCO) {
      const a = (o0 && o0.rc && o0.rc[k]) || rcAt(k, prev.date), b = o1.rc[k];
      if (a && b) orows.push({ l: `${l} (${day(a[0])} → ${day(b[0])})`, a: f2(a[1]) + '%', b: f2(b[1]) + '%', d: bps(b[1] - a[1]) });
    }
    const t2 = el('table', null, 'gm-table gm-compact gm-static'); const w2 = el('div', null, 'gm-tablewrap'); w2.append(t2);
    box.append(el('h4', 'The observations behind them', 'x-dh4'), w2);
    const om = orows.filter((r) => r.a !== r.b), os = orows.filter((r) => r.a === r.b);
    G.table(t2, [{ t: 'Observation', f: (r) => r.l }, { t: day(prev.date), f: (r) => r.a, num: true }, { t: 'Now', f: (r) => r.b, num: true }, { t: 'Change', f: (r) => r.d, num: true }], om);
    if (!om.length) G.placeholder(t2, 'No observation changed.');
    if (os.length) box.append(P('Unchanged: ' + os.map((r) => r.l.replace(/ \(.*\)$/, '')).join(', ') + '.', 'gm-note'));
    if (!o0) box.append(P(`The ${day(prev.date)} review did not save its model inputs, so only recorded market series (Treasury yields, breakevens, spreads) are compared; model inputs such as the equity risk premium are not reconstructed.`, 'gm-note'));
  };

  // ---------- what dominates the portfolio ----------
  const drawExposure = (box) => {
    box.replaceChildren(el('h3', 'What dominates the resulting portfolio', 'gm-h3'));
    const mp = window.GM_MP; if (!mp || !mp.p) { box.append(P('Waiting for the model portfolio below to finish loading.', 'gm-note')); return; }
    const p = mp.p, rk = mp.risk || {}, RM = one('risk_model');
    const tiles = el('div', null, 'x-tiles');
    const tile = (k, v, s) => { const d = el('div', null, 'x-tile'); d.append(el('span', k, 'x-tile-k'), el('span', v, 'x-tile-v'), el('span', s, 'x-tile-s')); tiles.append(d); };
    tile('Equities / bonds', `${pc(p.E, 0)} / ${pc(p.B, 0)}`, `reference ${pc(p.N, 0)} / ${pc(1 - p.N, 0)}${p.D ? ', diversifiers ' + pc(p.D, 0) : ''}`);
    tile('Expected volatility', pc(rk.vol, 1), `reference ${pc(rk.refVol, 1)}`);
    tile('Tracking error', pc(rk.te, 2), 'against the reference');
    const parts = (rk.parts || []).filter((x) => Math.abs(x.contrib) > 1e-5).sort((a, b) => b.contrib - a.contrib);
    if (parts[0] && rk.te) tile('Largest source of active risk', `${Math.round(parts[0].contrib / rk.te * 100)}%`, parts[0].k.toLowerCase());
    box.append(tiles);
    const bul = [];
    const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
    if (parts.length && rk.te) bul.push(`**${parts[0].k} is ${Math.round(parts[0].contrib / rk.te * 100)}% of the active risk**; ${parts.slice(1).map((x) => `${lc(x.k)} ${sg(x.contrib / rk.te * 100, 0, '%').replace(/^\+/, '')}`).join(', ')}. ${parts.find((x) => /instead of ACWI/.test(x.k)) ? 'Holding country funds instead of ACWI is an implementation choice, not a view.' : ''}`);
    // factor sensitivities from five years of monthly returns
    if (RM && RM.betas) {
      const sum = (w, f) => Object.entries(w).reduce((a, [s, x]) => a + x * ((RM.betas[s] || {})[f] || 0), 0);
      const F = [['eq', 'Equity beta (to ACWI)', (x) => f2(x)], ['rates', 'Return for a 1-point rise in the 10-year yield', (x) => spc(x, 1)], ['usd', 'Dollar beta (to the dollar fund UUP)', (x) => f2(x)]];
      const fx_ = F.map(([k, l, fmt]) => ({ l, m: sum(p.hold, k), r: sum(p.ref, k), fmt }));
      const t = el('table', null, 'gm-table gm-compact gm-static'), w = el('div', null, 'gm-tablewrap'); w.append(t);
      box.append(el('h4', 'Exposure to the big market drivers', 'x-dh4'), w);
      G.table(t, [{ t: 'Driver', f: (r) => r.l }, { t: 'Portfolio', f: (r) => r.fmt(r.m), num: true }, { t: 'Reference', f: (r) => r.fmt(r.r), num: true }, { t: 'Difference', f: (r) => r.fmt(r.m - r.r), num: true }], fx_);
      const eqx = fx_[0], ux = fx_[2];
      bul.push(`**Equity beta ${f2(eqx.m)} against ${f2(eqx.r)}**: the overweight raises market exposure by about ${Math.round((eqx.m / eqx.r - 1) * 100)}%.`);
      if (Math.abs(ux.m - ux.r) > 0.02) bul.push(`Dollar exposure ${ux.m - ux.r > 0 ? 'rises' : 'falls'} (${f2(ux.m)} vs ${f2(ux.r)}), mainly through the unhedged international funds and EM local currency debt.`);
    }
    // largest single holdings: funds and, through them, companies
    const U = new Map([...G.rows('etf_universe'), ...G.rows('bond_stats')].map((u) => [u.etf, u.label]));
    const funds = Object.entries(p.hold).filter(([, w]) => w > 0.02).sort((a, b) => b[1] - a[1]);
    if (funds.length) bul.push(`Largest funds: ${funds.slice(0, 4).map(([e, w]) => `${U.get(e) || e} (${e}) ${pc(w, 1)}`).join(', ')}.`);
    const H = G.rows('fund_holdings');
    if (H.length) {
      const co = new Map(), cr = new Map();
      for (const h of H) { const wm = p.hold[h.etf], wr = p.ref[h.etf] || 0; if (h.etf === 'ACWI') continue; if (wm) co.set(h.symbol, (co.get(h.symbol) || { name: h.name, w: 0 })), co.get(h.symbol).w += wm * h.weight / 100; if (wr) cr.set(h.symbol, (cr.get(h.symbol) || 0) + wr * h.weight / 100); }
      // the reference is ACWI: use its own holdings when available
      const acwi = H.filter((h) => h.etf === 'ACWI'); if (acwi.length) { cr.clear(); for (const h of acwi) cr.set(h.symbol, p.N * h.weight / 100); }
      const top = [...co.entries()].sort((a, b) => b[1].w - a[1].w).slice(0, 10), t10 = top.reduce((a, [, x]) => a + x.w, 0);
      bul.push(`**The ten largest companies are ${pc(t10, 1)} of the portfolio** (${pc(t10 / p.E, 0)} of its equities): ${top.slice(0, 5).map(([s, x]) => `${s} ${pc(x.w, 1)}${cr.has(s) ? ` (${pts(x.w - cr.get(s), 1)})` : ''}`).join(', ')}.`);
    }
    // stock-bond correlation now and a year ago (daily returns, 63 days)
    if (A) {
      const a = A.series('ACWI'), b = A.series('AGG');
      const corr = (end) => {
        const mb = new Map(b.map(([d, v]) => [+d, v])), xs = [], ys = [];
        const sel = a.filter(([d]) => d <= end).slice(-64);
        for (let i = 1; i < sel.length; i++) { const p0 = mb.get(+sel[i - 1][0]), p1 = mb.get(+sel[i][0]); if (p0 && p1) { xs.push(sel[i][1] / sel[i - 1][1] - 1); ys.push(p1 / p0 - 1); } }
        if (xs.length < 40) return null;
        const mx = xs.reduce((s, v) => s + v, 0) / xs.length, my = ys.reduce((s, v) => s + v, 0) / ys.length;
        let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
        return sxy / Math.sqrt(sxx * syy);
      };
      if (a.length && b.length) {
        const last = a[a.length - 1][0], c0 = corr(last), c1 = corr(new Date(+last - 365 * 864e5));
        if (isNum(c0)) bul.push(c0 > 0.2 ? `**Bonds are hedging less**: global equities (ACWI) and US bonds (AGG) have moved together over three months (daily correlation ${f2(c0)}${isNum(c1) ? `, against ${f2(c1)} a year ago` : ''}), so the bond sleeve offsets less equity risk than usual.` : `Stocks and bonds: three-month daily correlation ${f2(c0)}${isNum(c1) ? ` (${f2(c1)} a year ago)` : ''}.`);
      }
    }
    box.append(UL(bul));
  };

  // ---------- data dates and coverage ----------
  const dates = (V) => {
    const { cur } = reviews(), sb = one('model_sb'), ms = one('macro_state'), pos = one('positioning'), rc = G.rows('rates_credit');
    const eqAsOf = window.GM_EQ && window.GM_EQ.rows ? window.GM_EQ.rows.map((r) => r.asOf).filter(Boolean).sort().pop() : null;
    const lastRel = ms && (ms.recent || []).map((r) => r.date).sort().pop();
    let n10d = null; for (let i = rc.length - 1; i >= 0; i--) if (isNum(rc[i].n10)) { n10d = rc[i].date; break; }
    const m = typeof dash.manifest === 'function' ? dash.manifest() : null;
    const items = [
      ['Saved review', cur ? day(cur.date) : '—', cur && daysOld(cur.date) > 9],
      ['Model signals', sb ? 'monthly; ' + new Date(sb.asOf + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) + ' month to date' : '—', false],
      ['Equity scores', eqAsOf ? day(eqAsOf) + ' close' : '—', eqAsOf && daysOld(eqAsOf) > 9],
      ['Latest macro release', lastRel ? day(lastRel) : '—', lastRel && daysOld(lastRel) > 14],
      ['Futures positioning', pos ? day(pos.asOf) : '—', pos && daysOld(pos.asOf) > 12],
      ['Treasury yields & spreads', n10d ? day(n10d) + ' (FRED)' : '—', n10d && daysOld(n10d) > 6],
    ];
    if (m && m.builtAt) items.push(['Market prices', new Date(m.builtAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }), false]);
    const dl = el('div', null, 'x-ddates');
    for (const [k, v, stale] of items) { const s = el('span', null, 'x-ddate' + (stale ? ' x-dstale' : '')); s.append(el('b', k + ' '), document.createTextNode(v + (stale ? ' · stale' : ''))); dl.append(s); }
    return dl;
  };

  const headline = (V) => {
    const g = (id) => V.find((v) => v.id === id);
    const sb = g('sb'), du = g('dur'), fi = g('fi'), er = g('eqr'), ra = g('ra');
    const bits = [];
    if (sb) { const t = sb.key.tilt; bits.push(`**${Math.abs(t) < 1 ? 'Neutral between stocks and bonds' : (Math.abs(t) < 5 ? 'Slight' : Math.abs(t) < 10 ? 'Modest' : 'Large') + ' overweight in ' + (t > 0 ? 'equities' : 'bonds')} (${pc(sb.key.w, 0)}, ${sg(t, 0)} pts)**${sb.id && /curve/.test(sb.because) ? ', resting mainly on a flat yield curve' : ''}`); }
    if (du || fi) bits.push(`in bonds, **${du ? du.tilt.toLowerCase() + ' duration' : 'benchmark duration'}${fi && fi.key.held.length ? ' with ' + fi.tilt : ''}**`);
    if (er) bits.push(/Lean/.test(er.tilt) ? `in equities, a **small l${er.tilt.slice(1)}**` : `in equities, **regional weights ${/Close/.test(er.tilt) ? 'close to ACWI' : er.tilt.toLowerCase()}**`);
    return bits.length ? bits.join('; ') + '.' : '';
  };

  const OPEN = new Set();
  const viewCard = (v) => {
    const d = el('details', null, 'x-view'); if (OPEN.has(v.id)) d.open = true; d.dataset.view = v.id;
    d.addEventListener('toggle', () => { if (d.open) OPEN.add(v.id); else OPEN.delete(v.id); });
    const s = el('summary', null, 'x-view-s');
    const nm = el('span', v.name, 'x-view-n'), tl = el('span', v.tilt, 'x-view-t'), sub = el('span', v.sub, 'x-view-sub');
    const meta = el('span', null, 'x-view-m');
    meta.append(chip('Evidence: ' + v.ev.label[0], v.ev.label[1], 'From the rubric under Evidence; open the row for the reasons.'));
    if (v.change) meta.append(chip(v.change[0], v.change[1]));
    s.append(nm, tl, meta, sub);
    const why = el('div', null, 'x-view-why');
    if (v.because) why.append(P('**Why:** ' + v.because.replace(/^(.)/, (c) => c.toUpperCase()), 'x-line'));
    if (v.rev && v.rev[0]) why.append(P('**What would reverse it:** ' + v.rev[0].replace(/\*\*/g, ''), 'x-line'));
    s.append(why);
    d.append(s);
    const body = el('div', null, 'x-view-b');
    const col = (h, items, cls) => { if (!items || !items.filter(Boolean).length) return null; const c = el('div', null, 'x-view-c ' + (cls || '')); c.append(el('h4', h, 'x-dh4'), UL(items)); return c; };
    const g1 = el('div', null, 'x-view-g');
    for (const c of [col('Observations driving it', v.drivers), col('Also on the dashboard (context)', v.context), col('Supports the call', v.ev.sup, 'x-sup'), col('Weakens it', v.ev.weak, 'x-weak'), col('Would neutralize or reverse it', v.rev), col('Coverage and data warnings', v.cover, 'x-cov')]) if (c) g1.append(c);
    body.append(g1);
    if (v.more) body.append(P(v.more, 'gm-note'));
    const go = el('button', 'Open the full model', 'gm-linkbtn'); go.type = 'button'; go.addEventListener('click', () => G.go(v.go)); body.append(go);
    d.append(body);
    return d;
  };

  const draw = (sec) => {
    let box = $('#xd', sec);
    if (!box) return;
    const missing = IDS.filter((id) => !G.ok(id) && !G.bad(id));
    if (missing.includes('model_sb') || missing.includes('model_fi') || missing.includes('model_log')) { if (!box.childElementCount) G.placeholder(box, 'Loading the decision summary…'); return; }
    const V = views();
    // change chips from the previous saved review
    const { prev } = reviews();
    for (const v of V) {
      if (!prev) { v.change = null; continue; }
      if (v.id === 'sb') { const d_ = (v.key.w - prev.sbWeight) * 100; v.change = [Math.abs(d_) < 0.5 ? 'Unchanged since ' + day(prev.date) : sg(d_, 0) + ' pts since ' + day(prev.date), Math.abs(d_) >= 3 ? 'warn' : 'muted']; }
      else if (v.id === 'dur') { const fi = one('model_fi'), l = (fi.levers || []).find((x) => x.key === 'duration'), d_ = ((l.position || 0) - ((prev.fi || {}).duration || 0)) * (l.durGap || 14); v.change = [Math.abs(d_) < 0.1 ? 'Unchanged' : sg(d_, 1) + ' yrs', Math.abs(d_) >= 0.5 ? 'warn' : 'muted']; }
      else if (v.id === 'fi') { const fi = one('model_fi'), mx = Math.max(0, ...(fi.levers || []).filter((l) => l.key !== 'duration').map((l) => Math.abs((l.position || 0) - ((prev.fi || {})[l.key] || 0)))); v.change = [mx < 0.005 ? 'Unchanged' : 'Up to ' + (mx * 100).toFixed(0) + ' pts moved', mx >= 0.05 ? 'warn' : 'muted']; }
      else if (v.id === 'pm' && prev.pm) { const mx = Math.max(0, ...Object.entries(v.key.pm || {}).map(([k, x]) => (isNum(x) && isNum(prev.pm[k]) ? Math.abs(x - prev.pm[k]) : 0))); v.change = [mx < 0.05 ? 'Unchanged' : 'Moved up to ' + mx.toFixed(2), mx >= 0.3 ? 'warn' : 'muted']; }
      else if (v.id === 'usd' && isNum(prev.dxy)) { const d_ = v.key.dxy - prev.dxy; v.change = [Math.abs(d_) < 0.05 ? 'Unchanged' : sg(d_, 2), Math.abs(d_) >= 0.2 ? 'warn' : 'muted']; }
      else v.change = ['See changes below', 'muted'];
    }
    box.replaceChildren();
    const top = el('div', null, 'x-dtop');
    const h = el('div', null, 'gm-hrow'); h.append(el('h2', 'Decision summary', 'gm-h2')); top.append(h);
    top.append(dates(V));
    const hl = headline(V); if (hl) top.append(P(hl, 'x-dhead'));
    top.append(P((prev ? '' : 'No earlier saved review yet, so no changes are shown (see below). ') + 'Each row: the view and its size, the evidence grade, the observation that drives it and what would reverse it. Open a row for the full evidence. This synthesizes the weight of the evidence for a human decision; it is not a systematic strategy.', 'gm-note'));
    box.append(top);
    const list = el('div', null, 'x-views');
    V.forEach((v, i) => { try { list.append(viewCard(v)); } catch (e) { console.error('decision view ' + v.id, e); } });
    box.append(list);
    const grid = el('div', null, 'x-dgrid');
    const c1 = el('div', null, 'gm-block x-dchg'), c2 = el('div', null, 'gm-block x-dexp');
    try { drawChanges(c1, V); } catch (e) { console.error('decision changes', e); G.failed(c1, 'The comparison'); }
    try { drawExposure(c2); } catch (e) { console.error('decision exposure', e); G.failed(c2, 'The exposure summary'); }
    grid.append(c1, c2); box.append(grid);
    // decision-relevant coverage warnings in one place
    const cov = V.flatMap((v) => (v.cover || []).map((t) => `${v.name}: ${t}`));
    if (cov.length) { const c = el('div', null, 'gm-block x-dcov'); c.append(el('h3', 'Coverage warnings that affect a decision', 'gm-h3'), UL(cov)); box.append(c); }
  };

  window.GMXD = { views, reviews };
  G.page('summary', draw);
  document.addEventListener('gm-mp', () => { if ((document.body.dataset.page || '') === 'summary') G.redraw(); });
})();
