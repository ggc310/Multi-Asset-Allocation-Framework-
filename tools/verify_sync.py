"""Checks the repo against a dump of the dashboard store (ArtifactData lists of files and datasets): every page file must match src/
exactly, every file dataset must exist in data/files with the same asset id in data/manifest.json. Usage: verify_sync.py STORE_DIR SITE_DIR"""
import json,glob,os,sys
store, site = sys.argv[1], sys.argv[2]
bad=[]; n=0
for f in glob.glob(store+'/files/*.json'):
    d=json.load(open(f)); d=d.get('data',d); i=os.path.basename(f)[:-5]; n+=1
    p=os.path.join(site,'src',i)
    if not os.path.exists(p): bad.append(i+' missing'); continue
    if open(p).read()!=d['text']: bad.append(i+' differs')
for f in glob.glob(store+'/datasets/*.json'):
    d=json.load(open(f)); d=d.get('data',d); i=os.path.basename(f)[:-5]
    if d['source']['kind']!='file': continue
    n+=1
    if not os.path.exists(os.path.join(site,'data','files',i+'.json')): bad.append(i+' data missing')
man=json.load(open(os.path.join(site,'data','manifest.json')))['datasets']
for f in glob.glob(store+'/datasets/*.json'):
    d=json.load(open(f)); d=d.get('data',d); i=os.path.basename(f)[:-5]
    if d['source']['kind']=='file' and man.get(i,{}).get('blob')!=d['source']['url'].rsplit('/',1)[-1]: bad.append(i+' manifest blob differs')
print(json.dumps({'checked':n,'mismatches':bad}))
