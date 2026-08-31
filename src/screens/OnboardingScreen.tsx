import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, HeartPulse, Droplets, Mic, ShieldAlert } from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';

interface OnboardingScreenProps {
  onFinish: () => void;
  dm: DarkModeTheme;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, dm }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: 'Controle de Pressão & Coração',
      sub: 'Monitore sua pressão arterial diariamente com botões grandes, alertas visuais imediatos e relatórios para a UBS.',
      color: COLORS.danger,
      bgGradient: 'linear-gradient(135deg, rgba(228,84,84,0.12) 0%, rgba(94,143,192,0.1) 100%)',
      badge: 'Pressão Arterial',
      icon: (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-md">
          <circle cx="100" cy="100" r="85" fill="#E45454" fillOpacity="0.12" />
          <circle cx="100" cy="100" r="65" fill="#E45454" fillOpacity="0.2" />
          <circle cx="100" cy="100" r="45" fill="#E45454" />
          <path
            d="M80 100 Q90 80 100 100 T120 100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M65 100 L80 100 L90 75 L105 125 L115 88 L125 100 L140 100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 1,
      title: 'Glicose em Equilíbrio',
      sub: 'Registre suas taxas de glicemia antes e após as refeições de forma simples e sem complicações numéricas.',
      color: COLORS.accent,
      bgGradient: 'linear-gradient(135deg, rgba(89,185,138,0.15) 0%, rgba(124,201,190,0.1) 100%)',
      badge: 'Glicemia & Dieta',
      icon: (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-md">
          <circle cx="100" cy="100" r="85" fill="#59B98A" fillOpacity="0.12" />
          <circle cx="100" cy="100" r="65" fill="#59B98A" fillOpacity="0.2" />
          <path
            d="M100 50 C100 50 65 95 65 125 C65 145 80 160 100 160 C120 160 135 145 135 125 C135 95 100 50 100 50 Z"
            fill="#59B98A"
          />
          <circle cx="88" cy="120" r="6" fill="#FFFFFF" fillOpacity="0.6" />
          <path
            d="M92 105 Q100 95 108 105"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Voz, Família e Conexão SUS',
      sub: 'Fale seus números por voz, compartilhe com seus filhos ou cuidadores e acesse consultas do SUS com 1 toque.',
      color: COLORS.primary,
      bgGradient: 'linear-gradient(135deg, rgba(94,143,192,0.18) 0%, rgba(107,127,212,0.12) 100%)',
      badge: 'Cuidado Integrado',
      icon: (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-md">
          <circle cx="100" cy="100" r="85" fill="#5E8FC0" fillOpacity="0.12" />
          <circle cx="100" cy="100" r="65" fill="#5E8FC0" fillOpacity="0.2" />
          <circle cx="100" cy="100" r="48" fill="#5E8FC0" />
          <rect x="91" y="75" width="18" height="32" rx="9" fill="#FFFFFF" />
          <path
            d="M80 95 C80 110 120 110 120 95"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line x1="100" y1="113" x2="100" y2="128" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="88" y1="128" x2="112" y2="128" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div
      className="flex-1 flex flex-col justify-between p-6 select-none transition-colors duration-300"
      style={{ backgroundColor: dm.bg }}
    >
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-between pt-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${slide.color}18`,
            color: slide.color,
          }}
        >
          {slide.badge}
        </span>

        <button
          id="btn-skip-onboarding"
          type="button"
          onClick={onFinish}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Main Slide Content */}
      <div
        key={currentSlide}
        className="flex-1 flex flex-col items-center justify-center text-center my-4 animate-float-up"
      >
        {/* Visual Illustration */}
        <div
          className="p-6 rounded-3xl mb-6 transition-all"
          style={{ background: slide.bgGradient }}
        >
          {slide.icon}
        </div>

        <h2
          className="text-2xl font-black tracking-tight mb-3"
          style={{ color: dm.text }}
        >
          {slide.title}
        </h2>

        <p
          className="text-sm font-medium leading-relaxed max-w-[300px]"
          style={{ color: dm.sub }}
        >
          {slide.sub}
        </p>
      </div>

      {/* Footer Dots and Action Button */}
      <div className="flex flex-col gap-5 pb-2">
        {/* Interactive Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              id={`btn-dot-onboarding-${idx}`}
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: currentSlide === idx ? 28 : 8,
                height: 8,
                backgroundColor: currentSlide === idx ? slide.color : 'rgba(148, 163, 184, 0.35)',
              }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Primary Next / Start Button */}
        <button
          id="btn-next-onboarding"
          type="button"
          onClick={handleNext}
          className="btn-press w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: slide.color,
            boxShadow: `0 10px 25px ${slide.color}40`,
          }}
        >
          <span>{currentSlide === slides.length - 1 ? 'Começar a Cuidar' : 'Próximo'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
