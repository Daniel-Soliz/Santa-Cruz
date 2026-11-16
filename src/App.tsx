import {lazy,Suspense,useEffect,useState} from 'react';
import LojaApp from './loja/LojaApp';
import './admin/admin.css';

// Carrega o ADM somente quando necessário, sem aumentar o JS inicial da loja.
const AdminApp=lazy(()=>import('./admin/AdminApp'));
const isAdmin=()=>window.location.hash.startsWith('#/admin')||new URLSearchParams(window.location.search).has('recuperar_admin');
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
  <Suspense fallback={<main className="adm-status"><p>Carregando área de administração...</p></main>}><AdminApp/></Suspense>:
  <LojaApp/>;
}
