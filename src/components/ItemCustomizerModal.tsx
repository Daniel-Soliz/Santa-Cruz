import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { MenuItem, SelectedOption } from '../types';
import { useCart } from '../context/CartContext';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({ item, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  
  // Selections state: map of groupId -> array of choiceIds
  const [selections, setSelections] = useState<{ [groupId: string]: string[] }>(() => {
    if (!item?.optionGroups) return {};
    const initial: { [groupId: string]: string[] } = {};
    item.optionGroups.forEach(group => {
      // Find default choice if any
      const defChoice = group.choices.find(c => c.isDefault);
      if (defChoice) {
        initial[group.id] = [defChoice.id];
      } else if (group.minSelections > 0 && group.choices.length > 0 && group.maxSelections === 1) {
        // Automatically select first required option for convenience
        initial[group.id] = [group.choices[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const basePrice = useMemo(() => {
    if (!item) return 0;
    return item.promotionalPrice ?? item.price;
  }, [item]);

  // Compute calculated unit price
  const calculatedUnitPrice = useMemo(() => {
    if (!item) return 0;
    let price = basePrice;

    if (item.optionGroups) {
      item.optionGroups.forEach(group => {
        const selectedChoiceIds = selections[group.id] || [];
        selectedChoiceIds.forEach(choiceId => {
          const choice = group.choices.find(c => c.id === choiceId);
          if (choice) {
            price += choice.priceModifier;
          }
        });
      });
    }

    return price;
  }, [item, basePrice, selections]);

  // Validate group constraints
  const validationErrors = useMemo(() => {
    if (!item?.optionGroups) return [];
    const errors: string[] = [];

    item.optionGroups.forEach(group => {
      const selected = selections[group.id] || [];
      if (selected.length < group.minSelections) {
        errors.push(`Selecione pelo menos ${group.minSelections} opção em "${group.name}".`);
      }
      if (selected.length > group.maxSelections) {
        errors.push(`Selecione no máximo ${group.maxSelections} opções em "${group.name}".`);
      }
    });

    return errors;
  }, [item, selections]);

  if (!item) return null;

  const handleSingleSelect = (groupId: string, choiceId: string) => {
    setSelections(prev => ({
      ...prev,
      [groupId]: [choiceId]
    }));
  };

  const handleMultipleSelect = (groupId: string, choiceId: string, max: number) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (current.includes(choiceId)) {
        return {
          ...prev,
          [groupId]: current.filter(id => id !== choiceId)
        };
      } else {
        if (current.length >= max) {
          return prev; // Reached limit
        }
        return {
          ...prev,
          [groupId]: [...current, choiceId]
        };
      }
    });
  };

  const handleAddToCart = () => {
    if (validationErrors.length > 0) return;

    // Convert selections to SelectedOption objects
    const formattedOptions: SelectedOption[] = [];
    if (item.optionGroups) {
      item.optionGroups.forEach(group => {
        const choiceIds = selections[group.id] || [];
        choiceIds.forEach(id => {
          const choice = group.choices.find(c => c.id === id);
          if (choice) {
            formattedOptions.push({
              groupId: group.id,
              groupName: group.name,
              choiceId: choice.id,
              choiceName: choice.name,
              priceModifier: choice.priceModifier
            });
          }
        });
      });
    }

    addItem(item, quantity, formattedOptions, observation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-amber-200">
        
        {/* Header with image */}
        <div className="relative aspect-video w-full bg-stone-100 shrink-0">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F9D71C] text-[#722238]">
                  {item.badge}
                </span>
              )}
              {item.isExampleDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900/80 text-stone-200">
                  Exemplo Demonstrativo
                </span>
              )}
            </div>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl mt-1 leading-snug">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <p className="text-sm text-stone-600 leading-relaxed">
            {item.description}
          </p>

          {/* Option Groups */}
          {item.optionGroups && item.optionGroups.map((group) => {
            const isSingle = group.maxSelections === 1;
            const currentSelected = selections[group.id] || [];
            const isFulfilled = currentSelected.length >= group.minSelections;

            return (
              <div key={group.id} className="p-4 rounded-2xl bg-[#FFF8EC] border border-amber-200/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-heading font-bold text-stone-900 text-base">
                      {group.name}
                    </h4>
                    {group.description && (
                      <p className="text-xs text-stone-500">{group.description}</p>
                    )}
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    group.minSelections > 0
                      ? isFulfilled 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}>
                    {group.minSelections > 0 
                      ? isSingle ? 'Obrigatório (Escolha 1)' : `Escolha ${group.minSelections} a ${group.maxSelections}`
                      : `Opcional (Até ${group.maxSelections})`}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {group.choices.map((choice) => {
                    const isSelected = currentSelected.includes(choice.id);

                    return (
                      <div
                        key={choice.id}
                        onClick={() => {
                          if (isSingle) {
                            handleSingleSelect(group.id, choice.id);
                          } else {
                            handleMultipleSelect(group.id, choice.id, group.maxSelections);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#E8365D] shadow-xs'
                            : 'bg-white/80 border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'border-[#E8365D] bg-[#E8365D] text-white'
                              : 'border-stone-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <span className="font-semibold text-sm text-stone-800 block">
                              {choice.name}
                            </span>
                            {choice.description && (
                              <span className="text-xs text-stone-500 block">{choice.description}</span>
                            )}
                          </div>
                        </div>

                        {choice.priceModifier > 0 ? (
                          <span className="text-xs font-bold text-[#E8365D]">
                            + R$ {choice.priceModifier.toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-stone-400">Incluso</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special observations field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Observações do Pedido (Opcional)
            </label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Tirar coentro, cebola bem picadinha, manteiga à parte..."
              className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:border-[#E8365D] focus:ring-1 focus:ring-[#E8365D] outline-hidden bg-stone-50"
              maxLength={200}
            />
            <span className="text-[11px] text-stone-400 text-right block">
              {observation.length}/200 caracteres
            </span>
          </div>

          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              {validationErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with quantity & add CTA */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-stone-800 text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add button */}
          <button
            disabled={validationErrors.length > 0}
            onClick={handleAddToCart}
            className={`w-full sm:w-auto flex-1 py-3 px-6 rounded-xl font-heading font-extrabold text-sm sm:text-base flex items-center justify-between shadow-md transition-all ${
              validationErrors.length === 0
                ? 'bg-[#F9D71C] text-[#722238] hover:bg-[#E8C60B] active:scale-98 border border-amber-400 cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border-stone-300'
            }`}
          >
            <span>Adicionar à Sacola</span>
            <span>R$ {(calculatedUnitPrice * quantity).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
