/**
 * Adaptador entre o arquivo JSON (editável por quem cuida da loja) e a interface.
 * "PREENCHER" nunca é apresentado ao cliente nem vira valor zero por acidente.
 */
import dados from '../data/config.json';
export const temValor = (valor:unknown):valor is string =>
 typeof valor === 'string' && valor.trim().length>0 && valor.trim().toUpperCase()!=='PREENCHER';
export const valorNumerico = (valor:unknown):number|null =>
 typeof valor==='number' && Number.isFinite(valor) && valor>=0 ? valor : null;
const endereco=dados.endereco;
const numero=temValor(endereco.numero)?`, ${endereco.numero.trim()}`:'';
export const loja={
 nome:dados.nome,
 nomeCurto:dados.nomeCurto,
 unidade:dados.unidade,
 whatsapp:dados.whatsapp,
 telefone:dados.telefone,
 telefoneLink:`tel:+${dados.whatsapp}`,
 endereco:`${endereco.logradouro}${numero}, ${endereco.bairro}, ${endereco.cidade} – ${endereco.uf}`,
 enderecoNumero:temValor(endereco.numero)?endereco.numero:null,
 cep:endereco.cep,
 cidadeAtendimento:endereco.cidade,
 ufAtendimento:endereco.uf,
 mapsUrl:dados.googleMapsUrl,
 instagram:temValor(dados.instagram)?dados.instagram:'',
 avaliacoesGoogleUrl:temValor(dados.avaliacoesGoogleUrl)?dados.avaliacoesGoogleUrl:'',
 heroFoto:temValor(dados.heroFoto)?dados.heroFoto:'',
 heroImagemIlustrativa:dados.heroImagemIlustrativa,
 fotosEspaco:[
  {id:'fachada',nome:'Fachada',foto:temValor(dados.galeria.fachada)?dados.galeria.fachada:''},
  {id:'salao',nome:'Salão',foto:temValor(dados.galeria.salao)?dados.galeria.salao:''}
 ].filter(item=>item.foto),
 sobre:temValor(dados.sobre)?dados.sobre:'',
 tempoMedioMinutos:valorNumerico(dados.tempoMedioEntregaMinutos),
 pedidosOnlineAtivos:dados.pedidosOnlineAtivos,
 taxaEntregaFixa:valorNumerico(dados.taxaEntregaFixa),
 pedidoMinimoDelivery:valorNumerico(dados.pedidoMinimoDelivery),
 bairrosAtendidos:dados.bairrosAtendidos.filter(temValor),
 formasPagamento:dados.formasPagamento,
 chavePix:temValor(dados.chavePix)?dados.chavePix:'',
 faixaPreco:temValor(dados.faixaPreco)?dados.faixaPreco:'',
 horarios:dados.horarios,
 siteUrl:dados.siteUrl
};
export const logoUrl=`${import.meta.env.BASE_URL}assets/aistudio/logo_casa_do_norte_108ee79c.jpg`;
