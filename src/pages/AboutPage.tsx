import React from 'react';
import { Award, CheckCircle2, Heart, ShieldCheck, MapPin, Phone, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { storeSettings } = useCart();

  const phone = storeSettings?.phoneLandline || '(11) 96014-9521';
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 sm:space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Casa do Norte • Parque Belém, São Paulo
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#722238] break-words">
          Restaurante Delícia do Nordeste Santa Cruz
        </h1>
        <p className="text-stone-700 text-sm sm:text-lg font-medium">
          O sabor autêntico da culinária nordestina em São Paulo!
        </p>

        {/* Rating and Price Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
            <Star className="w-3.5 h-3.5 fill-[#F9D71C] text-[#F9D71C]" />
            <span>4,1 no Google (16 avaliações)</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
            Faixa de preço: R$ 20 a R$ 80 por pessoa
          </span>
        </div>
      </div>

      {/* Official Emblem Spotlight */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-xl flex flex-col md:flex-row items-center gap-8 lg:gap-12">
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] via-[#F9D71C] to-[#722238] shadow-2xl shrink-0 overflow-hidden flex items-center justify-center">
          <img 
            src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
            alt="Emblema Oficial Casa do Norte Delícia do Nordeste Santa Cruz"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="space-y-4 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#722238]">
            Tradição Sertaneja no Parque Belém
          </h2>
          <p>
            Localizado no <strong>Parque Belém, em São Paulo – SP</strong>, o <strong>Restaurante Delícia do Nordeste Santa Cruz</strong> nasceu da paixão pelas ricas tradições gastronômicas do Nordeste brasileiro. Nosso emblema oficial, com o chapéu de couro estilizado e as estrelas, representa o carinho com que recebemos cada cliente.
          </p>
          <p>
            Oferecemos estrutura completa para quem deseja saborear uma refeição no local, retirar seu pedido no balcão ou solicitar uma entrega rápida com embalagens térmicas de alta qualidade.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('/cardapio')}
              className="px-6 py-3 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-xs sm:text-sm hover:bg-[#E8C60B] border border-amber-400 cursor-pointer shadow-xs"
            >
              Explorar Cardápio Online
            </button>
            <a
              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20restaurante.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-xs"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-[#FFF8EC] border border-amber-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#722238] text-amber-300 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900">
            Refeições no Local
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Ambiente acolhedor e familiar para seu almoço ou jantar de terça a domingo das 08h às 22h.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFF8EC] border border-amber-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8365D] text-white flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900">
            Retirada no Balcão
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Faça seu pedido com antecedência pelo site e retire seu prato quentinho e embalado sem esperas.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFF8EC] border border-amber-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1F5FA8] text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900">
            Entrega Sem Contato
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Delivery ágil e seguro para o Parque Belém e bairros vizinhos da Zona Norte de São Paulo.
          </p>
        </div>
      </div>

      {/* Address & Hours Summary Bar */}
      <div className="p-6 rounded-3xl bg-stone-100 border border-stone-200 text-stone-700 text-xs sm:text-sm flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#E8365D] shrink-0" />
          <span>
            Rua Santa Cruz da Conceição, Parque Belém, São Paulo – SP, CEP 02850-100
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Terça a Domingo: 08h às 22h</span>
        </div>
      </div>

    </div>
  );
};
