import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {isOpen,shipping,toCents,validCpf,mpWebhookValid} from '../lib/core.js';

const hours=Object.fromEntries(Array.from({length:7},(_,i)=>[String(i),{enabled:i!==1,opens:'08:00',closes:'22:00'}]));
const settings={hours,paused:false,pickupEnabled:true,dineInEnabled:true,deliveryEnabled:true,prepMinutes:30,
  minimumDelivery:25,zones:[{name:'Parque Belém',prefix:'02850',fee:7,minutes:45,enabled:true}]};
test('respeita horário de São Paulo, segunda fechada',()=>{
 assert.equal(isOpen(settings,new Date('2026-11-12T14:00:00.000Z')),true);
 assert.equal(isOpen(settings,new Date('2026-11-09T14:00:00.000Z')),false);
 assert.equal(isOpen(settings,new Date('2026-11-12T01:00:00.000Z')),false);
});
test('não envia a CEP fora da zona e calcula taxa',()=>{
 assert.equal(shipping(settings,'delivery','02850100',5000).feeCents,700);
 assert.throws(()=>shipping(settings,'delivery','01001000',5000),/Não realizamos/);
 assert.throws(()=>shipping(settings,'delivery','02850100',1000),/mínimo/);
 assert.equal(shipping(settings,'pickup','',5000).feeCents,0);
});
test('CPF e valores verificados',()=>{
 assert.equal(validCpf('529.982.247-25'),true);
 assert.equal(validCpf('111.111.111-11'),false);
 assert.equal(toCents(29.9),2990);
 assert.ok(Number.isNaN(toCents(-1)));
});
test('webhook recusa assinatura alterada ou expirada',()=>{
 const secret='segredo-de-teste',dataId='123456789',requestId='abc-123',now=Date.now(),ts=String(now);
 const digest=crypto.createHmac('sha256',secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest('hex');
 const args={dataId,requestId,secret,signature:`ts=${ts},v1=${digest}`};
 assert.equal(mpWebhookValid(args,now),true);
 assert.equal(mpWebhookValid({...args,dataId:'98765'},now),false);
 assert.equal(mpWebhookValid({...args,signature:'ts=4,v1=abc'},now),false);
 assert.equal(mpWebhookValid(args,now+600000),false);
});
