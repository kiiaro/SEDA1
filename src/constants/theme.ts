import { DarkModeTheme } from '../types';

export const COLORS = {
  primary: '#5E8FC0',
  primaryDk: '#3D6E9F',
  secondary: '#7CC9BE',
  accent: '#59B98A',
  success: '#2FBF71',
  warn: '#F4B740',
  danger: '#E45454',
  purple: '#6B7FD4',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E3A5F',
  textSub: '#64748B',
};

export const getDarkModeTheme = (isDark: boolean): DarkModeTheme => isDark ? {
  bg: '#0F172A', card: '#1E293B', text: '#F1F5F9', sub: '#94A3B8',
  border: '#334155', inputBg: '#0F172A', isDark: true,
} : {
  bg: '#F8FAFC', card: '#FFFFFF', text: '#1E3A5F', sub: '#64748B',
  border: '#E2E8F0', inputBg: '#F8FAFC', isDark: false,
};

export const SPECIALTIES = [
  'Cardiologia', 'Endocrinologia', 'Clínica Geral', 'Nutrição Clínica',
  'Oftalmologia', 'Enfermagem', 'Geriatria', 'Nefrologia',
];
