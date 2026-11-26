export type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'reset_password'
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
  | 'new_appointment'
  | 'connections'
  | 'chat'
  | 'edit_profile'
  | 'support';

export interface ProfessionalConnection {
  id: string;
  professionalId: string;
  patientId: string;
  professionalName: string;
  patientName: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  connectionId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

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
  meetingUrl?: string;
  bookedBy: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  measurement?: 'pressure' | 'glucose' | 'combined';
  recordedAt?: string;
  hasHeartRate?: boolean;
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
  role: 'Você' | 'Familiar' | 'Profissional';
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

export interface ProfessionalInfo {
  councilRegister: string;
  specialty: string;
  clinicName: string;
}

export interface MonitoredPatientInfo {
  name: string;
  relation: string;
  phone: string;
  birthDate?: string;
  conditions: string[];
  notes?: string;
}

export interface UserProfile {
  name: string;
  cpf: string;
  phone: string;
  birthDate: string;
  susCard: string;
  userType: 'Paciente' | 'Familiar' | 'Profissional';
  bloodType: string;
  avatarUrl?: string;
  professionalInfo?: ProfessionalInfo;
  monitoredPatient?: MonitoredPatientInfo;
  caregiverNotes?: string[];
  medicationsTakenToday?: Record<string, boolean>;
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

