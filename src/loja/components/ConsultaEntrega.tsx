import {useState} from 'react';
import {MapPin, Search, Truck, CheckCircle2, AlertCircle, HelpCircle} from 'lucide-react';
import {loja} from '../../config/loja';
import {avaliarCobertura,consultarCep,entregaConfigurada} from '../entrega';
import type {Cobertura} from '../entrega';

export function ConsultaEntrega(){
 const [cep,setCep]=useState('');
 const [bairro,setBairro]=useState('');
 const [consultando,setConsultando]=useState(false);
 const [resultado,setResultado]=useState<Cobertura|null>(null);
 const [erro,setErro]=useState('');
 const ativa=entregaConfigurada(loja);
 const status=async(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();setConsultando(true);setErro('');setResultado(null);
  try{
   const endereco=await consultarCep(cep);
   setBairro(endereco.bairro);
   setResultado(avaliarCobertura(endereco.bairro,loja,{cidade:endereco.cidade,uf:endereco.uf}));
  }catch(e){setErro((e as Error).message||'Não foi possível consultar o CEP.');}
  finally{setConsultando(false);}
 };
 const conferirBairro=()=>{
  setResultado(avaliarCobertura(bairro,loja));
 };
 return <section className="consulta-entrega container-padrao" id="consultar-entrega" aria-labelledby="consulta-entrega-titulo">
  <div className="consulta-entrega__texto">
   <div className="consulta-entrega__icone"><Truck size={25}/></div>
   <div><span className="micro-label">Antes de montar a sacola</span><h2 id="consulta-entrega-titulo">Confira a entrega pelo CEP</h2>
    <p>{ativa?'Consulte o CEP e veja se seu bairro está na área atendida.':'A entrega online ainda não está habilitada. Você pode conferir seu CEP, mas os pedidos estão disponíveis para retirada ou consumo no local.'}</p>
   </div>
  </div>
  <form onSubmit={e=>void status(e)} className="consulta-entrega__form">
   <label htmlFor="consulta-cep">Seu CEP</label>
   <div className="consulta-entrega__campos">
    <input id="consulta-cep" name="cep" autoComplete="postal-code" inputMode="numeric" maxLength={9}
     value={cep} onChange={e=>{setCep(e.target.value);setResultado(null);setErro('');}}
     placeholder="00000-000" aria-describedby="consulta-entrega-ajuda"/>
    <button className="botao botao--escuro" type="submit" disabled={consultando}><Search size={18}/>{consultando?'Consultando...':'Verificar'}</button>
   </div>
   <small id="consulta-entrega-ajuda">Consulta gratuita pelo ViaCEP. A confirmação do pedido é feita pelo restaurante.</small>
   {erro&&<p role="alert" className="consulta-entrega__resposta consulta-entrega__resposta--erro"><AlertCircle size={17}/>{erro}</p>}
   {resultado&&<div role="status" className={`consulta-entrega__resposta ${resultado.estado==='disponivel'?'consulta-entrega__resposta--ok':'consulta-entrega__resposta--aviso'}`}>
    {resultado.estado==='disponivel'?<CheckCircle2 size={19}/>:<HelpCircle size={19}/>}<span>{resultado.mensagem}</span>
   </div>}
   {resultado?.estado==='verificar-bairro'&&<div className="consulta-entrega__bairro">
    <label htmlFor="consulta-bairro">Bairro</label><input id="consulta-bairro" value={bairro} onChange={e=>setBairro(e.target.value)} placeholder="Informe seu bairro"/><button type="button" onClick={conferirBairro}>Conferir bairro</button>
   </div>}
  </form>
 </section>;
}
