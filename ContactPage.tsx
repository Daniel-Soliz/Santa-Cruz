import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, ChevronDown, Clock, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ContactPage: React.FC = () => {
  const { storeSettings } = useCart();
  const [name, setName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const phone = storeSettings?.phoneLandline || '(11) 96014-9521';
  const cleanPhone = phone.replace(/\D/g, '');

  const faqs = [
    {
      q: 'O restaurante possui espaço para refeição no local?',
      a: 'Sim! Nosso salão no Parque Belém, em São Paulo, está preparado para receber você e sua família com pratos quentinhos e porções fartas.'
    },
    {
      q: 'Qual é o horário de atendimento para pedidos e entregas?',
      a: 'Funcionamos de terça a domingo, das 08h às 22h ininterruptamente. Às segundas-feiras estamos fechados.'
    },
    {
      q: 'Como solicitar entrega delivery ou retirada?',
      a: 'Você pode fechar o pedido diretamente aqui pelo site na sacola ou nos chamar pelo WhatsApp oficial no (11) 96014-9521.'
    },
    {
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Aceitamos Pix (com QR Code instantâneo), cartão online via Mercado Pago Checkout Pro, e na entrega/balcão em dinheiro (com troco) ou cartão na maquininha.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 sm:space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Atendimento Direto
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#722238] break-words">
          Fale Conosco • Casa do Norte Santa Cruz
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Estamos à disposição para dúvidas sobre o cardápio, encomendas, pedidos delivery e reservas.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Phone */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8EC] text-[#722238] border border-amber-300 mx-auto flex items-center justify-center">
            <Phone className="w-6 h-6 text-[#E8365D]" />
          </div>
          <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">Telefone e Pedidos</h3>
          <a 
            href={`tel:${cleanPhone}`}
            className="font-extrabold text-[#722238] hover:text-[#E8365D] text-lg block transition-colors"
          >
            {phone}
          </a>
          <p className="text-[11px] text-stone-500">Ligação direta ou pedidos</p>
        </div>

        {/* WhatsApp */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8EC] text-[#722238] border border-amber-300 mx-auto flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">WhatsApp Oficial</h3>
          <a
            href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido.`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-extrabold text-emerald-700 hover:underline text-lg block"
          >
            {phone}
          </a>
          <p className="text-[11px] text-emerald-600 font-semibold">Atendimento em tempo real</p>
        </div>

        {/* Location */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8EC] text-[#722238] border border-amber-300 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#1F5FA8]" />
          </div>
          <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">Localização</h3>
          <p className="font-bold text-stone-800 text-sm">
            Parque Belém, São Paulo – SP
          </p>
          <p className="text-[11px] text-stone-500 font-mono">CEP: 02850-100</p>
        </div>

      </div>

      {/* Message Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-200 shadow-sm">
        <h3 className="font-heading font-extrabold text-xl text-[#722238] mb-1">
          Envie uma Mensagem para Nossa Equipe
        </h3>
        <p className="text-xs text-stone-500 mb-6">
          Preencha o formulário abaixo e retornaremos rapidamente durante o horário de atendimento (08h às 22h).
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-heading font-bold text-base">Mensagem Enviada com Sucesso!</h4>
            <p className="text-xs text-emerald-700">
              Agradecemos o contato. Nossa equipe entrará em contato em breve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Telefone ou WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Mensagem ou Dúvida *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem ou dúvida sobre nossos pratos e atendimento..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-sm hover:bg-[#E8C60B] border border-amber-400 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Mensagem</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#722238] text-center">
          Dúvidas Frequentes (FAQ)
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 overflow-hidden cursor-pointer"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-stone-800">
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFaq === i ? 'rotate-180 text-[#E8365D]' : 'text-stone-400'}`} />
              </div>
              {openFaq === i && (
                <p className="text-xs sm:text-sm text-stone-600 mt-2.5 pt-2 border-t border-stone-100 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
