import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyPressure,
  classifyGlucose,
  parseMeasurementText,
  getGreetingByHour,
  buildWeekDays,
  getDaySummary,
  shouldShowCheckinCard,
  getNextUpcomingAppointment,
  getAppointmentProximity,
  computeHistogramBars,
  toLocalDateKey,
  getLatestVitalsSummary,
  normalizeMonitoredPatient,
  getProfileCompletionStatus,
} from './healthUtils';
import type { Appointment, HealthRecord, UserProfile } from '../types';

test('classifyPressure classifies normal, warn, and danger ranges accurately', () => {
  assert.equal(classifyPressure(120, 80).level, 'normal');
  assert.equal(classifyPressure(132, 82).level, 'warn');
  assert.equal(classifyPressure(125, 86).level, 'warn');
  assert.equal(classifyPressure(145, 85).level, 'danger');
  assert.equal(classifyPressure(125, 92).level, 'danger');
});

test('classifyGlucose respects fasting vs post-meal context', () => {
  assert.equal(classifyGlucose(98, 'before').level, 'normal');
  assert.equal(classifyGlucose(145, 'before').level, 'danger');
  assert.equal(classifyGlucose(145, 'after').level, 'normal');
  assert.equal(classifyGlucose(190, 'after').level, 'danger');
  assert.equal(classifyGlucose(65, 'before').level, 'warn');
});

test('parseMeasurementText parses Brazilian shorthand and full measurements', () => {
  assert.deepEqual(parseMeasurementText('Pressão 12 por 8 e glicemia 104'), {
    systolic: 120,
    diastolic: 80,
    glucose: 104,
    heartRate: undefined,
  });
  assert.deepEqual(parseMeasurementText('pressao 130/85 pulso 72'), {
    systolic: 130,
    diastolic: 85,
    glucose: undefined,
    heartRate: 72,
  });
  assert.equal(parseMeasurementText('texto sem valores'), null);
  assert.equal(parseMeasurementText('glicose 900'), null);
});

test('getGreetingByHour returns appropriate Portuguese greeting', () => {
  assert.equal(getGreetingByHour(8), 'Bom dia');
  assert.equal(getGreetingByHour(14), 'Boa tarde');
  assert.equal(getGreetingByHour(21), 'Boa noite');
});

test('buildWeekDays computes past, today, future contrast and navigates weeks', () => {
  const wed = new Date(2026, 10, 25, 10, 0, 0); // Wednesday 2026-11-25
  const records: HealthRecord[] = [
    {
      id: 'r1',
      recordedAt: new Date(2026, 10, 25, 8, 30, 0).toISOString(),
      measurement: 'pressure',
      date: 'Hoje',
      time: '08:30',
      systolic: 120,
      diastolic: 80,
      glucose: 98,
      heartRate: 70,
      status: 'normal',
    },
  ];
  const currentWeek = buildWeekDays(wed, 0, records);
  assert.equal(currentWeek.length, 7);
  assert.equal(currentWeek[0].label, 'Seg');
  assert.equal(currentWeek[0].isPast, true);
  assert.equal(currentWeek[2].isToday, true);
  assert.equal(currentWeek[2].recordCount, 1);
  assert.equal(currentWeek[4].isFuture, true);

  const prevWeek = buildWeekDays(wed, -1, records);
  assert.equal(prevWeek.every((d) => d.isPast), true);

  const nextWeek = buildWeekDays(wed, 1, records);
  assert.equal(nextWeek.every((d) => d.isFuture), true);
});

test('getDaySummary returns empty records when selected day has no measurements', () => {
  const wed = new Date(2026, 10, 25, 10, 0, 0);
  const records: HealthRecord[] = [
    {
      id: 'r1',
      recordedAt: new Date(2026, 10, 25, 8, 30, 0).toISOString(),
      measurement: 'pressure',
      date: 'Hoje',
      time: '08:30',
      systolic: 120,
      diastolic: 80,
      glucose: 98,
      heartRate: 70,
      status: 'normal',
    },
  ];
  const todaySummary = getDaySummary(records, toLocalDateKey(wed), wed);
  assert.equal(todaySummary.totalCount, 1);
  assert.ok(todaySummary.pressureRecord);
  assert.equal(todaySummary.glucoseRecord, null);

  const emptySummary = getDaySummary(records, '2026-11-20', wed);
  assert.equal(emptySummary.totalCount, 0);
  assert.equal(emptySummary.pressureRecord, null);
  assert.equal(emptySummary.glucoseRecord, null);
});

test('getNextUpcomingAppointment returns null when only cancelled or no appointments exist', () => {
  assert.equal(getNextUpcomingAppointment([]), null);
  const cancelledOnly: Appointment[] = [
    {
      id: 1,
      doctor: 'Dr. Teste',
      specialty: 'Clínica Geral',
      date: '2026-12-01',
      time: '09:00',
      type: 'presencial',
      status: 'cancelled',
      bookedBy: 'UBS',
    },
  ];
  assert.equal(getNextUpcomingAppointment(cancelledOnly), null);
});

