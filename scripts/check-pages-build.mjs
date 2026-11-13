import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve('dist');
const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
assert.match(index,/\/Santa-Cruz\/assets\/index-[^"']+\.js/,'Script sem base /Santa-Cruz/');
assert.match(index,/\/Santa-Cruz\/assets\/index-[^"']+\.css/,'CSS sem base /Santa-Cruz/');
assert.doesNotMatch(index,/src="\/src\/main\.tsx"/,'TypeScript não compilado');
assert.doesNotMatch(index,/cardápio digital está sendo preparado|o site ainda não confirma compras automaticamente/i,'Texto antigo da vitrine');
assert.ok(fs.existsSync(path.join(dist,'assets','aistudio','logo_casa_do_norte_108ee79c.jpg')),'Logo ausente');
for(const file of ['manifest.json','.nojekyll','sitemap.xml','robots.txt']){
 assert.ok(fs.existsSync(path.join(dist,file)),file+' não copiado');
}
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'manifest.json'),'utf8'));
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
console.log('Build válido para GitHub Pages: base, scripts, CSS, logo, manifest, SEO e .nojekyll.');
