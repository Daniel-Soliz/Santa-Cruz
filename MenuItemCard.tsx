import React from 'react';
import { Plus, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  const isAvailable = item.status === 'disponivel';
  const isSoldOutToday = item.status === 'esgotado_hoje';

  return (
    <div 
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
        isAvailable 
          ? 'border-stone-200/80 hover:border-[#E8365D]/60 hover:shadow-lg cursor-pointer' 
          : 'border-stone-200 opacity-75 bg-stone-50 cursor-not-allowed'
      }`}
      onClick={() => isAvailable && onSelect(item)}
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isAvailable ? 'group-hover:scale-105' : 'grayscale'
            }`}
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
            {item.badge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#F9D71C] text-[#722238] shadow-sm border border-amber-400">
                <Sparkles className="w-3 h-3" />
                {item.badge}
              </span>
            )}
            {item.isExampleDemo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900/85 text-stone-200 tracking-wide">
                Exemplo Demonstrativo
              </span>
            )}
          </div>

          {/* Sold out overlay */}
          {isSoldOutToday && (
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center p-4">
              <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <AlertCircle className="w-4 h-4" />
                Esgotado por hoje
              </span>
            </div>
          )}
          {!isAvailable && !isSoldOutToday && (
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center p-4">
              <span className="px-3 py-1.5 rounded-xl bg-stone-700 text-white text-xs font-bold">
                Indisponível
              </span>
            </div>
          )}

          {/* Estimated minutes */}
          {item.estimatedMinutes && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-stone-900/75 text-white text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>~{item.estimatedMinutes} min</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-heading font-bold text-base sm:text-lg text-stone-900 leading-snug group-hover:text-[#E8365D] transition-colors line-clamp-1">
              {item.name}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-[#722238] text-[10px] font-semibold border border-amber-200/60">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Price and Add Action */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
        <div>
          {item.promotionalPrice ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-[#E8365D]">
                R$ {item.promotionalPrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-stone-400 line-through">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ) : (
            <span className="font-heading font-extrabold text-lg sm:text-xl text-stone-900">
              R$ {item.price.toFixed(2).replace('.', ',')}
            </span>
          )}

          {item.optionGroups && item.optionGroups.length > 0 && (
            <span className="block text-[11px] text-stone-500">
              Personalizável ({item.optionGroups.length} opções)
            </span>
          )}
        </div>

        <button
          disabled={!isAvailable}
          onClick={(e) => {
            e.stopPropagation();
            if (isAvailable) onSelect(item);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
            isAvailable
              ? 'bg-[#F9D71C] text-[#722238] hover:bg-[#E8C60B] border border-amber-400 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{item.optionGroups && item.optionGroups.length > 0 ? 'Opções' : 'Adicionar'}</span>
        </button>
      </div>
    </div>
  );
};
