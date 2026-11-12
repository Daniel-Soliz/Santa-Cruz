import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
assert.match(index, /\/Santa-Cruz\/assets\/index-[^"']+\.js/, 'Script principal não aponta para /Santa-Cruz/');
assert.match(index, /\/Santa-Cruz\/assets\/index-[^"']+\.css/, 'CSS principal não aponta para /Santa-Cruz/');
assert.doesNotMatch(index, /src="\/src\/main\.tsx"/, 'Página contém TSX não compilado');
assert.ok(fs.existsSync(path.join(dist, 'manifest.json')), 'Manifesto não foi copiado');
assert.ok(fs.existsSync(path.join(dist, 'assets', 'aistudio', 'logo_casa_do_norte_108ee79c.jpg')), 'Logo não foi copiada');
assert.ok(fs.existsSync(path.join(dist, '.nojekyll')), 'Arquivo .nojekyll ausente');
console.log('Publicação GitHub Pages válida: JavaScript, CSS, imagens, manifesto e caminho /Santa-Cruz/.');
