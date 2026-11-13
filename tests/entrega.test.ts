import test from 'node:test';
import assert from 'node:assert/strict';
import {avaliarCobertura,entregaConfigurada,normalizarBairro,consultarCep} from '../src/loja/entrega';

const incompleta={pedidosOnlineAtivos:true,taxaEntregaFixa:null,pedidoMinimoDelivery:null,bairrosAtendidos:[]};
const completa={pedidosOnlineAtivos:true,taxaEntregaFixa:8,pedidoMinimoDelivery:30,bairrosAtendidos:['Parque Belém','Vila São João']};
test('a entrega não é declarada disponível com configuração incompleta',()=>{
 assert.equal(entregaConfigurada(incompleta),false);
 assert.equal(avaliarCobertura('Parque Belém',incompleta).estado,'indisponivel');
 assert.equal(entregaConfigurada({...completa,bairrosAtendidos:[]}),false);
 assert.equal(entregaConfigurada({...completa,pedidosOnlineAtivos:false}),false);
 assert.equal(entregaConfigurada(completa),true);
});
test('bairro aceita acentos e espaços sem ampliar a área atendida',()=>{
 assert.equal(normalizarBairro('  PARQUE   BELÉM '),'parque belem');
 assert.equal(avaliarCobertura('Parque Belem',completa).estado,'disponivel');
 assert.equal(avaliarCobertura('outro bairro',completa).estado,'nao-atendido');
 assert.equal(avaliarCobertura('',completa).estado,'verificar-bairro');
});
test('ViaCEP usa só CEP numérico e não confunde endereço com autorização de entrega',async()=>{
 let url='';
 const falso=async (endereco:RequestInfo|URL)=>{url=String(endereco);return {ok:true,json:async()=>({logradouro:'Rua A',bairro:'Parque Belém',localidade:'São Paulo',uf:'SP'})} as Response;};
 const dado=await consultarCep('02850-100',falso as typeof fetch);
 assert.equal(url,'https://viacep.com.br/ws/02850100/json/');
 assert.equal(dado.bairro,'Parque Belém');
 assert.equal(avaliarCobertura(dado.bairro,incompleta).estado,'indisponivel');
 await assert.rejects(()=>consultarCep('999',falso as typeof fetch),/CEP válido/);
});
test('ViaCEP reporta erros sem inventar endereço',async()=>{
 const inexistente=async()=>({ok:true,json:async()=>({erro:true})}) as Response;
 await assert.rejects(()=>consultarCep('02850-100',inexistente as typeof fetch),/não encontrado/);
});

test('não promete delivery para CEP de outra cidade com bairro homônimo',()=>{
 const cfg={...completa,cidadeAtendimento:'São Paulo',ufAtendimento:'SP'};
 assert.equal(avaliarCobertura('Parque Belém',cfg,{cidade:'São Paulo',uf:'SP'}).estado,'disponivel');
 assert.equal(avaliarCobertura('Parque Belém',cfg,{cidade:'Rio de Janeiro',uf:'RJ'}).estado,'nao-atendido');
});
