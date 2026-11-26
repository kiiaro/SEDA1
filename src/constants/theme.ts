import { DarkModeTheme } from '../types';

export const COLORS = {
  primary: '#6EABC6',
  primaryDk: '#253E4C',
  brand: '#04B78D',
  secondary: '#FFE16D',
  accent: '#6EABC6',
  success: '#2FBF71',
  warn: '#F4B740',
  danger: '#E45454',
  purple: '#6B7FD4',
  bg: '#F7F8F6',
  card: '#FFFFFF',
  textMain: '#253E4C',
  textSub: '#60727B',
};

export const getDarkModeTheme = (isDark: boolean): DarkModeTheme => isDark ? {
  bg: '#0F172A', card: '#1E293B', text: '#F1F5F9', sub: '#94A3B8',
  border: '#334155', inputBg: '#0F172A', isDark: true,
} : {
  bg: '#F7F8F6', card: '#FFFFFF', text: '#253E4C', sub: '#60727B',
  border: '#DCE4E6', inputBg: '#F7F8F6', isDark: false,
};

export const SPECIALTIES = [
  'Cardiologia', 'Endocrinologia', 'Clínica Geral', 'Nutrição Clínica',
  'Oftalmologia', 'Enfermagem', 'Geriatria', 'Nefrologia',
];
