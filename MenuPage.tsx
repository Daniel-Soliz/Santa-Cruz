import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Utensils, QrCode } from 'lucide-react';
import { MenuItemCard } from '../components/MenuItemCard';
import { ItemCustomizerModal } from '../components/ItemCustomizerModal';
import { MenuQrModal } from '../components/MenuQrModal';
import { MenuItem, Category } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

interface MenuPageProps {
  onNavigate: (route: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigate }) => {
  const { itemsCount, setIsCartOpen } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getMenu(), api.getCategories()])
      .then(([items, cats]) => {
        setMenuItems(items);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D] bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              Cardápio Completo
            </span>
            <span className="text-xs font-bold text-stone-500">
              Casa do Norte • Santa Cruz
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#722238]">
            Sabores Autênticos do Nordeste
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Todos os pratos são preparados com carinho e tradição sertaneja. Personalize acompanhamentos e porções na hora de pedir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:border-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#722238]" />
            <span>QR Code de Mesa</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative max-w-lg">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por prato (ex: baião, carne de sol, cuscuz, caju)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200 focus:border-[#E8365D] focus:ring-2 focus:ring-[#E8365D]/20 outline-hidden text-sm shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#E8365D] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            Todos ({menuItems.length})
          </button>

          {categories.map(cat => {
            const count = menuItems.filter(i => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#E8365D] text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Catalog Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-[#E8365D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 font-bold">Carregando cardápio da Casa do Norte...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <Utensils className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-heading font-bold text-stone-700 text-lg">
            Nenhum prato encontrado
          </h3>
          <p className="text-xs text-stone-500">
            Tente buscar com outro termo ou selecione outra categoria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-700"
          >
            Ver todos os pratos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(dish => (
            <MenuItemCard 
              key={dish.id} 
              item={dish} 
              onSelect={setSelectedDish} 
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Cart Bar (Mobile friendly) */}
      {itemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-sm shadow-xl border border-amber-400 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E8365D] text-white text-xs flex items-center justify-center font-bold">
                {itemsCount}
              </span>
              <span>Ver Sacola do Pedido</span>
            </span>
            <span>Avançar &gt;</span>
          </button>
        </div>
      )}

      {/* Dish Customizer Modal */}
      {selectedDish && (
        <ItemCustomizerModal 
          item={selectedDish} 
          onClose={() => setSelectedDish(null)} 
        />
      )}

      {/* QR Code Modal */}
      <MenuQrModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
      />

    </div>
  );
};
