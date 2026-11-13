import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { montarMensagem, urlWhatsApp, validarPedido, situacaoLoja, totalCarrinho, precoLinha, gerarNumeroPedido, carregarCarrinho, salvarCarrinho } from '../src/loja/pedido';
import type { LinhaCarrinho, PedidoCheckout, Produto } from '../src/loja/types';

const catalog=JSON.parse(readFileSync(new URL('../src/data/cardapio.json',import.meta.url),'utf8')) as {categorias:Array<{id:string}>;itens:Produto[]};
const hours=[
 {dia:'Domingo',aberto:true,abertura:'08:00',fechamento:'22:00'},
 {dia:'Segunda',aberto:false,abertura:'08:00',fechamento:'22:00'},
 ...['Terça','Quarta','Quinta','Sexta','Sábado'].map(dia=>({dia,aberto:true,abertura:'08:00',fechamento:'22:00'}))
];
const linha:LinhaCarrinho={chave:'k1',produtoId:'ex-01',quantidade:2,variacaoId:'individual',opcionaisIds:['ovo','sem-pimenta'],observacao:'Sem cebola e com limão 🍋'};
const cliente={nome:'João da Conceição',telefone:'(11) 96014-9521',cep:'02850-100',rua:'Rua Santa Cruz da Conceição',numero:'S/N',complemento:'',bairro:'Parque Belém',cidade:'São Paulo',uf:'SP',referencia:''};
const base:PedidoCheckout={numero:'SC-20261113-AB12',cliente,tipo:'retirada',pagamento:'pix',trocoPara:'',observacoesGerais:'Por favor, caprichar 🙏',linhas:[linha],foraHorario:false};
const config={whatsapp:'5511960149521',taxaEntregaFixa:null,pedidoMinimoDelivery:null,pedidosOnlineAtivos:true};

test('16 produtos de exemplo em 8 categorias configuráveis',()=>{
 assert.equal(catalog.categorias.length,8);
 for(const c of catalog.categorias){
  const itens=catalog.itens.filter(p=>p.categoriaId===c.id);
  assert.ok(itens.length>=2&&itens.length<=3,c.id);
 }
 assert.equal(catalog.itens.length,16);
 for(const p of catalog.itens){
  assert.ok(p.exemplo);
  assert.equal(typeof p.disponivel,'boolean');
  assert.ok(Number.isFinite(p.preco)&&p.preco>=0);
  assert.ok(Array.isArray(p.variacoes)&&Array.isArray(p.opcionais));
 }
});
test('calcula variação, opcionais e quantidade com centavos',()=>{
 const produto=catalog.itens[0];
 const unit=precoLinha(linha,produto);
 assert.equal(unit,36.9);
 assert.equal(totalCarrinho([linha],catalog.itens),73.8);
 assert.equal(totalCarrinho([{...linha,variacaoId:'duas-pessoas'}],catalog.itens),113.8);
});
test('abre terça a domingo, fecha na segunda e após as 22h em São Paulo',()=>{
 assert.equal(situacaoLoja(hours,new Date('2026-11-13T14:00:00Z')).aberto,true);
 assert.equal(situacaoLoja(hours,new Date('2026-11-09T14:00:00Z')).aberto,false);
 const noite=situacaoLoja(hours,new Date('2026-11-13T01:30:00Z'));
 assert.equal(noite.aberto,false);
 assert.match(noite.mensagem,/abrimos/);
});
test('checkout exige nome e telefone, bloqueia entrega sem taxa e pedido mínimo',()=>{
 assert.deepEqual(validarPedido(base,catalog.itens,config),[]);
 const faltando=validarPedido({...base,cliente:{...cliente,nome:'A',telefone:'123'}},catalog.itens,config);
 assert.ok(faltando.length>=2);
 const delivery={...base,tipo:'entrega' as const};
 const faltaTaxa=validarPedido(delivery,catalog.itens,config);
 assert.ok(faltaTaxa.some(s=>s.includes('Taxa de entrega')));
 assert.ok(faltaTaxa.some(s=>s.includes('mínimo')));
 assert.deepEqual(validarPedido(delivery,catalog.itens,{...config,taxaEntregaFixa:8,pedidoMinimoDelivery:30}),[]);
 assert.ok(validarPedido({...base,pagamento:'dinheiro',trocoPara:'30'},catalog.itens,config).some(s=>s.includes('troco')));
});
test('nunca adiciona item esgotado e respeita o interruptor geral',()=>{
 assert.ok(validarPedido({...base,linhas:[{...linha,produtoId:'ex-06'}]},catalog.itens,config).some(e=>e.includes('indisponível')));
 assert.ok(validarPedido(base,catalog.itens,{...config,pedidosOnlineAtivos:false}).some(e=>e.includes('pausados')));
});
test('mensagem de WhatsApp inclui emojis, acentos, subtotais, pagamento e aviso de exemplo',()=>{
 const text=montarMensagem(base,catalog.itens,config);
 const link=urlWhatsApp(text);
 assert.match(text,/🍽️ \*Novo pedido – Delícia do Nordeste\*/);
 assert.match(text,/João da Conceição/);
 assert.match(text,/Sem cebola e com limão 🍋/);
 assert.match(text,/R\$ 73,80/);
 assert.match(text,/Por favor, caprichar 🙏/);
 assert.match(text,/FICTÍCIOS/);
 assert.equal(decodeURIComponent(link.split('?text=')[1]),text);
 assert.ok(link.startsWith('https://wa.me/5511960149521?text='));
 assert.match(montarMensagem({...base,foraHorario:true},catalog.itens,config),/próxima abertura/);
});
test('número do pedido tem data e sufixo',()=>{
 const no=gerarNumeroPedido(new Date('2026-11-13T14:00:00Z'),()=>1234);
 assert.match(no,/^SC-\d{8}-[A-Z0-9]{4}$/);
 assert.ok(no.endsWith('00YA'));
});
test('armazenamento bloqueado não causa tela branca nem exceção',()=>{
 assert.deepEqual(carregarCarrinho(),[]);
 assert.equal(salvarCarrinho([linha]),false);
});
