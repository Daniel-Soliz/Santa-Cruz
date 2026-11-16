import {readFileSync} from 'node:fs';
import {transform} from 'esbuild';
const codigo=readFileSync('supabase/functions/criar-pedido/index.ts','utf8');
try{
 const resultado=await transform(codigo,{loader:'ts',format:'esm',platform:'neutral',target:'es2022'});
 if(!resultado.code.includes('Deno.serve'))throw new Error('Handler de pedidos ausente');
 console.log('Edge Function: sintaxe TS validada pelo esbuild.');
}catch(e){console.error(e);process.exit(1);}
