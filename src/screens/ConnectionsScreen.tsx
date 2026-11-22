import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageCircle, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { MotionButton as TouchableOpacity } from '../components/Motion';
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

export const ConnectionsScreen: React.FC<Props> = ({ user, userId, connections, onCreateInvite, onAcceptInvite, onRefreshConnections, onRemoveConnection, onOpenChat, onBack, dm }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [busy, setBusy] = useState(false);
  const isProfessional = user.userType === 'Profissional';
  const peerName = (connection: ProfessionalConnection) => isProfessional ? connection.patientName : connection.professionalName;

  React.useEffect(() => {
    const channel = supabase
      .channel(`seda-connections-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'seda_patient_connections',
        filter: `${isProfessional ? 'professional_id' : 'patient_id'}=eq.${userId}`,
      }, () => { void onRefreshConnections(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [isProfessional, onRefreshConnections, userId]);

  const createInvite = async () => {
    setBusy(true);
    try { setNewCode(await onCreateInvite()); }
    catch (error) { Alert.alert('Não foi possível criar o convite', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setBusy(false); }
  };

  const acceptInvite = () => {
    if (!inviteCode.trim()) { Alert.alert('Digite o código', 'Peça o código de conexão ao profissional.'); return; }
    Alert.alert(
      'Conectar com profissional?',
      'Ao continuar, você autoriza o vínculo com esta conta e poderá conversar pelo chat do SEDA. Você pode remover a conexão depois.',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Conectar', onPress: async () => {
          setBusy(true);
          try { await onAcceptInvite(inviteCode); setInviteCode(''); Alert.alert('Conexão criada', 'O profissional já aparece na sua equipe de cuidado.'); }
          catch (error) { Alert.alert('Não foi possível conectar', error instanceof Error ? error.message : 'Confira se o código está correto e dentro da validade.'); }
          finally { setBusy(false); }
        } },
      ],
    );
  };

  const removeConnection = (connection: ProfessionalConnection) => {
    Alert.alert('Remover conexão?', 'Isso encerra o vínculo e apaga o histórico de mensagens para as duas contas.', [
      { text: 'Manter', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try { await onRemoveConnection(connection); }
        catch (error) { Alert.alert('Não foi possível remover', error instanceof Error ? error.message : 'Tente novamente.'); }
      } },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: dm.bg }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <BackHeader title={isProfessional ? 'Pacientes' : 'Equipe de cuidado'} subtitle={isProfessional ? 'Conexões aceitas e chats' : 'Profissionais conectados a você'} onBack={onBack} bgGradient={['#143454', '#315F83', '#55A99C']} />
      <View style={styles.body}>
        {isProfessional ? (
          <View style={[styles.inviteCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.sectionHeading}><UserRound size={19} color={COLORS.primary} /><Text style={[styles.heading, { color: dm.text }]}>Adicionar paciente</Text></View>
            <Text style={[styles.copy, { color: dm.sub }]}>Gere um código e compartilhe com o paciente. Ele precisa aceitá-lo na própria conta para conectar e iniciar o chat.</Text>
            {newCode ? <View style={styles.codeBox}><Text style={styles.codeLabel}>Código válido por 7 dias</Text><Text selectable style={styles.codeValue}>{newCode}</Text></View> : null}
            <TouchableOpacity disabled={busy} onPress={createInvite} style={[styles.primaryButton, busy && styles.disabled]}>
              <Plus size={17} color="#FFF" /><Text style={styles.primaryButtonText}>{busy ? 'Aguarde...' : newCode ? 'Gerar outro código' : 'Gerar código de conexão'}</Text>
            </TouchableOpacity>
            <View style={styles.privacyRow}><ShieldCheck size={16} color={COLORS.success} /><Text style={[styles.privacyText, { color: dm.sub }]}>A rede profissional aceita somente contas de pacientes.</Text></View>
          </View>
        ) : user.userType === 'Paciente' ? (
          <View style={[styles.inviteCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.sectionHeading}><ShieldCheck size={19} color={COLORS.primary} /><Text style={[styles.heading, { color: dm.text }]}>Conectar profissional</Text></View>
            <Text style={[styles.copy, { color: dm.sub }]}>Digite o código que recebeu. Ao aceitar, a conta do profissional será adicionada à sua equipe e vocês poderão conversar no chat.</Text>
            <TextInput value={inviteCode} onChangeText={setInviteCode} placeholder="Ex.: SEDA-XXXXXXXX-XXXXXXXX-XXXXXXXX" placeholderTextColor={dm.sub} autoCapitalize="characters" autoCorrect={false} style={[styles.input, { color: dm.text, borderColor: dm.border, backgroundColor: dm.inputBg }]} />
            <TouchableOpacity disabled={busy} onPress={acceptInvite} style={[styles.primaryButton, busy && styles.disabled]}><Text style={styles.primaryButtonText}>{busy ? 'Conectando...' : 'Aceitar convite'}</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.inviteCard, { backgroundColor: dm.card, borderColor: dm.border }]}><Text style={[styles.copy, { color: dm.sub }]}>As conexões com profissionais estão disponíveis para contas de pacientes.</Text></View>
        )}

        <View style={styles.listHeader}><Text style={[styles.heading, { color: dm.text }]}>{isProfessional ? 'Pacientes conectados' : 'Profissionais conectados'}</Text><Text style={[styles.count, { color: dm.sub }]}>{connections.length}</Text></View>
        {connections.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: dm.card, borderColor: dm.border }]}><MessageCircle size={24} color={dm.sub} /><Text style={[styles.emptyTitle, { color: dm.text }]}>Nenhuma conversa ainda</Text><Text style={[styles.copy, { color: dm.sub, textAlign: 'center' }]}>{isProfessional ? 'Quando um paciente aceitar seu convite, ele aparecerá aqui.' : 'Aceite o código do profissional para iniciar uma conversa.'}</Text></View>
        ) : connections.map((connection) => (
          <View key={connection.id} style={[styles.connectionCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{peerName(connection).split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</Text></View>
            <View style={styles.connectionInfo}><Text style={[styles.connectionName, { color: dm.text }]}>{peerName(connection)}</Text><Text style={[styles.connectionMeta, { color: dm.sub }]}>{isProfessional ? 'Paciente vinculado' : 'Profissional da sua equipe'}</Text></View>
            <TouchableOpacity onPress={() => onOpenChat(connection)} style={styles.chatButton} accessibilityLabel="Abrir chat"><MessageCircle size={17} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => removeConnection(connection)} style={[styles.removeButton, { borderColor: dm.border }]} accessibilityLabel="Remover conexão"><Trash2 size={15} color={COLORS.danger} /></TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { paddingBottom: 24 }, body: { padding: 16, gap: 12 }, inviteCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, heading: { fontSize: 14, fontWeight: '900' }, copy: { fontSize: 11, lineHeight: 17 }, input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 }, primaryButton: { minHeight: 46, borderRadius: 14, backgroundColor: COLORS.primaryDk, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 14 }, primaryButtonText: { color: '#FFF', fontSize: 12, fontWeight: '900' }, disabled: { opacity: 0.6 }, codeBox: { backgroundColor: '#EAF2F8', borderRadius: 14, padding: 13, alignItems: 'center', gap: 3 }, codeLabel: { fontSize: 10, color: '#64748B', fontWeight: '700' }, codeValue: { fontSize: 22, color: COLORS.primaryDk, fontWeight: '900', letterSpacing: 1.5 }, privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, privacyText: { flex: 1, fontSize: 10, lineHeight: 15 }, listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }, count: { fontSize: 12, fontWeight: '800' }, emptyCard: { alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 18, padding: 20 }, emptyTitle: { fontSize: 13, fontWeight: '800' }, connectionCard: { borderWidth: 1, borderRadius: 18, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }, avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#DDEAF5', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: COLORS.primaryDk, fontSize: 12, fontWeight: '900' }, connectionInfo: { flex: 1, gap: 3 }, connectionName: { fontSize: 12, fontWeight: '800' }, connectionMeta: { fontSize: 10 }, chatButton: { width: 36, height: 36, borderRadius: 13, backgroundColor: COLORS.primaryDk, justifyContent: 'center', alignItems: 'center' }, removeButton: { width: 34, height: 36, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
});
