import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Aviso Legal Importante:</strong>
          <span>
            Este documento é um modelo operacional em conformidade com a LGPD (Lei nº 13.709/2018), configurado especificamente para o fluxo de pedidos de delivery e balcão do Restaurante Delícia do Nordeste — Casa do Norte Santa Cruz. Recomendamos a revisão periódica por assessoria jurídica qualificada.
          </span>
        </div>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-stone-700 text-sm leading-relaxed">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#722238] border-b border-stone-100 pb-4">
          Política de Privacidade e Proteção de Dados (LGPD)
        </h1>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">1. Identificação do Controlador</h2>
          <p>
            O <strong>Restaurante Delícia do Nordeste — Casa do Norte (Unidade Santa Cruz)</strong> é o controlador dos dados pessoais coletados exclusivamente para a finalidade de processamento, confecção e entrega de pedidos alimentícios.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">2. Princípio da Minimização de Dados</h2>
          <p>
            Coletamos estritamente os dados necessários para o atendimento ao cliente:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Nome do Cliente:</strong> Para identificar o destinatário na comanda e entrega.</li>
            <li><strong>Telefone / WhatsApp:</strong> Para contato sobre dúvidas no prato, status do entregador e confirmação.</li>
            <li><strong>Endereço de Entrega (se aplicável):</strong> Para deslocamento do motoboy e cálculo justo da taxa por região.</li>
          </ul>
          <p className="text-xs text-stone-500 italic">
            Não exigimos CPF ou cadastro prévio obrigatório para realizar pedidos na área pública.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">3. Segurança dos Pagamentos</h2>
          <p>
            Dados sensíveis de cartão de crédito são processados diretamente pelo gateway oficial do <strong>Mercado Pago</strong> em ambiente PCI-DSS seguro. Nosso servidor não armazena nem tem acesso aos números de cartão de crédito ou códigos de segurança.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">4. Direitos do Titular</h2>
          <p>
            Em cumprimento ao art. 18 da LGPD, o titular dos dados tem o direito de solicitar a confirmação da existência de tratamento, o acesso aos seus dados e a eliminação dos dados pessoais desnecessários através dos nossos canais de atendimento oficiais.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">5. Retenção e Descarte</h2>
          <p>
            Os dados de pedidos são mantidos pelo período necessário para cumprimento de obrigações fiscais e contábeis legais, sendo protegidos contra acesso não autorizado por regras rígidas de segurança no servidor.
          </p>
        </section>
      </div>

    </div>
  );
};
