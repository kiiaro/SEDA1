import React from 'react';

interface HealthRingProps {
  value: number;
  max: number;
  color: string;
  size?: number;
  stroke?: number;
  label?: string;
  unit?: string;
  textColor?: string;
}

export const HealthRing: React.FC<HealthRingProps> = ({
  value,
  max,
  color,
  size = 88,
  stroke = 8,
  label,
  unit,
  textColor,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const progressRatio = clampedValue / max;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div
      className="relative flex flex-col items-center justify-center inline-flex"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center"
        style={{ overflow: 'visible' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeOpacity={0.22}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Centered value and unit */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
        style={{ color: textColor || color }}
      >
        <span className="font-extrabold tracking-tight leading-none text-base sm:text-lg">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] opacity-80 font-medium tracking-wide mt-0.5">
            {unit}
          </span>
        )}
        {label && (
          <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
