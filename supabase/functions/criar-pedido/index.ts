// Supabase Edge Function: criar-pedido
// O navegador NUNCA define preço, taxa, número ou status do pedido.
// Sem catálogo real, captcha e segredo do servidor, o endpoint não opera.
import {createClient} from 'npm:@supabase/supabase-js@2.119.0';

type Linha={produtoId:string;variacaoId?:string;opcionaisIds?:string[];quantidade:number;observacao?:string};
type Pedido={
 cliente:{nome:string;telefone:string;cep?:string;rua?:string;numero?:string;complemento?:string;
 bairro?:string;cidade?:string;uf?:string;referencia?:string};
 tipo:'entrega'|'retirada'|'local';
 pagamento:'pix'|'cartao'|'dinheiro';trocoPara?:string;observacoesGerais?:string;
 linhas:Linha[];captcha:string;total_cliente_centavos:number;
};
const url=Deno.env.get('SUPABASE_URL')||'';
const segredo=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const captchaSecret=Deno.env.get('TURNSTILE_SECRET_KEY')||'';
const salt=Deno.env.get('RATE_LIMIT_SALT')||'';
const origens=new Set((Deno.env.get('SITE_ORIGINS')||'https://daniel-soliz.github.io')
 .split(',').map(x=>x.trim()).filter(Boolean));
