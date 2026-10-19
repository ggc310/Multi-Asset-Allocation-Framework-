// Decide → Real assets & alternatives: private markets through listed proxies (model_pm, from models.py).
// BDCs (BIZD) against high yield and listed private equity (PSP) against global equities: relative-value calls, not diversifiers.
(() => {
  const G = window.GMX;
  if (!G) return;
  const { el, $, isNum, pct, fx } = G;
  const M = '−';
  const sgn = (x, d = 2) => (!isNum(x) ? '—' : (x >= 0 ? '+' : M) + Math.abs(x).toFixed(d));
  G.page('ra', (sec) => {
    const tbl = $('#pm-table', sec), notes = $('#pm-notes', sec);
    if (!tbl) return;
    if (G.bad('model_pm')) { G.failed(tbl, 'The private markets model'); notes.replaceChildren(); return; }
    if (!G.ok('model_pm')) { G.placeholder(tbl); return; }
    const pm = G.rows('model_pm')[0] || {}, P = pm.pairs || [];
    const side = (p) => (!isNum(p.score) ? 'No call' : p.score > 0.1 ? 'Favor ' + p.long : p.score < -0.1 ? 'Favor ' + p.short : 'Neutral');
    G.table(tbl, [
      { t: 'Pair', f: (p) => p.label },
      { t: 'Call', f: side },
      { t: 'Signal', num: true, f: (p) => sgn(p.score), cls: (p) => G.tone(p.score, 0.1) },
      { t: 'Live signals', f: (p) => p.components.filter((c) => c.live).map((c) => `${c.name} ${sgn(c.value)}`).join('; ') || 'None yet' },
      { t: 'Evidence only', f: (p) => p.components.filter((c) => !c.live).map((c) => c.name.split(':')[0]).join('; ') || '—' },
      { t: 'Relative, 12M', num: true, f: (p) => pct(p.rel12m, 1), cls: (p) => G.tone(p.rel12m, 0.001) },
      { t: 'Lead correlation', num: true, title: 'Rank correlation of the signal with the next 12 months’ relative return', f: (p) => fx(p.ic12, 2) },
    ], P);
    const L = [];
    if (isNum(pm.bdcPriceToBook)) L.push(`**BDCs trade at ${pm.bdcPriceToBook.toFixed(2)}x book value**, against a ${pm.bdcPriceToBookMedian.toFixed(2)}x median since their data begins: ${pm.bdcPriceToBook < pm.bdcPriceToBookMedian ? 'a wider discount than usual' : 'a richer price than usual'} (median of ${(pm.bdcs || []).length} BDCs, using each one’s last reported book value 60 days after the quarter).`);
    if (isNum(pm.bdcYieldGap)) L.push(`BIZD’s distribution yield is ${sgn(pm.bdcYieldGap, 1)} points over high yield’s.`);
    for (const p of P) if (!isNum(p.score)) L.push(`${p.label}: no signal has passed the evidence test, so the model makes no call.`);
    L.push('Listed proxies trade daily and move more than the private funds they stand in for; these calls are not held in the model portfolio. Each signal’s full record is on Relative trends, Private markets.');
    notes.replaceChildren(...L.map(G.li));
  });
})();
