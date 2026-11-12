import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Store, 
  Search, 
  Tag, 
  AlertCircle, 
  Check, 
  CreditCard, 
  QrCode, 
  Banknote,
  Loader2,
  Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { PaymentMethod } from '../types';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeItem, 
    clearCart,
    subtotal, 
    deliveryFee, 
    total,
    deliveryType, 
    setDeliveryType,
    customer, 
    setCustomer,
    address, 
    setAddress,
    paymentMethod, 
    setPaymentMethod,
    changeFor, 
    setChangeFor,
    couponCode, 
    couponDiscount, 
    applyCoupon, 
    removeCoupon,
    storeSettings,
    deliveryQuote,
    deliveryQuoteError,
    isQuotingDelivery
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const [cepError, setCepError] = useState('');

  if (!isCartOpen) return null;

  const handleCepLookup = async () => {
    const clean = address.cep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepError('Digite os 8 números do CEP');
      return;
    }
    setCepError('');
    setIsLookingUpCep(true);
    try {
      const data = await api.lookupCep(clean);
      setAddress(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
    } catch (err: any) {
      setCepError(err.message || 'CEP não encontrado');
    } finally {
      setIsLookingUpCep(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Cupom inválido');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmitOrder = async () => {
    setSubmissionError('');

    if (items.length === 0) {
      setSubmissionError('Sua sacola está vazia.');
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim()) {
      setSubmissionError('Por favor, informe seu nome e telefone.');
      return;
    }

    if (deliveryType === 'delivery') {
      if (isQuotingDelivery || !deliveryQuote || deliveryQuote.cep !== address.cep.replace(/\D/g, '')) {
        setSubmissionError(deliveryQuoteError || 'Confirme um CEP atendido antes de enviar o pedido.');
        return;
      }
      if (!address.street.trim() || !address.number.trim() || !address.neighborhood.trim()) {
        setSubmissionError('Por favor, preencha rua, número e bairro para a entrega.');
        return;
      }
    }

    if (storeSettings?.minOrderValue && subtotal < storeSettings.minOrderValue) {
      setSubmissionError(`O pedido mínimo é de R$ ${storeSettings.minOrderValue.toFixed(2).replace('.', ',')}`);
      return;
    }

    const methodsAvailable: Record<string, boolean> = {
      pix: !!storeSettings?.pixEnabled && !!storeSettings?.pixKey?.trim(),
      mercadopago: !!storeSettings?.mercadoPagoReady,
      dinheiro: !!storeSettings?.cashOnDeliveryEnabled,
      cartao_entrega: !!storeSettings?.cardOnDeliveryEnabled
    };
    if (!methodsAvailable[paymentMethod]) {
      setSubmissionError('Escolha uma forma de pagamento ativa na loja.');
      return;
    }

    if (paymentMethod === 'dinheiro' && changeFor) {
      const changeNum = parseFloat(changeFor.replace(',', '.'));
      if (isNaN(changeNum) || changeNum < total) {
        setSubmissionError(`O troco precisa ser para um valor maior que o total (R$ ${total.toFixed(2).replace('.', ',')})`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        deliveryType,
        customer,
        address: deliveryType === 'delivery' ? address : undefined,
        paymentMethod,
        changeFor: paymentMethod === 'dinheiro' ? changeFor : undefined,
        couponCode: couponCode || undefined,
        items: items.map(i => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions.map(o => ({
            groupId: o.groupId,
            choiceId: o.choiceId
          })),
          observation: i.observation
        }))
      };

      const result = await api.createOrder(payload);

      // Save tracking token in browser history
      try {
        const orderHistory = JSON.parse(localStorage.getItem('nordeste_my_orders') || '[]');
        orderHistory.unshift({
          id: result.orderId,
          token: result.accessToken,
          total: result.order.total,
          createdAt: result.order.createdAt
        });
        localStorage.setItem('nordeste_my_orders', JSON.stringify(orderHistory.slice(0, 20)));
      } catch (e) {
        console.error('Error saving order history', e);
      }

      clearCart();
      setIsCartOpen(false);

      // Redirect to secure tracking page
      onNavigate(`/pedido/${result.orderId}?token=${result.accessToken}`);
    } catch (err: any) {
      setSubmissionError(err.message || 'Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#722238] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10">
              <ShoppingBag className="w-5 h-5 text-[#F9D71C]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg">Sua Sacola de Pedidos</h3>
              <p className="text-xs text-amber-200/80">Casa do Norte • Delícia do Nordeste Santa Cruz</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-stone-200 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <ShoppingBag className="w-10 h-10 stroke-1" />
              </div>
              <h4 className="font-heading font-bold text-stone-800 text-lg">Sua sacola está vazia</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore nosso cardápio com os autênticos pratos nordestinos e adicione seus favoritos.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('/cardapio');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-sm border border-amber-400 cursor-pointer shadow-xs"
              >
                Ver cardápio
              </button>
            </div>
          ) : (
            <>
              {/* Order Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-stone-900 text-sm">
                    Itens ({items.length})
                  </h4>
                  <button 
                    onClick={clearCart} 
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Esvaziar sacola
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((cartItem) => (
                    <div 
                      key={cartItem.cartItemId} 
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h5 className="font-heading font-bold text-stone-900 text-sm leading-tight">
                            {cartItem.menuItem.name}
                          </h5>
                          <span className="font-heading font-extrabold text-sm text-[#722238] shrink-0">
                            R$ {cartItem.totalPriceCalculated.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Selected Options summary */}
                        {cartItem.selectedOptions.length > 0 && (
                          <div className="text-[11px] text-stone-600 space-y-0.5">
                            {cartItem.selectedOptions.map((opt, idx) => (
                              <p key={idx} className="flex items-center gap-1">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{opt.groupName}: {opt.choiceName}</span>
                                {opt.priceModifier > 0 && (
                                  <span className="text-[#E8365D] font-medium">
                                    (+R$ {opt.priceModifier.toFixed(2).replace('.', ',')})
                                  </span>
                                )}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Observation note */}
                        {cartItem.observation && (
                          <p className="text-[11px] text-stone-500 italic bg-white p-1 rounded border border-stone-100">
                            Obs: {cartItem.observation}
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-stone-400">
                            R$ {cartItem.unitPriceCalculated.toFixed(2).replace('.', ',')} unid.
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-stone-300 rounded-lg bg-white p-0.5">
                              <button
                                onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-stone-800">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(cartItem.cartItemId)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remover prato"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery vs Pickup Selector */}
              <div className="p-1 rounded-xl bg-stone-100 border border-stone-200 grid grid-cols-2 gap-1 text-center font-bold text-xs">
                <button
                  type="button"
                  disabled={!storeSettings?.deliveryEnabled}
                  onClick={() => setDeliveryType('delivery')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    deliveryType === 'delivery'
                      ? 'bg-white text-[#722238] shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#E8365D]" />
                  <span>Entrega Delivery</span>
                </button>

                <button
                  type="button"
                  disabled={!storeSettings?.pickupEnabled}
                  onClick={() => setDeliveryType('pickup')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    deliveryType === 'pickup'
                      ? 'bg-white text-[#722238] shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-[#1F5FA8]" />
                  <span>Retirar no Balcão</span>
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className={`rounded-xl border px-4 py-3 text-xs ${deliveryQuote ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`} role="status">
                  {isQuotingDelivery ? 'Calculando disponibilidade e taxa da entrega...' :
                    deliveryQuote ? `Atendemos ${deliveryQuote.zone}. Taxa: R$ ${deliveryQuote.fee.toFixed(2).replace('.', ',')}. Estimativa: ${deliveryQuote.estimatedMinutes} minutos após confirmação.` :
                    deliveryQuoteError || 'Informe o CEP para conferir a área de entrega.'}
                </div>
              )}

              {/* Customer Info Form */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#FFF8EC] border border-amber-200/80">
                <h4 className="font-heading font-bold text-stone-900 text-sm">
                  Dados de Quem Está Pedindo
                </h4>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Maria José da Silva"
                      className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Telefone com DDD (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Ex: (11) 96014-9521"
                      className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                      required
                    />
                  </div>
                </div>

                {/* If Delivery: Address inputs */}
                {deliveryType === 'delivery' && (
                  <div className="pt-3 border-t border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-stone-900 text-xs uppercase tracking-wider">
                        Endereço de Entrega
                      </span>
                      <span className="text-[11px] text-stone-500">Parque Belém, São Paulo – SP</span>
                    </div>

                    {/* CEP Lookup */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        CEP (Auto-preenchimento Correios)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={address.cep}
                          onChange={(e) => setAddress(prev => ({ ...prev, cep: e.target.value }))}
                          placeholder="Ex: 02850-100"
                          maxLength={9}
                          className="flex-1 text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleCepLookup}
                          disabled={isLookingUpCep}
                          className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          {isLookingUpCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          Buscar
                        </button>
                      </div>
                      {cepError && (
                        <p className="text-[11px] text-rose-600 mt-1">{cepError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Rua / Avenida *
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Ex: Rua Santa Cruz da Conceição"
                          className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={address.number}
                          onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                          placeholder="Nº"
                          className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          value={address.neighborhood}
                          onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                          placeholder="Ex: Parque Belém"
                          className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={address.complement}
                          onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                          placeholder="Apto, Casa 2, Bloco"
                          className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Ponto de Referência (Opcional)
                      </label>
                      <input
                        type="text"
                        value={address.reference}
                        onChange={(e) => setAddress(prev => ({ ...prev, reference: e.target.value }))}
                        placeholder="Ex: Próximo à padaria, em frente à praça"
                        className="w-full text-sm p-2.5 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Code Section */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#E8365D]" />
                    Cupom de Desconto
                  </span>
                  {couponCode && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Remover ({couponCode})
                    </button>
                  )}
                </div>

                {!couponCode ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Ex: NORDESTE10"
                      className="flex-1 text-sm p-2 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white uppercase outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Cupom {couponCode} aplicado!
                    </span>
                    <span className="font-extrabold">
                      - R$ {couponDiscount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600">{couponError}</p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-heading font-bold text-stone-900 text-sm">
                  Forma de Pagamento
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {/* Pix */}
                  <button
                    type="button"
                    disabled={!(!!storeSettings?.pixEnabled && !!storeSettings?.pixKey?.trim())}
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      paymentMethod === 'pix'
                        ? 'border-[#722238] bg-white ring-2 ring-[#722238]/10 shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="font-bold text-xs block text-stone-900">Pix Instantâneo</span>
                    <span className="text-[10px] text-stone-500 block">QR Code e Copia-e-Cola</span>
                  </button>

                  {/* Mercado Pago */}
                  <button
                    type="button"
                    disabled={!(!!storeSettings?.mercadoPagoReady)}
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      paymentMethod === 'mercadopago'
                        ? 'border-[#1F5FA8] bg-white ring-2 ring-[#1F5FA8]/10 shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#1F5FA8] mb-1" />
                    <span className="font-bold text-xs block text-stone-900">Mercado Pago</span>
                    <span className="text-[10px] text-stone-500 block">Cartão / Checkout Pro</span>
                  </button>

                  {/* Dinheiro */}
                  <button
                    type="button"
                    disabled={!(!!storeSettings?.cashOnDeliveryEnabled)}
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      paymentMethod === 'dinheiro'
                        ? 'border-[#D4AF37] bg-white ring-2 ring-[#D4AF37]/10 shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="font-bold text-xs block text-stone-900">Dinheiro</span>
                    <span className="text-[10px] text-stone-500 block">Pagar na entrega/balcão</span>
                  </button>

                  {/* Cartão na Entrega */}
                  <button
                    type="button"
                    disabled={!(!!storeSettings?.cardOnDeliveryEnabled)}
                    onClick={() => setPaymentMethod('cartao_entrega')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      paymentMethod === 'cartao_entrega'
                        ? 'border-[#E8365D] bg-white ring-2 ring-[#E8365D]/10 shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#E8365D] mb-1" />
                    <span className="font-bold text-xs block text-stone-900">Maquininha</span>
                    <span className="text-[10px] text-stone-500 block">Débito/Crédito na entrega</span>
                  </button>
                </div>

                {!storeSettings?.mercadoPagoReady && (
                  <p className="text-xs text-stone-600 rounded-xl bg-amber-50 border border-amber-200 p-3">
                    Mercado Pago será liberado após configurar as credenciais e o webhook seguro no servidor.
                  </p>
                )}

                {/* Change input for cash */}
                {paymentMethod === 'dinheiro' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Precisa de troco para quanto? (Deixe em branco se não precisar)
                    </label>
                    <input
                      type="text"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      placeholder="Ex: 50,00 ou 100,00"
                      className="w-full text-sm p-2 rounded-xl border border-stone-300 focus:border-[#E8365D] bg-white outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-2xl bg-stone-100/80 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal dos itens:</span>
                  <span className="font-semibold text-stone-800">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto ({couponCode}):</span>
                    <span className="font-bold">
                      - R$ {couponDiscount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Taxa de entrega ({deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}):</span>
                  <span className="font-semibold text-stone-800">
                    {deliveryType === 'delivery' && !deliveryQuote ? 'Calcular pelo CEP' : deliveryType === 'pickup' 
                      ? 'Grátis' 
                      : deliveryFee === 0 
                        ? 'Grátis (Promoção)' 
                        : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline text-base sm:text-lg">
                  <span className="font-heading font-extrabold text-stone-900">Valor Total:</span>
                  <span className="font-heading font-extrabold text-xl text-[#722238]">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {submissionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{submissionError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer with Submit CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 shrink-0">
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || isQuotingDelivery || (deliveryType === 'delivery' && !deliveryQuote)}
              className="w-full py-4 px-6 rounded-2xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-base sm:text-lg hover:bg-[#E8C60B] active:scale-98 shadow-md transition-all flex items-center justify-between border border-amber-400 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-full flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando e registrando pedido...</span>
                </div>
              ) : (
                <>
                  <span>Confirmar e Enviar Pedido</span>
                  <span className="flex items-center gap-1">
                    R$ {total.toFixed(2).replace('.', ',')}
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </span>
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-500 text-center mt-2 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Tempo estimado: ~35 a 55 min após aceite da cozinha
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
