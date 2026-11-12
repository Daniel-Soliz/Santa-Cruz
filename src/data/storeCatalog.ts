// Cardápio ilustrativo. Preços, imagens e disponibilidade são EXEMPLOS.
// A loja real usa a coleção Firestore "products". Itens demo nunca podem ser vendidos.
export type Category = { id:string; name:string; order:number; enabled:boolean };
export type Option = { id:string; name:string; price:number };
export type Product = {
  id:string; name:string; description:string; price:number; categoryId:string;
  image:string; available:boolean; featured:boolean; tags:string[];
  badge?:string; options?:Option[]; demo?:boolean; order:number;
};
export type Hours = { enabled:boolean; opens:string; closes:string };
export type DeliveryZone = { id:string; name:string; prefix:string; fee:number; minutes:number; enabled:boolean };
export type StoreSettings = {
  name:string; phone:string; address:string; minimumDelivery:number; prepMinutes:number;
  deliveryEnabled:boolean; pickupEnabled:boolean; dineInEnabled:boolean; paused:boolean;
  hours:Record<string,Hours>; zones:DeliveryZone[];
  payments:{ pix:boolean; mercadoPago:boolean; cash:boolean; cardOnDelivery:boolean };
  notice:string;
};
export const categories:Category[] = [
  {id:'pratos-do-dia',name:'Pratos do dia',order:1,enabled:true},
  {id:'carnes',name:'Carnes e Grelhados',order:2,enabled:true},
  {id:'tipicos',name:'Típicos Nordestinos',order:3,enabled:true},
  {id:'acompanhamentos',name:'Acompanhamentos',order:4,enabled:true},
  {id:'porcoes',name:'Porções',order:5,enabled:true},
  {id:'sobremesas',name:'Sobremesas',order:6,enabled:true},
  {id:'bebidas',name:'Bebidas',order:7,enabled:true}
];
const img=(id:string)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=72&fm=webp`;
const standardSizes:Option[]=[{id:'individual',name:'Individual',price:0},{id:'duplo',name:'Serve 2 pessoas',price:23}];
export const demoProducts:Product[]=[
  {id:'baiao',name:'Baião de dois da casa',description:'Feijão de corda, arroz, queijo coalho, cheiro-verde e carne de sol.',price:43.9,categoryId:'tipicos',image:img('photo-1546069901-ba9599a7e63c'),available:true,featured:true,tags:['mais-pedidos','serve-2'],badge:'Mais pedido',options:standardSizes,order:1},
  {id:'carne-sol',name:'Carne de sol com macaxeira',description:'Carne na manteiga de garrafa e macaxeira dourada.',price:56.9,categoryId:'carnes',image:img('photo-1544025162-d76694265947'),available:true,featured:true,tags:['mais-pedidos','sem-pimenta'],badge:'Mais pedido',options:standardSizes,order:2},
  {id:'prato-dia',name:'Prato do dia nordestino',description:'Arroz, feijão, farofa, salada fresca e proteína do dia.',price:34.9,categoryId:'pratos-do-dia',image:img('photo-1504674900247-0877df9cc836'),available:true,featured:true,tags:['sem-pimenta'],badge:'Prato do dia',order:3},
  {id:'cuscuz',name:'Cuscuz com queijo coalho',description:'Cuscuz de milho no vapor, manteiga e queijo tostado.',price:24.9,categoryId:'tipicos',image:img('photo-1533089860892-a7c6f0a88666'),available:true,featured:true,tags:['vegetariano','sem-pimenta'],badge:'Novo',order:4},
  {id:'costela',name:'Costela ao molho da casa',description:'Costela cozida lentamente, acompanhada de mandioca.',price:59.9,categoryId:'carnes',image:img('photo-1558030006-450675393462'),available:true,featured:false,tags:['serve-2'],options:standardSizes,order:5},
  {id:'frango',name:'Frango grelhado com baião',description:'Filé grelhado, baião cremoso e vinagrete.',price:36.9,categoryId:'pratos-do-dia',image:img('photo-1532550907401-a500c9a57435'),available:true,featured:false,tags:['sem-pimenta'],order:6},
  {id:'feijao',name:'Feijão tropeiro',description:'Feijão, farinha de mandioca, ovos e temperos.',price:19.9,categoryId:'acompanhamentos',image:img('photo-1547592180-85f173990554'),available:true,featured:false,tags:['sem-pimenta'],order:7},
  {id:'arroz',name:'Arroz branco soltinho',description:'Porção de arroz fresquinho para acompanhar.',price:10,categoryId:'acompanhamentos',image:img('photo-1512058564366-18510be2db19'),available:true,featured:false,tags:['vegetariano','sem-pimenta'],order:8},
  {id:'macaxeira',name:'Macaxeira frita',description:'Palitos crocantes de mandioca com molho da casa.',price:24.9,categoryId:'porcoes',image:img('photo-1573080496219-bb080dd4f877'),available:true,featured:false,tags:['vegetariano','sem-pimenta','serve-2'],order:9},
  {id:'queijo',name:'Queijo coalho na chapa',description:'Espetinhos de queijo dourados, com melado opcional.',price:22.9,categoryId:'porcoes',image:img('photo-1486297678162-eb2a19b0a32d'),available:false,featured:false,tags:['vegetariano'],badge:'Esgotado',order:10},
  {id:'pudim',name:'Pudim de leite',description:'Fatia cremosa com calda de caramelo.',price:13.9,categoryId:'sobremesas',image:img('photo-1551024506-0bccd828d307'),available:true,featured:false,tags:['vegetariano'],order:11},
  {id:'cocada',name:'Cocada da casa',description:'Doce tradicional de coco em porção individual.',price:9.9,categoryId:'sobremesas',image:img('photo-1488477181946-6428a0291777'),available:true,featured:false,tags:['vegetariano'],order:12},
  {id:'suco',name:'Suco natural do dia',description:'Fruta da estação batida na hora, copo de 400 ml.',price:12.9,categoryId:'bebidas',image:img('photo-1544145945-f90425340c7e'),available:true,featured:false,tags:['vegetariano','sem-pimenta'],order:13},
  {id:'refri',name:'Refrigerante lata',description:'Lata de 350 ml, sabores sujeitos à disponibilidade.',price:7,categoryId:'bebidas',image:img('photo-1554866585-cd94860890b7'),available:true,featured:false,tags:['vegetariano'],order:14}
].map(p=>({...p,demo:true}));
export const defaultSettings:StoreSettings={
  name:'Delícia do Nordeste · Santa Cruz',phone:'11960149521',
  address:'Rua Santa Cruz da Conceição, Parque Belém, São Paulo - SP',
  minimumDelivery:25,prepMinutes:30,deliveryEnabled:false,pickupEnabled:true,dineInEnabled:true,paused:false,
  hours:Object.fromEntries(Array.from({length:7},(_,i)=>[String(i),{enabled:i!==1,opens:'08:00',closes:'22:00'}])),
  zones:[],
  payments:{pix:false,mercadoPago:false,cash:true,cardOnDelivery:true},
  notice:'Pratos, fotos e valores de demonstração. Confirme e publique o cardápio real no painel.'
};
export const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export const logo=`${import.meta.env.BASE_URL}assets/aistudio/logo_casa_do_norte_108ee79c.jpg`;
export const mapsUrl='https://www.google.com/maps/search/?api=1&query=Rua+Santa+Cruz+da+Concei%C3%A7%C3%A3o,+Parque+Bel%C3%A9m,+S%C3%A3o+Paulo+-+SP';
export function storeOpen(settings:StoreSettings, date=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(date);
  const weekday=parts.find(p=>p.type==='weekday')?.value || 'Mon';
  const day=String(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(weekday));
  const time=`${parts.find(p=>p.type==='hour')?.value}:${parts.find(p=>p.type==='minute')?.value}`;
  const h=settings.hours[day];
  return !settings.paused && !!h?.enabled && time>=h.opens && time<h.closes;
}
export function quoteZone(settings:StoreSettings,cep:string,subtotal:number){
  if(!settings.deliveryEnabled || !/^\d{8}$/.test(cep.replace(/\D/g,'')))return null;
  const zone=[...settings.zones].filter(z=>z.enabled&&z.prefix&&cep.replace(/\D/g,'').startsWith(z.prefix)).sort((a,b)=>b.prefix.length-a.prefix.length)[0];
  if(!zone)return null;
  return {...zone,fee:zone.fee};
}
