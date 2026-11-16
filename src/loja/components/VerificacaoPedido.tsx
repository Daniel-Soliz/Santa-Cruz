import {useEffect,useRef,useState} from 'react';
type TurnstileApi={
 render:(el:HTMLElement,options:{sitekey:string;callback:(token:string)=>void;
  'expired-callback':()=>void;'error-callback':()=>void;theme:'auto'})=>string;
 remove:(id:string)=>void;
};
declare global{interface Window{turnstile?:TurnstileApi;}}
const siteKey=(import.meta.env.VITE_TURNSTILE_SITE_KEY||'').trim();
export const verificacaoConfigurada=Boolean(siteKey);
export function VerificacaoPedido({token,onToken}:{token:string;onToken:(token:string)=>void}){
 const el=useRef<HTMLDivElement>(null),id=useRef<string|null>(null);
 const [erro,setErro]=useState('');
 useEffect(()=>{
  if(!siteKey||!el.current)return;
  let vivo=true;
  const render=()=>{
   if(!vivo||!el.current||!window.turnstile||id.current)return;
   id.current=window.turnstile.render(el.current,{
    sitekey:siteKey,theme:'auto',callback:t=>{setErro('');onToken(t);},
    'expired-callback':()=>onToken(''),
    'error-callback':()=>{onToken('');setErro('A verificação falhou. Tente atualizar a página.');}
   });
  };
  if(window.turnstile)render();
  else{
   const scriptId='santa-cruz-turnstile-script';
   let script=document.getElementById(scriptId) as HTMLScriptElement|null;
   if(!script){
    script=document.createElement('script');script.id=scriptId;script.async=true;script.defer=true;
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    document.head.appendChild(script);
   }
   script.addEventListener('load',render);
   script.addEventListener('error',()=>setErro('Não foi possível carregar a verificação de segurança.'));
   return()=>{vivo=false;script?.removeEventListener('load',render);if(id.current&&window.turnstile)window.turnstile.remove(id.current);id.current=null;};
  }
  return()=>{vivo=false;if(id.current&&window.turnstile)window.turnstile.remove(id.current);id.current=null;};
 // A referência da callback está estável para o ciclo de vida deste formulário.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 if(!siteKey)return null;
 return <div className="checkout-verificacao">
  <p>Verificação de segurança para registrar o pedido na cozinha.</p>
  <div ref={el} aria-label="Verificação de segurança Cloudflare Turnstile"/>
  {token&&<small role="status">Verificação concluída.</small>}
  {erro&&<p role="alert" className="erro-campo">{erro}</p>}
 </div>;
}
