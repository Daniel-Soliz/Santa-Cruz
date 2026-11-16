import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {LayoutDashboard,ClipboardList,UtensilsCrossed,Settings,LogOut,Menu,X,RefreshCw,Plus,Search,Check,Trash2,Pencil,Eye,EyeOff,AlertTriangle,Clock3,Bell,ArrowUpRight,ShoppingBag,Truck,ShieldCheck,FileText,Save} from 'lucide-react';
import {logoUrl} from '../config/loja';
import {EditorFoto} from './EditorFoto';
import {EditorOpcoes} from './EditorOpcoes';
import {removerFotoAntiga} from './fotosStorage';
import {Financeiro,type MovimentoCaixa} from './Financeiro';
import {valorDigitado} from '../loja/pedido';
import type {Variacao,Opcional} from '../loja/types';
import catalogo from '../data/cardapio.json';
import {supabase,erroLegivel,reais,type ConfiguracaoAdmin,type PedidoAdmin,type PedidoStatus,type ProdutoAdmin} from './backend';

type Aba='inicio'|'pedidos'|'cardapio'|'financeiro'|'configuracoes';
const labels:Record<PedidoStatus,string>={
 aguardando_confirmacao:'Aguardando confirmação',recebido:'Recebido',em_preparo:'Em preparo',pronto:'Pronto para retirada',
 saiu_entrega:'Saiu para entrega',entregue:'Entregue',cancelado:'Cancelado'
};
const abas=[{id:'inicio',nome:'Visão geral',Icon:LayoutDashboard},{id:'pedidos',nome:'Pedidos',Icon:ClipboardList},{id:'cardapio',nome:'Cardápio e preços',Icon:UtensilsCrossed},{id:'financeiro',nome:'Entradas e saídas',Icon:ShoppingBag},{id:'configuracoes',nome:'Entregas e ajustes',Icon:Settings}] as const;
const dataHora=(s:string)=>new Date(s).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});

