import {useCallback,useEffect,useRef,useState} from 'react';
import {ImagePlus,UploadCloud,Trash2,SlidersHorizontal} from 'lucide-react';
import {supabase,erroLegivel} from './backend';
import {ALTURA_FOTO,LARGURA_FOTO,pintarImagem,recorteInicial,exportarWebp,validarArquivoImagem,type Recorte} from './imagem';
type Props={foto:string;nome:string;onSalvar:(url:string)=>void;produtoId:string;titulo?:string};
export function EditorFoto({foto,nome,onSalvar,produtoId,titulo="Foto do prato"}:Props){
 const canvas=useRef<HTMLCanvasElement>(null);
 const imagem=useRef<ImageBitmap|null>(null);
 const [file,setFile]=useState<File|null>(null);
 const [recorte,setRecorte]=useState<Recorte>(recorteInicial);
 const [enviando,setEnviando]=useState(false);
 const [erro,setErro]=useState(''),[informacao,setInformacao]=useState('');
 const redraw=useCallback(()=>{
  const el=canvas.current, img=imagem.current;
  if(!el||!img)return;
  const ctx=el.getContext('2d');if(!ctx)return;
  pintarImagem(ctx,img,img.width,img.height,recorte,img.width,img.height);
 },[recorte]);
 useEffect(()=>{redraw();},[redraw,file]);
 useEffect(()=>()=>{imagem.current?.close();},[]);
 const escolher=async(f:File|undefined)=>{
  if(!f)return;setErro('');setInformacao('');
  const erroArquivo=validarArquivoImagem(f);
  if(erroArquivo){setErro(erroArquivo);return;}
  try{
   const bitmap=await createImageBitmap(f);
   if(bitmap.width<320||bitmap.height<240){bitmap.close();throw new Error('A foto precisa ter pelo menos 320 × 240 pixels.');}
   imagem.current?.close();imagem.current=bitmap;
   setRecorte(recorteInicial);setFile(f);
  }catch(e){setErro(erroLegivel(e));}
 };
 const enviar=async()=>{
  if(!file||!canvas.current||!supabase||!imagem.current)return;
  setEnviando(true);setErro('');setInformacao('');
  try{
   const fotoWebp=await exportarWebp(canvas.current);
   if(fotoWebp.size>2*1024*1024)throw new Error('O resultado excedeu 2 MB. Selecione uma foto mais simples.');
   const caminho=`${produtoId.replace(/[^a-zA-Z0-9_-]/g,'')}/${crypto.randomUUID()}.webp`;
   const {error}=await supabase.storage.from('sc-fotos-cardapio').upload(caminho,fotoWebp,{
    cacheControl:'31536000',contentType:'image/webp',upsert:false
   });
   if(error)throw error;
   const {data}=supabase.storage.from('sc-fotos-cardapio').getPublicUrl(caminho);
   if(!data.publicUrl)throw new Error('Não foi possível gerar URL pública da foto.');
   onSalvar(data.publicUrl);setInformacao('Imagem enviada. Clique em Salvar produto para guardar a alteração.');
   setFile(null);imagem.current?.close();imagem.current=null;
  }catch(e){setErro(erroLegivel(e));}
  finally{setEnviando(false);}
 };
 return <section className="adm-editor-foto">
  <h4><ImagePlus size={18}/> {titulo}</h4>
  <div className="adm-editor-foto__layout">
   <div className="adm-editor-foto__visual">
    {file?<canvas ref={canvas} width={LARGURA_FOTO} height={ALTURA_FOTO} role="img" aria-label="Prévia do enquadramento em formato 4 por 3"/>:
     foto?<img src={foto} alt={`Foto atual do prato ${nome||'sem nome'}`}/>:
     <div className="adm-editor-foto__vazio"><ImagePlus size={29}/><span>Nenhuma imagem cadastrada</span></div>}
   </div>
   <div className="adm-editor-foto__controles">
    <label className="adm-upload"><UploadCloud size={20}/><span>Selecionar imagem do aparelho</span>
     <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void escolher(e.target.files?.[0])}/></label>
    <p className="adm-pequeno">JPG, PNG ou WebP, até 8 MB. A imagem será centralizada e otimizada em 960 × 720, no formato padrão dos cards.</p>
    {file&&<>
     <label>Zoom <output>{Math.round(recorte.zoom*100)}%</output>
      <input type="range" min="1" max="2.5" step=".05" value={recorte.zoom} onChange={e=>setRecorte(c=>({...c,zoom:Number(e.target.value)}))}/></label>
     <label>Posição horizontal <output>{recorte.x}%</output>
      <input type="range" min="0" max="100" step="5" value={recorte.x} onChange={e=>setRecorte(c=>({...c,x:Number(e.target.value)}))}/></label>
     <label>Posição vertical <output>{recorte.y}%</output>
      <input type="range" min="0" max="100" step="5" value={recorte.y} onChange={e=>setRecorte(c=>({...c,y:Number(e.target.value)}))}/></label>
     <button type="button" className="adm-btn adm-btn--full" disabled={enviando} onClick={()=>void enviar()}><UploadCloud size={18}/>{enviando?'Enviando foto...':'Enviar foto otimizada'}</button>
    </>}
    {foto&&<button type="button" className="adm-remover-foto" onClick={()=>{onSalvar('');setFile(null);setInformacao('Imagem removida do produto. Clique em Salvar produto para confirmar.');}}><Trash2 size={16}/> Remover foto deste prato</button>}
   </div>
  </div>
  {erro&&<p className="adm-erro" role="alert">{erro}</p>}
  {informacao&&<p className="adm-info" role="status">{informacao}</p>}
 </section>;
}
