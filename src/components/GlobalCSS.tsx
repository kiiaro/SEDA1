import React, { useEffect } from 'react';
import { Platform, Text, TextInput } from 'react-native';
import { SF_FONT } from '../constants/theme';

const SF_PRO_CSS = `
  html, body, #root, #main, [dir="auto"], p, h1, h2, h3, h4, span, a, label, button, input, textarea, select {
    font-family: "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-variant-numeric: tabular-nums;
  }

  button, [role="button"], [tabindex="0"] {
    transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.16s ease;
  }

  button:focus-visible, [role="button"]:focus-visible, input:focus-visible, textarea:focus-visible {
    outline: 2px solid #00b690;
    outline-offset: 2px;
  }
`;

export const GlobalCSS: React.FC = () => {
  useEffect(() => {
    const TextAny = Text as any;
    const InputAny = TextInput as any;
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [{ fontFamily: SF_FONT }, TextAny.defaultProps.style];
    InputAny.defaultProps = InputAny.defaultProps || {};
    InputAny.defaultProps.style = [{ fontFamily: SF_FONT }, InputAny.defaultProps.style];

    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let styleEl = document.getElementById('seda-sf-pro-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'seda-sf-pro-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = SF_PRO_CSS;
  }, []);

  return null;
};
