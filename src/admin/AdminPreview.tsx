import {useState} from 'react';
import {LayoutDashboard,ClipboardList,UtensilsCrossed,Settings,ArrowLeft,LockKeyhole,Eye,Database,ShieldCheck,AlertTriangle} from 'lucide-react';
import {logoUrl} from '../config/loja';
import catalogo from '../data/cardapio.json';
type Aba='visao'|'pedidos'|'cardapio'|'config';
const abas=[{id:'visao',nome:'Visão geral',Icon:LayoutDashboard},{id:'pedidos',nome:'Pedidos',Icon:ClipboardList},{id:'cardapio',nome:'Cardápio e preços',Icon:UtensilsCrossed},{id:'config',nome:'Entrega e ajustes',Icon:Settings}] as const;
/** Prévia visual sem login, banco ou dados reais. Nunca disponibiliza operações. */
export function AdminPreview({fechar}:{fechar:()=>void}){
 const [aba,setAba]=useState<Aba>('visao');
 const conteudo=()=>{
  if(aba==='pedidos')return <div className="adm-vazio"><ClipboardList size={42}/><h2>Gestão de pedidos</h2><p>Os pedidos confirmados aparecerão aqui quando um banco próprio estiver conectado. A lista não foi simulada.</p></div>;
  if(aba==='cardapio')return <>
   <div className="adm-aviso"><AlertTriangle size={18}/> Abaixo está somente uma prévia de pratos fictícios do arquivo local. Não é possível alterar preços nesta demonstração.</div>
   <div className="adm-tabela-wrap"><table className="adm-tabela"><thead><tr><th>Nome</th><th>Preço ilustrativo</th><th>Status</th></tr></thead><tbody>
    {catalogo.itens.slice(0,6).map(p=><tr key={p.id}><td>{p.nome}</td><td>Exemplo, não oficial</td><td><span className="adm-chip">Rascunho</span></td></tr>)}
   </tbody></table></div></>;
  if(aba==='config')return <div className="adm-vazio"><Settings size={42}/><h2>Configurações da loja</h2><p>Taxa de entrega, pedido mínimo e bairros serão editáveis após o login em um Supabase dedicado à Santa Cruz.</p></div>;
  return <>
   <div className="adm-metricas">
    {['Pedidos registrados','Em andamento','Pedidos entregues','Valores registrados'].map(x=><article key={x}><span><LockKeyhole size={19}/></span><p>{x}</p><strong>—</strong><small>Banco ainda não conectado</small></article>)}
   </div>
   <div className="adm-grade-paineis">
    <div className="adm-card"><h2><ClipboardList size={20}/> Últimos pedidos</h2><p className="adm-sem-dados">Nenhum dado é exibido na prévia visual.</p></div>
    <div className="adm-card"><h2><UtensilsCrossed size={20}/> Cardápio da casa</h2><p className="adm-sem-dados">Estrutura de pratos e preços pronta para integração, sem vendas falsas.</p></div>
   </div>
  </>;
 };
 return <div className="adm-shell adm-preview">
  <aside className="adm-sidebar adm-sidebar--preview"><div className="adm-sidebar__marca"><img src={logoUrl} alt="Logo Delícia do Nordeste"/><div><b>Delícia do Nordeste</b><small>Santa Cruz · ADM</small></div></div>
   <p className="adm-sidebar__legenda">PRÉVIA VISUAL</p>
   <nav>{abas.map(x=><button key={x.id} onClick={()=>setAba(x.id)} className={aba===x.id?'ativo':''}><x.Icon size={18}/>{x.nome}</button>)}</nav>
   <div className="adm-sidebar__rodape"><button onClick={fechar}><ArrowLeft size={18}/> Voltar à configuração</button><a href="#inicio">Ir para a loja</a></div>
  </aside>
  <div className="adm-principal">
   <header className="adm-topbar"><span><b>Casa do Norte · Santa Cruz</b><small>Central de Gestão</small></span><span className="adm-preview__marca"><Eye size={17}/> PRÉVIA</span></header>
   <main className="adm-main"><section className="adm-conteudo">
    <div className="adm-secao-topo"><div><span className="adm-kicker">MODO APRESENTAÇÃO</span><h1>{abas.find(x=>x.id===aba)?.nome}</h1><p>Interface ilustrativa para você conhecer a organização. Não é um painel ativo.</p></div></div>
    <div className="adm-aviso"><ShieldCheck size={19}/> A prévia não acessa informações privadas, não cria pedidos e não altera valores no site.</div>
    <div className="adm-preview__mobile-nav">{abas.map(x=><button key={x.id} onClick={()=>setAba(x.id)} className={aba===x.id?'ativo':''}>{x.nome}</button>)}</div>
    {conteudo()}
    <button className="adm-btn adm-btn--secundario" onClick={fechar}><Database size={17}/> Configurar acesso real</button>
   </section></main>
  </div>
 </div>;
}