test('getAppointmentProximity flags upcoming consultations within 7 days', () => {
  const ref = new Date(2026, 10, 25, 16, 0, 0); // 2026-11-25
  const nearAppt: Appointment = {
    id: 101,
    doctor: 'Dr. Roberto',
    specialty: 'Clínico Geral',
    date: '2026-11-28',
    time: '09:00',
    type: 'presencial',
    status: 'confirmed',
    bookedBy: 'UBS',
  };
  const near = getAppointmentProximity(nearAppt, ref);
  assert.equal(near.isSoon, true);
  assert.equal(near.diffDays, 3);
  assert.equal(near.message, 'O dia da sua consulta está chegando');
  assert.equal(near.countdownLabel, 'Em 3 dias');

  const todayAppt: Appointment = { ...nearAppt, date: '2026-11-25' };
  assert.equal(getAppointmentProximity(todayAppt, ref).countdownLabel, 'Hoje');

  const farAppt: Appointment = { ...nearAppt, date: '2026-12-20' };
  assert.equal(getAppointmentProximity(farAppt, ref).isSoon, false);

  const cancelledNear: Appointment = { ...nearAppt, status: 'cancelled' };
  assert.equal(getAppointmentProximity(cancelledNear, ref).isSoon, false);
});

test('computeHistogramBars generates contiguous zero-gap bar geometry', () => {
  const bars = computeHistogramBars(
    [
      { value: 110, secondaryValue: 70 },
      { value: 140, secondaryValue: 90 },
      { value: 120, secondaryValue: 80 },
    ],
    50,
    170,
    300,
    120
  );
  assert.equal(bars.length, 3);
  assert.equal(bars[0].x, 0);
  assert.equal(bars[0].width, 100);
  assert.equal(bars[1].x, 100);
  assert.equal(bars[2].x, 200);
  assert.ok(bars[1].height > bars[0].height);
  assert.ok(typeof bars[0].secondaryHeight === 'number' && bars[0].secondaryHeight < bars[0].height);
  assert.deepEqual(computeHistogramBars([], 0, 100, 300, 120), []);
});

test('shouldShowCheckinCard hides check-in once a day has saved measurements or is in the future', () => {
  assert.equal(
    shouldShowCheckinCard({ pressureRecord: null, glucoseRecord: null, totalCount: 0 }, false),
    true
  );
  assert.equal(
    shouldShowCheckinCard({ pressureRecord: null, glucoseRecord: null, totalCount: 1 }, false),
    false
  );
  assert.equal(
    shouldShowCheckinCard({ pressureRecord: null, glucoseRecord: null, totalCount: 0 }, true),
    false
  );
});

test('getLatestVitalsSummary returns newest pressure and glucose records or nulls', () => {
  assert.deepEqual(getLatestVitalsSummary([]), { pressureRecord: null, glucoseRecord: null });
  const records: HealthRecord[] = [
    {
      id: 'old_p',
      recordedAt: '2026-11-24T08:00:00.000Z',
      measurement: 'pressure',
      date: 'Ontem',
      time: '08:00',
      systolic: 140,
      diastolic: 90,
      glucose: 100,
      heartRate: 78,
      status: 'danger',
    },
    {
      id: 'new_p',
      recordedAt: '2026-11-25T08:30:00.000Z',
      measurement: 'pressure',
      date: 'Hoje',
      time: '08:30',
      systolic: 122,
      diastolic: 80,
      glucose: 100,
      heartRate: 72,
      status: 'normal',
    },
    {
      id: 'new_g',
      recordedAt: '2026-11-25T07:15:00.000Z',
      measurement: 'glucose',
      date: 'Hoje',
      time: '07:15',
      systolic: 120,
      diastolic: 80,
      glucose: 96,
      heartRate: 70,
      mealContext: 'before',
      status: 'normal',
    },
  ];
  const latest = getLatestVitalsSummary(records);
  assert.equal(latest.pressureRecord?.id, 'new_p');
  assert.equal(latest.glucoseRecord?.id, 'new_g');
});

test('normalizeMonitoredPatient and getProfileCompletionStatus handle all 3 roles', () => {
  const familiarProfile: UserProfile = {
    name: 'Carlos Silva',
    cpf: '',
    phone: '(11) 99999-0000',
    birthDate: '',
    susCard: '',
    userType: 'Familiar',
    bloodType: '',
    emergencyContact: { name: 'SAMU', phone: '192', relation: 'Emergência' },
    conditions: [],
    medications: [],
  };
  assert.equal(normalizeMonitoredPatient(familiarProfile).isConfigured, false);
  assert.ok(getProfileCompletionStatus(familiarProfile).missingFields.includes('Paciente acompanhado'));

  const profProfile: UserProfile = {
    ...familiarProfile,
    userType: 'Profissional',
    professionalInfo: {
      councilRegister: 'CRM-SP 12345',
      specialty: 'Cardiologia',
      clinicName: 'UBS Central',
    },
  };
  assert.equal(getProfileCompletionStatus(profProfile).percent, 100);

  const patientProfile: UserProfile = {
    ...familiarProfile,
    userType: 'Paciente',
    susCard: '898 0012 3456 7890',
    conditions: ['Hipertensão'],
    medications: [{ name: 'Losartana', dosage: '50mg', frequency: '1x/dia', nextTime: '08:00' }],
  };
  assert.equal(getProfileCompletionStatus(patientProfile).percent, 100);
});

test('resolveWeekSwipeDelta maps left/right swipes and ignores jitter', async () => {
  const { resolveWeekSwipeDelta } = await import('./healthUtils');
  assert.equal(resolveWeekSwipeDelta(-48, -0.2), 1);
  assert.equal(resolveWeekSwipeDelta(48, 0.2), -1);
  assert.equal(resolveWeekSwipeDelta(-18, -0.45), 1);
  assert.equal(resolveWeekSwipeDelta(18, 0.45), -1);
  assert.equal(resolveWeekSwipeDelta(-12, -0.1), 0);
  assert.equal(resolveWeekSwipeDelta(10, 0.05), 0);
});
