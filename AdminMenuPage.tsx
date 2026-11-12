import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  Eye, 
  UtensilsCrossed, 
  FolderPlus,
  ArrowUpDown
} from 'lucide-react';
import { MenuItem, Category, OptionGroup } from '../../types';
import { api } from '../../services/api';

export const AdminMenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create Dish Modal
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<MenuItem> | null>(null);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchMenuData = async () => {
    try {
      const [items, cats] = await Promise.all([
        api.adminGetMenu(),
        api.getCategories()
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (e) {
      console.error('Error fetching admin menu', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const handleToggleStatus = async (item: MenuItem, newStatus: string) => {
    try {
      await api.adminSetItemStatus(item.id, newStatus);
      await fetchMenuData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Tem certeza que deseja excluir o prato "${item.name}"?`)) return;
    try {
      await api.adminDeleteMenuItem(item.id);
      await fetchMenuData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  const handleOpenNewDish = () => {
    setEditingDish({
      name: '',
      categoryId: categories[0]?.id || '',
      description: '',
      price: 35.00,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      status: 'disponivel',
      tags: ['Nordestino'],
      estimatedMinutes: 30,
      optionGroups: []
    });
    setIsDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish || !editingDish.name || !editingDish.categoryId || editingDish.price === undefined) {
      alert('Preencha os campos obrigatórios (nome, categoria e preço base).');
      return;
    }

    try {
      if (editingDish.id) {
        await api.adminUpdateMenuItem(editingDish.id, editingDish);
      } else {
        await api.adminCreateMenuItem(editingDish);
      }
      setIsDishModalOpen(false);
      setEditingDish(null);
      await fetchMenuData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar prato');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.adminCreateCategory({ name: newCatName, description: newCatDesc });
      setNewCatName('');
      setNewCatDesc('');
      setIsCatModalOpen(false);
      await fetchMenuData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar categoria');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Cardápio Digital & Categorias
          </h2>
          <p className="text-xs text-stone-500">
            Cadastre novos pratos, altere preços, gerencie adicionais e controle itens esgotados hoje.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#722238]" />
            <span>Nova Categoria</span>
          </button>

          <button
            onClick={handleOpenNewDish}
            className="px-4 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs sm:text-sm hover:bg-[#E8C60B] border border-amber-400 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Prato</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-800 outline-hidden w-full sm:w-auto"
          >
            <option value="all">Todas as Categorias ({menuItems.length})</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar prato por nome..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 outline-hidden focus:border-[#E8365D]"
          />
        </div>
      </div>

      {/* Menu Items Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8EC] text-stone-600 font-bold uppercase tracking-wider border-b border-amber-200/80">
              <tr>
                <th className="py-3.5 px-4">Prato / Foto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Preço Base</th>
                <th className="py-3.5 px-4">Promoção</th>
                <th className="py-3.5 px-4">Disponibilidade</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map(item => {
                const category = categories.find(c => c.id === item.categoryId);
                const isAvailable = item.status === 'disponivel';
                const isSoldOut = item.status === 'esgotado_hoje';

                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Dish & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#F9D71C] text-[#722238]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-stone-500 text-[11px] line-clamp-1 max-w-xs">{item.description}</p>
                          {item.isExampleDemo && (
                            <span className="text-[10px] text-amber-700 font-semibold">[Item de Demonstração]</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-medium text-stone-700">
                      {category?.name || 'Geral'}
                    </td>

                    {/* Base Price */}
                    <td className="py-3 px-4 font-bold text-stone-900">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Promotional Price */}
                    <td className="py-3 px-4 text-stone-600">
                      {item.promotionalPrice ? (
                        <span className="font-extrabold text-[#E8365D]">
                          R$ {item.promotionalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>

                    {/* Quick Stock toggle buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(item, isAvailable ? 'esgotado_hoje' : 'disponivel')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : isSoldOut
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {isAvailable ? 'Disponível' : isSoldOut ? 'Esgotado Hoje' : 'Indisponível'}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingDish(item);
                            setIsDishModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-[#722238] cursor-pointer"
                          title="Editar prato e adicionais"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Excluir prato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit or Create Dish */}
      {isDishModalOpen && editingDish && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 border border-amber-300 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-extrabold text-xl text-[#722238]">
                {editingDish.id ? 'Editar Prato' : 'Adicionar Novo Prato ao Cardápio'}
              </h3>
              <button 
                onClick={() => setIsDishModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Nome do Prato *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDish.name || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                    placeholder="Ex: Baião de Dois com Carne de Sol"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={editingDish.categoryId || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, categoryId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-hidden focus:border-[#E8365D]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Descrição dos Ingredientes *
                </label>
                <textarea
                  rows={2}
                  value={editingDish.description || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  placeholder="Descreva o sabor, acompanhamentos e serve quantas pessoas..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Preço Base (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingDish.price ?? ''}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) })}
                    placeholder="49,90"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Preço Promocional (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingDish.promotionalPrice ?? ''}
                    onChange={(e) => setEditingDish({ 
                      ...editingDish, 
                      promotionalPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="Deixe em branco se sem promo"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Tempo Est. (min)
                  </label>
                  <input
                    type="number"
                    value={editingDish.estimatedMinutes || 30}
                    onChange={(e) => setEditingDish({ ...editingDish, estimatedMinutes: parseInt(e.target.value, 10) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  URL da Foto do Prato *
                </label>
                <input
                  type="url"
                  required
                  value={editingDish.imageUrl || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                />
                {editingDish.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <img src={editingDish.imageUrl} alt="Prévia" className="w-14 h-14 rounded-lg object-cover" />
                    <span className="text-[11px] text-stone-500 font-semibold">Prévia da imagem cadastrada</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Selo de Destaque
                  </label>
                  <select
                    value={editingDish.badge || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, badge: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-hidden"
                  >
                    <option value="">Sem selo</option>
                    <option value="Prato do Dia">Prato do Dia</option>
                    <option value="Mais Pedido">Mais Pedido</option>
                    <option value="Tradicional">Tradicional</option>
                    <option value="Especial da Casa">Especial da Casa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Disponibilidade Inicial
                  </label>
                  <select
                    value={editingDish.status || 'disponivel'}
                    onChange={(e) => setEditingDish({ ...editingDish, status: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-hidden"
                  >
                    <option value="disponivel">Disponível no Site</option>
                    <option value="esgotado_hoje">Esgotado por Hoje</option>
                    <option value="indisponivel">Indisponível</option>
                    <option value="oculto">Oculto do Público</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs hover:bg-[#E8C60B] border border-amber-400 cursor-pointer shadow-xs"
                >
                  Salvar Prato no Cardápio
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: New Category */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-amber-300 space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-xl text-[#722238]">
              Cadastrar Nova Categoria
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Caldos Sertanejos, Doces Regionais..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Descrição Opcional
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Ex: Servidos bem quentinhos com torradas"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 text-xs font-bold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F9D71C] text-[#722238] text-xs font-bold hover:bg-[#E8C60B] border border-amber-400"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
