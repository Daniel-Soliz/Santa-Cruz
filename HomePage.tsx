import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { MenuItemCard } from '../components/MenuItemCard';
import { ItemCustomizerModal } from '../components/ItemCustomizerModal';
import { MenuQrModal } from '../components/MenuQrModal';
import { MenuItem, Category, Review } from '../types';
import { api } from '../services/api';
import { 
  UtensilsCrossed, 
  Sparkles, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  QrCode, 
  MessageSquare, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { storeSettings } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // New review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    api.getMenu().then(setMenuItems).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
    api.getReviews().then(setReviews).catch(console.error);
  }, []);

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.categoryId === selectedCategory);

  const dailySpecials = menuItems.filter(i => i.badge === 'Prato do Dia' || i.categoryId === 'cat-pratos-do-dia').slice(0, 3);
  const highlights = menuItems.slice(0, 6);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      await api.submitReview({
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess('Obrigado! Sua avaliação foi enviada e será publicada após moderação da equipe.');
      setReviewName('');
      setReviewComment('');
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* 2. Pratos do Dia / Daily Specials Highlight */}
      {dailySpecials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#722238] via-[#852741] to-[#722238] text-white shadow-xl border border-amber-300/40 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#F9D71C] text-[#722238] uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sugestão Especial do Dia
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                    Pratos do Dia com Tempero do Sertão
                  </h2>
                  <p className="text-amber-100/80 text-sm mt-1">
                    Receitas tradicionais nordestinas com porções generosas preparadas hoje
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('/cardapio')}
                  className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-[#722238] font-heading font-bold text-xs sm:text-sm hover:bg-amber-100 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <span>Ver todas as opções</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of daily specials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {dailySpecials.map(dish => (
                  <div key={dish.id} className="text-stone-900">
                    <MenuItemCard item={dish} onSelect={setSelectedDish} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Quick Table QR Code & Digital Menu Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8EC] border border-amber-300 flex items-center justify-center text-[#722238] shrink-0">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-stone-900 text-lg">
                Está em uma mesa na Casa do Norte Santa Cruz?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Gere ou imprima a placa com o QR Code para fazer pedidos rápidos direto do celular.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs sm:text-sm hover:bg-stone-900 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              Ver QR Code de Mesa
            </button>
          </div>
        </div>
      </section>

      {/* 4. Featured Menu Catalog Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D]">
            Culinária Típica Nordestina
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#722238]">
            Cardápio Selecionado da Casa
          </h2>
          <p className="text-sm text-stone-600">
            Escolha os pratos típicos mais pedidos, adicione acompanhamentos à vontade e receba em casa quentinho.
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#E8365D] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Todos os Pratos ({menuItems.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#E8365D] text-white shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.slice(0, 9).map(dish => (
            <MenuItemCard 
              key={dish.id} 
              item={dish} 
              onSelect={setSelectedDish} 
            />
          ))}
        </div>

        {/* See full menu button */}
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('/cardapio')}
            className="px-8 py-3.5 rounded-2xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-base hover:bg-[#E8C60B] active:scale-95 shadow-md border border-amber-400 cursor-pointer inline-flex items-center gap-2"
          >
            <UtensilsCrossed className="w-5 h-5" />
            Ver todo o cardápio com preços e opções
          </button>
        </div>
      </section>

      {/* 5. About Heritage Section */}
      <section className="bg-white py-14 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] to-[#722238] shadow-2xl overflow-hidden flex items-center justify-center">
                <img 
                  src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
                  alt="Casa do Norte Santa Cruz"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D]">
                Nossa Casa • Parque Belém, São Paulo
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#722238]">
                A autêntica culinária nordestina em São Paulo
              </h2>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                O <strong>Restaurante Delícia do Nordeste Santa Cruz</strong> está localizado no <strong>Parque Belém, em São Paulo – SP</strong>. Preparamos o melhor da culinária nordestina com muito carinho, fartura e autenticidade.
              </p>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                Atendemos você com <strong>refeições no local</strong> em nosso aconchegante salão, <strong>retirada de pedidos no balcão</strong> e <strong>entrega delivery sem contato</strong> direto na sua porta com embalagens térmicas que preservam todo o frescor e calor dos pratos.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-3">
                <div className="p-3.5 rounded-2xl bg-[#FFF8EC] border border-amber-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="font-bold text-xs sm:text-sm text-stone-900 block">Refeições no Local</span>
                  <span className="text-[11px] text-stone-500">Terça a Domingo das 08h às 22h</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FFF8EC] border border-amber-200">
                  <HeartHandshake className="w-5 h-5 text-[#E8365D] mb-1" />
                  <span className="font-bold text-xs sm:text-sm text-stone-900 block">Retirada & Delivery</span>
                  <span className="text-[11px] text-stone-500">Entrega rápida sem contato</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FFF8EC] border border-amber-200 col-span-2 sm:col-span-1">
                  <ShieldCheck className="w-5 h-5 text-[#1F5FA8] mb-1" />
                  <span className="font-bold text-xs sm:text-sm text-stone-900 block">4,1 ★ no Google</span>
                  <span className="text-[11px] text-stone-500">16 avaliações de clientes</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8365D]">
                Opinião dos Clientes
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <Star className="w-3 h-3 fill-[#F9D71C] text-[#F9D71C]" />
                4,1 de 5 estrelas no Google (16 avaliações)
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#722238] mt-1">
              O que diz quem já experimentou
            </h2>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-[#722238] font-bold text-xs sm:text-sm hover:border-[#E8365D] flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-[#E8365D]" />
            Deixar uma Avaliação
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-500 italic col-span-full">Nenhuma avaliação publicada ainda.</p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-stone-900 text-sm">
                      {rev.customerName}
                    </span>
                    <div className="flex items-center gap-0.5 text-[#F9D71C]">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-[#F9D71C]' : 'text-stone-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {rev.reply && (
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-[#722238] bg-[#FFF8EC] p-2.5 rounded-xl">
                    <span className="font-bold block">Resposta do Restaurante:</span>
                    <p className="text-stone-600 italic mt-0.5">{rev.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-amber-300">
            <h3 className="font-heading font-extrabold text-xl text-[#722238] mb-1">
              Avaliar Restaurante Delícia do Nordeste
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Conte para outros clientes sua experiência com nossos pratos e atendimento.
            </p>

            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Ex: Seu Nome"
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nota (1 a 5 estrelas)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-[#F9D71C] text-[#F9D71C]' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Comentário *</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="O que achou da comida, do tempo de entrega e do sabor?"
                    className="w-full text-sm p-2.5 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] text-xs font-extrabold hover:bg-[#E8C60B] border border-amber-400 cursor-pointer"
                  >
                    {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </div>
              </form>
            )}
          </div>
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
