import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';
import { ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';

interface OnboardingScreenProps {
  onFinish: () => void;
  dm: DarkModeTheme;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, dm }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: 'Controle de Pressão & Coração',
      sub: 'Monitore sua pressão arterial diariamente com botões grandes, alertas visuais imediatos e relatórios para a UBS.',
      color: COLORS.danger,
      badge: 'Pressão Arterial',
      renderIcon: () => (
        <Svg width={160} height={160} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="85" fill="#E45454" fillOpacity={0.12} />
          <Circle cx="100" cy="100" r="65" fill="#E45454" fillOpacity={0.2} />
          <Circle cx="100" cy="100" r="45" fill="#E45454" />
          <Path
            d="M65 100 L80 100 L90 75 L105 125 L115 88 L125 100 L140 100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
    },
    {
      id: 1,
      title: 'Glicose em Equilíbrio',
      sub: 'Registre suas taxas de glicemia antes e após as refeições de forma simples e sem complicações numéricas.',
      color: COLORS.accent,
      badge: 'Glicemia & Dieta',
      renderIcon: () => (
        <Svg width={160} height={160} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="85" fill="#59B98A" fillOpacity={0.12} />
          <Circle cx="100" cy="100" r="65" fill="#59B98A" fillOpacity={0.2} />
          <Path
            d="M100 50 C100 50 65 95 65 125 C65 145 80 160 100 160 C120 160 135 145 135 125 C135 95 100 50 100 50 Z"
            fill="#59B98A"
          />
          <Circle cx="88" cy="120" r="6" fill="#FFFFFF" fillOpacity={0.6} />
        </Svg>
      ),
    },
    {
      id: 2,
      title: 'Voz, Família e SUS',
      sub: 'Fale seus números por voz, compartilhe com seus filhos ou cuidadores e acesse consultas do SUS com 1 toque.',
      color: COLORS.primary,
      badge: 'Cuidado Integrado',
      renderIcon: () => (
        <Svg width={160} height={160} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="85" fill="#5E8FC0" fillOpacity={0.12} />
          <Circle cx="100" cy="100" r="65" fill="#5E8FC0" fillOpacity={0.2} />
          <Circle cx="100" cy="100" r="48" fill="#5E8FC0" />
          <Rect x="91" y="75" width="18" height="32" rx="9" fill="#FFFFFF" />
          <Path
            d="M80 95 C80 110 120 110 120 95"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <Line x1="100" y1="113" x2="100" y2="128" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <Line x1="88" y1="128" x2="112" y2="128" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </Svg>
      ),
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: dm.bg }]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={[styles.badge, { backgroundColor: `${slide.color}20` }]}>
          <Text style={[styles.badgeText, { color: slide.color }]}>{slide.badge}</Text>
        </View>

        <TouchableOpacity onPress={onFinish} activeOpacity={0.7} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: dm.sub }]}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Body */}
      <View style={styles.bodyGroup}>
        <View style={[styles.iconCard, { backgroundColor: `${slide.color}14` }]}>
          {slide.renderIcon()}
        </View>

        <Text style={[styles.slideTitle, { color: dm.text }]}>{slide.title}</Text>
        <Text style={[styles.slideSub, { color: dm.sub }]}>{slide.sub}</Text>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <View style={styles.dotRow}>
          {slides.map((s, idx) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setCurrentSlide(idx)}
              style={[
                styles.dotItem,
                {
                  width: currentSlide === idx ? 28 : 8,
                  backgroundColor: currentSlide === idx ? slide.color : 'rgba(148, 163, 184, 0.4)',
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[styles.actionBtn, { backgroundColor: slide.color }]}
        >
          <Text style={styles.actionBtnText}>
            {currentSlide === slides.length - 1 ? 'Começar a Cuidar' : 'Próximo'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bodyGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  iconCard: {
    padding: 20,
    borderRadius: 36,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  slideSub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 290,
  },
  footer: {
    gap: 20,
    paddingBottom: 8,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dotItem: {
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
