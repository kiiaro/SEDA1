import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Calendar, HeartPulse, Droplets, Activity, Plus } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord, Screen } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';

interface HistoryScreenProps {
  records: HealthRecord[];
  onNavigate: (screen: Screen) => void;
  onOpenQuickRegister?: () => void;
  dm: DarkModeTheme;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ records, onNavigate, onOpenQuickRegister, dm }) => {
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '15d' | '30d' | '3m'>('7d');

  const filterOptions: { id: '7d' | '15d' | '30d' | '3m'; label: string }[] = [
    { id: '7d', label: '7 dias' },
    { id: '15d', label: '15 dias' },
    { id: '30d', label: '30 dias' },
    { id: '3m', label: '3 meses' },
  ];
  const days = { '7d': 7, '15d': 15, '30d': 30, '3m': 90 }[filterPeriod];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const visibleRecords = records.filter((rec) => rec.recordedAt && new Date(rec.recordedAt).getTime() >= cutoff);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Minimalist Top Header */}
      <FadeInItem delay={0}>
        <View style={[styles.header, { borderBottomColor: dm.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }]}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.titleRow}>
                <View style={styles.accentDot} />
                <Text style={[styles.headerTitle, { color: dm.text }]}>Histórico de Saúde</Text>
              </View>
              <Text style={[styles.headerSub, { color: dm.sub }]}>Registros diários e aferições</Text>
            </View>
            <TouchableOpacity
              onPress={() => (onOpenQuickRegister ? onOpenQuickRegister() : onNavigate('pressure'))}
              activeOpacity={0.85}
              style={styles.newBtn}
              accessibilityRole="button"
              accessibilityLabel="Novo registro"
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.newBtnText}>Novo</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Filter Control */}
          <View style={[styles.filtersRow, { backgroundColor: dm.card, borderColor: dm.border }]}>
            {filterOptions.map((opt) => {
              const isSelected = filterPeriod === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setFilterPeriod(opt.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.filterPill,
                    isSelected && { backgroundColor: COLORS.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#FFFFFF' : dm.sub },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </FadeInItem>

      {/* Records List */}
      <View style={styles.recordsList}>
        {visibleRecords.length === 0 && (
          <FadeInItem delay={60}>
            <View style={[styles.recordCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
              <Text style={[styles.recordDate, { color: dm.text }]}>Nenhuma medição neste período</Text>
              <Text style={[styles.recordTime, { color: dm.sub, marginTop: 4 }]}>
                Registre uma medição para acompanhar seu histórico.
              </Text>
            </View>
          </FadeInItem>
        )}
        {visibleRecords.map((rec, index) => (
          <FadeInItem key={rec.id} delay={Math.min(index * 45, 240)}>
            <View
              style={[
                styles.recordCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              {/* Card Header */}
              <View style={styles.recordCardHeader}>
                <View style={styles.dateWrapper}>
                  <Calendar size={14} color={dm.sub} />
                  <Text style={[styles.recordDate, { color: dm.text }]}>
                    {rec.date}
                  </Text>
                  <Text style={[styles.recordTime, { color: dm.sub }]}>
                    • {rec.time}
                  </Text>
                </View>
                <StatusBadge status={rec.status} />
              </View>

              {/* Metric Mini Cards (#00b690 & #264d8c) */}
              <View style={styles.metricsRow}>
                {/* Pressão */}
                {rec.measurement !== 'glucose' && (
                  <View style={[styles.metricBox, styles.pressBox]}>
                    <View style={styles.metricLabelRow}>
                      <HeartPulse size={12} color="#264d8c" />
                      <Text style={styles.pressLabel}>Pressão</Text>
                    </View>
                    <Text style={[styles.metricVal, { color: dm.text }]}>
                      {rec.systolic}/{rec.diastolic}
                    </Text>
                    <Text style={styles.metricUnit}>mmHg</Text>
                  </View>
                )}

                {/* Glicemia */}
                {rec.measurement !== 'pressure' && (
                  <View style={[styles.metricBox, styles.glucBox]}>
                    <View style={styles.metricLabelRow}>
                      <Droplets size={12} color="#00b690" />
                      <Text style={styles.glucLabel}>Glicose</Text>
                    </View>
                    <Text style={[styles.metricVal, { color: dm.text }]}>{rec.glucose}</Text>
                    <Text style={styles.metricUnit}>mg/dL</Text>
                  </View>
                )}

                {/* Pulso */}
                {rec.measurement !== 'glucose' && rec.hasHeartRate && (
                  <View style={[styles.metricBox, styles.pulseBox]}>
                    <View style={styles.metricLabelRow}>
                      <Activity size={12} color="#00b690" />
                      <Text style={styles.pulseLabel}>Pulso</Text>
                    </View>
                    <Text style={[styles.metricVal, { color: dm.text }]}>{rec.heartRate}</Text>
                    <Text style={styles.metricUnit}>bpm</Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              {rec.notes ? (
                <View style={[styles.notesBox, { borderLeftColor: '#00b690' }]}>
                  <Text style={[styles.notesText, { color: dm.sub }]}>
                    "{rec.notes}"
                  </Text>
                </View>
              ) : null}
            </View>
          </FadeInItem>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 16,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  filtersRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recordsList: {
    padding: 18,
    gap: 12,
  },
  recordCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  recordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordDate: {
    fontSize: 12,
    fontWeight: '800',
  },
  recordTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressBox: {
    backgroundColor: 'rgba(38, 77, 140, 0.08)',
    borderColor: 'rgba(38, 77, 140, 0.22)',
  },
  glucBox: {
    backgroundColor: 'rgba(0, 182, 144, 0.08)',
    borderColor: 'rgba(0, 182, 144, 0.22)',
  },
  pulseBox: {
    backgroundColor: 'rgba(0, 182, 144, 0.06)',
    borderColor: 'rgba(0, 182, 144, 0.18)',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  pressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#264d8c',
  },
  glucLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00b690',
  },
  pulseLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00b690',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  metricUnit: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  notesBox: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
