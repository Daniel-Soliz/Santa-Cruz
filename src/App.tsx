import {Component,lazy,Suspense,useEffect,useState,type ReactNode} from 'react';
import LojaApp from './loja/LojaApp';
import './admin/admin.css';

// Carrega o ADM somente quando necessário, sem aumentar o JS inicial da loja.
const AdminApp=lazy(()=>import('./admin/AdminApp'));
const isAdmin=()=>window.location.hash.startsWith('#/admin')||new URLSearchParams(window.location.search).has('recuperar_admin');

class AdminErrorBoundary extends Component<{children:ReactNode},{falhou:boolean}>{
 state={falhou:false};
 static getDerivedStateFromError(){return {falhou:true};}
 render(){
  if(!this.state.falhou)return this.props.children;
  return <main className="adm-status"><section className="adm-status__box">
   <h1>Atualize o painel administrativo</h1>
   <p>O painel não conseguiu carregar todos os arquivos. Recarregue a página para abrir a versão atual.</p>
   <button type="button" className="adm-btn adm-btn--full" onClick={()=>window.location.reload()}>Recarregar painel</button>
   <a className="adm-voltar" href="#inicio">Voltar à loja</a>
  </section></main>;
 }
}

export default function App(){
 const [admin,setAdmin]=useState(isAdmin);
 useEffect(()=>{
  const mudar=()=>setAdmin(isAdmin());
  window.addEventListener('hashchange',mudar);
  return()=>window.removeEventListener('hashchange',mudar);
 },[]);
 useEffect(()=>{
  if(admin)document.title='Central de Gestão | Delícia do Nordeste Santa Cruz';
 },[admin]);
 return admin?
  <AdminErrorBoundary>
   <Suspense fallback={<main className="adm-status"><p>Carregando área de administração...</p></main>}><AdminApp/></Suspense>
  </AdminErrorBoundary>:
  <LojaApp/>;
}
