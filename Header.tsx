import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Shield, Phone, MapPin, Clock, Star, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OpenStatusBadge } from './OpenStatusBadge';

interface HeaderProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute = '/', onNavigate }) => {
  const { itemsCount, setIsCartOpen, storeSettings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', route: '/' },
    { label: 'Cardápio', route: '/cardapio' },
    { label: 'Sobre Nós', route: '/sobre' },
    { label: 'Localização', route: '/localizacao' },
    { label: 'Contato', route: '/contato' },
  ];

  const handleLinkClick = (route: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.location.hash = route;
    }
  };

  const rawPhone = storeSettings?.phoneLandline || '(11) 96014-9521';
  const cleanPhone = rawPhone.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8EC]/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-[#722238] text-amber-100 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <a 
              href={`tel:${cleanPhone}`} 
              className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{rawPhone}</span>
            </a>
            
            <span className="hidden sm:inline text-amber-300/40">•</span>
            
            <a 
              href={storeSettings?.googleMapsShareUrl || '#/localizacao'} 
              className="flex items-center gap-1 text-amber-100/90 hover:text-amber-200 truncate transition-colors text-[11px]"
            >
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Parque Belém, São Paulo – SP</span>
            </a>

            <span className="hidden lg:inline text-amber-300/40">•</span>

            <div className="hidden lg:flex items-center gap-1 text-[#F9D71C] font-semibold text-[11px]">
              <Star className="w-3 h-3 fill-[#F9D71C]" />
              <span>4,1 no Google (16 avaliações)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            <OpenStatusBadge settings={storeSettings} compact />
            <button
              onClick={() => handleLinkClick('/admin')}
              className="text-amber-200/80 hover:text-white flex items-center gap-1 transition-colors text-[11px] font-medium pl-2 border-l border-white/20"
              title="Acesso da Equipe e Gerência"
            >
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Equipe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="relative w-13 h-13 sm:w-16 sm:h-16 shrink-0 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] via-[#F9D71C] to-[#E8365D] shadow-md group-hover:scale-105 transition-transform duration-200">
              <img 
                src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                alt="Emblema Oficial Casa do Norte Delícia do Nordeste Santa Cruz"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-heading font-extrabold text-base sm:text-xl text-[#722238] tracking-tight leading-none group-hover:text-[#E8365D] transition-colors truncate">
                  Delícia do Nordeste
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#F9D71C] text-[#722238] border border-amber-400 shrink-0">
                  SC
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-600 font-medium tracking-wide flex items-center gap-1 mt-1 truncate">
                <span className="font-semibold text-stone-700">Casa do Norte</span>
                <span className="text-[#E8365D] font-bold">•</span>
                <span className="text-[#E8365D] font-semibold truncate">Parque Belém, São Paulo</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleLinkClick(link.route)}
                  className={`text-sm font-semibold transition-colors relative py-1.5 cursor-pointer ${
                    isActive 
                      ? 'text-[#E8365D]' 
                      : 'text-stone-700 hover:text-[#E8365D]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8365D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons (WhatsApp + Cart + Order button) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* WhatsApp direct button */}
            <a
              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20no%20Restaurante%20Del%C3%ADcia%20do%20Nordeste%20Santa%20Cruz.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              title="Pedir pelo WhatsApp oficial"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* "Pedir agora" CTA */}
            <button
              onClick={() => handleLinkClick('/cardapio')}
              className="hidden sm:inline-flex items-center justify-center font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] hover:bg-[#E8C60B] active:scale-95 shadow-sm transition-all border border-amber-400 cursor-pointer"
            >
              Pedir agora
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white text-[#722238] border border-stone-200 hover:border-[#E8365D] hover:text-[#E8365D] shadow-xs transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Abrir sacola de compras"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E8365D] text-white text-[10px] sm:text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white text-stone-700 border border-stone-200 hover:text-[#E8365D] transition-colors cursor-pointer"
              aria-label="Menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 shadow-xl px-4 py-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => handleLinkClick(link.route)}
                className={`text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                  currentRoute === link.route 
                    ? 'bg-rose-50 text-[#E8365D]' 
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{link.label}</span>
                {currentRoute === link.route && (
                  <span className="w-2 h-2 rounded-full bg-[#E8365D]" />
                )}
              </button>
            ))}

            <div className="pt-3 mt-2 border-t border-stone-100 flex flex-col gap-2.5">
              <button
                onClick={() => handleLinkClick('/cardapio')}
                className="w-full py-3 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-center shadow-sm border border-amber-400"
              >
                Ver Cardápio Completo
              </button>

              <a
                href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20no%20Restaurante%20Del%C3%ADcia%20do%20Nordeste.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir no WhatsApp ({rawPhone})</span>
              </a>

              <button
                onClick={() => handleLinkClick('/admin')}
                className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Painel da Equipe & Gerência
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
