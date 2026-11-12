import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  MessageCircle, 
  Filter, 
  Search, 
  ArrowRight,
  Eye,
  AlertCircle,
  RefreshCw,
  Phone,
  MapPin
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { OrderReceiptModal } from '../../components/OrderReceiptModal';

export const AdminOrdersPage: React.FC = () => {
  const { storeSettings } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.adminGetOrders();
      setOrders(data);
    } catch (e) {
      console.error('Error fetching admin orders', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string, reason?: string) => {
    try {
      await api.adminUpdateOrderStatus(orderId, status, note, reason);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status, cancelReason: reason || prev.cancelReason } : null);
      }
      setCancelModalOrder(null);
      setCancelReason('');
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  const handleUpdatePayment = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      await api.adminUpdateOrderPayment(orderId, paymentStatus);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar pagamento');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Kanban buckets
  const receivedOrders = filteredOrders.filter(o => o.status === 'Recebido');
  const acceptedOrders = filteredOrders.filter(o => o.status === 'Aceito');
  const prepOrders = filteredOrders.filter(o => o.status === 'Em preparo');
  const dispatchOrders = filteredOrders.filter(o => o.status === 'Pronto para retirada' || o.status === 'Saiu para entrega');
  const finishedOrders = filteredOrders.filter(o => o.status === 'Finalizado');

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Filters and Refresh */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-[#722238]">
              Gerenciamento de Pedidos em Tempo Real
            </h2>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          </div>
          <p className="text-xs text-stone-500">
            Atualização contínua com alerta sonoro sincronizado com a cozinha.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID, nome, tel..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#E8365D] bg-stone-50 outline-hidden w-48 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold text-stone-700 outline-hidden"
          >
            <option value="all">Todos os Status ({orders.length})</option>
            <option value="Recebido">Recebidos / Novos</option>
            <option value="Aceito">Aceitos</option>
            <option value="Em preparo">Em Preparo</option>
            <option value="Saiu para entrega">Saiu para Entrega</option>
            <option value="Pronto para retirada">Pronto p/ Retirada</option>
            <option value="Finalizado">Finalizados</option>
            <option value="Cancelado">Cancelados</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
            title="Atualizar lista agora"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        
        {/* Column 1: Novos / Recebidos */}
        <div className="bg-[#FFF8EC] rounded-3xl p-4 border border-amber-300/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <span className="font-heading font-extrabold text-sm text-[#722238] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Novos / Recebidos ({receivedOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {receivedOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">Nenhum pedido novo no momento.</p>
            ) : (
              receivedOrders.map(order => (
                <div key={order.id} className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading font-bold text-sm text-stone-900 block">{order.id}</span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {order.type === 'delivery' ? 'Entrega' : 'Balcão'}
                      </span>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-[#722238]">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                    <p className="font-bold">{order.customer.name}</p>
                    <p className="text-stone-500">{order.customer.phone}</p>
                    <p className="text-[11px] text-stone-600">
                      <strong>{order.items.length} itens:</strong> {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Aceito', 'Pedido aceito pela cozinha')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aceitar</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsReceiptModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Comanda</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-stone-500 hover:text-[#E8365D] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>

                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="text-rose-600 hover:underline cursor-pointer"
                    >
                      Recusar / Cancelar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Aceitos & Em Preparo */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-heading font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-[#E8365D]" />
              Na Cozinha / Em Preparo ({acceptedOrders.length + prepOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {[...acceptedOrders, ...prepOrders].length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">Nenhum pedido sendo preparado agora.</p>
            ) : (
              [...acceptedOrders, ...prepOrders].map(order => (
                <div key={order.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading font-bold text-sm text-stone-900 block">{order.id}</span>
                      <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {order.status}
                      </span>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-[#722238]">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 space-y-1">
                    <p className="font-semibold">{order.customer.name}</p>
                    <p className="text-[11px] text-stone-600">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(' | ')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {order.status === 'Aceito' ? (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Em preparo', 'Pratos no fogo e na chapa')}
                        className="col-span-2 py-2 px-3 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs hover:bg-[#E8C60B] border border-amber-400 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Iniciar Preparo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(
                          order.id, 
                          order.type === 'delivery' ? 'Saiu para entrega' : 'Pronto para retirada',
                          order.type === 'delivery' ? 'Entregador saiu com a comanda' : 'Prato embalado no balcão'
                        )}
                        className="col-span-2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{order.type === 'delivery' ? 'Despachar Entrega' : 'Pronto p/ Retirar'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsReceiptModalOpen(true);
                      }}
                      className="text-stone-500 hover:text-stone-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reimprimir Comanda</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#E8365D] hover:underline font-bold"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Saiu para Entrega / Pronto */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-heading font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#1F5FA8]" />
              Em Trânsito / Pronto ({dispatchOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {dispatchOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">Nenhum pedido em trânsito no momento.</p>
            ) : (
              dispatchOrders.map(order => (
                <div key={order.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading font-bold text-sm text-stone-900 block">{order.id}</span>
                      <span className="text-[11px] text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {order.status}
                      </span>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-[#722238]">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 space-y-0.5">
                    <p className="font-semibold">{order.customer.name}</p>
                    {order.address && (
                      <p className="text-[11px] text-stone-500 line-clamp-1">
                        {order.address.street}, {order.address.number} - {order.address.neighborhood}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'Finalizado', 'Pedido entregue com sucesso ao cliente')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir e Finalizar</span>
                  </button>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-stone-500 font-medium">
                      Pgto: <strong>{order.paymentStatus}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#E8365D] hover:underline font-bold"
                    >
                      Detalhes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Finalizados Recentes */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-heading font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Finalizados Recentes ({finishedOrders.length})
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {finishedOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">Nenhum pedido finalizado ainda hoje.</p>
            ) : (
              finishedOrders.slice(0, 15).map(order => (
                <div key={order.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-stone-900">{order.id}</span>
                    <span className="font-extrabold text-emerald-700">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-stone-600 font-medium">{order.customer.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>{new Date(order.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#E8365D] hover:underline font-bold"
                    >
                      Ver Resumo
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Order Full Detail Slide-over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 border border-amber-300 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase">Detalhes da Comanda</span>
                <h3 className="font-heading font-extrabold text-2xl text-[#722238]">{selectedOrder.id}</h3>
                <p className="text-xs text-stone-500">
                  Criado em {new Date(selectedOrder.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir 80mm</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Status and Payment actions */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FFF8EC] border border-amber-200">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  Status Operacional
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 outline-hidden"
                >
                  <option value="Recebido">Recebido</option>
                  <option value="Aceito">Aceito</option>
                  <option value="Em preparo">Em preparo</option>
                  <option value="Pronto para retirada">Pronto para retirada</option>
                  <option value="Saiu para entrega">Saiu para entrega</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  Status do Pagamento
                </label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdatePayment(selectedOrder.id, e.target.value as PaymentStatus)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 outline-hidden"
                >
                  <option value="Aguardando pagamento">Aguardando pagamento</option>
                  <option value="Aguardando conferência manual">Aguardando conferência manual</option>
                  <option value="Pago">Pago (Confirmado)</option>
                  <option value="Falhou">Falhou</option>
                  <option value="Reembolsado">Reembolsado</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-heading font-bold text-stone-900 text-sm">Dados do Cliente & Entrega</h4>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <p><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                <p><strong>Telefone:</strong> {selectedOrder.customer.phone}</p>
                <p><strong>Modalidade:</strong> {selectedOrder.type === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Balcão'}</p>
                {selectedOrder.address && (
                  <div className="pt-1 mt-1 border-t border-stone-200">
                    <p><strong>Endereço:</strong> {selectedOrder.address.street}, Nº {selectedOrder.address.number}</p>
                    {selectedOrder.address.complement && <p><strong>Comp:</strong> {selectedOrder.address.complement}</p>}
                    <p><strong>Bairro:</strong> {selectedOrder.address.neighborhood} - {selectedOrder.address.city}/{selectedOrder.address.state}</p>
                    <p><strong>CEP:</strong> {selectedOrder.address.cep}</p>
                    {selectedOrder.address.reference && <p className="italic">Ref: {selectedOrder.address.reference}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-heading font-bold text-stone-900 text-sm">Itens da Comanda</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>{it.quantity}x {it.name}</span>
                      <span>R$ {it.totalItemPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {it.selectedOptions && it.selectedOptions.length > 0 && (
                      <div className="text-stone-500 pl-2 pt-1 space-y-0.5">
                        {it.selectedOptions.map((opt, i) => (
                          <p key={i}>+ {opt.groupName}: {opt.choiceName}</p>
                        ))}
                      </div>
                    )}
                    {it.observation && (
                      <p className="italic text-stone-700 font-medium pl-2 pt-1 bg-amber-50 p-1 rounded mt-1">
                        Obs: {it.observation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="p-3 bg-stone-100 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {selectedOrder.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto ({selectedOrder.couponCode}):</span>
                    <span>- R$ {selectedOrder.discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>{selectedOrder.deliveryFee === 0 ? 'Grátis' : `R$ ${selectedOrder.deliveryFee.toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Geral:</span>
                  <span className="text-[#722238]">R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp manual contact */}
            <div className="pt-2">
              <a
                href={`https://wa.me/55${selectedOrder.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedOrder.customer.name}! Estamos falando do Restaurante Delícia do Nordeste - Casa do Norte Santa Cruz a respeito do seu pedido ${selectedOrder.id}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar com o Cliente no WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-rose-300 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700 font-heading font-extrabold text-lg">
              <XCircle className="w-5 h-5" />
              <span>Confirmar Cancelamento do Pedido</span>
            </div>

            <p className="text-xs text-stone-600">
              Tem certeza que deseja cancelar o pedido <strong>{cancelModalOrder.id}</strong> do cliente <strong>{cancelModalOrder.customer.name}</strong>?
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Motivo do Cancelamento (visível para o cliente) *
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Ingrediente esgotou na cozinha, cliente solicitou cancelamento..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                Voltar
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={() => handleUpdateStatus(cancelModalOrder.id, 'Cancelado', 'Pedido cancelado', cancelReason)}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comanda Print Modal */}
      {isReceiptModalOpen && selectedOrder && (
        <OrderReceiptModal 
          order={selectedOrder} 
          onClose={() => setIsReceiptModalOpen(false)} 
        />
      )}

    </div>
  );
};
