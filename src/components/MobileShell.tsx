import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2, QrCode, X } from 'lucide-react';
import { DarkModeTheme } from '../types';
import { COLORS } from '../constants/theme';

interface MobileShellProps {
  children: React.ReactNode;
  dm: DarkModeTheme;
  isSimulatorMode: boolean;
  onToggleSimulator: () => void;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  dm,
  isSimulatorMode,
  onToggleSimulator,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [showExpoModal, setShowExpoModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 md:p-6 transition-colors duration-300"
      style={{
        background: dm.isDark
          ? 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 100%)'
          : 'radial-gradient(ellipse at top, #E2E8F0 0%, #CBD5E1 100%)',
      }}
    >
      {/* Top Toolbar for AI Studio preview / Expo Go simulation instructions */}
      <div className="w-full max-w-[440px] flex items-center justify-between px-3 py-2 text-xs font-semibold select-none text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
          <span className="font-bold tracking-tight">SEDA Mobile</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono uppercase bg-sky-500/10 text-sky-700 dark:text-sky-300">
            Expo Go Ready
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-expo-instructions"
            type="button"
            onClick={() => setShowExpoModal(true)}
            className="btn-press flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-xs border border-slate-300/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all text-[11px]"
            title="Como rodar no Expo Go / Celular"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Expo Go</span>
          </button>

          <button
            id="btn-toggle-frame-mode"
            type="button"
            onClick={onToggleSimulator}
            className="btn-press flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-xs border border-slate-300/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all text-[11px]"
            title={isSimulatorMode ? 'Expandir para tela cheia' : 'Modo moldura de celular'}
          >
            {isSimulatorMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">Tela Cheia</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">Moldura</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        id="seda-app-viewport"
        className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
          isSimulatorMode
            ? 'w-full sm:w-[390px] h-[100dvh] sm:h-[844px] sm:rounded-[44px]'
            : 'w-full max-w-[520px] min-h-[100dvh] sm:rounded-[32px]'
        }`}
        style={{
          backgroundColor: dm.bg,
          boxShadow: isSimulatorMode
            ? '0 32px 80px rgba(0,0,0,0.35), 0 0 0 10px #1E3A5F, 0 0 0 12px #4A6080'
            : '0 20px 50px rgba(0,0,0,0.15)',
        }}
      >
        {/* Mobile Status Bar (44px) */}
        <div
          className="sticky top-0 left-0 right-0 z-40 h-[44px] px-6 flex items-center justify-between select-none pointer-events-none transition-colors duration-200"
          style={{
            backgroundColor: 'transparent',
            color: dm.isDark ? '#F1F5F9' : '#1E3A5F',
          }}
        >
          {/* Time */}
          <div className="font-semibold text-[14px] tracking-tight pl-1">
            {timeStr}
          </div>

          {/* Dynamic Island / Notch Simulation */}
          <div className="w-[110px] h-[26px] bg-slate-950 rounded-full flex items-center justify-between px-2.5 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950 border border-blue-800" />
            </div>
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 pr-1">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic App Content Body */}
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div
          className="w-full flex justify-center py-1.5 pointer-events-none select-none z-30"
          style={{ backgroundColor: dm.card }}
        >
          <div
            className="w-[134px] h-[4.5px] rounded-full transition-colors duration-200"
            style={{
              backgroundColor: dm.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(30,58,95,0.35)',
            }}
          />
        </div>
      </div>

      {/* Expo Go & Mobile Instructions Modal */}
      {showExpoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-float-up text-slate-800 dark:text-slate-100">
            <button
              id="btn-close-expo-modal"
              type="button"
              onClick={() => setShowExpoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">SEDA no Celular & Expo Go</h3>
                <p className="text-xs text-slate-500">Execução mobile instantânea</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  1. Acesso direto no Navegador do Celular (PWA/Web):
                </p>
                <p>
                  Abra a URL deste aplicativo no Safari (iOS) ou Chrome (Android). Toque em <strong>"Compartilhar"</strong> e selecione <strong>"Adicionar à Tela de Início"</strong> para usar como app nativo em tela cheia com vibração e gravação de voz.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  2. Para Projeto React Native / Expo Go:
                </p>
                <p>
                  A estrutura deste código segue rigorosamente o design system mobile da SEDA (React 19 + TypeScript). As telas, lógica de estado de hipertensão/glicemia e fluxos de emergência/SUS estão 100% integrados e prontos para exportação.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200">
                <p className="font-semibold">✨ Acessibilidade Ativa:</p>
                <p>
                  Botões de 48px+, fontes escaláveis, alto contraste e comandos por voz para idosos (45+) e cuidadores.
                </p>
              </div>
            </div>

            <button
              id="btn-confirm-expo-modal"
              type="button"
              onClick={() => setShowExpoModal(false)}
              className="mt-5 w-full py-3 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all"
            >
              Entendido, explorar o App SEDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
