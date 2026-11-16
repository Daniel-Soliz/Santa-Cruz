import {useCallback,useEffect,useState} from 'react';
import {ArrowLeft,AlertTriangle,Loader2,Database,ShieldCheck,LogOut} from 'lucide-react';
import type {User} from '@supabase/supabase-js';
import {supabase,backendConfigurado,erroLegivel} from './backend';
import {AdminLogin} from './AdminLogin';
import {AdminDashboard} from './AdminDashboard';
import {AdminPreview} from './AdminPreview';

type Etapa='verificando'|'configurar'|'login'|'negado'|'pronto'|'erro';
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
   setUsuario(data.user);setEtapa('pronto');
  }catch(e){setErro(erroLegivel(e));setEtapa('erro');}
 },[]);
 useEffect(()=>{
  void verificar();
  if(!supabase)return;
  const {data}=supabase.auth.onAuthStateChange((evento)=>{
   if(evento==='SIGNED_OUT'){setUsuario(null);setEtapa('login');}
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
