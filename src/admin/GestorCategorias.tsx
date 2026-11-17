import {useState,type FormEvent} from 'react';
import {FolderPlus,Pencil,Trash2,Check,X,Eye,EyeOff,Save,Layers3} from 'lucide-react';
import {supabase,erroLegivel,type CategoriaAdmin,type ProdutoAdmin} from './backend';

const nomeNormalizado=(valor:string)=>valor.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
type Props={categorias:CategoriaAdmin[];produtos:ProdutoAdmin[];atualizar:()=>Promise<void>};
export function GestorCategorias({categorias,produtos,atualizar}:Props){
 const [nome,setNome]=useState(''),[editando,setEditando]=useState<string|null>(null);
 const [novoNome,setNovoNome]=useState(''),[novaOrdem,setNovaOrdem]=useState(0);
 const [erro,setErro]=useState(''),[salvando,setSalvando]=useState(false);
 const quantidade=(id:string)=>produtos.filter(p=>p.dados.categoriaId===id).length;
 const nomeEmUso=(titulo:string,id?:string)=>categorias.some(c=>c.id!==id&&nomeNormalizado(c.nome)===nomeNormalizado(titulo));
 const criar=async(e:FormEvent)=>{
  e.preventDefault();setErro('');
  const titulo=nome.trim();
  if(titulo.length<2||titulo.length>90){setErro('O nome da categoria precisa ter de 2 a 90 caracteres.');return;}
  if(nomeEmUso(titulo)){setErro('Já existe uma categoria com esse nome.');return;}
  setSalvando(true);
  const ordem=Math.max(0,...categorias.map(c=>c.ordem))+1;
  const {error}=await supabase!.from('sc_categorias').insert({
   id:`cat-${crypto.randomUUID().slice(0,16)}`,nome:titulo,ordem,ativa:true
  });
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  setNome('');await atualizar();
 };
 const editar=(categoria:CategoriaAdmin)=>{
  setEditando(categoria.id);setNovoNome(categoria.nome);setNovaOrdem(categoria.ordem);setErro('');
 };
 const salvar=async(categoria:CategoriaAdmin)=>{
  const titulo=novoNome.trim();
  if(titulo.length<2||titulo.length>90){setErro('Informe um nome de 2 a 90 caracteres.');return;}
  if(nomeEmUso(titulo,categoria.id)){setErro('Já existe uma categoria com esse nome.');return;}
  if(!Number.isInteger(novaOrdem)||novaOrdem<0){setErro('A ordem deve ser um número inteiro não negativo.');return;}
  setSalvando(true);setErro('');
  const {error}=await supabase!.from('sc_categorias').update({
   nome:titulo,ordem:novaOrdem,atualizado_em:new Date().toISOString()
  }).eq('id',categoria.id);
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  setEditando(null);await atualizar();
 };
 const alternar=async(categoria:CategoriaAdmin)=>{
  setErro('');setSalvando(true);
  const {error}=await supabase!.from('sc_categorias').update({
   ativa:!categoria.ativa,atualizado_em:new Date().toISOString()
  }).eq('id',categoria.id);
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  await atualizar();
 };
 const excluir=async(categoria:CategoriaAdmin)=>{
  const qtd=quantidade(categoria.id);
  if(qtd){setErro(`A categoria "${categoria.nome}" tem ${qtd} item(ns). Mova ou exclua esses pratos antes de apagar a categoria.`);return;}
  if(!window.confirm(`Excluir a categoria "${categoria.nome}"? Esta ação não pode ser desfeita.`))return;
  setErro('');setSalvando(true);
  const {error}=await supabase!.from('sc_categorias').delete().eq('id',categoria.id);
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  await atualizar();
 };
 return <section className="adm-card adm-categorias" aria-labelledby="gerenciar-categorias">
  <div className="adm-categorias__topo">
   <div><h3 id="gerenciar-categorias"><Layers3 size={20}/> Categorias do cardápio</h3>
    <p className="adm-pequeno">Crie grupos como Pratos, Porções ou Bebidas. Você escolhe os nomes, a ordem e quais aparecem ao público.</p>
   </div>
   <span className="adm-chip">{categorias.length} categoria(s)</span>
  </div>
  <form onSubmit={e=>void criar(e)} className="adm-categorias__nova">
   <label htmlFor="nova-categoria-nome">Nome da nova categoria
    <input id="nova-categoria-nome" required minLength={2} maxLength={90} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Pratos executivos"/>
   </label>
   <button type="submit" className="adm-btn" disabled={salvando}><FolderPlus size={18}/> Criar categoria</button>
  </form>
  {erro&&<p className="adm-erro" role="alert">{erro}</p>}
  {categorias.length===0?
   <div className="adm-categorias__vazio">Seu novo cardápio começa aqui. Cadastre uma categoria para adicionar o primeiro prato.</div>:
   <div className="adm-categorias__lista">
    {[...categorias].sort((a,b)=>a.ordem-b.ordem||a.nome.localeCompare(b.nome,'pt-BR')).map(c=>
     <article key={c.id} className="adm-categoria-linha">
      {editando===c.id?<div className="adm-categoria-linha__form">
       <label>Nome<input value={novoNome} maxLength={90} onChange={e=>setNovoNome(e.target.value)}/></label>
       <label>Ordem<input type="number" min="0" step="1" value={novaOrdem} onChange={e=>setNovaOrdem(Number(e.target.value))}/></label>
       <button type="button" className="adm-categoria-linha__acao" disabled={salvando} onClick={()=>void salvar(c)} aria-label="Salvar categoria"><Save size={19}/></button>
       <button type="button" className="adm-categoria-linha__acao" onClick={()=>setEditando(null)} aria-label="Cancelar edição"><X size={19}/></button>
      </div>:<>
       <div className="adm-categoria-linha__nome">
        <span className="adm-categoria-linha__numero">{String(c.ordem).padStart(2,'0')}</span>
        <div><b>{c.nome}</b><small>{quantidade(c.id)} prato(s) · {c.ativa?'Visível quando o cardápio estiver publicado':'Oculta do público'}</small></div>
       </div>
       <div className="adm-categoria-linha__acoes">
        <button type="button" className="adm-categoria-linha__acao" disabled={salvando} onClick={()=>editar(c)} title="Renomear ou alterar ordem" aria-label={`Editar categoria ${c.nome}`}><Pencil size={18}/></button>
        <button type="button" className="adm-categoria-linha__acao" disabled={salvando} onClick={()=>void alternar(c)} title={c.ativa?'Ocultar categoria':'Mostrar categoria'} aria-label={`${c.ativa?'Ocultar':'Mostrar'} categoria ${c.nome}`}>{c.ativa?<Eye size={18}/>:<EyeOff size={18}/>}</button>
        <button type="button" className="adm-categoria-linha__acao adm-categoria-linha__acao--excluir" disabled={salvando||quantidade(c.id)>0} onClick={()=>void excluir(c)} title={quantidade(c.id)>0?'Mova os pratos antes de excluir':'Excluir categoria'} aria-label={`Excluir categoria ${c.nome}`}><Trash2 size={18}/></button>
       </div>
      </>}
     </article>)}
   </div>}
 </section>;
}
