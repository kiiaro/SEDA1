import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle as SvgCircle, Text as SvgText } from 'react-native-svg';
import {
  Bell,
  PhoneCall,
  HeartPulse,
  Droplets,
  Mic,
  BarChart3,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  Stethoscope,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Appointment, DarkModeTheme, HealthRecord, Screen, UserProfile } from '../types';
import { HealthRing } from '../components/HealthRing';

interface HomeScreenProps {
  user: UserProfile;
  pressSys: number;
  pressDia: number;
  heartRate: number;
  glucose: number;
  appointments: Appointment[];
  records: HealthRecord[];
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
  unreadAlertsCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  pressSys,
  pressDia,
  heartRate,
  glucose,
  appointments,
  records,
  onNavigate,
  dm,
  unreadAlertsCount,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getSystolicStatusColor = (val: number) => {
    if (val >= 140) return COLORS.danger;
    if (val >= 130) return COLORS.warn;
    return COLORS.success;
  };

  const getGlucoseStatusColor = (val: number) => {
    if (val > 126) return COLORS.danger;
    if (val < 70) return COLORS.primary;
    return COLORS.accent;
  };

  const systolicColor = getSystolicStatusColor(pressSys);
  const glucoseColor = getGlucoseStatusColor(glucose);

  const nextAppt = appointments
    .filter((a) => a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const getApptDaysText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Hoje', bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626' };
    if (diffDays === 1) return { label: 'Amanhã', bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' };
    if (diffDays > 1)
      return {
        label: `Em ${diffDays}d`,
        bg: 'rgba(94, 143, 192, 0.18)',
        text: COLORS.primary,
      };
    return { label: 'Agendado', bg: 'rgba(47, 191, 113, 0.18)', text: '#16a34a' };
  };

  // SVG Chart points calculation for 7 days
  const recentRecords = [...records].slice(0, 7).reverse();
  const chartWidth = 300;
  const chartHeight = 85;
  const minVal = 100;
  const maxVal = 160;

