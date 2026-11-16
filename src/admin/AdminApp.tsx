import {useCallback,useEffect,useState,type FormEvent} from 'react';
import {ArrowLeft,AlertTriangle,Loader2,Database,ShieldCheck,LogOut,LockKeyhole} from 'lucide-react';
import type {User} from '@supabase/supabase-js';
import {supabase,backendConfigurado,erroLegivel} from './backend';
import {AdminLogin} from './AdminLogin';
import {AdminDashboard} from './AdminDashboard';
import {AdminPreview} from './AdminPreview';

type Etapa='verificando'|'configurar'|'login'|'recuperar'|'negado'|'pronto'|'erro';
export default function AdminApp(){
 const [etapa,setEtapa]=useState<Etapa>(backendConfigurado?'verificando':'configurar');
 const [usuario,setUsuario]=useState<User|null>(null);
 const [erro,setErro]=useState('');
 const [verPrevia,setVerPrevia]=useState(false);
 const verificar=useCallback(async()=>{
  if(!supabase){setEtapa('configurar');return;}
  try{
   const {data,error}=await supabase.auth.getUser();
   if(error||!data.user){setEtapa('login');return;}
   const {data:admin,error:erroBanco}=await supabase.from('sc_admins')
    .select('user_id').eq('user_id',data.user.id).maybeSingle();
   if(erroBanco)throw erroBanco;
   if(!admin){setUsuario(data.user);setEtapa('negado');return;}
   setUsuario(data.user);
   setEtapa(new URLSearchParams(window.location.search).has('recuperar_admin')?'recuperar':'pronto');
  }catch(e){setErro(erroLegivel(e));setEtapa('erro');}
 },[]);
 useEffect(()=>{
  void verificar();
  if(!supabase)return;
  const {data}=supabase.auth.onAuthStateChange((evento)=>{
   if(evento==='SIGNED_OUT'){setUsuario(null);setEtapa('login');}
   if(evento==='PASSWORD_RECOVERY')setEtapa('recuperar');
  });
  return()=>data.subscription.unsubscribe();
 },[verificar]);
 const sair=async()=>{
  if(supabase)await supabase.auth.signOut();
  setUsuario(null);setEtapa('login');window.location.hash='/admin';
 };
 if(etapa==='verificando')return <main className="adm-status"><Loader2 className="adm-spin" size={32}/><p>Verificando acesso seguro...</p></main>;
 if(etapa==='configurar'&&verPrevia)return <AdminPreview fechar={()=>setVerPrevia(false)}/>;
 if(etapa==='configurar')return <main className="adm-status">
  <div className="adm-status__box"><Database size={43}/><span className="adm-sobretitulo">ÁREA DA EQUIPE</span>
   <h1>Central administrativa preparada</h1>
   <p>O painel já está instalado no site, mas precisa da conexão com um banco próprio do restaurante para permitir login e alterações reais.</p>
   <div className="adm-status__instrucoes">
    <strong>O que falta configurar</strong>
    <p>Crie um projeto Supabase exclusivo para Santa Cruz, execute <code>supabase/INSTALAR_SANTA_CRUZ.sql</code>, cadastre seu usuário administrador e configure as variáveis públicas no GitHub Actions.</p>
    <p>As instruções estão no <a href="https://github.com/Daniel-Soliz/Santa-Cruz/blob/main/README.md" target="_blank" rel="noopener noreferrer">README do repositório</a>. Nenhuma senha ou token privado deve ser colocado no site.</p>
   </div>
   <button className="adm-preview__botao" type="button" onClick={()=>setVerPrevia(true)}>Visualizar prévia do painel</button>
   <a className="adm-voltar" href="#inicio"><ArrowLeft size={17}/> Voltar ao site</a>
  </div>
 </main>;
 if(etapa==='login')return <AdminLogin entrar={verificar}/>;
 if(etapa==='recuperar')return <RedefinirSenha confirmar={async()=>{await supabase!.auth.signOut();window.history.replaceState({},'',`${import.meta.env.BASE_URL}#/admin`);setEtapa('login');}}/>;
 if(etapa==='negado'||etapa==='erro')return <main className="adm-status"><div className="adm-status__box">
  <AlertTriangle size={38}/>
  <h1>{etapa==='negado'?'Acesso não autorizado':'Não foi possível carregar o painel'}</h1>
  <p>{etapa==='negado'?'Seu login foi reconhecido, mas este usuário não consta na lista de administradores do restaurante.':erro}</p>
  <div className="adm-status__acoes"><button type="button" onClick={()=>void verificar()}><ShieldCheck size={17}/> Verificar novamente</button>
  <button type="button" onClick={()=>void sair()}><LogOut size={17}/> Sair</button></div>
  <a className="adm-voltar" href="#inicio"><ArrowLeft size={17}/> Voltar à loja</a>
 </div></main>;
 return <AdminDashboard usuario={usuario?.email||'Administrador'} sair={sair}/>;
}

function RedefinirSenha({confirmar}:{confirmar:()=>Promise<void>}){
 const [senha,setSenha]=useState(''),[confirmacao,setConfirmacao]=useState(''),[erro,setErro]=useState(''),[salvando,setSalvando]=useState(false);
 const salvar=async(e:FormEvent)=>{
  e.preventDefault();setErro('');
  if(senha.length<12){setErro('Use uma senha nova com pelo menos 12 caracteres.');return;}
  if(senha!==confirmacao){setErro('As senhas não coincidem.');return;}
  setSalvando(true);
  const {error}=await supabase!.auth.updateUser({password:senha});
  if(error){setErro(erroLegivel(error));setSalvando(false);return;}
  await confirmar();
 };
 return <main className="adm-status"><section className="adm-status__box">
  <LockKeyhole size={38}/><span className="adm-sobretitulo">PROTEÇÃO DE ACESSO</span><h1>Definir nova senha</h1>
  <p>Você acessou a recuperação de uma conta administrativa autorizada.</p>
  <form className="adm-form" onSubmit={e=>void salvar(e)}>
   <label>Nova senha (mínimo 12 caracteres)<input type="password" autoComplete="new-password" minLength={12} required value={senha} onChange={e=>setSenha(e.target.value)}/></label>
   <label>Confirmar nova senha<input type="password" autoComplete="new-password" minLength={12} required value={confirmacao} onChange={e=>setConfirmacao(e.target.value)}/></label>
   {erro&&<p className="adm-erro" role="alert">{erro}</p>}
   <button className="adm-btn adm-btn--full" disabled={salvando}>{salvando?'Salvando...':'Alterar senha e voltar ao login'}</button>
  </form>
 </section></main>;
}
