// Builds the static site from the dashboard's own page files in src/.
//   node tools/build.mjs
// src/index.html is the page body (styles + markup + <script src> tags);
// each src/*.js runs in its own scope, as it does inside Claude.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const body = readFileSync(join(root, 'src/index.html'), 'utf8');
const scripts = [...body.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map((m) => m[1]);
const markup = body.replace(/<script\s+src="[^"]+"\s*><\/script>\s*/g, '');

mkdirSync(join(root, 'page'), { recursive: true });
for (const f of readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js'))) {
  const code = readFileSync(join(root, 'src', f), 'utf8');
  writeFileSync(join(root, 'page', f), `(function () {\n${code}\n})();\n`);
}
const stamp = Date.now().toString(36);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Global Equity Opportunity Monitor</title>
<link rel="stylesheet" href="assets/tokens.css?v=${stamp}">
<script src="assets/d3.min.js"></script>
<script src="assets/runtime.js?v=${stamp}"></script>
</head>
<body>
<div id="dash-root">
${markup}
<p class="site-foot" id="site-updated"></p>
</div>
${scripts.map((s) => `<script src="page/${s}?v=${stamp}"></script>`).join('\n')}
</body>
</html>
`;
writeFileSync(join(root, 'index.html'), html);
console.log('built index.html with', scripts.length, 'scripts');
