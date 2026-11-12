import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, ShoppingBag, Clock, CreditCard } from 'lucide-react';
import { api } from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.adminGetReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportCsv = () => {
    const token = localStorage.getItem('nordeste_admin_token');
    window.open(`/api/admin/reports/csv?auth=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & CSV Export */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Relatórios Financeiros & Vendas
          </h2>
          <p className="text-xs text-stone-500">
            Métricas de desempenho, faturamento real (sem cancelamentos) e exportação em planilha.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs sm:text-sm hover:bg-stone-900 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Confirmado</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-700">
            R$ {reports?.totalRevenue?.toFixed(2).replace('.', ',') || '0,00'}
          </h3>
          <p className="text-xs text-stone-500">Exclui pedidos cancelados</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
            <ShoppingBag className="w-5 h-5 text-[#E8365D]" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900">
            {reports?.totalOrders || 0}
          </h3>
          <p className="text-xs text-stone-500">Comandas válidas geradas</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp className="w-5 h-5 text-[#1F5FA8]" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#722238]">
            R$ {reports?.averageTicket?.toFixed(2).replace('.', ',') || '0,00'}
          </h3>
          <p className="text-xs text-stone-500">Média por pedido concluído</p>
        </div>
      </div>

      {/* Top Sellers Table */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-heading font-extrabold text-stone-900 text-lg border-b border-stone-100 pb-3">
          Ranking dos Pratos Mais Vendidos
        </h3>

        {reports?.topItems?.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-6 text-center">Nenhuma venda registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {reports?.topItems?.map((it: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-[#722238] font-heading font-extrabold flex items-center justify-center text-sm">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block text-sm">{it.name}</span>
                    <span className="text-stone-500">{it.count} unidades servidas</span>
                  </div>
                </div>

                <span className="font-extrabold text-[#722238] text-sm">
                  R$ {it.revenue.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
