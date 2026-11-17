import { Clock3, CreditCard, MapPin, ShieldCheck, ShoppingBag, Star, Truck, UtensilsCrossed, Heart, Image as ImageIcon } from 'lucide-react';
import {useLoja} from '../../config/LojaContext';
import { reais } from '../pedido';
import { entregaConfigurada } from '../entrega';

/** Bloco de informações: só aparecem os dados efetivamente configurados. */
export function InformacoesPedido(){
 const loja=useLoja();
 if(!loja.conteudo.mostrarInformacoes)return null;
 const formas=[
  loja.formasPagamento.pix?'Pix':null,
  loja.formasPagamento.cartao?'Cartão na entrega':null,
  loja.formasPagamento.dinheiro?'Dinheiro':null
 ].filter(Boolean).join(' · ');
 return <section className="informacoes-pedido container-padrao" aria-labelledby="informacoes-titulo">
  <div className="informacoes-pedido__titulo"><span className="micro-label">Antes de pedir</span><h2 id="informacoes-titulo">{loja.conteudo.tituloInformacoes}</h2></div>
  <div className="informacoes-pedido__grade">
   {entregaConfigurada(loja)&&<article><Truck size={23}/><div><strong>Delivery</strong><span>Peça em poucos toques</span></div></article>}
   <article><ShoppingBag size={23}/><div><strong>Retirada</strong><span>{loja.unidade}</span></div></article>
   {loja.taxaEntregaFixa!==null&&<article><Truck size={23}/><div><strong>Taxa de entrega</strong><span>{reais(loja.taxaEntregaFixa)}</span></div></article>}
   {loja.pedidoMinimoDelivery!==null&&<article><ShoppingBag size={23}/><div><strong>Pedido mínimo</strong><span>{reais(loja.pedidoMinimoDelivery)}</span></div></article>}
   {loja.tempoMedioMinutos!==null&&<article><Clock3 size={23}/><div><strong>Previsão estimada</strong><span>{loja.tempoMedioMinutos} minutos</span></div></article>}
   {loja.bairrosAtendidos.length>0&&<article><MapPin size={23}/><div><strong>Bairros atendidos</strong><span>{loja.bairrosAtendidos.join(', ')}</span></div></article>}
   {formas&&<article><CreditCard size={23}/><div><strong>Formas de pagamento</strong><span>{formas}</span></div></article>}
  </div>
 </section>;
}
export function SobreCasa(){
 const loja=useLoja();
 if(!loja.sobre)return null;
 return <section className="sobre-casa container-padrao" id="sobre"><div className="sobre-casa__arte"><span>✹</span>{loja.conteudo.fraseSobre&&<b>{loja.conteudo.fraseSobre}</b>}<small>{loja.unidade}</small></div><div className="sobre-casa__texto">
  <span className="micro-label">Conheça nossa história</span><h2>{loja.conteudo.tituloSobre}</h2><p>{loja.sobre}</p>
  <div className="sobre-casa__pontos"><span><UtensilsCrossed size={17}/> Culinária nordestina</span><span><Heart size={17}/> Sabores da nossa terra</span></div>
 </div></section>;
}
export function Avaliacoes(){
 const loja=useLoja();
 const {avaliacoes}=loja.conteudo;
 if(!loja.conteudo.mostrarAvaliacoes||!avaliacoes.length)return null;
 return <section className="avaliacoes" id="avaliacoes" aria-labelledby="avaliacoes-titulo"><div className="container-padrao">
  <div className="cabecalho-secao"><span className="micro-label">Espaço para suas histórias</span><h2 id="avaliacoes-titulo">{loja.conteudo.tituloAvaliacoes}</h2>{avaliacoes.some(item=>item.exemplo)&&<p>Depoimentos marcados como exemplo são ilustrativos.</p>}</div>
  <div className="avaliacoes__grade">{avaliacoes.map(a=><article key={a.id} className="avaliacao-card">
   <div className="avaliacao-card__estrelas" aria-label={`${a.exemplo?'Exemplo de nota':'Nota'} ${a.nota} de 5`}>{Array.from({length:5},(_,i)=><Star key={i} size={16} fill={i<a.nota?'currentColor':'none'}/>)}</div>
   <p>“{a.texto}”</p><div className="avaliacao-card__rodape"><strong>{a.nome}</strong>{a.exemplo&&<span>Fictício · Exemplo</span>}</div>
  </article>)}</div>
  {loja.avaliacoesGoogleUrl&&<a className="botao botao--escuro avaliacoes__botao" href={loja.avaliacoesGoogleUrl} target="_blank" rel="noopener noreferrer"><Star size={18}/> Avalie no Google</a>}
 </div></section>;
}
export function Galeria(){
 const loja=useLoja();
 if(!loja.fotosEspaco.length)return null;
 return <section className="galeria-espaco container-padrao" id="espaco"><div className="cabecalho-secao"><span className="micro-label">Venha nos visitar</span><h2>{loja.conteudo.tituloGaleria}</h2></div>
 <div className="galeria-espaco__grade">{loja.fotosEspaco.map(i=><figure key={i.id}><img src={i.foto.startsWith('http')?i.foto:`${import.meta.env.BASE_URL}${i.foto.replace(/^\/+/, '')}`} alt={`Foto do ${i.nome.toLowerCase()} da Casa do Norte Santa Cruz`} loading="lazy" width="640" height="480"/><figcaption>{i.nome}</figcaption></figure>)}</div></section>;
}
