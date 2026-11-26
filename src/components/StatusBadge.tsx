import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface StatusBadgeProps {
  status: 'normal' | 'warn' | 'danger' | 'info';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let dotColor = COLORS.primary;
  let defaultLabel = 'Normal';
  let badgeBg = 'rgba(0, 182, 144, 0.14)';
  let textColor = '#008C6E';

  if (status === 'warn') {
    dotColor = COLORS.primaryDk;
    defaultLabel = 'Atenção';
    badgeBg = 'rgba(38, 77, 140, 0.14)';
    textColor = '#264d8c';
  } else if (status === 'danger') {
    dotColor = COLORS.danger;
    defaultLabel = 'Alerta';
    badgeBg = 'rgba(239, 68, 68, 0.14)';
    textColor = '#DC2626';
  } else if (status === 'info') {
    dotColor = COLORS.primaryDk;
    defaultLabel = 'Informativo';
    badgeBg = 'rgba(38, 77, 140, 0.12)';
    textColor = '#264d8c';
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
