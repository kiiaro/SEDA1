import React, { useState, useEffect } from 'react';
import { Mic, MicOff, CheckCircle2, Sparkles, Volume2, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';

interface VoiceScreenProps {
  onSaveRecognizedRecord: (record: Partial<HealthRecord>) => void;
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  onSaveRecognizedRecord,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [waves, setWaves] = useState<number[]>(Array(12).fill(0.3));
  const [voiceText, setVoiceText] = useState('');
  const [interpretedData, setInterpretedData] = useState<{
    systolic: number;
    diastolic: number;
    glucose?: number;
    heartRate?: number;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Audio wave animation while listening
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isListening) {
      interval = setInterval(() => {
        setWaves((w) => w.map(() => 0.15 + Math.random() * 0.85));
      }, 120);
    } else {
      setWaves(Array(12).fill(0.3));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Voice recognition simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isListening) {
      timer = setTimeout(() => {
        setIsListening(false);
        const recognized = 'Minha pressão foi 12 por 8 e a glicose 104';
        setVoiceText(recognized);
        setInterpretedData({
          systolic: 120,
          diastolic: 80,
          glucose: 104,
          heartRate: 72,
        });
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isListening]);

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setVoiceText('');
      setInterpretedData(null);
      setIsSaved(false);
      setIsListening(true);
    }
  };

  const handleConfirmAndSave = () => {
    if (interpretedData) {
      setIsSaved(true);
      onSaveRecognizedRecord({
        systolic: interpretedData.systolic,
        diastolic: interpretedData.diastolic,
        glucose: interpretedData.glucose || 100,
        heartRate: interpretedData.heartRate || 72,
        notes: `Registro por voz: "${voiceText}"`,
        status: 'normal',
      });
      setTimeout(() => {
        onBack();
      }, 1400);
    }
  };

  const sampleCommands = [
    '🗣️ "Minha pressão deu 12 por 8"',
    '🗣️ "Glicemia 115 em jejum hoje cedo"',
    '🗣️ "Pressão 13 por 8 e batimentos 74"',
    '🗣️ "Glicose 140 após o almoço"',
  ];

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Assistente de Voz SEDA"
        subtitle="Dite suas medições sem precisar digitar"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #4F46E5 0%, #6B7FD4 100%)"
      />

      <div className="flex-1 p-5 flex flex-col justify-between items-center text-center">
        {/* Top Status & Audio Waveform */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: isListening ? 'rgba(239,68,68,0.15)' : `${COLORS.purple}18`,
                color: isListening ? '#dc2626' : COLORS.purple,
              }}
            >
              {isListening ? 'Escutando você agora...' : 'Toque no microfone e fale'}
            </span>
          </div>

          {/* 12 Animated Waveform Bars */}
          <div className="h-16 flex items-center justify-center gap-1.5 py-2">
            {waves.map((w, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-100"
                style={{
                  height: Math.max(8, w * 56),
                  backgroundColor: isListening ? COLORS.purple : `${COLORS.purple}40`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Big Central Mic Button (120x120px) with 2 pulse rings */}
        <div className="relative my-4 flex items-center justify-center">
          {isListening && (
            <>
              <div
                className="absolute rounded-full border-2 border-indigo-400 animate-pulse-ring"
                style={{ width: 170, height: 170 }}
              />
              <div
                className="absolute rounded-full border-2 border-indigo-300 animate-pulse-ring"
                style={{ width: 210, height: 210, animationDelay: '0.4s' }}
              />
            </>
          )}

          <button
            id="btn-voice-mic-main"
            type="button"
            onClick={handleToggleListening}
            className="btn-press relative rounded-full flex items-center justify-center shadow-xl transition-all z-10"
            style={{
              width: 120,
              height: 120,
              background: isListening
                ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                : '#E0E8F8',
              color: isListening ? '#FFFFFF' : COLORS.purple,
              boxShadow: isListening
                ? '0 12px 36px rgba(79, 70, 229, 0.45)'
                : '0 8px 24px rgba(107, 127, 212, 0.25)',
            }}
            aria-label={isListening ? 'Parar gravação' : 'Iniciar escuta por voz'}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 stroke-[2.2]" />
            ) : (
              <Mic className="w-12 h-12 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Interpreted Result Card with float-up animation */}
        {voiceText && (
          <div
            className="w-full rounded-2xl p-4 border shadow-md animate-float-up text-left space-y-3"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>O que o SEDA ouviu:</span>
            </div>

            <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-200 pl-2 border-l-2 border-indigo-400">
              "{voiceText}"
            </p>

            {/* Recognized Green Badge */}
            {interpretedData && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    Pressão {interpretedData.systolic}/{interpretedData.diastolic} mmHg interpretada
                  </p>
                  {interpretedData.glucose && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                      Glicemia: {interpretedData.glucose} mg/dL
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Confirm & Save Button */}
            <button
              id="btn-confirm-voice-save"
              type="button"
              onClick={handleConfirmAndSave}
              disabled={isSaved}
              className="btn-press w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-all"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>✓ Salvo no seu histórico!</span>
                </>
              ) : (
                <>
                  <span>Confirmar e Salvar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Idle Example Commands */}
        {!voiceText && !isListening && (
          <div
            className="w-full rounded-2xl p-4 border text-left"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Exemplos de frases que você pode falar:</span>
            </div>
            <div className="space-y-1.5">
              {sampleCommands.map((cmd, idx) => (
                <p
                  key={idx}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg"
                >
                  {cmd}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
