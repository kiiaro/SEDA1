import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
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
  viewportFull: {
    maxWidth: '100%',
    width: '100%',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
});
