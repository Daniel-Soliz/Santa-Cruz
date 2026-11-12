import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Coupon } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';

export const AdminPromotionsPage: React.FC = () => {
  const { storeSettings, refreshSettings } = useCart();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    type: 'percentage',
    value: 10,
    minValue: 30,
    maxDiscount: 20,
    maxUses: 100,
    validUntil: '2026-12-31'
  });

  // Daily Special / Notice banner form
  const [specialNotice, setSpecialNotice] = useState(storeSettings?.specialNotice || '');
  const [noticeActive, setNoticeActive] = useState(storeSettings?.specialNoticeActive ?? true);
  const [saveBannerSuccess, setSaveBannerSuccess] = useState(false);

  const fetchCoupons = async () => {
    try {
      const data = await api.adminGetCoupons();
      setCoupons(data);
    } catch (e) {
      console.error('Error fetching coupons', e);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminUpdateSettings({
        specialNotice,
        specialNoticeActive: noticeActive
      });
      await refreshSettings();
      setSaveBannerSuccess(true);
      setTimeout(() => setSaveBannerSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar banner');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || newCoupon.value === undefined) {
      alert('Informe o código e valor do cupom.');
      return;
    }

    try {
      await api.adminCreateCoupon(newCoupon);
      setIsCouponModalOpen(false);
      setNewCoupon({
        code: '',
        description: '',
        type: 'percentage',
        value: 10,
        minValue: 30,
        maxDiscount: 20,
        maxUses: 100,
        validUntil: '2026-12-31'
      });
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar cupom');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Deseja excluir este cupom de desconto?')) return;
    try {
      await api.adminDeleteCoupon(id);
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm">
        <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
          Promoções, Banners e Cupons
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Configure a faixa promocional da página inicial e cupons de desconto aplicáveis no checkout.
        </p>
      </div>

      {/* Daily Special / Promo Banner Form */}
      <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-heading font-extrabold text-base">
            Banner de Destaque da Casa & Prato do Dia
          </h3>
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="noticeActive"
              checked={noticeActive}
              onChange={(e) => setNoticeActive(e.target.checked)}
              className="w-4 h-4 text-[#E8365D] rounded accent-[#E8365D]"
            />
            <label htmlFor="noticeActive" className="text-xs font-bold text-stone-700">
              Exibir faixa promocional no topo da página inicial
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Texto Promocional
            </label>
            <input
              type="text"
              value={specialNotice}
              onChange={(e) => setSpecialNotice(e.target.value)}
              placeholder="Ex: Prato do Dia: Baião de Dois Completo com desconto especial! Manteiga de garrafa grátis hoje."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveBannerSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                Banner atualizado com sucesso!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-900 cursor-pointer"
            >
              Salvar Banner
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Section */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-[#722238]">
            <Tag className="w-5 h-5 text-[#E8365D]" />
            <h3 className="font-heading font-extrabold text-base">
              Cupons de Desconto Cadastrados ({coupons.length})
            </h3>
          </div>

          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs hover:bg-[#E8C60B] border border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Cupom</span>
          </button>
        </div>

        {coupons.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-6 text-center">Nenhum cupom ativo no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div 
                key={coupon.id}
                className="p-4 rounded-2xl bg-[#FFF8EC] border border-amber-200/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-sm text-[#722238] bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                      {coupon.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mt-2 font-medium">{coupon.description}</p>

                  <div className="text-[11px] text-stone-500 space-y-0.5 pt-2 border-t border-amber-200/60 mt-2">
                    {coupon.minValue && (
                      <p>• Pedido mínimo: R$ {coupon.minValue.toFixed(2)}</p>
                    )}
                    {coupon.maxDiscount && coupon.type === 'percentage' && (
                      <p>• Teto máximo: R$ {coupon.maxDiscount.toFixed(2)}</p>
                    )}
                    <p>• Usos: {coupon.currentUses} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</p>
                    <p>• Válido até: {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Excluir cupom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-amber-300 space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-xl text-[#722238]">
              Criar Cupom de Desconto
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  required
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: SERTAO15"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 uppercase outline-hidden focus:border-[#E8365D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newCoupon.description || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="Ex: 15% de desconto para almoço de domingo"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Tipo de Desconto
                  </label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newCoupon.value ?? ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                    placeholder="10"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Pedido Mínimo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCoupon.minValue ?? ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minValue: parseFloat(e.target.value) })}
                    placeholder="30.00"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Teto Máximo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCoupon.maxDiscount ?? ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseFloat(e.target.value) })}
                    placeholder="20.00"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 text-xs font-bold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F9D71C] text-[#722238] text-xs font-bold hover:bg-[#E8C60B] border border-amber-400"
                >
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
