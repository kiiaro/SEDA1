import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

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
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeOpacity={0.2}
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Centered value and unit */}
      <View style={styles.centerContent} pointerEvents="none">
        <Text style={[styles.valueText, { color: textColor || color }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unitText, { color: textColor || color }]}>
            {unit}
          </Text>
        )}
        {label && (
          <Text style={[styles.labelText, { color: textColor || color }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.85,
    marginTop: 1,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.75,
  },
});
