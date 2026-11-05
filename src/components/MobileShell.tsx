import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkModeTheme } from '../types';

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
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isDesktopPreview = isWeb && width > 560;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDesktopPreview ? (dm.isDark ? '#0B1220' : '#EAF1F8') : dm.bg,
        },
      ]}
    >
      <StatusBar style={dm.isDark ? 'light' : 'dark'} />

      {/* Outer wrapper for web preview simulation or direct mobile view */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDesktopPreview ? (dm.isDark ? '#0B1220' : '#EAF1F8') : dm.bg,
          },
        ]}
      >
        {/* Viewport Frame */}
        <View
          style={[
            styles.viewport,
            isWeb && isSimulatorMode ? styles.viewportSimulated : isDesktopPreview ? styles.viewportDesktop : styles.viewportFull,
            {
              backgroundColor: dm.bg,
              borderColor: dm.border,
            },
          ]}
        >
          {/* Children View */}
          <View style={styles.content}>{children}</View>
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
  viewportDesktop: {
    maxWidth: 500,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  viewportFull: {
    maxWidth: '100%',
    width: '100%',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
});
