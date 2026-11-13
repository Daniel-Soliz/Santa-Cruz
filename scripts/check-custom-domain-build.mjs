import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const html=fs.readFileSync(path.resolve('dist/index.html'),'utf8');
assert.match(html,/src="\/assets\/index-[^"]+\.js"/);
assert.match(html,/href="\/assets\/index-[^"]+\.css"/);
assert.doesNotMatch(html,/src="\/Santa-Cruz\/assets\/index-/);
console.log('Base raiz válida para domínio próprio com PAGES_CUSTOM_DOMAIN=true');
