// Commentary: The Day Ahead (trading days, about 5:30am PT), Day in Review (about 3pm PT), Week in Review (Fridays after the close), The Week Ahead (Sunday afternoons), Month in
// Review and Quarter in Review (after the last close of each), and earnings-call takeaways. Each piece is
// written by a Claude scheduled task and appended to the commentary dataset, newest first here.
(() => {
  const G = window.GMX, { el, $ } = G;
  const KIND = { day_ahead: 'The Day Ahead', day_review: 'Day in Review', week_review: 'Week in Review', week_ahead: 'The Week Ahead', month_review: 'Month in Review', quarter_review: 'Quarter in Review', calls: 'Earnings calls' };
  const S = { kind: 'all', id: null };
  G.page('commentary', (sec) => {
    const list = $('#cm-list', sec), read = $('#cm-read', sec);
    if (G.bad('commentary')) { G.failed(read, 'Commentary'); return; }
    if (!G.ok('commentary')) { G.placeholder(read); return; }
    const all = [...G.rows('commentary')].filter((r) => r && r.body).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const kinds = Object.keys(KIND).filter((k) => all.some((r) => r.kind === k));
    G.seg($('#cm-kind', sec), [['all', 'All'], ...kinds.map((k) => [k, KIND[k]])], S.kind, (v) => { S.kind = v; S.id = null; G.redraw(); });
    const shown = all.filter((r) => S.kind === 'all' || r.kind === S.kind);
    if (!shown.length) { list.replaceChildren(); read.replaceChildren(el('p', 'Nothing of this kind yet. The Day Ahead runs on trading days at about 5:30am Pacific and Day in Review at about 3pm; Week in Review on Fridays after the close; The Week Ahead on Sunday afternoons.', 'gm-note')); return; }
    const cur = shown.find((r) => r.id === S.id) || shown[0];
    list.replaceChildren(...shown.map((r) => {
      const b = el('button', null, 'x-cm-item' + (r === cur ? ' x-cm-on' : '')); b.type = 'button';
      b.append(el('span', KIND[r.kind] || r.kind, 'x-cm-kind'), el('span', r.title || r.period || '', 'x-cm-title'), el('span', G.mon(r.date) + (r.period ? ' · ' + r.period : ''), 'x-cm-date'));
      b.addEventListener('click', () => { S.id = r.id; G.redraw(); read.scrollIntoView({ block: 'nearest' }); });
      return b;
    }));
    const head = el('header', null, 'x-cm-head');
    head.append(el('div', (KIND[cur.kind] || cur.kind) + (cur.period ? ' · ' + cur.period : ''), 'x-cm-kind'), el('h2', cur.title || KIND[cur.kind], 'gm-h2 x-cm-h'));
    if (cur.headline) head.append(el('p', cur.headline, 'gm-takeaway'));
    head.append(el('p', 'Published ' + G.mon(cur.date) + (cur.asOf ? ' · data to ' + G.mon(cur.asOf) : '') + ' · written by Claude from FMP and FRED data', 'gm-note'));
    read.replaceChildren(head, G.md(cur.body));
  });
})();
