import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import {
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Share2,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';

interface DashboardScreenProps {
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ records, onBack, dm }) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'glucose' | 'frequency'>('pressure');

  const recentRecords = [...records].slice(0, 7).reverse();
  const chartWidth = 300;
  const chartHeight = 110;

  // Pressure SVG points
  const sysPoints = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 24) + 12;
    const norm = (r.systolic - 50) / (160 - 50);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.systolic, date: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.') };
  });

  const diaPoints = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 24) + 12;
    const norm = (r.diastolic - 50) / (160 - 50);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.diastolic };
  });

  const sysPathD = sysPoints.length > 0 ? `M ${sysPoints.map((p) => `${p.x},${p.y}`).join(' L ')}` : '';
  const diaPathD = diaPoints.length > 0 ? `M ${diaPoints.map((p) => `${p.x},${p.y}`).join(' L ')}` : '';

  // Glucose SVG points
  const glucPoints = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 24) + 12;
    const norm = (r.glucose - 60) / (180 - 60);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.glucose, date: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.') };
  });

  const glucPathD = glucPoints.length > 0 ? `M ${glucPoints.map((p) => `${p.x},${p.y}`).join(' L ')}` : '';
  const glucAreaD = glucPoints.length > 0 ? `${glucPathD} L ${glucPoints[glucPoints.length - 1].x},${chartHeight} L ${glucPoints[0].x},${chartHeight} Z` : '';

  const weeklySummary = [
    { day: 'Segunda-feira', status: 'ok', text: 'Todas medições na meta' },
    { day: 'Terça-feira', status: 'ok', text: 'Glicemia e pressão excelentes' },
    { day: 'Quarta-feira', status: 'warn', text: 'Pressão 142/92 (pós-almoço)' },
    { day: 'Quinta-feira', status: 'ok', text: 'Caminhada + medicação no horário' },
    { day: 'Sexta-feira', status: 'ok', text: 'Controle contínuo estável' },
    { day: 'Sábado', status: 'warn', text: 'Glicemia 138 mg/dL' },
    { day: 'Domingo (Hoje)', status: 'ok', text: 'Aferição matinal concluída' },
  ];

  const handleShare = () => {
    Alert.alert(
      'Exportar Relatório',
      'Relatório clínico exportado para PDF (Padrão SUS/UBS) pronto para compartilhar!'
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Painel Analítico"
        subtitle="Métricas, gráficos e relatório clínico"
        onBack={onBack}
        bgGradient={['#1E3A5F', '#3D6E9F']}
        rightElement={
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={styles.shareBtn}
            accessibilityLabel="Compartilhar relatório"
          >
            <Share2 size={16} color="#FFFFFF" />
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
        <View style={styles.kpiRow}>
          {/* KPI 1 */}
          <View style={[styles.kpiCard, styles.kpiCard1]}>
            <Text style={styles.kpiLabel1}>Média Sist.</Text>
            <Text style={styles.kpiVal1}>126</Text>
            <Text style={styles.kpiUnit}>mmHg</Text>
            <View style={styles.kpiTrend}>
              <TrendingDown size={12} color="#16A34A" />
              <Text style={styles.kpiTrendText}>-3%</Text>
            </View>
          </View>

          {/* KPI 2 */}
          <View style={[styles.kpiCard, styles.kpiCard2]}>
            <Text style={styles.kpiLabel2}>Glicose Média</Text>
            <Text style={styles.kpiVal2}>112</Text>
            <Text style={styles.kpiUnit}>mg/dL</Text>
            <View style={styles.kpiTrend}>
              <TrendingDown size={12} color="#16A34A" />
              <Text style={styles.kpiTrendText}>-5%</Text>
            </View>
          </View>

          {/* KPI 3 */}
          <View style={[styles.kpiCard, styles.kpiCard3]}>
            <Text style={styles.kpiLabel3}>Pulso Médio</Text>
            <Text style={styles.kpiVal3}>73</Text>
            <Text style={styles.kpiUnit}>bpm</Text>
            <View style={styles.kpiTrend}>
              <TrendingUp size={12} color="#4F46E5" />
              <Text style={[styles.kpiTrendText, { color: '#4F46E5' }]}>Normal</Text>
            </View>
          </View>
        </View>

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
              <View style={styles.chartLegend}>
                <Text style={styles.legendSys}>● Sistólica</Text>
                <Text style={styles.legendDia}>● Diastólica</Text>
              </View>
            </View>

            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <SvgLine x1="0" y1="20" x2={chartWidth} y2="20" stroke={dm.border} strokeDasharray="3,3" />
              <SvgLine x1="0" y1="60" x2={chartWidth} y2="60" stroke={dm.border} strokeDasharray="3,3" />

              {sysPathD ? <Path d={sysPathD} fill="none" stroke={COLORS.primary} strokeWidth="3" /> : null}
              {diaPathD ? <Path d={diaPathD} fill="none" stroke={COLORS.secondary} strokeWidth="3" /> : null}

              {sysPoints.map((p, idx) => (
                <SvgCircle key={`s-${idx}`} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke={COLORS.primary} strokeWidth="2" />
              ))}
              {diaPoints.map((p, idx) => (
                <SvgCircle key={`d-${idx}`} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke={COLORS.secondary} strokeWidth="2" />
              ))}
            </Svg>

            <View style={styles.xAxisRow}>
              {sysPoints.map((p, idx) => (
                <Text key={idx} style={[styles.xAxisText, { color: dm.sub }]}>{p.date}</Text>
              ))}
            </View>
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
              <Text style={styles.targetLabel}>Meta: 70 - 126 mg/dL</Text>
            </View>

            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <Defs>
                <SvgLinearGradient id="dashGlucGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="5%" stopColor={COLORS.warn} stopOpacity={0.4} />
                  <Stop offset="95%" stopColor={COLORS.warn} stopOpacity={0.0} />
                </SvgLinearGradient>
              </Defs>
              <SvgLine x1="0" y1="20" x2={chartWidth} y2="20" stroke={dm.border} strokeDasharray="3,3" />
              <SvgLine x1="0" y1="60" x2={chartWidth} y2="60" stroke={dm.border} strokeDasharray="3,3" />

              {glucAreaD ? <Path d={glucAreaD} fill="url(#dashGlucGrad)" /> : null}
              {glucPathD ? <Path d={glucPathD} fill="none" stroke={COLORS.warn} strokeWidth="3" /> : null}

              {glucPoints.map((p, idx) => (
                <SvgCircle key={idx} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke={COLORS.warn} strokeWidth="2" />
              ))}
            </Svg>

            <View style={styles.xAxisRow}>
              {glucPoints.map((p, idx) => (
                <Text key={idx} style={[styles.xAxisText, { color: dm.sub }]}>{p.date}</Text>
              ))}
            </View>
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
              <Text style={[styles.targetLabel, { color: '#4F46E5' }]}>Meta: 2 aferições/dia</Text>
            </View>

            <View style={styles.barChartContainer}>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'].map((day, i) => {
                const heightVal = 24 + i * 9;
                const isToday = i === 6;
                return (
                  <View key={day} style={styles.barColumn}>
                    <View
                      style={[
                        styles.barItem,
                        {
                          height: heightVal,
                          backgroundColor: isToday ? COLORS.primary : `${COLORS.primary}45`,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.barLabel,
                        { color: isToday ? COLORS.primary : dm.sub },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
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
            Resumo de Estabilidade Semanal
          </Text>

          {weeklySummary.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.summaryRow,
                idx < weeklySummary.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: dm.border,
                },
              ]}
            >
              <View style={styles.summaryLeft}>
                {item.status === 'ok' ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#D97706" />
                )}
                <Text style={[styles.summaryDay, { color: dm.text }]}>
                  {item.day}
                </Text>
              </View>
              <Text style={styles.summaryText} numberOfLines={1}>
                {item.text}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
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
    backgroundColor: 'rgba(94, 143, 192, 0.12)',
    borderColor: 'rgba(94, 143, 192, 0.25)',
  },
  kpiCard2: {
    backgroundColor: 'rgba(244, 183, 64, 0.12)',
    borderColor: 'rgba(244, 183, 64, 0.25)',
  },
  kpiCard3: {
    backgroundColor: 'rgba(107, 127, 212, 0.12)',
    borderColor: 'rgba(107, 127, 212, 0.25)',
  },
  kpiLabel1: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
  },
  kpiLabel2: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  kpiLabel3: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
  },
  kpiVal1: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0C4A6E',
    marginTop: 2,
  },
  kpiVal2: {
    fontSize: 16,
    fontWeight: '900',
    color: '#78350F',
    marginTop: 2,
  },
  kpiVal3: {
    fontSize: 16,
    fontWeight: '900',
    color: '#312E81',
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
    color: '#16A34A',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
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
    color: '#D97706',
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
