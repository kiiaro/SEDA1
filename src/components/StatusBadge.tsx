import React from 'react';
import { COLORS } from '../constants/theme';

interface StatusBadgeProps {
  status: 'normal' | 'warn' | 'danger' | 'info';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let dotColor = COLORS.success;
  let defaultLabel = 'Normal';
  let badgeBg = 'rgba(47, 191, 113, 0.12)';
  let textColor = '#15803d';

  if (status === 'warn') {
    dotColor = COLORS.warn;
    defaultLabel = 'Atenção';
    badgeBg = 'rgba(244, 183, 64, 0.15)';
    textColor = '#b45309';
  } else if (status === 'danger') {
    dotColor = COLORS.danger;
    defaultLabel = 'Alerta';
    badgeBg = 'rgba(228, 84, 84, 0.15)';
    textColor = '#b91c1c';
  } else if (status === 'info') {
    dotColor = COLORS.primary;
    defaultLabel = 'Informativo';
    badgeBg = 'rgba(94, 143, 192, 0.15)';
    textColor = '#1e3a5f';
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none"
      style={{ backgroundColor: badgeBg, color: textColor }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
      <span>{label || defaultLabel}</span>
    </div>
  );
};
