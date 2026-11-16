import {useMemo,useState,type FormEvent} from 'react';
import {UtensilsCrossed,Plus,Search,Pencil,Eye,EyeOff,Trash2,X,Save,ImagePlus,AlertTriangle,CheckCircle2,ArrowUpRight,ChefHat} from 'lucide-react';
import type {Opcional,Variacao,Produto} from '../loja/types';
import {valorDigitado} from '../loja/pedido';
import {EditorFoto} from './EditorFoto';
import {EditorOpcoes} from './EditorOpcoes';
import {GestorCategorias} from './GestorCategorias';
import {removerFotoAntiga} from './fotosStorage';
import {erroLegivel,reais,supabase,type CategoriaAdmin,type ProdutoAdmin} from './backend';

type Rascunho={
 id:string;nome:string;descricao:string;categoriaId:string;preco:string;foto:string;
 exemplo:boolean;imagemIlustrativa:boolean;disponivel:boolean;destaque:boolean;publicado:boolean;
 variacoes:Variacao[];opcionais:Opcional[];ordem:number;
};
type Props={
 categorias:CategoriaAdmin[];produtos:ProdutoAdmin[];catalogoPublicado:boolean;atualizar:()=>Promise<void>;
};
const produtoImagem=(p:ProdutoAdmin)=>typeof p.dados.foto==='string'?p.dados.foto:'';
const valorSeguro=(p:ProdutoAdmin)=>Number(p.dados.preco||0);
const idItem=()=>`prato-${crypto.randomUUID().slice(0,16)}`;

