import type { Cliente, LinhaCarrinho, Pagamento, PedidoCheckout, Produto, TipoPedido } from './types';

type Horario={dia:string;aberto:boolean;abertura:string;fechamento:string};
type Configuracao={
 whatsapp:string;taxaEntregaFixa:number|null;pedidoMinimoDelivery:number|null;
 pedidosOnlineAtivos:boolean;
 bairrosAtendidos?:string[];
 formasPagamento?:{pix:boolean;cartao:boolean;dinheiro:boolean};
};
const moeda=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
export const reais=(numero:number)=>moeda.format(numero);
export const dinheiro=(numero:number)=>Math.round((numero+Number.EPSILON)*100)/100;
export const somenteNumeros=(texto:string)=>texto.replace(/\D/g,'');
export function precoLinha(linha:LinhaCarrinho,produto:Produto){
 const variacao=produto.variacoes.find(x=>x.id===linha.variacaoId);
 const extra=produto.opcionais.filter(o=>linha.opcionaisIds.includes(o.id)).reduce((s,o)=>s+o.preco,0);
 return dinheiro(produto.preco+(variacao?.acrescimo||0)+extra);
}
export function totalCarrinho(linhas:LinhaCarrinho[],produtos:Produto[]){
 const mapa=new Map(produtos.map(p=>[p.id,p]));
 return dinheiro(linhas.reduce((total,linha)=>{const p=mapa.get(linha.produtoId);return p?total+precoLinha(linha,p)*linha.quantidade:total;},0));
}
export function totalComEntrega(subtotal:number,tipo:TipoPedido,taxa:number|null){
 return dinheiro(subtotal+(tipo==='entrega'?(taxa??0):0));
}
export function agoraSaoPaulo(data=new Date()){
 const partes=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(data);
 const pega=(tipo:string)=>partes.find(p=>p.type===tipo)?.value||'';
 const indice=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(pega('weekday'));
 return {dia:indice,horario:`${pega('hour')}:${pega('minute')}`};
}
export function situacaoLoja(horarios:readonly Horario[],data=new Date()){
 const atual=agoraSaoPaulo(data);
 const h=horarios[atual.dia];
 const aberto=!!h?.aberto&&atual.horario>=h.abertura&&atual.horario<h.fechamento;
 if(aberto)return {aberto:true,mensagem:`Aberto agora · até ${h.fechamento}`};
 for(let offset=0;offset<8;offset++){
  const idx=(atual.dia+offset)%7;
  const prox=horarios[idx];
  if(prox?.aberto&&(offset>0||atual.horario<prox.abertura)){
   const quando=offset===0?'hoje':offset===1?'amanhã':`na ${prox.dia.toLowerCase()}`;
   return {aberto:false,mensagem:`Estamos fechados, abrimos ${quando} às ${prox.abertura}`};
  }
 }
 return {aberto:false,mensagem:'Estamos fechados no momento'};
}
export type ErrosCampos=Partial<Record<keyof Cliente|'trocoPara',string>>;

