import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import { Heart, Activity, CheckCircle2, AlertTriangle, FileText } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { Stepper } from '../components/Stepper';

interface PressureScreenProps {
  pressSys: number;
  setPressSys: (val: number) => void;
  pressDia: number;
  setPressDia: (val: number) => void;
  heartRate: number;
  setHeartRate: (val: number) => void;
  onSaveRecord: (record: Partial<HealthRecord>) => void;
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const PressureScreen: React.FC<PressureScreenProps> = ({
  pressSys,
  setPressSys,
  pressDia,
  setPressDia,
  heartRate,
  setHeartRate,
  onSaveRecord,
  records,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const getStatusInfo = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) {
      return {
        level: 'danger',
        color: COLORS.danger,
        title: 'Pressão Elevada (Hipertensão)',
        desc: 'Recomenda-se repousar sentado por 15 minutos e realizar nova aferição.',
        icon: AlertTriangle,
      };
    }
    if (sys >= 130 || dia >= 85) {
      return {
        level: 'warn',
        color: COLORS.warn,
        title: 'Pressão Limítrofe / Atenção',
        desc: 'Valores levemente aumentados. Monitore a ingestão de sal e líquidos.',
        icon: AlertTriangle,
      };
    }
    return {
      level: 'normal',
      color: COLORS.success,
      title: 'Pressão Ótima / Controlada',
      desc: 'Excelente! Sua pressão arterial está dentro da meta saudável.',
      icon: Heart,
    };
  };

  const status = getStatusInfo(pressSys, pressDia);

  const headerGradient: [string, string, ...string[]] =
    pressSys >= 140
      ? ['#B91C1C', '#E45454']
      : pressSys >= 130
      ? ['#D97706', '#F4B740']
      : ['#1E3A5F', '#3D6E9F'];

  const handleSave = () => {
    setIsSaved(true);
    onSaveRecord({
      systolic: pressSys,
      diastolic: pressDia,
      heartRate: heartRate,
      notes: notes,
      status: status.level as 'normal' | 'warn' | 'danger',
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 2200);
  };

  // SVG Chart calculation for 7 days
  const recentRecords = [...records].slice(0, 7).reverse();
  const chartWidth = 300;
  const chartHeight = 110;
  const minVal = 50;
  const maxVal = 170;

  const sysPoints = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 24) + 12;
    const norm = (r.systolic - minVal) / (maxVal - minVal);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.systolic, date: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.') };
  });

  const diaPoints = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 24) + 12;
    const norm = (r.diastolic - minVal) / (maxVal - minVal);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.diastolic };
  });

  const sysPathD = sysPoints.length > 0
    ? `M ${sysPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const diaPathD = diaPoints.length > 0
    ? `M ${diaPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const StatusIcon = status.icon;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Pressão Arterial"
        subtitle="Registro e curva diária de aferição"
        onBack={onBack}
        bgGradient={headerGradient}
      />

      <View style={styles.content}>
        {/* Status Banner */}
        <View
          style={[
            styles.banner,
            {
              backgroundColor: `${status.color}15`,
              borderColor: `${status.color}40`,
            },
          ]}
        >
          <View style={[styles.bannerIconBox, { backgroundColor: status.color }]}>
            <StatusIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={styles.bannerTextWrapper}>
            <Text style={[styles.bannerTitle, { color: status.color }]}>
              {status.title}
            </Text>
            <Text style={[styles.bannerDesc, { color: dm.sub }]}>
              {status.desc}
            </Text>
          </View>
        </View>

        {/* 3 Steppers Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={[styles.stepperItem, { borderBottomColor: dm.border }]}>
            <Stepper
              label="1. Pressão Sistólica (Máxima)"
              value={pressSys}
              onValueChange={setPressSys}
              min={60}
              max={220}
              unit="mmHg"
              color={status.color}
              fontSizeScale={fontSizeScale}
            />
          </View>

          <View style={[styles.stepperItem, { borderBottomColor: dm.border }]}>
            <Stepper
              label="2. Pressão Diastólica (Mínima)"
              value={pressDia}
              onValueChange={setPressDia}
              min={40}
              max={140}
              unit="mmHg"
              color={COLORS.secondary}
              fontSizeScale={fontSizeScale}
            />
          </View>

          <View style={styles.stepperItemNoBorder}>
            <Stepper
              label="3. Frequência Cardíaca (Pulso)"
              value={heartRate}
              onValueChange={setHeartRate}
              min={40}
              max={200}
              unit="bpm"
              color={COLORS.purple}
              fontSizeScale={fontSizeScale}
            />
          </View>
        </View>

        {/* Notes Input */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.notesHeader}>
            <FileText size={14} color={dm.sub} />
            <Text style={[styles.notesLabel, { color: dm.sub }]}>
              Observações e Sintomas
            </Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: Em repouso, após medicação matinal..."
            placeholderTextColor={dm.sub}
            multiline
            numberOfLines={2}
            style={[styles.notesInput, { color: dm.text }]}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaved}
          activeOpacity={0.8}
          style={[
            styles.saveBtn,
            { backgroundColor: isSaved ? COLORS.success : COLORS.primary },
          ]}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>✓ Salvo com sucesso!</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>Salvar Registro de Pressão</Text>
          )}
        </TouchableOpacity>

        {/* 7-Day Chart */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: dm.sub }]}>
              Histórico Comparativo (7 Dias)
            </Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
                />
                <Text style={[styles.legendText, { color: dm.sub }]}>Sistólica</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.secondary }]}
                />
                <Text style={[styles.legendText, { color: dm.sub }]}>Diastólica</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartArea}>
            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {/* Grid guide lines */}
              <SvgLine x1="0" y1="20" x2={chartWidth} y2="20" stroke={dm.border} strokeDasharray="3,3" />
              <SvgLine x1="0" y1="60" x2={chartWidth} y2="60" stroke={dm.border} strokeDasharray="3,3" />
              <SvgLine x1="0" y1="100" x2={chartWidth} y2="100" stroke={dm.border} strokeDasharray="3,3" />

              {/* Systolic Line */}
              {sysPathD ? (
                <Path
                  d={sysPathD}
                  fill="none"
                  stroke={COLORS.primary}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : null}

              {/* Diastolic Line */}
              {diaPathD ? (
                <Path
                  d={diaPathD}
                  fill="none"
                  stroke={COLORS.secondary}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : null}

              {sysPoints.map((p, idx) => (
                <SvgCircle
                  key={`s-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                />
              ))}

              {diaPoints.map((p, idx) => (
                <SvgCircle
                  key={`d-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={COLORS.secondary}
                  strokeWidth="2"
                />
              ))}
            </Svg>

            {/* X-axis labels */}
            <View style={styles.xAxisRow}>
              {sysPoints.map((p, idx) => (
                <Text key={idx} style={[styles.xAxisText, { color: dm.sub }]}>
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
    paddingBottom: 28,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bannerDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
  },
  stepperItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  stepperItemNoBorder: {
    paddingTop: 2,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notesInput: {
    fontSize: 13,
    minHeight: 40,
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartArea: {
    marginTop: 4,
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
});
