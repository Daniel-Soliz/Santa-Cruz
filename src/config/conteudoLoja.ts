import {loja} from './loja';
import avaliacoes from '../data/avaliacoes.json';

export const conteudoPadrao={
 nomeCurto:loja.nomeCurto,unidade:loja.unidade,logo:'assets/aistudio/logo_casa_do_norte_108ee79c.jpg',
 etiquetaHero:'Casa do Norte · Santa Cruz',tituloHero:'Da nossa cozinha para a',
 destaqueHero:'sua mesa.',textoHero:'Comida nordestina feita com carinho, na unidade Santa Cruz.',
 botaoHero:'Ver cardápio e pedir',heroFoto:loja.heroFoto,heroImagemIlustrativa:loja.heroImagemIlustrativa,
 tituloDestaques:'Destaques da casa',tituloCardapio:'Nosso cardápio',mostrarDestaques:true,
 textoDestaques:'Pratos escolhidos para destacar no cardápio.',
 tituloInformacoes:'Tudo claro, do início ao fim',mostrarInformacoes:true,
 tituloSobre:'Sobre a Casa do Norte',sobre:loja.sobre,
 fraseSobre:'Sabor que aproxima.',
 tituloLocal:'Um pedacinho do Nordeste em São Paulo.',textoLocal:'Venha conhecer a Casa do Norte · Unidade Santa Cruz.',
 endereco:loja.endereco,cep:loja.cep,whatsapp:loja.whatsapp,telefone:loja.telefone,
 instagram:loja.instagram,avaliacoesGoogleUrl:loja.avaliacoesGoogleUrl,
 tituloAvaliacoes:'Quem prova, conta!',mostrarAvaliacoes:true,avaliacoes,horarios:loja.horarios,
 tituloGaleria:'Nosso espaço',fachada:loja.fotosEspaco.find(f=>f.id==='fachada')?.foto||'',
 salao:loja.fotosEspaco.find(f=>f.id==='salao')?.foto||'',
 mostrarComoPedir:true,tituloComoPedir:'Seu pedido em 3 passos',
 textoComoPedir:'Escolha no site, envie no WhatsApp e aguarde a confirmação.',
 passoCardapioTitulo:'Escolha seus pratos',passoCardapioTexto:'Explore o cardápio, escolha o tamanho e adicione observações.',
 passoSacolaTitulo:'Confira a sacola',passoSacolaTexto:'Escolha entrega ou retirada e informe a forma de pagamento.',
 passoConfirmacaoTitulo:'Envie para confirmar',passoConfirmacaoTexto:'O site prepara sua mensagem. Envie no WhatsApp e aguarde a equipe.',
 textoRodape:'Comida nordestina feita com carinho, pertinho de você.',
 tituloAtendimento:'Atendimento',textoSuporte:'WhatsApp para dúvidas'
};
export type ConteudoLoja=typeof conteudoPadrao;

const textosObrigatorios=['nomeCurto','unidade','tituloHero','botaoHero','tituloCardapio','tituloLocal','endereco','cep','telefone'] as const;
const camposImagem=['logo','heroFoto','fachada','salao'] as const;
const camposLink=['instagram','avaliacoesGoogleUrl'] as const;
const horaValida=(valor:unknown):valor is string=>typeof valor==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(valor);
const numeroWhatsApp=(texto:string)=>texto.replace(/\D/g,'');
function telefoneDiscavel(valor:string){
 const digitos=numeroWhatsApp(valor);
 if(/^55\d{10,11}$/.test(digitos))return digitos;
 return /^\d{10,11}$/.test(digitos)?`55${digitos}`:'';
}
const urlHttps=(valor:string)=>{
 try{return new URL(valor).protocol==='https:';}catch{return false;}
};
const caminhoImagem=(valor:string)=>/^assets\/[\w./-]+$/.test(valor)&&!valor.split('/').includes('..');
export const imagemPublica=(foto:string)=>!foto||urlHttps(foto)?foto:
 caminhoImagem(foto)?`${import.meta.env?.BASE_URL??'/'}${foto}`:'';

