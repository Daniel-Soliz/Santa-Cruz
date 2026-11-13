import { ChefHat, Plus, Ban, Star } from 'lucide-react';
import type { Produto } from '../types';
import { reais } from '../pedido';

export function FotoPrato({foto,nome,destaque=false}:{foto:string;nome:string;destaque?:boolean}){
 const src=foto?(/^(https?:)?\/\//.test(foto)?foto:`${import.meta.env.BASE_URL}${foto.replace(/^\/+/, '')}`):'';
 if(!src){
  return <div className="food-placeholder" role="img" aria-label={`Imagem de ${nome} não cadastrada; PREENCHER com foto real`}>
   <div className="food-placeholder__plate"><ChefHat size={destaque?45:34} aria-hidden="true" strokeWidth={1.3}/></div>
   <span>Foto do prato: PREENCHER</span>
  </div>;
 }
 return <img src={src} loading={destaque?'eager':'lazy'} decoding="async" width="640" height="480" alt={`Foto de ${nome}`} className="food-photo"/>;
}
export function ProdutoCard({produto,abrir}:{produto:Produto;abrir:(p:Produto)=>void}){
 return <article className="produto-card">
  <div className="produto-card__imagem">
   <FotoPrato foto={produto.foto} nome={produto.nome}/>
   <div className="produto-card__etiquetas">
    {produto.exemplo&&<span className="tag tag--demo">EXEMPLO</span>}
    {produto.destaque&&<span className="tag tag--yellow"><Star size={12} aria-hidden="true"/> Destaque</span>}
   </div>
   {!produto.disponivel&&<div className="produto-card__esgotado"><Ban size={22} aria-hidden="true"/> Indisponível hoje</div>}
  </div>
  <div className="produto-card__corpo">
   <h3>{produto.nome}</h3>
   <p className="produto-card__descricao">{produto.descricao}</p>
   <div className="produto-card__inferior">
    <div><strong>{reais(produto.preco)}</strong>{produto.exemplo&&<small>Valor fictício</small>}</div>
    <button className="botao-adicionar" type="button" disabled={!produto.disponivel} onClick={()=>abrir(produto)}>
     {produto.disponivel?<><Plus size={18} aria-hidden="true"/> Adicionar</>:'Esgotado'}
    </button>
   </div>
  </div>
 </article>;
}
