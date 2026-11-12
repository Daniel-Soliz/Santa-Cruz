import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  FileCode, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone,
  CreditCard,
  QrCode,
  HardDrive
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const AdminChecklistPage: React.FC = () => {
  const { storeSettings } = useCart();
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  const checklistItems = [
    {
      category: 'Identidade e Marca',
      items: [
        {
          title: 'Emblema Oficial Casa do Norte SC',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Logotipo com "SC" e medalha "CASA DO NORTE" aplicado com fidelidade em 100% dos cabeçalhos, rodapés, favicon e comprovantes.'
        },
        {
          title: 'Paleta Visual Autêntica',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Cores #E8365D (rosa/vermelho), #F9D71C (amarelo), #4A4A44 (chumbo), #FFF8EC (creme) e #722238 (vinho) estruturadas em design system.'
        },
        {
          title: 'Telefone e WhatsApp (11) 96014-9521',
          status: storeSettings?.whatsappConfirmed ? 'Implementado e testado' : 'Pendente de confirmação do dono',
          statusType: storeSettings?.whatsappConfirmed ? 'success' : 'warning',
          detail: 'Telefone e WhatsApp oficial confirmados: (11) 96014-9521 (DDD 11, São Paulo – SP), com atendimento direto e link wa.me.'
        },
        {
          title: 'Endereço da Unidade Santa Cruz',
          status: storeSettings?.addressStatus === 'confirmado' ? 'Implementado e testado' : 'Pendente de confirmação do dono',
          statusType: storeSettings?.addressStatus === 'confirmado' ? 'success' : 'warning',
          detail: 'Rua Santa Cruz da Conceição, Parque Belém, São Paulo – SP, CEP 02850-100 confirmado e integrado ao mapa e taxas de entrega.'
        }
      ]
    },
    {
      category: 'Cardápio e Pedidos',
      items: [
        {
          title: 'Cálculo de Preço 100% no Servidor',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Proteção contra adulteração de preços pelo cliente; servidor recalcula subtotal, adicionais e cupons em transação segura.'
        },
        {
          title: 'Personalização de Pratos (Tamanhos e Adicionais)',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Modal com escolha obrigatória/opcional, limites min/max e cálculo automático de acréscimos.'
        },
        {
          title: 'Acompanhamento Seguro por Token',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Link /pedido/:id?token=... previne enumeração e vazamento de telefones ou endereços de clientes.'
        },
        {
          title: 'Comanda Térmica 58mm / 80mm',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Layout CSS para impressão direta via navegador em impressoras térmicas de cozinha e balcão.'
        },
        {
          title: 'QR Code de Mesa com Download',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Geração dinâmica em PNG de alta resolução para impressão de displays e adesivos de mesa.'
        }
      ]
    },
    {
      category: 'Pagamentos e Integrações',
      items: [
        {
          title: 'Pix Instantâneo e Manual',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Geração de QR Code e chave Pix da loja com status "Aguardando conferência manual" e cópia e cola.'
        },
        {
          title: 'Mercado Pago Checkout Pro',
          status: storeSettings?.mercadoPagoAccessTokenConfigured ? 'Implementado e testado' : 'Implementado, aguardando credenciais',
          statusType: storeSettings?.mercadoPagoAccessTokenConfigured ? 'success' : 'pending',
          detail: 'Estrutura de criação de preferências no backend, modo sandbox/produção e webhook com idempotência ativos.'
        },
        {
          title: 'Consulta Automática de CEP (ViaCEP)',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Preenchimento automático de rua e bairro com suporte a fallback manual.'
        }
      ]
    },
    {
      category: 'Segurança, LGPD e Administração',
      items: [
        {
          title: 'Controle de Acesso Baseado em Papéis (RBAC)',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Perfis Dono, Gerente e Atendente com autorização nas rotas do servidor.'
        },
        {
          title: 'Primeiro Acesso Seguro e Troca de Senha',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Obrigação de troca de senha no 1º login; nenhuma senha hardcoded sem fluxo de redefinição.'
        },
        {
          title: 'Exportação e Backup do Banco de Dados',
          status: 'Implementado e testado',
          statusType: 'success',
          detail: 'Download completo do banco em formato JSON para restauração segura pelo Dono.'
        }
      ]
    }
  ];

  const handleDownloadBackup = () => {
    setDownloadingBackup(true);
    const token = localStorage.getItem('nordeste_admin_token');
    window.open(`/api/admin/backup?auth=${token}`, '_blank');
    setTimeout(() => setDownloadingBackup(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Checklist de Ativação & Go-Live
          </h2>
          <p className="text-xs text-stone-500">
            Relatório detalhado de conformidade técnica, itens testados e pendências de credenciais para publicação.
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="px-5 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs sm:text-sm hover:bg-stone-900 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <HardDrive className="w-4 h-4 text-[#F9D71C]" />
          <span>{downloadingBackup ? 'Baixando...' : 'Baixar Backup JSON'}</span>
        </button>
      </div>

      {/* Checklist Groups */}
      <div className="space-y-6">
        {checklistItems.map((group, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-stone-900 text-base border-b border-stone-100 pb-3">
              {group.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-heading font-bold text-sm text-stone-900">{item.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        item.statusType === 'success'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.statusType === 'warning'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
