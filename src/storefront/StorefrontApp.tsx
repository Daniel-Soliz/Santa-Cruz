import React, {useEffect,useMemo,useState} from 'react';
import {onSnapshot,collection,doc} from 'firebase/firestore';
import {ShoppingBag,Menu as MenuIcon,Search,Plus,Minus,X,MapPin,Clock3,ArrowRight,Check,ChevronLeft,ChefHat,Truck,Store,Utensils,Phone,SlidersHorizontal,MessageCircle,Wallet,CheckCircle2,AlertCircle} from 'lucide-react';
import {auth,call,configured,db,guest} from '../lib/firebase';
import {categories as demoCats,demoProducts,defaultSettings,money,logo,mapsUrl,storeOpen,quoteZone, type Product,type Category,type StoreSettings} from '../data/storeCatalog';
import {AdminPanel} from './AdminPanel';
import {Checkout} from './Checkout';
import {Tracking} from './Tracking';

type CartLine={key:string;id:string;name:string;image:string;price:number;quantity:number;optionId?:string;optionName?:string;notes:string;demo:boolean};
type Method='pix'|'mercadopago'|'cash'|'cardOnDelivery';
type DeliveryType='pickup'|'delivery'|'dinein';
type Customer={name:string;phone:string;email:string;cep:string;street:string;number:string;neighborhood:string;complement:string;reference:string};
const initialCustomer:Customer={name:'',phone:'',email:'',cep:'',street:'',number:'',neighborhood:'',complement:'',reference:''};
const whatsapp='https://wa.me/5511960149521?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20site.';
function activePath(){return decodeURI(window.location.hash.slice(1)||'/').split('?')[0];}
function jump(path:string){window.location.hash=path;window.scrollTo({top:0,behavior:'smooth'});}
function showError(err:unknown){const e=err as {message?:string};return e?.message?.replace(/^Firebase:\s*/,'')||'Não foi possível concluir. Tente novamente.';}
const demoDisclaimer='Catálogo ilustrativo. Fotos e preços são exemplos. A loja só poderá vender após publicar os produtos reais no painel.';
function FoodImage({src,name,large=false}:{src:string;name:string;large?:boolean}){
 const [bad,setBad]=useState(false);
 useEffect(()=>setBad(false),[src]);
 return bad||!src?<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100 text-rose-700"><Utensils size={large?56:36}/></div>:
 <img loading="lazy" decoding="async" src={src} onError={()=>setBad(true)} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"/>;
}
function ItemCard({p,onAdd}:{p:Product;onAdd:(p:Product)=>void}){
 return <article className="group overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-stone-200/80 transition hover:-translate-y-1 hover:shadow-lg">
   <div className="relative h-44 sm:h-48 overflow-hidden"><FoodImage src={p.image} name={p.name}/>
    {p.badge&&<span className="absolute top-3 left-3 rounded-full bg-[#F9D71C] px-3 py-1 text-[11px] font-extrabold text-[#722238]">{p.badge}</span>}
    {!p.available&&<span className="absolute inset-0 flex items-center justify-center bg-stone-900/65 text-lg font-extrabold text-white">Esgotado</span>}
   </div>
   <div className="p-4 sm:p-5"><h3 className="font-heading min-h-12 text-lg font-extrabold leading-tight text-[#722238]">{p.name}</h3>
     <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-relaxed text-stone-600">{p.description}</p>
     <div className="mt-4 flex items-center justify-between gap-2">
      <strong className="text-lg font-extrabold text-[#722238]">{money(p.price)}</strong>
      <button disabled={!p.available} onClick={()=>onAdd(p)} className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-[#E8365D] px-4 py-2 font-bold text-white hover:bg-[#c72a4e] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"><Plus size={16}/>{p.available?'Adicionar':'Esgotado'}</button>
     </div>
   </div>
 </article>;
}
function Modal({p,onClose,onAdd}:{p:Product;onClose:()=>void;onAdd:(line:CartLine)=>void}){
 const [qty,setQty]=useState(1);const [option,setOption]=useState(p.options?.[0]?.id||'');const [notes,setNotes]=useState('');
 const selected=p.options?.find(o=>o.id===option);
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[onClose]);
 return <div role="presentation" className="fixed inset-0 z-[80] flex items-end justify-center bg-[#24131c]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section role="dialog" aria-modal="true" aria-labelledby="item-title" className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
   <div className="relative h-48 sm:h-60"><FoodImage src={p.image} name={p.name} large/><button onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#722238] shadow"><X/></button></div>
   <div className="p-5 sm:p-7"><h2 id="item-title" className="font-heading text-3xl font-extrabold text-[#722238]">{p.name}</h2>
    <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.description}</p>
    {p.options&&<fieldset className="mt-5"><legend className="mb-2 font-bold text-stone-900">Escolha o tamanho</legend><div className="space-y-2">{p.options.map(o=><label key={o.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${option===o.id?'border-[#E8365D] bg-rose-50':'border-stone-200'}`}><span className="flex items-center gap-2"><input type="radio" name="option" checked={option===o.id} onChange={()=>setOption(o.id)}/>{o.name}</span><b>{o.price?'+ '+money(o.price):'Incluído'}</b></label>)}</div></fieldset>}
    <label className="mt-5 block text-sm font-bold text-stone-800">Observações <span className="font-normal text-stone-500">(opcional)</span>
      <textarea maxLength={250} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex.: sem cebola, molho separado" className="mt-2 w-full rounded-xl border border-stone-300 p-3 text-sm"/></label>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3 rounded-xl border border-stone-200 p-1"><button aria-label="Diminuir" className="grid h-10 w-10 place-items-center rounded-lg bg-stone-100" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={18}/></button><b>{qty}</b><button aria-label="Aumentar" className="grid h-10 w-10 place-items-center rounded-lg bg-stone-100" onClick={()=>setQty(Math.min(20,qty+1))}><Plus size={18}/></button></div>
    <button onClick={()=>{onAdd({key:[p.id,option,notes.trim()].join(':'),id:p.id,name:p.name,image:p.image,price:p.price+(selected?.price||0),quantity:qty,optionId:selected?.id,optionName:selected?.name,notes:notes.trim(),demo:!!p.demo});onClose();}} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#E8365D] px-4 py-3 font-extrabold text-white">Adicionar {money((p.price+(selected?.price||0))*qty)} <Plus size={18}/></button></div>
   </div>
  </section>
 </div>;
}
function CartDrawer({lines,onClose,onChange,onRemove}:{lines:CartLine[];onClose:()=>void;onChange:(key:string,delta:number)=>void;onRemove:(key:string)=>void}){
 const total=lines.reduce((sum,l)=>sum+l.price*l.quantity,0);
 return <div className="fixed inset-0 z-[70] bg-[#26101a]/60" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section role="dialog" aria-modal="true" aria-label="Sacola do pedido" className="ml-auto flex h-full w-full max-w-[440px] flex-col bg-white shadow-xl">
   <div className="flex items-center justify-between border-b p-5"><h2 className="font-heading text-2xl font-extrabold text-[#722238]">Meu pedido <span className="text-sm text-stone-500">({lines.reduce((a,b)=>a+b.quantity,0)})</span></h2><button onClick={onClose} aria-label="Fechar carrinho" className="grid h-11 w-11 place-items-center rounded-full bg-stone-100"><X/></button></div>
   <div className="flex-1 space-y-4 overflow-auto p-5">{lines.length?lines.map(line=><article key={line.key} className="flex gap-3 border-b pb-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><FoodImage src={line.image} name={line.name}/></div><div className="min-w-0 flex-1"><b className="text-sm text-[#722238]">{line.name}</b><p className="text-xs text-stone-500">{line.optionName}{line.notes?` · ${line.notes}`:''}</p><strong className="text-sm text-[#E8365D]">{money(line.price*line.quantity)}</strong><div className="mt-2 flex items-center gap-3"><button aria-label="Diminuir" onClick={()=>onChange(line.key,-1)} className="grid h-9 w-9 place-items-center rounded-lg border"><Minus size={16}/></button><b>{line.quantity}</b><button aria-label="Aumentar" onClick={()=>onChange(line.key,1)} className="grid h-9 w-9 place-items-center rounded-lg border"><Plus size={16}/></button><button className="ml-auto text-xs font-bold text-rose-700" onClick={()=>onRemove(line.key)}>Remover</button></div></div></article>):<div className="py-12 text-center text-stone-600"><ShoppingBag className="mx-auto mb-3 text-[#E8365D]" size={40}/><b>Sua sacola está vazia.</b><p className="mt-2 text-sm">Escolha seus pratos no cardápio.</p></div>}</div>
   <div className="border-t bg-[#FFF8EC] p-5"><div className="mb-4 flex justify-between font-bold"><span>Subtotal</span><span>{money(total)}</span></div><button disabled={!lines.length} onClick={()=>{onClose();jump('/checkout');}} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8365D] px-5 py-4 font-extrabold text-white disabled:opacity-40">Finalizar pedido <ArrowRight size={19}/></button></div>
  </section>
 </div>;
}
function Header({count,openCart,route,open}:{count:number;openCart:()=>void;route:string;open:boolean}){
 const [mobile,setMobile]=useState(false);
 return <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/95 shadow-sm backdrop-blur-md">
  <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
   <a href="#/" className="flex min-w-0 items-center gap-3"><img className="h-12 w-12 rounded-full border-2 border-[#F9D71C] object-cover" src={logo} alt="Logotipo Casa do Norte Santa Cruz"/><span className="min-w-0 leading-tight"><b className="block truncate font-heading text-lg text-[#722238]">Delícia do Nordeste</b><small className="text-[11px] font-semibold text-stone-500">Santa Cruz · Parque Belém</small></span></a>
   <nav aria-label="Navegação principal" className="hidden items-center gap-7 font-bold text-sm text-[#722238] md:flex"><a href="#/" aria-current={route==='/'?'page':undefined}>Início</a><a href="#/cardapio" aria-current={route==='/cardapio'?'page':undefined}>Cardápio</a><a href="#/como-chegar">Como chegar</a></nav>
   <div className="flex items-center gap-2"><span className={`hidden rounded-full px-3 py-1 text-[11px] font-extrabold sm:inline-block ${open?'bg-emerald-100 text-emerald-800':'bg-rose-100 text-rose-800'}`}>{open?'Aberto agora':'Fechado agora'}</span>
   <button onClick={openCart} aria-label={`Abrir sacola com ${count} itens`} className="relative grid h-11 w-11 place-items-center rounded-xl bg-[#722238] text-white"><ShoppingBag size={21}/>{count>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#F9D71C] px-1 text-[10px] font-extrabold text-[#722238]">{count}</span>}</button>
   <button onClick={()=>setMobile(!mobile)} aria-label="Menu" className="grid h-11 w-11 place-items-center rounded-xl border md:hidden"><MenuIcon/></button></div>
  </div>
  {mobile&&<nav className="flex flex-col gap-1 border-t bg-white p-4 font-bold text-[#722238] md:hidden" aria-label="Navegação móvel">{[['Início','/'],['Cardápio','/cardapio'],['Como chegar','/como-chegar']].map(([label,url])=><a key={url} className="rounded-xl px-3 py-3 hover:bg-rose-50" href={'#'+url} onClick={()=>setMobile(false)}>{label}</a>)}</nav>}
 </header>;
}
function Footer(){
 return <footer className="mt-16 bg-[#442833] px-5 py-10 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
  <div><b className="font-heading text-xl">Delícia do Nordeste</b><p className="mt-1 text-xs text-rose-100">Casa do Norte · Santa Cruz · Parque Belém</p></div>
  <div className="flex flex-wrap gap-5 text-sm"><a href="#/como-chegar">Localização e horários</a><a href="#/admin">Acesso da equipe</a><a href={whatsapp} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 text-rose-100"><MessageCircle size={15}/> Suporte no WhatsApp</a></div>
 </div><p className="mx-auto mt-7 max-w-7xl border-t border-white/20 pt-5 text-xs text-rose-100">© {new Date().getFullYear()} Delícia do Nordeste. Valores e disponibilidade são confirmados no checkout.</p></footer>;
}
function Home({products,onAdd,open}:{products:Product[];onAdd:(p:Product)=>void;open:boolean}){
 const highlight=products.filter(p=>p.featured).slice(0,4);
 return <><section className="bg-gradient-to-br from-[#fff0d6] via-[#FFF8EC] to-[#ffe5e7]"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-16"><div>
  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#E8365D] shadow-sm"><ChefHat size={17}/> Feito com carinho, sabor de casa</span>
  <h1 className="mt-5 max-w-xl font-heading text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.04] text-[#722238]">O Nordeste chegou <span className="text-[#E8365D]">na sua mesa.</span></h1>
  <p className="mt-4 max-w-lg text-base leading-relaxed text-stone-700">Baião de dois, carne de sol e pratos que abraçam. Escolha seus favoritos, monte o pedido e acompanhe tudo por aqui.</p>
  <a href="#/cardapio" className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-2xl bg-[#E8365D] px-7 py-4 font-extrabold text-white shadow-lg hover:bg-[#c9264b]">Ver cardápio <ArrowRight size={20}/></a>
  {!open&&<p className="mt-4 text-sm font-bold text-[#A32246]">Fechado agora. Você pode conferir o cardápio, mas pedidos são recebidos apenas no horário.</p>}
  </div><div className="group relative h-[280px] overflow-hidden rounded-[32px] bg-[#722238] shadow-2xl sm:h-[390px]"><FoodImage src={highlight[0]?.image||''} name="Prato da casa" large/><div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur"><p className="text-[11px] font-bold uppercase tracking-widest text-[#E8365D]">Sabor da casa</p><h2 className="font-heading text-xl font-extrabold text-[#722238]">{highlight[0]?.name||'Pratos nordestinos'}</h2></div></div></div></section>
 <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="mb-6 flex items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-widest text-[#E8365D]">Queridinhos da casa</p><h2 className="font-heading text-3xl font-extrabold text-[#722238]">Pratos mais pedidos</h2></div><a href="#/cardapio" className="shrink-0 text-sm font-bold text-[#A32246]">Ver tudo →</a></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{highlight.map(p=><ItemCard p={p} onAdd={onAdd} key={p.id}/>)}</div></section>
 <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6"><div className="rounded-2xl bg-white p-6 shadow-sm"><Utensils className="mb-3 text-[#E8365D]"/><b className="block text-[#722238]">Escolha seu prato</b><p className="mt-2 text-sm text-stone-600">Opções de tamanho e observações para deixar do seu jeito.</p></div><div className="rounded-2xl bg-white p-6 shadow-sm"><Wallet className="mb-3 text-[#E8365D]"/><b className="block text-[#722238]">Pague com segurança</b><p className="mt-2 text-sm text-stone-600">Pix e cartão online após a integração do Mercado Pago.</p></div><div className="rounded-2xl bg-white p-6 shadow-sm"><Truck className="mb-3 text-[#E8365D]"/><b className="block text-[#722238]">Acompanhe o pedido</b><p className="mt-2 text-sm text-stone-600">Da cozinha até a retirada ou entrega, tudo no mesmo lugar.</p></div></section>
 </>;
}
function Catalog({products,cats,onAdd}:{products:Product[];cats:Category[];onAdd:(p:Product)=>void}){
 const [cat,setCat]=useState('all'),[search,setSearch]=useState(''),[filter,setFilter]=useState('all');
 const filtered=products.filter(p=>(cat==='all'||cat===p.categoryId)&&p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))&&(filter==='all'||(filter==='mais-pedidos'?p.featured:p.tags.includes(filter)))).sort((a,b)=>a.order-b.order);
 return <main className="mx-auto max-w-7xl px-4 pb-16 pt-9 sm:px-6">
  <p className="font-bold text-[#E8365D]">Sabores do Nordeste</p><h1 className="font-heading text-4xl font-extrabold text-[#722238]">Nosso cardápio</h1><p className="mt-1 text-sm text-stone-600">Encontre seu prato favorito e personalize o pedido.</p>
  <div className="sticky top-[74px] z-30 -mx-4 mt-7 border-y border-stone-200 bg-[#FFF8EC]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"><div role="group" aria-label="Categorias" className="no-scrollbar flex gap-2 overflow-x-auto pb-1"><button onClick={()=>setCat('all')} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold ${cat==='all'?'bg-[#722238] text-white':'bg-white text-[#722238] ring-1 ring-stone-200'}`}>Todos</button>{cats.filter(c=>c.enabled).sort((a,b)=>a.order-b.order).map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold ${cat===c.id?'bg-[#722238] text-white':'bg-white text-[#722238] ring-1 ring-stone-200'}`}>{c.name}</button>)}</div></div>
  <div className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl border border-stone-200 bg-white px-4"><Search className="text-stone-400" size={19}/><span className="sr-only">Buscar pratos</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar prato pelo nome" className="h-12 w-full outline-none"/></label><label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4"><SlidersHorizontal size={17}/><span className="sr-only">Filtro rápido</span><select value={filter} onChange={e=>setFilter(e.target.value)} className="h-12 w-full min-w-44 bg-transparent text-sm font-semibold outline-none"><option value="all">Todos os pratos</option><option value="mais-pedidos">Mais pedidos</option><option value="sem-pimenta">Sem pimenta</option><option value="vegetariano">Vegetariano</option><option value="serve-2">Porção para 2</option></select></label></div>
  <p className="my-5 text-sm text-stone-500">{filtered.length} {filtered.length===1?'item encontrado':'itens encontrados'}</p>
  {filtered.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(p=><ItemCard key={p.id} p={p} onAdd={onAdd}/>)}</div>:<div className="rounded-2xl bg-white p-12 text-center text-stone-600">Nenhum prato encontrado. Tente outra busca.</div>}
 </main>;
}
function Location({settings}:{settings:StoreSettings}){
 return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><h1 className="font-heading text-4xl font-extrabold text-[#722238]">Como chegar</h1><p className="mt-2 text-stone-600">Venha saborear o Nordeste com a gente!</p><div className="mt-7 grid gap-6 lg:grid-cols-2"><div className="overflow-hidden rounded-3xl bg-white shadow-sm"><iframe title="Localização no Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-96 w-full border-0" src="https://www.google.com/maps?q=Rua%20Santa%20Cruz%20da%20Concei%C3%A7%C3%A3o%2C%20Parque%20Bel%C3%A9m%2C%20S%C3%A3o%20Paulo&output=embed"/></div><div className="space-y-4 rounded-3xl bg-white p-7 shadow-sm"><p className="flex gap-3"><MapPin className="shrink-0 text-[#E8365D]"/>{settings.address}</p><p className="flex gap-3"><Phone className="shrink-0 text-[#E8365D]"/> (11) 96014-9521</p><div className="flex gap-3"><Clock3 className="shrink-0 text-[#E8365D]"/><div><b>Horários</b>{['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].map((d,i)=><p key={d} className="text-sm text-stone-600">{d}: {settings.hours[String(i)]?.enabled?`${settings.hours[String(i)].opens} às ${settings.hours[String(i)].closes}`:'Fechado'}</p>)}</div></div><a href={mapsUrl} className="inline-flex rounded-xl bg-[#722238] px-5 py-3 font-bold text-white" target="_blank" rel="noopener noreferrer">Abrir Google Maps</a></div></div></main>;
}
export function StorefrontApp(){
 const [path,setPath]=useState(activePath),[products,setProducts]=useState<Product[]>(demoProducts),[cats,setCats]=useState<Category[]>(demoCats),[settings,setSettings]=useState<StoreSettings>(defaultSettings),[cart,setCart]=useState<CartLine[]>(()=>{try{return JSON.parse(localStorage.getItem('nordeste_cart_v3')||'[]');}catch{return [];}}),[selected,setSelected]=useState<Product|null>(null),[drawer,setDrawer]=useState(false),[now,setNow]=useState(new Date()),[catalogLoaded,setCatalogLoaded]=useState(false);
 useEffect(()=>{
  const returned=new URLSearchParams(window.location.search).get('order');
  if(returned && /^[a-zA-Z0-9_-]{8,130}$/.test(returned)){
    history.replaceState(null,'',window.location.pathname+'#/pedido/'+encodeURIComponent(returned));
    setPath('/pedido/'+returned);
  }
  const route=()=>{setPath(activePath());setDrawer(false);};
  window.addEventListener('hashchange',route);
  return()=>window.removeEventListener('hashchange',route);
 },[]);
 useEffect(()=>{localStorage.setItem('nordeste_cart_v3',JSON.stringify(cart));},[cart]);
 useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);
 useEffect(()=>{if(!db)return;guest().catch(console.error);const s1=onSnapshot(doc(db,'settings','public'),s=>{if(s.exists())setSettings({...defaultSettings,...s.data(),payments:{...defaultSettings.payments,...s.data().payments}} as StoreSettings);});const s2=onSnapshot(collection(db,'products'),s=>{setCatalogLoaded(!s.empty);setProducts(s.empty?demoProducts:s.docs.map(d=>({...d.data(),id:d.id}) as Product));});const s3=onSnapshot(collection(db,'categories'),s=>{setCats(s.empty?demoCats:s.docs.map(d=>({...d.data(),id:d.id}) as Category));});return()=>{s1();s2();s3();};},[]);
 const count=cart.reduce((s,l)=>s+l.quantity,0),subtotal=cart.reduce((s,l)=>s+l.quantity*l.price,0),open=storeOpen(settings,now);
 const add=(line:CartLine)=>{setCart(prev=>{const old=prev.find(p=>p.key===line.key);return old?prev.map(p=>p.key===line.key?{...p,quantity:Math.min(30,p.quantity+line.quantity)}:p):[...prev,line];});setDrawer(true);};
 const addProduct=(p:Product)=>{if(p.available)setSelected(p);};
 const onChange=(key:string,delta:number)=>setCart(old=>old.map(l=>l.key===key?{...l,quantity:Math.max(0,Math.min(30,l.quantity+delta))}:l).filter(l=>l.quantity>0));
 const onRemove=(key:string)=>setCart(old=>old.filter(l=>l.key!==key));
 return <>
  {!path.startsWith('/admin')&&<Header count={count} openCart={()=>setDrawer(true)} route={path} open={open}/>}
  {!path.startsWith('/admin')&&!catalogLoaded&&<div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900" role="status">{demoDisclaimer}</div>}
  {path.startsWith('/admin')?<AdminPanel settings={settings} products={products} categories={cats}/>:
   path==='/checkout'?<Checkout lines={cart} settings={settings} open={open} ready={configured&&catalogLoaded} onDone={()=>setCart([])}/>:
   path.startsWith('/pedido/')?<Tracking id={path.split('/')[2]} />:
   path==='/cardapio'?<Catalog products={products} cats={cats} onAdd={addProduct}/>:
   path==='/como-chegar'?<Location settings={settings}/>:
   <Home products={products} onAdd={addProduct} open={open}/>}
  {!path.startsWith('/admin')&&<Footer/>}
  {!path.startsWith('/admin')&&count>0&&path!=='/checkout'&&<button className="fixed bottom-3 left-3 right-3 z-30 flex min-h-14 items-center justify-between rounded-2xl bg-[#722238] px-5 font-extrabold text-white shadow-2xl sm:hidden" onClick={()=>setDrawer(true)}><span className="flex items-center gap-2"><ShoppingBag size={18}/> Ver pedido ({count})</span><span>{money(subtotal)}</span></button>}
  {drawer&&<CartDrawer lines={cart} onClose={()=>setDrawer(false)} onChange={onChange} onRemove={onRemove}/>}
  {selected&&<Modal key={selected.id} p={selected} onAdd={add} onClose={()=>setSelected(null)}/>}
 </>;
}