/** Conversão de reais digitados: 100,50 ou 100.50. */
export function valorDigitado(texto:string):number|null{
 const limpo=texto.trim().replace(/^R\\$\\s*/i,'').replace(/\\s+/g,'');
 if(!limpo)return null;
 const decimal=limpo.includes(',')?limpo.replace(/\\./g,'').replace(',','.'):limpo;
 if(!/^\\d+(?:\\.\\d{1,2})?$/.test(decimal))return null;
 const numero=Number(decimal);
 return Number.isFinite(numero)&&numero>=0?dinheiro(numero):null;
}
export function errosCamposPedido(p:PedidoCheckout,config:Configuracao,subtotal:number):ErrosCampos{
 const c=p.cliente;
 const erros:ErrosCampos={};
 if(c.nome.trim().length<2)erros.nome='Informe seu nome (pelo menos 2 caracteres).';
 if(!/^\\d{10,11}$/.test(somenteNumeros(c.telefone)))erros.telefone='Informe um telefone válido com DDD (10 ou 11 números).';
 if(p.tipo==='entrega'){
  if(!/^\\d{8}$/.test(somenteNumeros(c.cep)))erros.cep='Informe um CEP válido com 8 números.';
  if(!c.bairro.trim())erros.bairro='Informe seu bairro.';
  if(!c.rua.trim())erros.rua='Informe a rua ou avenida da entrega.';
  if(!c.numero.trim())erros.numero='Informe o número do endereço (ou S/N).';
  if(!c.cidade.trim())erros.cidade='Informe a cidade.';
  if(!/^[A-Za-z]{2}$/.test(c.uf.trim()))erros.uf='Informe a UF com duas letras.';
  const {bairrosAtendidos=[]}=config;
  if(bairrosAtendidos.length&&c.bairro.trim()){
   const normal=(s:string)=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').trim().replace(/\\s+/g,' ').toLocaleLowerCase('pt-BR');
   if(!bairrosAtendidos.some(b=>normal(b)===normal(c.bairro)))
    erros.bairro='Esse bairro não está na área de entrega cadastrada. Escolha retirada ou consulte a equipe.';
  }
 }
 if(p.pagamento==='dinheiro'&&p.trocoPara.trim()){
  const troco=valorDigitado(p.trocoPara);
  if(troco===null||troco<totalComEntrega(subtotal,p.tipo,config.taxaEntregaFixa))
   erros.trocoPara='O valor para troco deve ser igual ou maior que o total do pedido.';
 }
 return erros;
}
export function validarPedido(p:PedidoCheckout,produtos:Produto[],config:Configuracao){
 const erros:string[]=[];
 if(!config.pedidosOnlineAtivos)erros.push('Os pedidos online estão pausados no momento.');
 if(!p.linhas.length)erros.push('Adicione pelo menos um prato ao pedido.');
 const mapa=new Map(produtos.map(item=>[item.id,item]));
 for(const linha of p.linhas){
  const item=mapa.get(linha.produtoId);
  if(!item||!item.disponivel)erros.push('Um dos pratos foi removido ou está indisponível.');
  if(!Number.isInteger(linha.quantidade)||linha.quantidade<1||linha.quantidade>99)
   erros.push('Confira as quantidades dos itens.');
 }
 const subtotal=totalCarrinho(p.linhas,produtos);
 const falhasCampos=errosCamposPedido(p,config,subtotal);
 erros.push(...Object.values(falhasCampos).filter((m):m is string=>!!m));
 if(config.formasPagamento?.[p.pagamento]===false)erros.push('Esta forma de pagamento está indisponível.');
 if(p.tipo==='entrega'){
  if(config.taxaEntregaFixa===null||config.taxaEntregaFixa<0)
   erros.push('Taxa de entrega indisponível no momento. Escolha retirada ou fale com a equipe.');
  if(config.pedidoMinimoDelivery===null||config.pedidoMinimoDelivery<0)
   erros.push('Pedido mínimo de entrega ainda não definido. Escolha retirada ou fale com a equipe.');
  if(!config.bairrosAtendidos?.length)
   erros.push('Bairros atendidos ainda não cadastrados. Escolha retirada ou fale com a equipe.');
  if(config.pedidoMinimoDelivery!==null&&subtotal<config.pedidoMinimoDelivery)
   erros.push(`Pedido mínimo para entrega: ${reais(config.pedidoMinimoDelivery)}.`);
 }
 return [...new Set(erros)];
}
const tipoLabel:Record<TipoPedido,string>={entrega:'🛵 Entrega (delivery)',retirada:'🏪 Retirada no balcão',local:'🍽️ Comer no local'};
const pagamentoLabel:Record<Pagamento,string>={pix:'Pix (dados a confirmar no WhatsApp)',cartao:'Cartão na entrega / retirada / local',dinheiro:'Dinheiro'};
export function montarMensagem(p:PedidoCheckout,produtos:Produto[],config:Configuracao){
 const mapa=new Map(produtos.map(produto=>[produto.id,produto]));
 const linhas=p.linhas.map(linha=>{
  const produto=mapa.get(linha.produtoId);
  if(!produto)return null;
  const variacao=produto.variacoes.find(v=>v.id===linha.variacaoId);
  const opcionais=produto.opcionais.filter(o=>linha.opcionaisIds.includes(o.id));
  const detalhes=[variacao?.nome,opcionais.map(o=>o.nome).join(', '),linha.observacao? `Obs.: ${linha.observacao}`:null].filter(Boolean).join(' | ');
  return `• ${linha.quantidade}x ${produto.nome}${detalhes?' — '+detalhes:''} — ${reais(dinheiro(precoLinha(linha,produto)*linha.quantidade))}`;
 }).filter((line):line is string=>!!line);
 const subtotal=totalCarrinho(p.linhas,produtos);
 const taxa=p.tipo==='entrega'?(config.taxaEntregaFixa??0):0;
 const endereco=p.tipo==='entrega'?`📍 Endereço: ${p.cliente.rua}, ${p.cliente.numero}${p.cliente.complemento?', '+p.cliente.complemento:''} · ${p.cliente.bairro} · ${p.cliente.cidade}/${p.cliente.uf} · CEP ${somenteNumeros(p.cliente.cep)}${p.cliente.referencia?' · Ref.: '+p.cliente.referencia:''}`:null;
 const demo=p.linhas.some(l=>mapa.get(l.produtoId)?.exemplo);
 return [
 '🍽️ *Novo pedido – Delícia do Nordeste*',
 `🧾 *Número:* ${p.numero}`,
 `👤 *Nome:* ${p.cliente.nome.trim()}`,
 `📞 *Telefone:* ${p.cliente.telefone.trim()}`,
 `🛵 *Tipo:* ${tipoLabel[p.tipo]}`,endereco,'',
 '*ITENS:*',...linhas,'',
 `Subtotal: ${reais(subtotal)}`,
 `Taxa de entrega: ${p.tipo==='entrega'?reais(taxa):'Não se aplica'}`,
 `*TOTAL: ${reais(totalComEntrega(subtotal,p.tipo,config.taxaEntregaFixa))}*`,
 `💳 *Pagamento:* ${pagamentoLabel[p.pagamento]}`,
 p.pagamento==='dinheiro'?`💵 *Troco para:* ${p.trocoPara.trim()?reais(valorDigitado(p.trocoPara)??0):'Não precisa'}`:null,
 p.observacoesGerais?`📝 *Observações gerais:* ${p.observacoesGerais.trim()}`:null,
 p.foraHorario?'🕗 *Fora do horário:* confirmar o pedido na próxima abertura.':null,
 demo?'⚠️ *PEDIDO DEMONSTRATIVO — ITENS E VALORES FICTÍCIOS. Confirmar preços, disponibilidade e total com a equipe.*':null,
 '',
 '⚠️ *Pedido sujeito à confirmação do restaurante pelo WhatsApp. Não é pagamento confirmado.*'
 ].filter((linha):linha is string=>linha!==null).join('\n');
}
export function urlWhatsApp(mensagem:string,telefone='5511960149521'){
 return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}
