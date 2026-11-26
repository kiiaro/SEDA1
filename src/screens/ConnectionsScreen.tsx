import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import {
  MessageCircle,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  QrCode,
  Camera,
  CheckCircle2,
  X,
  Copy,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { BackHeader } from '../components/BackHeader';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, ProfessionalConnection, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  user: UserProfile;
  userId: string;
  connections: ProfessionalConnection[];
  onCreateInvite: () => Promise<string>;
  onAcceptInvite: (code: string) => Promise<void>;
  onRefreshConnections: () => Promise<void>;
  onRemoveConnection: (connection: ProfessionalConnection) => Promise<void>;
  onOpenChat: (connection: ProfessionalConnection) => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const ConnectionsScreen: React.FC<Props> = ({
  user,
  userId,
  connections,
  onCreateInvite,
  onAcceptInvite,
  onRefreshConnections,
  onRemoveConnection,
  onOpenChat,
  onBack,
  dm,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const isProfessional = user.userType === 'Profissional';
  const peerName = (connection: ProfessionalConnection) =>
    isProfessional ? connection.patientName : connection.professionalName;

  React.useEffect(() => {
    const channel = supabase
      .channel(`seda-connections-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'seda_patient_connections',
          filter: `${isProfessional ? 'professional_id' : 'patient_id'}=eq.${userId}`,
        },
        () => {
          void onRefreshConnections();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isProfessional, onRefreshConnections, userId]);

  const createInvite = async () => {
    setBusy(true);
    try {
      const code = await onCreateInvite();
      setNewCode(code);
      setQrCodeValue(code);
    } catch (error) {
      Alert.alert('Erro ao criar convite', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const acceptInvite = async (codeToUse?: string) => {
    const code = (codeToUse || inviteCode).trim();
    if (!code) {
      Alert.alert('Digite o código', 'Peça o código de conexão ao profissional.');
      return;
    }
    setBusy(true);
    try {
      await onAcceptInvite(code);
      setInviteCode('');
      setShowScannerModal(false);
      Alert.alert('Conexão criada com sucesso!', 'O profissional já foi vinculado à sua equipe de saúde.');
    } catch (error) {
      Alert.alert('Não foi possível conectar', error instanceof Error ? error.message : 'Confira o código e tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const removeConnection = (connection: ProfessionalConnection) => {
    Alert.alert('Remover conexão?', 'Isso encerra o vínculo com o profissional.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await onRemoveConnection(connection);
          } catch (error) {
            Alert.alert('Não foi possível remover', error instanceof Error ? error.message : 'Tente novamente.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <BackHeader
        title={isProfessional ? 'Pacientes Vinculados' : 'Equipe de Cuidado'}
        subtitle={isProfessional ? 'Conexões e chat clínico' : 'Profissionais de saúde conectados'}
        onBack={onBack}
        dm={dm}
      />

      <View style={styles.body}>
        <FadeInItem delay={0}>
        {/* Professional view: Generate Code + QR Code */}
        {isProfessional ? (
          <View style={[styles.inviteCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.sectionHeading}>
              <QrCode size={20} color="#00b690" />
              <Text style={[styles.heading, { color: dm.text }]}>Conectar Novo Paciente</Text>
            </View>
            <Text style={[styles.copy, { color: dm.sub }]}>
              Gere um QR Code ou código para o paciente escanear no consultório.
            </Text>

            {qrCodeValue ? (
              <View style={styles.qrDisplayBox}>
                <QRCode value={qrCodeValue} size={200} color="#264d8c" backgroundColor="#FFFFFF" />
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{newCode}</Text>
                </View>
                <Text style={[styles.qrHint, { color: dm.sub }]}>
                  Válido por 7 dias. O paciente pode ler com a câmera ou digitar o código acima.
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              disabled={busy}
              onPress={createInvite}
              style={[styles.primaryButton, { backgroundColor: '#00b690' }, busy && styles.disabled]}
            >
              <QrCode size={18} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                {busy ? 'Gerando...' : qrCodeValue ? 'Gerar Outro QR Code' : 'Gerar QR Code de Conexão'}
              </Text>
            </TouchableOpacity>

            <View style={styles.privacyRow}>
              <ShieldCheck size={16} color="#00b690" />
              <Text style={[styles.privacyText, { color: dm.sub }]}>
                Apenas pacientes autorizados com o código terão acesso ao canal direto.
              </Text>
            </View>
          </View>
        ) : user.userType === 'Paciente' ? (
          /* Patient view: Scan QR Code or Type Code */
          <View style={[styles.inviteCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.sectionHeading}>
              <ShieldCheck size={20} color="#00b690" />
              <Text style={[styles.heading, { color: dm.text }]}>Vincular Médico ou UBS</Text>
            </View>
            <Text style={[styles.copy, { color: dm.sub }]}>
              Conecte seu médico para compartilhar suas medições e tirar dúvidas no chat.
            </Text>

            {/* QR Code Scan Button */}
            <TouchableOpacity
              onPress={() => setShowScannerModal(true)}
              style={[styles.scanQrBtn, { backgroundColor: 'rgba(0, 182, 144, 0.12)', borderColor: '#00b690' }]}
            >
              <Camera size={20} color="#00b690" />
              <Text style={[styles.scanQrBtnText, { color: '#00b690' }]}>
                Escanear QR Code do Médico
              </Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={[styles.orLine, { backgroundColor: dm.border }]} />
              <Text style={[styles.orText, { color: dm.sub }]}>OU DIGITE O CÓDIGO</Text>
              <View style={[styles.orLine, { backgroundColor: dm.border }]} />
            </View>

            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Ex.: SEDA-8492"
              placeholderTextColor={dm.sub}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[
                styles.input,
                { color: dm.text, borderColor: dm.border, backgroundColor: dm.inputBg },
              ]}
            />

            <TouchableOpacity
              disabled={busy}
              onPress={() => acceptInvite()}
              style={[styles.primaryButton, { backgroundColor: '#00b690' }, busy && styles.disabled]}
            >
              <Text style={styles.primaryButtonText}>
                {busy ? 'Conectando...' : 'Conectar Profissional'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        </FadeInItem>

        {/* List of active connections */}
        <View style={styles.listHeader}>
          <Text style={[styles.heading, { color: dm.text }]}>
            {isProfessional ? 'Pacientes Ativos' : 'Profissionais Vinculados'}
          </Text>
          <Text style={[styles.count, { color: '#00b690' }]}>{connections.length}</Text>
        </View>

        {connections.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <UserRound size={32} color={dm.sub} />
            <Text style={[styles.emptyTitle, { color: dm.text }]}>Nenhum vínculo ativo</Text>
            <Text style={[styles.emptyDesc, { color: dm.sub }]}>
              {isProfessional
                ? 'Gere um QR Code acima e apresente ao paciente para iniciar.'
                : 'Escaneie o QR Code do seu médico para conectá-lo aqui.'}
            </Text>
          </View>
        ) : (
          connections.map((conn) => (
            <View
              key={conn.id}
              style={[styles.connCard, { backgroundColor: dm.card, borderColor: dm.border }]}
            >
              <View style={styles.connLeft}>
                <View style={styles.connAvatar}>
                  <Text style={styles.connAvatarText}>
                    {peerName(conn).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.connName, { color: dm.text }]}>{peerName(conn)}</Text>
                  <Text style={[styles.connRole, { color: dm.sub }]}>
                    {isProfessional ? 'Paciente monitorado' : 'Médico responsável'}
                  </Text>
                </View>
              </View>

              <View style={styles.connActions}>
                <TouchableOpacity
                  onPress={() => onOpenChat(conn)}
                  style={[styles.chatBtn, { backgroundColor: '#00b690' }]}
                >
                  <MessageCircle size={16} color="#FFF" />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeConnection(conn)}
                  style={[styles.trashBtn, { borderColor: dm.border }]}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Interactive QR Scanner Modal for Patient */}
      <Modal visible={showScannerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.scannerModalContent, { backgroundColor: dm.card }]}>
            <View style={styles.scannerModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Camera size={20} color="#00b690" />
                <Text style={[styles.scannerModalTitle, { color: dm.text }]}>
                  Leitor de QR Code SEDA
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowScannerModal(false)}>
                <X size={20} color={dm.sub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.scannerDesc, { color: dm.sub }]}>
              Aponte a câmera para o QR Code gerado na tela do médico.
            </Text>

            {/* Viewfinder Target Box */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinderFrame}>
                <View style={[styles.cornerTL, { borderColor: '#00b690' }]} />
                <View style={[styles.cornerTR, { borderColor: '#00b690' }]} />
                <View style={[styles.cornerBL, { borderColor: '#00b690' }]} />
                <View style={[styles.cornerBR, { borderColor: '#00b690' }]} />
                <View style={styles.scanLaser} />
                <QrCode size={56} color="rgba(0, 182, 144, 0.3)" />
              </View>
            </View>

            {/* Simulated 1-click Connect action for quick testing */}
            <TouchableOpacity
              onPress={() => acceptInvite('SEDA-8492')}
              style={[styles.quickScanAction, { backgroundColor: '#00b690' }]}
            >
              <CheckCircle2 size={18} color="#FFF" />
              <Text style={styles.quickScanActionText}>
                Confirmar Leitura do QR Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 36 },
  body: { padding: 18, gap: 14 },
  inviteCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: '800',
  },
  copy: {
    fontSize: 13,
    lineHeight: 18,
  },
  qrDisplayBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 182, 144, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 182, 144, 0.2)',
    gap: 10,
  },
  codeBadge: {
    backgroundColor: '#264d8c',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  codeBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  qrHint: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  scanQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  scanQrBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabled: { opacity: 0.6 },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  privacyText: {
    fontSize: 11,
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  count: {
    fontSize: 16,
    fontWeight: '900',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  connCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  connLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  connAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00b690',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  connName: {
    fontSize: 14,
    fontWeight: '800',
  },
  connRole: {
    fontSize: 11,
  },
  connActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chatBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  trashBtn: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  scannerModalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
  },
  scannerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scannerModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scannerDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  viewfinderFrame: {
    width: 220,
    height: 220,
    backgroundColor: '#000',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTR: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLaser: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#00b690',
  },
  quickScanAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  quickScanActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
