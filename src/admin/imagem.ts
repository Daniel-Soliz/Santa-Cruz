/**
 * Fotos: o recorte é realizado no navegador, antes do upload.
 * Usar canvas elimina a necessidade de armazenar imagens gigantes no banco.
 * Sempre exportamos 960 x 720 em WebP, para alinhar todos os cards.
 */
export const LARGURA_FOTO=960;
export const ALTURA_FOTO=720;
export type Recorte={zoom:number;x:number;y:number};
export const recorteInicial:Recorte={zoom:1,x:50,y:50};

export function pintarImagem(ctx:CanvasRenderingContext2D,imagem:CanvasImageSource,
 largura:number,altura:number,recorte:Recorte,origemLargura:number,origemAltura:number){
 const escala=Math.max(LARGURA_FOTO/origemLargura,ALTURA_FOTO/origemAltura)*recorte.zoom;
 const dw=origemLargura*escala,dh=origemAltura*escala;
 const dx=(LARGURA_FOTO-dw)*recorte.x/100;
 const dy=(ALTURA_FOTO-dh)*recorte.y/100;
 ctx.clearRect(0,0,LARGURA_FOTO,ALTURA_FOTO);
 ctx.fillStyle='#fff8ec';ctx.fillRect(0,0,LARGURA_FOTO,ALTURA_FOTO);
 ctx.drawImage(imagem,dx,dy,dw,dh);
}
export function exportarWebp(canvas:HTMLCanvasElement):Promise<Blob>{
 return new Promise((resolve,reject)=>{
  canvas.toBlob(blob=>{
   if(blob&&blob.type==='image/webp')resolve(blob);
   else reject(new Error('Este navegador não conseguiu gerar WebP. Atualize o navegador e tente novamente.'));
  },'image/webp',.82);
 });
}
export function validarArquivoImagem(file:File){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))
  return 'Use JPG, PNG ou WebP. SVG, GIF e arquivos desconhecidos não são aceitos.';
 if(file.size>8*1024*1024)return 'A foto pode ter no máximo 8 MB antes de ser otimizada.';
 if(file.size===0)return 'A foto selecionada está vazia.';
 return '';
}
