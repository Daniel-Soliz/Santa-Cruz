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

const schema=index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(schema,'Dados estruturados Restaurant não gerados');
const restaurante=JSON.parse(schema[1]);
assert.equal(restaurante['@type'],'Restaurant');
assert.equal(restaurante.name,'Delícia do Nordeste · Casa do Norte · Santa Cruz');
assert.equal(restaurante.address.postalCode,'02850-100');
assert.ok(!('priceRange' in restaurante),'Faixa de preço não confirmada deve ser omitida');
assert.match(fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8'),/daniel-soliz\.github\.io\/Santa-Cruz/);
assert.match(fs.readFileSync(path.join(dist,'robots.txt'),'utf8'),/sitemap\.xml/);
console.log('SEO vindo do config.json: Restaurant, menu, sitemap e robots sem dados fictícios.');

const fundo=fs.readdirSync(path.join(dist,'assets')).find(name=>/^moldura-xilogravura-renda-[\w-]+\.webp$/.test(name));
assert.ok(fundo,'Textura da xilogravura e renda não emitida pelo Vite');
const cssName=fs.readdirSync(path.join(dist,'assets')).find(name=>/^index-[\w-]+\.css$/.test(name));
assert.ok(cssName,'CSS compilado não encontrado');
const cssBuild=fs.readFileSync(path.join(dist,'assets',cssName),'utf8');
assert.match(cssBuild,/moldura-xilogravura-renda-[\w-]+\.webp/,'Imagem não referenciada no CSS');
assert.ok(fs.statSync(path.join(dist,'assets',fundo)).size<150000,'Textura não otimizada');
console.log('Fundo xilogravura/renda incorporado e otimizado no build.');
