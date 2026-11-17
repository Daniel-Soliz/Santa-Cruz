import { useEffect, useRef, useState } from 'react';
import { ChefHat, Plus, Ban, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Produto } from '../types';
import { reais } from '../pedido';
import { fotosDoProduto } from '../vitrine';

export function FotoPrato({foto,nome,destaque=false,ilustrativa=true}:{foto:string;nome:string;destaque?:boolean;ilustrativa?:boolean}){
 const [falhou,setFalhou]=useState(false);
 const src=foto?(/^(https?:)?\/\//.test(foto)?foto:`${import.meta.env.BASE_URL}${foto.replace(/^\/+/, '')}`):'';
 useEffect(()=>{setFalhou(false);},[src]);
 if(!src||falhou){
  return <div className="food-placeholder" role="img" aria-label={`Ilustração de ${nome}, sem fotografia disponível`}>
   <div className="food-placeholder__plate"><ChefHat size={destaque?45:34} aria-hidden="true" strokeWidth={1.3}/></div>
   <span>Sabores do Nordeste</span>
  </div>;
 }
 return <img src={src} loading={destaque?'eager':'lazy'} decoding="async" onError={()=>setFalhou(true)} width="640" height="480" alt={ilustrativa?`Imagem ilustrativa de ${nome}`:`Foto do prato ${nome}`} className="food-photo"/>;
}
export function GaleriaPrato({produto}:{produto:Produto}){
 const fotos=fotosDoProduto(produto);
 const trilho=useRef<HTMLDivElement>(null);
 const ilustrativa=produto.exemplo||produto.imagemIlustrativa===true;
 if(fotos.length<2)return <FotoPrato foto={fotos[0]||''} nome={produto.nome} ilustrativa={ilustrativa}/>;
 const mover=(direcao:number)=>{
  const el=trilho.current;
  if(!el)return;
  const atual=Math.round(el.scrollLeft/el.clientWidth);
  const indice=(atual+direcao+fotos.length)%fotos.length;
  el.scrollTo({left:indice*el.clientWidth,behavior:'instant'});
 };
 return <div className="galeria-prato" role="group" aria-label={`Fotos de ${produto.nome}`}>
  <div className="galeria-prato__trilho" ref={trilho} tabIndex={0} aria-label="Deslize para ver as fotos">
   {fotos.map((foto,i)=><div key={foto}><FotoPrato foto={foto} nome={`${produto.nome}, imagem ${i+1} de ${fotos.length}`} ilustrativa={ilustrativa}/></div>)}
  </div>
  <div className="galeria-prato__acoes">
   <button type="button" aria-label="Foto anterior" onClick={()=>mover(-1)}><ChevronLeft size={18}/></button>
   <button type="button" aria-label="Próxima foto" onClick={()=>mover(1)}><ChevronRight size={18}/></button>
  </div>
 </div>;
}
export function ProdutoCard({produto,abrir}:{produto:Produto;abrir:(p:Produto)=>void}){
 const valores=produto.variacoes.map(v=>produto.preco+v.acrescimo);
 const menorPreco=valores.length?Math.min(...valores):produto.preco;
 const temFaixa=valores.some(valor=>valor!==menorPreco);
 return <article className="produto-card">
  <div className="produto-card__imagem">
   <GaleriaPrato produto={produto}/>
   <div className="produto-card__etiquetas">
    {produto.exemplo&&<span className="tag tag--demo">EXEMPLO</span>}
    {produto.destaque&&<span className="tag tag--yellow"><Star size={12} aria-hidden="true"/> Destaque</span>}
   </div>
   {(produto.exemplo||produto.imagemIlustrativa===true)&&produto.foto&&<span className="tag-foto-ilustrativa">Foto ilustrativa</span>}
   {!produto.disponivel&&<div className="produto-card__esgotado"><Ban size={22} aria-hidden="true"/> Indisponível hoje</div>}
  </div>
  <div className="produto-card__corpo">
   <h3>{produto.nome}</h3>
   <p className="produto-card__descricao">{produto.descricao}</p>
   <div className="produto-card__inferior">
    <div>{temFaixa&&<small>A partir de</small>}<strong>{reais(menorPreco)}</strong>{produto.exemplo&&<small>Valor fictício</small>}</div>
    <button className="botao-adicionar" type="button" disabled={!produto.disponivel} onClick={()=>abrir(produto)}>
     {produto.disponivel?<><Plus size={18} aria-hidden="true"/> Adicionar</>:'Esgotado'}
    </button>
   </div>
  </div>
 </article>;
}
