import { useEffect, useRef } from 'react';
import { Platform, ScrollView, TextInputProps } from 'react-native';

export function useInputVisibility() {
  const scrollRef = useRef<ScrollView>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return () => {
      if (focusTimer.current) clearTimeout(focusTimer.current);
    };
    const revealFocusedInput = () => {
      const input = document.activeElement;
      if (!(input instanceof HTMLElement) || !['INPUT', 'TEXTAREA'].includes(input.tagName)) return;
      const visibleBottom = (window.visualViewport?.offsetTop ?? 0) +
        (window.visualViewport?.height ?? window.innerHeight) - 24;
      const rect = input.getBoundingClientRect();
      let scroller = input.parentElement;
      while (scroller && !['auto', 'scroll'].includes(getComputedStyle(scroller).overflowY)) {
        scroller = scroller.parentElement;
      }
      if (!scroller) return;
      if (rect.bottom > visibleBottom) scroller.scrollTop += rect.bottom - visibleBottom;
      else if (rect.top < 16) scroller.scrollTop -= 16 - rect.top;
    };
    const scheduleReveal = () => {
      if (focusTimer.current) clearTimeout(focusTimer.current);
      focusTimer.current = setTimeout(revealFocusedInput, 80);
    };
    window.addEventListener('resize', scheduleReveal);
    window.visualViewport?.addEventListener('resize', scheduleReveal);
    return () => {
      window.removeEventListener('resize', scheduleReveal);
      window.visualViewport?.removeEventListener('resize', scheduleReveal);
      if (focusTimer.current) clearTimeout(focusTimer.current);
    };
  }, []);

  const keepInputVisible = (event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    if (Platform.OS === 'web') {
      focusTimer.current = setTimeout(() => {
        const input = document.activeElement;
        if (input instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(input.tagName)) {
          const visibleBottom = (window.visualViewport?.offsetTop ?? 0) +
            (window.visualViewport?.height ?? window.innerHeight) - 24;
          if (input.getBoundingClientRect().bottom > visibleBottom) {
            input.scrollIntoView({ block: 'center', behavior: 'auto' });
          }
        }
      }, 80);
      return;
    }
    const target = event.target;
    focusTimer.current = setTimeout(() => {
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(target, 28, true);
    }, 250);
  };

  return { scrollRef, keepInputVisible };
}
