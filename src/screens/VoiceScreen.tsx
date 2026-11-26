import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { useInputVisibility } from '../components/useInputVisibility';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { parseMeasurementText } from '../lib/healthUtils';

interface Props {
  onSaveRecognizedRecord: (record: Partial<HealthRecord>) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

const VOICE_EXAMPLES = [
  'Pressão 12 por 8 e pulso 72',
  'Glicemia 104',
  'Pressão 130/85 e glicemia 118',
];

export const VoiceScreen: React.FC<Props> = ({
  onSaveRecognizedRecord,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [phrase, setPhrase] = useState('');
  const [listening, setListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);
  const { scrollRef, keepInputVisible } = useInputVisibility();
  const parsed = useMemo(() => parseMeasurementText(phrase), [phrase]);

  const pulseScale = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(0.35)).current;
  const wave2 = useRef(new Animated.Value(0.6)).current;
  const wave3 = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!listening) {
      pulseScale.setValue(1);
      wave1.setValue(0.35);
      wave2.setValue(0.6);
      wave3.setValue(0.45);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.12,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const makeWave = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration, useNativeDriver: true }),
        ])
      );

    const w1 = makeWave(wave1, 280);
    const w2 = makeWave(wave2, 360);
    const w3 = makeWave(wave3, 240);

    pulseLoop.start();
    w1.start();
    w2.start();
    w3.start();

    return () => {
      pulseLoop.stop();
      w1.stop();
      w2.stop();
      w3.stop();
    };
  }, [listening, pulseScale, wave1, wave2, wave3]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore cleanup error
      }
    };
  }, []);

  const toggleVoiceCapture = () => {
    setError('');
    setSaved(false);

    if (listening) {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
      setListening(false);
      setSpeechNotice('Gravação encerrada. Confira os valores abaixo.');
      return;
    }

    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      setSpeechNotice('Ditado por voz disponível no navegador compatível ou digite abaixo.');
      return;
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSpeechNotice(
        'Seu navegador não suporta ditado automático. Toque em um exemplo ou digite sua medição.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setListening(true);
        setSpeechNotice('Ouvindo em português... Diga algo como "Pressão 12 por 8".');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0]?.transcript || '';
        }
        if (transcript.trim()) {
          setPhrase(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setListening(false);
        const code = event?.error;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setSpeechNotice('Permissão de microfone negada. Digite ou use os exemplos rápidos.');
        } else if (code === 'no-speech') {
          setSpeechNotice('Nenhuma fala detectada. Tente novamente perto do microfone.');
        } else {
          setSpeechNotice('Não foi possível capturar o áudio agora. Você pode digitar abaixo.');
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      setSpeechNotice('Microfone indisponível neste dispositivo. Digite sua medição abaixo.');
    }
  };

  const save = async () => {
    if (!parsed || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSaveRecognizedRecord({
        ...parsed,
        notes: `Registro por voz: ${phrase.trim()}`,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: dm.bg }}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Registro por Voz"
        subtitle="Fale ou digite sua pressão, glicemia e pulso"
        onBack={onBack}
        dm={dm}
      />

      <View style={styles.body}>
        {/* Interactive Voice Capture Hero Card */}
        <FadeInItem delay={0}>
          <View
            style={[
              styles.voiceHeroCard,
              {
                backgroundColor: dm.card,
                borderColor: listening ? COLORS.primary : dm.border,
              },
            ]}
          >
            <View style={styles.micStage}>
              <Animated.View
                style={[
                  styles.micHalo,
                  {
                    backgroundColor: listening
                      ? 'rgba(0, 182, 144, 0.22)'
                      : 'rgba(38, 77, 140, 0.1)',
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />
              <TouchableOpacity
                onPress={toggleVoiceCapture}
                accessibilityRole="button"
                accessibilityLabel={listening ? 'Parar captura de voz' : 'Iniciar captura de voz'}
                style={[
                  styles.micButton,
                  { backgroundColor: listening ? COLORS.danger : COLORS.primary },
                ]}
              >
                {listening ? (
                  <MicOff size={28} color="#FFFFFF" />
                ) : (
                  <Mic size={28} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Live Sound Wave Bars */}
            <View style={styles.waveRow}>
              {[wave1, wave2, wave3, wave2, wave1].map((bar, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: listening ? COLORS.primary : dm.border,
                      transform: [{ scaleY: bar }],
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={[styles.voiceTitle, { color: dm.text, fontSize: 18 * fontSizeScale }]}>
              {listening ? 'Estou ouvindo você...' : 'Toque no microfone para falar'}
            </Text>
            <Text style={[styles.voiceSubtitle, { color: dm.sub }]}>
              {speechNotice || 'Diga naturalmente: “Pressão 12 por 8 e glicemia 104”'}
            </Text>

            {/* Quick Voice Phrase Chips */}
            <View style={styles.examplesWrap}>
              {VOICE_EXAMPLES.map((example) => (
                <TouchableOpacity
                  key={example}
                  onPress={() => {
                    setPhrase(example);
                    setSaved(false);
                    setError('');
                  }}
                  style={[
                    styles.exampleBtn,
                    { backgroundColor: dm.inputBg, borderColor: dm.border },
                  ]}
                >
                  <Volume2 size={12} color={COLORS.primary} />
                  <Text style={[styles.exampleText, { color: dm.text }]}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeInItem>

        {/* Editable Transcript Box */}
        <FadeInItem delay={70}>
          <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.section, { color: dm.sub }]}>TRANSCRIÇÃO E EDIÇÃO</Text>
            <TextInput
              value={phrase}
              onChangeText={(value) => {
                setPhrase(value);
                setSaved(false);
                setError('');
              }}
              onFocus={keepInputVisible}
              multiline
              placeholder="Ex.: Pressão 12 por 8 e glicemia 104"
              placeholderTextColor={dm.sub}
              style={[
                styles.input,
                {
                  color: dm.text,
                  backgroundColor: dm.inputBg,
                  borderColor: dm.border,
                },
              ]}
            />
          </View>
        </FadeInItem>

        {/* Parsed Values & Confirm */}
        <FadeInItem delay={130}>
          <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.parsedHeader}>
              <Sparkles size={15} color={COLORS.primary} />
              <Text style={[styles.section, { color: dm.sub }]}>VALORES IDENTIFICADOS</Text>
            </View>

            {parsed ? (
              <View style={styles.parsedGrid}>
                {parsed.systolic !== undefined && (
                  <View style={[styles.parsedMetric, { backgroundColor: dm.inputBg, borderColor: dm.border }]}>
                    <Text style={[styles.metricLabel, { color: dm.sub }]}>Pressão</Text>
                    <Text style={[styles.value, { color: dm.text }]}>
                      {parsed.systolic}/{parsed.diastolic} <Text style={styles.unit}>mmHg</Text>
                    </Text>
                  </View>
                )}
                {parsed.glucose !== undefined && (
                  <View style={[styles.parsedMetric, { backgroundColor: dm.inputBg, borderColor: dm.border }]}>
                    <Text style={[styles.metricLabel, { color: dm.sub }]}>Glicemia</Text>
                    <Text style={[styles.value, { color: dm.text }]}>
                      {parsed.glucose} <Text style={styles.unit}>mg/dL</Text>
                    </Text>
                  </View>
                )}
                {parsed.heartRate !== undefined && (
                  <View style={[styles.parsedMetric, { backgroundColor: dm.inputBg, borderColor: dm.border }]}>
                    <Text style={[styles.metricLabel, { color: dm.sub }]}>Pulso</Text>
                    <Text style={[styles.value, { color: dm.text }]}>
                      {parsed.heartRate} <Text style={styles.unit}>bpm</Text>
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={[styles.help, { color: dm.sub }]}>
                Fale, toque em um exemplo ou digite uma pressão e/ou glicemia válida para continuar.
              </Text>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              onPress={save}
              disabled={!parsed || saving || saved}
              style={[
                styles.button,
                { backgroundColor: parsed && !saved ? COLORS.primary : dm.border },
              ]}
            >
              {saved ? (
                <CheckCircle2 size={18} color="#FFFFFF" />
              ) : (
                <ArrowRight size={18} color="#FFFFFF" />
              )}
              <Text style={styles.buttonText}>
                {saved ? 'Salvo no histórico' : saving ? 'Salvando...' : 'Confirmar e salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeInItem>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingBottom: 32 },
  body: { padding: 16, gap: 14 },
  voiceHeroCard: {
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  micStage: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  micHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  micButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
  },
  waveBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  voiceTitle: {
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  voiceSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  examplesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  exampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  exampleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 },
  parsedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  help: { fontSize: 13, lineHeight: 20 },
  input: {
    minHeight: 88,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  parsedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  parsedMetric: {
    flex: 1,
    minWidth: 110,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  value: { fontSize: 18, fontWeight: '800' },
  unit: { fontSize: 12, fontWeight: '500' },
  error: { color: '#B91C1C', fontSize: 13 },
  button: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
