import {Plus,Trash2} from 'lucide-react';
import type {Variacao,Opcional} from '../loja/types';
import {reais} from '../loja/pedido';
const novoId=()=>crypto.randomUUID().slice(0,12);
const porcoes=['Individual','Para 2 pessoas'] as const;
export function EditorOpcoes({precoBase,variacoes,opcionais,onVariacoes,onOpcionais}:{
 precoBase:number|null;variacoes:Variacao[];opcionais:Opcional[];
 onVariacoes:(v:Variacao[])=>void;onOpcionais:(v:Opcional[])=>void;
}){
 return <section className="adm-editor-opcoes">
  <div><h4>Porções e tamanhos</h4><p className="adm-pequeno">Escolha as opções do cliente. O preço final soma o preço base ao acréscimo da porção.</p>
   <div className="adm-atalhos-porcoes">{porcoes.map(nome=><button type="button" className="adm-btn adm-btn--secundario" key={nome}
    disabled={variacoes.some(v=>v.nome.trim().toLocaleLowerCase('pt-BR')===nome.toLocaleLowerCase('pt-BR'))}
    onClick={()=>onVariacoes([...variacoes,{id:novoId(),nome,acrescimo:0}])}><Plus size={17}/> {nome}</button>)}</div>
   {variacoes.map((v,i)=><div key={v.id} className="adm-editor-opcoes__linha">
    <label>Nome<input value={v.nome} onChange={e=>onVariacoes(variacoes.map((x,j)=>i===j?{...x,nome:e.target.value}:x))} placeholder="Individual / Serve 2"/></label>
    <label>Acréscimo (R$)<input type="number" inputMode="decimal" min="0" step=".01" value={v.acrescimo} onChange={e=>onVariacoes(variacoes.map((x,j)=>i===j?{...x,acrescimo:Number(e.target.value)}:x))}/>{precoBase!==null&&<small>Preço final: {reais(precoBase+v.acrescimo)}</small>}</label>
    <button type="button" aria-label={`Excluir tamanho ${v.nome}`} onClick={()=>onVariacoes(variacoes.filter((_,j)=>i!==j))}><Trash2 size={19}/></button>
   </div>)}
   <button type="button" className="adm-btn adm-btn--secundario" onClick={()=>onVariacoes([...variacoes,{id:novoId(),nome:'',acrescimo:0}])}><Plus size={17}/> Adicionar tamanho</button>
  </div>
  <div><h4>Adicionais e opções</h4><p className="adm-pequeno">Exemplo: ovo extra, farofa ou sem pimenta. Para retirar um ingrediente, use preço zero.</p>
   {opcionais.map((o,i)=><div key={o.id} className="adm-editor-opcoes__linha">
    <label>Nome<input value={o.nome} onChange={e=>onOpcionais(opcionais.map((x,j)=>i===j?{...x,nome:e.target.value}:x))} placeholder="Farofa extra"/></label>
    <label>Valor (R$)<input type="number" inputMode="decimal" min="0" step=".01" value={o.preco} onChange={e=>onOpcionais(opcionais.map((x,j)=>i===j?{...x,preco:Number(e.target.value)}:x))}/></label>
    <button type="button" aria-label={`Excluir opcional ${o.nome}`} onClick={()=>onOpcionais(opcionais.filter((_,j)=>i!==j))}><Trash2 size={19}/></button>
   </div>)}
   <button type="button" className="adm-btn adm-btn--secundario" onClick={()=>onOpcionais([...opcionais,{id:novoId(),nome:'',preco:0}])}><Plus size={17}/> Adicionar opcional</button>
  </div>
 </section>;
}