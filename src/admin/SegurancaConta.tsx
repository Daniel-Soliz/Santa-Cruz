import {useState,type FormEvent} from 'react';
import {LockKeyhole} from 'lucide-react';
import {erroLegivel,supabase} from './backend';

export function SegurancaConta(){
 const [atual,setAtual]=useState(''),[nova,setNova]=useState(''),[confirmacao,setConfirmacao]=useState('');
 const [erro,setErro]=useState(''),[mensagem,setMensagem]=useState(''),[salvando,setSalvando]=useState(false);
 async function salvar(evento:FormEvent){
  evento.preventDefault();setErro('');setMensagem('');
  if(nova.length<12||nova!==confirmacao||nova===atual){setErro('Escolha uma senha diferente, com pelo menos 12 caracteres, e confirme a digitação.');return;}
  setSalvando(true);
  try{
   const {error}=await supabase!.auth.updateUser({current_password:atual,password:nova});
   if(error)throw error;
   setAtual('');setNova('');setConfirmacao('');setMensagem('Senha alterada.');
  }catch(e){setErro(erroLegivel(e));}
  finally{setSalvando(false);}
 }
 return <section className="adm-conteudo">
  <div className="adm-secao-topo"><div><h2>Segurança da conta</h2><p>Altere a senha usada para entrar no painel.</p></div></div>
  <div className="adm-card adm-card--form"><form className="adm-form" onSubmit={e=>void salvar(e)}>
   <label>Senha atual<input type="password" autoComplete="current-password" required value={atual} onChange={e=>setAtual(e.target.value)}/></label>
   <label>Nova senha<input type="password" autoComplete="new-password" minLength={12} required value={nova} onChange={e=>setNova(e.target.value)}/></label>
   <label>Confirmar nova senha<input type="password" autoComplete="new-password" minLength={12} required value={confirmacao} onChange={e=>setConfirmacao(e.target.value)}/></label>
   {erro&&<p className="adm-erro" role="alert">{erro}</p>}{mensagem&&<p className="adm-info" role="status">{mensagem}</p>}
   <button className="adm-btn" disabled={salvando}><LockKeyhole size={18}/>{salvando?'Alterando…':'Alterar senha'}</button>
  </form></div>
 </section>;
}
