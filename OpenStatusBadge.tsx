import React from 'react';
import { StoreSettings } from '../types';

interface OpenStatusBadgeProps {
  settings: StoreSettings | null;
  compact?: boolean;
}

export const OpenStatusBadge: React.FC<OpenStatusBadgeProps> = ({ settings, compact = false }) => {
  if (!settings) return null;

  // 1. Manual order pause check
  if (settings.isOrdersPaused) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${compact ? 'text-[11px]' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Pedidos Pausados {settings.pauseReason ? `(${settings.pauseReason})` : ''}
      </span>
    );
  }

  // 2. Global manual toggle
  if (!settings.isOpenManual) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${compact ? 'text-[11px]' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Fechado no Momento
      </span>
    );
  }

  // 3. Weekly schedule calculation (America/Sao_Paulo)
  const now = new Date();
  // Get Brazilian time offset
  const brTimeStr = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false, hour: '2-digit', minute: '2-digit' });
  const brDay = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getDay();

  const todayHours = settings.hours?.find(h => h.dayOfWeek === brDay);

  let isOpenBySchedule = false;
  let nextOpenText = '';

  if (todayHours && todayHours.isOpen) {
    if (brTimeStr >= todayHours.openTime && brTimeStr <= todayHours.closeTime) {
      isOpenBySchedule = true;
    } else if (brTimeStr < todayHours.openTime) {
      nextOpenText = `Abre hoje às ${todayHours.openTime}`;
    } else {
      nextOpenText = 'Fechado pelo horário';
    }
  } else {
    nextOpenText = 'Fechado hoje';
  }

  if (isOpenBySchedule) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs ${compact ? 'text-[11px]' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
        <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-3.5 inline-block" />
        Aberto Agora
        {!compact && todayHours && (
          <span className="text-emerald-700 font-normal hidden sm:inline">
            (até {todayHours.closeTime})
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300 ${compact ? 'text-[11px]' : ''}`}>
      <span className="w-2 h-2 rounded-full bg-stone-400" />
      Fechado {nextOpenText ? `• ${nextOpenText}` : ''}
    </span>
  );
};
