import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';

interface OrderReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderDate = new Date(order.createdAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white animate-in fade-in duration-200">
      
      {/* Modal Dialog (Hidden during print except #thermal-comanda) */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-200 print:border-none print:shadow-none print:w-auto">
        
        {/* Modal Topbar (Hidden in print) */}
        <div className="p-4 bg-stone-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-heading font-bold text-sm">Impressão de Comanda (58/80mm)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#F9D71C] text-[#722238] font-bold text-xs hover:bg-[#E8C60B] flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Thermal Comanda Content (Tagged with #thermal-comanda for media print) */}
        <div id="thermal-comanda" className="p-5 font-mono text-xs text-black leading-tight bg-white">
          
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className="font-bold text-sm uppercase tracking-wider">
              DELICIA DO NORDESTE
            </h2>
            <p className="text-[11px] font-bold">CASA DO NORTE • SANTA CRUZ</p>
            <p className="text-[10px]">PARQUE BELÉM - SÃO PAULO (SP)</p>
            <p className="text-[10px]">TEL / WHATSAPP: (11) 96014-9521</p>
          </div>

          {/* Order Details Header */}
          <div className="py-2 border-b border-dashed border-black text-[11px]">
            <div className="flex justify-between font-bold text-sm">
              <span>PEDIDO:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex justify-between text-[10px] text-stone-600 mt-0.5">
              <span>DATA/HORA:</span>
              <span>{orderDate}</span>
            </div>
            <div className="flex justify-between font-bold mt-1">
              <span>TIPO:</span>
              <span className="uppercase">{order.type === 'delivery' ? '>>> ENTREGA DELIVERY <<<' : '>>> RETIRADA NO BALCÃO <<<'}</span>
            </div>
          </div>

          {/* Customer & Address */}
          <div className="py-2 border-b border-dashed border-black space-y-1">
            <div>
              <span className="font-bold">CLIENTE: </span>
              <span>{order.customer.name}</span>
            </div>
            <div>
              <span className="font-bold">TEL: </span>
              <span>{order.customer.phone}</span>
            </div>

            {order.type === 'delivery' && order.address && (
              <div className="pt-1 text-[11px] bg-stone-100/80 p-1.5 rounded">
                <p className="font-bold underline">ENDEREÇO DE ENTREGA:</p>
                <p>{order.address.street}, {order.address.number}</p>
                {order.address.complement && <p>Compl: {order.address.complement}</p>}
                <p>Bairro: {order.address.neighborhood} - {order.address.city}/{order.address.state}</p>
                <p>CEP: {order.address.cep}</p>
                {order.address.reference && <p className="italic">Ref: {order.address.reference}</p>}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-black space-y-2">
            <p className="font-bold text-center tracking-widest text-[11px]">--- ITENS DO PEDIDO ---</p>
            
            {order.items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>{it.quantity}x {it.name}</span>
                  <span>R$ {it.totalItemPrice.toFixed(2).replace('.', ',')}</span>
                </div>

                {it.selectedOptions && it.selectedOptions.length > 0 && (
                  <div className="pl-3 text-[10px] text-stone-700">
                    {it.selectedOptions.map((opt, i) => (
                      <p key={i}>
                        + {opt.groupName}: {opt.choiceName}
                        {opt.priceModifier > 0 && ` (+R$ ${opt.priceModifier.toFixed(2)})`}
                      </p>
                    ))}
                  </div>
                )}

                {it.observation && (
                  <p className="pl-3 text-[10px] italic font-bold">
                    * OBS: {it.observation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="py-2 border-b border-dashed border-black space-y-1 text-xs">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>DESCONTO ({order.couponCode || 'CUPOM'}):</span>
                <span>- R$ {order.discount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>TAXA ENTREGA:</span>
              <span>{order.deliveryFee === 0 ? 'GRATIS' : `R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}`}</span>
            </div>

            <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
              <span>TOTAL:</span>
              <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="py-2 border-b border-dashed border-black text-xs space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">FORMA PAGTO:</span>
              <span className="uppercase">
                {order.paymentMethod === 'pix' && 'PIX'}
                {order.paymentMethod === 'mercadopago' && 'MERCADO PAGO'}
                {order.paymentMethod === 'dinheiro' && 'DINHEIRO'}
                {order.paymentMethod === 'cartao_entrega' && 'CARTÃO (MAQUININHA)'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>SITUAÇÃO:</span>
              <span className="font-bold uppercase">{order.paymentStatus}</span>
            </div>

            {order.paymentMethod === 'dinheiro' && order.changeFor && (
              <div className="flex justify-between bg-stone-150 p-1 font-bold">
                <span>TROCO PARA:</span>
                <span>R$ {order.changeFor.toFixed(2).replace('.', ',')} (Troco: R$ {(order.changeFor - order.total).toFixed(2).replace('.', ',')})</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] space-y-0.5">
            <p>Obrigado pela preferência!</p>
            <p>Casa do Norte Delícia do Nordeste</p>
            <p className="text-[9px] text-stone-500">Comprovante de conferência interna</p>
          </div>

        </div>

        {/* Modal Bottom action in preview */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 font-semibold text-xs hover:bg-stone-200 cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-900 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Comanda
          </button>
        </div>

      </div>
    </div>
  );
};
