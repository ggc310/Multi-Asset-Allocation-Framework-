// What is tracked where: a one-line label at the top of every page that shows results, saying which of three kinds of number it
// holds (live record, backtest, or this week's reading), what portfolio or signal it is, and against what. The definitions sit in
// the info entry 'trackedWhere', opened from each label. Pages are matched by their id; labels are re-added if a page redraws.
(() => {
  const G = window.GMX;
  if (!G) return;
  const KIND = { live: ['Live record', 'x-tk-live'], bt: ['Backtest', 'x-tk-bt'], now: ['This week’s reading', 'x-tk-now'], ref: ['Reference', 'x-tk-ref'] };
  const btWin = () => { const b = document.querySelector('#bt-win button[aria-pressed="true"]'); return b ? b.textContent.trim() : ''; };
  const LABELS = {
    live: ['live', 'The model portfolios exactly as published each Saturday, compounded daily from the next trading day against 60% ACWI and 40% US Aggregate, gross of costs. Nothing on this page is simulated or revised. Switch between the tracked portfolio (no diversifiers) and the version with a 10% diversifier sleeve at the top.'],
    history: ['live', 'A live record of the equity scores, not of the published portfolio: each weekly snapshot’s top fifth of the 62 equity sleeves against the bottom fifth and against all sleeves equally weighted, chained week to week. The portfolio’s own live record is on Live results.', true],
    backtest: ['bt', () => `Simulated history of the equity scores, rebuilt with data as it was known at each date, against ACWI. ${btWin() ? 'Window: ' + btWin().toLowerCase() + '. ' : ''}Holdings before late 2021 are partly backfilled; choose filed holdings only to exclude them. Not a live record: the published portfolio’s results are on Live results.`, true],
    sbbt: ['bt', 'Simulated monthly history of the stocks vs bonds model, with every input as it was known at each month-end (revised macro data lagged, partial months excluded). Each chart names its benchmark. Not a live record: see Live results.', true],
    fibt: ['bt', 'Simulated history of the fixed income tilts, with inputs as known at each date, against the US Aggregate. Not a live record: see Live results.', true],
    rabt: ['bt', 'Simulated history of the real assets and diversifier model, with inputs as known at each date; each chart names its benchmark. Its weights feed the with-diversifiers portfolio on Live results.', true],
    fxbt: ['bt', 'Simulated history of the currency models, with inputs as known at each date. The currency views inform the portfolio but are not held as separate positions.', true],
    scorecard: ['bt', 'How each model’s signals have done, almost all from backtests. Live evidence for the published portfolio is on Live results; for the equity ranking, on Equity live record.', true],
    lab: ['bt', 'Experiments: backtests of alternative settings. Nothing here changes the published portfolio until an experiment is promoted, which is logged under saved experiments.', true],
    method: ['ref', 'How the models are built and tested. For which numbers are live and which are simulated, see What is tracked where.'],
    summary: ['now', 'This week’s model calls and the portfolio they imply. “What changed since the previous saved review” compares the saved weekly calls, the same calls the live record tracks; nothing in it comes from a backtest.', true],
    week: ['now', 'This week’s calls and how markets moved. The portfolio these calls produce is recorded every Saturday and tracked on Live results.', true],
  };
  const make = (id, spec) => {
    const [k, txt, link] = spec;
    const box = G.el('div', null, 'x-tk'); box.dataset.tk = id;
    const chip = G.el('span', KIND[k][0], 'x-tk-chip ' + KIND[k][1]);
    const p = G.el('span', typeof txt === 'function' ? txt() : txt, 'x-tk-txt');
    const defs = G.el('span', 'What is tracked where', 'x-tk-defs');
    const info = G.el('button', 'i', 'gm-i'); info.type = 'button'; info.dataset.info = 'trackedWhere'; info.setAttribute('aria-label', 'What is tracked where');
    defs.append(info);
    box.append(chip, p, defs);
    if (link) { const a = G.el('button', 'Live results →', 'gm-linkbtn x-tk-go'); a.type = 'button'; a.addEventListener('click', () => G.go('live')); box.append(a); }
    return box;
  };
  const place = () => {
    const id = document.body.dataset.page || '';
    const spec = LABELS[id]; if (!spec) return;
    const sec = document.getElementById(id); if (!sec || sec.hidden) return;
    let box = sec.querySelector(':scope > .x-tk');
    const txt = typeof spec[1] === 'function' ? spec[1]() : spec[1];
    if (box && box.querySelector('.x-tk-txt').textContent === txt) { if (sec.firstElementChild !== box) sec.prepend(box); return; }
    if (box) box.remove();
    sec.prepend(make(id, spec));
  };
  let t = 0;
  const later = () => { clearTimeout(t); t = setTimeout(place, 80); };
  new MutationObserver(later).observe(document.body, { attributes: true, attributeFilter: ['data-page'] });
  if (window.dash && dash.onData) dash.onData(later);
  document.addEventListener('click', (e) => { if (e.target.closest('#bt-win')) later(); }, true);
  const st = document.createElement('style');
  st.textContent = '.x-tk{display:flex;flex-wrap:wrap;align-items:baseline;gap:.35rem .6rem;margin:0 0 .9rem;padding:.5rem .75rem;border:1px solid var(--color-border-line);border-left:3px solid var(--gm-navy,#1f3a5f);border-radius:4px;background:var(--color-panel,#f6f8fa);font-size:.8125rem;line-height:1.45;grid-column:1/-1}'
    + '.x-tk-chip{font-size:.6875rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase;padding:.05rem .4rem;border-radius:3px;white-space:nowrap}'
    + '.x-tk-live{background:rgba(22,128,61,.12);color:#166534}.x-tk-bt{background:rgba(71,85,105,.14);color:#334155}.x-tk-now{background:rgba(31,95,168,.12);color:#1f4f8a}.x-tk-ref{background:rgba(71,85,105,.08);color:#475569}'
    + '.x-tk-txt{flex:1 1 30rem;color:var(--color-fg)}.x-tk .gm-linkbtn{font-size:.8125rem;white-space:nowrap}.x-tk-defs{white-space:nowrap;color:var(--color-fg-muted);font-size:.75rem}'
    + '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .x-tk-live{color:#86efac}:root:not([data-theme="light"]) .x-tk-bt{color:#cbd5e1}:root:not([data-theme="light"]) .x-tk-now{color:#93c5fd}:root:not([data-theme="light"]) .x-tk-ref{color:#cbd5e1}}'
    + ':root[data-theme="dark"] .x-tk-live{color:#86efac}:root[data-theme="dark"] .x-tk-bt{color:#cbd5e1}:root[data-theme="dark"] .x-tk-now{color:#93c5fd}:root[data-theme="dark"] .x-tk-ref{color:#cbd5e1}';
  document.head.append(st);
  later();
})();
