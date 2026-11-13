import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ChefHat, Clock3, Copy, Heart, Instagram, MapPin, MessageCircle, Phone, Search, ShieldCheck, ShoppingBag, Star, Store, Truck, UtensilsCrossed, X } from 'lucide-react';
import cardapio from '../data/cardapio.json';
import { loja, logoUrl } from '../config/loja';
import type { Categoria, LinhaCarrinho, Produto } from './types';
import { carregarCarrinho, reais, salvarCarrinho, situacaoLoja, totalCarrinho } from './pedido';
import { ProdutoCard, FotoPrato } from './components/ProdutoCard';
import { ProdutoModal } from './components/ProdutoModal';
import { Carrinho } from './components/Carrinho';
import { Checkout, type Preparado } from './components/Checkout';
import { InformacoesPedido, SobreCasa, Avaliacoes, Galeria } from './components/InformacoesExtras';

const categorias=cardapio.categorias as Categoria[];
const produtos=cardapio.itens as Produto[];
const ajudaUrl=`https://wa.me/${loja.whatsapp}?text=${encodeURIComponent('Olá! Tenho uma dúvida sobre o cardápio do Delícia do Nordeste Santa Cruz.')}`;
type Editando={produto:Produto;linha:LinhaCarrinho|null};
const totalItens=(carrinho:LinhaCarrinho[])=>carrinho.reduce((s,x)=>s+x.quantidade,0);
function irPara(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});}
function Header({quantidade,abrir,status}:{quantidade:number;abrir:()=>void;status:{aberto:boolean;mensagem:string}}){
 return <header className="cabecalho" id="inicio">
  <div className="container-padrao cabecalho__conteudo">
   <a href="#inicio" className="marca" onClick={e=>{e.preventDefault();irPara('inicio');}} aria-label="Voltar ao início">
    <img src={logoUrl} alt="Logo Casa do Norte – Unidade Santa Cruz" width="55" height="55"/>
    <span><strong>Delícia do Nordeste</strong><small>Casa do Norte · Santa Cruz</small></span>
   </a>
   <nav className="menu-desktop" aria-label="Navegação principal">
    <a href="#cardapio">Cardápio</a><a href="#como-funciona">Como pedir</a><a href="#avaliacoes">Avaliações</a><a href="#localizacao">Como chegar</a>
   </nav>
   <div className="cabecalho__acoes">
    <span className={`status-loja ${status.aberto?'status-loja--aberto':'status-loja--fechado'}`}><span className="ponto-status"/>{status.aberto?'Aberto agora':'Fechado agora'}</span>
    <button type="button" onClick={abrir} aria-label={`Abrir carrinho, ${quantidade} itens`} className="cabecalho__sacola"><ShoppingBag size={20}/><span>Sacola</span>{quantidade>0&&<b>{quantidade}</b>}</button>
   </div>
  </div>
 </header>;
}
function Hero({status}:{status:{aberto:boolean;mensagem:string}}){
 return <section className="hero">
  <div className="container-padrao hero__grade">
   <div className="hero__texto">
    <div className="hero__eyebrow"><span>✺</span> Bem-vindo ao sabor do Nordeste <span>✺</span></div>
    <h1>Da nossa cozinha<br/>para a <em>sua mesa.</em></h1>
    <p>Comida nordestina, feita com carinho. Escolha seus pratos, personalize do seu jeito e monte o pedido em poucos toques.</p>
    <div className="hero__acoes"><button className="botao botao--rosa" type="button" onClick={()=>irPara('cardapio')}>Ver cardápio e pedir <ArrowRight size={21}/></button><a className="botao botao--claro" href="#como-funciona">Como funciona</a></div>
    <div className="hero__selos">
     <span><Truck size={16}/> Delivery</span><span><ShoppingBag size={16}/> Retirada</span>
     {loja.tempoMedioMinutos!==null&&<span><Clock3 size={16}/> Previsão: {loja.tempoMedioMinutos} min</span>}
     <span className={status.aberto?'aberto':'fechado'}><span className="ponto-status"/>{status.aberto?'Aberto agora':'Fechado agora'}</span>
    </div>
   </div>
   <div className="hero__visual">
    {String(loja.heroFoto)?<img className="hero__foto" src={String(loja.heroFoto).startsWith('http')?String(loja.heroFoto):`${import.meta.env.BASE_URL}${String(loja.heroFoto).replace(/^\/+/, '')}`} alt="Fotografia ilustrativa de comida nordestina, não é foto do restaurante" width="720" height="600" fetchPriority="high"/>:
     <div className="hero__placeholder"><div className="hero__prato"><ChefHat size={76} strokeWidth={1.2}/><span>O sabor tem endereço</span></div><div className="hero__foto-texto"><b>Seu prato favorito mora aqui.</b><span>Sabores nordestinos</span></div></div>}
    <div className="hero__adesivo"><span>✸</span> Tradição &<br/> sabor de casa</div>
    {loja.heroFoto&&loja.heroImagemIlustrativa&&<span className="hero__legenda">Imagem ilustrativa</span>}
   </div>
  </div>
 </section>;
}
function Passos(){
 return <section id="como-funciona" className="passos container-padrao">
  <div className="cabecalho-secao"><span className="micro-label">Simples assim</span><h2>Seu pedido em 3 passos</h2><p>Escolha no site, envie no WhatsApp e aguarde a confirmação.</p></div>
  <div className="passos__grade">
   <article><div className="passo-icone"><UtensilsCrossed size={28}/></div><span className="passo-numero">01</span><h3>Escolha seus pratos</h3><p>Explore o cardápio, escolha o tamanho e adicione observações.</p></article>
   <article><div className="passo-icone"><ShoppingBag size={28}/></div><span className="passo-numero">02</span><h3>Confira a sacola</h3><p>Defina retirada, entrega ou consumo no local e o pagamento.</p></article>
   <article><div className="passo-icone"><MessageCircle size={28}/></div><span className="passo-numero">03</span><h3>Envie para confirmar</h3><p>O site prepara sua mensagem. Envie no WhatsApp e aguarde a equipe.</p></article>
  </div>
 </section>;
}
function Localizacao(){
 return <section id="localizacao" className="localizacao">
  <div className="container-padrao localizacao__grade">
   <div className="localizacao__texto"><span className="micro-label">Nossa casa</span><h2>Um pedacinho do Nordeste em São Paulo.</h2>
    <p>Venha conhecer a Casa do Norte · Unidade Santa Cruz.</p>
    <address><MapPin size={21}/><span>{loja.endereco}<br/>CEP {loja.cep}</span></address>
    <a className="localizacao__telefone" href={loja.telefoneLink}><Phone size={18}/>{loja.telefone}</a>
    <div className="localizacao__horarios"><Clock3 size={20}/><div><b>Horário de atendimento</b><span>Terça a domingo, das 8h às 22h</span><span>Segunda-feira: fechado</span></div></div>
    <div className="localizacao__links"><a className="botao botao--escuro" href={loja.mapsUrl} target="_blank" rel="noopener noreferrer">Como chegar <ArrowRight size={18}/></a>
     {loja.instagram&&<a href={loja.instagram} target="_blank" rel="noopener noreferrer" className="link-instagram"><Instagram size={18}/> Instagram</a>}
    </div>
   </div>
   <div className="localizacao__mapa"><iframe title="Mapa do Google – Rua Santa Cruz da Conceição, Parque Belém, São Paulo" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Rua%20Santa%20Cruz%20da%20Concei%C3%A7%C3%A3o%2C%20Parque%20Bel%C3%A9m%2C%20S%C3%A3o%20Paulo%2C%20SP%2C%2002850-100&output=embed" allowFullScreen/></div>
  </div>
 </section>;
}
function Confirmacao({preparado,novo}:{preparado:Preparado;novo:()=>void}){
 const [copiou,setCopiou]=useState(false);
 async function copiar(){try{await navigator.clipboard.writeText(preparado.mensagem);setCopiou(true);}catch{setCopiou(false);}}
 return <main className="pagina-confirmacao"><div className="container-padrao confirmacao__caixa">
  <div className="confirmacao__icone"><CheckCircle2 size={51}/></div>
  <span className="micro-label">Pedido pronto para enviar</span>
  <h1>Quase lá! Falta enviar no WhatsApp.</h1>
  <p>Montamos o pedido <strong>#{preparado.pedido.numero}</strong>. Abra a conversa, toque em <strong>Enviar</strong> e aguarde a confirmação do restaurante.</p>
  <div className="confirmacao__numero">Número do pedido <b>{preparado.pedido.numero}</b></div>
  <div className="confirmacao__aviso"><ShieldCheck size={20}/><span>O site não confirma recebimento no WhatsApp nem pagamento. A equipe confirmará disponibilidade, preços e prazo. {preparado.pedido.foraHorario?'O restaurante está fechado; a confirmação ocorrerá na próxima abertura.':''}</span></div>
  <div className="confirmacao__acoes"><a href={preparado.url} target="_blank" rel="noopener noreferrer" className="botao botao--rosa"><MessageCircle size={21}/> Abrir WhatsApp e enviar</a><button type="button" className="botao botao--claro" onClick={()=>void copiar()}><Copy size={18}/>{copiou?'Mensagem copiada':'Copiar pedido'}</button></div>
  <button type="button" className="link-voltar" onClick={novo}>Voltar ao cardápio</button>
 </div></main>;
}
function Rodape(){
 return <footer className="rodape">
  <div className="container-padrao rodape__grade">
   <div className="rodape__marca"><img src={logoUrl} alt="Logo da Casa do Norte Santa Cruz" width="62" height="62"/><div><strong>Delícia do Nordeste</strong><span>Casa do Norte · Santa Cruz</span></div><p>Comida nordestina feita com carinho, pertinho de você.</p></div>
   <div><h3>Encontre a gente</h3><p>{loja.endereco}<br/>CEP {loja.cep}</p><p>Terça a domingo, 8h às 22h<br/>Segunda-feira: fechado</p></div>
   <div><h3>Atendimento</h3><a href={loja.telefoneLink}>{loja.telefone}</a><a href={ajudaUrl} target="_blank" rel="noopener noreferrer">WhatsApp para dúvidas</a><a href={loja.mapsUrl} target="_blank" rel="noopener noreferrer">Ver localização</a>{loja.instagram&&<a href={loja.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}</div>
  </div>
  <div className="container-padrao rodape__base"><span>© {new Date().getFullYear()} Delícia do Nordeste · Casa do Norte · Santa Cruz.</span><span>Pedidos sujeitos à confirmação da equipe.</span></div>
 </footer>;
}
export default function LojaApp(){
 const [carrinho,setCarrinho]=useState<LinhaCarrinho[]>(carregarCarrinho);
 const [carrinhoAberto,setCarrinhoAberto]=useState(false);
 const [editando,setEditando]=useState<Editando|null>(null);
 const [busca,setBusca]=useState('');
 const [catAtiva,setCatAtiva]=useState('todas');
 const [checkout,setCheckout]=useState(false);
 const [confirmacao,setConfirmacao]=useState<Preparado|null>(null);
 const [armazenamentoFalhou,setArmazenamentoFalhou]=useState(false);
 const [horario,setHorario]=useState(()=>situacaoLoja(loja.horarios));
 useEffect(()=>{setArmazenamentoFalhou(!salvarCarrinho(carrinho));},[carrinho]);
 useEffect(()=>{const timer=window.setInterval(()=>setHorario(situacaoLoja(loja.horarios)),30000);return()=>clearInterval(timer);},[]);

 useEffect(()=>{
  const titulo=confirmacao?'Pedido preparado':checkout?'Finalizar pedido':'Cardápio e pedidos';
  document.title=`${titulo} | Delícia do Nordeste Santa Cruz – Parque Belém`;
  const description=document.querySelector('meta[name="description"]');
  description?.setAttribute('content',checkout?'Finalize seu pedido de comida nordestina: retirada, entrega ou consumo no local, com envio ao WhatsApp.':'Delícia do Nordeste · Casa do Norte · Santa Cruz. Veja o cardápio nordestino, monte sua sacola e envie o pedido para confirmação.');
 },[checkout,confirmacao]);
 const salvarItem=useCallback((item:LinhaCarrinho,antiga?:string)=>{
  setCarrinho(atual=>antiga?atual.map(l=>l.chave===antiga?item:l):[...atual,item]);
 },[]);
 const mudarQuantidade=useCallback((chave:string,delta:number)=>{
  setCarrinho(atual=>atual.map(l=>l.chave===chave?{...l,quantidade:Math.max(0,Math.min(99,l.quantidade+delta))}:l).filter(l=>l.quantidade>0));
 },[]);
 const abrirModal=useCallback((produto:Produto,linha:LinhaCarrinho|null=null)=>setEditando({produto,linha}),[]);
 const abrirEditor=useCallback((linha:LinhaCarrinho)=>{
  const produto=produtos.find(p=>p.id===linha.produtoId);
  if(produto){setCarrinhoAberto(false);abrirModal(produto,linha);}
 },[abrirModal]);
 const total=totalCarrinho(carrinho,produtos),quantidade=totalItens(carrinho);
 const filtrados=useMemo(()=>produtos.filter(p=>p.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(busca.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase())),[busca]);
 const destaque=produtos.filter(p=>p.destaque&&p.disponivel).slice(0,4);
 function novaCompra(){setConfirmacao(null);setCheckout(false);setCarrinho([]);window.scrollTo({top:0,behavior:'smooth'});}
 function irCheckout(){setCarrinhoAberto(false);setCheckout(true);setConfirmacao(null);window.scrollTo({top:0,behavior:'smooth'});}
 return <div className="site-loja">
  <a href="#conteudo" className="pular-conteudo">Pular para o conteúdo</a>
  <Header quantidade={quantidade} abrir={()=>setCarrinhoAberto(true)} status={horario}/>
  {armazenamentoFalhou&&<div role="status" className="aviso-armazenamento">Seu navegador está bloqueando o armazenamento. A sacola pode não ser recuperada se você fechar a página.</div>}
  {confirmacao?<Confirmacao preparado={confirmacao} novo={novaCompra}/>:
   checkout?<Checkout linhas={carrinho} produtos={produtos} onVoltar={()=>{setCheckout(false);window.scrollTo({top:0});}} onPreparar={p=>{setConfirmacao(p);setCheckout(false);window.scrollTo({top:0});}}/>:
   <main id="conteudo">
    <Hero status={horario}/>
    {produtos.some(p=>p.exemplo)&&<div className="barra-aviso"><div className="container-padrao"><span>✦</span> <b>Cardápio demonstrativo:</b> pratos, fotos e valores ilustrativos, sujeitos à confirmação do restaurante. <span>✦</span></div></div>}
    <InformacoesPedido/>
    {!loja.pedidosOnlineAtivos&&<div role="status" className="aviso-atendimento aviso-atendimento--fechado container-padrao">Pedidos online temporariamente desligados. Você ainda pode consultar o cardápio.</div>}
    {!horario.aberto&&<div role="status" className="aviso-atendimento aviso-atendimento--fechado container-padrao"><Clock3 size={20}/>{horario.mensagem}. Você pode montar a sacola para enviar quando desejar.</div>}
    <section className="destaques container-padrao" aria-labelledby="destaques-titulo">
     <div className="cabecalho-secao cabecalho-secao--linha"><div><span className="micro-label">Sugestões em destaque</span><h2 id="destaques-titulo">Mais pedidos <span className="cor-rosa">♥</span></h2><p>Seleção demonstrativa: substitua pelos itens mais pedidos reais.</p></div><button type="button" className="link-categorias" onClick={()=>irPara('cardapio')}>Ver cardápio completo <ArrowRight size={18}/></button></div>
     <div className="grade-produtos">{destaque.map(p=><ProdutoCard key={p.id} produto={p} abrir={abrirModal}/>)}</div>
    </section>
    <section className="catalogo" id="cardapio" aria-labelledby="cardapio-titulo">
     <div className="container-padrao catalogo__inicio"><span className="micro-label">Tem sabor para todo mundo</span><h2 id="cardapio-titulo">Nosso cardápio</h2><p>Encontre o que dá vontade de comer hoje.</p>
      <label className="buscar-prato"><Search size={22} aria-hidden="true"/><span className="sr-only">Buscar pratos</span><input value={busca} onChange={e=>setBusca(e.target.value)} type="search" placeholder="Buscar prato pelo nome..." aria-label="Buscar pratos pelo nome"/>{busca&&<button type="button" aria-label="Limpar busca" onClick={()=>setBusca('')}><X size={19}/></button>}</label>
     </div>
     <nav className="barra-categorias" aria-label="Categorias do cardápio"><div className="container-padrao barra-categorias__lista">
      <button type="button" aria-current={catAtiva==='todas'?'true':undefined} className={catAtiva==='todas'?'ativo':''} onClick={()=>{setCatAtiva('todas');irPara('cardapio');}}>Todos</button>
      {categorias.map(c=><button key={c.id} type="button" aria-current={catAtiva===c.id?'true':undefined} className={catAtiva===c.id?'ativo':''} onClick={()=>{setCatAtiva(c.id);irPara('categoria-'+c.id);}}>{c.nome}</button>)}
     </div></nav>
     <div className="container-padrao catalogo__secoes">
      {categorias.map(c=>{
       const itens=filtrados.filter(p=>p.categoriaId===c.id);
       return itens.length>0?<section id={'categoria-'+c.id} className="categoria-secao" key={c.id} aria-labelledby={'titulo-'+c.id}>
        <div className="categoria-secao__topo"><div><span className="micro-label">{String(c.ordem).padStart(2,'0')} · Nossa cozinha</span><h3 id={'titulo-'+c.id}>{c.nome}</h3></div><small>{itens.length} {itens.length===1?'opção':'opções'}</small></div>
        <div className="grade-produtos">{itens.map(p=><ProdutoCard key={p.id} produto={p} abrir={abrirModal}/>)}</div>
       </section>:null;
      })}
      {filtrados.length===0&&<div className="busca-vazia"><Search size={36}/><h3>Nenhum prato encontrado</h3><p>Experimente buscar outro nome ou limpe a pesquisa.</p><button type="button" className="botao botao--rosa" onClick={()=>setBusca('')}>Limpar busca</button></div>}
     </div>
    </section>
    <SobreCasa/><Passos/><Avaliacoes/><Galeria/><Localizacao/>
   </main>}
  <Rodape/>
  <a className="whatsapp-suporte" href={ajudaUrl} target="_blank" rel="noopener noreferrer" aria-label="Dúvidas? Fale no WhatsApp" title="WhatsApp para dúvidas"><MessageCircle size={24}/></a>
  {!checkout&&!confirmacao&&quantidade>0&&<button className="barra-sacola-mobile" type="button" onClick={()=>setCarrinhoAberto(true)} aria-label={`Abrir sacola com ${quantidade} itens e total ${reais(total)}`}>
   <span className="barra-sacola-mobile__icon"><ShoppingBag size={21}/><b>{quantidade}</b></span><span>Ver pedido</span><strong>{reais(total)}</strong><ArrowRight size={19}/>
  </button>}
  {carrinhoAberto&&<Carrinho linhas={carrinho} produtos={produtos} fechar={()=>setCarrinhoAberto(false)} atualizar={mudarQuantidade} remover={chave=>setCarrinho(itens=>itens.filter(i=>i.chave!==chave))} editar={abrirEditor} finalizar={irCheckout}/>}
  {editando&&<ProdutoModal key={editando.linha?.chave||editando.produto.id} produto={editando.produto} linha={editando.linha} fechar={()=>setEditando(null)} salvar={salvarItem}/>}
 </div>;
}
