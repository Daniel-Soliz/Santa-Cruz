import React from 'react';
import { MapPin, Phone, Clock, Truck, ExternalLink, Star, CheckCircle, Store, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OpenStatusBadge } from '../components/OpenStatusBadge';

export const LocationPage: React.FC = () => {
  const { storeSettings } = useCart();

  const phone = storeSettings?.phoneLandline || '(11) 96014-9521';
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Localização e Contato
          </span>
          <OpenStatusBadge settings={storeSettings} />
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#722238] break-words">
          Restaurante Delícia do Nordeste Santa Cruz
        </h1>
        <p className="text-stone-600 text-sm">
          Localizado no Parque Belém, em São Paulo – SP. Venha almoçar e jantar conosco, retirar seu pedido no balcão ou solicitar delivery.
        </p>

        {/* Google Rating Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 shadow-2xs">
          <div className="flex items-center text-[#F9D71C]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-[#F9D71C]' : 'fill-[#F9D71C]/50 text-[#F9D71C]'}`} />
            ))}
          </div>
          <span>4,1 de 5 estrelas no Google</span>
          <span className="text-stone-500 font-normal">• 16 avaliações de clientes</span>
        </div>
      </div>

      {/* Main Address & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Address and Direct Contact */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Address Box */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#722238]">
              <MapPin className="w-5 h-5 text-[#E8365D]" />
              <h3 className="font-heading font-extrabold text-base">Endereço do Restaurante</h3>
            </div>

            <div className="text-sm text-stone-700 space-y-1">
              <p className="font-bold text-base text-stone-900">
                Restaurante Delícia do Nordeste Santa Cruz
              </p>
              <p className="font-medium text-stone-800">Rua Santa Cruz da Conceição</p>
              <p className="text-stone-600">Bairro: <strong>Parque Belém</strong></p>
              <p className="text-stone-600">São Paulo – SP</p>
              <p className="text-[#722238] font-bold font-mono">CEP: 02850-100</p>
            </div>

            <div className="pt-2">
              <a
                href={storeSettings?.googleMapsShareUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Santa+Cruz+da+Concei%C3%A7%C3%A3o,+Parque+Bel%C3%A9m,+S%C3%A3o+Paulo+-+SP,+02850-100'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#1F5FA8] hover:bg-[#164882] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Box */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#722238]">
              <Phone className="w-5 h-5 text-[#F9D71C]" />
              <h3 className="font-heading font-extrabold text-base">Pedidos e Informações</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-stone-500 block">Telefone e WhatsApp Oficial:</span>
                <a 
                  href={`tel:${cleanPhone}`}
                  className="font-extrabold text-stone-900 hover:text-[#E8365D] text-xl block transition-colors mt-0.5"
                >
                  {phone}
                </a>
                <span className="text-[11px] text-stone-500 block">
                  Atendimento direto para pedidos, dúvidas e reservas
                </span>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <a
                  href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20no%20Restaurante%20Del%C3%ADcia%20do%20Nordeste.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chamar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Services Box */}
          <div className="p-6 rounded-3xl bg-[#FFF8EC] border border-amber-200 shadow-xs space-y-3">
            <h4 className="font-heading font-extrabold text-[#722238] text-sm">
              Serviços Disponíveis
            </h4>
            <div className="space-y-2 text-xs font-semibold text-stone-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Refeições no local (Salão acolhedor)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Retirada de pedidos no balcão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Entrega sem contato com embalagem térmica</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Weekly Hours & Delivery Coverage */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Business Hours */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#722238]">
                <Clock className="w-5 h-5 text-[#E8365D]" />
                <h3 className="font-heading font-extrabold text-base">Horário de Atendimento</h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">Horário de São Paulo</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between font-bold text-stone-900">
                <span>Terça a Domingo:</span>
                <span className="text-emerald-700 font-extrabold">08h00 às 22h00</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between font-medium text-stone-500">
                <span>Segunda-feira:</span>
                <span className="text-rose-600 font-bold">Fechado para descanso da equipe</span>
              </div>
            </div>
          </div>

          {/* Delivery Coverage Areas */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
              <Truck className="w-5 h-5 text-[#1F5FA8]" />
              <h3 className="font-heading font-extrabold text-base">Áreas de Entrega e Taxas em São Paulo</h3>
            </div>

            <p className="text-xs text-stone-600">
              Cálculo automático de taxa e tempo estimado para sua região:
            </p>

            <div className="space-y-2.5">
              {storeSettings?.deliveryZones?.map(zone => (
                <div 
                  key={zone.id} 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm"
                >
                  <div>
                    <span className="font-bold text-stone-800 block">{zone.name}</span>
                    <span className="text-[11px] text-stone-500">Estimativa: ~{zone.estimatedMinutes} minutos</span>
                  </div>
                  <span className="font-extrabold text-[#722238] text-sm">
                    R$ {zone.fee.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {storeSettings?.freeDeliveryAbove && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Entrega Grátis para pedidos acima de R$ {storeSettings.freeDeliveryAbove.toFixed(2).replace('.', ',')}!
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
