import type { Appointment, HealthRecord } from '../types';

export type HealthLevel = 'normal' | 'warn' | 'danger';

export interface PressureClassification {
  level: HealthLevel;
  title: string;
  desc: string;
}

export interface GlucoseClassification {
  level: HealthLevel;
  label: string;
  desc: string;
}

export interface ParsedMeasurement {
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  heartRate?: number;
}

export interface WeekDayItem {
  key: string;
  label: string;
  dayNum: number;
  monthShort: string;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  recordCount: number;
}

export interface DaySummary {
  pressureRecord: HealthRecord | null;
  glucoseRecord: HealthRecord | null;
  totalCount: number;
}

const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRecordDateKey(
  record: Pick<HealthRecord, 'recordedAt' | 'date'>,
  referenceDate: Date = new Date()
): string | null {
  if (record.recordedAt) {
    const parsed = new Date(record.recordedAt);
    if (!Number.isNaN(parsed.getTime())) {
      return toLocalDateKey(parsed);
    }
  }
  const normalized = (record.date || '').trim().toLowerCase();
  const base = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  if (normalized.startsWith('hoje')) return toLocalDateKey(base);
  if (normalized.startsWith('ontem')) {
    base.setDate(base.getDate() - 1);
    return toLocalDateKey(base);
  }
  if (normalized.startsWith('anteontem')) {
    base.setDate(base.getDate() - 2);
    return toLocalDateKey(base);
  }
  return null;
}

export function buildWeekDays(
  referenceDate: Date,
  weekOffset: number,
  records: HealthRecord[]
): WeekDayItem[] {
  const todayBase = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const todayKey = toLocalDateKey(todayBase);

  const mondayOffset = (todayBase.getDay() + 6) % 7;
  const monday = new Date(todayBase);
  monday.setDate(todayBase.getDate() - mondayOffset + weekOffset * 7);

  const countsByKey = new Map<string, number>();
  for (const rec of records) {
    const k = getRecordDateKey(rec, referenceDate);
    if (k) countsByKey.set(k, (countsByKey.get(k) ?? 0) + 1);
  }

  const days: WeekDayItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toLocalDateKey(d);
    const diffMs = d.getTime() - todayBase.getTime();
    days.push({
      key,
      label: WEEK_LABELS[i],
      dayNum: d.getDate(),
      monthShort: MONTH_SHORT[d.getMonth()],
      isPast: diffMs < 0,
      isToday: key === todayKey,
      isFuture: diffMs > 0,
      recordCount: countsByKey.get(key) ?? 0,
    });
  }
  return days;
}

export function getDaySummary(
  records: HealthRecord[],
  dayKey: string,
  referenceDate: Date = new Date()
): DaySummary {
  const dayRecords = records.filter((r) => getRecordDateKey(r, referenceDate) === dayKey);
  const pressureRecord = dayRecords.find((r) => r.measurement !== 'glucose') ?? null;
  const glucoseRecord = dayRecords.find((r) => r.measurement !== 'pressure') ?? null;
  return {
    pressureRecord,
    glucoseRecord,
    totalCount: dayRecords.length,
  };
}

export function shouldShowCheckinCard(daySummary: DaySummary, isFutureDay: boolean): boolean {
  return !isFutureDay && daySummary.totalCount === 0;
}

