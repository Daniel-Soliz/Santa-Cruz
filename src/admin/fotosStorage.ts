import {supabase} from './backend';

/** Só permite apagar imagens geradas por este produto no bucket Santa Cruz. */
export function caminhoImagemDaLoja(url:string,produtoId:string):string|null{
 if(!url||!produtoId)return null;
 try{
  const u=new URL(url);
  if(u.protocol!=='https:')return null;
  const prefix='/storage/v1/object/public/sc-fotos-cardapio/';
  const inicio=u.pathname.indexOf(prefix);
  if(inicio<0)return null;
  const caminho=decodeURIComponent(u.pathname.slice(inicio+prefix.length));
  const pasta=produtoId.replace(/[^a-zA-Z0-9_-]/g,'');
  if(!pasta||!caminho.startsWith(pasta+'/')||!/^[-\w/]+\.webp$/.test(caminho)||
     caminho.includes('..')||caminho.includes('//'))return null;
  // URLs do Supabase devem vir do mesmo projeto usado pelo ADM.
  const supa=import.meta.env.VITE_SUPABASE_URL as string|undefined;
  if(!supa||u.origin!==new URL(supa).origin)return null;
  return caminho;
 }catch{return null;}
}
export async function removerFotoAntiga(url:string,produtoId:string){
 const caminho=caminhoImagemDaLoja(url,produtoId);
 if(!caminho||!supabase)return;
 const {error}=await supabase.storage.from('sc-fotos-cardapio').remove([caminho]);
 if(error)throw error;
}
