import { useState } from 'react';
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, Clock3, CreditCard, MapPin, Search, ShieldCheck, ShoppingBag, Store, Truck, UtensilsCrossed, Wallet } from 'lucide-react';
import { loja } from '../../config/loja';
import type { Cliente, LinhaCarrinho, Pagamento, PedidoCheckout, Produto, TipoPedido } from '../types';
import { gerarNumeroPedido, montarMensagem, reais, situacaoLoja, totalCarrinho, totalComEntrega, urlWhatsApp, validarPedido, errosCamposPedido, valorDigitado, type ErrosCampos } from '../pedido';
import { consultarCep, avaliarCobertura, entregaConfigurada } from '../entrega';

const clienteVazio:Cliente={nome:'',telefone:'',cep:'',rua:'',numero:'',complemento:'',bairro:'',cidade:'',uf:'',referencia:''};
export type Preparado = {pedido:PedidoCheckout; url:string; mensagem:string};

export function Checkout({linhas,produtos,onVoltar,onPreparar}:{linhas:LinhaCarrinho[];produtos:Produto[];onVoltar:()=>void;onPreparar:(preparado:Preparado)=>void}){
 const [cliente,setCliente]=useState<Cliente>(clienteVazio);
 const [tipo,setTipo]=useState<TipoPedido>('retirada');
 const primeiraForma:Pagamento=loja.formasPagamento.pix?'pix':loja.formasPagamento.cartao?'cartao':'dinheiro';
 const [pagamento,setPagamento]=useState<Pagamento>(primeiraForma);
 const [trocoPara,setTrocoPara]=useState('');
 const [observacoesGerais,setObservacoesGerais]=useState('');
 const [buscandoCep,setBuscandoCep]=useState(false);
 const [cepStatus,setCepStatus]=useState('');
 const [erros,setErros]=useState<string[]>([]);
 const [camposInvalidos,setCamposInvalidos]=useState<ErrosCampos>({});
 const entregaAtiva=entregaConfigurada(loja);
 const subtotal=totalCarrinho(linhas,produtos);
 const total=totalComEntrega(subtotal,tipo,loja.taxaEntregaFixa);
 const trocoInformado=valorDigitado(trocoPara);
 const trocoEstimado=pagamento==='dinheiro'&&trocoInformado!==null&&trocoInformado>=total?trocoInformado-total:null;
 const status=situacaoLoja(loja.horarios);
 const atualizar=(campo:keyof Cliente,valor:string)=>{
  setCliente(c=>({...c,[campo]:valor}));
  setErros([]);
  setCamposInvalidos(c=>({...c,[campo]:undefined}));
 };
 const propsErro=(campo:keyof ErrosCampos)=>({
  'aria-invalid':!!camposInvalidos[campo],
  'aria-describedby':camposInvalidos[campo]?`erro-${campo}`:undefined
 });
 const mostrarErro=(campo:keyof ErrosCampos)=>camposInvalidos[campo]?
  <small id={`erro-${campo}`} className="erro-campo" role="alert">{camposInvalidos[campo]}</small>:null;
 async function buscarCep(){
  setBuscandoCep(true);setCepStatus('Consultando CEP...');
  try{
   const dados=await consultarCep(cliente.cep);
   setCliente(c=>({...c,cep:dados.cep,rua:dados.rua||c.rua,bairro:dados.bairro||c.bairro,cidade:dados.cidade||c.cidade,uf:dados.uf||c.uf}));
   const cobertura=avaliarCobertura(dados.bairro,loja);
   setCepStatus(cobertura.estado==='disponivel'? 'CEP encontrado. '+cobertura.mensagem : cobertura.mensagem);
  }catch(e){setCepStatus((e as Error).message||'Não foi possível consultar o CEP. Preencha o endereço manualmente.');}
  finally{setBuscandoCep(false);}
 }
 function confirmar(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const pedido:PedidoCheckout={numero:gerarNumeroPedido(),cliente,tipo,pagamento,trocoPara,observacoesGerais,linhas,foraHorario:!status.aberto};
  const falhas=validarPedido(pedido,produtos,loja);
  if(falhas.length){
   const campos=errosCamposPedido(pedido,loja,subtotal);
   setCamposInvalidos(campos);setErros(falhas);
   window.requestAnimationFrame(()=>{
    const invalido=document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if(invalido)invalido.focus();
    else document.getElementById('checkout-erros')?.focus();
   });
   return;
  }
  setCamposInvalidos({});setErros([]);
  const mensagem=montarMensagem(pedido,produtos,loja);
  const url=urlWhatsApp(mensagem,loja.whatsapp);
  // Apenas prepara a mensagem: o usuário precisa tocar em ENVIAR no WhatsApp.
  window.open(url,'_blank','noopener,noreferrer');
  onPreparar({pedido,url,mensagem});
 }
 const escolhaTipo:[TipoPedido,string,typeof Truck,string][]=[
  ['entrega','Delivery',Truck,'Receber no endereço'],['retirada','Retirada',Store,'Buscar no balcão'],['local','Comer no local',UtensilsCrossed,'Refeição no restaurante']
 ];
 return <main className="checkout-pagina">
  <div className="container-padrao">
   <button className="link-voltar" type="button" onClick={onVoltar}><ArrowLeft size={19}/> Voltar ao cardápio</button>
   <div className="checkout-titulo"><span className="micro-label">Quase lá!</span><h1>Finalizar pedido</h1><p>Revise suas escolhas. Tudo em uma única tela, de forma simples.</p></div>
   <div className="checkout-layout">
    <form className="checkout-form" onSubmit={confirmar} noValidate>
     {!status.aberto&&<div className="aviso-atendimento aviso-atendimento--fechado"><Clock3 size={20}/><span>{status.mensagem}. Você pode montar o pedido; ele será confirmado pelo restaurante quando abrir.</span></div>}
     {!loja.pedidosOnlineAtivos&&<div className="aviso-atendimento aviso-atendimento--fechado"><Clock3 size={20}/> Os pedidos online estão pausados. O cardápio continua disponível para consulta.</div>}
     <section className="checkout-bloco" aria-labelledby="etapa-tipo"><div className="checkout-bloco__titulo"><span className="etapa-numero">01</span><div><h2 id="etapa-tipo">Como deseja receber?</h2><p>Selecione o tipo do pedido</p></div></div>
      <div className="tipo-grade">{escolhaTipo.map(([id,nome,Icon,descricao])=><button key={id} type="button" aria-pressed={tipo===id} disabled={id==='entrega'&&!entregaAtiva} onClick={()=>{setTipo(id);setErros([]);setCamposInvalidos({});}} className={`tipo-opcao ${tipo===id?'tipo-opcao--ativa':''}`}><Icon size={25}/><strong>{nome}</strong><small>{descricao}</small></button>)}</div>
      {!entregaAtiva&&<p className="aviso-entrega-checkout" role="note">Entrega online indisponível no momento. Retirada e consumo no local continuam disponíveis.</p>}
     </section>
     <section className="checkout-bloco" aria-labelledby="etapa-cliente"><div className="checkout-bloco__titulo"><span className="etapa-numero">02</span><div><h2 id="etapa-cliente">Seus dados</h2><p>Para identificarmos seu pedido</p></div></div>
      <div className="form-grade">
       <label className="form-campo">Nome completo *<input autoComplete="name" {...propsErro('nome')} value={cliente.nome} onChange={e=>atualizar('nome',e.target.value)} placeholder="Como podemos chamar você?" required/>{mostrarErro('nome')}</label>
       <label className="form-campo">Telefone com DDD *<input type="tel" autoComplete="tel" inputMode="tel" {...propsErro('telefone')} value={cliente.telefone} onChange={e=>atualizar('telefone',e.target.value)} placeholder="(11) 99999-9999" required/>{mostrarErro('telefone')}</label>
      </div>
      {tipo==='entrega'&&<div className="endereco-form">
       <div className="form-grade">
        <label className="form-campo">CEP *<span className="cep-busca"><input autoComplete="postal-code" inputMode="numeric" maxLength={9} {...propsErro('cep')} value={cliente.cep} onChange={e=>{atualizar('cep',e.target.value);setCepStatus('');}} placeholder="00000-000" required/><button disabled={buscandoCep} type="button" onClick={()=>void buscarCep()} aria-label="Consultar CEP no ViaCEP"><Search size={19}/></button></span>{mostrarErro('cep')}</label>
        <label className="form-campo">Bairro *<input {...propsErro('bairro')} value={cliente.bairro} onChange={e=>atualizar('bairro',e.target.value)} placeholder="Seu bairro" required/>{mostrarErro('bairro')}</label>
       </div>
       {cepStatus&&<p role="status" className="cep-status">{cepStatus}</p>}
       <div className="form-grade">
        <label className="form-campo form-campo--largo">Rua / Avenida *<input autoComplete="street-address" {...propsErro('rua')} value={cliente.rua} onChange={e=>atualizar('rua',e.target.value)} placeholder="Nome da rua" required/>{mostrarErro('rua')}</label>
        <label className="form-campo">Número *<input {...propsErro('numero')} value={cliente.numero} onChange={e=>atualizar('numero',e.target.value)} placeholder="Número ou S/N" required/>{mostrarErro('numero')}</label>
        <label className="form-campo">Complemento<input value={cliente.complemento} onChange={e=>atualizar('complemento',e.target.value)} placeholder="Apto, bloco..."/></label>
        <label className="form-campo">Cidade *<input {...propsErro('cidade')} value={cliente.cidade} onChange={e=>atualizar('cidade',e.target.value)} placeholder="Cidade" required/>{mostrarErro('cidade')}</label>
        <label className="form-campo">UF *<input maxLength={2} {...propsErro('uf')} value={cliente.uf} onChange={e=>atualizar('uf',e.target.value.toUpperCase())} placeholder="SP" required/>{mostrarErro('uf')}</label>
        <label className="form-campo form-campo--largo">Ponto de referência<input value={cliente.referencia} onChange={e=>atualizar('referencia',e.target.value)} placeholder="Se houver"/></label>
       </div>
       {(loja.taxaEntregaFixa===null||loja.pedidoMinimoDelivery===null)&&<p className="config-pendente"><MapPin size={17}/> O delivery está temporariamente indisponível para pedidos online. A equipe precisa definir a taxa e o mínimo de entrega.</p>}
       {loja.bairrosAtendidos.length>0&&<p className="cep-status">Bairros atendidos: {loja.bairrosAtendidos.join(', ')}.</p>}
      </div>}
     </section>
     <section className="checkout-bloco" aria-labelledby="etapa-pagamento"><div className="checkout-bloco__titulo"><span className="etapa-numero">03</span><div><h2 id="etapa-pagamento">Como deseja pagar?</h2><p>A forma de pagamento será confirmada com a equipe</p></div></div>
      <div className="pagamentos-grade">
       {([['pix','Pix',Wallet,'A combinar no WhatsApp'],['cartao','Cartão',CreditCard,'Na entrega, retirada ou local'],['dinheiro','Dinheiro',Banknote,'Informe se precisa de troco']] as const)
       .filter(([id])=>loja.formasPagamento[id]).map(([id,nome,Icon,descricao])=>
       <label key={id} className={`pagamento-opcao ${pagamento===id?'pagamento-opcao--ativa':''}`}><input type="radio" name="pagamento" checked={pagamento===id} onChange={()=>setPagamento(id)}/><Icon size={22}/><span><strong>{nome}</strong><small>{descricao}</small></span></label>)}
      </div>
      {pagamento==='dinheiro'&&<label className="form-campo campo-troco">Troco para quanto? (R$)<input inputMode="decimal" {...propsErro('trocoPara')} value={trocoPara} onChange={e=>{setTrocoPara(e.target.value);setCamposInvalidos(c=>({...c,trocoPara:undefined}));}} placeholder="Ex.: 100,00 · deixe vazio se não precisar"/>{mostrarErro('trocoPara')}{trocoPara.trim()&&trocoEstimado!==null&&<small className="troco-detalhe">Troco estimado: {reais(trocoEstimado)}</small>}</label>}
      {pagamento==='pix'&&loja.formasPagamento.pix&&<p className="info-pix"><ShieldCheck size={18}/> Para pagar com Pix, solicite os dados à equipe pelo WhatsApp depois de enviar o pedido. Não há cobrança automática neste site.</p>}
     </section>
     <section className="checkout-bloco" aria-labelledby="etapa-observacoes"><div className="checkout-bloco__titulo"><span className="etapa-numero">04</span><div><h2 id="etapa-observacoes">Alguma observação?</h2><p>Opcional: informações para o pedido completo</p></div></div>
      <label className="form-campo">Observações gerais<textarea rows={3} maxLength={500} value={observacoesGerais} onChange={e=>setObservacoesGerais(e.target.value)} placeholder="Ex.: retirar às 12h, sem talheres..."/></label>
     </section>
     {erros.length>0&&<div id="checkout-erros" className="form-erros" role="alert" tabIndex={-1}><strong>Confira antes de continuar:</strong><ul>{erros.map(e=><li key={e}>{e}</li>)}</ul></div>}
     <button type="submit" className="botao botao--rosa botao--full botao-confirmar" disabled={!loja.pedidosOnlineAtivos||linhas.length===0}><CheckCircle2 size={21}/> Preparar pedido no WhatsApp <ArrowRight size={20}/></button>
     <p className="checkout-legal">Seu pedido será montado aqui e a mensagem aberta no WhatsApp. <strong>É preciso tocar em Enviar no WhatsApp</strong> e aguardar a confirmação da equipe. Não há cobrança automática.</p>
    </form>
    <aside className="checkout-resumo">
     <h2><ShoppingBag size={22}/> Resumo do pedido</h2>
     <div className="checkout-resumo__itens">{linhas.map(l=>{
      const item=produtos.find(p=>p.id===l.produtoId);
      if(!item)return null;
      const variante=item.variacoes.find(v=>v.id===l.variacaoId);
      const extras=item.opcionais.filter(o=>l.opcionaisIds.includes(o.id));
      const valor=item.preco+(variante?.acrescimo||0)+extras.reduce((s,x)=>s+x.preco,0);
      return <div className="checkout-resumo__linha" key={l.chave}><div><b>{l.quantidade}× {item.nome}</b>{variante&&<small>{variante.nome}</small>}{extras.length>0&&<small>{extras.map(x=>x.nome).join(', ')}</small>}{l.observacao&&<small>Obs.: {l.observacao}</small>}</div><strong>{reais(valor*l.quantidade)}</strong></div>;
     })}</div>
     <div className="checkout-valores"><div><span>Subtotal</span><b>{reais(subtotal)}</b></div>{(tipo!=='entrega'||loja.taxaEntregaFixa!==null)&&<div><span>Taxa de entrega</span><b>{tipo!=='entrega'?'Não se aplica':reais(loja.taxaEntregaFixa!)}</b></div>}<div className="checkout-valores__total"><span>Total estimado</span><strong>{tipo==='entrega'&&loja.taxaEntregaFixa===null?'Indisponível':reais(total)}</strong></div></div>
     {linhas.some(l=>produtos.find(p=>p.id===l.produtoId)?.exemplo)&&<p className="resumo-aviso">⚠️ Itens e valores demonstrativos. Confira as condições reais com a equipe antes de pagar.</p>}
    </aside>
   </div>
  </div>
 </main>;
}
