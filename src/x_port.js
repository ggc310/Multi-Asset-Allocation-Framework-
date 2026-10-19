// Model portfolio, equity sleeve: the whole equity universe, not only country funds.
// Layer 1 (unchanged): ACWI's country weights tilted by the country scores (Equity allocation settings), with
// countries that have no fund held through ACWX. Layer 2 (this file): part of each region's broad exposure moves into
// the best-scoring sector, industry, style, factor and regional sleeves of that same region, so region weights stay
// where layer 1 put them and the look-through still rolls up by region. app2.js calls window.GMX_PORT from its
// portfolio builder; the inputs below the model portfolio set the budget and the cap.
(() => {
  const G = window.GMX, { isNum } = G;
  const BROAD = new Set(['ACWI', 'ACWX', 'EFA', 'EEM', 'SPY']);
  const KEY = 'gmaaf-port';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const cfg = Object.assign({ budget: 0.2, cap: 0.05, n: 10 }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* private mode */ } };
  const regionOf = (u) => (!u ? null : u.etf === 'SPY' ? 'US' : u.region === 'Emerging' ? 'EM' : u.region === 'Intl developed' ? 'DEV' : u.region === 'US' ? 'US' : null);
  let last = null;

  window.GMX_PORT = (rows, base, alloc) => {
    if (!base || !cfg.budget) { last = { picks: [], cfg }; return base; }
    const U = new Map(G.rows('etf_universe').map((u) => [u.etf, u]));
    const key = (alloc && alloc.key) || 'composite', band = (alloc && alloc.band) || 0;
    const arr = (v) => { if (Array.isArray(v)) return v; if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : null; } catch (e) { return null; } } return null; };
    const RM0 = G.ok('risk_model') ? G.rows('risk_model')[0] : null;
    const RM = RM0 && arr(RM0.symbols) && arr(RM0.cov) ? { ...RM0, symbols: arr(RM0.symbols), cov: arr(RM0.cov) } : null;   // without a usable risk model, picks skip the correlation screen
    const ix = RM ? new Map(RM.symbols.map((s, i) => [s, i])) : null;
    const corr = (a, b) => { if (!ix || !ix.has(a) || !ix.has(b)) return 0; const i = ix.get(a), j = ix.get(b); return RM.cov[i][j] / Math.sqrt(RM.cov[i][i] * RM.cov[j][j]); };
    // candidates: every sleeve not already held by layer 1 and not a broad index
    const cand = rows.filter((r) => !BROAD.has(r.etf) && !(r.etf in base) && isNum(r[key]) && regionOf(U.get(r.etf)))
      .map((r) => ({ etf: r.etf, label: r.label, group: r.group, reg: regionOf(U.get(r.etf)), s: r[key], raw: Math.max(0, r[key] - 50 - Math.max(band, 5)) }))
      .filter((x) => x.raw > 0).sort((a, b) => b.raw - a.raw);
    // one bet, not three: skip a sleeve that moves almost one-for-one with a better-scoring pick
    const picks = [];
    for (const c of cand) { if (picks.length >= cfg.n) break; if (picks.some((p) => corr(p.etf, c.etf) > 0.92)) { c.skipped = picks.find((p) => corr(p.etf, c.etf) > 0.92).etf; continue; } picks.push(c); }
    const tot = picks.reduce((a, p) => a + p.raw, 0);
    if (!tot) { last = { picks: [], cfg, cand }; return base; }
    for (const p of picks) p.w = Math.min(cfg.cap, cfg.budget * p.raw / tot);
    // region exposure in layer 1, and what each region can fund (up to 60% of it)
    const acwx = base.ACWX || 0, ac = G.rows('acwi_countries'), withFund = new Set(Object.keys(base).map((e) => (U.get(e) || {}).country).filter(Boolean));
    const rest = ac.filter((c) => !withFund.has(c.country)), rs = rest.reduce((a, c) => a + c.weight, 0) || 1;
    const DEVNF = new Set(['Netherlands', 'Sweden', 'Denmark', 'Spain', 'Italy', 'Hong Kong', 'Singapore', 'Belgium', 'Finland', 'Norway', 'Israel', 'Ireland', 'New Zealand', 'Austria', 'Portugal', 'Luxembourg']);
    const devShare = rest.filter((c) => DEVNF.has(c.country)).reduce((a, c) => a + c.weight, 0) / rs;
    const src = { US: {}, DEV: {}, EM: {} };
    for (const [e, w] of Object.entries(base)) {
      if (e === 'ACWX') { src.DEV.ACWX = (src.DEV.ACWX || 0) + w * devShare; src.EM.ACWX = (src.EM.ACWX || 0) + w * (1 - devShare); continue; }
      const r = regionOf(U.get(e)) || 'US'; src[r][e] = (src[r][e] || 0) + w;
    }
    const out = { ...base };
    for (const r of ['US', 'DEV', 'EM']) {
      const mine = picks.filter((p) => p.reg === r); if (!mine.length) continue;
      const avail = Object.values(src[r]).reduce((a, b) => a + b, 0), need = mine.reduce((a, p) => a + p.w, 0);
      const k = need > 0.6 * avail ? (0.6 * avail) / need : 1;
      for (const p of mine) { p.w *= k; out[p.etf] = (out[p.etf] || 0) + p.w; }
      const used = need * k;
      for (const [e, w] of Object.entries(src[r])) out[e] -= used * w / (avail || 1);
    }
    for (const e of Object.keys(out)) if (Math.abs(out[e]) < 1e-9) delete out[e];
    last = { picks, cfg, cand };
    return out;
  };
  window.GMX_PORT.state = () => last;

  // controls under the model portfolio's policy inputs
  const wire = () => {
    const row = document.querySelector('#mp .gm-pol'); if (!row || row.dataset.xport) return;
    row.dataset.xport = '1';
    const mk = (id, label, val, min, max, step) => {
      const l = document.createElement('label'); l.className = 'gm-field';
      l.innerHTML = `<span class="gm-label">${label}</span><span class="gm-numin"><input id="${id}" type="number" step="${step}" min="${min}" max="${max}" value="${val}"></span>`;
      row.append(l); return l.querySelector('input');
    };
    const b = mk('pol-sb', 'Equity sleeve budget, % of equities', Math.round(cfg.budget * 100), 0, 60, 5);
    const c = mk('pol-sc', 'Max per sleeve, % of equities', Math.round(cfg.cap * 100), 1, 20, 1);
    const kick = () => { const n = document.getElementById('pol-n'); if (n) n.dispatchEvent(new Event('input', { bubbles: true })); };
    b.addEventListener('input', () => { const v = Number(b.value); if (Number.isFinite(v)) { cfg.budget = Math.max(0, Math.min(0.6, v / 100)); save(); kick(); } });
    c.addEventListener('input', () => { const v = Number(c.value); if (Number.isFinite(v)) { cfg.cap = Math.max(0.01, Math.min(0.2, v / 100)); save(); kick(); } });
  };
  const note = () => {
    const p = document.getElementById('mp-sleeves'); const st = last; if (!p || !st) return;
    if (!st.picks || !st.picks.length) { p.textContent = cfg.budget ? 'No sector, industry, style or factor sleeve scores far enough above 50 to earn a place; equities are held through the country funds.' : 'Equity sleeve budget set to 0%: equities are held through the country funds only.'; return; }
    const R = { US: 'US', DEV: 'developed ex-US', EM: 'emerging markets' };
    const E = (window.GM_MP && window.GM_MP.p && window.GM_MP.p.E) || 1;
    p.replaceChildren();
    const li = G.li(`**Sleeves held (${st.picks.length}), ${G.pct(st.picks.reduce((a, x) => a + x.w, 0), 0, false)} of equities:** ` + st.picks.map((x) => `${x.label} (${x.etf}) ${G.pct(x.w * E, 1, false)}`).join(', ') + `. Each is funded from the broad and country funds of its own region (${[...new Set(st.picks.map((x) => R[x.reg]))].join(', ')}), so region weights are unchanged.` + (st.cand && st.cand.some((c) => c.skipped) ? ` Left out as near-duplicates of a better-scoring pick: ${st.cand.filter((c) => c.skipped).slice(0, 4).map((c) => `${c.etf} (moves with ${c.skipped})`).join(', ')}.` : ''));
    p.append(...li.childNodes);
  };
  const tick = () => { wire(); note(); };
  dash.onData(() => requestAnimationFrame(tick));
  document.addEventListener('gm-mp', tick);
})();
