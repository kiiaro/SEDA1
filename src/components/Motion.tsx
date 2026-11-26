import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  return reduced;
}

export function ScreenEntrance({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, reduced]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export function FadeInItem({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, opacity, translateY, reduced]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function MotionButton({ onPressIn, onPressOut, style, disabled, children, ...props }: TouchableOpacityProps) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) => {
    if (reduced) return;
    Animated.spring(scale, { toValue, speed: 28, bounciness: 6, useNativeDriver: true }).start();
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      disabled={disabled}
      activeOpacity={0.9}
      onPressIn={(event) => { animate(0.965); onPressIn?.(event); }}
      onPressOut={(event) => { animate(1); onPressOut?.(event); }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}
