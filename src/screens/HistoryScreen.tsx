import React, { useState } from 'react';
import { Calendar, Filter, HeartPulse, Droplets, Activity, Plus } from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord, Screen } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface HistoryScreenProps {
  records: HealthRecord[];
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ records, onNavigate, dm }) => {
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '15d' | '30d' | '3m'>('7d');

  const filterOptions: { id: '7d' | '15d' | '30d' | '3m'; label: string }[] = [
    { id: '7d', label: '7 dias' },
    { id: '15d', label: '15 dias' },
    { id: '30d', label: '30 dias' },
    { id: '3m', label: '3 meses' },
  ];

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      {/* Top Header */}
      <div
        className="px-5 pt-3 pb-5 text-white"
        style={{
          background: 'linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Histórico de Saúde</h1>
            <p className="text-xs text-blue-100 font-medium">Registros diários e aferições</p>
          </div>
          <button
            id="btn-history-add-new"
            type="button"
            onClick={() => onNavigate('pressure')}
            className="btn-press flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {filterOptions.map((opt) => {
            const isSelected = filterPeriod === opt.id;
            return (
              <button
                id={`btn-filter-${opt.id}`}
                key={opt.id}
                type="button"
                onClick={() => setFilterPeriod(opt.id)}
                className="btn-press px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.18)',
                  color: isSelected ? '#1E3A5F' : '#FFFFFF',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List of Staggered Cards */}
      <div className="p-4 space-y-3">
        {records.map((rec, index) => (
          <div
            key={rec.id}
            className="rounded-2xl p-4 border shadow-xs transition-all animate-float-up"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
              animationDelay: `${index * 0.06}s`,
            }}
          >
            {/* Top row with Date/Time and StatusBadge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: dm.text }}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{rec.date}</span>
                <span className="text-slate-400 font-normal">• {rec.time}</span>
              </div>
              <StatusBadge status={rec.status} />
            </div>

            {/* 3 Color-Coded Mini Cards (Pressão: azul, Glicemia: amarelo, BPM: verde) */}
            <div className="grid grid-cols-3 gap-2">
              {/* Pressão (Azul) */}
              <div
                className="p-2.5 rounded-xl text-center flex flex-col items-center justify-center border"
                style={{
                  backgroundColor: 'rgba(94, 143, 192, 0.12)',
                  borderColor: 'rgba(94, 143, 192, 0.25)',
                }}
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-sky-800 dark:text-sky-300 mb-0.5">
                  <HeartPulse className="w-3 h-3" />
                  <span>Pressão</span>
                </div>
                <span className="text-sm font-black text-sky-950 dark:text-sky-100">
                  {rec.systolic}/{rec.diastolic}
                </span>
                <span className="text-[9px] text-slate-500">mmHg</span>
              </div>

              {/* Glicemia (Amarelo) */}
              <div
                className="p-2.5 rounded-xl text-center flex flex-col items-center justify-center border"
                style={{
                  backgroundColor: 'rgba(244, 183, 64, 0.14)',
                  borderColor: 'rgba(244, 183, 64, 0.3)',
                }}
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                  <Droplets className="w-3 h-3" />
                  <span>Glicose</span>
                </div>
                <span className="text-sm font-black text-amber-950 dark:text-amber-100">
                  {rec.glucose}
                </span>
                <span className="text-[9px] text-slate-500">mg/dL</span>
              </div>

              {/* BPM (Verde) */}
              <div
                className="p-2.5 rounded-xl text-center flex flex-col items-center justify-center border"
                style={{
                  backgroundColor: 'rgba(89, 185, 138, 0.14)',
                  borderColor: 'rgba(89, 185, 138, 0.3)',
                }}
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                  <Activity className="w-3 h-3" />
                  <span>Pulso</span>
                </div>
                <span className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                  {rec.heartRate}
                </span>
                <span className="text-[9px] text-slate-500">bpm</span>
              </div>
            </div>

            {/* Notes if any */}
            {rec.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 italic pl-2 border-l-2 border-slate-300 dark:border-slate-700">
                "{rec.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
