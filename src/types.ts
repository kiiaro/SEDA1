export type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'home'
  | 'pressure'
  | 'glucose'
  | 'voice'
  | 'history'
  | 'dashboard'
  | 'alerts'
  | 'family'
  | 'profile'
  | 'settings'
  | 'emergency'
  | 'appointments'
  | 'new_appointment';

export type FontSizeScale = 'normal' | 'large' | 'xl';

export interface DarkModeTheme {
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  inputBg: string;
  isDark: boolean;
}

export interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'presencial' | 'teleconsulta';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  location?: string;
  bookedBy: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  glucose: number;
  heartRate: number;
  mealContext?: 'before' | 'after';
  notes?: string;
  status: 'normal' | 'warn' | 'danger';
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  role: 'Você' | 'Familiar' | 'SUS';
  phone: string;
  avatarBg: string;
  initials: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: string;
}

export interface AlertItem {
  id: string;
  title: string;
  desc: string;
  type: 'danger' | 'warn' | 'info';
  date: string;
  time: string;
  emoji: string;
  color: string;
  actionLabel?: string;
  actionScreen?: Screen;
}

export interface UserProfile {
  name: string;
  cpf: string;
  phone: string;
  birthDate: string;
  susCard: string;
  userType: 'Paciente' | 'Familiar' | 'Profissional';
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  conditions: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    nextTime: string;
  }[];
}
