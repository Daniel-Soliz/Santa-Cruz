import React from 'react';
import { Phone, MapPin, Clock, Shield, Star, ExternalLink, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { storeSettings } = useCart();

  const handleLink = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.location.hash = route;
    }
  };

  const phone = storeSettings?.phoneLandline || '(11) 96014-9521';
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <footer className="bg-[#4A4A44] text-stone-200 pt-12 sm:pt-16 pb-8 border-t-4 border-[#E8365D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-stone-600/60">
          
          {/* Column 1: Identity & Official Emblem */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C] shadow-lg shrink-0">
                <img 
                  src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                  alt="Casa do Norte Santa Cruz - Restaurante Delícia do Nordeste"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-white text-base sm:text-lg leading-tight">
                  Delícia do Nordeste
                </h3>
                <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <span>Santa Cruz</span>
                  <span>•</span>
                  <span>Parque Belém (SP)</span>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              O sabor autêntico da culinária nordestina em São Paulo! Pratos fartos, carnes nobres, baião de dois tradicional e hospitalidade sertaneja.
            </p>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-700/80 border border-stone-600 text-xs text-amber-200">
              <Star className="w-3.5 h-3.5 fill-[#F9D71C] text-[#F9D71C]" />
              <span className="font-bold">4,1 de 5 estrelas</span>
              <span className="text-stone-300">• 16 avaliações no Google</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base tracking-wide border-b border-stone-600 pb-2">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
              <li>
                <button onClick={() => handleLink('/')} className="hover:text-[#F9D71C] transition-colors cursor-pointer">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/cardapio')} className="hover:text-[#F9D71C] transition-colors cursor-pointer">
                  Cardápio Digital Completo
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/sobre')} className="hover:text-[#F9D71C] transition-colors cursor-pointer">
                  Sobre a Casa do Norte
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/avaliacoes')} className="hover:text-[#F9D71C] transition-colors cursor-pointer">
                  Avaliações dos Clientes
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/localizacao')} className="hover:text-[#F9D71C] transition-colors cursor-pointer">
                  Localização e Horários
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/contato')} className="hover:text-[#F9D71C] transition-colors cursor-pointer">
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base tracking-wide border-b border-stone-600 pb-2">
              Endereço & Atendimento
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F9D71C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">
                    Rua Santa Cruz da Conceição
                  </span>
                  <span className="text-stone-300 text-xs block">
                    Parque Belém, São Paulo – SP
                  </span>
                  <span className="text-amber-300 text-xs block font-mono font-semibold">
                    CEP: 02850-100
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#F9D71C] shrink-0 mt-0.5" />
                <div>
                  <a 
                    href={`tel:${cleanPhone}`}
                    className="text-white hover:text-amber-300 font-extrabold text-sm sm:text-base block transition-colors"
                  >
                    {phone}
                  </a>
                  <span className="text-[11px] text-stone-400 block">
                    Pedidos e Informações
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <a 
                    href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido.`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-bold block"
                  >
                    WhatsApp: {phone}
                  </a>
                  <span className="text-[11px] text-emerald-300/80">Canal oficial confirmado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Hours & Services */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-base tracking-wide border-b border-stone-600 pb-2">
              Horário de Funcionamento
            </h4>
            <div className="text-xs text-stone-300 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-stone-700">
                <span className="font-semibold text-white">Terça a Domingo:</span>
                <span className="font-bold text-amber-300">08h às 22h</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Segunda-feira:</span>
                <span className="text-rose-300 font-semibold">Fechado</span>
              </div>
            </div>

            <div className="pt-2 text-xs space-y-1 text-stone-300">
              <p className="font-bold text-white">Serviços Disponíveis:</p>
              <p className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Refeições no local
              </p>
              <p className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Retirada de pedidos
              </p>
              <p className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Entrega sem contato
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleLink('/cardapio')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#E8365D] hover:bg-[#D1254D] text-white text-xs font-bold transition-colors shadow-sm text-center cursor-pointer"
              >
                Fazer Pedido Online
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar with legal & admin link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Restaurante Delícia do Nordeste Santa Cruz • Parque Belém, São Paulo – SP.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button onClick={() => handleLink('/termos')} className="hover:text-stone-200 underline transition-colors cursor-pointer">
              Termos de Uso
            </button>
            <span>•</span>
            <button onClick={() => handleLink('/privacidade')} className="hover:text-stone-200 underline transition-colors cursor-pointer">
              Privacidade (LGPD)
            </button>
            <span>•</span>
            <button 
              onClick={() => handleLink('/admin')} 
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Painel Administrativo
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
