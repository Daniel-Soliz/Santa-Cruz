import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Phone, 
  MapPin, 
  Clock, 
  Truck, 
  Check, 
  AlertCircle, 
  Save, 
  MessageCircle,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';

export const AdminStoreSettingsPage: React.FC = () => {
  const { storeSettings, refreshSettings } = useCart();
  const [formData, setFormData] = useState<StoreSettings | null>(storeSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (storeSettings) setFormData(storeSettings); }, [storeSettings]);
  if (!formData) return <div className="p-8 text-center text-stone-500">Carregando configurações da loja...</div>;

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleHourChange = (dayIndex: number, field: string, value: any) => {
    if (!formData) return;
    const updated = [...formData.hours];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setFormData({ ...formData, hours: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      await api.adminUpdateSettings(formData);
      await refreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Configurações da Loja & Operação
          </h2>
          <p className="text-xs text-stone-500">
            Atualize dados da unidade Santa Cruz, horários, endereço, telefones e taxas de entrega.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-xs sm:text-sm hover:bg-[#E8C60B] border border-amber-400 flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Configurações atualizadas com sucesso! As mudanças já estão visíveis no site público.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Identity & Official Brand */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
            <Store className="w-5 h-5 text-[#E8365D]" />
            <h3 className="font-heading font-extrabold text-base">Identidade da Unidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Nome Principal *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Identificação da Unidade *
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Conceito Gastronômico *
              </label>
              <input
                type="text"
                required
                value={formData.concept}
                onChange={(e) => handleChange('concept', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>
          </div>

          {/* Logo Showcase with notice */}
          <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-amber-200 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C] shrink-0 shadow-sm">
              <img 
                src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                alt="Emblema Oficial" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-xs text-stone-700">
              <span className="font-bold text-[#722238] block">Emblema Oficial Vinculado:</span>
              <p className="text-[11px] text-stone-500">
                Arquivo autoritativo com "SC" e medalha "CASA DO NORTE". Conforme diretrizes da marca, as proporções e elementos gráficos originais são preservados com precisão.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Phones & WhatsApp Validation */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
            <Phone className="w-5 h-5 text-[#F9D71C]" />
            <h3 className="font-heading font-extrabold text-base">Telefones e WhatsApp</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Telefone da Fachada Cadastrado *
              </label>
              <input
                type="text"
                required
                value={formData.phoneLandline}
                onChange={(e) => handleChange('phoneLandline', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Fixo / Fachada: 3984-1957 ou (11) 96014-9521.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                DDD do Telefone Fixo
              </label>
              <input
                type="text"
                value={formData.phoneDDD || ''}
                onChange={(e) => handleChange('phoneDDD', e.target.value)}
                placeholder="Ex: 11"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Número do WhatsApp Oficial com DDD
              </label>
              <input
                type="tel"
                value={formData.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="Ex: (11) 96014-9521"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={formData.whatsappConfirmed}
                  onChange={(e) => handleChange('whatsappConfirmed', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
                />
                <span>Confirmar este WhatsApp como canal oficial verificado no site</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Address & Maps */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
            <MapPin className="w-5 h-5 text-[#E8365D]" />
            <h3 className="font-heading font-extrabold text-base">Endereço Físico em Santa Cruz</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Logradouro / Rua *
              </label>
              <input
                type="text"
                required
                value={formData.addressStreet}
                onChange={(e) => handleChange('addressStreet', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Número *
              </label>
              <input
                type="text"
                required
                value={formData.addressNumber}
                onChange={(e) => handleChange('addressNumber', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Bairro *
              </label>
              <input
                type="text"
                required
                value={formData.addressNeighborhood}
                onChange={(e) => handleChange('addressNeighborhood', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Cidade / UF *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.addressCity}
                  onChange={(e) => handleChange('addressCity', e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
                <input
                  type="text"
                  required
                  value={formData.addressState}
                  onChange={(e) => handleChange('addressState', e.target.value)}
                  className="w-16 text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden text-center uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                CEP *
              </label>
              <input
                type="text"
                required
                value={formData.addressCep}
                onChange={(e) => handleChange('addressCep', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Status de Confirmação do Endereço
              </label>
              <select
                value={formData.addressStatus}
                onChange={(e) => handleChange('addressStatus', e.target.value as any)}
                className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
              >
                <option value="confirmado">Confirmado pelo lojista (Pronto para o público)</option>
                <option value="pendente_confirmacao">Pendente de confirmação do número/rua exatos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Google Profile & Services */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-heading font-extrabold text-base">Perfil Google & Serviços</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Nota no Google (0 a 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.googleRating || 4.1}
                onChange={(e) => handleChange('googleRating', parseFloat(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Total de Avaliações Google
              </label>
              <input
                type="number"
                min="0"
                value={formData.googleTotalReviews || 16}
                onChange={(e) => handleChange('googleTotalReviews', parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Faixa de Preço Exibida
              </label>
              <input
                type="text"
                value={formData.priceRange || 'R$ 20 a R$ 80 por pessoa'}
                onChange={(e) => handleChange('priceRange', e.target.value)}
                placeholder="Ex: R$ 20 a R$ 80 por pessoa"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Commercial Operation Rules */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
            <Truck className="w-5 h-5 text-[#1F5FA8]" />
            <h3 className="font-heading font-extrabold text-base">Regras de Pedido e Delivery</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Pedido Mínimo (R$)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.minOrderValue}
                onChange={(e) => handleChange('minOrderValue', parseFloat(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Tempo de Preparo (min)
              </label>
              <input
                type="number"
                min="10"
                value={formData.defaultPrepMinutes}
                onChange={(e) => handleChange('defaultPrepMinutes', parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Taxa de Entrega Padrão (R$)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.defaultDeliveryFee}
                onChange={(e) => handleChange('defaultDeliveryFee', parseFloat(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Frete Grátis Acima de (R$)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.freeDeliveryAbove || ''}
                onChange={(e) => handleChange('freeDeliveryAbove', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Ex: 120.00"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Áreas de entrega de verdade, com CEP, taxa e prazo. */}
        <div className="rounded-3xl border border-amber-200 bg-white p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#722238]">Áreas de entrega por CEP</h3>
              <p className="text-xs text-stone-500">O sistema escolhe o prefixo de CEP mais específico e recusa pedidos fora das áreas cadastradas.</p>
            </div>
            <button type="button" className="rounded-xl bg-[#722238] text-white px-4 py-2 font-bold text-xs"
              onClick={() => handleChange('deliveryZones', [...formData.deliveryZones, {
                id: 'zona-' + Date.now(), name: '', cepPrefix: '', fee: 0, estimatedMinutes: 45, active: false
              }])}>+ Nova área</button>
          </div>
          {formData.deliveryZones.map((zone, index) => (
            <div key={zone.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 rounded-2xl p-4 border border-stone-200 bg-[#FFF8EC] items-end">
              <label className="lg:col-span-2 text-xs font-bold text-stone-700">Nome da área
                <input className="block w-full mt-1 p-2.5 rounded-xl border border-stone-300 bg-white" value={zone.name}
                  onChange={e => handleChange('deliveryZones', formData.deliveryZones.map((z, i) => i === index ? {...z, name:e.target.value} : z))} />
              </label>
              <label className="text-xs font-bold text-stone-700">Prefixo do CEP
                <input inputMode="numeric" maxLength={8} placeholder="02850" className="block w-full mt-1 p-2.5 rounded-xl border border-stone-300 bg-white"
                  value={zone.cepPrefix || ''} onChange={e => handleChange('deliveryZones', formData.deliveryZones.map((z,i) => i === index ? {...z, cepPrefix:e.target.value.replace(/\D/g,'')} : z))} />
              </label>
              <label className="text-xs font-bold text-stone-700">Taxa (R$)
                <input type="number" min="0" step="0.5" className="block w-full mt-1 p-2.5 rounded-xl border border-stone-300 bg-white"
                  value={zone.fee} onChange={e => handleChange('deliveryZones', formData.deliveryZones.map((z,i) => i === index ? {...z, fee: Number(e.target.value)} : z))} />
              </label>
              <label className="text-xs font-bold text-stone-700">Prazo (min)
                <input type="number" min="1" className="block w-full mt-1 p-2.5 rounded-xl border border-stone-300 bg-white"
                  value={zone.estimatedMinutes} onChange={e => handleChange('deliveryZones', formData.deliveryZones.map((z,i) => i === index ? {...z, estimatedMinutes: Number(e.target.value)} : z))} />
              </label>
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-2">
                  <input type="checkbox" checked={zone.active} onChange={e => handleChange('deliveryZones', formData.deliveryZones.map((z,i) => i === index ? {...z,active:e.target.checked} : z))}/> Ativa
                </label>
                <button type="button" className="text-rose-700 text-xs font-bold p-2" aria-label={'Excluir ' + zone.name}
                  onClick={() => handleChange('deliveryZones', formData.deliveryZones.filter((_,i) => i !== index))}>Excluir</button>
              </div>
            </div>
          ))}
          <p className="text-xs text-stone-600">Exemplo: prefixo 02850 atende CEPs iniciados por 02850. Confira cada região e taxa real antes de ativar.</p>
        </div>

        {/* Section 5: Weekly Opening Hours */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
            <Clock className="w-5 h-5 text-[#E8365D]" />
            <h3 className="font-heading font-extrabold text-base">Horário Semanal de Funcionamento</h3>
          </div>

          <div className="space-y-2">
            {formData.hours.map((h, idx) => (
              <div 
                key={h.dayOfWeek}
                className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    checked={h.isOpen}
                    onChange={(e) => handleHourChange(idx, 'isOpen', e.target.checked)}
                    className="w-4 h-4 text-[#E8365D] rounded accent-[#E8365D]"
                  />
                  <span className="font-bold text-stone-800">{h.dayName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500">Das:</span>
                  <input
                    type="time"
                    disabled={!h.isOpen}
                    value={h.openTime}
                    onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                    className="p-1.5 rounded-lg border border-stone-300 bg-white disabled:opacity-30"
                  />
                  <span className="text-stone-500">às:</span>
                  <input
                    type="time"
                    disabled={!h.isOpen}
                    value={h.closeTime}
                    onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                    className="p-1.5 rounded-lg border border-stone-300 bg-white disabled:opacity-30"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-sm sm:text-base hover:bg-[#E8C60B] border border-amber-400 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações da Loja'}
          </button>
        </div>

      </form>

    </div>
  );
};
