import { useEffect, useRef } from 'react';
import { ArrowRight, Minus, Plus, Pencil, Trash2, X, ShoppingBag } from 'lucide-react';
import type { LinhaCarrinho, Produto } from '../types';
import { precoLinha, reais, totalCarrinho } from '../pedido';
import { FotoPrato } from './ProdutoCard';

export function Carrinho({linhas,produtos,fechar,atualizar,remover,editar,finalizar}:{linhas:LinhaCarrinho[];produtos:Produto[];fechar:()=>void;atualizar:(chave:string,delta:number)=>void;remover:(chave:string)=>void;editar:(linha:LinhaCarrinho)=>void;finalizar:()=>void}){
 const focus=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const before=document.body.style.overflow;document.body.style.overflow='hidden';focus.current?.focus();const handle=(e:KeyboardEvent)=>{if(e.key==='Escape')fechar();};window.addEventListener('keydown',handle);return()=>{document.body.style.overflow=before;window.removeEventListener('keydown',handle);};},[fechar]);
 const itens=linhas.map(l=>({linha:l,produto:produtos.find(p=>p.id===l.produtoId)})).filter(x=>!!x.produto);
 return <div className="carrinho-cortina" onMouseDown={e=>{if(e.currentTarget===e.target)fechar();}}>
  <aside role="dialog" aria-modal="true" aria-label="Sua sacola" className="carrinho-painel">
   <header className="carrinho-topo"><div><span className="micro-label">Seu pedido</span><h2>Minha sacola</h2></div><button ref={focus} aria-label="Fechar sacola" onClick={fechar} type="button" className="icone-circulo"><X size={21}/></button></header>
   <div className="carrinho-itens">
    {itens.length?itens.map(({linha,produto})=>produto&&<div className="item-sacola" key={linha.chave}>
     <div className="item-sacola__foto"><FotoPrato foto={produto.foto} nome={produto.nome}/></div>
     <div className="item-sacola__texto">
      <h3>{produto.nome}</h3>
      {linha.variacaoId&&<small>{produto.variacoes.find(v=>v.id===linha.variacaoId)?.nome}</small>}
      {linha.opcionaisIds.length>0&&<small>{produto.opcionais.filter(o=>linha.opcionaisIds.includes(o.id)).map(o=>o.nome).join(', ')}</small>}
      {linha.observacao&&<small>Obs.: {linha.observacao}</small>}
      <strong>{reais(precoLinha(linha,produto)*linha.quantidade)}</strong>
      <div className="sacola-acoes">
       <div className="controle-quantidade controle-quantidade--compacto">
        <button aria-label="Diminuir" type="button" onClick={()=>atualizar(linha.chave,-1)}><Minus size={16}/></button>
        <span>{linha.quantidade}</span>
        <button aria-label="Aumentar" type="button" disabled={linha.quantidade>=99} onClick={()=>atualizar(linha.chave,1)}><Plus size={16}/></button>
       </div>
       <button type="button" title="Editar" aria-label={`Editar ${produto.nome}`} onClick={()=>editar(linha)} className="icone-pequeno"><Pencil size={17}/></button>
       <button type="button" title="Remover" aria-label={`Remover ${produto.nome}`} onClick={()=>remover(linha.chave)} className="icone-pequeno icone-pequeno--vermelho"><Trash2 size={17}/></button>
      </div>
     </div>
    </div>):<div className="sacola-vazia"><ShoppingBag size={48} strokeWidth={1.3}/><h3>Sua sacola está vazia</h3><p>Escolha pratos no cardápio para começar.</p><button type="button" className="botao botao--rosa" onClick={fechar}>Ver cardápio</button></div>}
   </div>
   <footer className="carrinho-rodape">
    <p><span>Subtotal</span><strong>{reais(totalCarrinho(linhas,produtos))}</strong></p>
    <small>A taxa de entrega, quando disponível, aparece no checkout. Os valores dos itens demonstrativos são ilustrativos.</small>
    <button disabled={!itens.length} className="botao botao--rosa botao--full" type="button" onClick={finalizar}>Finalizar pedido <ArrowRight size={20}/></button>
   </footer>
  </aside>
 </div>;
}
