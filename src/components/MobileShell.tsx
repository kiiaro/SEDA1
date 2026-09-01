import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Wifi, BatteryMedium, Signal } from 'lucide-react-native';
import { DarkModeTheme } from '../types';
import { COLORS } from '../constants/theme';

interface MobileShellProps {
  children: React.ReactNode;
  dm: DarkModeTheme;
  isSimulatorMode: boolean;
  onToggleSimulator: () => void;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  dm,
  isSimulatorMode,
  onToggleSimulator,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: dm.bg,
        },
      ]}
    >
      <StatusBar style={dm.isDark ? 'light' : 'dark'} />

      {/* Outer wrapper for web preview simulation or direct mobile view */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: dm.bg,
          },
        ]}
      >
        {/* Viewport Frame */}
        <View
          style={[
            styles.viewport,
            isWeb && isSimulatorMode ? styles.viewportSimulated : styles.viewportFull,
            {
              backgroundColor: dm.bg,
              borderColor: dm.border,
            },
          ]}
        >
          {/* Virtual Status Bar */}
          <View style={styles.virtualStatusBar}>
            <Text style={[styles.virtualTimeText, { color: dm.text }]}>{timeStr}</Text>

            {/* Dynamic Island / Notch */}
            <View style={styles.dynamicIsland}>
              <View style={styles.islandCamera} />
              <View style={styles.islandIndicatorRow}>
                <View style={styles.islandGreenDot} />
                <View style={styles.islandSensor} />
              </View>
            </View>

            <View style={styles.virtualIcons}>
              <Signal size={13} color={dm.sub} />
              <Wifi size={13} color={dm.sub} />
              <BatteryMedium size={14} color={dm.sub} />
            </View>
          </View>

          {/* Children View */}
          <View style={styles.content}>{children}</View>

          {/* Home indicator bar */}
          <View style={[styles.homeIndicatorWrapper, { backgroundColor: dm.card }]}>
            <View
              style={[
                styles.homeIndicator,
                {
                  backgroundColor: dm.isDark
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(30,58,95,0.35)',
                },
              ]}
            />
          </View>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  viewportSimulated: {
    maxWidth: 410,
    maxHeight: 860,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#1E3A5F',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  viewportFull: {
    maxWidth: 540,
  },
  virtualStatusBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  virtualTimeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dynamicIsland: {
    width: 108,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  islandCamera: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  islandIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  islandGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  islandSensor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E3A5F',
  },
  virtualIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  homeIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  homeIndicator: {
    width: 130,
    height: 4,
    borderRadius: 2,
  },
});