export function gerarNumeroPedido(data=new Date(),aleatorio=()=>Math.floor(Math.random()*65536)){
 const partes=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(data);
 const ler=(tipo:string)=>partes.find(p=>p.type===tipo)?.value||'';
 const dia=ler('year')+ler('month')+ler('day');
 return `SC-${dia}-${aleatorio().toString(36).toUpperCase().padStart(4,'0')}`;
}
const STORAGE_KEY='delicia_nordeste_carrinho_fase1_v1';
export function carregarCarrinho():LinhaCarrinho[]{
 try{
  const guardado=localStorage.getItem(STORAGE_KEY);
  const lista=guardado?JSON.parse(guardado):[];
  if(!Array.isArray(lista))return [];
  return lista.filter(x=>x&&typeof x.produtoId==='string'&&typeof x.chave==='string'&&Number.isInteger(x.quantidade)&&x.quantidade>0&&x.quantidade<=99)
   .map(x=>({chave:x.chave,produtoId:x.produtoId,quantidade:x.quantidade,variacaoId:String(x.variacaoId||''),opcionaisIds:Array.isArray(x.opcionaisIds)?x.opcionaisIds.filter((v:unknown)=>typeof v==='string'):[],observacao:String(x.observacao||'').slice(0,250)})).slice(0,75);
 }catch{return [];}
}
export function salvarCarrinho(linhas:LinhaCarrinho[]):boolean{
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(linhas));return true;}catch{return false;}
}
