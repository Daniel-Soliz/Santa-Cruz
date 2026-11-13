import { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, Check, Info } from 'lucide-react';
import type { LinhaCarrinho, Produto } from '../types';
import { dinheiro, reais } from '../pedido';
import { FotoPrato } from './ProdutoCard';

export function ProdutoModal({produto,linha,fechar,salvar}:{produto:Produto;linha?:LinhaCarrinho|null;fechar:()=>void;salvar:(item:LinhaCarrinho,antiga?:string)=>void}){
 const [quantidade,setQuantidade]=useState(linha?.quantidade||1);
 const [variacao,setVariacao]=useState(linha?.variacaoId||produto.variacoes[0]?.id||'');
 const [opcionais,setOpcionais]=useState<string[]>(linha?.opcionaisIds||[]);
 const [observacao,setObservacao]=useState(linha?.observacao||'');
 const inicio=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';inicio.current?.focus();
  function onKey(e:KeyboardEvent){if(e.key==='Escape')fechar();}
  window.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey);};
 },[fechar]);
 const precoBase=produto.preco+(produto.variacoes.find(v=>v.id===variacao)?.acrescimo||0);
 const extras=produto.opcionais.filter(op=>opcionais.includes(op.id)).reduce((s,o)=>s+o.preco,0);
 const unitario=dinheiro(precoBase+extras);
 const confirmar=()=>{
  if(!produto.disponivel)return;
  const registro:LinhaCarrinho={
   chave:linha?.chave||((typeof crypto!=='undefined'&&'randomUUID'in crypto)?crypto.randomUUID():`item-${Date.now()}-${Math.random()}`),
   produtoId:produto.id,quantidade,variacaoId:variacao,opcionaisIds:opcionais,
   observacao:observacao.trim().slice(0,250)
  };
  salvar(registro,linha?.chave);fechar();
 };
 return <div className="sobreposicao" onMouseDown={e=>{if(e.currentTarget===e.target)fechar();}}>
  <section className="modal-produto" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
   <div className="modal-produto__imagem">
    <FotoPrato foto={produto.foto} nome={produto.nome}/>
    <button ref={inicio} className="fechar-modal" type="button" onClick={fechar} aria-label="Fechar detalhes"><X size={22}/></button>
   </div>
   <div className="modal-produto__conteudo">
    <span className="micro-label">Monte do seu jeito</span>
    <h2 id="modal-titulo">{produto.nome}</h2>
    <p>{produto.descricao}</p>
    {produto.exemplo&&<div className="aviso-demo-inline"><Info size={16}/> Produto e preço ilustrativos; confirmar com a equipe.</div>}
    {produto.variacoes.length>0&&<fieldset className="campo-grupo"><legend>Escolha o tamanho</legend>
     <div className="selecoes">{produto.variacoes.map(v=><label key={v.id} className={`selecao ${variacao===v.id?'selecao--ativa':''}`}>
      <input type="radio" name="tamanho" checked={variacao===v.id} onChange={()=>setVariacao(v.id)}/>
      <span>{v.nome}</span><b>{v.acrescimo>0?`+ ${reais(v.acrescimo)}`:'Incluso'}</b>
     </label>)}</div></fieldset>}
    {produto.opcionais.length>0&&<fieldset className="campo-grupo"><legend>Personalize o prato <small>(opcional)</small></legend>
     <div className="selecoes">{produto.opcionais.map(o=><label key={o.id} className={`selecao ${opcionais.includes(o.id)?'selecao--ativa':''}`}>
      <input type="checkbox" checked={opcionais.includes(o.id)} onChange={e=>setOpcionais(atual=>e.target.checked?[...atual,o.id]:atual.filter(id=>id!==o.id))}/>
      <span>{o.nome}</span><b>{o.preco?`+ ${reais(o.preco)}`:'Grátis'}</b>
     </label>)}</div></fieldset>}
    <label className="campo-grupo">Observações do prato <small>(opcional)</small>
     <textarea rows={2} maxLength={250} value={observacao} onChange={e=>setObservacao(e.target.value)} placeholder="Ex.: sem cebola, molho separado" aria-label="Observações deste prato"/>
    </label>
    <div className="modal-produto__rodape">
     <div className="controle-quantidade">
      <button type="button" aria-label="Diminuir quantidade" disabled={quantidade<=1} onClick={()=>setQuantidade(Math.max(1,quantidade-1))}><Minus size={19}/></button>
      <strong aria-live="polite">{quantidade}</strong>
      <button type="button" aria-label="Aumentar quantidade" disabled={quantidade>=99} onClick={()=>setQuantidade(Math.min(99,quantidade+1))}><Plus size={19}/></button>
     </div>
     <button type="button" className="botao botao--rosa" onClick={confirmar}><Check size={19}/> {linha?'Atualizar':'Adicionar'} · {reais(dinheiro(quantidade*unitario))}</button>
    </div>
   </div>
  </section>
 </div>;
}
