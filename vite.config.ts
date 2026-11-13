import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const config=JSON.parse(readFileSync(fileURLToPath(new URL('./src/data/config.json',import.meta.url)),'utf8'));
const definido=(valor:unknown)=>typeof valor==='string'&&!!valor.trim()&&valor.trim().toUpperCase()!=='PREENCHER';
const site=String(config.siteUrl||'https://daniel-soliz.github.io/Santa-Cruz/').replace(/\/?$/,'/');
const nomes:Record<string,string>={
 'Domingo':'Sunday','Segunda-feira':'Monday','Terça-feira':'Tuesday',
 'Quarta-feira':'Wednesday','Quinta-feira':'Thursday','Sexta-feira':'Friday','Sábado':'Saturday'
};
const schema={
 '@context':'https://schema.org',
 '@type':'Restaurant',
 name:config.nome,
 telephone:`+55${config.whatsapp}`,
 servesCuisine:'Nordestina',
 url:site,
 image:site+'assets/aistudio/logo_casa_do_norte_108ee79c.jpg',
 address:{
  '@type':'PostalAddress',
  streetAddress:`${config.endereco.logradouro}${definido(config.endereco.numero)?', '+config.endereco.numero:''}`,
  addressLocality:config.endereco.cidade,
  addressRegion:config.endereco.uf,
  postalCode:config.endereco.cep,
  addressCountry:'BR'
 },
 openingHoursSpecification:config.horarios.filter((h:{aberto:boolean})=>h.aberto).map((h:{dia:string;abertura:string;fechamento:string})=>({
  '@type':'OpeningHoursSpecification',dayOfWeek:nomes[h.dia]||h.dia,opens:h.abertura,closes:h.fechamento
 })),
 hasMenu:{'@type':'Menu',name:'Cardápio Delícia do Nordeste Santa Cruz',url:site+'#cardapio'},
 ...(definido(config.faixaPreco)?{priceRange:config.faixaPreco}:{})
};

export default defineConfig({
 plugins:[
  react(),tailwindcss(),
  {
   name:'restaurante-seo-dados-configuraveis',
   transformIndexHtml(html:string){
    const json=JSON.stringify(schema).replace(/</g,'\\u003c');
    return html.replace('<!-- RESTAURANTE_SCHEMA -->',`<script type="application/ld+json">${json}</script>`)
      .replaceAll('https://daniel-soliz.github.io/Santa-Cruz/',site);
   },
   generateBundle(){
    this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site.replace(/&/g,'&amp;')}</loc><priority>1.0</priority></url></urlset>\n`});
    this.emitFile({type:'asset',fileName:'robots.txt',source:`User-agent: *\nAllow: /\nSitemap: ${site}sitemap.xml\n`});
   }
  }
 ],
 // Domínio próprio na raiz usa '/'; no github.io/Santa-Cruz/ mantém base histórica.
 base:process.env.DEPLOY_TARGET==='github-pages'?(process.env.PAGES_CUSTOM_DOMAIN==='true'?'/':'/Santa-Cruz/'):'/',
 resolve:{alias:{'@':fileURLToPath(new URL('./src/',import.meta.url))}}
});
