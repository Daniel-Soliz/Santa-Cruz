import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles, 
  UtensilsCrossed, 
  Store, 
  ShieldCheck,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, MenuItem, StoreSettings } from '../../types';
import { useCart } from '../../context/CartContext';

interface AdminDashboardPageProps {
  onSelectTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onSelectTab }) => {
  const { storeSettings } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.adminGetOrders().catch(() => []),
      api.adminGetReports().catch(() => null),
      api.adminGetMenu().catch(() => [])
    ]).then(([ords, reps, menu]) => {
      setOrders(ords);
      setReports(reps);
      setMenuItems(menu);
    }).finally(() => setIsLoading(false));
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'Recebido');
  const inPrepOrders = orders.filter(o => o.status === 'Em preparo');
  const soldOutItems = menuItems.filter(i => i.status === 'esgotado_hoje');

  // Pending checklist items to alert the owner
  const pendingAlerts = [];
  if (storeSettings?.phoneLandlineStatus === 'cadastrado_sem_ddd') {
    pendingAlerts.push({
      title: 'Validação de Telefone / WhatsApp pendente',
      desc: 'Confirme o número com DDD e o WhatsApp oficial de atendimento nas configurações da loja.',
      tab: 'loja'
    });
  }
  if (storeSettings?.addressStatus === 'pendente_confirmacao') {
    pendingAlerts.push({
      title: 'Endereço e número exato pendentes de confirmação',
      desc: 'Valide o logradouro e número exato em Santa Cruz para que o cálculo de rotas no mapa fique perfeito.',
      tab: 'loja'
    });
  }
  if (!storeSettings?.mercadoPagoAccessTokenConfigured) {
    pendingAlerts.push({
      title: 'Mercado Pago Checkout Pro em modo demonstração',
      desc: 'Para receber cartões online em produção, insira suas credenciais oficiais do Mercado Pago no menu de Pagamentos.',
      tab: 'pagamentos'
    });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8365D] bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              Gestão da Cozinha & Vendas
            </span>
            <span className="text-xs text-stone-500">Unidade Santa Cruz</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#722238]">
            Visão Geral do Restaurante
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Acompanhe pedidos ao vivo, faturamento confirmado e alertas operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onSelectTab('pedidos')}
            className="px-4 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs sm:text-sm hover:bg-[#E8C60B] border border-amber-400 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Pedidos ({pendingOrders.length + inPrepOrders.length})</span>
          </button>

          <button
            onClick={() => onSelectTab('cardapio')}
            className="px-4 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs sm:text-sm hover:bg-stone-900 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
            <span>Editar Cardápio</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Pago</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
            R$ {reports?.totalRevenue?.toFixed(2).replace('.', ',') || '0,00'}
          </h3>
          <p className="text-[11px] text-stone-500">
            {reports?.totalOrders || 0} pedidos confirmados
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Aguardando Aceite</span>
            <div className={`p-2 rounded-xl ${pendingOrders.length > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-100 text-stone-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#722238]">
            {pendingOrders.length}
          </h3>
          <p className="text-[11px] text-stone-500">
            {pendingOrders.length > 0 ? 'Exigem ação da cozinha' : 'Nenhum pedido pendente'}
          </p>
        </div>

        {/* Orders In Prep */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Em Preparo</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#E8365D]">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#E8365D]">
            {inPrepOrders.length}
          </h3>
          <p className="text-[11px] text-stone-500">
            Pratos nas panelas e na chapa
          </p>
        </div>

        {/* Ticket Médio */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#1F5FA8]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
            R$ {reports?.averageTicket?.toFixed(2).replace('.', ',') || '0,00'}
          </h3>
          <p className="text-[11px] text-stone-500">
            Média por comanda finalizada
          </p>
        </div>

      </div>

      {/* Pending Operational Checklist Alerts */}
      {pendingAlerts.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#FFF8EC] border border-amber-300 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#722238]">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-heading font-extrabold text-base">
              Pendências e Alertas Operacionais ({pendingAlerts.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {pendingAlerts.map((alert, i) => (
              <div 
                key={i}
                className="p-3.5 rounded-2xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-stone-900">{alert.title}</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">{alert.desc}</p>
                </div>
                <button
                  onClick={() => onSelectTab(alert.tab)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-white font-bold text-[11px] hover:bg-stone-900 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Resolver no Painel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Top Sold Items & Sold out alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top items */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-heading font-extrabold text-stone-900 text-base">
              Pratos Mais Vendidos
            </h3>
            <span className="text-xs text-stone-400">Total acumulado</span>
          </div>

          {reports?.topItems?.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4">Nenhum pedido finalizado ainda para calcular os pratos mais vendidos.</p>
          ) : (
            <div className="space-y-3">
              {reports?.topItems?.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-[#722238] font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-stone-800">{it.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block">{it.count} vendidos</span>
                    <span className="text-[10px] text-stone-400">R$ {it.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock / Sold out items */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-heading font-extrabold text-stone-900 text-base">
              Disponibilidade do Cardápio
            </h3>
            <button 
              onClick={() => onSelectTab('cardapio')} 
              className="text-xs text-[#E8365D] font-bold hover:underline"
            >
              Gerenciar estoque
            </button>
          </div>

          {soldOutItems.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Todos os {menuItems.length} pratos estão disponíveis hoje. Nenhum marcado como esgotado.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-700 block">
                Itens marcados como "Esgotado por hoje" ({soldOutItems.length}):
              </span>
              {soldOutItems.map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                  <span className="font-medium text-stone-800">{item.name}</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Esgotado
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
