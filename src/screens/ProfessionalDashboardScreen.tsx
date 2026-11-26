import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, Alert } from 'react-native';
import {
  CalendarDays,
  CalendarPlus,
  MessageCircle,
  ShieldCheck,
  Users,
  QrCode,
  Copy,
  Check,
  Settings2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { COLORS } from '../constants/theme';
import { getAppointmentProximity, getGreetingByHour } from '../lib/healthUtils';
import { Appointment, DarkModeTheme, ProfessionalConnection, Screen, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  connections: ProfessionalConnection[];
  appointments: Appointment[];
  onCreateInvite: () => Promise<string>;
  onOpenChat: (connection: ProfessionalConnection) => void;
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const ProfessionalDashboardScreen: React.FC<Props> = ({
  user,
  connections,
  appointments,
  onCreateInvite,
  onOpenChat,
  onNavigate,
  dm,
}) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  const nextAppointment = appointments
    .filter((item) => !['cancelled', 'completed'].includes(item.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
  const apptProximity = getAppointmentProximity(nextAppointment);

  const handleGenerateQR = async () => {
    setGenerating(true);
    try {
      const code = await onCreateInvite();
      setInviteCode(code);
    } catch (e) {
      Alert.alert(
        'Erro ao gerar QR Code',
        e instanceof Error ? e.message : 'Tente novamente.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteCode);
      }
    } catch {
      // Ignore clipboard permission errors on restricted contexts
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const greeting = getGreetingByHour(new Date().getHours());
  const firstName = user.name.trim().split(/\s+/)[0] || 'Profissional';
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'P';

  const hasProfConfig = Boolean(
    user.professionalInfo?.councilRegister?.trim() &&
      user.professionalInfo?.specialty?.trim() &&
      user.professionalInfo?.clinicName?.trim()
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean Minimalist Professional Header */}
      <FadeInItem delay={0}>
        <View style={styles.topBar}>
          <View style={styles.topTextCol}>
            <Text style={[styles.greetingTitle, { color: dm.text }]}>
              {greeting}, Dr(a). {firstName}
            </Text>
            <Text style={[styles.greetingSub, { color: dm.sub }]} numberOfLines={1}>
              {user.professionalInfo?.specialty || 'Painel Clínico SEDA'}
              {user.professionalInfo?.clinicName ? ` · ${user.professionalInfo.clinicName}` : ''}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onNavigate('profile')}
            activeOpacity={0.85}
            style={[styles.avatarBtn, { borderColor: COLORS.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Abrir Perfil Profissional"
          >
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: COLORS.secondary }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </FadeInItem>

      <View style={styles.body}>
        {/* Missing Credential Prompt */}
        {!hasProfConfig && (
          <FadeInItem delay={20}>
            <TouchableOpacity
              onPress={() => onNavigate('edit_profile')}
              activeOpacity={0.85}
              style={[
                styles.setupBanner,
                {
                  backgroundColor: 'rgba(38, 77, 140, 0.08)',
                  borderColor: 'rgba(38, 77, 140, 0.25)',
                },
              ]}
            >
              <Settings2 size={18} color={COLORS.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.setupTitle, { color: dm.text }]}>
                  Configure seu registro profissional
                </Text>
                <Text style={[styles.setupSub, { color: dm.sub }]}>
                  Informe CRM/COREN, especialidade e unidade de saúde.
                </Text>
              </View>
              <Text style={styles.setupLink}>Configurar</Text>
            </TouchableOpacity>
          </FadeInItem>
        )}

        {/* Hero Card */}
        <FadeInItem delay={40}>
          <LinearGradient
            colors={['#264d8c', '#1b3b6f', '#00b690']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <ShieldCheck size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Acompanhamento Clínico SEDA</Text>
            <Text style={styles.heroCopy}>
              Conecte pacientes diretamente pelo QR Code do consultório ou código seguro.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={handleGenerateQR}
              disabled={generating}
              accessibilityRole="button"
              accessibilityLabel="Gerar QR Code para Paciente"
            >
              <QrCode size={18} color="#264d8c" />
              <Text style={styles.heroButtonText}>
                {generating
                  ? 'Gerando...'
                  : inviteCode
                    ? 'Gerar novo QR Code'
                    : 'Gerar QR Code p/ Paciente'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </FadeInItem>

        {/* QR Code Presentation Card for Patients */}
        {inviteCode ? (
          <View
            style={[
              styles.qrCard,
              { backgroundColor: dm.card, borderColor: '#00b690' },
            ]}
          >
            <View style={styles.qrHeader}>
              <QrCode size={20} color="#00b690" />
              <Text style={[styles.qrTitle, { color: dm.text }]}>
                QR Code de Conexão do Consultório
              </Text>
            </View>
            <Text style={[styles.qrSubtitle, { color: dm.sub }]}>
              Peça para o paciente abrir o SEDA e escanear este código na tela da Equipe.
            </Text>

            <View style={styles.qrImageContainer}>
              <QRCode value={inviteCode} size={180} color="#264d8c" backgroundColor="#FFFFFF" />
            </View>

            <View style={styles.codeRow}>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Código de Vínculo</Text>
                <Text style={styles.codeText}>{inviteCode}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCopy}
                accessibilityRole="button"
                accessibilityLabel="Copiar código de vínculo"
                style={[styles.copyBtn, { backgroundColor: copied ? '#00b690' : '#264d8c' }]}
              >
                {copied ? <Check size={16} color="#FFF" /> : <Copy size={16} color="#FFF" />}
                <Text style={styles.copyBtnText}>{copied ? 'Copiado' : 'Copiar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Users size={18} color="#00b690" />
            <Text style={[styles.statValue, { color: dm.text }]}>{connections.length}</Text>
            <Text style={[styles.statLabel, { color: dm.sub }]}>Pacientes vinculados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <CalendarDays size={18} color="#264d8c" />
            <Text style={[styles.statValue, { color: dm.text }]}>
              {appointments.filter((a) => !['cancelled', 'completed'].includes(a.status)).length}
            </Text>
            <Text style={[styles.statLabel, { color: dm.sub }]}>Consultas ativas</Text>
          </View>
        </View>

        {/* Recent Linked Patients + Direct Chat */}
        <View style={[styles.patientsCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
          <View style={styles.patientsHeader}>
            <View style={styles.sectionHeaderNoMargin}>
              <Users size={17} color="#00b690" />
              <Text style={[styles.sectionTitle, { color: dm.text }]}>
                Pacientes e Conversas
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('connections')}>
              <Text style={[styles.linkText, { color: '#00b690' }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {connections.length > 0 ? (
            <View style={styles.patientList}>
              {connections.slice(0, 3).map((conn) => (
                <View
                  key={conn.id}
                  style={[styles.patientRow, { backgroundColor: dm.inputBg, borderColor: dm.border }]}
                >
                  <View style={styles.patientAvatar}>
                    <Text style={styles.patientAvatarText}>
                      {conn.patientName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.patientName, { color: dm.text }]} numberOfLines={1}>
                      {conn.patientName}
                    </Text>
                    <Text style={[styles.patientRole, { color: dm.sub }]}>
                      Paciente monitorado
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onOpenChat(conn)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir chat com ${conn.patientName}`}
                    style={styles.chatPillBtn}
                  >
                    <MessageCircle size={14} color="#FFFFFF" />
                    <Text style={styles.chatPillText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.appointmentMeta, { color: dm.sub }]}>
              Nenhum paciente conectado ainda. Gere um QR Code acima para vincular o primeiro paciente.
            </Text>
          )}
        </View>

        {/* Next Clinical Appointment */}
        <View style={[styles.appointmentCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
          <View style={styles.patientsHeader}>
            <View style={styles.sectionHeaderNoMargin}>
              <CalendarDays size={18} color="#264d8c" />
              <Text style={[styles.sectionTitle, { color: dm.text }]}>
                Próximo atendimento agendado
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('new_appointment')}
              style={styles.newApptChip}
            >
              <CalendarPlus size={14} color="#00b690" />
              <Text style={[styles.linkText, { color: '#00b690' }]}>Agendar</Text>
            </TouchableOpacity>
          </View>

          {nextAppointment ? (
            <View style={styles.appointmentInfo}>
              {apptProximity.isSoon && apptProximity.message ? (
                <Text style={styles.soonBadge}>
                  {apptProximity.message} · {apptProximity.countdownLabel}
                </Text>
              ) : null}
              <Text style={[styles.appointmentName, { color: dm.text }]}>
                {nextAppointment.bookedBy} · {nextAppointment.specialty}
              </Text>
              <Text style={[styles.appointmentMeta, { color: dm.sub }]}>
                {nextAppointment.date} · {nextAppointment.time} ·{' '}
                {nextAppointment.type === 'teleconsulta' ? 'Teleconsulta' : nextAppointment.location || 'Presencial'}
              </Text>
              <TouchableOpacity
                onPress={() => onNavigate('appointments')}
                style={styles.linkButton}
              >
                <Text style={[styles.linkText, { color: '#00b690' }]}>Abrir agenda</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyAppointment}>
              <Text style={[styles.emptyTitle, { color: dm.text }]}>Agenda livre por enquanto</Text>
              <Text style={[styles.appointmentMeta, { color: dm.sub }]}>
                Cadastre seus atendimentos para manter sua rotina organizada.
              </Text>
              <TouchableOpacity
                onPress={() => onNavigate('appointments')}
                style={styles.linkButton}
              >
                <Text style={[styles.linkText, { color: '#00b690' }]}>Ver agenda</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  topTextCol: { flex: 1, gap: 2 },
  greetingTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  greetingSub: { fontSize: 12, fontWeight: '600' },
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
  body: { padding: 18, gap: 14 },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
  },
  setupTitle: { fontSize: 13, fontWeight: '800' },
  setupSub: { fontSize: 11, lineHeight: 15 },
  setupLink: { fontSize: 12, fontWeight: '800', color: COLORS.secondary },
  hero: { borderRadius: 24, padding: 20, gap: 8 },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  heroCopy: { color: 'rgba(255,255,255,.9)', fontSize: 13, lineHeight: 18 },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 6,
  },
  heroButtonText: { color: '#264d8c', fontSize: 13, fontWeight: '800' },
  qrCard: {
    borderWidth: 2,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  qrHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrTitle: { fontSize: 15, fontWeight: '800' },
  qrSubtitle: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  qrImageContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  codeBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 182, 144, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 182, 144, 0.25)',
  },
  codeLabel: { fontSize: 10, color: '#00b690', fontWeight: '700' },
  codeText: { fontSize: 16, fontWeight: '900', color: '#264d8c', letterSpacing: 1 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  copyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, gap: 6 },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11 },
  patientsCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  patientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeaderNoMargin: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  patientList: { gap: 8 },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  patientName: { fontSize: 13, fontWeight: '800' },
  patientRole: { fontSize: 11 },
  chatPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  chatPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  appointmentCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  newApptChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800' },
  appointmentInfo: { gap: 4 },
  soonBadge: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  emptyAppointment: { gap: 4 },
  appointmentName: { fontSize: 14, fontWeight: '800' },
  emptyTitle: { fontSize: 13, fontWeight: '700' },
  appointmentMeta: { fontSize: 12, lineHeight: 16 },
  linkButton: { alignSelf: 'flex-start', paddingTop: 4 },
  linkText: { fontSize: 12, fontWeight: '800' },
});