export function GestorCardapio({categorias,produtos,catalogoPublicado,atualizar}:Props){
 const [editando,setEditando]=useState<Rascunho|null>(null);
 const [salvando,setSalvando]=useState(false),[erro,setErro]=useState(''),[sucesso,setSucesso]=useState('');
 const [busca,setBusca]=useState(''),[categoriaFiltro,setCategoriaFiltro]=useState('todas');
 const [previa,setPrevia]=useState(false);
 const ordenadas=useMemo(()=>[...categorias].sort((a,b)=>a.ordem-b.ordem||a.nome.localeCompare(b.nome,'pt-BR')),[categorias]);
 const categoriaPorId=new Map(categorias.map(c=>[c.id,c]));
 const podePublicar=(categoriaId:string)=>!!categoriaPorId.get(categoriaId)?.ativa;
 const novo=(produto?:ProdutoAdmin)=>{
  setErro('');setSucesso('');
  const dados=produto?.dados||{};
  setEditando({
   id:produto?.id||idItem(),
   nome:String(dados.nome||''),descricao:String(dados.descricao||''),
   categoriaId:String(dados.categoriaId||ordenadas.find(c=>c.ativa)?.id||ordenadas[0]?.id||''),
   preco:produto?String(dados.preco??''):'',
   foto:String(dados.foto||''),
   exemplo:produto?dados.exemplo!==false:false,
   imagemIlustrativa:produto?dados.imagemIlustrativa===true:false,
   disponivel:produto?dados.disponivel!==false:true,
   destaque:!!dados.destaque,
   publicado:produto?.publicado||false,
   variacoes:Array.isArray(dados.variacoes)?dados.variacoes as Variacao[]:[],
   opcionais:Array.isArray(dados.opcionais)?dados.opcionais as Opcional[]:[],
   ordem:produto?.ordem??produtos.length+1
  });
 };
 const validar=(d:Rascunho):string=>{
  if(d.nome.trim().length<2||d.nome.trim().length>120)return 'O prato precisa ter um nome de 2 a 120 caracteres.';
  if(!categoriaPorId.has(d.categoriaId))return 'Selecione uma categoria cadastrada.';
  const preco=valorDigitado(d.preco);
  if(preco===null||preco<=0)return 'Digite o preço real do prato, maior que zero.';
  if(!Number.isInteger(d.ordem)||d.ordem<0)return 'A ordem do prato precisa ser um inteiro não negativo.';
  const nomes=[...d.variacoes.map(v=>({nome:v.nome,preco:v.acrescimo})),
   ...d.opcionais.map(o=>({nome:o.nome,preco:o.preco}))];
  if(nomes.some(v=>v.nome.trim().length<2||!Number.isFinite(v.preco)||v.preco<0))
   return 'Preencha o nome e o valor de todos os tamanhos e adicionais.';
  if(d.publicado&&d.exemplo)return 'O prato ainda está marcado como exemplo. Confirme os dados reais antes de publicá-lo.';
  if(d.publicado&&!podePublicar(d.categoriaId))return 'Ative a categoria antes de publicar este prato.';
  if(d.foto.trim()&&!(d.foto.startsWith('https://')||/^[\w./-]+$/.test(d.foto.trim())))
   return 'Use uma imagem enviada pelo painel, uma URL HTTPS ou um caminho local válido.';
  return '';
 };
 const salvar=async(e:FormEvent)=>{
  e.preventDefault();if(!editando)return;
  setErro('');setSucesso('');
  const falha=validar(editando);if(falha){setErro(falha);return;}
  setSalvando(true);
  try{
   const antigo=produtos.find(p=>p.id===editando.id);
   const dados:Produto={id:editando.id,categoriaId:editando.categoriaId,
    nome:editando.nome.trim(),descricao:editando.descricao.trim(),
    preco:valorDigitado(editando.preco)!,foto:editando.foto.trim(),
    disponivel:editando.disponivel,destaque:editando.destaque,exemplo:editando.exemplo,
    imagemIlustrativa:editando.imagemIlustrativa,
    variacoes:editando.variacoes,opcionais:editando.opcionais,
    tags:Array.isArray(antigo?.dados.tags)?antigo.dados.tags as string[]:[]
   };
   const {error}=await supabase!.from('sc_produtos').upsert({
    id:editando.id,dados,publicado:editando.publicado,ordem:editando.ordem,
    atualizado_em:new Date().toISOString()
   });
   if(error)throw error;
   setEditando(null);setSucesso(`Prato "${dados.nome}" salvo ${editando.publicado?'e publicado':'como rascunho'}.`);
   const anterior=produtoImagem(antigo||{id:'',dados:{},publicado:false,ordem:0});
   if(anterior&&anterior!==editando.foto){
    try{await removerFotoAntiga(anterior,editando.id);}
    catch{setSucesso('Prato salvo. A imagem antiga permaneceu no armazenamento e pode ser limpa depois.');}
   }
   await atualizar();
  }catch(e){setErro(erroLegivel(e));}
  finally{setSalvando(false);}
 };
 const publicar=async(p:ProdutoAdmin)=>{
  setErro('');setSucesso('');
  const categoria=String(p.dados.categoriaId||'');
  if(!p.publicado&&(p.dados.exemplo!==false||!p.dados.nome||!Number.isFinite(Number(p.dados.preco))||Number(p.dados.preco)<=0||!podePublicar(categoria))){
   setErro('Para publicar, confira os dados reais, preço positivo, categoria ativa e desmarque "Produto de exemplo" no editor.');
   return;
  }
  setSalvando(true);
  const {error}=await supabase!.from('sc_produtos').update({
   publicado:!p.publicado,atualizado_em:new Date().toISOString()
  }).eq('id',p.id);
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  setSucesso(p.publicado?'Prato retirado da vitrine.':'Prato publicado. Ele aparecerá quando o cardápio do painel estiver ativo.');
  await atualizar();
 };
 const excluir=async(p:ProdutoAdmin)=>{
  if(!window.confirm(`Excluir definitivamente o prato "${String(p.dados.nome)}"? Isso não poderá ser desfeito.`))return;
  setErro('');setSucesso('');setSalvando(true);
  const {error}=await supabase!.from('sc_produtos').delete().eq('id',p.id);
  if(error){setErro(erroLegivel(error));setSalvando(false);return;}
  try{await removerFotoAntiga(produtoImagem(p),p.id);}
  catch{setSucesso('Prato excluído, mas a foto antiga não pôde ser removida do armazenamento.');}
  setSalvando(false);await atualizar();
  setSucesso(v=>v||'Prato excluído do cardápio.');
 };
 const filtrados=produtos.filter(p=>
  (categoriaFiltro==='todas'||p.dados.categoriaId===categoriaFiltro) &&
  String(p.dados.nome||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')
   .includes(busca.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')));
 const publicados=produtos.filter(p=>p.publicado&&!p.dados.exemplo&&p.dados.disponivel!==false
  &&podePublicar(String(p.dados.categoriaId||'')));
 return <section className="adm-conteudo" aria-labelledby="gerenciar-cardapio-titulo">
  <div className="adm-secao-topo">
   <div><span className="adm-kicker">GESTÃO COMPLETA</span><h2 id="gerenciar-cardapio-titulo">Seu cardápio, do seu jeito</h2>
    <p>Crie categorias, pratos e fotos. Salve rascunhos e publique somente quando estiver tudo certo.</p></div>
   <a href="#inicio" className="adm-link" title="Abrir a loja pública"><ArrowUpRight size={17}/> Ver site</a>
  </div>
  <div className="adm-etapas">
   <span><b>1</b> Criar categorias</span><span><b>2</b> Cadastrar pratos</span>
   <span><b>3</b> Ajustar imagens</span><span><b>4</b> Publicar na loja</span>
  </div>
  <div className="adm-aviso"><AlertTriangle size={19}/><span>
   {catalogoPublicado?'O cardápio do painel está ativo. Alterações em pratos publicados aparecem na loja.':
    'O site ainda apresenta o catálogo demonstrativo. Prepare os seus pratos aqui e ative o novo cardápio em Entregas e ajustes quando estiver pronto.'}
   </span></div>
  <GestorCategorias categorias={categorias} produtos={produtos} atualizar={atualizar}/>
  <section className="adm-card adm-produtos-painel" aria-labelledby="adm-produtos-titulo">
   <div className="adm-categorias__topo">
    <div><span className="adm-kicker">PASSO 2 · CADASTRAR</span><h3 id="adm-produtos-titulo"><UtensilsCrossed size={20}/> Pratos e produtos</h3>
     <p className="adm-pequeno">Edite valores, fotos, descrição, tamanho, adicionais e disponibilidade sem mexer no código do site.</p></div>
    <button type="button" className="adm-btn" disabled={!categorias.length||salvando} onClick={()=>novo()}><Plus size={18}/> Novo prato</button>
   </div>
   {!categorias.length&&<p className="adm-categorias__vazio">Primeiro crie uma categoria acima para habilitar o cadastro de pratos.</p>}
   <div className="adm-filtros-produtos">
    <label className="adm-busca"><Search size={18}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar um prato..." aria-label="Buscar pratos"/></label>
    <label className="adm-filtros-produtos__categoria">Filtrar por categoria
     <select value={categoriaFiltro} onChange={e=>setCategoriaFiltro(e.target.value)}>
      <option value="todas">Todas as categorias</option>
      {ordenadas.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
     </select>
    </label>
   </div>
   {erro&&!editando&&<p className="adm-erro" role="alert">{erro}</p>}
   {sucesso&&<p className="adm-info" role="status"><CheckCircle2 size={18}/>{sucesso}</p>}
   {filtrados.length?
    <div className="adm-tabela-wrap"><table className="adm-tabela">
     <thead><tr><th>Produto</th><th>Preço</th><th>Categoria</th><th>Visibilidade</th><th>Ações</th></tr></thead>
     <tbody>{[...filtrados].sort((a,b)=>a.ordem-b.ordem).map(p=><tr key={p.id}>
      <td><div className="adm-tabela__produto">
       {produtoImagem(p)?<img src={produtoImagem(p)} alt="" loading="lazy" width="50" height="50"/>:
        <div className="adm-mini-sem-foto" role="img" aria-label="Sem foto"><ImagePlus size={21}/></div>}
       <span><b>{String(p.dados.nome||'Sem nome')}</b>
        <small>{p.dados.exemplo!==false?'Produto de exemplo · ':''}{p.dados.disponivel===false?'Indisponível':'Disponível'}</small></span>
      </div></td>
      <td><strong>{reais(valorSeguro(p))}</strong></td>
      <td>{categoriaPorId.get(String(p.dados.categoriaId||''))?.nome||'Categoria não cadastrada'}</td>
      <td><span className={p.publicado?'adm-chip adm-chip--ok':'adm-chip'}>{p.publicado?'Publicado':'Rascunho'}</span></td>
      <td><div className="adm-tabela__acoes">
       <button type="button" title="Editar texto, preço e foto" aria-label={`Editar ${String(p.dados.nome)}`} onClick={()=>novo(p)}><Pencil size={18}/></button>
       <button type="button" title={p.publicado?'Despublicar':'Publicar'} aria-label={p.publicado?'Retirar da loja':'Publicar na loja'} disabled={salvando} onClick={()=>void publicar(p)}>{p.publicado?<EyeOff size={18}/>:<Eye size={18}/>}</button>
       <button type="button" title="Excluir prato" aria-label={`Excluir ${String(p.dados.nome)}`} disabled={salvando} onClick={()=>void excluir(p)}><Trash2 size={18}/></button>
      </div></td>
     </tr>)}</tbody>
    </table></div>:
    <div className="adm-vazio"><ChefHat size={37}/><h3>Nenhum prato nesta seleção</h3>
     <p>Cadastre seu primeiro prato real. Nenhum preço ou foto será preenchido automaticamente.</p>
     {categorias.length>0&&<button type="button" className="adm-btn" onClick={()=>novo()}><Plus size={18}/> Cadastrar um prato</button>}
    </div>}
  </section>
  <section className="adm-card adm-previa-cardapio">
   <div className="adm-categorias__topo">
    <div><span className="adm-kicker">PASSO 3 · CONFERIR</span><h3>Prévia dos itens publicados</h3>
     <p className="adm-pequeno">Visualização dos pratos que poderão aparecer na loja, mesmo antes de ativar o catálogo.</p>
    </div>
    <button type="button" className="adm-btn adm-btn--secundario" onClick={()=>setPrevia(v=>!v)}>
     {previa?<EyeOff size={17}/>:<Eye size={17}/>} {previa?'Esconder prévia':'Visualizar prévia'}
    </button>
   </div>
   {previa&&(publicados.length?<div className="adm-previa-cardapio__grade">
    {publicados.map(p=><article key={p.id} className="adm-previa-prato">
     <div className="adm-previa-prato__foto">
      {produtoImagem(p)?<img src={produtoImagem(p)} alt={`Imagem do prato ${String(p.dados.nome)}`} loading="lazy"/>:
       <div className="adm-mini-sem-foto"><ImagePlus size={26}/></div>}
     </div>
     <div><strong>{String(p.dados.nome)}</strong><small>{categoriaPorId.get(String(p.dados.categoriaId))?.nome||'Sem categoria'}</small><b>{reais(valorSeguro(p))}</b></div>
    </article>)}
   </div>:<div className="adm-categorias__vazio">Nenhum prato real foi publicado em uma categoria ativa.</div>)}
  </section>
  {editando&&<div className="adm-sobreposicao" onClick={e=>{if(e.target===e.currentTarget&&!salvando)setEditando(null);}}>
   <section className="adm-modal adm-modal--produto" role="dialog" aria-modal="true" aria-labelledby="adm-editor-prato-titulo">
    <div className="adm-modal__topo"><div><span className="adm-kicker">EDIÇÃO DE CARDÁPIO</span><h3 id="adm-editor-prato-titulo">{produtos.some(p=>p.id===editando.id)?'Editar prato':'Cadastrar novo prato'}</h3></div>
     <button type="button" onClick={()=>setEditando(null)} aria-label="Fechar editor" disabled={salvando}><X size={21}/></button>
    </div>
    <form className="adm-form" onSubmit={e=>void salvar(e)}>
     <label>Nome do prato *<input required maxLength={120} minLength={2} value={editando.nome} onChange={e=>setEditando({...editando,nome:e.target.value})} placeholder="Digite o nome oficial do prato"/></label>
     <label>Descrição<textarea rows={3} value={editando.descricao} onChange={e=>setEditando({...editando,descricao:e.target.value})} placeholder="Ingredientes, acompanhamentos e informações relevantes"/></label>
     <div className="adm-duas-colunas">
      <label>Preço (R$) *<input required inputMode="decimal" value={editando.preco} onChange={e=>setEditando({...editando,preco:e.target.value})} placeholder="Ex.: 35,90"/></label>
      <label>Categoria *<select required value={editando.categoriaId} onChange={e=>setEditando({...editando,categoriaId:e.target.value})}>
       {ordenadas.map(c=><option key={c.id} value={c.id}>{c.nome}{!c.ativa?' (oculta)':''}</option>)}
      </select></label>
     </div>
     <EditorFoto produtoId={editando.id} foto={editando.foto} nome={editando.nome}
      onSalvar={url=>setEditando(v=>v?{...v,foto:url,imagemIlustrativa:false}:v)}/>
     <label>URL externa da foto (opcional)<input value={editando.foto} onChange={e=>setEditando({...editando,foto:e.target.value})} placeholder="https://site.com/imagem.webp"/></label>
     <label>Ordem de exibição<input type="number" min={0} step={1} value={editando.ordem} onChange={e=>setEditando({...editando,ordem:Number(e.target.value)})}/></label>
     <EditorOpcoes variacoes={editando.variacoes} opcionais={editando.opcionais}
      onVariacoes={v=>setEditando({...editando,variacoes:v})} onOpcionais={v=>setEditando({...editando,opcionais:v})}/>
     <div className="adm-checkboxes">
      <label><input type="checkbox" checked={editando.disponivel} onChange={e=>setEditando({...editando,disponivel:e.target.checked})}/> Disponível para pedir</label>
      <label><input type="checkbox" checked={editando.destaque} onChange={e=>setEditando({...editando,destaque:e.target.checked})}/> Destaque da casa</label>
      <label><input type="checkbox" checked={editando.exemplo} onChange={e=>setEditando({...editando,exemplo:e.target.checked})}/> Produto demonstrativo</label>
      <label><input type="checkbox" checked={editando.imagemIlustrativa} onChange={e=>setEditando({...editando,imagemIlustrativa:e.target.checked})}/> Foto ilustrativa</label>
      <label><input type="checkbox" checked={editando.publicado} onChange={e=>setEditando({...editando,publicado:e.target.checked})}/> Publicar na loja</label>
     </div>
     {editando.publicado&&<p className="adm-aviso"><AlertTriangle size={18}/> Ao salvar como publicado, os dados aparecerão na vitrine quando a opção "Usar cardápio do painel" estiver ativada.</p>}
     {erro&&<p className="adm-erro" role="alert">{erro}</p>}
     <div className="adm-editor-rodape">
      <button type="button" className="adm-btn adm-btn--secundario" disabled={salvando} onClick={()=>setEditando(null)}>Cancelar</button>
      <button type="submit" className="adm-btn" disabled={salvando}><Save size={18}/>{salvando?'Salvando...':editando.publicado?'Salvar e publicar':'Salvar rascunho'}</button>
     </div>
    </form>
   </section>
  </div>}
 </section>;
}