function Pedidos({pedidos,atualizar}:{pedidos:PedidoAdmin[];atualizar:()=>Promise<void>}){
 const [aberto,setAberto]=useState(false),[busca,setBusca]=useState('');
 const [salvando,setSalvando]=useState(false),[erro,setErro]=useState('');
 const [nome,setNome]=useState(''),[telefone,setTelefone]=useState(''),[total,setTotal]=useState(''),[tipo,setTipo]=useState<'retirada'|'entrega'|'local'>('retirada'),[observacao,setObservacao]=useState('');
 const [formaPagamento,setFormaPagamento]=useState('outro');
 const filtrar=pedidos.filter(p=>[p.codigo,p.cliente_nome,p.telefone||''].join(' ').toLowerCase().includes(busca.toLowerCase()));
 const registrar=async(e:FormEvent)=>{
  e.preventDefault();setErro('');
  const numero=valorDigitado(total);
  if(numero===null){setErro('Informe um valor válido para o pedido.');return;}
  setSalvando(true);
  try{
   const codigo=`M-${new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/[^0-9]/g,'')}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
   const {error}=await supabase!.from('sc_pedidos').insert({
    codigo,cliente_nome:nome.trim(),telefone:telefone.trim()||null,
    modalidade:tipo,total_centavos:Math.round(numero*100),
    observacoes:observacao.trim()||null, status:'recebido',itens:[],
    origem:'manual',forma_pagamento:formaPagamento,pagamento_status:'pendente'
   });
   if(error)throw error;
   setAberto(false);setNome('');setTotal('');setTelefone('');setObservacao('');await atualizar();
  }catch(e){setErro(erroLegivel(e));}
  finally{setSalvando(false);}
 };
 const status=async(p:PedidoAdmin,novo:PedidoStatus)=>{
  setErro('');
  const {error}=await supabase!.from('sc_pedidos').update({status:novo,atualizado_em:new Date().toISOString()}).eq('id',p.id);
  if(error){setErro(erroLegivel(error));return;}
  await atualizar();
 };
 return <section className="adm-conteudo" aria-labelledby="adm-pedidos-titulo">
  <div className="adm-secao-topo"><div><span className="adm-kicker">CENTRAL OPERACIONAL</span><h2 id="adm-pedidos-titulo">Gestão de pedidos</h2><p>Pedidos cadastrados no banco do restaurante, sem valores demonstrativos.</p></div>
   <button className="adm-btn" onClick={()=>setAberto(true)}><Plus size={18}/> Registrar pedido</button></div>
  <div className="adm-aviso"><AlertTriangle size={19}/><span>Pedidos criados no site aparecem automaticamente <strong>apenas quando o checkout seguro do Supabase estiver ativado</strong>. Pedidos enviados fora do site pelo WhatsApp devem ser registrados manualmente.</span></div>
  <label className="adm-busca"><Search size={18}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome, número ou telefone" aria-label="Buscar pedidos"/></label>
  {erro&&<p className="adm-erro" role="alert">{erro}</p>}
  {filtrar.length?<div className="adm-lista-pedidos">{filtrar.map(p=><article className="adm-pedido" key={p.id}>
   <div className="adm-pedido__cabecalho"><div><span className="adm-kicker">{p.codigo}</span><h3>{p.cliente_nome}</h3><p>{dataHora(p.criado_em)} · {p.modalidade==='entrega'?'Delivery':p.modalidade==='local'?'No local':'Retirada'} {p.telefone?'· '+p.telefone:''}</p></div>
    <b>{reais(p.total_centavos/100)}</b></div>
   <p className="adm-pedido__nota">Origem: {p.origem==='site'?'Site':p.origem==='whatsapp'?'WhatsApp':'Registro manual'} · Pagamento: {p.forma_pagamento||'A confirmar'} · {p.pagamento_status==='pago'?'Marcado como recebido':p.pagamento_status==='estornado'?'Estornado':'Pendente'}</p>
   {p.itens?.length>0&&<ul className="adm-pedido__itens">{p.itens.map((i,index)=><li key={index}>{typeof i==='object'&&i!==null?
     `${Number((i as {quantidade?:number}).quantidade||0)}x ${String((i as {nome?:string}).nome||'Prato')}`:String(i)}</li>)}</ul>}
   {p.observacoes&&<p className="adm-pedido__nota">{p.observacoes}</p>}
   <div className="adm-pedido__baixo"><span className={`adm-status-tag adm-status-tag--${p.status}`}>{labels[p.status]}</span>
    <label>Atualizar status<select aria-label={`Status do pedido ${p.codigo}`} value={p.status} onChange={e=>void status(p,e.target.value as PedidoStatus)}>
     {Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select></label>
    <label>Pagamento<select aria-label={`Recebimento do pedido ${p.codigo}`} value={p.pagamento_status||'pendente'} onChange={async e=>{
     const novo=e.target.value;if(novo==='pago'&&!window.confirm('Você conferiu o recebimento deste pagamento fora do site?'))return;
     const {error}=await supabase!.from('sc_pedidos').update({pagamento_status:novo,atualizado_em:new Date().toISOString()}).eq('id',p.id);
     if(error)setErro(erroLegivel(error));else await atualizar();
    }}><option value="pendente">Pendente</option><option value="pago">Recebido (conferido)</option><option value="estornado">Estornado</option></select></label></div>
   </article>)}</div>:<div className="adm-vazio"><ClipboardList size={38}/><h3>Nenhum pedido registrado</h3><p>Os pedidos aparecerão aqui quando forem cadastrados pela equipe ou por uma futura integração segura.</p></div>}
  {aberto&&<div className="adm-sobreposicao" onClick={e=>{if(e.target===e.currentTarget)setAberto(false);}}>
   <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="novo-pedido-titulo">
    <div className="adm-modal__topo"><h3 id="novo-pedido-titulo">Registrar pedido manual</h3><button type="button" onClick={()=>setAberto(false)} aria-label="Fechar"><X size={20}/></button></div>
    <p className="adm-pequeno">Registre apenas pedidos que a equipe recebeu e confirmou. Isso não cria cobrança nem envia mensagem.</p>
    <form onSubmit={e=>void registrar(e)} className="adm-form">
     <label>Nome do cliente *<input required minLength={2} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do cliente"/></label>
     <label>Telefone (opcional)<input type="tel" value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="DDD + número"/></label>
     <div className="adm-duas-colunas">
      <label>Valor confirmado (R$) *<input required inputMode="decimal" value={total} onChange={e=>setTotal(e.target.value)} placeholder="0,00"/></label>
      <label>Tipo<select value={tipo} onChange={e=>setTipo(e.target.value as typeof tipo)}><option value="retirada">Retirada</option><option value="entrega">Entrega</option><option value="local">No local</option></select></label>
     </div>
     <label>Forma de pagamento<select value={formaPagamento} onChange={e=>setFormaPagamento(e.target.value)}>
      <option value="outro">A combinar</option><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option>
     </select></label>
     <label>Observações<textarea value={observacao} onChange={e=>setObservacao(e.target.value)} rows={3} placeholder="Detalhes confirmados com a equipe"/></label>
     {erro&&<p className="adm-erro" role="alert">{erro}</p>}
     <button className="adm-btn adm-btn--full" disabled={salvando}>{salvando?'Salvando...':'Registrar pedido'}</button>
    </form>
   </div></div>}
 </section>;
}

type Rascunho={id:string;nome:string;descricao:string;categoriaId:string;preco:string;foto:string;exemplo:boolean;disponivel:boolean;destaque:boolean;publicado:boolean;variacoes:Variacao[];opcionais:Opcional[];ordem:number};
const categorias= catalogo.categorias;
function Cardapio({produtos,atualizar}:{produtos:ProdutoAdmin[];atualizar:()=>Promise<void>}){
 const [editar,setEditar]=useState<Rascunho|null>(null),[salvando,setSalvando]=useState(false),[erro,setErro]=useState(''),[filtro,setFiltro]=useState('');
 const iniciar=(registro?:ProdutoAdmin)=>{
  const d=registro?.dados||{};
  setEditar({
   id:registro?.id||`item-${crypto.randomUUID().slice(0,10)}`,
   nome:String(d.nome||''),descricao:String(d.descricao||''),
   categoriaId:String(d.categoriaId||categorias[0].id),
   preco:registro?String(d.preco??''):'',
   foto:String(d.foto||''),exemplo:registro?d.exemplo!==false:true,
   disponivel:registro?d.disponivel!==false:true,destaque:!!d.destaque,
   publicado:registro?.publicado||false,
   variacoes:Array.isArray(d.variacoes)?d.variacoes as Variacao[]:[],
   opcionais:Array.isArray(d.opcionais)?d.opcionais as Opcional[]:[],
   ordem:registro?.ordem??produtos.length
  });setErro('');
 };
 const salvar=async(e:FormEvent)=>{
  e.preventDefault();if(!editar)return;
  const preco=valorDigitado(editar.preco);
  if(preco===null){setErro('Digite um preço válido em reais.');return;}
  if([...editar.variacoes.map(v=>({nome:v.nome,valor:v.acrescimo})),...editar.opcionais.map(o=>({nome:o.nome,valor:o.preco}))].some(x=>!x.nome.trim()||!Number.isFinite(x.valor)||x.valor<0)){
   setErro('Informe nome e preço válido em todos os tamanhos e opcionais.');return;
  }
  if(editar.publicado&&editar.exemplo){setErro('Antes de publicar, confira fotos e preços reais e desmarque "Produto de exemplo".');return;}
  setSalvando(true);setErro('');
  try{
   const antigo=produtos.find(p=>p.id===editar.id);
   const dados={...antigo?.dados,id:editar.id,nome:editar.nome.trim(),descricao:editar.descricao.trim(),
    preco,categoriaId:editar.categoriaId,foto:editar.foto.trim(),
    disponivel:editar.disponivel,destaque:editar.destaque,exemplo:editar.exemplo,
    imagemIlustrativa:editar.exemplo,
    variacoes:editar.variacoes,opcionais:editar.opcionais,tags:antigo?.dados.tags||[]};
   const {error}=await supabase!.from('sc_produtos').upsert({id:editar.id,dados,publicado:editar.publicado,ordem:editar.ordem,atualizado_em:new Date().toISOString()});
   if(error)throw error;
   const fotoAntiga=String(antigo?.dados.foto||'');
   if(fotoAntiga&&fotoAntiga!==editar.foto){
    try{await removerFotoAntiga(fotoAntiga,editar.id);}
    catch{setErro('Produto salvo, mas não foi possível excluir a foto antiga do armazenamento.');}
   }
   setEditar(null);await atualizar();
  }catch(e){setErro(erroLegivel(e));}
  finally{setSalvando(false);}
 };
 const alternar=async(item:ProdutoAdmin)=>{
  if(!item.publicado&&item.dados.exemplo!==false){setErro('Este produto ainda está marcado como exemplo. Edite seus dados reais antes de publicar.');return;}
  const {error}=await supabase!.from('sc_produtos').update({publicado:!item.publicado,atualizado_em:new Date().toISOString()}).eq('id',item.id);
  if(error){setErro(erroLegivel(error));return;}await atualizar();
 };
 const remover=async(item:ProdutoAdmin)=>{
  if(!window.confirm(`Excluir "${String(item.dados.nome)}" definitivamente?`))return;
  const {error}=await supabase!.from('sc_produtos').delete().eq('id',item.id);
  if(error){setErro(erroLegivel(error));return;}
  try{await removerFotoAntiga(String(item.dados.foto||''),item.id);}
  catch{setErro('Produto excluído, mas sua foto não pôde ser removida do armazenamento.');}
  await atualizar();
 };
 const importar=async()=>{
  if(produtos.length){setErro('Importação permitida apenas com o banco vazio, para não sobrescrever itens.');return;}
  if(!window.confirm('Importar os 16 produtos fictícios apenas como rascunhos? Eles NÃO ficarão visíveis aos clientes.'))return;
  setSalvando(true);setErro('');
  try{
   const rows=catalogo.itens.map((item,i)=>({id:item.id,dados:item,publicado:false,ordem:i}));
   const {error}=await supabase!.from('sc_produtos').insert(rows);
   if(error)throw error;await atualizar();
  }catch(e){setErro(erroLegivel(e));}
  finally{setSalvando(false);}
 };
 const lista=produtos.filter(p=>String(p.dados.nome||'').toLocaleLowerCase('pt-BR').includes(filtro.toLocaleLowerCase('pt-BR')));
 return <section className="adm-conteudo">
  <div className="adm-secao-topo"><div><span className="adm-kicker">GERENCIAR PRODUTOS</span><h2>Cardápio e preços</h2><p>Cadastre e publique pratos reais. Produtos demonstrativos ficam como rascunhos.</p></div>
   <button className="adm-btn" onClick={()=>iniciar()}><Plus size={18}/> Novo produto</button></div>
  <div className="adm-aviso"><AlertTriangle size={19}/> Itens cadastrados só entram na vitrine quando forem publicados individualmente e a opção “Usar cardápio do painel” estiver ativa em Configurações.</div>
  {erro&&!editar&&<p className="adm-erro" role="alert">{erro}</p>}
  <label className="adm-busca"><Search size={18}/><input placeholder="Buscar produto..." value={filtro} onChange={e=>setFiltro(e.target.value)}/></label>
  {lista.length?<div className="adm-tabela-wrap"><table className="adm-tabela"><thead><tr><th>Prato</th><th>Preço</th><th>Disponibilidade</th><th>Vitrine</th><th>Ações</th></tr></thead><tbody>
   {lista.map(p=><tr key={p.id}><td><div className="adm-tabela__produto"><img src={String(p.dados.foto||'')||undefined} alt="" loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden';}}/><span><b>{String(p.dados.nome||'Sem nome')}</b><small>{categorias.find(c=>c.id===p.dados.categoriaId)?.nome||'Categoria não informada'}{p.dados.exemplo!==false?' · Exemplo':''}</small></span></div></td><td><b>{reais(Number(p.dados.preco||0))}</b></td><td>{p.dados.disponivel===false?'Esgotado':'Disponível'}</td><td><span className={p.publicado?'adm-chip adm-chip--ok':'adm-chip'}>{p.publicado?'Publicado':'Rascunho'}</span></td><td><div className="adm-tabela__acoes">
    <button type="button" onClick={()=>iniciar(p)} aria-label={`Editar ${String(p.dados.nome)}`} title="Editar"><Pencil size={17}/></button>
    <button type="button" onClick={()=>void alternar(p)} aria-label={p.publicado?'Despublicar':'Publicar'} title={p.publicado?'Despublicar':'Publicar'}>{p.publicado?<EyeOff size={17}/>:<Eye size={17}/>}</button>
    <button type="button" onClick={()=>void remover(p)} aria-label="Excluir" title="Excluir"><Trash2 size={17}/></button>
   </div></td></tr>)}</tbody></table></div>:<div className="adm-vazio"><UtensilsCrossed size={38}/><h3>Cardápio administrativo vazio</h3><p>Crie produtos reais ou importe os exemplos como rascunhos, sem publicá-los.</p>
    {!produtos.length&&<button disabled={salvando} onClick={()=>void importar()} className="adm-btn adm-btn--secundario"><FileText size={17}/> Importar exemplos como rascunhos</button>}</div>}
  {editar&&<div className="adm-sobreposicao" onClick={e=>{if(e.target===e.currentTarget)setEditar(null);}}>
   <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="editor-produto-titulo">
    <div className="adm-modal__topo"><h3 id="editor-produto-titulo">Editar produto</h3><button type="button" onClick={()=>setEditar(null)} aria-label="Fechar"><X size={20}/></button></div>
    <form className="adm-form" onSubmit={e=>void salvar(e)}>
     <label>Nome *<input required value={editar.nome} onChange={e=>setEditar({...editar,nome:e.target.value})}/></label>
     <label>Descrição<textarea value={editar.descricao} onChange={e=>setEditar({...editar,descricao:e.target.value})} rows={2}/></label>
     <div className="adm-duas-colunas">
      <label>Preço (R$) *<input required inputMode="decimal" value={editar.preco} onChange={e=>setEditar({...editar,preco:e.target.value})}/></label>
      <label>Categoria<select value={editar.categoriaId} onChange={e=>setEditar({...editar,categoriaId:e.target.value})}>{categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
     </div>
     <EditorFoto produtoId={editar.id} foto={editar.foto} nome={editar.nome} onSalvar={url=>setEditar(e=>e?{...e,foto:url}:e)}/>
     <label>URL da foto (opcional, para imagens já hospedadas)<input value={editar.foto} onChange={e=>setEditar({...editar,foto:e.target.value})} placeholder="https://..."/></label>
     <label>Ordem de exibição<input type="number" min="0" step="1" value={editar.ordem} onChange={e=>setEditar({...editar,ordem:Number(e.target.value)})}/></label>
     <EditorOpcoes variacoes={editar.variacoes} opcionais={editar.opcionais}
      onVariacoes={v=>setEditar({...editar,variacoes:v})} onOpcionais={v=>setEditar({...editar,opcionais:v})}/>
     <div className="adm-checkboxes">
      {([{campo:'disponivel',texto:'Disponível hoje'},{campo:'destaque',texto:'Em destaque'},{campo:'exemplo',texto:'Produto de exemplo'},{campo:'publicado',texto:'Publicado na vitrine'}] as const).map(c=>
       <label key={c.campo}><input type="checkbox" checked={editar[c.campo]} onChange={e=>setEditar({...editar,[c.campo]:e.target.checked})}/>{c.texto}</label>)}
     </div>
     {editar.exemplo&&<p className="adm-aviso">Antes de publicar, atualize nome, preço, opcionais e imagem com os valores oficiais e desmarque “Produto de exemplo”.</p>}
     {erro&&<p className="adm-erro" role="alert">{erro}</p>}
     <button className="adm-btn adm-btn--full" disabled={salvando}><Save size={17}/>{salvando?'Salvando...':'Salvar no banco'}</button>
    </form>
   </div></div>}
 </section>;
}

function Configuracoes({config,produtos,atualizar}:{config:ConfiguracaoAdmin;produtos:ProdutoAdmin[];atualizar:()=>Promise<void>}){
 const [taxa,setTaxa]=useState(config.taxa_entrega===null?'':String(config.taxa_entrega));
 const [minimo,setMinimo]=useState(config.pedido_minimo===null?'':String(config.pedido_minimo));
 const [bairros,setBairros]=useState(config.bairros_atendidos.join(', '));
 const [ativos,setAtivos]=useState(config.pedidos_ativos);
 const [catalogoPublicado,setCatalogoPublicado]=useState(config.catalogo_publicado);
 const [formas,setFormas]=useState(config.formas_pagamento||{pix:true,cartao:true,dinheiro:true});
 const [erro,setErro]=useState(''),[salvando,setSalvando]=useState(false),[sucesso,setSucesso]=useState(false);
 useEffect(()=>{setTaxa(config.taxa_entrega===null?'':String(config.taxa_entrega));setMinimo(config.pedido_minimo===null?'':String(config.pedido_minimo));setBairros(config.bairros_atendidos.join(', '));setAtivos(config.pedidos_ativos);setCatalogoPublicado(config.catalogo_publicado);setFormas(config.formas_pagamento||{pix:true,cartao:true,dinheiro:true});},[config]);
 const salvar=async(e:FormEvent)=>{
  e.preventDefault();setErro('');setSucesso(false);
  const numero=(v:string)=>v.trim()?Number(v.replace(',','.')):null;
  const a=numero(taxa),b=numero(minimo),list=bairros.split(',').map(x=>x.trim()).filter(Boolean);
  if((a!==null&&(!Number.isFinite(a)||a<0))||(b!==null&&(!Number.isFinite(b)||b<0))){setErro('Confira os valores de taxa e mínimo, que não podem ser negativos.');return;}
  if(!Object.values(formas).some(Boolean)){setErro('Ative pelo menos uma forma de pagamento.');return;}
  if(catalogoPublicado&&!produtos.some(p=>p.publicado&&p.dados.exemplo===false)){setErro('É necessário ter ao menos um prato real publicado para ativar o cardápio do painel.');return;}
  setSalvando(true);
  const {error}=await supabase!.from('sc_configuracao').update({taxa_entrega:a,pedido_minimo:b,bairros_atendidos:list,pedidos_ativos:ativos,catalogo_publicado:catalogoPublicado,formas_pagamento:formas,atualizado_em:new Date().toISOString()}).eq('id','principal');
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  setSucesso(true);await atualizar();
 };
 return <section className="adm-conteudo"><div className="adm-secao-topo"><div><span className="adm-kicker">CONTROLE DA UNIDADE</span><h2>Entrega e configurações</h2><p>Os dados abaixo são aplicados à vitrine quando a conexão do banco estiver ativa.</p></div></div>
  <div className="adm-card adm-card--form"><form onSubmit={e=>void salvar(e)} className="adm-form">
    <h3><Truck size={20}/> Regras de entrega</h3>
    <div className="adm-duas-colunas"><label>Taxa fixa de entrega (R$)<input inputMode="decimal" value={taxa} onChange={e=>setTaxa(e.target.value)} placeholder="Ainda não definida"/></label>
    <label>Pedido mínimo (R$)<input inputMode="decimal" value={minimo} onChange={e=>setMinimo(e.target.value)} placeholder="Ainda não definido"/></label></div>
    <label>Bairros atendidos, separados por vírgula<textarea rows={3} value={bairros} onChange={e=>setBairros(e.target.value)} placeholder="Apenas os bairros realmente atendidos"/></label>
    <h3><Settings size={20}/> Formas de pagamento aceitas</h3>
    <div className="adm-checkboxes">{([['pix','Pix'],['cartao','Cartão'],['dinheiro','Dinheiro']] as const).map(([tipo,nome])=>
     <label key={tipo}><input type="checkbox" checked={formas[tipo]} onChange={e=>setFormas({...formas,[tipo]:e.target.checked})}/>{nome}</label>)}</div>
    <p className="adm-pequeno">Essas opções são para pagamento combinado com a equipe. Não ativam cobrança online.</p>
    <h3><Settings size={20}/> Operação</h3>
    <label className="adm-toggle"><input type="checkbox" checked={ativos} onChange={e=>setAtivos(e.target.checked)}/><span><b>Permitir montagem de pedidos online</b><small>Controla o checkout estático da loja.</small></span></label>
    <label className="adm-toggle"><input type="checkbox" checked={catalogoPublicado} onChange={e=>setCatalogoPublicado(e.target.checked)}/><span><b>Usar cardápio publicado do painel</b><small>Substitui o catálogo demonstrativo pelo conjunto de pratos reais publicados.</small></span></label>
    <p className="adm-aviso"><ShieldCheck size={19}/> Dados sem preenchimento permanecem indisponíveis ao público. As taxas e bairros precisam ser reais antes de habilitar delivery.</p>
    {erro&&<p className="adm-erro" role="alert">{erro}</p>}{sucesso&&<p className="adm-info" role="status">Configurações salvas no banco.</p>}
    <button className="adm-btn adm-btn--full" disabled={salvando}><Save size={18}/>{salvando?'Salvando...':'Salvar configurações'}</button>
   </form></div>
 </section>;
}

export function AdminDashboard({usuario,sair}:{usuario:string;sair:()=>Promise<void>}){
 const [aba,setAba]=useState<Aba>('inicio'),[menuAberto,setMenuAberto]=useState(false);
 const [pedidos,setPedidos]=useState<PedidoAdmin[]>([]),[produtos,setProdutos]=useState<ProdutoAdmin[]>([]),[movimentos,setMovimentos]=useState<MovimentoCaixa[]>([]);
 const [config,setConfig]=useState<ConfiguracaoAdmin|null>(null);
 const [carregando,setCarregando]=useState(true),[erro,setErro]=useState(''),[alerta,setAlerta]=useState('');
 const vistos=useRef<string[]>([]);
 const atualizar=useCallback(async()=>{
  const [a,b,c,d]=await Promise.all([
   supabase!.from('sc_configuracao').select('*').eq('id','principal').single(),
   supabase!.from('sc_produtos').select('*').order('ordem',{ascending:true}),
   supabase!.from('sc_pedidos').select('*').order('criado_em',{ascending:false}).limit(250),
   supabase!.from('sc_movimentos_caixa').select('*').order('criado_em',{ascending:false}).limit(250)
  ]);
  const err=a.error||b.error||c.error||d.error;
  if(err){setErro(erroLegivel(err));setCarregando(false);return;}
  const novos=(c.data||[]) as PedidoAdmin[];
  if(vistos.current.length&&novos.some(p=>!vistos.current.includes(p.id))){
   setAlerta('Novo pedido cadastrado no banco.');window.setTimeout(()=>setAlerta(''),6000);
  }
  vistos.current=novos.map(p=>p.id);
  setConfig(a.data as ConfiguracaoAdmin);setProdutos((b.data||[]) as ProdutoAdmin[]);setPedidos(novos);setMovimentos((d.data||[]) as MovimentoCaixa[]);
  setErro('');setCarregando(false);
 },[]);
 useEffect(()=>{
  void atualizar();
  const channel=supabase!.channel('santa-cruz-adm')
   .on('postgres_changes',{event:'*',schema:'public',table:'sc_pedidos'},()=>{void atualizar();})
   .on('postgres_changes',{event:'*',schema:'public',table:'sc_produtos'},()=>{void atualizar();})
   .on('postgres_changes',{event:'*',schema:'public',table:'sc_movimentos_caixa'},()=>{void atualizar();})
   .subscribe();
  return()=>{void supabase!.removeChannel(channel);};
 },[atualizar]);
 const andamento=pedidos.filter(p=>!['entregue','cancelado'].includes(p.status));
 const concluidos=pedidos.filter(p=>p.status==='entregue');
 const recebido=pedidos.filter(p=>p.pagamento_status==='pago').reduce((s,p)=>s+p.total_centavos,0)/100;
 const navegar=(id:Aba)=>{setAba(id);setMenuAberto(false);window.scrollTo({top:0,behavior:'smooth'});};
 return <div className="adm-shell">
  {menuAberto&&<button className="adm-backdrop" onClick={()=>setMenuAberto(false)} aria-label="Fechar menu"/>}
  <aside className={`adm-sidebar ${menuAberto?'adm-sidebar--aberta':''}`}>
   <div className="adm-sidebar__marca"><img src={logoUrl} alt="Logo Delícia do Nordeste" width={54} height={54}/><div><b>Delícia do Nordeste</b><small>Central de Gestão · Santa Cruz</small></div></div>
   <p className="adm-sidebar__legenda">PAINEL ADMINISTRATIVO</p>
   <nav aria-label="Menu administrativo">{abas.map(item=><button type="button" key={item.id} onClick={()=>navegar(item.id)} className={aba===item.id?'ativo':''}><item.Icon size={19}/>{item.nome}</button>)}</nav>
   <div className="adm-sidebar__rodape"><a href="#inicio"><ArrowUpRight size={18}/> Ver loja pública</a><button type="button" onClick={()=>void sair()}><LogOut size={18}/> Sair da administração</button></div>
  </aside>
  <div className="adm-principal">
   <header className="adm-topbar"><button className="adm-menu-mobile" onClick={()=>setMenuAberto(v=>!v)} aria-label="Abrir menu"><Menu size={23}/></button>
    <span><b>Casa do Norte</b><small>Unidade Santa Cruz</small></span>
    <div className="adm-topbar__direita"><span className="adm-online"><span/> Área protegida</span><button type="button" onClick={()=>void atualizar()} title="Atualizar dados" aria-label="Atualizar dados"><RefreshCw size={19}/></button><span className="adm-avatar">{usuario.slice(0,1).toUpperCase()}</span></div>
   </header>
   <main className="adm-main">
    {alerta&&<div className="adm-info" role="status"><Bell size={18}/>{alerta}</div>}
    {erro&&<div className="adm-erro" role="alert">{erro}</div>}
    {carregando?<div className="adm-carregando"><RefreshCw size={28} className="adm-spin"/> Carregando dados reais...</div>:
    <>
     {aba==='inicio'&&<section className="adm-conteudo">
      <div className="adm-secao-topo"><div><span className="adm-kicker">PAINEL DE CONTROLE</span><h1>Visão geral</h1><p>Bem-vindo à administração da Casa do Norte Santa Cruz.</p></div>
       <span className="adm-hoje"><Clock3 size={17}/>{new Date().toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'long',year:'numeric'})}</span></div>
      <div className="adm-metricas">
       <article><span><ClipboardList size={22}/></span><p>Pedidos registrados</p><strong>{pedidos.length}</strong><small>Somente registros do banco</small></article>
       <article><span><Bell size={22}/></span><p>Em andamento</p><strong>{andamento.length}</strong><small>Aguardando conclusão</small></article>
       <article><span><Check size={22}/></span><p>Pedidos entregues</p><strong>{concluidos.length}</strong><small>Marcados pela equipe</small></article>
       <article><span><ShoppingBag size={22}/></span><p>Pagamentos conferidos</p><strong className="adm-metricas__dinheiro">{reais(recebido)}</strong><small>Equipe marcou como recebido · últimos 250</small></article>
      </div>
      <div className="adm-grade-paineis">
       <div className="adm-card"><h2><ClipboardList size={21}/> Últimos pedidos</h2>
        {pedidos.slice(0,5).length?pedidos.slice(0,5).map(p=><div key={p.id} className="adm-resumo-linha"><span><b>{p.codigo}</b><small>{p.cliente_nome}</small></span><span className="adm-status-tag">{labels[p.status]}</span></div>):
        <p className="adm-sem-dados">Nenhum pedido registrado ainda.</p>}
        <button type="button" onClick={()=>navegar('pedidos')} className="adm-link">Abrir pedidos <ArrowUpRight size={16}/></button></div>
       <div className="adm-card"><h2><UtensilsCrossed size={21}/> Situação do cardápio</h2>
        <div className="adm-resumo-linha"><span>Itens cadastrados no banco</span><b>{produtos.length}</b></div>
        <div className="adm-resumo-linha"><span>Itens publicados</span><b>{produtos.filter(p=>p.publicado).length}</b></div>
        <div className="adm-resumo-linha"><span>Cardápio online</span><span className={config?.catalogo_publicado?'adm-chip adm-chip--ok':'adm-chip'}>{config?.catalogo_publicado?'Ativo':'Demonstração'}</span></div>
        <div className="adm-resumo-linha"><span>Entrega configurada</span><span className={config?.taxa_entrega!==null&&config?.pedido_minimo!==null&&!!config?.bairros_atendidos.length?'adm-chip adm-chip--ok':'adm-chip'}>{config?.taxa_entrega!==null&&config?.pedido_minimo!==null&&!!config?.bairros_atendidos.length?'Sim':'Pendente'}</span></div>
        <button type="button" onClick={()=>navegar('cardapio')} className="adm-link">Gerenciar cardápio <ArrowUpRight size={16}/></button></div>
      </div>
      <div className="adm-aviso"><ShieldCheck size={19}/> Este painel usa dados do Supabase. Pedidos de site só chegam automaticamente após ativar a função segura de checkout e o catálogo real; conversas avulsas no WhatsApp ainda exigem registro manual.</div>
     </section>}
     {aba==='pedidos'&&<Pedidos pedidos={pedidos} atualizar={atualizar}/>}
     {aba==='cardapio'&&<Cardapio produtos={produtos} atualizar={atualizar}/>}
     {aba==='financeiro'&&<Financeiro pedidos={pedidos} movimentos={movimentos} atualizar={atualizar}/>}
     {aba==='configuracoes'&&config&&<Configuracoes config={config} produtos={produtos} atualizar={atualizar}/>}
    </>}
   </main>
   <footer className="adm-rodape">Delícia do Nordeste · Santa Cruz · Gestão administrativa com autenticação e RLS</footer>
  </div>
 </div>;
}
