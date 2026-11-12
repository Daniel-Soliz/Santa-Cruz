import React from 'react';
export function Policies({kind}:{kind:'privacidade'|'termos'}){
 const privacy=kind==='privacidade';
 return <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
  <a href="#/" className="text-sm font-bold text-[#E8365D]">← Voltar à loja</a>
  <h1 className="mt-5 font-heading text-4xl font-extrabold text-[#722238]">{privacy?'Privacidade e dados pessoais':'Condições de compra'}</h1>
  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
   Minuta informativa para revisão pelo responsável do restaurante antes da abertura comercial. Informações legais e prazos de retenção devem ser confirmados.
  </div>
  {privacy?<div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-700">
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Quais dados usamos</h2><p>Nome, telefone, e-mail para pagamentos online, endereço quando houver entrega, detalhes do pedido e identificador anônimo do Firebase Authentication. Usamos esses dados para registrar e entregar o pedido e oferecer acompanhamento e suporte.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Pagamentos</h2><p>O Mercado Pago processa Pix e pagamentos online. O CPF solicitado para emissão de Pix é transmitido à API do provedor e não é salvo no documento do pedido no Firestore. Dados de cartão não passam pelo nosso sistema, pois o Checkout Pro utiliza a página protegida do Mercado Pago.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Serviços utilizados</h2><p>Utilizamos Firebase Authentication, Firestore, Cloud Functions e Storage para operar a loja, ViaCEP para facilitar o preenchimento do endereço e Mercado Pago para pagamentos. Consulte também as políticas dos respectivos provedores.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Seus direitos</h2><p>Para consultar, corrigir ou solicitar exclusão de informações, entre em contato com o restaurante pelo telefone (11) 96014-9521. A solicitação será analisada considerando as obrigações legais de conservação.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Antes da operação</h2><p>O responsável pelo negócio deve completar identificação do controlador, CNPJ, contato de privacidade, critérios de retenção e descarte, bases legais e eventuais transferências internacionais.</p></section>
  </div>:<div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-700">
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Pedidos</h2><p>O cliente escolhe produtos, quantidades e opcionais. A disponibilidade, o valor final, a taxa de entrega e o horário de atendimento são conferidos pelo servidor antes de registrar o pedido. Pedidos não são aceitos fora do horário de funcionamento.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Pagamentos</h2><p>Pagamentos online dependem de confirmação do Mercado Pago. O retorno à loja após o checkout não equivale a pagamento aprovado. Dinheiro ou maquininha na entrega ou retirada podem ser habilitados pela equipe.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Entrega e retirada</h2><p>O delivery depende da região de CEP atendida, do pedido mínimo e da taxa exibidos antes da confirmação. Os horários estimados são informativos e podem mudar conforme a operação.</p></section>
   <section><h2 className="font-heading text-2xl font-bold text-[#722238]">Cancelamento e suporte</h2><p>Em caso de erro, indisponibilidade ou solicitação de cancelamento, fale com a equipe pelo telefone (11) 96014-9521. O responsável pelo restaurante precisa definir e publicar regras definitivas de cancelamento, devolução e reembolso antes de vender.</p></section>
  </div>}
 </main>;
}
