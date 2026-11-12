import React from 'react';
import { AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Aviso aos Clientes:</strong>
          <span>
            Estes termos regulam a utilização do cardápio digital e sistema de pedidos online da Casa do Norte Delícia do Nordeste - Unidade Santa Cruz.
          </span>
        </div>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-stone-700 text-sm leading-relaxed">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#722238] border-b border-stone-100 pb-4">
          Termos e Condições de Uso e Pedidos
        </h1>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">1. Realização de Pedidos</h2>
          <p>
            Ao enviar um pedido através de nossa plataforma, o cliente confirma as escolhas de pratos, tamanhos, adicionais e o endereço indicado. O restaurante iniciará o preparo após confirmação de disponibilidade na cozinha.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">2. Horários e Tempo Estimado</h2>
          <p>
            O tempo de preparo e entrega (geralmente entre 35 e 55 minutos) é uma estimativa calculada com base no fluxo da cozinha e nas condições climáticas e de tráfego na região de Santa Cruz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">3. Formas de Pagamento e Cancelamentos</h2>
          <p>
            Pedidos pagos via Pix ou Mercado Pago têm confirmação automatizada ou mediante envio de comprovante. Cancelamentos só podem ser efetuados antes de o prato entrar em preparo na cozinha.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-stone-900">4. Alergias e Ingredientes</h2>
          <p>
            Nossos pratos típicos nordestinos podem conter derivados de leite (queijo coalho, manteiga de garrafa) e embutidos. Solicitamos que observações sobre restrições alimentares sejam devidamente indicadas no campo "Observações" antes do envio do pedido.
          </p>
        </section>
      </div>

    </div>
  );
};
