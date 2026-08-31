import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Activity, ShieldCheck } from 'lucide-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onFinish}
      style={styles.touchable}
    >
      <LinearGradient
        colors={['#1E3A5F', '#3D6E9F', '#7CC9BE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Background Decorative Rings */}
        <View style={styles.circleDeco1} />
        <View style={styles.circleDeco2} />
        <View style={styles.circleDeco3} />

        {/* Header Badges */}
        <View style={styles.headerRow}>
          <View style={styles.susBadge}>
            <ShieldCheck size={14} color="#FFFFFF" />
            <Text style={styles.susBadgeText}>Integrado ao SUS</Text>
          </View>
          <Text style={styles.versionText}>v2.4 Expo Native</Text>
        </View>

        {/* Center Brand Identity */}
        <View style={styles.centerGroup}>
          <View style={styles.logoRingWrapper}>
            <View style={styles.pulseRing3} />
            <View style={styles.pulseRing2} />
            <View style={styles.pulseRing1} />

            <View style={styles.iconBox}>
              <View style={styles.heartStack}>
                <Heart size={44} color="#FFFFFF" fill="rgba(255,255,255,0.85)" />
                <View style={styles.activityPosition}>
                  <Activity size={24} color="#59B98A" strokeWidth={2.8} />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.brandTitle}>SEDA</Text>
          <Text style={styles.brandSubtitle}>
            Sistema de Equilíbrio de Diabetes e Artérias
          </Text>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "Sua saúde diária monitorada com carinho e precisão."
            </Text>
          </View>
        </View>

        {/* Footer Indicators */}
        <View style={styles.footerRow}>
          <View style={styles.indicatorDots}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.footerHint}>Toque em qualquer lugar para avançar</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  circleDeco1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  circleDeco2: {
    position: 'absolute',
    top: '35%',
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleDeco3: {
    position: 'absolute',
    bottom: -80,
    right: 20,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    zIndex: 10,
  },
  susBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  susBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  centerGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoRingWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pulseRing2: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pulseRing1: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartStack: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityPosition: {
    position: 'absolute',
    top: 10,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginTop: 18,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 6,
    lineHeight: 18,
  },
  quoteCard: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    maxWidth: 280,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerRow: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    zIndex: 10,
  },
  indicatorDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  footerHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
  },
});
