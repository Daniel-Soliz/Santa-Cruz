import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {MessageCircle,Send,Trash2} from 'lucide-react';
import {supabase} from './backend';
import {idParaEnvio,MensagensSuporte,usarAtualizacaoSuporte,type MensagemSuporte} from '../suporte/conversa';

type Conversa={
 id:string;
 nome:string;
 pendente:boolean;
 atualizado_em:string;
};

const horario=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});

function ResponderConversa({conversa,atualizarCaixa,aoExcluir}:{
 conversa:Conversa;
 atualizarCaixa:()=>Promise<void>;
 aoExcluir:(id:string,excluida:boolean)=>void;
}){
 const [mensagens,setMensagens]=useState<MensagemSuporte[]>([]);
 const [carregando,setCarregando]=useState(true);
 const [falhaLeitura,setFalhaLeitura]=useState(false);
 const [texto,setTexto]=useState('');
 const [erroEnvio,setErroEnvio]=useState('');
 const [enviando,setEnviando]=useState(false);
 const [excluindo,setExcluindo]=useState(false);
 const [erroExclusao,setErroExclusao]=useState('');
 const leitura=useRef(0);
 const envio=useRef<{id:string;texto:string}|null>(null);
 const campo=useRef<HTMLTextAreaElement>(null);

 const atualizar=useCallback(async()=>{
  const tentativa=++leitura.current;
  try{
   const {data,error}=await supabase!.from('sc_suporte_mensagens')
    .select('id,autor,texto,criado_em').eq('conversa_id',conversa.id)
    .order('ordem',{ascending:false}).limit(100);
   if(tentativa!==leitura.current)return;
   if(error)throw error;
   setMensagens((data as MensagemSuporte[]).reverse());
   setCarregando(false);
   setFalhaLeitura(false);
  }catch{
   if(tentativa===leitura.current)setFalhaLeitura(true);
  }
 },[conversa.id]);

 useEffect(()=>()=>{leitura.current++;},[]);
 usarAtualizacaoSuporte(atualizar,!enviando&&!excluindo,5000);

 async function responder(evento:FormEvent<HTMLFormElement>){
  evento.preventDefault();
  if(enviando||excluindo||!texto.trim())return;
  const tentativa=idParaEnvio(envio.current,texto.trim());
  envio.current=tentativa;
  leitura.current++;
  setErroEnvio('');
  setEnviando(true);
  try{
   const {error}=await supabase!.rpc('sc_suporte_responder',{
    p_conversa:conversa.id,p_id:tentativa.id,p_texto:tentativa.texto
   });
   if(error)throw error;
   envio.current=null;
   setTexto('');
   await Promise.all([atualizar(),atualizarCaixa()]);
  }catch{
   setErroEnvio('Não foi possível enviar a resposta. Tente novamente.');
  }finally{
   setEnviando(false);
   campo.current?.focus();
  }
 }

 async function excluir(){
  if(!window.confirm(`Excluir permanentemente a conversa com ${conversa.nome} e todas as mensagens? O histórico também será apagado para o cliente.`))return;
  leitura.current++;
  setErroExclusao('');
  setExcluindo(true);
  try{
   const {data,error}=await supabase!.from('sc_suporte_conversas')
    .delete().eq('id',conversa.id).select('id').maybeSingle();
   if(error)throw error;
   aoExcluir(conversa.id,Boolean(data));
  }catch{
   setErroExclusao('Não foi possível excluir a conversa. Tente novamente.');
  }finally{
   setExcluindo(false);
  }
 }

 return <section className="suporte-chat" aria-label={`Conversa com ${conversa.nome}`}>
  <div className="suporte-chat__topo">
   <h3>{conversa.nome}</h3>
   <button type="button" className="adm-btn adm-btn--secundario" onClick={()=>void excluir()} disabled={enviando||excluindo}>
    <Trash2 size={16} aria-hidden="true"/> {excluindo?'Excluindo…':'Excluir conversa'}
   </button>
  </div>
  {erroExclusao&&<p role="alert" className="suporte-erro">{erroExclusao}</p>}
  {falhaLeitura&&<p role="status" className="suporte-nota">Não foi possível atualizar a conversa. Tentando reconectar.</p>}
  {carregando&&!falhaLeitura&&<p role="status">Carregando mensagens…</p>}
  {!carregando&&<>
   <MensagensSuporte mensagens={mensagens} nomeCliente={conversa.nome} autorLocal="equipe"/>
   <form className="suporte-form" onSubmit={evento=>void responder(evento)}>
    <label>Responder ao cliente<textarea ref={campo} value={texto} onChange={e=>setTexto(e.target.value)} maxLength={1500} rows={3} required readOnly={enviando||excluindo}/></label>
    {erroEnvio&&<p role="alert" className="suporte-erro">{erroEnvio}</p>}
    <button type="submit" className="adm-btn" disabled={enviando||excluindo||!texto.trim()}>
     <Send size={17} aria-hidden="true"/> {enviando?'Enviando…':'Enviar resposta'}
    </button>
   </form>
  </>}
 </section>;
}

