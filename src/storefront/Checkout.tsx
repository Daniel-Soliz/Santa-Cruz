import React,{useState,useRef} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,MapPin,CreditCard,Wallet,Truck,Store,Utensils,AlertCircle,Loader2,ShieldCheck} from 'lucide-react';
import {call,configured} from '../lib/firebase';
import {money,quoteZone, type StoreSettings} from '../data/storeCatalog';

export type CartLine={key:string;id:string;name:string;image:string;price:number;quantity:number;optionId?:string;optionName?:string;notes:string;demo:boolean};
type Kind='pickup'|'delivery'|'dinein';
type Payment='pix'|'mercadopago'|'cash'|'cardOnDelivery';
type Details={name:string;phone:string;email:string;cpf:string;cep:string;street:string;number:string;neighborhood:string;complement:string;reference:string};
const blank:Details={name:'',phone:'',email:'',cpf:'',cep:'',street:'',number:'',neighborhood:'',complement:'',reference:''};
const digit=(s:string)=>s.replace(/\D/g,'');
export function Checkout({lines,settings,open,ready,onDone}:{lines:CartLine[];settings:StoreSettings;open:boolean;ready:boolean;onDone:()=>void}){
 const [step,setStep]=useState(0),[kind,setKind]=useState<Kind>('pickup'),[payment,setPayment]=useState<Payment>('cash'),
  [form,setForm]=useState<Details>(blank),[loadingCep,setLoadingCep]=useState(false),[sending,setSending]=useState(false),[error,setError]=useState(''),[orderId,setOrderId]=useState('');
 const keyRef=useRef(crypto.randomUUID());
 const createdId=useRef('');
 const subtotal=lines.reduce((s,l)=>s+l.price*l.quantity,0);
 const zone=kind==='delivery'?quoteZone(settings,form.cep,subtotal):null;
 const fee=zone?.fee||0,total=subtotal+fee;
 const set=(name:keyof Details,value:string)=>{setForm(prev=>({...prev,[name]:value}));setError('');};
 const next=()=>{
  if(step===0){if(kind==='delivery'&&!settings.deliveryEnabled){setError('Entrega indisponível no momento.');return;}setStep(1);setError('');return;}
  if(step===1){
   if(form.name.trim().length<2||digit(form.phone).length<10){setError('Preencha nome e telefone com DDD.');return;}
   if(kind==='delivery'&&(!zone||!form.street.trim()||!form.number.trim()||!form.neighborhood.trim())){setError('Confira CEP atendido, rua, número e bairro.');return;}
   if(kind==='delivery'&&subtotal<settings.minimumDelivery){setError(`Pedido mínimo para entrega: ${money(settings.minimumDelivery)}.`);return;}
   setStep(2);setError('');return;
  }
 };
 const lookup=async()=>{
  const cep=digit(form.cep);if(cep.length!==8)return;
  setLoadingCep(true);setError('');
  try{
   const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`);
   if(!response.ok)throw Error('CEP indisponível');
   const data=await response.json();
   if(data.erro)throw Error('CEP não encontrado');
   setForm(prev=>({...prev,cep,street:data.logradouro||prev.street,neighborhood:data.bairro||prev.neighborhood}));
  }catch{setError('Não foi possível consultar o ViaCEP. Preencha rua e bairro manualmente.');}finally{setLoadingCep(false);}
 };
 const send=async()=>{
  if(!open){setError('Fechado agora. Volte durante o horário de atendimento.');return;}
  if(!ready){setError('Loja ainda não ativada. Configure Firebase e publique os pratos reais para receber pedidos.');return;}
  if(lines.some(l=>l.demo)){setError('Há produtos ilustrativos na sacola. O restaurante precisa cadastrar os pratos reais.');return;}
  if(!lines.length){setError('Adicione um prato antes de finalizar.');return;}
  if((payment==='pix'||payment==='mercadopago')&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)){setError('Informe um e-mail válido para o pagamento online.');return;}
  if(payment==='pix'&&digit(form.cpf).length!==11){setError('Para gerar o Pix, informe seu CPF de 11 dígitos. Ele será enviado apenas ao Mercado Pago.');return;}
  if(!settings.payments[payment==='mercadopago'?'mercadoPago':payment]){setError('Selecione uma forma de pagamento habilitada.');return;}
  setSending(true);setError('');
  try{
   const result=await call<{orderId:string}>('createOrder',{
    requestId:keyRef.current,kind,customer:{name:form.name.trim(),phone:digit(form.phone),email:form.email.trim()},
    address:kind==='delivery'?{cep:digit(form.cep),street:form.street.trim(),number:form.number.trim(),neighborhood:form.neighborhood.trim(),complement:form.complement.trim(),reference:form.reference.trim()}:null,
    paymentMethod:payment,items:lines.map(l=>({id:l.id,quantity:l.quantity,optionId:l.optionId||'',notes:l.notes}))
   });
   setOrderId(result.orderId);
   createdId.current=result.orderId;
   onDone();
   if(payment==='mercadopago'){
    const redirect=await call<{initPoint:string}>('startCardCheckout',{orderId:result.orderId});
    window.location.assign(redirect.initPoint);return;
   }
   if(payment==='pix'){
    await call('startPixPayment',{orderId:result.orderId,cpf:digit(form.cpf)});
   }
   window.location.hash=`/pedido/${result.orderId}`;
  }catch(e){
   const text=(e as Error).message||'Erro ao processar';
   setError(text);
   if(createdId.current)window.location.hash=`/pedido/${createdId.current}`;
  }finally{setSending(false);}
 };
 if(!lines.length&&!orderId)return <main className="mx-auto max-w-2xl px-4 py-24 text-center"><h1 className="font-heading text-3xl text-[#722238]">Sua sacola está vazia</h1><a href="#/cardapio" className="mt-5 inline-block rounded-xl bg-[#E8365D] p-4 font-bold text-white">Escolher pratos</a></main>;
 return <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6"><a href="#/cardapio" className="inline-flex items-center gap-2 text-sm font-bold text-[#722238]"><ArrowLeft size={18}/> Voltar ao cardápio</a>
  <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_340px]">
   <section><p className="font-bold text-[#E8365D]">Seu pedido</p><h1 className="font-heading text-4xl font-extrabold text-[#722238]">Finalizar pedido</h1>
    <ol className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-bold sm:text-sm">{['Tipo do pedido','Seus dados','Pagamento'].map((title,i)=><li key={title} className={`rounded-xl px-2 py-3 ${step===i?'bg-[#722238] text-white':step>i?'bg-emerald-100 text-emerald-800':'bg-stone-100 text-stone-500'}`}>{i+1}. {title}</li>)}</ol>
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-8">
    {step===0&&<><h2 className="font-heading text-2xl font-extrabold text-[#722238]">Como quer receber?</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">
      {([{id:'pickup',label:'Retirada',Icon:Store,enabled:settings.pickupEnabled,desc:'Buscar no balcão'},{id:'delivery',label:'Delivery',Icon:Truck,enabled:settings.deliveryEnabled,desc:'Receber no endereço'},{id:'dinein',label:'Consumo no local',Icon:Utensils,enabled:settings.dineInEnabled,desc:'Pedir para sua mesa'}] as const).map(o=><button key={o.id} disabled={!o.enabled} onClick={()=>setKind(o.id)} className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center ${kind===o.id?'border-[#E8365D] bg-rose-50 ring-2 ring-rose-100':'border-stone-200'} disabled:cursor-not-allowed disabled:opacity-40`}><o.Icon className="text-[#E8365D]"/><b>{o.label}</b><small>{o.enabled?o.desc:'Indisponível'}</small></button>)}</div></>}
    {step===1&&<><h2 className="font-heading text-2xl font-extrabold text-[#722238]">Quem está pedindo?</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold">Nome completo *<input required autoComplete="name" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Seu nome" className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <label className="text-xs font-bold">Telefone com DDD *<input required autoComplete="tel" inputMode="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(11) 99999-9999" className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <label className="text-xs font-bold sm:col-span-2">E-mail (obrigatório para Pix e cartão online)<input autoComplete="email" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="seuemail@exemplo.com" className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      {kind==='delivery'&&<><div className="sm:col-span-2 rounded-xl bg-amber-50 p-4 text-xs text-amber-900">A taxa será calculada pela área de entrega cadastrada. Pedidos fora da região não são aceitos.</div>
      <label className="text-xs font-bold">CEP * <span className="font-normal">ViaCEP</span><div className="mt-1.5 flex gap-2"><input value={form.cep} maxLength={9} inputMode="numeric" onChange={e=>set('cep',e.target.value)} onBlur={lookup} placeholder="00000-000" className="h-12 min-w-0 flex-1 rounded-xl border border-stone-300 px-3 text-sm"/><button onClick={lookup} disabled={loadingCep} type="button" className="rounded-xl bg-[#722238] px-4 text-xs font-bold text-white disabled:opacity-50">{loadingCep?'Buscando...':'Buscar'}</button></div></label>
      <label className="text-xs font-bold">Bairro *<input value={form.neighborhood} onChange={e=>set('neighborhood',e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <label className="text-xs font-bold sm:col-span-2">Rua / avenida *<input value={form.street} onChange={e=>set('street',e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <label className="text-xs font-bold">Número *<input value={form.number} onChange={e=>set('number',e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <label className="text-xs font-bold">Complemento<input value={form.complement} onChange={e=>set('complement',e.target.value)} placeholder="Apto, bloco" className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <label className="text-xs font-bold sm:col-span-2">Referência<input value={form.reference} onChange={e=>set('reference',e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/></label>
      <p className={`sm:col-span-2 rounded-xl p-3 text-sm font-bold ${zone?'bg-emerald-50 text-emerald-800':'bg-rose-50 text-rose-800'}`}>{zone?`Entrega disponível: ${zone.name} · taxa ${money(zone.fee)} · previsão ${zone.minutes} min`:'Informe um CEP dentro da área atendida.'}</p>
      </>}
      {kind==='dinein'&&<p className="sm:col-span-2 rounded-xl bg-amber-50 p-3 text-sm">Consumo no local: informe seu nome e apresente o número do pedido à equipe.</p>}</div></>}
    {step===2&&<><h2 className="font-heading text-2xl font-extrabold text-[#722238]">Escolha o pagamento</h2><p className="mt-1 text-sm text-stone-600">Pix dentro do site ou cartão pelo ambiente protegido do Mercado Pago.</p>
     <div className="mt-4 grid gap-3 sm:grid-cols-2">{([{id:'pix',title:'Pix com QR Code',desc:'Copia e cola, confirmação automática',enabled:settings.payments.pix,Icon:Wallet},{id:'mercadopago',title:'Cartão online',desc:'Checkout Pro · Mercado Pago',enabled:settings.payments.mercadoPago,Icon:CreditCard},{id:'cash',title:'Dinheiro',desc:'Pagar na entrega ou retirada',enabled:settings.payments.cash,Icon:Wallet},{id:'cardOnDelivery',title:'Maquininha',desc:'Cartão na entrega ou retirada',enabled:settings.payments.cardOnDelivery,Icon:CreditCard}] as const).map(m=><button key={m.id} disabled={!m.enabled} onClick={()=>setPayment(m.id)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${payment===m.id?'border-[#E8365D] bg-rose-50 ring-2 ring-rose-100':'border-stone-200'} disabled:cursor-not-allowed disabled:opacity-40`}><m.Icon className="shrink-0 text-[#E8365D]"/><span><b className="block">{m.title}</b><small className="text-stone-500">{m.enabled?m.desc:'Desativado pelo restaurante'}</small></span></button>)}</div>
     {payment==='pix'&&settings.payments.pix&&<label className="mt-5 block text-xs font-bold">CPF para emissão do Pix *<input inputMode="numeric" value={form.cpf} maxLength={14} onChange={e=>set('cpf',e.target.value)} placeholder="000.000.000-00" className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 px-3 text-sm"/><span className="mt-1 block text-[11px] font-normal text-stone-500">Enviado ao Mercado Pago para emitir a cobrança. Não é salvo no pedido.</span></label>}
     <p className="mt-4 flex gap-2 text-xs text-stone-600"><ShieldCheck className="shrink-0 text-emerald-700" size={17}/> Pagamento online confirmado pelo Mercado Pago. O retorno ao site não significa pagamento aprovado.</p>
    </>}
    {error&&<p role="alert" className="mt-5 flex gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-bold text-rose-800"><AlertCircle className="shrink-0" size={18}/>{error}</p>}
    {!open&&<p role="alert" className="mt-5 rounded-xl bg-rose-100 p-3 text-sm font-bold text-rose-900">Fechado agora. Aceitamos pedidos somente no horário configurado.</p>}
    {!ready&&<p className="mt-5 rounded-xl bg-amber-100 p-3 text-sm text-amber-900">Modo de demonstração. É preciso configurar Firebase e publicar os produtos reais para habilitar pedidos.</p>}
    <div className="mt-7 flex items-center justify-between gap-3">{step>0?<button onClick={()=>{setStep(step-1);setError('');}} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-5 py-3 font-bold text-[#722238]"><ArrowLeft size={18}/> Voltar</button>:<span/>}{step<2?<button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-[#E8365D] px-6 py-3 font-extrabold text-white">Continuar <ArrowRight size={18}/></button>:<button disabled={sending||!open||!ready||lines.some(l=>l.demo)} onClick={send} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#E8365D] px-6 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">{sending?<Loader2 className="animate-spin" size={18}/>:<CheckCircle2 size={19}/>} {sending?'Registrando...':'Confirmar pedido'}</button>}</div>
    </div>
   </section>
   <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 lg:sticky lg:top-24"><h2 className="font-heading text-2xl font-extrabold text-[#722238]">Resumo do pedido</h2><div className="mt-4 space-y-3">{lines.map(l=><div key={l.key} className="flex justify-between gap-3 border-b border-stone-100 pb-3 text-sm"><span>{l.quantity}× {l.name}{l.optionName&&<small className="block text-stone-500">{l.optionName}</small>}</span><b>{money(l.price*l.quantity)}</b></div>)}</div>
   <div className="mt-4 space-y-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><b>{money(subtotal)}</b></p><p className="flex justify-between"><span>Entrega</span><b>{kind!=='delivery'?'Sem taxa':zone?money(fee):'A calcular'}</b></p><p className="flex justify-between border-t pt-3 text-lg font-extrabold text-[#722238]"><span>Total</span><span>{money(total)}</span></p></div>
   <p className="mt-4 text-xs text-stone-600">Preparo estimado: {settings.prepMinutes} minutos. Delivery inclui o prazo da região selecionada.</p>
   </aside>
  </div>
 </main>;
}
