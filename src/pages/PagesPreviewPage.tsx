import React from 'react';
import { ArrowUpRight, Clock3, MapPin, MessageCircle, PhoneCall, ShieldCheck, ShoppingBag, UtensilsCrossed } from 'lucide-react';

const phone = '5511960149521';
const contactUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Olá! Gostaria de fazer um pedido no Restaurante Delícia do Nordeste Santa Cruz. Pode me enviar o cardápio e confirmar o atendimento?')}`;
const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Rua+Santa+Cruz+da+Concei%C3%A7%C3%A3o,+Parque+Bel%C3%A9m,+S%C3%A3o+Paulo+-+SP,+02850-100';
const logoUrl = `${import.meta.env.BASE_URL}assets/aistudio/logo_casa_do_norte_108ee79c.jpg`;

export function PagesPreviewPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFF8EC] font-['Poppins',sans-serif] text-[#513a40]">
      <header className="bg-white border-b border-[#f1dfd8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <a href={import.meta.env.BASE_URL} className="flex items-center gap-3 min-w-0" aria-label="Página inicial do Restaurante Delícia do Nordeste">
            <img src={logoUrl} alt="Emblema Casa do Norte" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#D4AF37] shrink-0" />
            <span className="min-w-0">
              <strong className="block text-sm sm:text-lg text-[#722238] leading-5 font-extrabold">Delícia do Nordeste</strong>
              <span className="block text-[11px] sm:text-xs font-semibold text-[#8b5860]">Casa do Norte · Santa Cruz</span>
            </span>
          </a>
          <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-xl bg-[#722238] px-5 py-3 text-sm font-bold text-white hover:bg-[#8b2c48] transition-colors">
            <MessageCircle size={18} /> Pedir pelo WhatsApp
          </a>
          <a href={contactUrl} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" className="sm:hidden rounded-xl p-3 bg-[#722238] text-white">
            <MessageCircle size={21} />
          </a>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid gap-10 lg:gap-16 lg:grid-cols-[1.18fr_.82fr] items-center py-12 sm:py-20 lg:py-24" aria-labelledby="titulo">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fcebd8] border border-[#edcfb4] px-4 py-2 text-[11px] sm:text-xs tracking-[.08em] font-extrabold uppercase text-[#8b2c48]">
              <UtensilsCrossed size={15} /> Restaurante em São Paulo
            </span>
            <h1 id="titulo" className="mt-6 mb-5 font-heading font-extrabold text-[clamp(2.8rem,6vw,5rem)] leading-[1.04] tracking-[-.035em] text-[#722238]">
              O sabor do <span className="text-[#E8365D]">Nordeste</span> perto de você.
            </h1>
            <p className="max-w-2xl text-[15px] sm:text-lg leading-relaxed text-[#68575b]">
              Seja bem-vindo à Casa do Norte Santa Cruz. Estamos organizando o cardápio digital para que você possa fazer pedidos com facilidade.
              Por enquanto, nossa equipe atende diretamente pelo WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="min-h-14 inline-flex justify-center items-center gap-2 rounded-2xl bg-[#F9D71C] px-6 py-4 text-[#65283a] font-extrabold shadow-[0_10px_24px_#CFA51A33] hover:bg-[#ffe144] transition-colors">
                <ShoppingBag size={20} /> Fazer pedido pelo WhatsApp <ArrowUpRight size={18} />
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="min-h-14 inline-flex justify-center items-center gap-2 rounded-2xl bg-white border border-[#e8d8ca] px-6 py-4 text-[#722238] font-bold hover:bg-[#fffbf6] transition-colors">
                <MapPin size={19} /> Como chegar
              </a>
            </div>
            <p className="mt-5 text-xs sm:text-sm text-[#78666b] flex items-start gap-2">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-[#9b6c4c]" />
              O atendimento confirma disponibilidade, valor e entrega antes de fechar o pedido.
            </p>
          </div>

          <aside className="relative min-w-0 rounded-[30px] bg-gradient-to-br from-[#8e3150] via-[#722238] to-[#4d1b31] p-8 sm:p-12 text-white text-center shadow-[0_28px_55px_#57253D33]">
            <div className="absolute top-6 left-6 w-20 h-20 rounded-full border border-white/10" aria-hidden="true" />
            <div className="absolute bottom-8 right-8 w-28 h-28 rounded-full border border-[#f9d71c]/20" aria-hidden="true" />
            <div className="relative">
              <img src={logoUrl} alt="Logo da Casa do Norte Santa Cruz" className="mx-auto w-44 h-44 sm:w-56 sm:h-56 rounded-full object-cover border-[7px] border-[#F9D71C] shadow-2xl" />
              <p className="mt-7 uppercase tracking-[.2em] text-[#f9d71c] text-xs font-bold">Casa do Norte</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold mt-2 leading-tight">Delícia do Nordeste</h2>
              <p className="max-w-xs mx-auto mt-4 text-sm leading-relaxed text-[#f9dce3]">
                Atendimento próximo, comida nordestina e informações diretamente com a equipe.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-14 sm:pb-20" aria-label="Informações do restaurante">
          <article className="rounded-2xl bg-white border border-[#f1e3d7] p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#fff1d1] text-[#722238] flex items-center justify-center mb-4"><MessageCircle size={22} /></div>
            <h3 className="text-lg font-extrabold text-[#722238] mb-2">Pedidos</h3>
            <p className="text-sm leading-relaxed text-[#6d5d60]">Fale diretamente com a equipe. O site ainda não registra compras automaticamente.</p>
            <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center font-bold text-sm text-[#a62b50] mt-3 hover:underline">Abrir WhatsApp <ArrowUpRight size={15} /></a>
          </article>
          <article className="rounded-2xl bg-white border border-[#f1e3d7] p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#fff1d1] text-[#722238] flex items-center justify-center mb-4"><MapPin size={22} /></div>
            <h3 className="text-lg font-extrabold text-[#722238] mb-2">Onde estamos</h3>
            <p className="text-sm leading-relaxed text-[#6d5d60]">Rua Santa Cruz da Conceição, Parque Belém, São Paulo · SP.</p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center font-bold text-sm text-[#a62b50] mt-3 hover:underline">Ver no mapa <ArrowUpRight size={15} /></a>
          </article>
          <article className="rounded-2xl bg-white border border-[#f1e3d7] p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#fff1d1] text-[#722238] flex items-center justify-center mb-4"><Clock3 size={22} /></div>
            <h3 className="text-lg font-extrabold text-[#722238] mb-2">Horários cadastrados</h3>
            <p className="text-sm leading-relaxed text-[#6d5d60]">Terça a domingo, das 8h às 22h. Segunda-feira fechado. Confirme o atendimento pelo WhatsApp.</p>
          </article>
        </section>

        <section className="rounded-3xl bg-[#fcebd8] border border-[#edceb4] px-6 py-7 sm:px-10 sm:py-9 mb-14 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#9b5060] mb-2">Cardápio digital</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#722238]">Estamos preparando os pedidos pelo site.</h2>
            <p className="mt-2 text-sm text-[#68575b] max-w-2xl">Até a integração com o sistema do restaurante ficar pronta, você pode consultar os pratos e fazer seu pedido com o atendimento.</p>
          </div>
          <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#722238] px-6 py-4 font-bold text-white hover:bg-[#8e3150] transition-colors w-full md:w-auto">
            <PhoneCall size={18} /> Conversar com a equipe
          </a>
        </section>
      </main>

      <footer className="bg-[#4A4A44] py-7 text-[#f6edeb] text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Delícia do Nordeste · Santa Cruz</p>
          <p className="text-xs text-stone-300">Pedidos disponíveis pelo WhatsApp</p>
        </div>
      </footer>
    </div>
  );
}
