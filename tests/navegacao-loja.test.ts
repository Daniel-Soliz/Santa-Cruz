import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { lerNavegacao, paginasLoja, passosParaVoltar } from '../src/loja/navegacao';

test('a raiz abre o início e cada aba possui um endereço próprio', () => {
 assert.deepEqual(lerNavegacao(''), { pagina: 'inicio' });
 for (const pagina of Object.keys(paginasLoja)) {
  assert.deepEqual(lerNavegacao(`#${pagina}`), { pagina });
 }
 assert.deepEqual(lerNavegacao('#constructor'), { pagina: 'inicio' });
});

test('links da vitrine antiga continuam abrindo o conteúdo correspondente', () => {
 assert.deepEqual(lerNavegacao('#localizacao'), { pagina: 'contato' });
 assert.deepEqual(lerNavegacao('#como-funciona'), { pagina: 'entrega', ancora: 'como-funciona' });
 assert.deepEqual(lerNavegacao('#consultar-entrega'), { pagina: 'entrega', ancora: 'consultar-entrega' });
 assert.deepEqual(lerNavegacao('#categoria-bebidas'), { pagina: 'cardapio', ancora: 'categoria-bebidas' });
 assert.deepEqual(lerNavegacao('#avaliacoes'), { pagina: 'sobre', ancora: 'avaliacoes' });
 assert.deepEqual(lerNavegacao('#espaco'), { pagina: 'sobre', ancora: 'espaco' });
});

test('voltar ignora âncoras da aba atual e nunca sai do site por um link direto', () => {
 assert.equal(passosParaVoltar('', '#cardapio', 0), 1);
 assert.equal(passosParaVoltar('#cardapio', '#categoria-pratos', 1), 2);
 assert.equal(passosParaVoltar('#categoria-pratos', '#contato', 2), 1);
 assert.equal(passosParaVoltar('#cardapio', '#catalogo', 0), 0);
});
