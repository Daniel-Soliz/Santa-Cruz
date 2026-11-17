import {useEffect,useState} from 'react';
import {Check,Clock3,CookingPot,Truck} from 'lucide-react';
import {supabase} from '../../admin/backend';
import {etapasPedido,type EstadoPedido,type ReferenciaPedido} from '../acompanhamento';
import type {TipoPedido} from '../types';

export function AcompanharPedido({referencia,tipo}:{referencia:ReferenciaPedido;tipo?:TipoPedido}){
 const {codigo,chave}=referencia;
 const [pedido,setPedido]=useState<EstadoPedido|null>(null);
 const [falhou,setFalhou]=useState(false);
 useEffect(()=>{
  if(!supabase)return;
  let ativo=true;
  let atendendo=false;
  async function consultar(){
   if(!ativo||atendendo||document.hidden)return;
   atendendo=true;
   try{
    const {data,error}=await supabase!.rpc('sc_acompanhar_pedido',{p_codigo:codigo,p_chave:chave});
    if(!ativo)return;
    if(error)throw error;
    setPedido(data as EstadoPedido|null);
    setFalhou(false);
   }catch{if(ativo)setFalhou(true);}
   finally{atendendo=false;}
  }
  void consultar();
  const timer=window.setInterval(()=>void consultar(),10000);
  document.addEventListener('visibilitychange',consultar);
  return()=>{ativo=false;window.clearInterval(timer);document.removeEventListener('visibilitychange',consultar);};
 },[codigo,chave]);

 const modalidade=pedido?.modalidade||tipo;
 const status=pedido?.status||'aguardando_confirmacao';
 const cancelado=status==='cancelado';
 const etapas=modalidade?etapasPedido(modalidade):[];
 const atual=etapas.findIndex(etapa=>etapa.id===status);
 const nome=cancelado?'Pedido cancelado':etapas[atual]?.nome||'Aguardando confirmação';
 const Icone=status==='em_preparo'?CookingPot:status==='saiu_entrega'?Truck:status==='entregue'?Check:Clock3;

 return <section className="container-padrao pedido-andamento" aria-label="Acompanhamento do pedido">
  <div className="pedido-andamento__resumo" role="status"><Icone size={25} aria-hidden="true"/><div>
   <span>Pedido {codigo}</span><h2>{nome}</h2>
   {pedido?.pagamento_status==='pago'&&<p>Pagamento confirmado pela equipe</p>}
   {pedido?.pagamento_status==='estornado'&&<p>Pagamento estornado</p>}
   {!pedido&&!falhou&&<p>A equipe atualiza o andamento após registrar o pedido.</p>}
  </div></div>
  {falhou&&<p className="pedido-andamento__aviso" role="status">Andamento temporariamente indisponível. Vamos tentar atualizar novamente.</p>}
  {status==='em_preparo'&&<div className="pedido-andamento__animacao" aria-hidden="true"/>}
  {!cancelado&&etapas.length>0&&<ol className="pedido-andamento__etapas">
   {etapas.map((etapa,indice)=>{
    const atualizada=indice<atual;
    return <li key={etapa.id} aria-current={indice===atual?'step':undefined} className={atualizada?'concluida':indice===atual?'atual':undefined}>
     <span aria-hidden="true">{atualizada?<Check size={13}/>:indice+1}</span>{etapa.nome}
    </li>;
   })}
  </ol>}
 </section>;
}
