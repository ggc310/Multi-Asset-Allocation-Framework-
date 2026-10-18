// Today → the four boxes that matter most while the market is open: multi-asset top movers, top equity movers,
// top headlines (live moves joined to the news) and the day in a nutshell. Built from the same live data as the
// rest of the Today page (today_moves, today_flags, today_news, constituent quotes); refreshes with it.
(() => {
  const G = window.GMX, { el, $, isNum } = G;
  const M = '−';
  const pc = (x, d = 1) => (!isNum(x) ? '—' : (x > 0 ? '+' : x < 0 ? M : '') + Math.abs(x * 100).toFixed(d) + '%');
  const bpx = (x) => (!isNum(x) ? '—' : (x > 0 ? '+' : x < 0 ? M : '') + Math.abs(x).toFixed(0) + 'bp');
  const mv = (r) => (r.unit === 'bp' ? bpx(r.d1) : pc(r.d1));
  const tone = (x) => (!isNum(x) || Math.abs(x) < 1e-9 ? '' : x > 0 ? 'x-up' : 'x-dn');
  const B = (t) => { const li = G.li(t); const p = el('p', null, 'td-q-p'); p.append(...li.childNodes); return p; };

  // US market session from the clock in New York (holidays show as a closed day once quotes stop moving)
  const session = () => {
    const ny = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const d = ny.getDay(), m = ny.getHours() * 60 + ny.getMinutes();
    if (d === 0 || d === 6) return 'closed';
    return m < 570 ? 'pre' : m < 960 ? 'open' : 'after';
  };
  const STATUS = { open: 'Market open', pre: 'Before the open: last session shown', after: 'After the close', closed: 'Market closed: last session shown' };

  const KEYS = [ // headline words → the live series they move
    [/\b(oil|crude|opec|brent|wti)\b/i, ['CLUSD', 'BZUSD', 'XLE']], [/\b(gold|bullion)\b/i, ['GCUSD']], [/\b(silver)\b/i, ['SIUSD']], [/\bcopper\b/i, ['HGUSD']],
    [/\b(natural gas|lng)\b/i, ['NGUSD']], [/\b(bitcoin|crypto|btc)\b/i, ['BTCUSD']], [/\b(ether|ethereum)\b/i, ['ETHUSD']],
    [/\b(treasur|yield|bond|auction|bund|gilt)/i, ['UST10Y', 'UST2Y', 'TLT']], [/\b(fed|fomc|powell|rate cut|rate hike|inflation|cpi|pce)\b/i, ['UST2Y', 'UST10Y', 'TIP']],
    [/\b(dollar|greenback|dxy)\b/i, ['DXUSD']], [/\b(yen|japan|boj|nikkei)\b/i, ['USDJPY', 'EWJ']], [/\b(euro|ecb|europe)\b/i, ['EURUSD', 'VGK']], [/\b(china|yuan|beijing|pboc)\b/i, ['MCHI', 'USDCNH']],
    [/\b(india)\b/i, ['INDA']], [/\b(emerging)\b/i, ['EEM']], [/\b(chip|semiconductor|nvidia|tsmc|asml)/i, ['SMH']], [/\b(tech|ai|nasdaq|magnificent|mag 7)\b/i, ['QQQ', 'XLK']],
    [/\b(bank|lender|credit)\b/i, ['XLF', 'HYG']], [/\b(junk|high[- ]yield|spread)/i, ['HYG']], [/\b(small[- ]cap|russell)\b/i, ['IWM']], [/\b(vix|volatility|selloff|sell-off|rout|plunge)\b/i, ['^VIX', 'SPY']],
    [/\b(s&p|stocks|wall street|dow|equities)\b/i, ['SPY']], [/\b(utilities)\b/i, ['XLU']], [/\b(staples)\b/i, ['XLP']], [/\b(health|pharma|drug)/i, ['XLV']], [/\b(reit|real estate)\b/i, ['VNQ']],
  ];

  const draw = (sec) => {
    const box = $('#td-quad', sec); if (!box) return;
    if (!G.ok('today_moves')) { if (!box.childElementCount) G.placeholder(box, 'Loading the live moves…'); return; }
    const R = G.rows('today_moves').filter((r) => isNum(r.d1));
    const by = new Map(R.map((r) => [r.symbol, r]));
    const z = (s) => n(by.get(s) && by.get(s).z_d1), d = (s) => n(by.get(s) && by.get(s).d1);
    function n(x) { return isNum(x) ? Number(x) : null; }
    const asOf = R.map((r) => r.asOf).filter(Boolean).sort().reverse().find((x) => R.filter((r) => r.asOf === x).length > 10);
    const st = session();
    const when = asOf ? new Date(asOf + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }) : '';

    // 1. multi-asset movers, ranked by how unusual the move is against the asset's own daily moves
    const multi = R.filter((r) => isNum(r.z_d1) && r.group !== 'Sectors').sort((a, b) => Math.abs(b.z_d1) - Math.abs(a.z_d1)).slice(0, 8);
    const b1 = el('div', null, 'td-q');
    b1.append(el('h3', 'Global multi-asset top movers', 'td-q-h'), el('p', 'Ranked by how unusual the move is against each asset’s own daily moves over the past year.', 'td-q-n'));
    const t1 = el('table', null, 'gm-table gm-compact gm-static td-q-t'); b1.append(t1);
    G.table(t1, [{ t: 'Asset', f: (r) => r.asset }, { t: 'Class', f: (r) => r.group.replace('Commodities & real assets', 'Commodities').replace('Volatility & crypto', 'Vol & crypto') }, { t: 'Move', f: (r) => mv(r), num: true, cls: (r) => tone((r.unit === 'bp' && /yield/.test(r.asset)) || r.symbol === '^VIX' ? -r.d1 : r.d1) }, { t: 'sd', f: (r) => (r.z_d1 >= 0 ? '+' : M) + Math.abs(r.z_d1).toFixed(1), num: true }], multi);

    // 2. equity movers: large US companies by today's change, plus sector leadership
    const b2 = el('div', null, 'td-q');
    b2.append(el('h3', 'Top equity movers', 'td-q-h'));
    const CQ = G.rows('constituent_quotes'), CN = new Map(G.rows('constituents').map((c) => [c.symbol, c]));
    const big = CQ.map((q) => ({ q, c: CN.get(q.symbol) })).filter((x) => x.c && x.c.country === 'US' && !/\./.test(x.q.symbol) && n(x.c.marketCap) >= 4e10 && isNum(x.q.changePercentage));
    if (big.length) {
      const up = big.slice().sort((a, b) => b.q.changePercentage - a.q.changePercentage).slice(0, 5), dn = big.slice().sort((a, b) => a.q.changePercentage - b.q.changePercentage).slice(0, 5);
      const adv = big.filter((x) => x.q.changePercentage > 0).length;
      b2.append(el('p', `Companies worth $40bn or more: ${adv} of ${big.length} up (${Math.round(adv / big.length * 100)}%).`, 'td-q-n'));
      const g = el('div', null, 'td-q-2');
      for (const [h, list] of [['Gainers', up], ['Decliners', dn]]) {
        const c = el('div'); c.append(el('h4', h, 'td-q-h4'));
        const t = el('table', null, 'gm-table gm-compact gm-static td-q-t'); c.append(t);
        G.table(t, [{ t: 'Company', f: (x) => { const s = el('span'); s.append(el('b', x.q.symbol + ' '), document.createTextNode(String(x.c.name || '').replace(/,? (Inc|Corp|Corporation|Company|Co|Ltd|plc|Holdings|Group)\.?$/i, '').slice(0, 22))); return s; } }, { t: 'Day', f: (x) => pc(x.q.changePercentage / 100), num: true, cls: (x) => tone(x.q.changePercentage) }], list);
        g.append(c);
      }
      b2.append(g);
    } else b2.append(el('p', 'Company quotes are still loading.', 'td-q-n'));
    const secs = R.filter((r) => r.group === 'Sectors').sort((a, b) => b.d1 - a.d1);
    const styles = ['SPY', 'QQQ', 'RSP', 'IWM', 'EFA', 'EEM'].map((s) => by.get(s)).filter(Boolean);
    if (secs.length) b2.append(B(`**Sectors:** best ${secs.slice(0, 2).map((r) => `${r.asset} ${pc(r.d1)}`).join(', ')}; worst ${secs.slice(-2).reverse().map((r) => `${r.asset} ${pc(r.d1)}`).join(', ')}. **Indexes:** ${styles.map((r) => `${r.asset.replace('S&P 500 equal weight', 'equal weight')} ${pc(r.d1)}`).join(', ')}.`));

    // 3. headlines: the most unusual moves stated from the data, then news joined to what is moving
    const b3 = el('div', null, 'td-q');
    b3.append(el('h3', 'Top headlines', 'td-q-h'), el('p', 'The day’s biggest moves from the live data, then the news that lines up with what is moving, newest first among equals.', 'td-q-n'));
    const ul = el('ul', null, 'td-q-l');
    const flags = G.rows('today_flags').slice().sort((a, b) => b.score - a.score).slice(0, 2);
    for (const f of flags) { const li = G.li('**' + f.text.replace(/^([^,;:]+)/, '$1**')); li.classList.add('td-q-data'); ul.append(li); }
    const now = Date.now(), moverNames = big.filter((x) => Math.abs(x.q.changePercentage) >= 3).map((x) => { const w0 = String(x.c.name || '').split(/[ ,.]/)[0].replace(/[^\w&]/g, ''); const alts = [x.q.symbol.length >= 3 ? '\\$?' + x.q.symbol : null, w0.length >= 4 && /^[A-Z]/.test(w0) ? w0 : null].filter(Boolean); return alts.length ? { re: new RegExp('\\b(' + alts.join('|') + ')\\b'), sym: x.q.symbol, w: Math.abs(x.q.changePercentage) / 2, txt: x.q.symbol + ' ' + pc(x.q.changePercentage / 100) } : null; }).filter(Boolean);
    const news = G.rows('today_news').map((r) => {
      const t = String(r.title || ''), age = (now - new Date(String(r.published).replace(' ', 'T') + '-04:00')) / 36e5;
      let best = null;
      for (const [re, syms] of KEYS) if (re.test(t)) for (const s of syms) { const rr = by.get(s); if (rr && isNum(rr.z_d1) && (!best || Math.abs(rr.z_d1) > best.w)) best = { w: Math.abs(rr.z_d1), txt: rr.asset + ' ' + mv(rr) }; }
      for (const m of moverNames) if (m.re.test(t) && (!best || m.w > best.w)) best = { w: m.w, txt: m.txt };
      const score = (best ? best.w : 0) + (age < 6 ? 0.6 : age < 24 ? 0.3 : 0) - (age > 48 ? 1 : 0);
      return { r, best, score, age };
    }).filter((x) => x.age < 72).sort((a, b) => b.score - a.score || a.age - b.age);
    const seen = new Set();
    for (const x of news) {
      if (ul.childElementCount >= 7) break;
      const k = x.r.title.slice(0, 40).toLowerCase(); if (seen.has(k)) continue; seen.add(k);
      const li = el('li');
      const a = el('a', x.r.title); a.href = x.r.url; a.target = '_blank'; a.rel = 'noopener';
      li.append(a, el('span', ' ' + String(x.r.site || '').replace(/^www\./, '').replace(/\.com$/, '') + (x.age < 24 ? ` · ${Math.max(1, Math.round(x.age))}h ago` : ''), 'td-q-src'));
      if (x.best) li.append(' ', el('span', x.best.txt, 'td-q-tag'));
      ul.append(li);
    }
    if (!ul.childElementCount) ul.append(el('li', 'No headlines yet.'));
    b3.append(ul);

    // 4. the day in a nutshell
    const b4 = el('div', null, 'td-q td-q-nut');
    b4.append(el('h3', 'The day in a nutshell', 'td-q-h'));
    const tenY = d('UST10Y'), spy = d('SPY'), tlt = d('TLT');
    const zs = ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM', 'UST10Y', 'HYG', 'DXUSD', 'CLUSD', 'GCUSD', '^VIX'].map(z).filter(isNum);
    const heat = zs.length ? zs.reduce((a, x) => a + Math.abs(x), 0) / zs.length : 0;
    const risk = (z('SPY') || 0) - 0.5 * (z('^VIX') || 0) + 0.5 * (z('HYG') || 0);
    const avg = (ss) => { const v = ss.map(d).filter(isNum); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const def = avg(['XLP', 'XLU', 'XLV']), cyc = avg(['XLK', 'SMH', 'XLF', 'XLE', 'XLI']);
    const gv = (d('IWF') ?? 0) - (d('IWD') ?? 0), ew = (d('RSP') ?? 0) - (d('SPY') ?? 0), sz = (d('IWM') ?? 0) - (d('SPY') ?? 0);
    const breadth = big.length ? big.filter((x) => x.q.changePercentage > 0).length / big.length : null;
    let label = Math.abs(risk) < 0.8 ? (heat < 0.6 ? 'Quiet and range-bound' : 'Mixed signals') : risk > 0 ? 'Risk-on' : 'Risk-off';
    const sub = [];
    if (isNum(def) && isNum(cyc) && Math.abs(def - cyc) > 0.006) sub.push(def > cyc ? 'defensive rotation' : 'cyclicals in charge');
    if (Math.abs(ew) > 0.005) sub.push((spy ?? 0) < 0 ? (ew > 0 ? 'losses concentrated in the giants' : 'broad selling') : (ew > 0 ? 'a broad rally' : 'narrow, led by the giants'));
    if (isNum(tenY) && Math.abs(tenY) >= 7 && Math.abs(z('UST10Y') || 0) > 1.2) sub.push('rates in the driving seat');
    if (sub.length) label += ', ' + sub.slice(0, 2).join(', ');
    const s = [];
    if (isNum(spy)) s.push(`The S&P 500 ${spy >= 0 ? 'rose' : 'fell'} ${pc(Math.abs(spy)).replace('+', '')} and the Nasdaq-100 ${pc(d('QQQ'))}${isNum(d('IWM')) ? `, small caps ${pc(d('IWM'))}` : ''}; ${heat < 0.6 ? 'a quieter day than usual across markets' : heat > 1.3 ? '**a bigger day than usual across markets**' : 'about a normal-sized day across markets'}.`);
    if (isNum(def) && isNum(cyc)) s.push(def > cyc ? `Defensives led: staples ${pc(d('XLP'))}, utilities ${pc(d('XLU'))}, against technology ${pc(d('XLK'))}.` : `Cyclicals led: technology ${pc(d('XLK'))}, financials ${pc(d('XLF'))}, energy ${pc(d('XLE'))}, against staples ${pc(d('XLP'))}.`);
    if (Math.abs(ew) > 0.003 || isNum(breadth)) s.push(`${ew > 0.003 ? 'The equal-weight index beat the cap-weighted one by ' + pc(ew).replace('+', '') + ', so the typical stock did better than the index' : ew < -0.003 ? 'The equal-weight index trailed by ' + pc(-ew).replace('+', '') + ': the giants carried the index' : 'Equal-weight and cap-weight moved together'}${isNum(breadth) ? `; ${Math.round(breadth * 100)}% of large US companies rose` : ''}.`);
    if (Math.abs(gv) > 0.004) s.push(gv > 0 ? `Growth beat value by ${pc(gv).replace('+', '')}.` : `Value beat growth by ${pc(-gv).replace('+', '')}.`);
    if (isNum(tenY)) s.push(`The 10-year yield ${tenY > 0 ? 'rose' : tenY < 0 ? 'fell' : 'was unchanged'}${tenY ? ' ' + Math.abs(tenY).toFixed(0) + 'bp' : ''}${isNum(spy) && isNum(tlt) && Math.abs(spy) > 0.005 ? (Math.sign(spy) !== Math.sign(tlt) ? ', so **bonds hedged** the equity move' : ', so **bonds did not hedge**') : ''}; high yield ${pc(d('HYG'))}.`);
    const oth = [['^VIX', 'the VIX'], ['DXUSD', 'the dollar'], ['CLUSD', 'WTI'], ['GCUSD', 'gold'], ['BTCUSD', 'bitcoin']].filter(([k]) => isNum(d(k))).map(([k, l]) => `${l} ${pc(d(k))}`);
    if (oth.length) s.push('Elsewhere: ' + oth.join(', ') + '.');
    b4.append(el('div', label, 'td-q-label'), el('p', `${STATUS[st]}${when ? ' · ' + (st === 'open' ? 'live' : 'session of ' + when) : ''}`, 'td-q-n'), B(s.join(' ')));
    b4.append(el('p', 'Rule-based from the live moves: risk tone from equities, the VIX and high yield; the label adds leadership, breadth and rates when they stand out.', 'td-q-n td-q-foot'));

    box.replaceChildren(b1, b2, b3, b4);
  };
  G.page('today', draw);
})();
