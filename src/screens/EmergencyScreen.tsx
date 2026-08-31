import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  MapPin,
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, FamilyMember } from '../types';
import { BackHeader } from '../components/BackHeader';

interface EmergencyScreenProps {
  family: FamilyMember[];
  onBack: () => void;
  dm: DarkModeTheme;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ family, onBack, dm }) => {
  const [state, setState] = useState<'idle' | 'confirm' | 'activated'>('idle');
  const [count, setCount] = useState(5);

  // Countdown timer for 'confirm' state
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (state === 'confirm') {
      if (count > 0) {
        timer = setTimeout(() => {
          setCount((c) => c - 1);
        }, 1000);
      } else {
        setState('activated');
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, count]);

  const handleStartEmergency = () => {
    setCount(5);
    setState('confirm');
  };

  const handleCancelCountdown = () => {
    setState('idle');
    setCount(5);
  };

  return (
    <div
      className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300"
      style={{
        backgroundColor: state === 'activated' ? '#FEE8E8' : dm.bg,
      }}
    >
      <BackHeader
        title="Socorro & Emergência SAMU"
        subtitle="Linha direta com SAMU 192 e Cuidadores"
        onBack={onBack}
        bgGradient={
          state === 'activated'
            ? 'linear-gradient(160deg, #991B1B 0%, #E45454 100%)'
            : 'linear-gradient(160deg, #B91C1C 0%, #E45454 100%)'
        }
      />

      {/* STATE 1: IDLE */}
      {state === 'idle' && (
        <div className="flex-1 p-5 flex flex-col justify-between items-center text-center animate-fade-in">
          <div>
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/15 text-red-600 border border-red-500/30">
              Canal de Emergência Imediata
            </span>
            <h2 className="text-xl font-black mt-2 tracking-tight" style={{ color: dm.text }}>
              Pressione para Acionar Socorro
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
              Se você estiver sentindo dor no peito, falta de ar, dormência ou tontura severa.
            </p>
          </div>

          {/* Big Circular Danger Button (180x180px) with 2 pulse-rings (180px + 220px) */}
          <div className="relative my-6 flex items-center justify-center">
            <div
              className="absolute rounded-full border-2 border-red-400 animate-pulse-ring"
              style={{ width: 220, height: 220 }}
            />
            <div
              className="absolute rounded-full border-2 border-red-300 animate-pulse-ring"
              style={{ width: 260, height: 260, animationDelay: '0.4s' }}
            />

            <button
              id="btn-sos-main-trigger"
              type="button"
              onClick={handleStartEmergency}
              className="btn-press relative rounded-full flex flex-col items-center justify-center shadow-2xl text-white z-10"
              style={{
                width: 180,
                height: 180,
                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                boxShadow: '0 16px 48px rgba(220, 38, 38, 0.55)',
              }}
              aria-label="Acionar SOS Emergência"
            >
              <Phone className="w-14 h-14 stroke-[2.4] fill-white animate-pulse" />
              <span className="text-xl font-black tracking-wider mt-1 uppercase">SOS 192</span>
              <span className="text-[10px] uppercase font-bold text-red-200 tracking-widest">
                Toque aqui
              </span>
            </button>
          </div>

          {/* 3 Quick Action Cards */}
          <div className="w-full space-y-2 text-left">
            <a
              href="tel:192"
              className="btn-press p-3.5 rounded-2xl border flex items-center justify-between shadow-xs"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center text-red-600">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: dm.text }}>
                    Ligar Diretamente para o SAMU 192
                  </p>
                  <p className="text-[10px] text-slate-400">Ligação pública gratuita</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-600">192</span>
            </a>

            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between shadow-xs"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: dm.text }}>
                    Compartilhar GPS com UBS Local
                  </p>
                  <p className="text-[10px] text-slate-400">UBS Vila Mariana (800m de distância)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-sky-500/10 text-sky-700">
                Ativo
              </span>
            </div>

            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between shadow-xs"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: dm.text }}>
                    Avisar Rede Familiar (2 Cuidadores)
                  </p>
                  <p className="text-[10px] text-slate-400">Ana Silva e Dr. Lucas</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-700">
                Pronto
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: CONFIRM COUNTDOWN */}
      {state === 'confirm' && (
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center animate-fade-in">
          <div className="mb-4">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
              Acionando Socorro em...
            </span>
          </div>

          {/* Circular Countdown Div with Danger Border */}
          <div
            className="w-48 h-48 rounded-full border-8 border-red-500 bg-red-50 dark:bg-slate-900 flex flex-col items-center justify-center shadow-2xl my-6 animate-pulse"
          >
            <span className="text-7xl font-black text-red-600 tracking-tighter">{count}</span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">
              segundos
            </span>
          </div>

          <p className="text-xs text-slate-500 max-w-[260px] mb-8 font-medium">
            O SAMU 192 e sua filha Ana Silva receberão seu chamado com suas coordenadas GPS.
          </p>

          <button
            id="btn-cancel-countdown"
            type="button"
            onClick={handleCancelCountdown}
            className="btn-press w-full py-4 rounded-2xl font-black text-slate-700 dark:text-slate-200 text-sm border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5 text-red-500" />
            <span>Cancelar Chamado de Emergência</span>
          </button>
        </div>
      )}

      {/* STATE 3: ACTIVATED CONFIRMATION */}
      {state === 'activated' && (
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center animate-float-up">
          <div className="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl mb-4 animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <h2 className="text-2xl font-black text-red-950 tracking-tight">
            Chamado de Emergência Enviado!
          </h2>

          <p className="text-sm text-red-800 font-semibold mt-2 max-w-[290px] leading-relaxed">
            A central do <strong>SAMU 192</strong> e sua rede de cuidadores já foram notificadas com sua localização e histórico recente de pressão.
          </p>

          <div className="w-full bg-white/90 rounded-2xl p-4 border border-red-200 text-left my-6 space-y-2 text-xs shadow-sm">
            <div className="flex items-center gap-2 text-red-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>Instruções enquanto o socorro se desloca:</span>
            </div>
            <p className="text-slate-700">1. Sente-se confortavelmente e evite movimentos bruscos.</p>
            <p className="text-slate-700">2. Mantenha a porta destravada caso more sozinho.</p>
            <p className="text-slate-700">3. Deixe documentos e cartão do SUS à mão.</p>
          </div>

          <button
            id="btn-reset-emergency"
            type="button"
            onClick={() => setState('idle')}
            className="btn-press w-full py-4 rounded-2xl font-bold text-white bg-red-700 shadow-lg text-sm"
          >
            Voltar ao Modo Normal
          </button>
        </div>
      )}
    </div>
  );
};
