import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

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
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {/* Decrement Button */}
        <TouchableOpacity
          onPress={handleDec}
          disabled={value <= min}
          activeOpacity={0.7}
          style={[
            styles.button,
            {
              backgroundColor: `${color}18`,
              opacity: value <= min ? 0.3 : 1,
            },
          ]}
          accessibilityLabel="Diminuir"
        >
          <Minus size={22} color={color} strokeWidth={2.8} />
        </TouchableOpacity>

        {/* Big Value Display */}
        <View style={styles.valueContainer}>
          <Text
            style={[
              styles.valueText,
              {
                fontSize: Math.round(48 * fontSizeScale),
                color: color,
              },
            ]}
          >
            {value}
          </Text>
          <Text style={styles.unitText}>{unit}</Text>
        </View>

        {/* Increment Button */}
        <TouchableOpacity
          onPress={handleInc}
          disabled={value >= max}
          activeOpacity={0.7}
          style={[
            styles.button,
            {
              backgroundColor: `${color}18`,
              opacity: value >= max ? 0.3 : 1,
            },
          ]}
          accessibilityLabel="Aumentar"
        >
          <Plus size={22} color={color} strokeWidth={2.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 8,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
  },
  valueText: {
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
