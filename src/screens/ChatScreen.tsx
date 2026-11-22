import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Send, ShieldCheck } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { MotionButton as TouchableOpacity } from '../components/Motion';
import { COLORS } from '../constants/theme';
import { ChatMessage, DarkModeTheme, ProfessionalConnection } from '../types';
import { loadChatMessages, sendChatMessage } from '../lib/professional';
import { supabase } from '../lib/supabase';

interface Props {
  connection: ProfessionalConnection;
  userId: string;
  peerName: string;
  dm: DarkModeTheme;
  onBack: () => void;
}

export const ChatScreen: React.FC<Props> = ({ connection, userId, peerName, dm, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const loaded = await loadChatMessages(connection.id);
        if (active) setMessages(loaded);
      } catch (error) {
        if (active) Alert.alert('Não foi possível carregar o chat', error instanceof Error ? error.message : 'Verifique sua conexão.');
      } finally { if (active) setLoading(false); }
    };
    void refresh();
    const channel = supabase
      .channel(`seda-chat-${connection.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'seda_chat_messages', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        const row = payload.new as { id: string; connection_id: string; sender_id: string; body: string; created_at: string };
        const next: ChatMessage = { id: row.id, connectionId: row.connection_id, senderId: row.sender_id, body: row.body, createdAt: row.created_at };
        if (active) setMessages((current) => current.some((item) => item.id === next.id) ? current : [...current, next]);
      })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [connection.id]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft('');
    try {
      const message = await sendChatMessage(connection.id, userId, body);
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    } catch (error) {
      setDraft(body);
      Alert.alert('Mensagem não enviada', error instanceof Error ? error.message : 'Confira a conexão e tente novamente.');
    } finally { setSending(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: dm.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
      <BackHeader title={peerName} subtitle="Chat ao vivo · mensagens privadas" onBack={onBack} bgGradient={['#143454', '#315F83', '#55A99C']} />
      <View style={styles.privacy}><ShieldCheck size={15} color={COLORS.success} /><Text style={[styles.privacyText, { color: dm.sub }]}>Conversa acessível apenas às duas contas conectadas.</Text></View>
      <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={styles.messageContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
        {loading ? <Text style={[styles.emptyText, { color: dm.sub }]}>Carregando mensagens...</Text> : null}
        {!loading && messages.length === 0 ? <View style={styles.empty}><Text style={[styles.emptyTitle, { color: dm.text }]}>Conversa iniciada</Text><Text style={[styles.emptyText, { color: dm.sub }]}>Envie uma mensagem para começar. Evite compartilhar informações de emergência por aqui.</Text></View> : null}
        {messages.map((message) => {
          const mine = message.senderId === userId;
          return <View key={message.id} style={[styles.messageRow, mine ? styles.myRow : styles.theirRow]}><View style={[styles.bubble, mine ? styles.myBubble : [styles.theirBubble, { backgroundColor: dm.card, borderColor: dm.border }]]}><Text style={[styles.messageText, { color: mine ? '#FFFFFF' : dm.text }]}>{message.body}</Text><Text style={[styles.messageTime, { color: mine ? 'rgba(255,255,255,.75)' : dm.sub }]}>{new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View></View>;
        })}
      </ScrollView>
      <View style={[styles.composer, { backgroundColor: dm.card, borderTopColor: dm.border }]}>
        <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Escreva uma mensagem..." placeholderTextColor={dm.sub} multiline maxLength={2000} style={[styles.input, { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border }]} returnKeyType="send" />
        <TouchableOpacity onPress={send} disabled={!draft.trim() || sending} style={[styles.sendButton, (!draft.trim() || sending) && styles.sendDisabled]} accessibilityLabel="Enviar mensagem"><Send size={18} color="#FFFFFF" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, privacy: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 10 }, privacyText: { fontSize: 10, flex: 1 }, messageList: { flex: 1 }, messageContent: { padding: 14, gap: 9, flexGrow: 1, justifyContent: 'flex-end' }, messageRow: { width: '100%', flexDirection: 'row' }, myRow: { justifyContent: 'flex-end' }, theirRow: { justifyContent: 'flex-start' }, bubble: { maxWidth: '84%', borderRadius: 17, paddingHorizontal: 12, paddingTop: 9, paddingBottom: 6, borderWidth: 1 }, myBubble: { backgroundColor: COLORS.primaryDk, borderColor: COLORS.primaryDk, borderBottomRightRadius: 5 }, theirBubble: { borderBottomLeftRadius: 5 }, messageText: { fontSize: 13, lineHeight: 19 }, messageTime: { fontSize: 9, alignSelf: 'flex-end', marginTop: 4 }, empty: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }, emptyTitle: { fontSize: 15, fontWeight: '800' }, emptyText: { textAlign: 'center', fontSize: 11, lineHeight: 17 }, composer: { borderTopWidth: 1, padding: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, input: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 10, fontSize: 13 }, sendButton: { height: 44, width: 44, borderRadius: 15, backgroundColor: COLORS.primaryDk, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.45 },
});
