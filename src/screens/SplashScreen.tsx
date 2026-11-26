import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { COLORS } from '../constants/theme';

export const SplashScreen: React.FC = () => {
  // Animated values for minimalist logo breathing & staggered dots
  const logoScale = useRef(new Animated.Value(0.95)).current;
  const logoOpacity = useRef(new Animated.Value(0.7)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Gentle breathing animation on logo
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0.75,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathing.start();

    // Staggered minimal dots pulsating sequence
    const animateDot = (dotAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 800 - delay)),
        ])
      );
    };

    const d1 = animateDot(dot1, 0);
    const d2 = animateDot(dot2, 220);
    const d3 = animateDot(dot3, 440);

    d1.start();
    d2.start();
    d3.start();

    return () => {
      breathing.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, [logoScale, logoOpacity, dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      {/* Center Group: Minimalist Logo + Glowing Subtle Ring */}
      <View style={styles.centerBox}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoHalo} />
          <Image
            source={require('../../assets/the_seda_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="the seda"
          />
        </Animated.View>

        {/* Minimalist 3 Dots */}
        <View style={styles.dotsRow}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1,
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0.25, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2,
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0.25, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3,
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0.25, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // #00b690 primary brand color
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  logoWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoHalo: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
  },
});
