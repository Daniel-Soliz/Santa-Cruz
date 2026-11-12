import crypto from 'node:crypto';

export function toCents(value: unknown): number {
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100000)return NaN;
 return Math.round(value*100);
}
export function digits(value: unknown):string {
 return typeof value==='string'?value.replace(/\D/g,''):'';
}
export function isOpen(settings: any, date=new Date()):boolean{
 if(settings?.paused)return false;
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const weekdays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 const day=String(weekdays.indexOf(parts.find(p=>p.type==='weekday')?.value||'Mon'));
 const hour=parts.find(p=>p.type==='hour')?.value || '00';
 const minute=parts.find(p=>p.type==='minute')?.value || '00';
 const today=settings?.hours?.[day];
 return today?.enabled===true && `${hour}:${minute}`>=today.opens && `${hour}:${minute}`<today.closes;
}
export function shipping(settings:any,kind:string,cep:string,subtotalCents:number){
 if(kind!=='delivery'){
  if(kind==='pickup'&&!settings.pickupEnabled)throw new Error('Retirada indisponível');
  if(kind==='dinein'&&!settings.dineInEnabled)throw new Error('Consumo no local indisponível');
  if(kind!=='pickup'&&kind!=='dinein')throw new Error('Tipo de pedido inválido');
  return {feeCents:0,eta:settings.prepMinutes||30,zone:''};
 }
 if(!settings.deliveryEnabled)throw new Error('Entrega indisponível');
 if(!/^\d{8}$/.test(cep))throw new Error('CEP inválido');
 const zone=(settings.zones||[]).filter((z:any)=>z.enabled===true&&/^\d{2,8}$/.test(z.prefix)&&cep.startsWith(z.prefix)).sort((a:any,b:any)=>b.prefix.length-a.prefix.length)[0];
 if(!zone)throw new Error('Não realizamos entregas neste CEP');
 const fee=toCents(zone.fee);
 if(!Number.isFinite(fee))throw new Error('Taxa de entrega inválida');
 if(subtotalCents<toCents(settings.minimumDelivery||0))throw new Error('Valor abaixo do mínimo para delivery');
 return {feeCents:fee,eta:Math.max(5,Number(zone.minutes)||45),zone:zone.name};
}
export function validCpf(value:string):boolean{
 const cpf=digits(value);if(!/^\d{11}$/.test(cpf)||/^(\d)\1+$/.test(cpf))return false;
 const check=(n:number)=>{const sum=cpf.slice(0,n).split('').reduce((a,d,i)=>a+Number(d)*(n+1-i),0);return ((sum*10)%11)%10;};
 return check(9)===Number(cpf[9])&&check(10)===Number(cpf[10]);
}
export function mpWebhookValid(input:{dataId:unknown;requestId:unknown;signature:unknown;secret:unknown},now=Date.now()):boolean{
 const {dataId,requestId,signature,secret}=input;
 if(typeof dataId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(dataId)||typeof requestId!=='string'||!requestId||typeof signature!=='string'||typeof secret!=='string'||!secret)return false;
 const kv=Object.fromEntries(signature.split(',').map(s=>{const [k,v]=s.trim().split('=');return[k,v];}));
 if(!/^\d{10,13}$/.test(kv.ts||'')||!/^[0-9a-f]{64}$/i.test(kv.v1||''))return false;
 const raw=Number(kv.ts),ts=kv.ts.length===10?raw*1000:raw;
 if(!Number.isFinite(ts)||Math.abs(now-ts)>5*60*1000)return false;
 const message=`id:${dataId.toLowerCase()};request-id:${requestId};ts:${kv.ts};`;
 const hash=crypto.createHmac('sha256',secret).update(message).digest();
 return crypto.timingSafeEqual(hash,Buffer.from(kv.v1,'hex'));
}
