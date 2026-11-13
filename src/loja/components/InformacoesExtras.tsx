import { Clock3, CreditCard, MapPin, ShieldCheck, ShoppingBag, Star, Truck, UtensilsCrossed, Heart, Image as ImageIcon } from 'lucide-react';
import avaliacoes from '../../data/avaliacoes.json';
import { loja, logoUrl } from '../../config/loja';
import { reais } from '../pedido';

/** Bloco de informações: só aparecem os dados efetivamente configurados. */
export function InformacoesPedido(){
 const formas=[
  loja.formasPagamento.pix?'Pix':null,
  loja.formasPagamento.cartao?'Cartão na entrega':null,
  loja.formasPagamento.dinheiro?'Dinheiro':null
 ].filter(Boolean).join(' · ');
 return <section className="informacoes-pedido container-padrao" aria-labelledby="informacoes-titulo">
  <div className="informacoes-pedido__titulo"><span className="micro-label">Antes de pedir</span><h2 id="informacoes-titulo">Tudo claro, do início ao fim</h2></div>
  <div className="informacoes-pedido__grade">
   <article><Truck size={23}/><div><strong>Delivery</strong><span>Peça em poucos toques</span></div></article>
   <article><ShoppingBag size={23}/><div><strong>Retirada</strong><span>Busque na unidade Santa Cruz</span></div></article>
   {loja.taxaEntregaFixa!==null&&<article><Truck size={23}/><div><strong>Taxa de entrega</strong><span>{reais(loja.taxaEntregaFixa)}</span></div></article>}
   {loja.pedidoMinimoDelivery!==null&&<article><ShoppingBag size={23}/><div><strong>Pedido mínimo</strong><span>{reais(loja.pedidoMinimoDelivery)}</span></div></article>}
   {loja.tempoMedioMinutos!==null&&<article><Clock3 size={23}/><div><strong>Previsão estimada</strong><span>{loja.tempoMedioMinutos} minutos</span></div></article>}
   {loja.bairrosAtendidos.length>0&&<article><MapPin size={23}/><div><strong>Bairros atendidos</strong><span>{loja.bairrosAtendidos.join(', ')}</span></div></article>}
   {formas&&<article><CreditCard size={23}/><div><strong>Formas de pagamento</strong><span>{formas}</span></div></article>}
  </div>
 </section>;
}
export function SobreCasa(){
 if(!loja.sobre)return null;
 return <section className="sobre-casa container-padrao" id="sobre"><div className="sobre-casa__arte"><span>✹</span><b>Sabor que aproxima.</b><small>Casa do Norte · Santa Cruz</small></div><div className="sobre-casa__texto">
  <span className="micro-label">Conheça nossa história</span><h2>Sobre a Casa do Norte</h2><p>{loja.sobre}</p>
  <div className="sobre-casa__pontos"><span><UtensilsCrossed size={17}/> Culinária nordestina</span><span><Heart size={17}/> Sabores da nossa terra</span></div>
 </div></section>;
}
export function Avaliacoes(){
 if(!avaliacoes.length)return null;
 return <section className="avaliacoes" id="avaliacoes" aria-labelledby="avaliacoes-titulo"><div className="container-padrao">
  <div className="cabecalho-secao"><span className="micro-label">Espaço para suas histórias</span><h2 id="avaliacoes-titulo">Quem prova, conta!</h2><p>Depoimentos de demonstração para você visualizar a futura seção de avaliações. Não são opiniões de clientes reais.</p></div>
  <div className="avaliacoes__grade">{avaliacoes.map(a=><article key={a.id} className="avaliacao-card">
   <div className="avaliacao-card__estrelas" aria-label={`Exemplo de nota ${a.nota} de 5`}>{Array.from({length:5},(_,i)=><Star key={i} size={16} fill={i<a.nota?'currentColor':'none'}/>)}</div>
   <p>“{a.texto}”</p><div className="avaliacao-card__rodape"><strong>{a.nome}</strong>{a.exemplo&&<span>Fictício · Exemplo</span>}</div>
  </article>)}</div>
  {loja.avaliacoesGoogleUrl&&<a className="botao botao--escuro avaliacoes__botao" href={loja.avaliacoesGoogleUrl} target="_blank" rel="noopener noreferrer"><Star size={18}/> Avalie no Google</a>}
 </div></section>;
}
export function Galeria(){
 if(!loja.fotosEspaco.length)return null;
 return <section className="galeria-espaco container-padrao" id="espaco"><div className="cabecalho-secao"><span className="micro-label">Venha nos visitar</span><h2>Nosso espaço</h2></div>
 <div className="galeria-espaco__grade">{loja.fotosEspaco.map(i=><figure key={i.id}><img src={i.foto.startsWith('http')?i.foto:`${import.meta.env.BASE_URL}${i.foto.replace(/^\/+/, '')}`} alt={`Foto do ${i.nome.toLowerCase()} da Casa do Norte Santa Cruz`} loading="lazy" width="640" height="480"/><figcaption>{i.nome}</figcaption></figure>)}</div></section>;
}
