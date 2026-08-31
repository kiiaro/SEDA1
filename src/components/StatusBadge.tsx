import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface StatusBadgeProps {
  status: 'normal' | 'warn' | 'danger' | 'info';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let dotColor = COLORS.success;
  let defaultLabel = 'Normal';
  let badgeBg = 'rgba(47, 191, 113, 0.15)';
  let textColor = '#15803d';

  if (status === 'warn') {
    dotColor = COLORS.warn;
    defaultLabel = 'Atenção';
    badgeBg = 'rgba(244, 183, 64, 0.18)';
    textColor = '#b45309';
  } else if (status === 'danger') {
    dotColor = COLORS.danger;
    defaultLabel = 'Alerta';
    badgeBg = 'rgba(228, 84, 84, 0.18)';
    textColor = '#b91c1c';
  } else if (status === 'info') {
    dotColor = COLORS.primary;
    defaultLabel = 'Informativo';
    badgeBg = 'rgba(94, 143, 192, 0.18)';
    textColor = '#1e3a5f';
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: textColor }]}>
        {label || defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
