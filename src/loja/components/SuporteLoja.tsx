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

export function SuporteLoja(){
 const [chave,setChave]=useState(obterChave);
 const [conversa,setConversa]=useState<Conversa>(conversaVazia);
 const [carregando,setCarregando]=useState(Boolean(chave));
 const [nome,setNome]=useState('');
 const [texto,setTexto]=useState('');
 const [enviando,setEnviando]=useState(false);
 const [erro,setErro]=useState('');
 const [falhaAtualizacao,setFalhaAtualizacao]=useState(false);
 const leitura=useRef(0);
 const envio=useRef<{texto:string;id:string}|null>(null);
 const campo=useRef<HTMLTextAreaElement>(null);

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
   if(tentativa===leitura.current)setFalhaAtualizacao(true);
  }
 },[chave]);
 useEffect(()=>()=>{leitura.current++;},[]);
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
   setConversa(data as Conversa);
   setCarregando(false);
   setFalhaAtualizacao(false);
   setTexto('');
   envio.current=null;
  }catch{setErro(erroEnvio);}
  finally{setEnviando(false);campo.current?.focus();}
 }

 return <section className="container-padrao suporte-loja" aria-labelledby="suporte-titulo">
  <h1 className="titulo-pagina" id="suporte-titulo"><MessageCircle size={28} aria-hidden="true"/> Suporte</h1>
  <p>Envie sua dúvida à equipe do Santa Cruz e volte a esta página, no mesmo navegador, para acompanhar a resposta.</p>
  <div className="suporte-chat">
   {carregando&&<p role="status">{falhaAtualizacao?'Estamos tentando reconectar à sua conversa.':'Carregando conversa…'}</p>}
   {conversa.existe&&<MensagensSuporte mensagens={conversa.mensagens} nomeCliente={nome} autorLocal="cliente"/>}
   {falhaAtualizacao&&!carregando&&<p className="suporte-nota" role="status">A conversa está sem conexão. Vamos tentar atualizar novamente.</p>}
   {!carregando&&<form className="suporte-form" onSubmit={evento=>void enviar(evento)}>
    {!conversa.existe&&<label>Seu nome<input value={nome} onChange={e=>setNome(e.target.value)} maxLength={60} autoComplete="name" required disabled={enviando}/></label>}
    <label>Sua mensagem<textarea ref={campo} value={texto} onChange={e=>setTexto(e.target.value)} rows={3} maxLength={1500} required disabled={enviando}/></label>
    {erro&&<p role="alert" className="suporte-erro">{erro}</p>}
    <button type="submit" className="botao botao--rosa" disabled={enviando||!texto.trim()||(!conversa.existe&&!nome.trim())}>
     <Send size={18} aria-hidden="true"/> {enviando?'Enviando…':'Enviar mensagem'}
    </button>
   </form>}
  </div>
 </section>;
}
