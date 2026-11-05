import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';

interface Props {
  onSaveRecognizedRecord: (record: Partial<HealthRecord>) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

function parseMeasurement(text: string) {
  const pressure = text.match(/(?:press[aã]o\s*(?:foi|deu|:)?\s*)?(\d{2,3})\s*(?:\/|por|x)\s*(\d{1,3})/i);
  const glucose = text.match(/(?:glicose|glicemia)\s*(?:foi|deu|:)?\s*(\d{2,3})/i);
  const heartRate = text.match(/(?:pulso|batimentos)\s*(?:foi|deu|:)?\s*(\d{2,3})/i);
  const systolic = pressure ? Number(pressure[1]) * (Number(pressure[1]) < 30 ? 10 : 1) : undefined;
  const diastolic = pressure ? Number(pressure[2]) * (Number(pressure[2]) < 20 ? 10 : 1) : undefined;
  const glucoseValue = glucose ? Number(glucose[1]) : undefined;
  if (systolic !== undefined && (systolic < 50 || systolic > 280 || !diastolic || diastolic < 30 || diastolic > 180)) return null;
  if (glucoseValue !== undefined && (glucoseValue < 20 || glucoseValue > 600)) return null;
  if (systolic === undefined && glucoseValue === undefined) return null;
  return { systolic, diastolic, glucose: glucoseValue, heartRate: heartRate ? Number(heartRate[1]) : undefined };
}

export const VoiceScreen: React.FC<Props> = ({ onSaveRecognizedRecord, onBack, dm, fontSizeScale }) => {
  const [phrase, setPhrase] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const parsed = useMemo(() => parseMeasurement(phrase), [phrase]);

  const save = async () => {
    if (!parsed || saving) return;
    setSaving(true); setError('');
    try {
      await onSaveRecognizedRecord({ ...parsed, notes: `Registro por texto: ${phrase.trim()}` });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  return <ScrollView style={{ backgroundColor: dm.bg }} contentContainerStyle={styles.page}>
    <BackHeader title="Registro por Texto" subtitle="Descreva sua medição para preencher os valores" onBack={onBack} bgGradient={['#1E3A5F', '#3D6E9F']} />
    <View style={styles.body}>
      <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
        <View style={styles.heading}><MessageSquare size={20} color={COLORS.primary} /><Text style={[styles.title, { color: dm.text, fontSize: 18 * fontSizeScale }]}>Escreva sua medição</Text></View>
        <Text style={[styles.help, { color: dm.sub }]}>Exemplo: “Pressão 12 por 8 e glicemia 104”. Confira os valores antes de salvar.</Text>
        <TextInput value={phrase} onChangeText={(value) => { setPhrase(value); setSaved(false); setError(''); }} multiline placeholder="Pressão 12 por 8 e glicemia 104" placeholderTextColor={dm.sub} style={[styles.input, { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border }]} />
      </View>
      <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
        <Text style={[styles.section, { color: dm.sub }]}>VALORES IDENTIFICADOS</Text>
        {parsed ? <>
          {parsed.systolic !== undefined && <Text style={[styles.value, { color: dm.text }]}>Pressão: {parsed.systolic}/{parsed.diastolic} mmHg</Text>}
          {parsed.glucose !== undefined && <Text style={[styles.value, { color: dm.text }]}>Glicemia: {parsed.glucose} mg/dL</Text>}
          {parsed.heartRate !== undefined && <Text style={[styles.value, { color: dm.text }]}>Pulso: {parsed.heartRate} bpm</Text>}
        </> : <Text style={[styles.help, { color: dm.sub }]}>Digite uma pressão e/ou glicemia válida para continuar.</Text>}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={save} disabled={!parsed || saving || saved} style={[styles.button, { backgroundColor: parsed && !saved ? COLORS.primary : dm.border }]}>
          {saved ? <CheckCircle2 size={18} color="#FFFFFF" /> : <ArrowRight size={18} color="#FFFFFF" />}
          <Text style={styles.buttonText}>{saved ? 'Salvo no histórico' : saving ? 'Salvando...' : 'Confirmar e salvar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>;
};

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingBottom: 32 },
  body: { padding: 16, gap: 14 },
  card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontWeight: '800' },
  help: { fontSize: 13, lineHeight: 20 },
  input: { minHeight: 112, borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  value: { fontSize: 16, fontWeight: '700' },
  error: { color: '#B91C1C', fontSize: 13 },
  button: { minHeight: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
