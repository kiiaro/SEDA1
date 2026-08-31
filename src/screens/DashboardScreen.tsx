import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  HeartPulse,
  Droplets,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Share2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';

interface DashboardScreenProps {
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ records, onBack, dm }) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'glucose' | 'frequency'>('pressure');

  const chartData = [...records]
    .slice(0, 7)
    .reverse()
    .map((r) => ({
      name: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.'),
      systolic: r.systolic,
      diastolic: r.diastolic,
      glucose: r.glucose,
      heartRate: r.heartRate,
    }));

  const weeklySummary = [
    { day: 'Segunda-feira', status: 'ok', text: 'Todas medições na meta' },
    { day: 'Terça-feira', status: 'ok', text: 'Glicemia e pressão excelentes' },
    { day: 'Quarta-feira', status: 'warn', text: 'Pressão 142/92 (pós-almoço)' },
    { day: 'Quinta-feira', status: 'ok', text: 'Caminhada + medicação no horário' },
    { day: 'Sexta-feira', status: 'ok', text: 'Controle contínuo estável' },
    { day: 'Sábado', status: 'warn', text: 'Glicemia 138 mg/dL' },
    { day: 'Domingo (Hoje)', status: 'ok', text: 'Aferição matinal concluída' },
  ];

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Painel Analítico"
        subtitle="Métricas, gráficos e relatório clínico"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 100%)"
        rightElement={
          <button
            id="btn-export-pdf-report"
            type="button"
            onClick={() => alert('Relatório clínico exportado para PDF (Padrão SUS/UBS) pronto para compartilhar!')}
            className="btn-press p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
            aria-label="Compartilhar relatório"
          >
            <Share2 className="w-4 h-4" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* 3 Dashboard Tabs: Pressão / Glicemia / Frequência */}
        <div
          className="p-1 rounded-2xl border flex items-center gap-1 shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <button
            id="btn-dash-tab-pressure"
            type="button"
            onClick={() => setActiveTab('pressure')}
            className="btn-press flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center"
            style={{
              backgroundColor: activeTab === 'pressure' ? COLORS.primary : 'transparent',
              color: activeTab === 'pressure' ? '#FFFFFF' : dm.sub,
              boxShadow: activeTab === 'pressure' ? '0 2px 8px rgba(94,143,192,0.35)' : 'none',
            }}
          >
            Pressão
          </button>

          <button
            id="btn-dash-tab-glucose"
            type="button"
            onClick={() => setActiveTab('glucose')}
            className="btn-press flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center"
            style={{
              backgroundColor: activeTab === 'glucose' ? COLORS.primary : 'transparent',
              color: activeTab === 'glucose' ? '#FFFFFF' : dm.sub,
              boxShadow: activeTab === 'glucose' ? '0 2px 8px rgba(94,143,192,0.35)' : 'none',
            }}
          >
            Glicemia
          </button>

          <button
            id="btn-dash-tab-frequency"
            type="button"
            onClick={() => setActiveTab('frequency')}
            className="btn-press flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center"
            style={{
              backgroundColor: activeTab === 'frequency' ? COLORS.primary : 'transparent',
              color: activeTab === 'frequency' ? '#FFFFFF' : dm.sub,
              boxShadow: activeTab === 'frequency' ? '0 2px 8px rgba(94,143,192,0.35)' : 'none',
            }}
          >
            Frequência
          </button>
        </div>

        {/* KPI Row (3 Cards with Trending Icons) */}
        <div className="grid grid-cols-3 gap-2">
          {/* KPI 1 */}
          <div
            className="p-3 rounded-2xl border text-center"
            style={{
              backgroundColor: 'rgba(94,143,192,0.12)',
              borderColor: 'rgba(94,143,192,0.25)',
            }}
          >
            <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 block">
              Média Sist.
            </span>
            <span className="text-base font-black text-sky-950 dark:text-sky-100 block">
              126 <span className="text-[9px] font-medium text-slate-500">mmHg</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
              <TrendingDown className="w-3 h-3" /> -3%
            </span>
          </div>

          {/* KPI 2 */}
          <div
            className="p-3 rounded-2xl border text-center"
            style={{
              backgroundColor: 'rgba(244,183,64,0.12)',
              borderColor: 'rgba(244,183,64,0.25)',
            }}
          >
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">
              Glicose Média
            </span>
            <span className="text-base font-black text-amber-950 dark:text-amber-100 block">
              112 <span className="text-[9px] font-medium text-slate-500">mg/dL</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
              <TrendingDown className="w-3 h-3" /> -5%
            </span>
          </div>

          {/* KPI 3 */}
          <div
            className="p-3 rounded-2xl border text-center"
            style={{
              backgroundColor: 'rgba(107,127,212,0.12)',
              borderColor: 'rgba(107,127,212,0.25)',
            }}
          >
            <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 block">
              Pulso Médio
            </span>
            <span className="text-base font-black text-indigo-950 dark:text-indigo-100 block">
              73 <span className="text-[9px] font-medium text-slate-500">bpm</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 mt-1">
              <TrendingUp className="w-3 h-3" /> Normal
            </span>
          </div>
        </div>

        {/* Tab 1: Pressão (LineChart dual com legenda) */}
        {activeTab === 'pressure' && (
          <div
            className="rounded-2xl p-4 border shadow-xs"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
                Pressão Sistólica vs Diastólica
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="text-sky-600">● Sistólica</span>
                <span className="text-teal-600">● Diastólica</span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dm.isDark ? '#334155' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke={dm.sub} fontSize={10} tickLine={false} />
                  <YAxis domain={[50, 160]} stroke={dm.sub} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: dm.card,
                      borderColor: dm.border,
                      borderRadius: 12,
                      fontSize: 11,
                      color: dm.text,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={{ r: 3.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke={COLORS.secondary}
                    strokeWidth={3}
                    dot={{ r: 3.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Glicemia (AreaChart com gradiente amarelo) */}
        {activeTab === 'glucose' && (
          <div
            className="rounded-2xl p-4 border shadow-xs"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
                Oscilação Glicêmica Semanal
              </h3>
              <span className="text-xs font-bold text-amber-600">Meta: 70 - 126 mg/dL</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashGlucGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.warn} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.warn} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dm.isDark ? '#334155' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke={dm.sub} fontSize={10} tickLine={false} />
                  <YAxis domain={[60, 180]} stroke={dm.sub} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: dm.card,
                      borderColor: dm.border,
                      borderRadius: 12,
                      fontSize: 11,
                      color: dm.text,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="glucose"
                    stroke={COLORS.warn}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#dashGlucGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Frequência (Barras CSS manuais com altura crescente: (28 + i*6)px) */}
        {activeTab === 'frequency' && (
          <div
            className="rounded-2xl p-4 border shadow-xs"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
                Frequência de Aferições Diárias
              </h3>
              <span className="text-xs font-bold text-indigo-600">Meta: 2 aferições/dia</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-36 px-2 pt-4">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'].map((day, i) => {
                const heightVal = 32 + i * 8;
                const isToday = i === 6;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                    <div
                      className="w-full max-w-[28px] rounded-t-xl transition-all"
                      style={{
                        height: `${heightVal}px`,
                        backgroundColor: isToday ? COLORS.primary : `${COLORS.primary}45`,
                      }}
                    />
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: isToday ? COLORS.primary : dm.sub,
                      }}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resumo Semanal */}
        <div
          className="rounded-2xl p-4 border shadow-xs space-y-2.5"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: dm.sub }}>
            Resumo de Estabilidade Semanal
          </h3>
          {weeklySummary.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 border-b last:border-0 text-xs font-medium"
              style={{ borderColor: dm.border }}
            >
              <div className="flex items-center gap-2">
                {item.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="font-bold" style={{ color: dm.text }}>
                  {item.day}
                </span>
              </div>
              <span className="text-slate-500 text-[11px] truncate max-w-[170px]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
