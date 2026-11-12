import React,{useEffect,useState} from 'react';
import {onSnapshot,doc} from 'firebase/firestore';
import {CheckCircle2,Clock3,Truck,Store,Copy,AlertCircle,MessageCircle,Printer,Loader2} from 'lucide-react';
import {auth,configured,db,guest,call} from '../lib/firebase';
import {money} from '../data/storeCatalog';

type Order={
 id:string;ownerUid:string;kind:'pickup'|'delivery'|'dinein';status:string;createdAt?:unknown;
 customer:{name:string;phone:string};
 items:{name:string;quantity:number;unitPrice:number;total:number;optionName?:string;notes?:string}[];
 subtotal:number;deliveryFee:number;total:number;
 payment:{method:string;status:string;pixCode?:string;pixBase64?:string;checkoutUrl?:string};
 etaMinutes?:number;
};
const stepsDelivery=['Recebido','Em preparo','Saiu para entrega','Entregue'];
const stepsPickup=['Recebido','Em preparo','Pronto para retirar','Entregue'];
export function Tracking({id}:{id:string}){
 const [order,setOrder]=useState<Order|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[starting,setStarting]=useState(false),[cpf,setCpf]=useState('');
 useEffect(()=>{
  if(!db||!id){setLoading(false);setError('Conecte o Firebase para consultar pedidos.');return;}
  let unsub=()=>{};let active=true;
  guest().then(()=>{if(!active)return;unsub=onSnapshot(doc(db!,'orders',id),s=>{setLoading(false);if(s.exists()){setOrder({...s.data(),id:s.id} as Order);setError('');}else setError('Pedido não encontrado neste dispositivo.');},()=>{setLoading(false);setError('Não foi possível acessar este pedido. Use o mesmo dispositivo da compra.');});}).catch(()=>{setLoading(false);setError('Falha na autenticação.');});
  return()=>{active=false;unsub();};
 },[id]);
 const copy=async()=>{if(order?.payment.pixCode)await navigator.clipboard.writeText(order.payment.pixCode);};
 const retry=async()=>{
  if(!order)return;setStarting(true);setError('');
  try{
   if(order.payment.method==='pix')await call('startPixPayment',{orderId:id,cpf:cpf.replace(/\D/g,'')});
   else{const res=await call<{initPoint:string}>('startCardCheckout',{orderId:id});window.location.assign(res.initPoint);}
  }catch(e){setError((e as Error).message);}finally{setStarting(false);}
 };
 if(loading)return <main className="mx-auto max-w-3xl px-4 py-28 text-center"><Loader2 className="mx-auto animate-spin text-[#E8365D]"/><p>Consultando seu pedido...</p></main>;
 if(!order)return <main className="mx-auto max-w-2xl px-4 py-20 text-center"><AlertCircle className="mx-auto text-rose-600"/><h1 className="mt-3 font-heading text-3xl text-[#722238]">Não foi possível acompanhar</h1><p className="mt-3 text-stone-600">{error}</p><a className="mt-5 inline-block text-[#E8365D]" href="#/cardapio">Voltar ao cardápio</a></main>;
 const steps=order.kind==='delivery'?stepsDelivery:stepsPickup;
 const index=steps.indexOf(order.status);
 return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
  <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-9"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#E8365D]">Pedido registrado</p><h1 className="font-heading text-3xl font-extrabold text-[#722238]">Pedido #{id.slice(-8).toUpperCase()}</h1></div><span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-[#722238]">{order.status}</span></div>
   <p className="mt-3 text-sm text-stone-600">Obrigado, {order.customer.name}! Acompanhe o preparo abaixo. As informações são atualizadas automaticamente.</p>
   <div className="mt-6 grid gap-3 sm:grid-cols-4" aria-label="Etapas do pedido">{steps.map((status,i)=><div key={status} className={`flex flex-col items-center rounded-xl px-2 py-4 text-center text-xs font-bold ${index>=i?'bg-emerald-50 text-emerald-800':'bg-stone-100 text-stone-400'}`}><CheckCircle2 className="mb-2"/>{status}</div>)}</div>
   {order.status==='Cancelado'&&<p role="alert" className="mt-4 rounded-xl bg-rose-100 p-4 font-bold text-rose-800">O pedido foi cancelado. Fale com o restaurante caso precise de ajuda.</p>}
   {order.payment.status!=='paid'&&<section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-heading text-xl font-bold text-[#722238]">Pagamento pendente</h2>
    {order.payment.method==='pix'&&order.payment.pixCode?<div className="mt-3 space-y-3"><p className="text-sm">Escaneie o QR Code no aplicativo do banco ou copie o código abaixo.</p>{order.payment.pixBase64&&<img className="mx-auto h-48 w-48 rounded-xl bg-white object-contain p-2" src={'data:image/png;base64,'+order.payment.pixBase64} alt="QR Code Pix gerado pelo Mercado Pago"/>}<textarea readOnly value={order.payment.pixCode} rows={3} className="w-full rounded-xl border p-3 font-mono text-xs"/><button onClick={copy} className="inline-flex gap-2 rounded-xl bg-[#722238] px-5 py-3 font-bold text-white"><Copy size={16}/> Copiar código Pix</button></div>:
     order.payment.method==='pix'?<div className="mt-3 space-y-3"><p className="text-sm">Não foi possível mostrar o Pix. Informe o CPF para gerar a cobrança.</p><input aria-label="CPF" value={cpf} onChange={e=>setCpf(e.target.value)} placeholder="CPF de 11 dígitos" className="w-full rounded-xl border px-3 py-3"/><button disabled={starting} onClick={retry} className="rounded-xl bg-[#722238] px-5 py-3 font-bold text-white disabled:opacity-50">Gerar Pix</button></div>:
     order.payment.method==='mercadopago'?<div className="mt-3 space-y-3"><p className="text-sm">Pagamento pelo Checkout Pro. A confirmação aparece aqui depois da notificação do Mercado Pago.</p><button disabled={starting} onClick={retry} className="rounded-xl bg-[#722238] px-5 py-3 font-bold text-white disabled:opacity-50">Abrir pagamento seguro</button></div>:
     <p className="mt-2 text-sm">Pague {order.payment.method==='cash'?'em dinheiro':'com a maquininha'} na entrega, retirada ou atendimento.</p>}
   </section>}
   {order.payment.status==='paid'&&<p className="mt-6 flex gap-2 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800"><CheckCircle2/> Pagamento confirmado</p>}
   {error&&<p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
   <div className="mt-8 border-t pt-5"><h2 className="font-heading text-xl font-extrabold text-[#722238]">Resumo</h2>{order.items.map((it,i)=><div className="mt-3 flex justify-between gap-4 text-sm" key={i}><span>{it.quantity}× {it.name}{it.optionName?<small className="block text-stone-500">{it.optionName}</small>:null}</span><b>{money(it.total)}</b></div>)}<p className="mt-5 flex justify-between border-t pt-4 text-lg font-extrabold text-[#722238]"><span>Total</span><span>{money(order.total)}</span></p></div>
   <div className="mt-6 flex flex-wrap gap-3"><a href="#/cardapio" className="rounded-xl bg-[#E8365D] px-5 py-3 font-bold text-white">Voltar ao cardápio</a><button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold text-[#722238]"><Printer size={17}/> Imprimir</button><a href="https://wa.me/5511960149521" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold text-stone-500"><MessageCircle size={16}/> Precisa de ajuda?</a></div>
  </div>
 </main>;
}
