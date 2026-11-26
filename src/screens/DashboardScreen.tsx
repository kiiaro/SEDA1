import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import {
  CheckCircle2,
  AlertTriangle,
  Share2,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { HistogramChart } from '../components/HistogramChart';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';

interface DashboardScreenProps {
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ records, onBack, dm }) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'glucose' | 'frequency'>('pressure');

  const recentRecords = records.filter((r) => r.measurement !== 'glucose').slice(0, 7).reverse();
  const recentGlucoseRecords = records.filter((r) => r.measurement !== 'pressure').slice(0, 7).reverse();
  const pressureRecords = records.filter((r) => r.measurement !== 'glucose');
  const glucoseRecords = records.filter((r) => r.measurement !== 'pressure');
  const average = (values: number[]) => values.length ? String(Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)) : '—';
  const dailyCounts = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - index));
    const date = day.toLocaleDateString('sv-SE');
    return { label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), date, count: records.filter((r) => r.recordedAt && new Date(r.recordedAt).toLocaleDateString('sv-SE') === date).length };
  });
  const pressureHistogramData = recentRecords.map((r) => ({
    label: r.date.split(',')[0].replace('Ontem', 'Ont.').replace('Anteontem', 'Ant.'),
    value: r.systolic,
    secondaryValue: r.diastolic,
    displayValue: `${r.systolic}/${r.diastolic} mmHg`,
  }));

  const glucoseHistogramData = recentGlucoseRecords.map((r) => ({
    label: r.date.split(',')[0].replace('Ontem', 'Ont.').replace('Anteontem', 'Ant.'),
    value: r.glucose,
    displayValue: `${r.glucose} mg/dL`,
  }));

  const frequencyHistogramData = dailyCounts.map((day) => ({
    label: day.label,
    value: day.count,
    displayValue: `${day.count} ${day.count === 1 ? 'medição' : 'medições'}`,
  }));

  const handleShare = async () => {
    try {
      await Share.share({ message: `SEDA — resumo de medições\nPressão: ${pressureRecords.length} registros; média sistólica ${average(pressureRecords.map((r) => r.systolic))} mmHg.\nGlicemia: ${glucoseRecords.length} registros; média ${average(glucoseRecords.map((r) => r.glucose))} mg/dL.` });
    } catch { Alert.alert('Compartilhamento indisponível', 'Não foi possível abrir a opção de compartilhar.'); }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Painel Analítico"
        subtitle="Resumo baseado nas suas medições salvas"
        onBack={onBack}
        dm={dm}
        rightElement={
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={[styles.shareBtn, { backgroundColor: dm.card, borderColor: dm.border }]}
            accessibilityLabel="Compartilhar relatório"
          >
            <Share2 size={16} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.body}>
        {/* Tab Toggle */}
        <View
          style={[
            styles.tabsWrapper,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('pressure')}
            activeOpacity={0.7}
            style={[
              styles.tabBtn,
              activeTab === 'pressure' && { backgroundColor: COLORS.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'pressure' ? '#FFFFFF' : dm.sub },
              ]}
            >
              Pressão
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('glucose')}
            activeOpacity={0.7}
            style={[
              styles.tabBtn,
              activeTab === 'glucose' && { backgroundColor: COLORS.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'glucose' ? '#FFFFFF' : dm.sub },
              ]}
            >
              Glicemia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('frequency')}
            activeOpacity={0.7}
            style={[
              styles.tabBtn,
              activeTab === 'frequency' && { backgroundColor: COLORS.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'frequency' ? '#FFFFFF' : dm.sub },
              ]}
            >
              Frequência
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3 KPI Cards */}
        <FadeInItem delay={60}>
          <View style={styles.kpiRow}>
            {/* KPI 1 */}
            <View style={[styles.kpiCard, styles.kpiCard1]}>
              <Text style={styles.kpiLabel1}>Média Sist.</Text>
              <Text style={[styles.kpiVal, { color: dm.text }]}>{average(pressureRecords.map((r) => r.systolic))}</Text>
              <Text style={styles.kpiUnit}>mmHg</Text>
              <Text style={styles.kpiTrendText}>{pressureRecords.length} registros</Text>
            </View>

            {/* KPI 2 */}
            <View style={[styles.kpiCard, styles.kpiCard2]}>
              <Text style={styles.kpiLabel2}>Glicose Média</Text>
              <Text style={[styles.kpiVal, { color: dm.text }]}>{average(glucoseRecords.map((r) => r.glucose))}</Text>
              <Text style={styles.kpiUnit}>mg/dL</Text>
              <Text style={styles.kpiTrendText}>{glucoseRecords.length} registros</Text>
            </View>

            {/* KPI 3 */}
            <View style={[styles.kpiCard, styles.kpiCard3]}>
              <Text style={styles.kpiLabel3}>Pulso Médio</Text>
              <Text style={[styles.kpiVal, { color: dm.text }]}>{average(records.filter((r) => r.hasHeartRate).map((r) => r.heartRate))}</Text>
              <Text style={styles.kpiUnit}>bpm</Text>
              <Text style={[styles.kpiTrendText, { color: COLORS.secondary }]}>{records.filter((r) => r.hasHeartRate).length} registros</Text>
            </View>
          </View>
        </FadeInItem>

        {/* Tab 1: Pressão */}
        {activeTab === 'pressure' && (
          <View
            style={[
              styles.card,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: dm.sub }]}>
                Sistólica vs Diastólica
              </Text>
              <Text style={styles.targetLabel}>Histórico recente</Text>
            </View>

            <HistogramChart
              data={pressureHistogramData}
              minVal={50}
              maxVal={170}
              unit="mmHg"
              primaryColor={COLORS.secondary}
              secondaryColor={COLORS.primary}
              primaryLabel="Sistólica"
              secondaryLabel="Diastólica"
              dm={dm}
            />
          </View>
        )}

        {/* Tab 2: Glicemia */}
        {activeTab === 'glucose' && (
          <View
            style={[
              styles.card,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: dm.sub }]}>
                Oscilação Glicêmica
              </Text>
              <Text style={styles.targetLabel}>Medições salvas</Text>
            </View>

            <HistogramChart
              data={glucoseHistogramData}
              minVal={60}
              maxVal={190}
              unit="mg/dL"
              primaryColor={COLORS.primary}
              dm={dm}
            />
          </View>
        )}

        {/* Tab 3: Frequência */}
        {activeTab === 'frequency' && (
          <View
            style={[
              styles.card,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: dm.sub }]}>
                Aferições Diárias
              </Text>
              <Text style={[styles.targetLabel, { color: COLORS.secondary }]}>Últimos 7 dias</Text>
            </View>

            <HistogramChart
              data={frequencyHistogramData}
              minVal={0}
              maxVal={Math.max(4, ...dailyCounts.map((d) => d.count))}
              unit="medições"
              primaryColor={COLORS.secondary}
              dm={dm}
            />
          </View>
        )}

        {/* Weekly Summary */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.chartTitle, { color: dm.sub, marginBottom: 8 }]}>
            Registros nos últimos 7 dias
          </Text>

          {dailyCounts.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.summaryRow,
                idx < dailyCounts.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: dm.border,
                },
              ]}
            >
              <View style={styles.summaryLeft}>
                {item.count > 0 ? (
                  <CheckCircle2 size={16} color={COLORS.primary} />
                ) : (
                  <AlertTriangle size={16} color={COLORS.secondary} />
                )}
                <Text style={[styles.summaryDay, { color: dm.text }]}>
                  {item.label} • {item.date}
                </Text>
              </View>
              <Text style={styles.summaryText} numberOfLines={1}>
                {item.count} {item.count === 1 ? 'medição' : 'medições'}
              </Text>
            </View>
          ))}
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
    paddingBottom: 28,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 18,
    gap: 14,
  },
  tabsWrapper: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  kpiCard1: {
    backgroundColor: 'rgba(38, 77, 140, 0.08)',
    borderColor: 'rgba(38, 77, 140, 0.22)',
  },
  kpiCard2: {
    backgroundColor: 'rgba(0, 182, 144, 0.08)',
    borderColor: 'rgba(0, 182, 144, 0.22)',
  },
  kpiCard3: {
    backgroundColor: 'rgba(38, 77, 140, 0.06)',
    borderColor: 'rgba(38, 77, 140, 0.18)',
  },
  kpiLabel1: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  kpiLabel2: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  kpiLabel3: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  kpiVal: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  kpiUnit: {
    fontSize: 9,
    color: '#94A3B8',
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  kpiTrendText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSys: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  legendDia: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  xAxisText: {
    fontSize: 9,
    fontWeight: '600',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    gap: 6,
  },
  barItem: {
    width: 22,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDay: {
    fontSize: 12,
    fontWeight: '800',
  },
  summaryText: {
    fontSize: 11,
    color: '#94A3B8',
    maxWidth: 150,
  },
});
