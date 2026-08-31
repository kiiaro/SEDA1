import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onValueChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  color: string;
  label?: string;
  fontSizeScale?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  color,
  label,
  fontSizeScale = 1,
}) => {
  const handleDec = () => {
    onValueChange(Math.max(min, value - step));
  };

  const handleInc = () => {
    onValueChange(Math.min(max, value + step));
  };

  return (
    <div className="flex flex-col items-center w-full my-1">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {label}
        </span>
      )}
      <div className="flex items-center justify-between w-full max-w-[320px] px-2">
        {/* Decrement Button */}
        <button
          id={`btn-dec-${label || unit}`}
          type="button"
          onClick={handleDec}
          disabled={value <= min}
          className="btn-press flex items-center justify-center rounded-2xl shadow-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            width: 48,
            height: 48,
            backgroundColor: `${color}18`,
            color: color,
          }}
          aria-label="Diminuir"
        >
          <Minus className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Giant Number Value */}
        <div className="flex flex-col items-center justify-center text-center select-none px-2 min-w-[140px]">
          <span
            className="font-black leading-none tracking-tighter"
            style={{
              fontSize: Math.round(50 * fontSizeScale),
              letterSpacing: '-2px',
              color: color,
            }}
          >
            {value}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            {unit}
          </span>
        </div>

        {/* Increment Button */}
        <button
          id={`btn-inc-${label || unit}`}
          type="button"
          onClick={handleInc}
          disabled={value >= max}
          className="btn-press flex items-center justify-center rounded-2xl shadow-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            width: 48,
            height: 48,
            backgroundColor: `${color}18`,
            color: color,
          }}
          aria-label="Aumentar"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>
      </div>
    </div>
  );
};
