import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  PhoneCall,
  MapPin,
  Users,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { DarkModeTheme, FamilyMember } from '../types';
import { BackHeader } from '../components/BackHeader';

interface EmergencyScreenProps {
  family: FamilyMember[];
  onBack: () => void;
  dm: DarkModeTheme;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onBack, dm }) => {
  const [state, setState] = useState<'idle' | 'confirm' | 'activated'>('idle');
  const [count, setCount] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (state === 'confirm') {
      if (count > 0) {
        timer = setTimeout(() => {
          setCount((c) => c - 1);
        }, 1000);
      } else {
        setState('activated');
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, count]);

  const handleStartEmergency = () => {
    setCount(5);
    setState('confirm');
  };

  const handleCancelCountdown = () => {
    setState('idle');
    setCount(5);
  };

  const handleCallSamu = () => {
    Linking.openURL('tel:192');
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: state === 'activated' ? '#FEE8E8' : dm.bg },
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Socorro & Emergência SAMU"
        subtitle="Linha direta com SAMU 192 e Cuidadores"
        onBack={onBack}
        bgGradient={['#991B1B', '#E45454']}
      />

      {/* STATE 1: IDLE */}
      {state === 'idle' && (
        <View style={styles.idleContainer}>
          <View style={styles.idleHeader}>
            <View style={styles.badgeDanger}>
              <Text style={styles.badgeDangerText}>Canal de Emergência Imediata</Text>
            </View>
            <Text style={[styles.idleTitle, { color: dm.text }]}>
              Pressione para Acionar Socorro
            </Text>
            <Text style={[styles.idleDesc, { color: dm.sub }]}>
              Se você estiver sentindo dor no peito, falta de ar, dormência ou tontura severa.
            </Text>
          </View>

          {/* Big Circular Danger Button */}
          <View style={styles.sosButtonWrapper}>
            <View style={styles.pulseRingOuter} />
            <View style={styles.pulseRingInner} />

            <TouchableOpacity
              onPress={handleStartEmergency}
              activeOpacity={0.85}
              style={styles.sosButton}
            >
              <LinearGradient
                colors={['#DC2626', '#991B1B']}
                style={styles.sosGradient}
              >
                <Phone size={48} color="#FFFFFF" />
                <Text style={styles.sosText}>SOS 192</Text>
                <Text style={styles.sosSub}>Toque aqui</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 3 Quick Action Cards */}
          <View style={styles.quickCards}>
            <TouchableOpacity
              onPress={handleCallSamu}
              activeOpacity={0.7}
              style={[
                styles.actionCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <PhoneCall size={18} color="#EF4444" />
                </View>
                <View>
                  <Text style={[styles.actionCardTitle, { color: dm.text }]}>
                    Ligar Diretamente para o SAMU 192
                  </Text>
                  <Text style={[styles.actionCardSub, { color: dm.sub }]}>
                    Ligação pública gratuita
                  </Text>
                </View>
              </View>
              <Text style={styles.samuNumber}>192</Text>
            </TouchableOpacity>

            <View
              style={[
                styles.actionCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                  <MapPin size={18} color="#0EA5E9" />
                </View>
                <View>
                  <Text style={[styles.actionCardTitle, { color: dm.text }]}>
                    Compartilhar GPS com UBS Local
                  </Text>
                  <Text style={[styles.actionCardSub, { color: dm.sub }]}>
                    UBS Vila Mariana (800m de distância)
                  </Text>
                </View>
              </View>
              <View style={styles.statusActiveBadge}>
                <Text style={styles.statusActiveText}>Ativo</Text>
              </View>
            </View>

            <View
              style={[
                styles.actionCard,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Users size={18} color="#22C55E" />
                </View>
                <View>
                  <Text style={[styles.actionCardTitle, { color: dm.text }]}>
                    Avisar Rede Familiar (2 Cuidadores)
                  </Text>
                  <Text style={[styles.actionCardSub, { color: dm.sub }]}>
                    Ana Silva e Dr. Lucas
                  </Text>
                </View>
              </View>
              <View style={styles.statusReadyBadge}>
                <Text style={styles.statusReadyText}>Pronto</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* STATE 2: CONFIRM COUNTDOWN */}
      {state === 'confirm' && (
        <View style={styles.confirmContainer}>
          <View style={styles.confirmBadge}>
            <Text style={styles.confirmBadgeText}>Acionando Socorro em...</Text>
          </View>

          <View style={styles.countdownCircle}>
            <Text style={styles.countdownNumber}>{count}</Text>
            <Text style={styles.countdownUnit}>segundos</Text>
          </View>

          <Text style={[styles.confirmDesc, { color: dm.sub }]}>
            O SAMU 192 e sua família receberão seu chamado com suas coordenadas GPS.
          </Text>

          <TouchableOpacity
            onPress={handleCancelCountdown}
            activeOpacity={0.8}
            style={[
              styles.cancelBtn,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <X size={18} color="#EF4444" />
            <Text style={[styles.cancelBtnText, { color: dm.text }]}>
              Cancelar Chamado de Emergência
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STATE 3: ACTIVATED */}
      {state === 'activated' && (
        <View style={styles.activatedContainer}>
          <View style={styles.successIconBox}>
            <CheckCircle2 size={44} color="#FFFFFF" />
          </View>

          <Text style={styles.activatedTitle}>
            Chamado de Emergência Enviado!
          </Text>

          <Text style={styles.activatedDesc}>
            A central do <Text style={{ fontWeight: '800' }}>SAMU 192</Text> e sua rede de cuidadores já foram notificadas com sua localização e histórico recente de pressão.
          </Text>

          <View style={styles.instructionsCard}>
            <Text style={styles.instHeader}>
              ● Instruções enquanto o socorro se desloca:
            </Text>
            <Text style={styles.instText}>1. Sente-se confortavelmente e evite movimentos bruscos.</Text>
            <Text style={styles.instText}>2. Mantenha a porta destravada caso more sozinho.</Text>
            <Text style={styles.instText}>3. Deixe documentos e cartão do SUS à mão.</Text>
          </View>

          <TouchableOpacity
            onPress={() => setState('idle')}
            activeOpacity={0.8}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Voltar ao Modo Normal</Text>
          </TouchableOpacity>
        </View>
      )}
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
  idleContainer: {
    padding: 20,
    alignItems: 'center',
  },
  idleHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeDanger: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 8,
  },
  badgeDangerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  idleTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  idleDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 16,
  },
  sosButtonWrapper: {
    position: 'relative',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  pulseRingOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  pulseRingInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  sosGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  sosSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickCards: {
    width: '100%',
    gap: 8,
    marginTop: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionCardSub: {
    fontSize: 9,
    marginTop: 1,
  },
  samuNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
  },
  statusActiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  statusActiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0369A1',
  },
  statusReadyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusReadyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  confirmContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  confirmBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DC2626',
    marginBottom: 20,
  },
  confirmBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  countdownCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 60,
    fontWeight: '900',
    color: '#DC2626',
  },
  countdownUnit: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  confirmDesc: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 240,
    marginBottom: 24,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  activatedContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  activatedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#450A0A',
    textAlign: 'center',
  },
  activatedDesc: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 290,
  },
  instructionsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginVertical: 20,
    gap: 6,
  },
  instHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  instText: {
    fontSize: 11,
    color: '#334155',
  },
  resetBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#B91C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
