import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, QrCode, X } from 'lucide-react-native';
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
  const [showExpoModal, setShowExpoModal] = useState(false);

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
        {/* Web Toolbar if running on web preview */}
        {isWeb && (
          <View style={styles.webToolbar}>
            <View style={styles.toolbarLeft}>
              <View style={styles.liveDot} />
              <Text style={[styles.toolbarTitle, { color: dm.text }]}>SEDA Mobile</Text>
              <View style={styles.expoBadge}>
                <Text style={styles.expoBadgeText}>Expo Go Ready</Text>
              </View>
            </View>

            <View style={styles.toolbarRight}>
              <TouchableOpacity
                onPress={() => setShowExpoModal(true)}
                style={styles.toolbarButton}
                activeOpacity={0.7}
              >
                <QrCode size={14} color={COLORS.primary} />
                <Text style={[styles.toolbarButtonText, { color: dm.text }]}>Expo Go</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onToggleSimulator}
                style={styles.toolbarButton}
                activeOpacity={0.7}
              >
                {isSimulatorMode ? (
                  <>
                    <Maximize2 size={14} color={dm.sub} />
                    <Text style={[styles.toolbarButtonText, { color: dm.text }]}>Tela Cheia</Text>
                  </>
                ) : (
                  <>
                    <Smartphone size={14} color={dm.sub} />
                    <Text style={[styles.toolbarButtonText, { color: dm.text }]}>Moldura</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

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

      {/* Expo Go Help Modal */}
      <Modal
        visible={showExpoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExpoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: dm.card,
                borderColor: dm.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.modalIconBox}>
                  <Smartphone size={22} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: dm.text }]}>
                    SEDA no Expo Go & Celular
                  </Text>
                  <Text style={styles.modalSubtitle}>Execução 100% Nativa Expo</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowExpoModal(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={dm.sub} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: `${COLORS.primary}12`, borderColor: `${COLORS.primary}30` },
                ]}
              >
                <Text style={[styles.infoBoxTitle, { color: COLORS.primaryDk }]}>
                  1. Como rodar no Expo Go (Físico):
                </Text>
                <Text style={[styles.infoBoxDesc, { color: dm.sub }]}>
                  Execute <Text style={styles.codeText}>npx expo start</Text> no seu terminal e leia o QR Code com o aplicativo Expo Go (iOS ou Android).
                </Text>
              </View>

              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: `${COLORS.accent}12`, borderColor: `${COLORS.accent}30` },
                ]}
              >
                <Text style={[styles.infoBoxTitle, { color: COLORS.accent }]}>
                  2. Acessibilidade SEDA 45+:
                </Text>
                <Text style={[styles.infoBoxDesc, { color: dm.sub }]}>
                  Botões táteis de 48px+, suporte a modo escuro, gráficos SVG em tempo real e integração completa com a rede de saúde SUS.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowExpoModal(false)}
              style={styles.confirmModalBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmModalBtnText}>Continuar no App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  webToolbar: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  toolbarTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  expoBadge: {
    backgroundColor: 'rgba(94, 143, 192, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3D6E9F',
    textTransform: 'uppercase',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.12)',
  },
  toolbarButtonText: {
    fontSize: 11,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(94, 143, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 10,
    marginBottom: 20,
  },
  infoBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoBoxDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#3D6E9F',
  },
  confirmModalBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
