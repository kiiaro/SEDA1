import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import { Utensils, Clock, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { HealthRing } from '../components/HealthRing';
import { Stepper } from '../components/Stepper';

interface GlucoseScreenProps {
  glucose: number;
  setGlucose: (val: number) => void;
  onSaveRecord: (record: Partial<HealthRecord>) => void;
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const GlucoseScreen: React.FC<GlucoseScreenProps> = ({
  glucose,
  setGlucose,
  onSaveRecord,
  records,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [mealContext, setMealContext] = useState<'before' | 'after'>('before');
  const [timeStr, setTimeStr] = useState('07:45');
  const [isSaved, setIsSaved] = useState(false);

  const getGlucoseStatus = (val: number) => {
    if (val > 126) {
      return {
        level: 'danger',
        label: '⬆️ Hiperglicemia (Alta)',
        color: COLORS.danger,
        desc: 'Taxa acima da meta em jejum/pré-refeição. Beba água e evite carboidratos rápidos.',
      };
    }
    if (val < 70) {
      return {
        level: 'warn',
        label: '⬇️ Hipoglicemia (Baixa)',
        color: COLORS.primary,
        desc: 'Atenção com sintomas de tontura e suor frio. Consuma um carboidrato rápido se indicado.',
      };
    }
    return {
      level: 'normal',
      label: 'Normal / Alvo Atingido',
      color: COLORS.accent,
      desc: 'Excelente! Sua glicemia está na faixa esperada para seu perfil de tratamento.',
    };
  };

  const status = getGlucoseStatus(glucose);

  const handleSave = () => {
    setIsSaved(true);
    onSaveRecord({
      glucose: glucose,
      mealContext: mealContext,
      time: timeStr,
      status: status.level as 'normal' | 'warn' | 'danger',
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 2200);
  };

  // SVG Chart calculation for 7 days
  const recentRecords = [...records].slice(0, 7).reverse();
  const chartWidth = 300;
  const chartHeight = 100;
  const minVal = 60;
  const maxVal = 200;

  const points = recentRecords.map((r, i) => {
    const x = (i / Math.max(recentRecords.length - 1, 1)) * (chartWidth - 24) + 12;
    const norm = (r.glucose - minVal) / (maxVal - minVal);
    const y = chartHeight - norm * (chartHeight - 20) - 10;
    return { x, y, val: r.glucose, date: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.') };
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
      <BackHeader
        title="Glicemia Capilar"
        subtitle="Monitoramento de glicose e refeições"
        onBack={onBack}
        bgGradient={['#2D6A4F', '#59B98A']}
      />

      <View style={styles.content}>
        {/* Large Health Ring at Top */}
        <View
          style={[
            styles.card,
            styles.ringCard,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.ringWrapper}>
            <HealthRing
              value={glucose}
              max={300}
              color={status.color}
              size={120}
              stroke={11}
              unit="mg/dL"
              label="Glicose"
            />
          </View>

          {/* Stepper with Dynamic Color Matching Ring */}
          <View style={styles.stepperWrapper}>
            <Stepper
              value={glucose}
              onValueChange={setGlucose}
              min={20}
              max={600}
              step={1}
              unit="mg/dL"
              color={status.color}
              fontSizeScale={fontSizeScale}
            />
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${status.color}20` },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={[styles.statusDesc, { color: dm.sub }]}>
            {status.desc}
          </Text>
        </View>

        {/* Meal Context Toggle & Time */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.label, { color: dm.sub }]}>
            Contexto da Medição
          </Text>
          <View style={styles.mealRow}>
            <TouchableOpacity
              onPress={() => setMealContext('before')}
              activeOpacity={0.7}
              style={[
                styles.mealBtn,
                {
                  backgroundColor: mealContext === 'before' ? `${COLORS.warn}25` : dm.inputBg,
                  borderColor: mealContext === 'before' ? COLORS.warn : dm.border,
                },
              ]}
            >
              <Utensils size={16} color={mealContext === 'before' ? '#B45309' : dm.sub} />
              <Text
                style={[
                  styles.mealBtnText,
                  { color: mealContext === 'before' ? '#B45309' : dm.sub },
                ]}
              >
                Antes (Jejum)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMealContext('after')}
              activeOpacity={0.7}
              style={[
                styles.mealBtn,
                {
                  backgroundColor: mealContext === 'after' ? `${COLORS.warn}25` : dm.inputBg,
                  borderColor: mealContext === 'after' ? COLORS.warn : dm.border,
                },
              ]}
            >
              <Utensils size={16} color={mealContext === 'after' ? '#B45309' : dm.sub} />
              <Text
                style={[
                  styles.mealBtnText,
                  { color: mealContext === 'after' ? '#B45309' : dm.sub },
                ]}
              >
                Pós-Prandial (2h)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeSection}>
            <Text style={[styles.label, { color: dm.sub }]}>
              Horário da Aferição
            </Text>
            <View style={styles.timeInputWrapper}>
              <Clock size={18} color={dm.sub} />
              <TextInput
                value={timeStr}
                onChangeText={setTimeStr}
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: dm.inputBg,
                    borderColor: dm.border,
                    color: dm.text,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaved}
          activeOpacity={0.8}
          style={[
            styles.saveBtn,
            { backgroundColor: isSaved ? COLORS.success : status.color },
          ]}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>✓ Salvo com sucesso!</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>Salvar Registro de Glicose</Text>
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
              Curva Glicêmica (7 Dias)
            </Text>
            <Text style={styles.chartTarget}>Meta: &lt; 126 mg/dL</Text>
          </View>

          <View style={styles.chartArea}>
            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <Defs>
                <SvgLinearGradient id="glucGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={COLORS.warn} stopOpacity={0.45} />
                  <Stop offset="100%" stopColor={COLORS.warn} stopOpacity={0.0} />
                </SvgLinearGradient>
              </Defs>

              <SvgLine x1="0" y1="20" x2={chartWidth} y2="20" stroke={dm.border} strokeDasharray="3,3" />
              <SvgLine x1="0" y1="60" x2={chartWidth} y2="60" stroke={dm.border} strokeDasharray="3,3" />

              {areaD ? <Path d={areaD} fill="url(#glucGradient)" /> : null}
              {pathD ? (
                <Path
                  d={pathD}
                  fill="none"
                  stroke={COLORS.warn}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : null}

              {points.map((p, idx) => (
                <SvgCircle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={COLORS.warn}
                  strokeWidth="2.5"
                />
              ))}
            </Svg>

            <View style={styles.xAxisRow}>
              {points.map((p, idx) => (
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
  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
  },
  ringCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ringWrapper: {
    marginVertical: 4,
  },
  stepperWrapper: {
    width: '100%',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusDesc: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 16,
    marginTop: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  mealBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  mealBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeSection: {
    marginTop: 4,
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 14,
    fontWeight: '700',
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
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  chartTarget: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
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
