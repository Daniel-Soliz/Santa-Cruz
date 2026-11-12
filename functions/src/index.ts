import crypto from 'node:crypto';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {onCall,onRequest,HttpsError} from 'firebase-functions/v2/https';
import {defineSecret} from 'firebase-functions/params';
import {digits,isOpen,shipping,toCents,validCpf,mpWebhookValid} from './core';

initializeApp();
const firestore=getFirestore();
const region='southamerica-east1';
const mpToken=defineSecret('MP_ACCESS_TOKEN');
const mpSecret=defineSecret('MP_WEBHOOK_SECRET');
function reject(message:string):never{throw new HttpsError('failed-precondition',message);}
function uidFrom(request:any):string{
 const uid=request.auth?.uid;
 if(!uid)throw new HttpsError('unauthenticated','Entre ou permita acesso anônimo para enviar o pedido.');
 return uid;
}
function adminOnly(request:any):void{
 if(!request.auth||request.auth.token?.admin!==true)throw new HttpsError('permission-denied','Acesso reservado à equipe.');
}
function safeString(v:any,max=100):string{return typeof v==='string'?v.trim().slice(0,max):'';}
function getPaymentEnvironment(){
 const token=mpToken.value();
 if(!token)reject('Mercado Pago não configurado no servidor.');
 const site=process.env.PUBLIC_SITE_URL||'';
 const webhook=process.env.MP_WEBHOOK_URL||'';
 if(!/^https:\/\/[^\s]+\/$/.test(site)||!/^https:\/\/[^\s]+$/.test(webhook))reject('Configure PUBLIC_SITE_URL e MP_WEBHOOK_URL HTTPS no Firebase Functions.');
 return {token,site,webhook};
}
function normalizeOrderPayment(s:any){
 return s==='approved'?'paid':s==='refunded'||s==='charged_back'?'refunded':s==='rejected'||s==='cancelled'?'rejected':'pending';
}
export const createOrder=onCall({region,maxInstances:25},async(request)=>{
 const uid=uidFrom(request),data=request.data||{};
 const requestId=safeString(data.requestId,40);
 if(!/^[a-f0-9-]{36}$/i.test(requestId))throw new HttpsError('invalid-argument','ID do pedido inválido.');
 const provided=Array.isArray(data.items)?data.items:[];
 if(!provided.length||provided.length>30)throw new HttpsError('invalid-argument','Escolha entre 1 e 30 itens.');
 const customer=data.customer||{};
 const name=safeString(customer.name,90),phone=digits(customer.phone),email=safeString(customer.email,150);
 if(name.length<2||phone.length<10||phone.length>13)throw new HttpsError('invalid-argument','Nome e telefone com DDD são obrigatórios.');
 const method=safeString(data.paymentMethod,30);
 if(!['pix','mercadopago','cash','cardOnDelivery'].includes(method))throw new HttpsError('invalid-argument','Forma de pagamento inválida.');
 const kind=safeString(data.kind,20);
 const addr=data.address||{};
 const cep=digits(addr.cep);
 if(kind==='delivery'&&(cep.length!==8||!safeString(addr.street,120)||!safeString(addr.number,15)||!safeString(addr.neighborhood,90))){
  throw new HttpsError('invalid-argument','Informe o endereço e o CEP completos.');
 }
 const orderId=`${uid}_${requestId}`;
 const ref=firestore.collection('orders').doc(orderId);
 try{
  return await firestore.runTransaction(async transaction=>{
   const prior=await transaction.get(ref);
   if(prior.exists)return {orderId,duplicate:true};
   const config=await transaction.get(firestore.doc('settings/public'));
   if(!config.exists)reject('Loja ainda não habilitada. Cadastre horários e pagamentos no painel.');
   const settings=config.data()!;
   if(!isOpen(settings))reject('Fechado agora. Pedidos disponíveis somente no horário de funcionamento.');
   if(settings.payments?.[method]!==true)reject('Pagamento desativado pelo restaurante.');
   const refs=provided.map((line:any)=>{
    const id=safeString(line.id,90);
    if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>30)
      throw new HttpsError('invalid-argument','Quantidade ou prato inválido.');
    return firestore.collection('products').doc(id);
   });
   const snaps=await Promise.all(refs.map((r:any)=>transaction.get(r)));
   let subtotalCents=0;
   const items=provided.map((line:any,i:number)=>{
    const snap=snaps[i];
    if(!snap.exists)reject('Algum prato saiu do cardápio.');
    const product=snap.data()!;
    if(product.available!==true||product.demo===true)reject('Um dos itens está indisponível ou ainda é de demonstração.');
    const base=toCents(product.price);
    if(!Number.isFinite(base))reject('Preço do prato inválido.');
    const options=Array.isArray(product.options)?product.options:[];
    const requested=safeString(line.optionId,80);
    const option=options.length?options.find((o:any)=>o.id===requested):undefined;
    if(options.length&&!option)reject('Escolha o tamanho do prato.');
    if(!options.length&&requested)reject('Adicional inválido.');
    const modifier=option?toCents(option.price):0;
    if(!Number.isFinite(modifier))reject('Preço do adicional inválido.');
    const unitCents=base+modifier;
    const totalCents=unitCents*line.quantity;
    subtotalCents+=totalCents;
    return {id:snap.id,name:safeString(product.name,120),quantity:line.quantity,
      unitPrice:unitCents/100,total:totalCents/100,
      optionName:option?safeString(option.name,90):'',
      optionId:option?option.id:'',notes:safeString(line.notes,250)};
   });
   if(subtotalCents<=0||subtotalCents>20000000)reject('Valor total inválido.');
   const delivery=shipping(settings,kind,cep,subtotalCents);
   const amountCents=subtotalCents+delivery.feeCents;
   const order={
    ownerUid:uid,kind,status:'Recebido',customer:{name,phone,...(email?{email}:{})},
    address:kind==='delivery'?{cep,street:safeString(addr.street,120),number:safeString(addr.number,15),
      neighborhood:safeString(addr.neighborhood,90),complement:safeString(addr.complement,90),reference:safeString(addr.reference,160)}:null,
    items,subtotal:subtotalCents/100,deliveryFee:delivery.feeCents/100,total:amountCents/100,
    deliveryZone:delivery.zone,etaMinutes:delivery.eta,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp(),
    payment:{method,status:'pending'},history:[{status:'Recebido',at:new Date().toISOString()}]
   };
   transaction.create(ref,order);
   return {orderId,duplicate:false};
  });
 }catch(err){
  if(err instanceof HttpsError)throw err;
  console.error('Erro ao criar pedido:',err);
  throw new HttpsError('internal','Não foi possível registrar o pedido. Tente novamente.');
 }
});
async function owned(orderId:string,uid:string){
 if(!/^[a-zA-Z0-9_-]{8,130}$/.test(orderId))throw new HttpsError('invalid-argument','Pedido inválido.');
 const ref=firestore.collection('orders').doc(orderId),snap=await ref.get();
 if(!snap.exists||snap.data()?.ownerUid!==uid)throw new HttpsError('not-found','Pedido não encontrado neste dispositivo.');
 return {ref,order:snap.data()!};
}
export const startCardCheckout=onCall({region,secrets:[mpToken],maxInstances:20},async(request)=>{
 const uid=uidFrom(request),orderId=safeString(request.data?.orderId,130);
 const {ref,order}=await owned(orderId,uid);
 if(order.payment?.method!=='mercadopago'||order.payment?.status==='paid'||order.status==='Cancelado')reject('Este pedido não permite pagamento por cartão.');
 const settings=(await firestore.doc('settings/public').get()).data();
 if(!settings?.payments?.mercadoPago)reject('Cartão online temporariamente desabilitado.');
 if(order.payment?.checkoutUrl)return {initPoint:order.payment.checkoutUrl};
 const {token,site,webhook}=getPaymentEnvironment();
 const back=`${site}#/pedido/${encodeURIComponent(orderId)}`;
 const response=await fetch('https://api.mercadopago.com/checkout/preferences',{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,
   'X-Idempotency-Key':crypto.createHash('sha256').update('card:'+orderId).digest('hex')},
  body:JSON.stringify({
   items:[{id:orderId,title:`Pedido ${orderId.slice(-8)} · Delícia do Nordeste`,quantity:1,unit_price:order.total,currency_id:'BRL'}],
   ...(order.customer?.email?{payer:{name:order.customer.name,email:order.customer.email}}:{}),
   external_reference:orderId,
   back_urls:{success:`${back}?mp=success`,pending:`${back}?mp=pending`,failure:`${back}?mp=failure`},
   auto_return:'approved',notification_url:webhook
  })
 });
 if(!response.ok){console.error('MP preference HTTP',response.status);throw new HttpsError('unavailable','Mercado Pago não conseguiu iniciar o cartão.');}
 const data:any=await response.json();
 const url=data.init_point;
 if(typeof url!=='string'||!url.startsWith('https://'))throw new HttpsError('internal','Link de pagamento inválido.');
 await ref.update({'payment.checkoutUrl':url,'payment.preferenceId':String(data.id||''),updatedAt:FieldValue.serverTimestamp()});
 return {initPoint:url};
});
export const startPixPayment=onCall({region,secrets:[mpToken],maxInstances:20},async(request)=>{
 const uid=uidFrom(request),orderId=safeString(request.data?.orderId,130);
 const cpf=digits(request.data?.cpf);
 if(!validCpf(cpf))throw new HttpsError('invalid-argument','CPF inválido para emissão do Pix.');
 const {ref,order}=await owned(orderId,uid);
 if(order.payment?.method!=='pix'||order.payment?.status==='paid'||order.status==='Cancelado')reject('Pix indisponível para este pedido.');
 if(order.payment?.pixCode)return {ready:true};
 const settings=(await firestore.doc('settings/public').get()).data();
 if(!settings?.payments?.pix)reject('Pix desativado temporariamente.');
 const email=order.customer?.email;
 if(typeof email!=='string'||!email.includes('@'))reject('Informe um e-mail para pagamento Pix.');
 const {token,webhook}=getPaymentEnvironment();
 const response=await fetch('https://api.mercadopago.com/v1/payments',{
  method:'POST',
  headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',
   'X-Idempotency-Key':crypto.createHash('sha256').update('pix:'+orderId).digest('hex')},
  body:JSON.stringify({
   transaction_amount:order.total,description:`Delícia do Nordeste · ${orderId.slice(-8)}`,
   payment_method_id:'pix',external_reference:orderId,notification_url:webhook,
   payer:{email,first_name:order.customer.name,identification:{type:'CPF',number:cpf}}
  })
 });
 if(!response.ok){console.error('MP pix HTTP',response.status);throw new HttpsError('unavailable','Não foi possível emitir o Pix. Confira os dados e tente novamente.');}
 const data:any=await response.json();
 const code=data.point_of_interaction?.transaction_data?.qr_code;
 const base64=data.point_of_interaction?.transaction_data?.qr_code_base64;
 if(typeof code!=='string'||!code)throw new HttpsError('unavailable','Mercado Pago não retornou um Pix válido.');
 await ref.update({'payment.pixCode':code,'payment.pixBase64':typeof base64==='string'?base64:'',
  'payment.providerId':String(data.id||''),updatedAt:FieldValue.serverTimestamp()});
 return {ready:true};
});
export const adminUpdateOrderStatus=onCall({region},async(request)=>{
 adminOnly(request);
 const orderId=safeString(request.data?.orderId,130),next=safeString(request.data?.status,30);
 const docRef=firestore.collection('orders').doc(orderId);
 const allowed:Record<string,string[]>={
  'Recebido':['Em preparo','Cancelado'],
  'Em preparo':['Saiu para entrega','Pronto para retirar','Cancelado'],
  'Saiu para entrega':['Entregue'],
  'Pronto para retirar':['Entregue'],
  'Entregue':[],
  'Cancelado':[]
 };
 return firestore.runTransaction(async tx=>{
  const snap=await tx.get(docRef);
  if(!snap.exists)throw new HttpsError('not-found','Pedido não encontrado.');
  const order=snap.data()!;
  if(!allowed[order.status]?.includes(next))reject('Mudança de etapa inválida. Siga a sequência do pedido.');
  if(next==='Saiu para entrega'&&order.kind!=='delivery'||next==='Pronto para retirar'&&order.kind==='delivery')
   reject('A etapa não corresponde ao tipo de pedido.');
  if(['pix','mercadopago'].includes(order.payment?.method)&&order.payment?.status!=='paid'&&next!=='Cancelado')
   reject('Aguarde o Mercado Pago confirmar o pagamento.');
  tx.update(docRef,{status:next,updatedAt:FieldValue.serverTimestamp(),
    history:FieldValue.arrayUnion({status:next,at:new Date().toISOString()})});
  return {success:true};
 });
});
export const adminConfirmManualPayment=onCall({region},async(request)=>{
 adminOnly(request);
 const orderId=safeString(request.data?.orderId,130);
 const ref=firestore.collection('orders').doc(orderId);
 const snap=await ref.get();if(!snap.exists)throw new HttpsError('not-found','Pedido não encontrado.');
 const order=snap.data()!;
 if(!['cash','cardOnDelivery'].includes(order.payment?.method))reject('Pagamento online só pode ser confirmado pelo provedor.');
 await ref.update({'payment.status':'paid',updatedAt:FieldValue.serverTimestamp()});
 return {success:true};
});
export const mercadoPagoWebhook=onRequest({region,secrets:[mpToken,mpSecret],maxInstances:20},async(req,res)=>{
 if(req.method!=='POST'){res.status(405).send('Method not allowed');return;}
 const dataId=req.query['data.id'];
 const id=Array.isArray(dataId)?null:dataId;
 if(!mpWebhookValid({dataId:id,requestId:req.header('x-request-id'),signature:req.header('x-signature'),secret:mpSecret.value()})){
  res.status(401).json({error:'Assinatura inválida'});return;
 }
 const topic=String(req.query.type||req.body?.type||'');
 if(topic!=='payment'){res.status(200).send('Ignorado');return;}
 try{
  const token=mpToken.value();
  const mp=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(String(id))}`,{
   headers:{Authorization:`Bearer ${token}`}
  });
  if(!mp.ok){res.status(503).send('Consulta ao provedor indisponível');return;}
  const payment:any=await mp.json();
  const orderId=String(payment.external_reference||'');
  if(!/^[a-zA-Z0-9_-]{8,130}$/.test(orderId)){res.status(200).send('Sem referência');return;}
  const ref=firestore.collection('orders').doc(orderId);
  await firestore.runTransaction(async tx=>{
   const snap=await tx.get(ref);
   if(!snap.exists)return;
   const order=snap.data()!;
   const expected=toCents(order.total);
   const received=toCents(payment.transaction_amount);
   if(!Number.isFinite(expected)||!Number.isFinite(received)||expected!==received||
    payment.currency_id!=='BRL'||String(payment.id)!==String(id)||
    !['pix','mercadopago'].includes(order.payment?.method))return;
   if(order.payment.method==='pix'&&order.payment.providerId&&order.payment.providerId!==String(id))return;
   const status=normalizeOrderPayment(payment.status);
   if(order.payment.status===status||(order.payment.status==='paid'&&status==='pending')||
      (order.payment.status==='refunded'&&status!=='refunded'))return;
   tx.update(ref,{'payment.status':status,'payment.lastProviderId':String(id),
      updatedAt:FieldValue.serverTimestamp()});
  });
  res.status(200).send('OK');
 }catch(e){console.error('Falha webhook:',e);res.status(503).send('Aguardando nova tentativa');}
});
