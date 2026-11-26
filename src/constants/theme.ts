import { Platform } from 'react-native';
import { DarkModeTheme } from '../types';

export const SF_FONT =
  Platform.OS === 'web'
    ? '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif'
    : 'System';

export const COLORS = {
  primary: '#00b690',      // Brand Mint / Emerald Teal
  primaryDk: '#264d8c',    // Brand Deep Navy Blue
  secondary: '#264d8c',    // Deep Navy Blue
  navy: '#264d8c',         // Navy
  teal: '#00b690',         // Teal
  accent: '#00b690',       // Unified #00b690 primary accent (replaces yellow)
  accentLight: '#E6F8F4',  // Soft mint tint
  mintLight: '#E6F8F4',    // Soft teal tint
  navyLight: '#EDF2F9',    // Soft navy tint
  success: '#00b690',
  warn: '#264d8c',         // Attention uses Deep Navy instead of yellow
  danger: '#EF4444',
  purple: '#6366F1',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#0F172A',
  textSub: '#64748B',
  border: '#E2E8F0',
};

export const getDarkModeTheme = (isDark: boolean): DarkModeTheme => isDark ? {
  bg: '#0B1323', card: '#162238', text: '#F8FAFC', sub: '#94A3B8',
  border: '#223454', inputBg: '#0E1729', isDark: true,
} : {
  bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', sub: '#64748B',
  border: '#E2E8F0', inputBg: '#F8FAFC', isDark: false,
};

export const SPECIALTIES = [
  'Cardiologia', 'Endocrinologia', 'Clínica Geral', 'Nutrição Clínica',
  'Oftalmologia', 'Enfermagem', 'Geriatria', 'Nefrologia',
];
