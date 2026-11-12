import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  Store, 
  XCircle, 
  QrCode, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  MessageCircle, 
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { OrderReceiptModal } from '../components/OrderReceiptModal';

interface OrderTrackingPageProps {
  orderId: string;
  token?: string;
  onNavigate: (route: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, token, onNavigate }) => {
  const { storeSettings } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixQrDataUrl, setPixQrDataUrl] = useState<string>('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Retrieve secret token from URL prop or localStorage
  const effectiveToken = token || (() => {
    try {
      const history = JSON.parse(localStorage.getItem('nordeste_my_orders') || '[]');
      const match = history.find((h: any) => h.id === orderId);
      return match ? match.token : '';
    } catch {
      return '';
    }
  })();

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const data = await api.getOrder(orderId, effectiveToken);
      setOrder(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as informações do pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Live polling every 6 seconds to reflect status updates from admin
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderId, effectiveToken]);

  // Generate Pix QR Code if method is Pix
  useEffect(() => {
    if (order && order.paymentMethod === 'pix') {
      const pixPayload = storeSettings?.pixKey 
        ? `00020126580014BR.GOV.BCB.PIX0136${storeSettings.pixKey}520400005303986540${order.total.toFixed(2)}5802BR5925DELICIA DO NORDESTE6009RIO DE JAN62070503***6304`
        : `PIX-DELICIA-NORDESTE-${order.id}-VALOR-${order.total}`;
      
      api.getQrCode(pixPayload)
        .then(setPixQrDataUrl)
        .catch(console.error);
    }
  }, [order, storeSettings]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#E8365D] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="font-heading font-bold text-stone-800 text-lg">
          Consultando dados seguros do pedido...
        </h2>
        <p className="text-xs text-stone-500">
          Autenticando token de acompanhamento com o servidor.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-white border border-rose-200 shadow-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-stone-900">
            Acesso Restrito ao Pedido
          </h2>
          <p className="text-sm text-stone-600">
            {error || 'Não encontramos este pedido ou o token de segurança é inválido.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs"
            >
              Voltar ao Início
            </button>
            <button
              onClick={() => onNavigate('/cardapio')}
              className="px-5 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs border border-amber-400"
            >
              Fazer Novo Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress Steps calculation
  const deliverySteps: OrderStatus[] = [
    'Recebido',
    'Aceito',
    'Em preparo',
    order.type === 'delivery' ? 'Saiu para entrega' : 'Pronto para retirada',
    'Finalizado'
  ];

  const currentStepIndex = deliverySteps.indexOf(order.status);
  const isCancelled = order.status === 'Cancelado';

  const copyPixKey = () => {
    if (!storeSettings?.pixKey) return;
    navigator.clipboard.writeText(storeSettings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleWhatsAppContact = () => {
    const rawNumber = storeSettings?.whatsappConfirmed && storeSettings?.whatsappNumber
      ? storeSettings.whatsappNumber.replace(/\D/g, '')
      : '';
    
    const message = encodeURIComponent(
      `Olá! Meu nome é ${order.customer.name} e gostaria de informações sobre o meu pedido *${order.id}* no Restaurante Delícia do Nordeste (Unidade Santa Cruz). Total: R$ ${order.total.toFixed(2)}.`
    );

    if (rawNumber) {
      window.open(`https://wa.me/55${rawNumber}?text=${message}`, '_blank');
    } else {
      alert(`O WhatsApp oficial ainda está em confirmação. Ligue para o telefone fixo cadastrado: ${storeSettings?.phoneLandline || '3984-1957'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner with ID & Actions */}
      <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-2xl text-[#722238]">
              Pedido {order.id}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isCancelled 
                ? 'bg-rose-100 text-rose-800' 
                : order.status === 'Finalizado'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800 animate-pulse'
            }`}>
              {order.status}
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Realizado em {new Date(order.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} • Casa do Norte Santa Cruz
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Comanda / Recibo</span>
          </button>

          <button
            onClick={fetchOrder}
            className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs flex items-center cursor-pointer"
            title="Atualizar status agora"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Order Progress Steps */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl">
            Acompanhamento em Tempo Real
          </h3>
          <span className="text-xs text-stone-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Estimativa: {order.estimatedTime || '35 a 55 min'}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Pedido Cancelado</span>
            </div>
            {order.cancelReason && (
              <p className="text-xs text-rose-700 pl-7">
                Motivo informado pela equipe: {order.cancelReason}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop progress bar */}
            <div className="hidden sm:grid grid-cols-5 gap-2 relative">
              {deliverySteps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={idx} className="text-center space-y-2">
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm transition-all ${
                      isCurrent
                        ? 'bg-[#E8365D] text-white ring-4 ring-rose-200 scale-110 shadow-md'
                        : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}>
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <p className={`text-xs font-bold leading-tight ${
                      isCurrent ? 'text-[#E8365D]' : isPassed ? 'text-stone-800' : 'text-stone-400'
                    }`}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile simplified active step card */}
            <div className="sm:hidden p-4 rounded-2xl bg-gradient-to-r from-[#FFF8EC] to-amber-50 border border-amber-300 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E8365D] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                {currentStepIndex + 1}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-amber-800 font-extrabold">
                  Status Atual ({currentStepIndex + 1} de {deliverySteps.length})
                </p>
                <h4 className="font-heading font-extrabold text-base text-[#722238]">
                  {order.status}
                </h4>
              </div>
            </div>

            {/* Status History Logs */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Histórico de Atualizações
              </span>
              <div className="space-y-1.5">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="text-xs flex items-start gap-2 text-stone-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-stone-800">{new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong> - {h.note || h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Card & Instructions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-stone-900 text-lg">
              Pagamento do Pedido
            </h3>
            <p className="text-xs text-stone-500">
              Modalidade: <strong className="uppercase text-stone-700">{order.paymentMethod}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.paymentStatus === 'Pago'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Dynamic details per payment method */}
        {order.paymentMethod === 'pix' && order.paymentStatus !== 'Pago' && (
          <div className="p-5 rounded-2xl bg-[#FFF8EC] border border-amber-300/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#722238]">
              <QrCode className="w-5 h-5 text-[#E8365D]" />
              <span>Instruções para Pagamento via Pix</span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Abra o aplicativo do seu banco, selecione a opção <strong>Pix Copia e Cola</strong> ou aponte a câmera para o QR Code abaixo. O valor exato é de <strong>R$ {order.total.toFixed(2).replace('.', ',')}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
              {pixQrDataUrl && (
                <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs">
                  <img src={pixQrDataUrl} alt="QR Code Pix" className="w-40 h-40 object-contain mx-auto" />
                </div>
              )}

              <div className="space-y-3 max-w-sm text-center sm:text-left">
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase block">
                    Chave Pix da Casa do Norte ({storeSettings?.pixKeyType || 'E-mail'})
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={storeSettings?.pixKey || 'deliciadonordeste.santacruz@gmail.com'}
                      className="bg-white text-xs font-mono p-2 rounded-xl border border-stone-300 flex-1 outline-hidden"
                    />
                    <button
                      onClick={copyPixKey}
                      className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-900 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
                  <span className="font-semibold text-stone-700 block">Beneficiário:</span>
                  <span>{storeSettings?.pixBeneficiary || 'Restaurante Delícia do Nordeste Santa Cruz'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-800 italic text-center">
              * Status: <strong>Aguardando conferência manual</strong>. Se preferir, envie o comprovante no WhatsApp da loja para agilizar o preparo.
            </p>
          </div>
        )}

        {order.paymentMethod === 'mercadopago' && order.paymentStatus !== 'Pago' && (
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1F5FA8]">
              <CreditCard className="w-5 h-5" />
              <span>Mercado Pago Checkout Pro</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              O pagamento pode ser realizado com cartão de crédito, débito virtual Caixa ou saldo Mercado Pago.
            </p>

            <button
              onClick={async () => {
                try {
                  const pref = await api.createMercadoPagoPreference(order.id, order.accessToken);
                  if (pref.initPoint) {
                    window.location.href = pref.initPoint;
                  }
                } catch (e: any) {
                  alert(e.message || 'Integração Mercado Pago aguardando credenciais oficiais do proprietário.');
                }
              }}
              className="py-3 px-6 rounded-xl bg-[#1F5FA8] hover:bg-[#164882] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Pagar agora com Mercado Pago</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {order.paymentMethod === 'dinheiro' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">Pagamento em Dinheiro na {order.type === 'delivery' ? 'Entrega' : 'Retirada'}:</p>
            <p>
              Total a pagar: <strong>R$ {order.total.toFixed(2).replace('.', ',')}</strong>.
              {order.changeFor && (
                <span> O entregador levará troco para <strong>R$ {order.changeFor.toFixed(2).replace('.', ',')}</strong> (Troco a receber: R$ {(order.changeFor - order.total).toFixed(2).replace('.', ',')}).</span>
              )}
            </p>
          </div>
        )}

        {order.paymentMethod === 'cartao_entrega' && (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
            <p className="font-bold">Pagamento na maquininha:</p>
            <p>O entregador levará a máquina de cartão com suporte a débito, crédito e aproximação (NFC).</p>
          </div>
        )}
      </div>

      {/* Order Summary & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Items Summary */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <h4 className="font-heading font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">
            Resumo dos Pratos ({order.items.length})
          </h4>

          <div className="space-y-3">
            {order.items.map((it, idx) => (
              <div key={idx} className="text-xs pb-3 border-b border-stone-100 last:border-0 space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>{it.quantity}x {it.name}</span>
                  <span>R$ {it.totalItemPrice.toFixed(2).replace('.', ',')}</span>
                </div>

                {it.selectedOptions && it.selectedOptions.length > 0 && (
                  <div className="text-stone-500 pl-2 space-y-0.5">
                    {it.selectedOptions.map((opt, i) => (
                      <p key={i}>
                        • {opt.groupName}: {opt.choiceName}
                        {opt.priceModifier > 0 && ` (+R$ ${opt.priceModifier.toFixed(2)})`}
                      </p>
                    ))}
                  </div>
                )}

                {it.observation && (
                  <p className="italic text-stone-400 pl-2">
                    Obs: {it.observation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 text-xs space-y-1 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Desconto ({order.couponCode || 'Cupom'}):</span>
                <span>- R$ {order.discount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxa de Entrega:</span>
              <span>{order.deliveryFee === 0 ? 'Grátis' : `R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}`}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Pago/A Pagar:</span>
              <span className="text-[#722238]">R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Right: Customer & Delivery Info */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <h4 className="font-heading font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">
            Dados de Entrega & Cliente
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Cliente:</span>
              <span className="font-semibold text-stone-800 text-sm">{order.customer.name}</span>
            </div>

            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Telefone:</span>
              <span className="text-stone-800">{order.customer.phone}</span>
            </div>

            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Modalidade:</span>
              <span className="font-semibold text-stone-800">
                {order.type === 'delivery' ? 'Entrega em Domicílio (Delivery)' : 'Retirada no Balcão do Restaurante'}
              </span>
            </div>

            {order.type === 'delivery' && order.address && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 font-bold block uppercase text-[10px]">Endereço Informado:</span>
                <p className="font-medium text-stone-800">
                  {order.address.street}, {order.address.number}
                  {order.address.complement && ` (${order.address.complement})`}
                </p>
                <p className="text-stone-600">
                  {order.address.neighborhood} - {order.address.city}/{order.address.state}
                </p>
                <p className="text-stone-500">CEP: {order.address.cep}</p>
                {order.address.reference && (
                  <p className="text-stone-500 italic">Ref: {order.address.reference}</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={handleWhatsAppContact}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar com o Restaurante sobre este Pedido</span>
            </button>
            <p className="text-[10px] text-stone-400 text-center mt-1.5">
              Abre mensagem pronta no WhatsApp do restaurante
            </p>
          </div>
        </div>

      </div>

      {/* Comanda Print Modal */}
      {isReceiptModalOpen && (
        <OrderReceiptModal 
          order={order} 
          onClose={() => setIsReceiptModalOpen(false)} 
        />
      )}

    </div>
  );
};
