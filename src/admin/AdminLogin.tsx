import {useState, type FormEvent} from 'react';
import {LockKeyhole,Mail,Eye,EyeOff,ArrowLeft,ShieldCheck,KeyRound,AlertCircle,Loader2} from 'lucide-react';
import {logoUrl} from '../config/loja';
import {supabase,erroLegivel} from './backend';

export function AdminLogin({entrar}:{entrar:()=>Promise<void>}){
 const [email,setEmail]=useState('');
 const [senha,setSenha]=useState('');
 const [mostrar,setMostrar]=useState(false);
 const [enviando,setEnviando]=useState(false);
 const [erro,setErro]=useState('');
 const [info,setInfo]=useState('');
 const submeter=async(e:FormEvent)=>{
  e.preventDefault();if(!supabase)return;
  setErro('');setInfo('');setEnviando(true);
  try{
   const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:senha});
   if(error)throw error;
   await entrar();
  }catch(e){setErro(erroLegivel(e));}
  finally{setEnviando(false);}
 };
 const recuperar=async()=>{
  if(!email.trim()){setErro('Digite seu e-mail para recuperar o acesso.');return;}
  setErro('');setInfo('');
  try{
   const {error}=await supabase!.auth.resetPasswordForEmail(email.trim(),{
    redirectTo:`${window.location.origin}${import.meta.env.BASE_URL}?recuperar_admin=1`
   });
   if(error)throw error;
   setInfo('Se o e-mail estiver cadastrado, você receberá instruções de recuperação.');
  }catch(e){setErro(erroLegivel(e));}
 };
 return <main className="adm-login">
  <a href="#inicio" className="adm-login__voltar"><ArrowLeft size={17}/> Voltar à loja</a>
  <div className="adm-login__brilho" aria-hidden="true"/>
  <section className="adm-login__cartao" aria-labelledby="adm-login-titulo">
   <div className="adm-login__logo"><img src={logoUrl} width="82" height="82" alt="Logo Casa do Norte Santa Cruz"/></div>
   <p className="adm-sobretitulo">CASA DO NORTE · SANTA CRUZ</p>
   <h1 id="adm-login-titulo">Painel administrativo</h1>
   <p className="adm-login__intro">Acesso exclusivo para a equipe autorizada do restaurante.</p>
   <form onSubmit={e=>void submeter(e)} className="adm-login__form">
    <label htmlFor="adm-email"><Mail size={17}/> E-mail do administrador</label>
    <input id="adm-email" type="email" name="email" autoComplete="username" required placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
    <label htmlFor="adm-senha"><LockKeyhole size={17}/> Senha de acesso</label>
    <div className="adm-senha">
     <input id="adm-senha" type={mostrar?'text':'password'} name="password" autoComplete="current-password" required minLength={6} placeholder="Sua senha" value={senha} onChange={e=>setSenha(e.target.value)}/>
     <button type="button" onClick={()=>setMostrar(!mostrar)} aria-label={mostrar?'Ocultar senha':'Mostrar senha'}>{mostrar?<EyeOff size={18}/>:<Eye size={18}/>}</button>
    </div>
    {erro&&<p className="adm-erro" role="alert"><AlertCircle size={17}/>{erro}</p>}
    {info&&<p className="adm-info" role="status">{info}</p>}
    <button type="submit" className="adm-login__entrar" disabled={enviando}>{enviando?<Loader2 size={18}/>:<LockKeyhole size={18}/>} {enviando?'Validando acesso...':'Entrar no painel'}</button>
   </form>
   <button className="adm-recuperar" type="button" onClick={()=>void recuperar()}><KeyRound size={16}/> Esqueceu sua senha?</button>
   <p className="adm-login__seguranca"><ShieldCheck size={17}/> Acesso validado pelo Supabase Auth e protegido por permissões no banco.</p>
  </section>
 </main>;
}
