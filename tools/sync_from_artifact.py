"""Bring the repo up to date with the Claude artifact's store.

Step 1:  python3 tools/sync_from_artifact.py plan  STORE_DIR
         STORE_DIR holds ArtifactData dumps of the `datasets` and `files`
         collections (STORE_DIR/datasets/*.json, STORE_DIR/files/*.json).
         Prints the asset ids whose files must be downloaded (one per line).
Step 2:  download each listed asset to BLOB_DIR/<asset id>.json
Step 3:  python3 tools/sync_from_artifact.py apply STORE_DIR BLOB_DIR
         Copies page files into src/, saved datasets into data/files/,
         and rewrites data/manifest.json. Live (FMP query) datasets keep
         being refreshed by GitHub Actions.
"""
import json, os, shutil, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'data', 'manifest.json')


def clean(v):
    # browsers' JSON.parse rejects NaN/Infinity, which Python and Claude accept
    if isinstance(v, float) and (v != v or v in (float('inf'), float('-inf'))):
        return None
    if isinstance(v, list):
        return [clean(x) for x in v]
    if isinstance(v, dict):
        return {k: clean(x) for k, x in v.items()}
    return v


def copy_json(src, dst):
    with open(dst, 'w') as f:
        json.dump(clean(json.load(open(src))), f, separators=(',', ':'), allow_nan=False)


def doc(path):
    d = json.load(open(path))
    return d.get('data', d)


def store_datasets(store):
    out = {}
    for f in sorted(glob.glob(os.path.join(store, 'datasets', '*.json'))):
        out[os.path.basename(f)[:-5]] = doc(f)
    return out


def plan(store):
    old = json.load(open(MANIFEST))['datasets']
    for i, d in store_datasets(store).items():
        s = d['source']
        if s['kind'] != 'file':
            continue
        blob = s['url'].rsplit('/', 1)[-1]
        if old.get(i, {}).get('blob') != blob or not os.path.exists(os.path.join(ROOT, 'data', 'files', i + '.json')):
            print(blob)


def apply(store, blobs):
    old = json.load(open(MANIFEST))
    datasets, sources = {}, {}
    for i, d in store_datasets(store).items():
        s = d['source']
        meta = {k: d[k] for k in ('title', 'description', 'updated', 'schedule', 'staleAfterHours') if d.get(k) is not None}
        if s['kind'] == 'file':
            blob = s['url'].rsplit('/', 1)[-1]
            src = os.path.join(blobs, blob + '.json')
            if os.path.exists(src):
                copy_json(src, os.path.join(ROOT, 'data', 'files', i + '.json'))
            elif old['datasets'].get(i, {}).get('blob') != blob:
                print('missing download for', i, blob, '- keeping previous file')
                blob = old['datasets'].get(i, {}).get('blob')
            meta.update(kind='file', path='data/files/' + i + '.json', blob=blob)
        else:
            meta.update(kind='live', path='data/live/' + i + '.json')
            if old['datasets'].get(i, {}).get('updated'):
                meta['updated'] = old['datasets'][i]['updated']
            sources[i] = {'tool': s['tool'], 'args': s['args']}
        datasets[i] = meta
    for f in glob.glob(os.path.join(store, 'files', '*.json')):
        name = os.path.basename(f)[:-5]
        if '/' in name or name.startswith('.'):
            continue
        open(os.path.join(ROOT, 'src', name), 'w').write(doc(f)['text'])
    for i in set(old['datasets']) - set(datasets):
        p = os.path.join(ROOT, 'data', 'files', i + '.json')
        if os.path.exists(p):
            os.remove(p)
    old['datasets'] = datasets
    json.dump(old, open(MANIFEST, 'w'), indent=1)
    json.dump(sources, open(os.path.join(ROOT, 'refresh', 'sources.json'), 'w'), indent=1)
    print(len(datasets), 'datasets,', len(sources), 'live')


if __name__ == '__main__':
    if sys.argv[1] == 'clean':
        for f in glob.glob(os.path.join(ROOT, 'data', 'files', '*.json')):
            copy_json(f, f + '.tmp'); os.replace(f + '.tmp', f)
    elif sys.argv[1] == 'plan':
        plan(sys.argv[2])
    else:
        apply(sys.argv[2], sys.argv[3])