const admin=url&&segredo?createClient(url,segredo,{auth:{persistSession:false,autoRefreshToken:false}}):null;
const norm=(t:string)=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
const texto=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const cents=(v:unknown)=>{
 const n=Number(v);
 if(!Number.isFinite(n)||n<0||n>100000)return null;
 return Math.round(n*100);
};
const json=(data:unknown,status:number,origin:string)=>new Response(JSON.stringify(data),{
 status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
 'Access-Control-Allow-Origin':origin,'Vary':'Origin',
 'Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type',
 'Access-Control-Allow-Methods':'POST,OPTIONS'}
});
const recusado=(mensagem:string,status:number,origin:string)=>json({error:mensagem},status,origin);
async function sha(texto:string){
 const dados=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(texto));
 return [...new Uint8Array(dados)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
Deno.serve(async request=>{
 const origin=request.headers.get('Origin')||'';
 if(!origens.has(origin))return new Response('Origem não autorizada',{status:403});
 if(request.method==='OPTIONS')return json({},200,origin);
 if(request.method!=='POST')return recusado('Método inválido.',405,origin);
 if(!admin||!captchaSecret||!salt)return recusado('Recebimento online ainda não configurado.',503,origin);
 try{
  const raw=await request.text();
  if(raw.length>14000)return recusado('Pedido excedeu o tamanho permitido.',413,origin);
  const pedido=JSON.parse(raw) as Pedido;
  const nome=texto(pedido?.cliente?.nome,120),telefone=texto(pedido?.cliente?.telefone,22).replace(/\D/g,'');
  const modalidade=pedido?.tipo,pagamento=pedido?.pagamento;
  if(nome.length<2||!/^\d{10,11}$/.test(telefone))return recusado('Informe nome e telefone válidos.',400,origin);
  if(!['entrega','retirada','local'].includes(modalidade)||!['pix','cartao','dinheiro'].includes(pagamento))
   return recusado('Modalidade ou pagamento inválido.',400,origin);
  if(!Array.isArray(pedido.linhas)||!pedido.linhas.length||pedido.linhas.length>25)
   return recusado('Adicione de 1 a 25 itens ao pedido.',400,origin);
  const captcha=texto(pedido.captcha,3000);
  if(!captcha)return recusado('Confirme a verificação de segurança.',400,origin);
  const enderecoIP=(request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')||'sem-ip').split(',')[0].trim();
  const ipHash=await sha(salt+':'+enderecoIP);
  const limite=new Date(Date.now()-15*60000).toISOString();
  const {count,error:rateError}=await admin.from('sc_pedidos').select('id',{count:'exact',head:true})
   .eq('ip_hash',ipHash).gte('criado_em',limite);
  if(rateError)return recusado('Não foi possível conferir a disponibilidade. Tente novamente.',503,origin);
  if((count||0)>=4)return recusado('Muitas tentativas recentes. Aguarde antes de enviar outro pedido.',429,origin);
  const verificar=new URLSearchParams({secret:captchaSecret,response:captcha,remoteip:enderecoIP});
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:verificar
  });
  const verificacao=await response.json() as {success?:boolean;hostname?:string};
  const host=new URL(origin).hostname;
  if(!verificacao.success||verificacao.hostname!==host)
   return recusado('Verificação de segurança não aprovada. Atualize a verificação e tente novamente.',403,origin);

  const {data:config,error:confErr}=await admin.from('sc_configuracao').select('*').eq('id','principal').single();
  if(confErr||!config?.catalogo_publicado||!config?.pedidos_ativos)
   return recusado('Pedidos pelo site ainda não estão habilitados.',503,origin);
  if(config.formas_pagamento&&config.formas_pagamento[pagamento]!==true)
   return recusado('Esta forma de pagamento não está disponível.',409,origin);
  const ids=pedido.linhas.map(l=>texto(l?.produtoId,80));
  const {data:itens,error:prodErr}=await admin.from('sc_produtos')
   .select('id,dados,publicado').in('id',[...new Set(ids)]);
  if(prodErr||!itens||itens.length!==new Set(ids).size)
   return recusado('Um ou mais pratos não estão disponíveis.',409,origin);
  const produtos=new Map(itens.map(item=>[item.id,item]));
  let subtotal=0;
  const linhasLimpa=[];
  for(const l of pedido.linhas){
   const prod=produtos.get(l.produtoId);
   const p=prod?.dados;
   if(!prod?.publicado||!p||p.exemplo!==false||p.disponivel===false)
    return recusado('Um dos pratos está indisponível ou ainda é demonstrativo.',409,origin);
   if(!Number.isInteger(l.quantidade)||l.quantidade<1||l.quantidade>30)
    return recusado('Confira a quantidade dos pratos.',400,origin);
   const variacoes=Array.isArray(p.variacoes)?p.variacoes:[];
   const opcionais=Array.isArray(p.opcionais)?p.opcionais:[];
   const variacaoId=texto(l.variacaoId,80);
   const variacao=variacoes.find((x:{id:string})=>x.id===variacaoId);
   if(variacoes.length&&!variacao)return recusado('Um tamanho selecionado não está disponível.',409,origin);
   const extrasIds=Array.isArray(l.opcionaisIds)?l.opcionaisIds:[];
   if(extrasIds.length>12||new Set(extrasIds).size!==extrasIds.length||
    extrasIds.some((v:unknown)=>typeof v!=='string'||!opcionais.some((o:{id:string})=>o.id===v)))
    return recusado('Um adicional escolhido não está disponível.',409,origin);
   const extras=opcionais.filter((o:{id:string})=>extrasIds.includes(o.id));
   const valorBase=cents(p.preco),delta=cents(variacao?.acrescimo||0);
   if(valorBase===null||delta===null)return recusado('Preço indisponível. Consulte a equipe.',503,origin);
   const valExtras=extras.map((o:{preco:number})=>cents(o.preco));
   if(valExtras.some((n:number|null)=>n===null))return recusado('Um adicional está sem preço válido.',503,origin);
   const valorUnitario=valorBase+delta+valExtras.reduce((a:number,b:number|null)=>a+(b||0),0);
   subtotal+=valorUnitario*l.quantidade;
   linhasLimpa.push({
    produtoId:prod.id,nome:texto(p.nome,120),quantidade:l.quantidade,
    variacao:variacao?texto(variacao.nome,80):null,
    opcionais:extras.map((o:{nome:string})=>texto(o.nome,80)),
    observacao:texto(l.observacao,250),valor_unitario_centavos:valorUnitario,
    subtotal_centavos:valorUnitario*l.quantidade
   });
  }
  if(subtotal<=0||subtotal>2000000)return recusado('Subtotal inválido. Consulte a equipe.',400,origin);
  let taxa=0,endereco:null|Record<string,string>=null;
  if(modalidade==='entrega'){
   const configTaxa=cents(config.taxa_entrega),minimo=cents(config.pedido_minimo);
   if(configTaxa===null||minimo===null||!Array.isArray(config.bairros_atendidos)||!config.bairros_atendidos.length)
    return recusado('Delivery não configurado no momento.',409,origin);
   const c=pedido.cliente,cep=texto(c.cep,12).replace(/\D/g,''),bairro=texto(c.bairro,100);
   const cidade=texto(c.cidade,90),uf=texto(c.uf,2).toUpperCase();
   if(!/^\d{8}$/.test(cep)||!texto(c.rua,120)||!texto(c.numero,20)||!bairro||
     norm(cidade)!=='sao paulo'||uf!=='SP'||
     !config.bairros_atendidos.some((x:string)=>norm(x)===norm(bairro)))
    return recusado('Endereço fora da área cadastrada de entrega.',409,origin);
   if(subtotal<minimo)return recusado('O pedido está abaixo do mínimo de entrega.',409,origin);
   taxa=configTaxa;
   endereco={cep,bairro,cidade,uf,rua:texto(c.rua,120),numero:texto(c.numero,20),
    complemento:texto(c.complemento,120),referencia:texto(c.referencia,120)};
  }
  const total=subtotal+taxa;
  if(!Number.isSafeInteger(pedido.total_cliente_centavos)||pedido.total_cliente_centavos!==total)
   return recusado('O preço dos pratos mudou. Atualize o cardápio e revise a sacola.',409,origin);
  if(pagamento==='dinheiro'&&texto(pedido.trocoPara,40)){
   const raw=texto(pedido.trocoPara,40).replace(/^R\$\s*/,'').replace(/\s/g,'');
   const parsed=raw.includes(',')?raw.replace(/\./g,'').replace(',','.'):raw;
   if(!/^\d+(\.\d{1,2})?$/.test(parsed)||Math.round(Number(parsed)*100)<total)
    return recusado('Confira o valor informado para troco.',400,origin);
  }
  const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\D/g,'');
  const codigo=`SC-${hoje}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const {error:insertError}=await admin.from('sc_pedidos').insert({
   codigo,cliente_nome:nome,telefone,modalidade,
   total_centavos:total,subtotal_centavos:subtotal,taxa_entrega_centavos:taxa,
   forma_pagamento:pagamento,pagamento_status:'pendente',
   origem:'site',status:'aguardando_confirmacao',itens:linhasLimpa,
   endereco,observacoes:texto(pedido.observacoesGerais,500),ip_hash:ipHash
  });
  if(insertError)return recusado('Não foi possível registrar o pedido. Tente novamente.',503,origin);
  return json({codigo,total_centavos:total,estado:'aguardando_confirmacao'},201,origin);
 }catch{
  return recusado('Não foi possível registrar o pedido. Confira os dados e tente novamente.',400,origin);
 }
});
