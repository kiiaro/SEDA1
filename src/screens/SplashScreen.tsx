import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useReducedMotion } from '../components/Motion';

const logo = require('../../assets/seda-logo.png');

export const SplashScreen: React.FC = () => {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0.98)).current;
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    if (reduced) return;
    const logoLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.02, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.98, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const dotLoops = dots.map((dot, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 180),
      Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(dot, { toValue: 0.3, duration: 420, useNativeDriver: true }),
      Animated.delay((2 - index) * 180),
    ])));
    logoLoop.start();
    dotLoops.forEach((loop) => loop.start());
    return () => { logoLoop.stop(); dotLoops.forEach((loop) => loop.stop()); };
  }, [dots, pulse, reduced]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logo, { transform: [{ scale: pulse }] }]}>
        <Image source={logo} resizeMode="contain" style={styles.image} accessibilityLabel="theSEDA" />
      </Animated.View>
      <Text style={styles.caption}>Cuidado que aproxima</Text>
      <View style={styles.dots} accessibilityLabel="Carregando">
        {dots.map((opacity, index) => <Animated.View key={index} style={[styles.dot, { opacity }]} />)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logo: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  caption: { color: COLORS.primaryDk, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  dots: { marginTop: 18, height: 14, flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: COLORS.primaryDk },
});
