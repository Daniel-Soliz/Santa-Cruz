import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Tag, 
  Store, 
  CreditCard, 
  Users, 
  Star, 
  BarChart3, 
  ShieldCheck, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink, 
  PauseCircle, 
  PlayCircle,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  currentTab, 
  onSelectTab, 
  onNavigateHome, 
  children 
}) => {
  const { user, logout } = useAuth();
  const { storeSettings, refreshSettings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound chime synthesizer via Web Audio API (no external mp3 dependency required!)
  const playNewOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio chime blocked or unsupported', e);
    }
  };

  // Poll for active orders count
  useEffect(() => {
    let prevCount = -1;
    const checkOrders = async () => {
      try {
        const orders = await api.adminGetOrders();
        const active = orders.filter(o => o.status === 'Recebido' || o.status === 'Em preparo');
        if (prevCount !== -1 && active.length > prevCount) {
          playNewOrderChime();
        }
        prevCount = active.length;
        setActiveOrdersCount(active.length);
      } catch (e) {
        // user may not have permission or offline
      }
    };

    checkOrders();
    const interval = setInterval(checkOrders, 8000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handlePauseToggle = async () => {
    if (!storeSettings) return;
    const newPaused = !storeSettings.isOrdersPaused;
    const reason = newPaused ? 'Pausa temporária solicitada pelo operador no painel' : '';
    await api.adminPauseOrders(newPaused, reason);
    await refreshSettings();
  };

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['Dono', 'Gerente', 'Atendente'] },
    { 
      id: 'pedidos', 
      label: 'Pedidos em Tempo Real', 
      icon: ShoppingBag, 
      roles: ['Dono', 'Gerente', 'Atendente'], 
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined 
    },
    { id: 'cardapio', label: 'Cardápio & Pratos', icon: UtensilsCrossed, roles: ['Dono', 'Gerente'] },
    { id: 'promocoes', label: 'Promoções & Cupons', icon: Tag, roles: ['Dono', 'Gerente'] },
    { id: 'loja', label: 'Dados da Loja & Horários', icon: Store, roles: ['Dono'] },
    { id: 'pagamentos', label: 'Meios de Pagamento', icon: CreditCard, roles: ['Dono'] },
    { id: 'clientes', label: 'Clientes Cadastrados', icon: Users, roles: ['Dono', 'Gerente'] },
    { id: 'avaliacoes', label: 'Moderação de Avaliações', icon: Star, roles: ['Dono', 'Gerente'] },
    { id: 'relatorios', label: 'Relatórios & Vendas', icon: BarChart3, roles: ['Dono', 'Gerente'] },
    { id: 'usuarios', label: 'Usuários & Permissões', icon: ShieldCheck, roles: ['Dono'] },
    { id: 'configuracoes', label: 'Checklist de Ativação', icon: CheckSquare, roles: ['Dono', 'Gerente'] },
  ];

  const allowedNavItems = navItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-[#FFF8EC] flex flex-col">
      
      {/* Admin Topbar */}
      <header className="sticky top-0 z-40 bg-[#722238] text-white border-b border-amber-300/40 shadow-sm px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-amber-200 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C] shadow-sm shrink-0">
                <img 
                  src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                  alt="Casa do Norte Santa Cruz" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-sm sm:text-base leading-tight">
                  Painel de Gestão
                </h1>
                <p className="text-[11px] text-amber-200/80 hidden sm:block">
                  Casa do Norte Delícia do Nordeste • Unidade Santa Cruz
                </p>
              </div>
            </div>
          </div>

          {/* Quick status controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Quick Pause Orders Button */}
            {user?.role !== 'Atendente' && (
              <button
                onClick={handlePauseToggle}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  storeSettings?.isOrdersPaused
                    ? 'bg-amber-400 text-[#722238] shadow-xs'
                    : 'bg-white/10 text-stone-200 hover:bg-white/20'
                }`}
                title={storeSettings?.isOrdersPaused ? 'Clique para despausar pedidos' : 'Clique para pausar novos pedidos temporariamente'}
              >
                {storeSettings?.isOrdersPaused ? (
                  <>
                    <PlayCircle className="w-4 h-4 text-[#722238]" />
                    <span className="hidden sm:inline">Despausar Pedidos</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4 text-amber-300" />
                    <span className="hidden sm:inline">Pausar Pedidos</span>
                  </>
                )}
              </button>
            )}

            {/* Sound notification toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 cursor-pointer"
              title={soundEnabled ? 'Alerta sonoro de novo pedido ativado' : 'Alerta sonoro desativado'}
            >
              {soundEnabled ? <Bell className="w-4 h-4 text-[#F9D71C]" /> : <BellOff className="w-4 h-4 text-stone-400" />}
            </button>

            {/* User profile & Logout */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold block leading-tight text-white">
                  {user?.name || 'Administrador'}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#F9D71C]">
                  {user?.role || 'Dono'}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-900/60 text-stone-200 hover:text-white transition-colors cursor-pointer"
                title="Sair do painel"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-4">
          <div className="p-3 bg-white rounded-3xl border border-amber-200 shadow-sm space-y-1">
            {allowedNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E8365D] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-[#722238]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-[#E8365D]' : 'bg-[#E8365D] text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick link back to customer site */}
          <button
            onClick={onNavigateHome}
            className="w-full p-3 bg-white/80 rounded-2xl border border-stone-200 text-stone-600 hover:text-[#E8365D] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Site do Cliente</span>
          </button>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C]">
                      <img 
                        src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                        alt="Logo" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="font-heading font-extrabold text-sm text-[#722238]">Painel Santa Cruz</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-stone-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {allowedNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-[#E8365D] text-white shadow-xs'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F9D71C] text-[#722238]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2">
                <button
                  onClick={onNavigateHome}
                  className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Site Público</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair do Painel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
};