export function validarConteudo(conteudo:ConteudoLoja){
 if(textosObrigatorios.some(campo=>!conteudo[campo].trim()))return 'Preencha o nome, unidade, títulos principais, endereço, CEP e telefone.';
 if(conteudo.horarios.some(h=>h.aberto&&(!horaValida(h.abertura)||!horaValida(h.fechamento)||h.abertura>=h.fechamento)))return 'O horário de fechamento deve ser posterior à abertura.';
 if(!/^\d{5}-?\d{3}$/.test(conteudo.cep))return 'Informe um CEP de oito dígitos.';
 if(!/^55\d{10,11}$/.test(numeroWhatsApp(conteudo.whatsapp)))return 'Informe o WhatsApp com 55, DDD e número.';
 if(!telefoneDiscavel(conteudo.telefone))return 'Informe o telefone de atendimento com DDD e número.';
 if(camposImagem.some(campo=>conteudo[campo]&&!urlHttps(conteudo[campo])&&!caminhoImagem(conteudo[campo])))
  return 'Use uma foto enviada pelo painel ou um endereço HTTPS.';
 if(camposLink.some(campo=>conteudo[campo]&&!urlHttps(conteudo[campo])))return 'Use links HTTPS para Instagram e avaliações.';
 return '';
}
export function lerConteudo(valor:unknown):ConteudoLoja{
 const fonte=valor&&typeof valor==='object'?valor as Record<string,unknown>:{};
 const dados={...conteudoPadrao};
 for(const campo of Object.keys(conteudoPadrao) as (keyof ConteudoLoja)[]){
  const atual=fonte[campo];
  if(typeof atual==='boolean'&&typeof conteudoPadrao[campo]==='boolean')Object.assign(dados,{[campo]:atual});
  if(typeof atual==='string'&&typeof conteudoPadrao[campo]==='string')Object.assign(dados,{[campo]:atual.trim().slice(0,1000)});
 }
 for(const campo of textosObrigatorios)if(!dados[campo])dados[campo]=conteudoPadrao[campo];
 for(const campo of camposImagem)if(dados[campo]&&!imagemPublica(dados[campo]))dados[campo]='';
 for(const campo of camposLink)if(!urlHttps(dados[campo]))dados[campo]='';
 if(!/^55\d{10,11}$/.test(numeroWhatsApp(dados.whatsapp)))dados.whatsapp=conteudoPadrao.whatsapp;
 if(!telefoneDiscavel(dados.telefone))dados.telefone=conteudoPadrao.telefone;
 if(!/^\d{5}-?\d{3}$/.test(dados.cep))dados.cep=conteudoPadrao.cep;
 const horarios=fonte.horarios;
 if(Array.isArray(horarios))dados.horarios=conteudoPadrao.horarios.map((original,i)=>{
  const horario=horarios[i];
  if(!horario||typeof horario.aberto!=='boolean'||!horaValida(horario.abertura)||!horaValida(horario.fechamento)||horario.abertura>=horario.fechamento)return original;
  return {...original,aberto:horario.aberto,abertura:horario.abertura,fechamento:horario.fechamento};
 });
 if(Array.isArray(fonte.avaliacoes))dados.avaliacoes=fonte.avaliacoes.slice(0,12).flatMap((item,i)=>{
  if(!item||typeof item.nome!=='string'||typeof item.texto!=='string'||!Number.isInteger(item.nota)||item.nota<1||item.nota>5)return [];
  const nome=item.nome.trim().slice(0,120),texto=item.texto.trim().slice(0,500);
  if(!nome||!texto)return [];
  return [{id:typeof item.id==='string'?item.id.slice(0,64):`avaliacao-${i}`,nome,texto,nota:item.nota,exemplo:item.exemplo===true}];
 });
 return dados;
}

export function aplicarConteudo(base:typeof loja,valor:unknown){
 const conteudo=lerConteudo(valor);
 const consulta=`${conteudo.endereco}, CEP ${conteudo.cep}`;
 const whatsapp=numeroWhatsApp(conteudo.whatsapp);
 return {...base,conteudo,nome:`${conteudo.nomeCurto} · ${conteudo.unidade}`,
  nomeCurto:conteudo.nomeCurto,unidade:conteudo.unidade,logo:imagemPublica(conteudo.logo),horarios:conteudo.horarios,
  whatsapp,telefone:conteudo.telefone,telefoneLink:`tel:+${telefoneDiscavel(conteudo.telefone)}`,endereco:conteudo.endereco,cep:conteudo.cep,
  mapsUrl:`https://www.google.com/maps/search/?${new URLSearchParams({api:'1',query:consulta})}`,
  mapaEmbed:`https://www.google.com/maps?${new URLSearchParams({q:consulta,output:'embed'})}`,
  instagram:conteudo.instagram,avaliacoesGoogleUrl:conteudo.avaliacoesGoogleUrl,heroFoto:imagemPublica(conteudo.heroFoto),
  heroImagemIlustrativa:conteudo.heroImagemIlustrativa,sobre:conteudo.sobre,
  fotosEspaco:[{id:'fachada',nome:'Fachada',foto:imagemPublica(conteudo.fachada)},
   {id:'salao',nome:'Salão',foto:imagemPublica(conteudo.salao)}].filter(foto=>foto.foto)
 };
}
