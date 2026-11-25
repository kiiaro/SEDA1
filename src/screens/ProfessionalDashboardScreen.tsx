import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, MessageCircle, Plus, ShieldCheck, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackHeader } from '../components/BackHeader';
import { MotionButton as TouchableOpacity } from '../components/Motion';
import { COLORS } from '../constants/theme';
import { Appointment, DarkModeTheme, ProfessionalConnection, Screen, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  connections: ProfessionalConnection[];
  appointments: Appointment[];
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const ProfessionalDashboardScreen: React.FC<Props> = ({ user, connections, appointments, onNavigate, dm }) => {
  const nextAppointment = appointments
    .filter((item) => !['cancelled', 'completed'].includes(item.status) && item.date >= new Date().toLocaleDateString('sv-SE'))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];

  return (
    <ScrollView style={[styles.container, { backgroundColor: dm.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackHeader title="Painel profissional" subtitle={`Olá, ${user.name.split(' ')[0]}`} onBack={() => onNavigate('profile')} bgGradient={['#253E4C', '#355D6E', '#47778D']} />

      <View style={styles.body}>
        <LinearGradient colors={['#253E4C', '#355D6E', '#47778D']} style={styles.hero}>
          <View style={styles.heroIcon}><ShieldCheck size={22} color="#FFFFFF" /></View>
          <Text style={styles.heroTitle}>Seu cuidado, em um só lugar</Text>
          <Text style={styles.heroCopy}>Acompanhe sua rede de pacientes e converse com quem aceitou seu convite.</Text>
          <TouchableOpacity style={styles.heroButton} onPress={() => onNavigate('connections')}>
            <Plus size={17} color={COLORS.primaryDk} />
            <Text style={styles.heroButtonText}>Convidar paciente</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Users size={18} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: dm.text }]}>{connections.length}</Text>
            <Text style={[styles.statLabel, { color: dm.sub }]}>Pacientes conectados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <CalendarDays size={18} color={COLORS.accent} />
            <Text style={[styles.statValue, { color: dm.text }]}>{appointments.filter((a) => !['cancelled', 'completed'].includes(a.status)).length}</Text>
            <Text style={[styles.statLabel, { color: dm.sub }]}>Consultas ativas</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.actionCard, { backgroundColor: dm.card, borderColor: dm.border }]} onPress={() => onNavigate('connections')}>
          <View style={[styles.actionIcon, { backgroundColor: '#EAF2F8' }]}><Users size={19} color={COLORS.primaryDk} /></View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: dm.text }]}>Pacientes e conversas</Text>
            <Text style={[styles.actionSubtitle, { color: dm.sub }]}>Gerencie vínculos e abra o chat ao vivo</Text>
          </View>
          <MessageCircle size={19} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={[styles.appointmentCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
          <View style={styles.sectionHeader}>
            <CalendarDays size={18} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: dm.text }]}>Próximo atendimento</Text>
          </View>
          {nextAppointment ? (
            <View style={styles.appointmentInfo}>
              <Text style={[styles.appointmentName, { color: dm.text }]}>{nextAppointment.doctor}</Text>
              <Text style={[styles.appointmentMeta, { color: dm.sub }]}>{nextAppointment.date} · {nextAppointment.time} · {nextAppointment.type === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}</Text>
              <TouchableOpacity onPress={() => onNavigate('appointments')} style={styles.linkButton}><Text style={styles.linkText}>Abrir agenda</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyAppointment}>
              <Text style={[styles.emptyTitle, { color: dm.text }]}>Agenda livre por enquanto</Text>
              <Text style={[styles.appointmentMeta, { color: dm.sub }]}>Cadastre seus atendimentos para manter sua rotina organizada.</Text>
              <TouchableOpacity onPress={() => onNavigate('appointments')} style={styles.linkButton}><Text style={styles.linkText}>Ver agenda</Text></TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={[styles.note, { color: dm.sub }]}>Os pacientes só aparecem aqui depois de aceitar seu código de conexão. A conversa fica restrita às duas contas vinculadas.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { paddingBottom: 24 }, body: { padding: 16, gap: 12 },
  hero: { borderRadius: 22, padding: 18, gap: 8 }, heroIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' }, heroCopy: { color: 'rgba(255,255,255,.88)', fontSize: 12, lineHeight: 18 },
  heroButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFF', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, marginTop: 4 }, heroButtonText: { color: COLORS.primaryDk, fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10 }, statCard: { flex: 1, padding: 14, borderRadius: 18, borderWidth: 1, gap: 5 }, statValue: { fontSize: 25, fontWeight: '900' }, statLabel: { fontSize: 11, lineHeight: 15 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 18, padding: 14 }, actionIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, actionText: { flex: 1, gap: 3 }, actionTitle: { fontSize: 13, fontWeight: '800' }, actionSubtitle: { fontSize: 11, lineHeight: 15 },
  appointmentCard: { borderWidth: 1, borderRadius: 18, padding: 16 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }, sectionTitle: { fontSize: 13, fontWeight: '800' }, appointmentInfo: { gap: 5 }, emptyAppointment: { gap: 5 }, appointmentName: { fontSize: 14, fontWeight: '800' }, emptyTitle: { fontSize: 13, fontWeight: '700' }, appointmentMeta: { fontSize: 11, lineHeight: 16 }, linkButton: { alignSelf: 'flex-start', paddingTop: 4 }, linkText: { fontSize: 12, fontWeight: '800', color: COLORS.primaryDk }, note: { fontSize: 10, lineHeight: 15, paddingHorizontal: 2 },
});
