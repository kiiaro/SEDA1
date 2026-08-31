import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, HeartPulse, Droplets, Activity, Plus } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord, Screen } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface HistoryScreenProps {
  records: HealthRecord[];
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ records, onNavigate, dm }) => {
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '15d' | '30d' | '3m'>('7d');

  const filterOptions: { id: '7d' | '15d' | '30d' | '3m'; label: string }[] = [
    { id: '7d', label: '7 dias' },
    { id: '15d', label: '15 dias' },
    { id: '30d', label: '30 dias' },
    { id: '3m', label: '3 meses' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1E3A5F', '#3D6E9F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Histórico de Saúde</Text>
            <Text style={styles.headerSub}>Registros diários e aferições</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate('pressure')}
            activeOpacity={0.8}
            style={styles.newBtn}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newBtnText}>Novo</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filtersRow}>
          {filterOptions.map((opt) => {
            const isSelected = filterPeriod === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setFilterPeriod(opt.id)}
                activeOpacity={0.7}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.18)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? '#1E3A5F' : '#FFFFFF' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Records List */}
      <View style={styles.recordsList}>
        {records.map((rec) => (
          <View
            key={rec.id}
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

            {/* 3 Metric Mini Cards */}
            <View style={styles.metricsRow}>
              {/* Pressão */}
              <View style={[styles.metricBox, styles.pressBox]}>
                <View style={styles.metricLabelRow}>
                  <HeartPulse size={12} color="#0369A1" />
                  <Text style={styles.pressLabel}>Pressão</Text>
                </View>
                <Text style={styles.pressVal}>
                  {rec.systolic}/{rec.diastolic}
                </Text>
                <Text style={styles.metricUnit}>mmHg</Text>
              </View>

              {/* Glicemia */}
              <View style={[styles.metricBox, styles.glucBox]}>
                <View style={styles.metricLabelRow}>
                  <Droplets size={12} color="#B45309" />
                  <Text style={styles.glucLabel}>Glicose</Text>
                </View>
                <Text style={styles.glucVal}>{rec.glucose}</Text>
                <Text style={styles.metricUnit}>mg/dL</Text>
              </View>

              {/* Pulso */}
              <View style={[styles.metricBox, styles.pulseBox]}>
                <View style={styles.metricLabelRow}>
                  <Activity size={12} color="#047857" />
                  <Text style={styles.pulseLabel}>Pulso</Text>
                </View>
                <Text style={styles.pulseVal}>{rec.heartRate}</Text>
                <Text style={styles.metricUnit}>bpm</Text>
              </View>
            </View>

            {/* Notes */}
            {rec.notes ? (
              <View style={styles.notesBox}>
                <Text style={[styles.notesText, { color: dm.sub }]}>
                  "{rec.notes}"
                </Text>
              </View>
            ) : null}
          </View>
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
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  recordsList: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
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
    backgroundColor: 'rgba(94, 143, 192, 0.12)',
    borderColor: 'rgba(94, 143, 192, 0.25)',
  },
  glucBox: {
    backgroundColor: 'rgba(244, 183, 64, 0.14)',
    borderColor: 'rgba(244, 183, 64, 0.3)',
  },
  pulseBox: {
    backgroundColor: 'rgba(89, 185, 138, 0.14)',
    borderColor: 'rgba(89, 185, 138, 0.3)',
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
    color: '#0369A1',
  },
  glucLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  pulseLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  pressVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0C4A6E',
  },
  glucVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#78350F',
  },
  pulseVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#064E3B',
  },
  metricUnit: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  notesBox: {
    marginTop: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#CBD5E1',
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
