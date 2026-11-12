import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, EyeOff, MessageSquare, Reply, AlertCircle } from 'lucide-react';
import { Review } from '../../types';
import { api } from '../../services/api';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [isReplying, setIsReplying] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const data = await api.adminGetReviews();
      setReviews(data);
    } catch (e) {
      console.error('Error fetching admin reviews', e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'aprovada' | 'oculta' | 'pendente') => {
    try {
      await api.adminUpdateReview(id, { status });
      await fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status da avaliação');
    }
  };

  const handleSaveReply = async (id: string) => {
    const text = replyText[id];
    if (!text || !text.trim()) return;

    try {
      await api.adminUpdateReview(id, { reply: text.trim() });
      setIsReplying(null);
      await fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Erro ao responder');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm">
        <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
          Moderação de Avaliações
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Aprove depoimentos antes de exibi-los na página inicial ou responda comentários dos clientes.
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-8 text-center bg-white rounded-3xl border border-stone-200 p-6">
            Nenhuma avaliação recebida ainda.
          </p>
        ) : (
          reviews.map(rev => (
            <div 
              key={rev.id} 
              className={`p-6 rounded-3xl bg-white border transition-all space-y-4 ${
                rev.status === 'pendente' 
                  ? 'border-amber-300 ring-2 ring-amber-100' 
                  : rev.status === 'aprovada'
                    ? 'border-stone-200'
                    : 'border-stone-200 opacity-60 bg-stone-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-heading font-bold text-stone-900 text-sm">
                    {rev.customerName}
                  </span>
                  <div className="flex items-center text-[#F9D71C]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#F9D71C]' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-600">({rev.rating}/5)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    rev.status === 'aprovada'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rev.status === 'pendente'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-stone-200 text-stone-600'
                  }`}>
                    {rev.status === 'aprovada' ? 'Publicada' : rev.status === 'pendente' ? 'Pendente de Moderação' : 'Oculta'}
                  </span>

                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-100">
                "{rev.comment}"
              </p>

              {rev.reply && (
                <div className="text-xs p-3 rounded-xl bg-[#FFF8EC] border border-amber-200 space-y-0.5">
                  <span className="font-bold text-[#722238] block">Resposta do Restaurante:</span>
                  <p className="text-stone-700">{rev.reply}</p>
                </div>
              )}

              {/* Reply Form */}
              {isReplying === rev.id ? (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="block text-[11px] font-bold text-stone-600">
                    Escreva a resposta da Casa do Norte:
                  </label>
                  <textarea
                    rows={2}
                    value={replyText[rev.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                    placeholder="Ex: Muito obrigado pela preferência, volte sempre!"
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 outline-hidden focus:border-[#E8365D]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsReplying(null)}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveReply(rev.id)}
                      className="px-4 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-bold hover:bg-stone-900 cursor-pointer"
                    >
                      Salvar Resposta
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Actions row */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => setIsReplying(isReplying === rev.id ? null : rev.id)}
                  className="text-stone-600 hover:text-[#722238] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>{rev.reply ? 'Editar Resposta' : 'Responder Cliente'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {rev.status !== 'aprovada' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'aprovada')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar no Site</span>
                    </button>
                  )}

                  {rev.status !== 'oculta' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'oculta')}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
