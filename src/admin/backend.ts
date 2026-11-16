import {createClient} from '@supabase/supabase-js';

/**
 * Apenas URL e chave publicável podem ser expostas no GitHub Pages.
 * Nunca utilize service_role, chave secreta ou senha neste frontend.
 */
const url=(import.meta.env.VITE_SUPABASE_URL||'').trim();
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'').trim();
export const backendConfigurado=Boolean(
 /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)&&
 (key.startsWith('sb_publishable_')||key.startsWith('eyJ'))
);
export const supabase=backendConfigurado?
 createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;

export type PedidoStatus='aguardando_confirmacao'|'recebido'|'em_preparo'|'pronto'|'saiu_entrega'|'entregue'|'cancelado';
export interface PedidoAdmin{
 id:string;codigo:string;cliente_nome:string;telefone:string|null;
 modalidade:'entrega'|'retirada'|'local';total_centavos:number;
 origem?:'site'|'manual'|'whatsapp';forma_pagamento?:string|null;
 pagamento_status?:'pendente'|'pago'|'estornado';
 status:PedidoStatus;itens:unknown[];observacoes:string|null;
 criado_em:string;atualizado_em:string;
}
export interface ConfiguracaoAdmin{
 id:string;catalogo_publicado:boolean;pedidos_ativos:boolean;
 taxa_entrega:number|null;pedido_minimo:number|null;
 bairros_atendidos:string[];formas_pagamento?:{pix:boolean;cartao:boolean;dinheiro:boolean};atualizado_em?:string;
}
export interface CategoriaAdmin{
 id:string;nome:string;ordem:number;ativa:boolean;atualizado_em?:string;
}
export interface ProdutoAdmin{ id:string;dados:Record<string,unknown>;publicado:boolean;ordem:number;atualizado_em?:string }
export const reais=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
export function erroLegivel(error:unknown){
 const message=(error instanceof Error?error.message:String(error));
 if(/relation.*does not exist|Could not find the table|schema cache|PGRST205/.test(message))
  return 'Banco não preparado. Execute o SQL de instalação indicado no README.';
 if(/JWT|not authenticated|permission denied|row-level security|42501/i.test(message))
  return 'Acesso sem permissão. Verifique seu usuário administrador e as regras RLS.';
 return message||'Não foi possível concluir a operação.';
}
