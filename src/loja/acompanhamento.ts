import type {PedidoStatus} from '../admin/backend';
import type {TipoPedido} from './types';

export type ReferenciaPedido={codigo:string;chave:string};
export type EstadoPedido={status:PedidoStatus;modalidade:TipoPedido;pagamento_status:'pendente'|'pago'|'estornado'};

export function lerReferenciaPedido(valor:string):ReferenciaPedido|null{
 const trecho=valor.trim().split('#').at(-1);
 const resultado=trecho?.match(/^pedido\/(SC-[0-9]{8}-[A-Z0-9]{4,8})\/([0-9a-f]{32})$/);
 return resultado?{codigo:resultado[1],chave:resultado[2]}:null;
}

export function linkAcompanhamento({codigo,chave}:ReferenciaPedido){
 return `${window.location.origin}${import.meta.env.BASE_URL}#pedido/${codigo}/${chave}`;
}

export async function hashChaveRastreio(chave:string){
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(chave));
 return Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function etapasPedido(modalidade:TipoPedido):{id:PedidoStatus;nome:string}[]{
 const etapas:{id:PedidoStatus;nome:string}[]=[
  {id:'aguardando_confirmacao',nome:'Aguardando confirmação'},
  {id:'recebido',nome:'Pedido confirmado'},
  {id:'em_preparo',nome:'Preparando seu pedido'}
 ];
 etapas.push({id:'pronto',nome:modalidade==='entrega'?'Pronto para entrega':modalidade==='retirada'?'Pronto para retirar':'Pronto para servir'});
 if(modalidade==='entrega')etapas.push({id:'saiu_entrega',nome:'Saiu para entrega'});
 etapas.push({id:'entregue',nome:modalidade==='retirada'?'Pedido retirado':'Pedido entregue'});
 return etapas;
}
