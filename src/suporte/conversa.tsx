import {useEffect,useLayoutEffect,useRef} from 'react';
import './suporte.css';

export type MensagemSuporte = {
 id:string;
 autor:'cliente'|'equipe';
 texto:string;
 criado_em:string;
};

export function usarAtualizacaoSuporte(atualizar:()=>Promise<void>,ativa:boolean,intervalo:number){
 useEffect(()=>{
  if(!ativa)return;
  let ativaLocal=true;
  let executando=false;
  async function buscar(){
   if(!ativaLocal||executando||document.hidden)return;
   executando=true;
   try{await atualizar();}finally{executando=false;}
  }
  void buscar();
  const timer=window.setInterval(()=>void buscar(),intervalo);
  document.addEventListener('visibilitychange',buscar);
  return()=>{
   ativaLocal=false;
   window.clearInterval(timer);
   document.removeEventListener('visibilitychange',buscar);
  };
 },[atualizar,ativa,intervalo]);
}

const hora=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'});

export function MensagensSuporte({mensagens,nomeCliente,autorLocal}:{
 mensagens:MensagemSuporte[];
 nomeCliente:string;
 autorLocal:MensagemSuporte['autor'];
}){
 const caixa=useRef<HTMLDivElement>(null);
 const ultima=mensagens.at(-1)?.id;
 useLayoutEffect(()=>{
  if(caixa.current)caixa.current.scrollTop=caixa.current.scrollHeight;
 },[ultima]);
 return <div className="suporte-mensagens" role="log" aria-label="Mensagens da conversa" ref={caixa} tabIndex={0}>
  {mensagens.length===100&&<p className="suporte-nota">Últimas 100 mensagens</p>}
  {mensagens.map(mensagem=><article className={`suporte-mensagem ${mensagem.autor===autorLocal?'suporte-mensagem--enviada':''}`} key={mensagem.id}>
   <div><b>{mensagem.autor===autorLocal?'Você':mensagem.autor==='equipe'?'Equipe do Santa Cruz':nomeCliente}</b>
    <time dateTime={mensagem.criado_em}>{hora.format(new Date(mensagem.criado_em))}</time></div>
   <p>{mensagem.texto}</p>
  </article>)}
 </div>;
}

export function idParaEnvio(anterior:{texto:string;id:string}|null,texto:string){
 return anterior?.texto===texto?anterior:{texto,id:crypto.randomUUID()};
}