export function getNextUpcomingAppointment(appointments: Appointment[]): Appointment | null {
  const active = appointments
    .filter((a) => !['cancelled', 'completed'].includes(a.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return active[0] ?? null;
}

export interface AppointmentProximity {
  isSoon: boolean;
  diffDays: number | null;
  message: string | null;
  countdownLabel: string | null;
}

export function getAppointmentProximity(
  appointment: Appointment | null | undefined,
  referenceDate: Date = new Date()
): AppointmentProximity {
  if (!appointment || ['cancelled', 'completed'].includes(appointment.status)) {
    return { isSoon: false, diffDays: null, message: null, countdownLabel: null };
  }
  const match = appointment.date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { isSoon: false, diffDays: null, message: null, countdownLabel: null };
  }
  const apptDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const todayBase = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const diffDays = Math.round((apptDate.getTime() - todayBase.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays >= 0 && diffDays <= 7) {
    const countdownLabel =
      diffDays === 0 ? 'Hoje' : diffDays === 1 ? 'Amanhã' : `Em ${diffDays} dias`;
    return {
      isSoon: true,
      diffDays,
      message: 'O dia da sua consulta está chegando',
      countdownLabel,
    };
  }
  return { isSoon: false, diffDays, message: null, countdownLabel: null };
}

export interface HistogramBarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  secondaryY?: number;
  secondaryHeight?: number;
  secondaryValue?: number;
}

export function computeHistogramBars(
  items: Array<{ value: number; secondaryValue?: number }>,
  minVal: number,
  maxVal: number,
  chartWidth: number,
  chartHeight: number
): HistogramBarRect[] {
  if (!items.length || chartWidth <= 0 || chartHeight <= 0) return [];
  const safeSpan = Math.max(1, maxVal - minVal);
  const barWidth = chartWidth / items.length;
  const topPad = 8;
  const usableHeight = Math.max(8, chartHeight - topPad);

  return items.map((item, index) => {
    const norm = Math.min(1, Math.max(0.08, (item.value - minVal) / safeSpan));
    const height = Math.max(10, Math.round(norm * usableHeight));
    const y = chartHeight - height;

    let secondaryY: number | undefined;
    let secondaryHeight: number | undefined;
    if (typeof item.secondaryValue === 'number') {
      const secNorm = Math.min(1, Math.max(0.05, (item.secondaryValue - minVal) / safeSpan));
      secondaryHeight = Math.max(6, Math.round(secNorm * usableHeight));
      secondaryY = chartHeight - secondaryHeight;
    }

    return {
      x: index * barWidth,
      y,
      width: barWidth,
      height,
      value: item.value,
      secondaryY,
      secondaryHeight,
      secondaryValue: item.secondaryValue,
    };
  });
}

export function getWeekRangeLabel(days: WeekDayItem[]): string {
  if (!days.length) return '';
  const first = days[0];
  const last = days[days.length - 1];
  if (first.monthShort === last.monthShort) {
    return `${first.dayNum}–${last.dayNum} ${first.monthShort}`;
  }
  return `${first.dayNum} ${first.monthShort} – ${last.dayNum} ${last.monthShort}`;
}

export function classifyPressure(systolic: number, diastolic: number): PressureClassification {
  if (systolic >= 140 || diastolic >= 90) {
    return {
      level: 'danger',
      title: 'Leitura de pressão elevada',
      desc: 'Uma medição isolada não define diagnóstico. Confirme a leitura e converse com sua equipe de saúde.',
    };
  }
  if (systolic >= 130 || diastolic >= 85) {
    return {
      level: 'warn',
      title: 'Leitura que merece atenção',
      desc: 'Acompanhe as próximas medições e converse com sua equipe de saúde.',
    };
  }
  return {
    level: 'normal',
    title: 'Pressão dentro da meta',
    desc: 'Continue registrando diariamente e siga as orientações da sua equipe de saúde.',
  };
}

export function classifyGlucose(
  value: number,
  mealContext: 'before' | 'after' = 'before'
): GlucoseClassification {
  const upperLimit = mealContext === 'before' ? 130 : 180;
  if (value > upperLimit) {
    return {
      level: 'danger',
      label: 'Leitura elevada',
      desc: 'As metas variam conforme o momento da refeição e seu plano de cuidado.',
    };
  }
  if (value < 70) {
    return {
      level: 'warn',
      label: 'Leitura baixa',
      desc: 'Uma leitura abaixo de 70 mg/dL precisa de atenção. Siga seu plano de cuidado.',
    };
  }
  return {
    level: 'normal',
    label: 'Glicemia na faixa alvo',
    desc: 'Compare com a meta definida pela sua equipe de saúde.',
  };
}

export function parseMeasurementText(text: string): ParsedMeasurement | null {
  const pressure = text.match(/(?:press[aã]o\s*(?:foi|deu|:)?\s*)?(\d{2,3})\s*(?:\/|por|x)\s*(\d{1,3})/i);
  const glucose = text.match(/(?:glicose|glicemia)\s*(?:foi|deu|:)?\s*(\d{2,3})/i);
  const heartRate = text.match(/(?:pulso|batimentos)\s*(?:foi|deu|:)?\s*(\d{2,3})/i);

  const systolic = pressure ? Number(pressure[1]) * (Number(pressure[1]) < 30 ? 10 : 1) : undefined;
  const diastolic = pressure ? Number(pressure[2]) * (Number(pressure[2]) < 20 ? 10 : 1) : undefined;
  const glucoseValue = glucose ? Number(glucose[1]) : undefined;

  if (systolic !== undefined && (systolic < 50 || systolic > 280 || !diastolic || diastolic < 30 || diastolic > 180)) {
    return null;
  }
  if (glucoseValue !== undefined && (glucoseValue < 20 || glucoseValue > 600)) {
    return null;
  }
  if (systolic === undefined && glucoseValue === undefined) {
    return null;
  }

  return {
    systolic,
    diastolic,
    glucose: glucoseValue,
    heartRate: heartRate ? Number(heartRate[1]) : undefined,
  };
}

export function getGreetingByHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export interface LatestVitalsSummary {
  pressureRecord: HealthRecord | null;
  glucoseRecord: HealthRecord | null;
}

export function getLatestVitalsSummary(records: HealthRecord[]): LatestVitalsSummary {
  const sorted = [...records].sort((a, b) => {
    const tA = a.recordedAt ? new Date(a.recordedAt).getTime() : 0;
    const tB = b.recordedAt ? new Date(b.recordedAt).getTime() : 0;
    return tB - tA;
  });
  return {
    pressureRecord: sorted.find((r) => r.measurement !== 'glucose') ?? null,
    glucoseRecord: sorted.find((r) => r.measurement !== 'pressure') ?? null,
  };
}

export interface NormalizedMonitoredPatient {
  name: string;
  relation: string;
  phone: string;
  conditions: string[];
  notes: string;
  isConfigured: boolean;
}

export function normalizeMonitoredPatient(
  user: Pick<import('../types').UserProfile, 'monitoredPatient' | 'conditions'>
): NormalizedMonitoredPatient {
  const mp = user.monitoredPatient;
  const name = mp?.name?.trim() || '';
  const relation = mp?.relation?.trim() || 'Familiar';
  const phone = mp?.phone?.trim() || '';
  const conditions = mp?.conditions?.length ? mp.conditions : user.conditions;
  const notes = mp?.notes?.trim() || '';
  return {
    name,
    relation,
    phone,
    conditions,
    notes,
    isConfigured: Boolean(name),
  };
}

export interface ProfileCompletionStatus {
  percent: number;
  missingFields: string[];
}

export function getProfileCompletionStatus(
  user: import('../types').UserProfile
): ProfileCompletionStatus {
  const checks: Array<{ label: string; ok: boolean }> = [
    { label: 'Nome completo', ok: Boolean(user.name?.trim()) },
    { label: 'Telefone', ok: Boolean(user.phone?.trim()) },
  ];

  if (user.userType === 'Profissional') {
    checks.push(
      { label: 'Registro (CRM/COREN)', ok: Boolean(user.professionalInfo?.councilRegister?.trim()) },
      { label: 'Especialidade', ok: Boolean(user.professionalInfo?.specialty?.trim()) },
      { label: 'Unidade de Saúde', ok: Boolean(user.professionalInfo?.clinicName?.trim()) }
    );
  } else if (user.userType === 'Familiar') {
    checks.push(
      { label: 'Paciente acompanhado', ok: Boolean(user.monitoredPatient?.name?.trim()) },
      { label: 'Telefone do paciente', ok: Boolean(user.monitoredPatient?.phone?.trim()) },
      { label: 'Contato de emergência', ok: Boolean(user.emergencyContact?.phone?.trim()) }
    );
  } else {
    checks.push(
      { label: 'Cartão SUS', ok: Boolean(user.susCard?.trim()) },
      { label: 'Condições monitoradas', ok: user.conditions.length > 0 },
      { label: 'Medicações', ok: user.medications.length > 0 },
      { label: 'Contato de emergência', ok: Boolean(user.emergencyContact?.phone?.trim()) }
    );
  }

  const completed = checks.filter((c) => c.ok).length;
  const missingFields = checks.filter((c) => !c.ok).map((c) => c.label);
  return {
    percent: Math.round((completed / checks.length) * 100),
    missingFields,
  };
}

/**
 * Resolves horizontal swipe gesture into week offset delta:
 * - Swipe left (negative dx/vx) advances to next week (+1)
 * - Swipe right (positive dx/vx) returns to previous week (-1)
 * - Small movements below threshold return 0 (cancel / snap back)
 */
export function resolveWeekSwipeDelta(dx: number, vx: number): -1 | 0 | 1 {
  const distanceThreshold = 36;
  const velocityThreshold = 0.32;
  if (dx <= -distanceThreshold || (dx < -14 && vx <= -velocityThreshold)) {
    return 1;
  }
  if (dx >= distanceThreshold || (dx > 14 && vx >= velocityThreshold)) {
    return -1;
  }
  return 0;
}