  const points = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 20) + 10;
    const norm = (r.systolic - minVal) / (maxVal - minVal);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.systolic, date: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.') };
  });

  const pathD = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${chartHeight} L ${points[0].x},${chartHeight} Z`
    : '';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={['#1E3A5F', '#3D6E9F', '#7CC9BE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.topRow}>
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => onNavigate('alerts')}
              activeOpacity={0.7}
              style={styles.alertBtn}
              accessibilityLabel="Alertas"
            >
              <Bell size={20} color="#FFFFFF" />
              {unreadAlertsCount > 0 && <View style={styles.alertDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('emergency')}
              activeOpacity={0.8}
              style={styles.emergencyBtn}
              accessibilityLabel="Emergência SAMU"
            >
              <PhoneCall size={15} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.emergencyBtnText}>SOS 192</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vitals Glass Strip */}
        <View style={styles.vitalsStrip}>
          <View style={[styles.vitalItem, styles.vitalDivider]}>
            <Text style={styles.vitalLabel}>Pressão</Text>
            <Text style={styles.vitalValue}>
              {pressSys}/{pressDia}
            </Text>
            <Text style={styles.vitalUnit}>mmHg</Text>
          </View>

          <View style={[styles.vitalItem, styles.vitalDivider]}>
            <Text style={styles.vitalLabel}>Glicemia</Text>
            <Text style={styles.vitalValue}>{glucose}</Text>
            <Text style={styles.vitalUnit}>mg/dL</Text>
          </View>

          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>Remédios</Text>
            <Text style={[styles.vitalValue, { color: '#86EFAC' }]}>3 de 3</Text>
            <Text style={styles.vitalUnit}>100% em dia</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Body */}
      <View style={styles.body}>
        {/* Rings Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: dm.sub }]}>
              Medições em Tempo Real
            </Text>
            <TouchableOpacity
              onPress={() => onNavigate('history')}
              style={styles.linkRow}
            >
              <Text style={[styles.linkText, { color: COLORS.primary }]}>
                Histórico
              </Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.ringsRow}>
            <TouchableOpacity
              onPress={() => onNavigate('pressure')}
              activeOpacity={0.7}
              style={styles.ringItem}
            >
              <HealthRing
                value={pressSys}
                max={200}
                color={systolicColor}
                size={82}
                stroke={7}
                unit="mmHg"
                label="Sistólica"
              />
              <Text style={[styles.ringTitle, { color: dm.text }]}>Pressão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('glucose')}
              activeOpacity={0.7}
              style={styles.ringItem}
            >
              <HealthRing
                value={glucose}
                max={250}
                color={glucoseColor}
                size={82}
                stroke={7}
                unit="mg/dL"
                label="Glicose"
              />
              <Text style={[styles.ringTitle, { color: dm.text }]}>Glicemia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('pressure')}
              activeOpacity={0.7}
              style={styles.ringItem}
            >
              <HealthRing
                value={heartRate}
                max={150}
                color={COLORS.secondary}
                size={82}
                stroke={7}
                unit="bpm"
                label="Pulso"
              />
              <Text style={[styles.ringTitle, { color: dm.text }]}>Batimentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View>
          <Text style={[styles.sectionTitle, styles.gridTitle, { color: dm.sub }]}>
            Ações Rápidas
          </Text>

          <View style={styles.grid}>
            {/* Pressão */}
            <TouchableOpacity
              onPress={() => onNavigate('pressure')}
              activeOpacity={0.7}
              style={[
                styles.gridCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View
                style={[
                  styles.gridIconBox,
                  { backgroundColor: `${COLORS.danger}18` },
                ]}
              >
                <HeartPulse size={22} color={COLORS.danger} strokeWidth={2.4} />
              </View>
              <Text style={[styles.gridCardTitle, { color: dm.text }]}>Pressão</Text>
              <Text style={styles.gridCardSub}>Aferir agora</Text>
            </TouchableOpacity>

            {/* Glicemia */}
            <TouchableOpacity
              onPress={() => onNavigate('glucose')}
              activeOpacity={0.7}
              style={[
                styles.gridCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View
                style={[
                  styles.gridIconBox,
                  { backgroundColor: `${COLORS.accent}18` },
                ]}
              >
                <Droplets size={22} color={COLORS.accent} strokeWidth={2.4} />
              </View>
              <Text style={[styles.gridCardTitle, { color: dm.text }]}>Glicemia</Text>
              <Text style={styles.gridCardSub}>Registrar</Text>
            </TouchableOpacity>

            {/* Por Voz */}
            <TouchableOpacity
              onPress={() => onNavigate('voice')}
              activeOpacity={0.7}
              style={[
                styles.gridCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View
                style={[
                  styles.gridIconBox,
                  { backgroundColor: `${COLORS.purple}18` },
                ]}
              >
                <Mic size={22} color={COLORS.purple} strokeWidth={2.4} />
              </View>
              <Text style={[styles.gridCardTitle, { color: dm.text }]}>Por Voz</Text>
              <Text style={styles.gridCardSub}>Falar dados</Text>
            </TouchableOpacity>

            {/* Gráficos */}
            <TouchableOpacity
              onPress={() => onNavigate('dashboard')}
              activeOpacity={0.7}
              style={[
                styles.gridCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View
                style={[
                  styles.gridIconBox,
                  { backgroundColor: `${COLORS.primary}18` },
                ]}
              >
                <BarChart3 size={22} color={COLORS.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.gridCardTitle, { color: dm.text }]}>Gráficos</Text>
              <Text style={styles.gridCardSub}>Tendências</Text>
            </TouchableOpacity>

            {/* Cuidadores */}
            <TouchableOpacity
              onPress={() => onNavigate('family')}
              activeOpacity={0.7}
              style={[
                styles.gridCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View
                style={[
                  styles.gridIconBox,
                  { backgroundColor: `${COLORS.secondary}25` },
                ]}
              >
                <Users size={22} color="#0F766E" strokeWidth={2.4} />
              </View>
              <Text style={[styles.gridCardTitle, { color: dm.text }]}>Cuidadores</Text>
              <Text style={styles.gridCardSub}>Rede SUS</Text>
            </TouchableOpacity>

            {/* Consultas */}
            <TouchableOpacity
              onPress={() => onNavigate('appointments')}
              activeOpacity={0.7}
              style={[
                styles.gridCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View
                style={[
                  styles.gridIconBox,
                  { backgroundColor: `${COLORS.warn}20` },
                ]}
              >
                <Calendar size={22} color="#B45309" strokeWidth={2.4} />
              </View>
              <Text style={[styles.gridCardTitle, { color: dm.text }]}>Consultas</Text>
              <Text style={styles.gridCardSub}>Agendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Appointment */}
        {nextAppt && (
          <TouchableOpacity
            onPress={() => onNavigate('appointments')}
            activeOpacity={0.8}
            style={[
              styles.card,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.apptHeaderLeft}>
                <View
                  style={[
                    styles.apptIconBox,
                    { backgroundColor: `${COLORS.primary}18` },
                  ]}
                >
                  <Stethoscope size={18} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                  Próxima Consulta SUS
                </Text>
              </View>
              {(() => {
                const daysBadge = getApptDaysText(nextAppt.date);
                return (
                  <View
                    style={[
                      styles.daysBadge,
                      { backgroundColor: daysBadge.bg },
                    ]}
                  >
                    <Text
                      style={[styles.daysBadgeText, { color: daysBadge.text }]}
                    >
                      {daysBadge.label}
                    </Text>
                  </View>
                );
              })()}
            </View>

            <View style={styles.apptBody}>
              <Text style={[styles.doctorName, { color: dm.text }]}>
                {nextAppt.doctor}
              </Text>
              <Text style={[styles.doctorSpecialty, { color: dm.sub }]}>
                {nextAppt.specialty} • {nextAppt.time}
              </Text>
              <Text style={styles.doctorLocation} numberOfLines={1}>
                📍 {nextAppt.location || 'Teleconsulta Conecte SUS'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 7-Day Trend Chart */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                Evolução da Pressão (7 dias)
              </Text>
              <Text style={styles.chartSub}>Média Sistólica: 127 mmHg</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={14} color="#16A34A" />
              <Text style={styles.trendText}>-4 mmHg</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <Defs>
                <SvgLinearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                  <Stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.0} />
                </SvgLinearGradient>
              </Defs>

              {areaD ? <Path d={areaD} fill="url(#sysGradient)" /> : null}
              {pathD ? (
                <Path
                  d={pathD}
                  fill="none"
                  stroke={COLORS.primary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {points.map((p, idx) => (
                <SvgCircle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={COLORS.primary}
                  strokeWidth="2.5"
                />
              ))}
            </Svg>

            {/* X-axis labels */}
            <View style={styles.xAxisRow}>
              {points.map((p, idx) => (
                <Text key={idx} style={[styles.xAxisLabel, { color: dm.sub }]}>
                  {p.date}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingWrapper: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  alertDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#E45454',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  vitalsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  vitalItem: {
    flex: 1,
    alignItems: 'center',
  },
  vitalDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.25)',
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
  vitalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
  },
  vitalUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -16,
    gap: 14,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  ringItem: {
    alignItems: 'center',
  },
  ringTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '31%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  gridIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridCardTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  gridCardSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  apptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apptIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  apptBody: {
    marginTop: 4,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '900',
  },
  doctorSpecialty: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  doctorLocation: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  chartSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  chartContainer: {
    marginTop: 8,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
});
