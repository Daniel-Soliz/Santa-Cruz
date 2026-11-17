import assert from 'node:assert/strict';
import {test} from 'node:test';
import {aplicarConteudo,conteudoPadrao,validarConteudo} from '../src/config/conteudoLoja';
import {loja} from '../src/config/loja';

test('campos omitidos usam o conteúdo original e vazios intencionais removem fotos e textos',()=>{
 const config=aplicarConteudo(loja,{tituloHero:'Nova abertura',heroFoto:'',sobre:''});
 assert.equal(config.conteudo.tituloHero,'Nova abertura');
 assert.equal(config.heroFoto,'');
 assert.equal(config.sobre,'');
 assert.equal(config.endereco,loja.endereco);
});
test('a localização atualiza o mapa e o link de contato usa apenas dígitos válidos',()=>{
 const config=aplicarConteudo(loja,{endereco:'Rua Nova, 123',whatsapp:'55 11 99999-9999'});
 assert.match(config.mapsUrl,/Rua\+Nova/);
 assert.equal(config.telefoneLink,'tel:+5511999999999');
});
test('recusa URLs perigosas e contatos inválidos',()=>{
 assert.ok(validarConteudo({...conteudoPadrao,heroFoto:'javascript:alert(1)'}));
 assert.ok(validarConteudo({...conteudoPadrao,whatsapp:'11'}));
});
