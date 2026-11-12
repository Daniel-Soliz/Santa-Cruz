import React from 'react';
import { ArrowRight, UtensilsCrossed, Sparkles, MessageCircle, Clock, Award, Star, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OpenStatusBadge } from './OpenStatusBadge';

interface HeroProps {
  onNavigate: (route: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { storeSettings, setIsCartOpen } = useCart();

  const phone = storeSettings?.phoneLandline || '(11) 96014-9521';
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8EC] via-[#FFF3DD] to-[#FFF8EC] py-8 sm:py-12 lg:py-16 border-b border-amber-200/50">
      {/* Subtle decorative background glows */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#F9D71C]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#E8365D]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Badges row with Google Rating and Status */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-[#722238] text-amber-200 shadow-xs tracking-wide">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Casa do Norte Santa Cruz • São Paulo
              </span>

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-[#F9D71C] text-[#F9D71C]" />
                <span>4,1 no Google</span>
                <span className="text-amber-800/70 font-semibold">(16 avaliações)</span>
              </div>

              <OpenStatusBadge settings={storeSettings} />
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#722238] tracking-tight leading-[1.18] break-words">
                O sabor da culinária nordestina <br className="hidden sm:inline" />
                <span className="text-[#E8365D] relative inline-block mt-1">
                  em São Paulo!
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#F9D71C]" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0 100 15" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-stone-700 max-w-2xl mx-auto lg:mx-0 pt-1 font-normal leading-relaxed break-words">
                Conheça o <strong>Restaurante Delícia do Nordeste Santa Cruz</strong>, localizado no <strong>Parque Belém, em São Paulo</strong>. Oferecemos opções para quem deseja fazer uma refeição no local, retirar seu pedido ou solicitar uma entrega quentinha.
              </p>
            </div>

            {/* Services badges bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-stone-700 font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Refeições no local
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Retirada de pedidos
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Entrega sem contato
              </span>
            </div>

            {/* Daily Special Banner */}
            {storeSettings?.specialNoticeActive && storeSettings.specialNotice && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-amber-300 shadow-xs flex items-start sm:items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-[#F9D71C] text-[#722238] shrink-0">
                  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-[#722238] block sm:inline mr-2 uppercase tracking-wider text-[10px] sm:text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                    Destaque:
                  </span>
                  <span className="text-stone-700 font-medium">
                    {storeSettings.specialNotice}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigate('/cardapio')}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-sm sm:text-base hover:bg-[#E8C60B] active:scale-95 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-amber-400 cursor-pointer"
              >
                <UtensilsCrossed className="w-5 h-5 text-[#722238]" />
                <span>Ver cardápio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E8365D] hover:bg-[#D1254D] text-white font-heading font-bold text-sm sm:text-base active:scale-95 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Fazer pedido
              </button>

              <a
                href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20no%20Restaurante%20Del%C3%ADcia%20do%20Nordeste%20Santa%20Cruz.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                title={`WhatsApp Oficial: ${phone}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ({phone})</span>
              </a>
            </div>

            {/* Quick Informational Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-amber-200/70 max-w-lg mx-auto lg:mx-0 text-center">
              <div>
                <p className="font-heading font-extrabold text-[#722238] text-sm sm:text-base">08h às 22h</p>
                <p className="text-[10px] sm:text-[11px] text-stone-600">Terça a Domingo</p>
              </div>
              <div className="border-x border-amber-200">
                <p className="font-heading font-extrabold text-[#722238] text-sm sm:text-base">R$ 20 a R$ 80</p>
                <p className="text-[10px] sm:text-[11px] text-stone-600">Por pessoa</p>
              </div>
              <div>
                <p className="font-heading font-extrabold text-[#722238] text-sm sm:text-base">Parque Belém</p>
                <p className="text-[10px] sm:text-[11px] text-stone-600">São Paulo – SP</p>
              </div>
            </div>

          </div>

          {/* Right Column: Authoritative Official Emblem & Gastronomy Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md bg-white p-5 sm:p-7 rounded-3xl shadow-xl border-2 border-amber-300/80 text-center">
              
              {/* Official Logo Banner */}
              <div className="relative mx-auto w-48 h-48 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-b from-[#D4AF37] via-[#F9D71C] to-[#722238] shadow-2xl flex items-center justify-center group overflow-hidden">
                <img 
                  src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                  alt="Logotipo Oficial Casa do Norte SC - Restaurante Delícia do Nordeste"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Authentic Subtitle */}
              <div className="mt-4 sm:mt-5 space-y-1">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#722238]">
                  Casa do Norte
                </h3>
                <p className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D]">
                  Restaurante Delícia do Nordeste
                </p>
                <p className="text-xs text-stone-600 pt-1">
                  Unidade: <strong className="text-stone-800">Santa Cruz • Parque Belém (SP)</strong>
                </p>
              </div>

              {/* Card Footer status info */}
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-stone-600">
                <span className="font-medium">Culinária Brasileira e Nordestina</span>
                <span className="text-[#1F5FA8] font-bold">Delivery & Salão</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
