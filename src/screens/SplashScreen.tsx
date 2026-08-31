import React, { useEffect } from 'react';
import { Heart, Activity, ShieldCheck } from 'lucide-react';
import { Screen } from '../types';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="relative flex-1 flex flex-col items-center justify-between p-6 cursor-pointer select-none overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #3D6E9F 0%, #5E8FC0 50%, #7CC9BE 100%)',
      }}
    >
      {/* 3 Absolute Decorative Circles */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/15 pointer-events-none"
        style={{ filter: 'blur(1px)' }}
      />
      <div
        className="absolute top-1/3 -left-20 w-72 h-72 rounded-full border border-white/10 pointer-events-none"
      />
      <div
        className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full border border-white/15 pointer-events-none"
      />

      {/* Top Brand / SUS integration note */}
      <div className="w-full flex items-center justify-between pt-4 z-10 animate-fade-in">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Integrado ao SUS</span>
        </div>
        <span className="text-[11px] font-medium text-white/80 tracking-wide">
          v2.4 Pro
        </span>
      </div>

      {/* Center Logo & 3 Concentric Pulse Rings */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        <div className="relative flex items-center justify-center">
          {/* Ring 1 (160px) */}
          <div
            className="absolute rounded-full border-2 border-white/20 animate-pulse-ring"
            style={{ width: 160, height: 160 }}
          />
          {/* Ring 2 (130px) */}
          <div
            className="absolute rounded-full border-2 border-white/30 animate-pulse-ring"
            style={{ width: 130, height: 130, animationDelay: '0.4s' }}
          />
          {/* Ring 3 (110px) */}
          <div
            className="absolute rounded-full border border-white/40 animate-pulse-ring"
            style={{ width: 110, height: 110, animationDelay: '0.8s' }}
          />

          {/* Logo Center Icon */}
          <div
            className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-2xl animate-heartbeat"
          >
            <div className="relative">
              <Heart className="w-12 h-12 text-white fill-white/80" />
              <Activity className="w-6 h-6 text-emerald-300 absolute inset-0 m-auto stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Text SEDA font-size 50px, fontWeight 900, letterSpacing -2px */}
        <h1
          className="text-white mt-6 font-black tracking-tight leading-none text-center"
          style={{ fontSize: 50, letterSpacing: '-2px' }}
        >
          SEDA
        </h1>

        <p className="text-white/90 text-sm font-semibold text-center mt-2 max-w-[260px] tracking-wide leading-snug">
          Sistema de Equilíbrio de Diabetes e Artérias
        </p>

        {/* Glassmorphism Quote Card */}
        <div
          className="mt-6 px-4 py-2.5 rounded-2xl border border-white/25 text-white/95 text-xs text-center max-w-[280px] shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p className="font-medium italic">
            "Sua saúde diária monitorada com carinho e precisão."
          </p>
        </div>
      </div>

      {/* Footer Dots & Tap to Skip */}
      <div className="w-full flex flex-col items-center gap-3 pb-4 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-2 rounded-full bg-white transition-all" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </div>
        <p className="text-[11px] text-white/70 font-medium tracking-wide">
          Toque para continuar
        </p>
      </div>
    </div>
  );
};
