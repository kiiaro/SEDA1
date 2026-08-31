import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Mic,
  MicOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';

interface VoiceScreenProps {
  onSaveRecognizedRecord: (record: Partial<HealthRecord>) => void;
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  onSaveRecognizedRecord,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [waves, setWaves] = useState<number[]>(Array(12).fill(0.3));
  const [voiceText, setVoiceText] = useState('');
  const [interpretedData, setInterpretedData] = useState<{
    systolic: number;
    diastolic: number;
    glucose?: number;
    heartRate?: number;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isListening) {
      interval = setInterval(() => {
        setWaves((w) => w.map(() => 0.15 + Math.random() * 0.85));
      }, 120);
    } else {
      setWaves(Array(12).fill(0.3));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isListening) {
      timer = setTimeout(() => {
        setIsListening(false);
        const recognized = 'Minha pressão foi 12 por 8 e a glicose 104';
        setVoiceText(recognized);
        setInterpretedData({
          systolic: 120,
          diastolic: 80,
          glucose: 104,
          heartRate: 72,
        });
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isListening]);

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setVoiceText('');
      setInterpretedData(null);
      setIsSaved(false);
      setIsListening(true);
    }
  };

  const handleConfirmAndSave = () => {
    if (interpretedData) {
      setIsSaved(true);
      onSaveRecognizedRecord({
        systolic: interpretedData.systolic,
        diastolic: interpretedData.diastolic,
        glucose: interpretedData.glucose || 100,
        heartRate: interpretedData.heartRate || 72,
        notes: `Registro por voz: "${voiceText}"`,
        status: 'normal',
      });
      setTimeout(() => {
        onBack();
      }, 1400);
    }
  };

  const sampleCommands = [
    '🗣️ "Minha pressão deu 12 por 8"',
    '🗣️ "Glicemia 115 em jejum hoje cedo"',
    '🗣️ "Pressão 13 por 8 e batimentos 74"',
    '🗣️ "Glicose 140 após o almoço"',
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Assistente de Voz SEDA"
        subtitle="Dite suas medições sem precisar digitar"
        onBack={onBack}
        bgGradient={['#4F46E5', '#6B7FD4']}
      />

      <View style={styles.body}>
        {/* Status Chip */}
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: isListening ? 'rgba(239,68,68,0.15)' : `${COLORS.purple}18`,
            },
          ]}
        >
          <Text
            style={[
              styles.statusChipText,
              { color: isListening ? '#DC2626' : COLORS.purple },
            ]}
          >
            {isListening ? 'Escutando você agora...' : 'Toque no microfone e fale'}
          </Text>
        </View>

        {/* Waves */}
        <View style={styles.wavesContainer}>
          {waves.map((w, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: Math.max(8, w * 56),
                  backgroundColor: isListening ? COLORS.purple : `${COLORS.purple}40`,
                },
              ]}
            />
          ))}
        </View>

        {/* Central Mic Button */}
        <View style={styles.micWrapper}>
          {isListening && (
            <>
              <View style={[styles.pulseRing, styles.pulseRing1]} />
              <View style={[styles.pulseRing, styles.pulseRing2]} />
            </>
          )}

          <TouchableOpacity
            onPress={handleToggleListening}
            activeOpacity={0.8}
            style={[
              styles.micBtn,
              {
                backgroundColor: isListening ? '#4F46E5' : '#E0E8F8',
              },
            ]}
          >
            {isListening ? (
              <MicOff size={46} color="#FFFFFF" strokeWidth={2.2} />
            ) : (
              <Mic size={46} color={COLORS.purple} strokeWidth={2.2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Interpreted Result */}
        {voiceText ? (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.resultHeader}>
              <MessageSquare size={16} color="#6366F1" />
              <Text style={[styles.resultHeaderText, { color: dm.sub }]}>
                O que o SEDA ouviu:
              </Text>
            </View>

            <Text style={[styles.voiceText, { color: dm.text }]}>
              "{voiceText}"
            </Text>

            {interpretedData && (
              <View style={styles.interpretedBox}>
                <CheckCircle2 size={22} color="#16A34A" />
                <View style={styles.interpretedTextWrapper}>
                  <Text style={styles.interpretedMain}>
                    Pressão {interpretedData.systolic}/{interpretedData.diastolic} mmHg
                  </Text>
                  {interpretedData.glucose && (
                    <Text style={styles.interpretedSub}>
                      Glicemia: {interpretedData.glucose} mg/dL
                    </Text>
                  )}
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={handleConfirmAndSave}
              disabled={isSaved}
              activeOpacity={0.8}
              style={styles.confirmBtn}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>✓ Salvo no histórico!</Text>
                </>
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>Confirmar e Salvar</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Example Commands */}
        {!voiceText && !isListening && (
          <View
            style={[
              styles.examplesCard,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.examplesHeader}>
              <Sparkles size={16} color="#6366F1" />
              <Text style={[styles.examplesHeaderText, { color: dm.sub }]}>
                Exemplos de frases:
              </Text>
            </View>

            <View style={styles.examplesList}>
              {sampleCommands.map((cmd, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.exampleItem,
                    { backgroundColor: dm.inputBg },
                  ]}
                >
                  <Text style={[styles.exampleText, { color: dm.text }]}>
                    {cmd}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    flexGrow: 1,
  },
  body: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  wavesContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  micWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  pulseRing1: {
    width: 150,
    height: 150,
  },
  pulseRing2: {
    width: 180,
    height: 180,
    opacity: 0.5,
  },
  micBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  resultCard: {
    width: '100%',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  voiceText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  interpretedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  interpretedTextWrapper: {
    flex: 1,
  },
  interpretedMain: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  interpretedSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#16A34A',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  examplesCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examplesHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  examplesList: {
    gap: 6,
  },
  exampleItem: {
    padding: 10,
    borderRadius: 10,
  },
  exampleText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
