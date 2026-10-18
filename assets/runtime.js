// Standalone stand-in for the Claude dashboard runtime (`window.dash`).
// Data comes from static JSON snapshots listed in data/manifest.json,
// refreshed by the scheduled jobs described in README.md.
(function () {
  'use strict';
  // The page empties tables while their data loads (table.replaceChildren()).
  // Inside Claude the data is ready first, so that never happens; here data
  // arrives lazily, so keep each table's <thead>/<tbody> and empty them instead.
  const tableReplace = HTMLTableElement.prototype.replaceChildren;
  HTMLTableElement.prototype.replaceChildren = function (...nodes) {
    if (nodes.length) return tableReplace.apply(this, nodes);
    for (const s of [this.tHead, ...this.tBodies, this.tFoot]) if (s) s.replaceChildren();
    for (const c of [...this.children]) if (!/^(THEAD|TBODY|TFOOT|COLGROUP)$/.test(c.tagName)) c.remove();
  };
  const ROOT = document.currentScript ? new URL('..', document.currentScript.src).href : './';
  const state = {};          // id -> {status, data, message}
  const calcs = {};          // id -> {inputs, fn, title, description}
  const calcCache = {};      // id -> {key, result}
  const listeners = [];
  let manifest = null, version = 0, scheduled = false;

  const toRows = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') {
      for (const k of ['rows', 'data', 'results']) if (Array.isArray(v[k])) return v[k];
    }
    return v;
  };
  const columnsOf = (d) => (Array.isArray(d) && d.length && d[0] && typeof d[0] === 'object' ? Object.keys(d[0]) : []);
  const wrap = (s) => {
    const data = s.status === 'ok' ? s.data : [];
    return {
      status: s.status, data, message: s.message || '', refreshing: false, meta: [],
      columns: columnsOf(data), rows: Array.isArray(data) ? data : [],
      value: Array.isArray(data) ? undefined : data,
    };
  };

  const notify = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      version += 1;
      for (const fn of listeners) { try { fn(); } catch (e) { console.error(e); } }
    });
  };

  const load = (id) => {
    if (state[id]) return;
    if (!manifest) { state[id] = { status: 'loading' }; return; }
    const m = manifest.datasets[id];
    if (!m) { state[id] = { status: 'missing', message: 'No such dataset: ' + id }; return; }
    state[id] = { status: 'loading' };
    fetch(ROOT + m.path + '?v=' + encodeURIComponent((m.updated && m.updated.at) || ''))
      .then((r) => { if (!r.ok) throw new Error(r.status === 404 ? 'Not refreshed yet' : 'HTTP ' + r.status); return r.json(); })
      .then((j) => { state[id] = { status: 'ok', data: toRows(j) }; })
      .catch((e) => { state[id] = { status: 'error', message: String(e.message || e) }; })
      .finally(notify);
  };

  const runCalc = (id) => {
    const c = calcs[id];
    const ins = c.inputs.map((i) => dash.data(i));
    const bad = ins.find((x) => x.status !== 'ok');
    if (bad) return { status: bad.status === 'missing' ? 'error' : bad.status, message: bad.message };
    const key = ins.map((x) => x.data);
    const hit = calcCache[id];
    if (hit && hit.key.length === key.length && hit.key.every((k, n) => k === key[n])) return hit.result;
    let result;
    try { result = { status: 'ok', data: c.fn(...ins.map((x) => x.data)) }; }
    catch (e) { console.error('calc ' + id, e); result = { status: 'error', message: String(e.message || e) }; }
    calcCache[id] = { key, result };
    return result;
  };

  const params = () => {
    const out = {};
    new URLSearchParams(location.search).forEach((v, k) => { out[k] = v; });
    return out;
  };

  const dash = {
    data(id) {
      if (calcs[id]) return wrap(runCalc(id));
      load(id);
      return wrap(state[id]);
    },
    onData(fn) { listeners.push(fn); try { fn(); } catch (e) { console.error(e); } },
    calc(id, spec) { calcs[id] = spec; },
    loader() { /* loaders run in the refresh job; snapshots are already shaped */ },
    refresh() { /* snapshots refresh on a schedule */ },
    colors: ['var(--gm-blue)', 'var(--gm-blue2)', 'var(--gm-blue3)', 'var(--gm-blue4)', 'var(--gm-navy)', 'var(--color-ok)', 'var(--color-warn)', 'var(--color-bad)'],
    params,
    setParams(p) {
      const u = new URL(location.href);
      for (const [k, v] of Object.entries(p || {})) { if (v === null || v === undefined || v === '') u.searchParams.delete(k); else u.searchParams.set(k, v); }
      history.replaceState(null, '', u);
      notify();
    },
    resetParams() { const u = new URL(location.href); u.search = ''; history.replaceState(null, '', u); notify(); },
    setLink(name) { history.replaceState(null, '', '#' + name); },
    manifest: () => manifest,
  };
  window.dash = dash;

  fetch(ROOT + 'data/manifest.json?t=' + Date.now())
    .then((r) => r.json())
    .then((m) => {
      manifest = m;
      for (const id of Object.keys(state)) delete state[id];
      const el = document.getElementById('site-updated');
      if (el && m.builtAt) el.textContent = 'Data as of ' + new Date(m.builtAt).toLocaleString();
      notify();
    })
    .catch((e) => console.error('manifest', e));
})();
