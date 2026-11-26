import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Utensils, Clock, CheckCircle2, Mic } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { HealthRing } from '../components/HealthRing';
import { HistogramChart } from '../components/HistogramChart';
import { Stepper } from '../components/Stepper';
import { useInputVisibility } from '../components/useInputVisibility';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { classifyGlucose } from '../lib/healthUtils';

interface GlucoseScreenProps {
  glucose: number;
  setGlucose: (val: number) => void;
  onSaveRecord: (record: Partial<HealthRecord>) => Promise<void>;
  records: HealthRecord[];
  onOpenVoice?: () => void;
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const GlucoseScreen: React.FC<GlucoseScreenProps> = ({
  glucose,
  setGlucose,
  onSaveRecord,
  records,
  onOpenVoice,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [mealContext, setMealContext] = useState<'before' | 'after'>('before');
  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { scrollRef, keepInputVisible } = useInputVisibility();

  const classified = classifyGlucose(glucose, mealContext);
  const status = {
    ...classified,
    color:
      classified.level === 'danger'
        ? COLORS.danger
        : classified.level === 'warn'
        ? COLORS.secondary
        : COLORS.primary,
  };

  const handleSave = async () => {
    if (isSaving || isSaved) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) {
      Alert.alert('Horário inválido', 'Informe o horário no formato HH:MM.');
      return;
    }
    setIsSaving(true);
    try {
      await onSaveRecord({
        glucose,
        mealContext,
        time: timeStr,
        status: status.level as 'normal' | 'warn' | 'danger',
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2200);
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const recentRecords = records.filter((r) => r.measurement !== 'pressure').slice(0, 7).reverse();
  const histogramData = recentRecords.map((r) => ({
    label: r.date.split(',')[0].replace('Ontem', 'Ont.').replace('Anteontem', 'Ant.'),
    value: r.glucose,
    displayValue: `${r.glucose} mg/dL`,
  }));

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <BackHeader
        title="Glicemia Capilar"
        subtitle="Monitoramento de glicose e refeições"
        onBack={onBack}
        dm={dm}
        accentColor={status.color}
        rightElement={
          onOpenVoice ? (
            <TouchableOpacity
              onPress={onOpenVoice}
              accessibilityRole="button"
              accessibilityLabel="Registro por Voz"
              style={[styles.voiceHeaderBtn, { backgroundColor: dm.card, borderColor: dm.border }]}
            >
              <Mic size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.content}>
        {/* Large Health Ring at Top */}
        <FadeInItem delay={0}>
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
        </FadeInItem>

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
                  backgroundColor: mealContext === 'before' ? 'rgba(0, 182, 144, 0.12)' : dm.inputBg,
                  borderColor: mealContext === 'before' ? COLORS.primary : dm.border,
                },
              ]}
            >
              <Utensils size={16} color={mealContext === 'before' ? COLORS.primary : dm.sub} />
              <Text
                style={[
                  styles.mealBtnText,
                  { color: mealContext === 'before' ? COLORS.primary : dm.sub },
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
                  backgroundColor: mealContext === 'after' ? 'rgba(0, 182, 144, 0.12)' : dm.inputBg,
                  borderColor: mealContext === 'after' ? COLORS.primary : dm.border,
                },
              ]}
            >
              <Utensils size={16} color={mealContext === 'after' ? COLORS.primary : dm.sub} />
              <Text
                style={[
                  styles.mealBtnText,
                  { color: mealContext === 'after' ? COLORS.primary : dm.sub },
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
                onFocus={keepInputVisible}
                placeholder="HH:MM"
                placeholderTextColor={dm.sub}
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
          disabled={isSaving || isSaved}
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
            <Text style={styles.saveBtnText}>{isSaving ? 'Salvando...' : 'Salvar Registro de Glicose'}</Text>
          )}
        </TouchableOpacity>

        {/* 7-Day Histogram Chart */}
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
            <Text style={styles.chartTarget}>Histórico das medições</Text>
          </View>

          <HistogramChart
            data={histogramData}
            minVal={60}
            maxVal={200}
            unit="mg/dL"
            primaryColor={COLORS.primary}
            dm={dm}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  voiceHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: COLORS.primary,
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
