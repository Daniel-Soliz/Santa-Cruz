import { somenteNumeros, reais } from './pedido';

export type DadosEntrega={
 pedidosOnlineAtivos:boolean;
 taxaEntregaFixa:number|null;
 pedidoMinimoDelivery:number|null;
 bairrosAtendidos:readonly string[];
};
export type EnderecoCep={cep:string;rua:string;bairro:string;cidade:string;uf:string};
export type Cobertura={estado:'disponivel'|'indisponivel'|'nao-atendido'|'verificar-bairro';mensagem:string};

export function normalizarBairro(texto:string){
 return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
}
export function entregaConfigurada(config:DadosEntrega):boolean{
 return config.pedidosOnlineAtivos
  &&config.taxaEntregaFixa!==null&&Number.isFinite(config.taxaEntregaFixa)&&config.taxaEntregaFixa>=0
  &&config.pedidoMinimoDelivery!==null&&Number.isFinite(config.pedidoMinimoDelivery)&&config.pedidoMinimoDelivery>=0
  &&config.bairrosAtendidos.some(b=>!!normalizarBairro(b));
}
export function avaliarCobertura(bairro:string,config:DadosEntrega):Cobertura{
 if(!entregaConfigurada(config))return {
  estado:'indisponivel',
  mensagem:'A entrega online não está disponível no momento. Você ainda pode pedir para retirada ou consumo no local.'
 };
 if(!normalizarBairro(bairro))return {
  estado:'verificar-bairro',
  mensagem:'CEP localizado. Confirme o bairro para verificar a área de entrega.'
 };
 if(!config.bairrosAtendidos.some(b=>normalizarBairro(b)===normalizarBairro(bairro)))return {
  estado:'nao-atendido',
  mensagem:'Esse bairro não está na área de entrega cadastrada. Você pode escolher retirada.'
 };
 return {
  estado:'disponivel',
  mensagem:`Bairro atendido! Taxa de entrega: ${reais(config.taxaEntregaFixa!)}. Pedido mínimo: ${reais(config.pedidoMinimoDelivery!)}. Valores sujeitos à confirmação pelo restaurante.`
 };
}

/** ViaCEP só preenche endereço; não comprova que a entrega é atendida. */
export async function consultarCep(entrada:string,obter:typeof fetch=fetch):Promise<EnderecoCep>{
 const cep=somenteNumeros(entrada);
 if(!/^\d{8}$/.test(cep))throw new Error('Informe um CEP válido com 8 números.');
 const resposta=await obter(`https://viacep.com.br/ws/${cep}/json/`,{headers:{Accept:'application/json'}});
 if(!resposta.ok)throw new Error('Não foi possível consultar o CEP. Tente novamente.');
 const dados=await resposta.json() as Record<string,unknown>;
 if(dados.erro===true)throw new Error('CEP não encontrado. Confira os números digitados.');
 const ler=(campo:string)=>typeof dados[campo]==='string'?dados[campo] as string:'';
 return {cep,rua:ler('logradouro'),bairro:ler('bairro'),cidade:ler('localidade'),uf:ler('uf')};
}
