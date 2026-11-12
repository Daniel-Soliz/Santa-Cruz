import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  ExternalLink, 
  Lock, 
  Save,
  Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export const AdminPaymentsPage: React.FC = () => {
  const { storeSettings, refreshSettings } = useCart();
  const [formData, setFormData] = useState({
    mercadoPagoEnabled: storeSettings?.mercadoPagoEnabled ?? true,
    mercadoPagoSandbox: storeSettings?.mercadoPagoSandbox ?? true,
    mercadoPagoPublicKey: storeSettings?.mercadoPagoPublicKey || '',
    pixEnabled: storeSettings?.pixEnabled ?? true,
    pixType: storeSettings?.pixType || 'manual',
    pixKey: storeSettings?.pixKey || 'deliciadonordeste.santacruz@gmail.com',
    pixKeyType: storeSettings?.pixKeyType || 'email',
    pixBeneficiary: storeSettings?.pixBeneficiary || 'Restaurante Delícia do Nordeste Santa Cruz',
    cashOnDeliveryEnabled: storeSettings?.cashOnDeliveryEnabled ?? true,
    cardOnDeliveryEnabled: storeSettings?.cardOnDeliveryEnabled ?? true,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/payments/mercadopago/webhook`
    : 'https://seusite.com/api/payments/mercadopago/webhook';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      {/* Page Title */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Integração e Meios de Pagamento
          </h2>
          <p className="text-xs text-stone-500">
            Gerencie Pix instantâneo, Mercado Pago Checkout Pro e opções de pagamento na entrega.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-xs sm:text-sm hover:bg-[#E8C60B] border border-amber-400 flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Formas de Pagamento'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Configurações de pagamento salvas com sucesso no servidor!</span>
        </div>
      )}

      {/* Mercado Pago Module */}
      <div className="p-6 rounded-3xl bg-white border border-sky-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center gap-2.5 text-[#1F5FA8]">
            <CreditCard className="w-6 h-6" />
            <div>
              <h3 className="font-heading font-extrabold text-lg">Mercado Pago Checkout Pro</h3>
              <p className="text-xs text-stone-500">Cartão de Crédito, Débito e Saldo com Webhook Server-to-Server</p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            storeSettings?.mercadoPagoAccessTokenConfigured
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {storeSettings?.mercadoPagoAccessTokenConfigured ? 'Pronto para Produção' : 'Aguardando Credenciais'}
          </span>
        </div>

        {/* Security Warning */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold text-stone-900">Segurança de Credenciais do Servidor:</strong>
            <p>
              Conforme exigido pelo regulamento de segurança, o <code>MERCADO_PAGO_ACCESS_TOKEN</code> nunca é exposto no bundle do cliente nem no Firestore público. Ele é armazenado como variável de ambiente no servidor (<code>.env</code>) ou injetado via Painel de Segredos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Ambiente de Execução
            </label>
            <select
              value={formData.mercadoPagoSandbox ? 'sandbox' : 'production'}
              onChange={(e) => setFormData({ ...formData, mercadoPagoSandbox: e.target.value === 'sandbox' })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
            >
              <option value="sandbox">Sandbox (Ambiente de Testes do Mercado Pago)</option>
              <option value="production">Produção (Cobrança Real)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Public Key (Chave Pública do Mercado Pago)
            </label>
            <input
              type="text"
              value={formData.mercadoPagoPublicKey}
              onChange={(e) => setFormData({ ...formData, mercadoPagoPublicKey: e.target.value })}
              placeholder="TEST-..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              URL do Webhook para Notificação Automática (Idempotência Ativa)
            </label>
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-100 font-mono text-stone-600"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Cadastre esta URL no portal de desenvolvedores do Mercado Pago para receber notificações de pagamentos aprovados.
            </p>
          </div>
        </div>
      </div>

      {/* Pix Module */}
      <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-heading font-extrabold text-lg">Pix Instantâneo</h3>
              <p className="text-xs text-stone-500">QR Code dinâmico e chave Pix da Casa do Norte</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
            <input
              type="checkbox"
              checked={formData.pixEnabled}
              onChange={(e) => setFormData({ ...formData, pixEnabled: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
            />
            <span>Habilitado no Checkout</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Tipo de Chave Pix
            </label>
            <select
              value={formData.pixKeyType}
              onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value as any })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
            >
              <option value="email">E-mail</option>
              <option value="cnpj">CNPJ</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave Aleatória</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Chave Pix Oficial da Loja *
            </label>
            <input
              type="text"
              required
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Nome do Beneficiário no Banco *
            </label>
            <input
              type="text"
              required
              value={formData.pixBeneficiary}
              onChange={(e) => setFormData({ ...formData, pixBeneficiary: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
            />
          </div>
        </div>
      </div>

      {/* Offline Payment Methods (Cash & POS Machine) */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#722238] border-b border-stone-100 pb-3">
          <Banknote className="w-5 h-5 text-amber-600" />
          <h3 className="font-heading font-extrabold text-base">Pagamento na Entrega ou Retirada</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cashOnDeliveryEnabled}
              onChange={(e) => setFormData({ ...formData, cashOnDeliveryEnabled: e.target.checked })}
              className="w-4 h-4 text-[#E8365D] rounded accent-[#E8365D]"
            />
            <div>
              <span className="font-bold text-xs text-stone-900 block">Dinheiro (com cálculo de troco)</span>
              <span className="text-[11px] text-stone-500">O cliente pode solicitar troco na sacola do pedido.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cardOnDeliveryEnabled}
              onChange={(e) => setFormData({ ...formData, cardOnDeliveryEnabled: e.target.checked })}
              className="w-4 h-4 text-[#E8365D] rounded accent-[#E8365D]"
            />
            <div>
              <span className="font-bold text-xs text-stone-900 block">Cartão na Maquininha (Presencial)</span>
              <span className="text-[11px] text-stone-500">O motoboy ou atendente leva a máquina física para débito/crédito.</span>
            </div>
          </label>
        </div>
      </div>

    </div>
  );
};
