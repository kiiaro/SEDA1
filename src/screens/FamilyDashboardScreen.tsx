import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import {
  Heart,
  Droplets,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Pill,
  Clock,
  Send,
  Bell,
  Settings2,
} from 'lucide-react-native';
import {
  Appointment,
  DarkModeTheme,
  HealthRecord,
  Screen,
  UserProfile,
} from '../types';
import {
  classifyGlucose,
  classifyPressure,
  getAppointmentProximity,
  getGreetingByHour,
  getLatestVitalsSummary,
  normalizeMonitoredPatient,
} from '../lib/healthUtils';
import { COLORS } from '../constants/theme';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';

interface FamilyDashboardScreenProps {
  user: UserProfile;
  appointments: Appointment[];
  records: HealthRecord[];
  unreadAlertsCount?: number;
  onUpdateUser: (updated: UserProfile) => Promise<void>;
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const FamilyDashboardScreen: React.FC<FamilyDashboardScreenProps> = ({
  user,
  appointments,
  records,
  unreadAlertsCount = 0,
  onUpdateUser,
  onNavigate,
  dm,
}) => {
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const monitored = useMemo(() => normalizeMonitoredPatient(user), [user]);
  const latestVitals = useMemo(() => getLatestVitalsSummary(records), [records]);
  const pressureRec = latestVitals.pressureRecord;
  const glucoseRec = latestVitals.glucoseRecord;
  const pressureClass = pressureRec
    ? classifyPressure(pressureRec.systolic, pressureRec.diastolic)
    : null;
  const glucoseClass = glucoseRec
    ? classifyGlucose(glucoseRec.glucose, glucoseRec.mealContext)
    : null;

  const nextAppt = useMemo(
    () =>
      appointments
        .filter((a) => !['cancelled', 'completed'].includes(a.status))
        .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null,
    [appointments]
  );
  const apptProximity = useMemo(() => getAppointmentProximity(nextAppt), [nextAppt]);

  const medsTaken = user.medicationsTakenToday ?? {};
  const caregiverNotes = user.caregiverNotes ?? [];

  const handleCallPatient = () => {
    const digits = monitored.phone.replace(/\D/g, '');
    if (!digits) {
      Alert.alert(
        'Telefone não cadastrado',
        'Configure o telefone do paciente em "Editar perfil".'
      );
      return;
    }
    Linking.openURL(`tel:${digits}`).catch(() =>
      Alert.alert('Ligação indisponível', 'Use o telefone do aparelho.')
    );
  };

  const handleWhatsApp = () => {
    const digits = monitored.phone.replace(/\D/g, '');
    if (!digits) {
      Alert.alert(
        'WhatsApp não cadastrado',
        'Configure o telefone do paciente em "Editar perfil".'
      );
      return;
    }
    const intl = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
    Linking.openURL(
      `https://wa.me/${intl}?text=Olá!%20Como%20você%20está%20se%20sentindo%20hoje?`
    ).catch(() => Alert.alert('WhatsApp', 'Não foi possível abrir o WhatsApp.'));
  };

  const handleAddNote = async () => {
    const text = newNote.trim();
    if (!text || savingNote) return;
    setSavingNote(true);
    try {
      await onUpdateUser({
        ...user,
        caregiverNotes: [text, ...caregiverNotes],
      });
      setNewNote('');
    } catch {
      Alert.alert('Erro ao salvar anotação', 'Tente novamente.');
    } finally {
      setSavingNote(false);
    }
  };

  const toggleMed = async (medKey: string) => {
    const updatedMap = {
      ...medsTaken,
      [medKey]: !medsTaken[medKey],
    };
    try {
      await onUpdateUser({
        ...user,
        medicationsTakenToday: updatedMap,
      });
    } catch {
      Alert.alert('Não foi possível atualizar', 'Tente novamente.');
    }
  };

  const greeting = getGreetingByHour(new Date().getHours());
  const firstName = user.name ? user.name.trim().split(/\s+/)[0] : 'Familiar';
  const caregiverInitials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'F';
  const patientInitials =
    monitored.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'P';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean Top Bar with SOS Phone Button beside Avatar */}
      <FadeInItem delay={0}>
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greetingTitle, { color: dm.text }]}>
              {greeting}, {firstName}
            </Text>
            <Text style={[styles.greetingSubtitle, { color: dm.sub }]} numberOfLines={1}>
              {monitored.isConfigured
                ? `Acompanhando ${monitored.name}`
                : 'Painel Familiar · Rede de Cuidado'}
            </Text>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              onPress={() => onNavigate('emergency')}
              activeOpacity={0.85}
              style={styles.sosHeaderBtn}
              accessibilityRole="button"
              accessibilityLabel="Emergência SOS"
            >
              <Phone size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('profile')}
              activeOpacity={0.85}
              style={[styles.avatarBtn, { borderColor: COLORS.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Abrir Perfil Familiar"
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: COLORS.secondary }]}>
                  <Text style={styles.avatarText}>{caregiverInitials}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </FadeInItem>

      <View style={styles.body}>
        {/* Monitored Patient Card (Configured vs Setup CTA) */}
        <FadeInItem delay={50}>
          {monitored.isConfigured ? (
            <View style={[styles.patientCard, { backgroundColor: '#264d8c' }]}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>{patientInitials}</Text>
              </View>
              <View style={styles.patientInfo}>
                <View style={styles.patientHeaderRow}>
                  <Text style={styles.patientName} numberOfLines={1}>
                    {monitored.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onNavigate('edit_profile')}
                    style={styles.patientEditPill}
                  >
                    <Text style={styles.patientEditText}>Editar</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.patientMeta} numberOfLines={2}>
                  {monitored.relation}
                  {monitored.conditions.length > 0
                    ? ` · ${monitored.conditions.join(' & ')}`
                    : ''}
                </Text>
                {monitored.notes ? (
                  <Text style={styles.patientStatus} numberOfLines={1}>
                    ● {monitored.notes}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => onNavigate('edit_profile')}
              activeOpacity={0.85}
              style={[
                styles.setupPatientCard,
                { backgroundColor: dm.card, borderColor: COLORS.secondary },
              ]}
            >
              <View style={styles.setupIconBox}>
                <Settings2 size={20} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.setupTitle, { color: dm.text }]}>
                  Configure quem você acompanha
                </Text>
                <Text style={[styles.setupDesc, { color: dm.sub }]}>
                  Informe nome, parentesco, telefone e medicações do paciente.
                </Text>
              </View>
              <Text style={[styles.setupLink, { color: COLORS.primary }]}>Configurar</Text>
            </TouchableOpacity>
          )}
        </FadeInItem>

        {/* Quick Action Contacts */}
        <FadeInItem delay={90}>
          <View style={styles.contactRow}>
            <TouchableOpacity
              onPress={handleCallPatient}
              activeOpacity={0.8}
              style={[
                styles.contactBtn,
                { backgroundColor: '#00b690', opacity: monitored.phone ? 1 : 0.6 },
              ]}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>Ligar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.8}
              style={[
                styles.contactBtn,
                { backgroundColor: '#264d8c', opacity: monitored.phone ? 1 : 0.6 },
              ]}
            >
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('alerts')}
              activeOpacity={0.8}
              style={[
                styles.contactBtn,
                { backgroundColor: dm.card, borderColor: dm.border, borderWidth: 1 },
              ]}
            >
              <Bell size={16} color={COLORS.secondary} />
              <Text style={[styles.contactBtnText, { color: dm.text }]}>
                Alertas{unreadAlertsCount > 0 ? ` (${unreadAlertsCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeInItem>

        {/* Live Vitals */}
        <FadeInItem delay={130}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: dm.text }]}>Sinais Vitais Recentes</Text>
            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => onNavigate('dashboard')}>
                <Text style={styles.linkAction}>Análises</Text>
              </TouchableOpacity>
              <Text style={[styles.linkSep, { color: dm.sub }]}>·</Text>
              <TouchableOpacity onPress={() => onNavigate('history')}>
                <Text style={styles.linkAction}>Diário</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.vitalsGrid}>
            <TouchableOpacity
              onPress={() => onNavigate('pressure')}
              style={[styles.vitalCard, { backgroundColor: dm.card, borderColor: dm.border }]}
            >
              <View style={styles.vitalHeader}>
                <View style={[styles.vitalIcon, { backgroundColor: 'rgba(0, 182, 144, 0.12)' }]}>
                  <Heart size={17} color="#00b690" />
                </View>
                <Text style={[styles.vitalLabel, { color: dm.sub }]}>Pressão</Text>
              </View>
              {pressureRec ? (
                <>
                  <Text style={[styles.vitalValue, { color: dm.text }]}>
                    {pressureRec.systolic}/{pressureRec.diastolic}{' '}
                    <Text style={{ fontSize: 12, fontWeight: '500', color: dm.sub }}>mmHg</Text>
                  </Text>
                  <Text style={[styles.vitalStatusText, { color: '#00b690' }]}>
                    {pressureClass?.level === 'normal'
                      ? 'Na meta'
                      : pressureClass?.level === 'warn'
                        ? 'Atenção'
                        : 'Elevada'}{' '}
                    · {pressureRec.time}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.vitalEmpty, { color: dm.text }]}>Sem registro</Text>
                  <Text style={[styles.vitalStatusText, { color: COLORS.primary }]}>
                    Toque para registrar
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('glucose')}
              style={[styles.vitalCard, { backgroundColor: dm.card, borderColor: dm.border }]}
            >
              <View style={styles.vitalHeader}>
                <View style={[styles.vitalIcon, { backgroundColor: 'rgba(38, 77, 140, 0.12)' }]}>
                  <Droplets size={17} color="#264d8c" />
                </View>
                <Text style={[styles.vitalLabel, { color: dm.sub }]}>Glicemia</Text>
              </View>
              {glucoseRec ? (
                <>
                  <Text style={[styles.vitalValue, { color: dm.text }]}>
                    {glucoseRec.glucose}{' '}
                    <Text style={{ fontSize: 12, fontWeight: '500', color: dm.sub }}>mg/dL</Text>
                  </Text>
                  <Text style={[styles.vitalStatusText, { color: '#264d8c' }]}>
                    {glucoseRec.mealContext === 'after' ? 'Pós-refeição' : 'Jejum'} ·{' '}
                    {glucoseClass?.label}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.vitalEmpty, { color: dm.text }]}>Sem registro</Text>
                  <Text style={[styles.vitalStatusText, { color: '#264d8c' }]}>
                    Toque para registrar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </FadeInItem>

        {/* Daily Medications Checklist */}
        <FadeInItem delay={170}>
          <View style={[styles.medCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.medCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pill size={17} color="#00b690" />
                <Text style={[styles.medCardTitle, { color: dm.text }]}>Remédios de Hoje</Text>
              </View>
              <TouchableOpacity onPress={() => onNavigate('edit_profile')}>
                <Text style={styles.linkAction}>
                  {user.medications.length > 0 ? 'Gerenciar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>

            {user.medications.length > 0 ? (
              <View style={styles.medList}>
                {user.medications.map((med, idx) => {
                  const key = `${med.name}-${med.nextTime || idx}`;
                  const taken = Boolean(medsTaken[key]);
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => toggleMed(key)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${med.name}: ${taken ? 'Tomada' : 'Pendente'}`}
                      style={[
                        styles.medItem,
                        {
                          backgroundColor: taken ? 'rgba(0, 182, 144, 0.08)' : dm.inputBg,
                          borderColor: taken ? '#00b690' : dm.border,
                        },
                      ]}
                    >
                      <View style={styles.medItemLeft}>
                        <CheckCircle2 size={19} color={taken ? '#00b690' : dm.sub} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.medName, { color: dm.text }]}>
                            {med.name} ({med.dosage})
                          </Text>
                          <Text style={[styles.medDose, { color: dm.sub }]}>
                            {med.frequency} · {med.nextTime}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.medStatus,
                          { color: taken ? '#00b690' : '#264d8c' },
                        ]}
                      >
                        {taken ? 'Tomada' : 'Pendente'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.emptyMedCopy, { color: dm.sub }]}>
                Nenhuma medicação cadastrada para o paciente. Toque em "Adicionar" para configurar os horários.
              </Text>
            )}
          </View>
        </FadeInItem>

        {/* Últimas Consultas */}
        <FadeInItem delay={210}>
          <View style={[styles.apptCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.apptHeaderRow}>
              <View style={styles.apptHeader}>
                <Calendar size={17} color="#264d8c" />
                <Text style={[styles.apptTitle, { color: dm.text }]}>Últimas Consultas</Text>
              </View>
              <TouchableOpacity onPress={() => onNavigate('appointments')}>
                <Text style={styles.linkAction}>Ver agenda</Text>
              </TouchableOpacity>
            </View>

            {nextAppt ? (
              <>
                {apptProximity.isSoon && apptProximity.message && (
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#00b690' }}>
                    {apptProximity.message} · {apptProximity.countdownLabel}
                  </Text>
                )}
                <Text style={[styles.apptDoctor, { color: dm.text }]}>{nextAppt.doctor}</Text>
                <Text style={[styles.apptSpecialty, { color: dm.sub }]}>
                  {nextAppt.specialty} · {nextAppt.location}
                </Text>
                <View style={styles.apptTimeRow}>
                  <Clock size={14} color="#00b690" />
                  <Text style={[styles.apptTime, { color: '#00b690' }]}>
                    {nextAppt.date} às {nextAppt.time}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ gap: 6 }}>
                <Text style={[styles.apptDoctor, { color: dm.text }]}>
                  Nenhuma consulta marcada
                </Text>
                <Text style={[styles.apptSpecialty, { color: dm.sub }]}>
                  Cadastre a próxima consulta para acompanhar datas e lembretes.
                </Text>
                <TouchableOpacity
                  onPress={() => onNavigate('new_appointment')}
                  style={{ alignSelf: 'flex-start', paddingTop: 2 }}
                >
                  <Text style={styles.linkAction}>Agendar consulta</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </FadeInItem>

        {/* Caregiver Notes */}
        <FadeInItem delay={250}>
          <View style={[styles.notesCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.notesTitle, { color: dm.text }]}>Observações do Cuidador</Text>
            <Text style={[styles.notesSubtitle, { color: dm.sub }]}>
              Anote sintomas ou dúvidas para relatar ao médico da UBS.
            </Text>

            <View style={styles.noteInputRow}>
              <TextInput
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Ex.: Caminhada leve após o café..."
                placeholderTextColor={dm.sub}
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: dm.inputBg,
                    borderColor: dm.border,
                    color: dm.text,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={handleAddNote}
                disabled={savingNote}
                activeOpacity={0.8}
                style={[styles.noteSendBtn, { backgroundColor: '#00b690' }]}
                accessibilityRole="button"
                accessibilityLabel="Adicionar observação"
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.notesList}>
              {caregiverNotes.length === 0 ? (
                <Text style={[styles.emptyMedCopy, { color: dm.sub }]}>
                  Nenhuma observação anotada ainda.
                </Text>
              ) : (
                caregiverNotes.map((n, i) => (
                  <View key={i} style={styles.noteItem}>
                    <Text style={[styles.noteText, { color: dm.text }]}>{n}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </FadeInItem>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 36 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 12,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarBtn: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  body: { padding: 18, gap: 16 },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    padding: 16,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00b690',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  patientInfo: { flex: 1, gap: 3 },
  patientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  patientName: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', flex: 1 },
  patientEditPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  patientEditText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  patientMeta: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 11, fontWeight: '500' },
  patientStatus: { color: '#A7F3D0', fontSize: 10, fontWeight: '700', marginTop: 1 },
  setupPatientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 15,
  },
  setupIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(38, 77, 140, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupTitle: { fontSize: 14, fontWeight: '800' },
  setupDesc: { fontSize: 12, lineHeight: 16 },
  setupLink: { fontSize: 12, fontWeight: '800' },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
  },
  contactBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  linksRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkAction: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  linkSep: { fontSize: 12, fontWeight: '700' },
  vitalsGrid: { flexDirection: 'row', gap: 12 },
  vitalCard: { flex: 1, padding: 14, borderRadius: 20, borderWidth: 1, gap: 6 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vitalIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalLabel: { fontSize: 11, fontWeight: '700' },
  vitalValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  vitalEmpty: { fontSize: 15, fontWeight: '800' },
  vitalStatusText: { fontSize: 11, fontWeight: '800' },
  medCard: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  medCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medCardTitle: { fontSize: 14, fontWeight: '800' },
  medList: { gap: 8 },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  medItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  medName: { fontSize: 13, fontWeight: '700' },
  medDose: { fontSize: 11 },
  medStatus: { fontSize: 11, fontWeight: '800' },
  emptyMedCopy: { fontSize: 12, lineHeight: 17 },
  apptCard: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 6 },
  apptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  apptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apptTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  apptDoctor: { fontSize: 15, fontWeight: '800' },
  apptSpecialty: { fontSize: 12 },
  apptTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  apptTime: { fontSize: 12, fontWeight: '800' },
  notesCard: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 8 },
  notesTitle: { fontSize: 14, fontWeight: '800' },
  notesSubtitle: { fontSize: 12, lineHeight: 16 },
  noteInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  noteInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  noteSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesList: { gap: 8, marginTop: 6 },
  noteItem: { borderLeftWidth: 3, borderLeftColor: '#00b690', paddingLeft: 10, paddingVertical: 4 },
  noteText: { fontSize: 12, lineHeight: 18 },
});
