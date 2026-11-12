import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, ShoppingBag, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

interface CustomerSummary {
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.adminGetOrders()
      .then((orders: Order[]) => {
        const map = new Map<string, CustomerSummary>();

        orders.forEach(o => {
          const key = o.customer.phone.replace(/\D/g, '') || o.customer.name.toLowerCase();
          const existing = map.get(key);

          if (existing) {
            existing.ordersCount += 1;
            existing.totalSpent += o.total;
            if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = o.createdAt;
            }
          } else {
            map.set(key, {
              name: o.customer.name,
              phone: o.customer.phone,
              ordersCount: 1,
              totalSpent: o.total,
              lastOrderDate: o.createdAt
            });
          }
        });

        setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Clientes & Histórico
          </h2>
          <p className="text-xs text-stone-500">
            Base compilada de clientes com pedidos confirmados na Casa do Norte Santa Cruz.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 outline-hidden focus:border-[#E8365D]"
          />
        </div>
      </div>

      {/* LGPD Security notice */}
      <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-amber-200 text-xs text-stone-700 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Proteção de Dados (LGPD):</strong> Os telefones e nomes são exibidos apenas para operadores autorizados para fins de atendimento. Não realize disparos de marketing em massa sem o devido consentimento do cliente.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Telefone / WhatsApp</th>
                <th className="py-3.5 px-4">Total de Pedidos</th>
                <th className="py-3.5 px-4">Total Gasto</th>
                <th className="py-3.5 px-4">Último Pedido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 italic">
                    Nenhum cliente registrado ainda.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={i} className="hover:bg-stone-50/80">
                    <td className="py-3 px-4 font-bold text-stone-900">{c.name}</td>
                    <td className="py-3 px-4 text-stone-600">
                      <a 
                        href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {c.phone}
                      </a>
                    </td>
                    <td className="py-3 px-4 font-medium">{c.ordersCount} pedidos</td>
                    <td className="py-3 px-4 font-extrabold text-[#722238]">
                      R$ {c.totalSpent.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(c.lastOrderDate).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
