import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Heart, CheckCircle2, AlertTriangle, FileText, Mic } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { HistogramChart } from '../components/HistogramChart';
import { Stepper } from '../components/Stepper';
import { useInputVisibility } from '../components/useInputVisibility';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { classifyPressure } from '../lib/healthUtils';

interface PressureScreenProps {
  pressSys: number;
  setPressSys: (val: number) => void;
  pressDia: number;
  setPressDia: (val: number) => void;
  heartRate: number;
  setHeartRate: (val: number) => void;
  onSaveRecord: (record: Partial<HealthRecord>) => Promise<void>;
  records: HealthRecord[];
  onOpenVoice?: () => void;
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
  onOpenVoice,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { scrollRef, keepInputVisible } = useInputVisibility();

  const classified = classifyPressure(pressSys, pressDia);
  const statusColor =
    classified.level === 'danger'
      ? COLORS.danger
      : classified.level === 'warn'
      ? COLORS.secondary
      : COLORS.primary;
  const status = {
    ...classified,
    color: statusColor,
    icon: classified.level === 'normal' ? Heart : AlertTriangle,
  };

  const handleSave = async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);
    try {
      await onSaveRecord({
        systolic: pressSys,
        diastolic: pressDia,
        heartRate,
        notes,
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

  const recentRecords = records.filter((r) => r.measurement !== 'glucose').slice(0, 7).reverse();
  const histogramData = recentRecords.map((r) => ({
    label: r.date.split(',')[0].replace('Ontem', 'Ont.').replace('Anteontem', 'Ant.'),
    value: r.systolic,
    secondaryValue: r.diastolic,
    displayValue: `${r.systolic}/${r.diastolic} mmHg`,
  }));

  const StatusIcon = status.icon;

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <BackHeader
        title="Pressão Arterial"
        subtitle="Registro e curva diária de aferição"
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
        {/* Status Banner */}
        <FadeInItem delay={0}>
          <View
            style={[
              styles.banner,
              {
                backgroundColor: `${status.color}12`,
                borderColor: `${status.color}35`,
              },
            ]}
          >
            <View style={[styles.bannerIconBox, { backgroundColor: status.color }]}>
              <StatusIcon size={22} color="#FFFFFF" strokeWidth={2.5} />
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
        </FadeInItem>

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
              color={COLORS.primary}
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
            onFocus={keepInputVisible}
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
          disabled={isSaving || isSaved}
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
            <Text style={styles.saveBtnText}>{isSaving ? 'Salvando...' : 'Salvar Registro de Pressão'}</Text>
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
              Histórico Comparativo (7 Dias)
            </Text>
          </View>

          <HistogramChart
            data={histogramData}
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
