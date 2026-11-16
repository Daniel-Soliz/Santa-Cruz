import {useMemo,useState,type FormEvent} from 'react';
import {Plus,CircleDollarSign,TrendingUp,TrendingDown,ReceiptText,AlertTriangle} from 'lucide-react';
import {supabase,reais,erroLegivel,type PedidoAdmin} from './backend';
export type MovimentoCaixa={id:string;tipo:'entrada'|'saida';valor_centavos:number;descricao:string;forma_pagamento:string;criado_em:string};
const data=(v:string)=>new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});
export function Financeiro({pedidos,movimentos,atualizar}:{pedidos:PedidoAdmin[];movimentos:MovimentoCaixa[];atualizar:()=>Promise<void>}){
 const [tipo,setTipo]=useState<'entrada'|'saida'>('entrada');
 const [descricao,setDescricao]=useState(''),[valor,setValor]=useState('');
 const [forma,setForma]=useState('dinheiro'),[erro,setErro]=useState(''),[salvando,setSalvando]=useState(false);
 const totais=useMemo(()=>{
  const pedidosPagos=pedidos.filter(p=>p.pagamento_status==='pago').reduce((s,p)=>s+p.total_centavos,0);
  const entradas=movimentos.filter(m=>m.tipo==='entrada').reduce((s,m)=>s+m.valor_centavos,0);
  const saidas=movimentos.filter(m=>m.tipo==='saida').reduce((s,m)=>s+m.valor_centavos,0);
  return {pedidosPagos,entradas,saidas,saldo:pedidosPagos+entradas-saidas};
 },[pedidos,movimentos]);
 const salvar=async(e:FormEvent)=>{
  e.preventDefault();setErro('');
  const cents=Math.round(Number(valor.replace(',','.'))*100);
  if(!Number.isSafeInteger(cents)||cents<=0){setErro('Informe um valor válido e maior que zero.');return;}
  if(descricao.trim().length<3){setErro('Descreva o lançamento (mínimo 3 caracteres).');return;}
  setSalvando(true);
  const {error}=await supabase!.from('sc_movimentos_caixa').insert({
   tipo,descricao:descricao.trim(),valor_centavos:cents,forma_pagamento:forma
  });
  setSalvando(false);
  if(error){setErro(erroLegivel(error));return;}
  setValor('');setDescricao('');await atualizar();
 };
 return <section className="adm-conteudo">
  <div className="adm-secao-topo"><div><span className="adm-kicker">CONTROLE FINANCEIRO</span><h2>Entradas e saídas</h2><p>Registros manuais e pagamentos marcados como recebidos pela equipe.</p></div></div>
  <div className="adm-aviso"><AlertTriangle size={19}/><span>Este quadro <strong>não é extrato bancário</strong> e não verifica Pix ou cartão automaticamente. Marque pedidos como pagos apenas após conferir o recebimento. Não lance a mesma venda também como entrada manual.</span></div>
  <div className="adm-metricas adm-metricas--financeiro">
   <article><span><ReceiptText size={22}/></span><p>Pedidos marcados como pagos</p><strong className="adm-metricas__dinheiro">{reais(totais.pedidosPagos/100)}</strong><small>Últimos {pedidos.length} pedidos carregados</small></article>
   <article><span><TrendingUp size={22}/></span><p>Outras entradas</p><strong className="adm-metricas__dinheiro">{reais(totais.entradas/100)}</strong><small>Lançamentos manuais</small></article>
   <article><span><TrendingDown size={22}/></span><p>Saídas</p><strong className="adm-metricas__dinheiro">{reais(totais.saidas/100)}</strong><small>Lançamentos manuais</small></article>
   <article><span><CircleDollarSign size={22}/></span><p>Saldo registrado</p><strong className="adm-metricas__dinheiro">{reais(totais.saldo/100)}</strong><small>Recorte de registros exibidos</small></article>
  </div>
  <div className="adm-grade-paineis">
   <section className="adm-card"><h3><Plus size={20}/> Novo lançamento</h3>
    <form onSubmit={e=>void salvar(e)} className="adm-form">
     <label>Tipo<select value={tipo} onChange={e=>setTipo(e.target.value as typeof tipo)}><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label>
     <label>Descrição *<input required maxLength={180} value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder={tipo==='entrada'?'Ex.: venda no balcão fora do sistema':'Ex.: compra de embalagens'}/></label>
     <div className="adm-duas-colunas"><label>Valor (R$) *<input required inputMode="decimal" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00"/></label>
      <label>Forma<select value={forma} onChange={e=>setForma(e.target.value)}><option value="dinheiro">Dinheiro</option><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="outro">Outro</option></select></label></div>
     {erro&&<p className="adm-erro" role="alert">{erro}</p>}
     <button className="adm-btn" type="submit" disabled={salvando}><Plus size={17}/>{salvando?'Salvando...':'Registrar lançamento'}</button>
    </form>
   </section>
   <section className="adm-card"><h3><ReceiptText size={20}/> Últimos lançamentos</h3>
    {movimentos.length?movimentos.map(m=><div className="adm-resumo-linha" key={m.id}><span><b>{m.descricao}</b><small>{data(m.criado_em)} · {m.forma_pagamento}</small></span>
     <b className={m.tipo==='entrada'?'adm-valor-entrada':'adm-valor-saida'}>{m.tipo==='entrada'?'+':'−'} {reais(m.valor_centavos/100)}</b></div>):
     <p className="adm-sem-dados">Nenhum lançamento financeiro registrado.</p>}
   </section>
  </div>
 </section>;
}