export function CaixaSuporte({ativo,aoAlterar}:{ativo:boolean|undefined;aoAlterar:()=>Promise<void>}){
 const [conversas,setConversas]=useState<Conversa[]>([]);
 const [selecionada,setSelecionada]=useState<Conversa|null>(null);
 const [limite,setLimite]=useState(30);
 const [mais,setMais]=useState(false);
 const [carregando,setCarregando]=useState(true);
 const [falha,setFalha]=useState(false);
 const [salvando,setSalvando]=useState(false);
 const [erroConfig,setErroConfig]=useState('');
 const [avisoCaixa,setAvisoCaixa]=useState('');
 const titulo=useRef<HTMLHeadingElement>(null);
 const leitura=useRef(0);

 const atualizar=useCallback(async()=>{
  const tentativa=++leitura.current;
  try{
   const {data,error}=await supabase!.from('sc_suporte_conversas')
    .select('id,nome,pendente,atualizado_em')
    .order('pendente',{ascending:false}).order('atualizado_em',{ascending:false})
    .order('id').limit(limite+1);
   if(tentativa!==leitura.current)return;
   if(error)throw error;
   setMais(data.length>limite);
   setConversas(data.slice(0,limite));
   setFalha(false);
   setCarregando(false);
  }catch{
   if(tentativa===leitura.current)setFalha(true);
  }
 },[limite]);

 useEffect(()=>()=>{leitura.current++;},[atualizar]);
 usarAtualizacaoSuporte(atualizar,ativo!==undefined,6000);

 async function alterarStatus(){
  setSalvando(true);
  setErroConfig('');
  try{
   const {error}=await supabase!.from('sc_configuracao').update({
    chat_suporte_ativo:!ativo,atualizado_em:new Date().toISOString()
   }).eq('id','principal');
   if(error)throw error;
   await aoAlterar();
  }catch{
   setErroConfig('Não foi possível alterar a disponibilidade do chat. Tente novamente.');
  }finally{
   setSalvando(false);
  }
 }

 function atualizarAposExclusao(id:string,excluida:boolean){
  setConversas(atuais=>atuais.filter(conversa=>conversa.id!==id));
  setSelecionada(atual=>atual?.id===id?null:atual);
  setAvisoCaixa(excluida?'Conversa excluída.':'A conversa não está mais disponível.');
  titulo.current?.focus();
  void atualizar();
 }

 return <section className="adm-conteudo" aria-labelledby="adm-suporte-titulo">
  <div className="adm-secao-topo">
   <div><h2 id="adm-suporte-titulo" ref={titulo} tabIndex={-1}>Suporte</h2><p>Leia e responda às mensagens enviadas pelos clientes na loja.</p></div>
   {ativo!==undefined&&<button type="button" className="adm-btn" onClick={()=>void alterarStatus()} disabled={salvando}>
    {salvando?'Salvando…':ativo?'Pausar chat na loja':'Ativar chat na loja'}
   </button>}
  </div>
  {avisoCaixa&&<p className="adm-info" role="status">{avisoCaixa}</p>}
  {erroConfig&&<p className="adm-erro" role="alert">{erroConfig}</p>}
  {ativo===undefined?<p className="adm-aviso">O banco da loja ainda precisa ser configurado para o chat.</p>:<>
   {!ativo&&<p className="adm-aviso">O chat está pausado para novos envios da loja.</p>}
   {falha&&<p role="status" className="adm-aviso">Não foi possível atualizar a caixa de conversas. Tentando reconectar.</p>}
   {carregando&&!falha&&<p role="status">Carregando conversas…</p>}
   {!carregando&&(conversas.length?<div className="suporte-caixa">
    <div aria-label="Conversas de suporte" className="suporte-lista">
     {conversas.map(conversa=><button type="button" key={conversa.id} aria-pressed={selecionada?.id===conversa.id}
      onClick={()=>{setSelecionada(conversa);setAvisoCaixa('');}}>
      <strong>{conversa.nome}</strong><time dateTime={conversa.atualizado_em}>{horario.format(new Date(conversa.atualizado_em))}</time>
      <span>{conversa.pendente?'Aguardando resposta':'Respondida'}</span>
     </button>)}
     {mais&&<button type="button" onClick={()=>setLimite(atual=>atual+30)}>Carregar mais conversas</button>}
    </div>
    {selecionada?<ResponderConversa key={selecionada.id} conversa={selecionada} atualizarCaixa={atualizar} aoExcluir={atualizarAposExclusao}/>:<div className="adm-vazio"><p>Selecione uma conversa para responder.</p></div>}
   </div>:<div className="adm-vazio"><MessageCircle size={34} aria-hidden="true"/><h3>Nenhuma conversa recebida</h3></div>)}
  </>}
 </section>;
}
