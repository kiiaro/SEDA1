import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { MotionButton as TouchableOpacity } from './Motion';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  bgGradient?: [string, string, ...string[]];
  bgColor?: string;
  accentColor?: string;
  rightElement?: React.ReactNode;
  dm?: DarkModeTheme;
}

export const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  onBack,
  accentColor = COLORS.primary,
  rightElement,
  dm,
}) => {
  const isDark = dm?.isDark ?? false;
  const bg = dm?.bg ?? '#F8FAFC';
  const cardBg = dm?.card ?? '#FFFFFF';
  const textColor = dm?.text ?? '#0F172A';
  const subColor = dm?.sub ?? '#64748B';
  const borderColor = dm?.border ?? '#E2E8F0';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.06)',
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={[
              styles.backButton,
              {
                backgroundColor: cardBg,
                borderColor,
              },
            ]}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={19} color={textColor} strokeWidth={2.4} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <View style={styles.titleRow}>
              <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {rightElement ? <View style={styles.rightGroup}>{rightElement}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  accentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginLeft: 14,
  },
  rightGroup: {
    marginLeft: 8,
  },
});
