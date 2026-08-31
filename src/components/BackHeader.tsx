import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { COLORS } from '../constants/theme';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  bgGradient?: string;
  bgColor?: string;
  rightElement?: React.ReactNode;
}

export const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  onBack,
  bgGradient,
  bgColor = COLORS.primaryDk,
  rightElement,
}) => {
  return (
    <header
      className="relative px-4 pt-3 pb-4 text-white select-none transition-colors duration-300"
      style={{
        background: bgGradient || bgColor,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-back-header"
            type="button"
            onClick={onBack}
            className="btn-press flex items-center justify-center w-10 h-10 rounded-full border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="truncate">
            <h1 className="text-lg font-bold tracking-tight text-white truncate leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-blue-100 font-medium truncate opacity-90">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightElement && <div className="shrink-0">{rightElement}</div>}
      </div>
    </header>
  );
};
