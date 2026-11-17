import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {MessageCircle,Send} from 'lucide-react';
import {supabase} from '../../admin/backend';
import {idParaEnvio,MensagensSuporte,usarAtualizacaoSuporte,type MensagemSuporte} from '../../suporte/conversa';

const chaveLocal='santa-cruz-suporte-v1';
let chaveEmMemoria='';
function obterChave(){
 try{
  const valor=localStorage.getItem(chaveLocal);
  if(valor&&/^[0-9a-f]{64}$/.test(valor))return valor;
 }catch{/* O chat continua disponível na aba aberta. */}
 return chaveEmMemoria;
}
function novaChave(){
 const valor=Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
 chaveEmMemoria=valor;
 try{localStorage.setItem(chaveLocal,valor);}catch{/* Usa a chave em memória. */}
 return valor;
}
type Conversa={existe:boolean;mensagens:MensagemSuporte[]};
const conversaVazia:Conversa={existe:false,mensagens:[]};
const erroEnvio='Não foi possível enviar. Tente novamente para manter a mensagem nesta conversa.';
const limiteMensagem=1500;
type PedidoSuporte={numero:string;nome:string;mensagem:string};

function partesDoPedido({numero,mensagem}:PedidoSuporte){
 if(mensagem.length<=limiteMensagem)return [mensagem];
 const encabecar=(parte:number)=>`Pedido #${numero} · Parte ${parte}\n\n`;
 const limite=limiteMensagem-encabecar(999).length;
 const partes:string[]=[];
 let restante=mensagem;
 while(restante.length>limite){
  let corte=restante.lastIndexOf('\n',limite);
  if(corte<=0){
   corte=limite;
   if(/[\uD800-\uDBFF]/.test(restante.charAt(corte-1)))corte--;
  }
  partes.push(restante.slice(0,corte));
  restante=restante.slice(corte).trimStart();
 }
 if(restante)partes.push(restante);
 return partes.map((parte,i)=>encabecar(i+1)+parte);
}

export function SuporteLoja({pedido}:{pedido?:PedidoSuporte}){
 const [partes]=useState(()=>pedido?partesDoPedido(pedido):[]);
 const [parte,setParte]=useState(0);
 const comPedido=Boolean(pedido);
 const pedidoPendente=parte<partes.length;
 const [chave,setChave]=useState(obterChave);
 const [conversa,setConversa]=useState<Conversa>(conversaVazia);
 const [carregando,setCarregando]=useState(Boolean(chave));
 const [nome,setNome]=useState(pedido?.nome.trim().slice(0,60)||'');
 const [texto,setTexto]=useState(partes[0]||'');
 const [enviando,setEnviando]=useState(false);
 const [erro,setErro]=useState('');
 const [falhaAtualizacao,setFalhaAtualizacao]=useState(false);
 const leitura=useRef(0);
 const envio=useRef<{texto:string;id:string}|null>(null);
 const campo=useRef<HTMLTextAreaElement>(null);
 const titulo=useRef<HTMLHeadingElement>(null);

 const atualizar=useCallback(async()=>{
  const tentativa=++leitura.current;
  try{
   const {data,error}=await supabase!.rpc('sc_suporte_cliente',{p_chave:chave});
   if(tentativa!==leitura.current)return;
   if(error)throw error;
   setConversa(data as Conversa);
   setFalhaAtualizacao(false);
   setCarregando(false);
  }catch{
   if(tentativa===leitura.current){setFalhaAtualizacao(true);setCarregando(false);}
  }
 },[chave]);
 useEffect(()=>()=>{leitura.current++;},[]);
 useEffect(()=>{if(comPedido)titulo.current?.focus();},[comPedido]);
 usarAtualizacaoSuporte(atualizar,Boolean(chave&&!enviando),6000);

 async function enviar(evento:FormEvent<HTMLFormElement>){
  evento.preventDefault();
  if(enviando||!texto.trim()||(!conversa.existe&&!nome.trim()))return;
  leitura.current++;
  const acesso=chave||novaChave();
  setChave(acesso);
  const tentativa=idParaEnvio(envio.current,texto.trim());
  envio.current=tentativa;
  setEnviando(true);
  setErro('');
  try{
   const {data,error}=await supabase!.rpc('sc_suporte_cliente',{
    p_chave:acesso,p_id:tentativa.id,p_texto:tentativa.texto,p_nome:nome.trim()||null
   });
   if(error){setErro(error.code==='P0001'?error.message:erroEnvio);return;}
   const confirmada=data as Conversa|null;
   if(!confirmada?.existe||!confirmada.mensagens.some(mensagem=>mensagem.id===tentativa.id)){
    setErro(erroEnvio);return;
   }
   setConversa(confirmada);
   setCarregando(false);
   setFalhaAtualizacao(false);
   if(pedidoPendente){
    setParte(parte+1);
    setTexto(partes[parte+1]||'');
   }else setTexto('');
   envio.current=null;
  }catch{setErro(erroEnvio);}
  finally{setEnviando(false);campo.current?.focus();}
 }

 const Titulo=comPedido?'h2':'h1';
 const idTitulo=comPedido?'suporte-pedido-titulo':'suporte-titulo';
 return <section className="container-padrao suporte-loja" aria-labelledby={idTitulo}>
  <Titulo className="titulo-pagina" id={idTitulo} ref={titulo} tabIndex={comPedido?-1:undefined}><MessageCircle size={28} aria-hidden="true"/> {comPedido?'Pedido pelo Suporte':'Suporte'}</Titulo>
  <p>{comPedido?'Confira os dados do seu pedido e envie para a equipe. Você pode acompanhar a resposta na aba Suporte, neste mesmo navegador.':'Envie sua dúvida à equipe do Santa Cruz e volte a esta página, no mesmo navegador, para acompanhar a resposta.'}</p>
  <div className="suporte-chat">
   {carregando&&<p role="status">{falhaAtualizacao?'Estamos tentando reconectar à sua conversa.':'Carregando conversa…'}</p>}
   {conversa.existe&&<MensagensSuporte mensagens={conversa.mensagens} nomeCliente={nome} autorLocal="cliente"/>}
   {comPedido&&!pedidoPendente&&<p className="suporte-nota" role="status">Pedido enviado ao Suporte. Aguarde a confirmação da equipe.</p>}
   {falhaAtualizacao&&!carregando&&<p className="suporte-nota" role="status">A conversa está sem conexão. Vamos tentar atualizar novamente.</p>}
   {!carregando&&<form className="suporte-form" onSubmit={evento=>void enviar(evento)}>
    {!conversa.existe&&<label>Seu nome<input value={nome} onChange={e=>setNome(e.target.value)} maxLength={60} autoComplete="name" required disabled={enviando}/></label>}
    <label>{pedidoPendente?'Dados do pedido':'Sua mensagem'}<textarea ref={campo} value={texto} onChange={e=>setTexto(e.target.value)} rows={pedidoPendente?8:3} maxLength={limiteMensagem} required disabled={enviando}/></label>
    {erro&&<p role="alert" className="suporte-erro">{erro}</p>}
    <button type="submit" className="botao botao--rosa" disabled={enviando||!texto.trim()||(!conversa.existe&&!nome.trim())}>
     <Send size={18} aria-hidden="true"/> {enviando?'Enviando…':pedidoPendente?(partes.length>1?`Enviar parte ${parte+1} de ${partes.length}`:'Enviar pedido'):'Enviar mensagem'}
    </button>
   </form>}
  </div>
 </section>;
}
