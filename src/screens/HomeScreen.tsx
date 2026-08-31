import React from 'react';
import {
  Bell,
  PhoneCall,
  HeartPulse,
  Droplets,
  Mic,
  BarChart3,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Stethoscope,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../constants/theme';
import { Appointment, DarkModeTheme, HealthRecord, Screen, UserProfile } from '../types';
import { HealthRing } from '../components/HealthRing';

interface HomeScreenProps {
  user: UserProfile;
  pressSys: number;
  pressDia: number;
  heartRate: number;
  glucose: number;
  appointments: Appointment[];
  records: HealthRecord[];
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
  unreadAlertsCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  pressSys,
  pressDia,
  heartRate,
  glucose,
  appointments,
  records,
  onNavigate,
  dm,
  unreadAlertsCount,
}) => {
  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Status colors calculation
  const getSystolicStatusColor = (val: number) => {
    if (val >= 140) return COLORS.danger;
    if (val >= 130) return COLORS.warn;
    return COLORS.success;
  };

  const getGlucoseStatusColor = (val: number) => {
    if (val > 126) return COLORS.danger;
    if (val < 70) return COLORS.primary;
    return COLORS.accent;
  };

  const systolicColor = getSystolicStatusColor(pressSys);
  const glucoseColor = getGlucoseStatusColor(glucose);

  // Next active appointment
  const nextAppt = appointments
    .filter((a) => a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const getApptDaysText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Hoje', bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626' };
    if (diffDays === 1) return { label: 'Amanhã', bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' };
    if (diffDays > 1)
      return {
        label: `Em ${diffDays}d`,
        bg: 'rgba(94, 143, 192, 0.15)',
        text: COLORS.primary,
      };
    return { label: 'Agendado', bg: 'rgba(47, 191, 113, 0.15)', text: '#16a34a' };
  };

  // Mini 7-day chart data formatted from records
  const chartData = [...records]
    .slice(0, 7)
    .reverse()
    .map((r, i) => ({
      name: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.'),
      systolic: r.systolic,
      diastolic: r.diastolic,
    }));

  return (
    <div className="flex-1 flex flex-col select-none pb-4 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      {/* Header Gradient */}
      <div
        className="px-5 pt-3 pb-8 text-white relative transition-all"
        style={{
          background: 'linear-gradient(160deg, #3D6E9F 0%, #5E8FC0 60%, #7CC9BE 100%)',
        }}
      >
        {/* Top bar with greeting & action buttons */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider block opacity-90">
              {getGreeting()},
            </span>
            <h1 className="text-xl font-black tracking-tight text-white truncate max-w-[200px]">
              {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Alerts Bell with pulsating dot */}
            <button
              id="btn-home-alerts"
              type="button"
              onClick={() => onNavigate('alerts')}
              className="btn-press relative w-10 h-10 rounded-full flex items-center justify-center border transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label="Alertas"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Emergency Phone Button (red semi-transparent) */}
            <button
              id="btn-home-emergency"
              type="button"
              onClick={() => onNavigate('emergency')}
              className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-full border border-red-300/40 text-white font-bold text-xs shadow-lg transition-all animate-pulse-ring-fast"
              style={{
                backgroundColor: 'rgba(228, 84, 84, 0.85)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label="Emergência SAMU"
            >
              <PhoneCall className="w-4 h-4 fill-white" />
              <span>SOS 192</span>
            </button>
          </div>
        </div>

        {/* Vitals Strip in Glassmorphism */}
        <div
          className="rounded-2xl p-3.5 flex items-center justify-between text-white shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
          }}
        >
          <div className="flex-1 text-center border-r border-white/20 px-1">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block">
              Pressão Atual
            </span>
            <span className="text-base font-black tracking-tight">
              {pressSys}/{pressDia}
            </span>
            <span className="text-[9px] text-white/80 block">mmHg</span>
          </div>

          <div className="flex-1 text-center border-r border-white/20 px-1">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block">
              Glicemia
            </span>
            <span className="text-base font-black tracking-tight">{glucose}</span>
            <span className="text-[9px] text-white/80 block">mg/dL</span>
          </div>

          <div className="flex-1 text-center px-1">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block">
              Remédios Hoje
            </span>
            <span className="text-base font-black tracking-tight text-emerald-200">
              3 de 3
            </span>
            <span className="text-[9px] text-white/80 block">100% em dia</span>
          </div>
        </div>
      </div>

      {/* Main Body Content with Overlap */}
      <div className="px-4 -mt-5 space-y-4 z-10">
        {/* 3 Health Rings Card */}
        <div
          className="rounded-2xl p-4 shadow-sm border transition-all"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
            boxShadow: '0 2px 12px rgba(94,143,192,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
              Medições em Tempo Real
            </h2>
            <button
              id="btn-goto-history-top"
              type="button"
              onClick={() => onNavigate('history')}
              className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 flex items-center hover:underline"
            >
              Histórico <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-around py-1">
            {/* Systolic Ring */}
            <div
              className="flex flex-col items-center cursor-pointer btn-press"
              onClick={() => onNavigate('pressure')}
            >
              <HealthRing
                value={pressSys}
                max={200}
                color={systolicColor}
                size={84}
                stroke={7}
                unit="mmHg"
                label="Sistólica"
              />
              <span className="text-[11px] font-bold mt-1" style={{ color: dm.text }}>
                Pressão
              </span>
            </div>

            {/* Glucose Ring */}
            <div
              className="flex flex-col items-center cursor-pointer btn-press"
              onClick={() => onNavigate('glucose')}
            >
              <HealthRing
                value={glucose}
                max={250}
                color={glucoseColor}
                size={84}
                stroke={7}
                unit="mg/dL"
                label="Glicose"
              />
              <span className="text-[11px] font-bold mt-1" style={{ color: dm.text }}>
                Glicemia
              </span>
            </div>

            {/* Heart Rate Ring */}
            <div
              className="flex flex-col items-center cursor-pointer btn-press"
              onClick={() => onNavigate('pressure')}
            >
              <HealthRing
                value={heartRate}
                max={150}
                color={COLORS.secondary}
                size={84}
                stroke={7}
                unit="bpm"
                label="Pulso"
              />
              <span className="text-[11px] font-bold mt-1" style={{ color: dm.text }}>
                Batimentos
              </span>
            </div>
          </div>
        </div>

        {/* 3x2 Quick Actions Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 px-1" style={{ color: dm.sub }}>
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Pressão */}
            <button
              id="btn-quick-pressure"
              type="button"
              onClick={() => onNavigate('pressure')}
              className="btn-press card-hover flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${COLORS.danger}18` }}
              >
                <HeartPulse className="w-5 h-5" style={{ color: COLORS.danger }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dm.text }}>
                Pressão
              </span>
              <span className="text-[10px] text-slate-400">Aferir agora</span>
            </button>

            {/* 2. Glicemia */}
            <button
              id="btn-quick-glucose"
              type="button"
              onClick={() => onNavigate('glucose')}
              className="btn-press card-hover flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${COLORS.accent}18` }}
              >
                <Droplets className="w-5 h-5" style={{ color: COLORS.accent }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dm.text }}>
                Glicemia
              </span>
              <span className="text-[10px] text-slate-400">Registrar</span>
            </button>

            {/* 3. Por Voz */}
            <button
              id="btn-quick-voice"
              type="button"
              onClick={() => onNavigate('voice')}
              className="btn-press card-hover flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${COLORS.purple}18` }}
              >
                <Mic className="w-5 h-5" style={{ color: COLORS.purple }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dm.text }}>
                Por Voz
              </span>
              <span className="text-[10px] text-slate-400">Falar dados</span>
            </button>

            {/* 4. Dashboard */}
            <button
              id="btn-quick-dashboard"
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="btn-press card-hover flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${COLORS.primary}18` }}
              >
                <BarChart3 className="w-5 h-5" style={{ color: COLORS.primary }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dm.text }}>
                Gráficos
              </span>
              <span className="text-[10px] text-slate-400">Tendências</span>
            </button>

            {/* 5. Família */}
            <button
              id="btn-quick-family"
              type="button"
              onClick={() => onNavigate('family')}
              className="btn-press card-hover flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${COLORS.secondary}25` }}
              >
                <Users className="w-5 h-5" style={{ color: '#0f766e' }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dm.text }}>
                Cuidadores
              </span>
              <span className="text-[10px] text-slate-400">Rede SUS</span>
            </button>

            {/* 6. Consultas */}
            <button
              id="btn-quick-appointments"
              type="button"
              onClick={() => onNavigate('appointments')}
              className="btn-press card-hover flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${COLORS.warn}20` }}
              >
                <Calendar className="w-5 h-5" style={{ color: '#b45309' }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dm.text }}>
                Consultas
              </span>
              <span className="text-[10px] text-slate-400">Agendar</span>
            </button>
          </div>
        </div>

        {/* Next Appointment Card */}
        {nextAppt && (
          <div
            className="rounded-2xl p-4 border shadow-xs transition-all card-hover cursor-pointer"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
            onClick={() => onNavigate('appointments')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.primary}18`, color: COLORS.primary }}
                >
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
                    Próxima Consulta SUS
                  </h3>
                </div>
              </div>
              {(() => {
                const daysBadge = getApptDaysText(nextAppt.date);
                return (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: daysBadge.bg, color: daysBadge.text }}
                  >
                    {daysBadge.label}
                  </span>
                );
              })()}
            </div>

            <div className="mt-2">
              <p className="text-sm font-black" style={{ color: dm.text }}>
                {nextAppt.doctor}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {nextAppt.specialty} • {nextAppt.time}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                📍 {nextAppt.location || 'Teleconsulta Conecte SUS'}
              </p>
            </div>
          </div>
        )}

        {/* 7-Day Mini Systolic Trend AreaChart */}
        <div
          className="rounded-2xl p-4 border shadow-xs transition-all"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
                Evolução da Pressão (7 dias)
              </h3>
              <p className="text-[11px] text-slate-400">Média Sistólica: 127 mmHg</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" /> -4 mmHg
            </span>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="sysGradientHome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke={dm.sub}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[100, 160]}
                  stroke={dm.sub}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
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
                  dataKey="systolic"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sysGradientHome)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
