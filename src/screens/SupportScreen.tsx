import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bot, Send } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { MotionButton as TouchableOpacity } from '../components/Motion';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';

interface Props { onBack: () => void; dm: DarkModeTheme }
interface Message { id: string; from: 'bot' | 'user'; text: string }

const FAQ = [
  'Como edito meus dados?',
  'Como registro pressão?',
  'Como registro glicemia?',
  'Como conecto um profissional?',
  'Como recupero minha senha?',
  'Como vejo minhas consultas?',
  'Como funciona a emergência?',
  'Meus dados estão protegidos?',
];

const answerFor = (question: string) => {
  const text = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (text.includes('senha') || text.includes('login') || text.includes('entrar')) return 'Na tela de entrada, toque em “Esqueci minha senha”, informe seu e-mail e siga o link enviado para redefinir a senha.';
  if (text.includes('pressao')) return 'Na página inicial, toque em “Pressão”, informe os valores da medição e toque em salvar. O registro aparece no histórico.';
  if (text.includes('glicemia') || text.includes('glicose')) return 'Na página inicial, toque em “Glicemia”, informe o valor e, se quiser, indique se foi antes ou depois da refeição. Depois toque em salvar.';
  if (text.includes('profissional') || text.includes('equipe') || text.includes('chat') || text.includes('conectar')) return 'O profissional gera um código em Painel > Pacientes. Na sua conta de paciente, abra Equipe, informe o código e aceite o vínculo. Depois, toque no nome para abrir o chat.';
  if (text.includes('perfil') || text.includes('dados') || text.includes('telefone') || text.includes('contato')) return 'Abra Perfil e toque em “Editar perfil” para atualizar seu nome, telefone e contato de emergência. Finalize em “Salvar alterações”.';
  if (text.includes('consulta') || text.includes('agenda') || text.includes('agendamento')) return 'Abra “Consultas” ou “Agenda” na navegação. Para incluir um atendimento, toque em adicionar e preencha data, horário e informações disponíveis.';
  if (text.includes('emergencia') || text.includes('samu') || text.includes('socorro')) return 'O botão SOS inicia uma ligação para o SAMU 192; o app não envia chamados automaticamente. Em uma emergência, ligue para 192.';
  if (text.includes('segur') || text.includes('privacidade') || text.includes('proteg')) return 'Seus dados da conta ficam separados. O chat é acessível apenas às contas conectadas. Você pode remover uma conexão pela lista da equipe ou de pacientes.';
  if (text.includes('historico') || text.includes('historico') || text.includes('medicao')) return 'Toque em “Histórico” na navegação para consultar as medições salvas. Puxe a tela inicial para baixo para sincronizar os dados.';
  return 'Ainda não encontrei uma resposta para essa dúvida. Escolha um dos assuntos abaixo para ver as orientações disponíveis. Sou um assistente automático e não substituo atendimento profissional.';
};

export const SupportScreen: React.FC<Props> = ({ onBack, dm }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', from: 'bot', text: 'Olá! Sou o assistente do SEDA. Toque em uma dúvida frequente ou escreva sua pergunta. Posso ajudar com o uso do aplicativo.' }]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const ask = (question: string) => {
    setMessages((current) => [...current, { id: `u-${Date.now()}`, from: 'user', text: question }, { id: `b-${Date.now()}`, from: 'bot', text: answerFor(question) }]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: dm.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader title="Ajuda e suporte" subtitle="Respostas rápidas sobre o SEDA" onBack={onBack} bgGradient={['#253E4C', '#355D6E', '#47778D']} />
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.row, message.from === 'user' ? styles.userRow : styles.botRow]}>
            {message.from === 'bot' ? <View style={styles.botIcon}><Bot size={15} color="#FFFFFF" /></View> : null}
            <View style={[styles.bubble, message.from === 'user' ? styles.userBubble : [styles.botBubble, { backgroundColor: dm.card, borderColor: dm.border }]]}>
              <Text style={[styles.messageText, { color: message.from === 'user' ? '#FFFFFF' : dm.text }]}>{message.text}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.faqTitle, { color: dm.sub }]}>DÚVIDAS FREQUENTES</Text>
        <View style={styles.faqList}>
          {FAQ.map((question) => (
            <TouchableOpacity key={question} onPress={() => ask(question)} style={[styles.faqButton, { backgroundColor: dm.card, borderColor: dm.border }]}>
              <Text style={[styles.faqText, { color: dm.text }]}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.composer, { backgroundColor: dm.card, borderTopColor: dm.border }]}>
        <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={() => draft.trim() && ask(draft.trim())} placeholder="Digite sua dúvida" placeholderTextColor={dm.sub} returnKeyType="send" style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]} />
        <TouchableOpacity onPress={() => draft.trim() && ask(draft.trim())} disabled={!draft.trim()} style={[styles.sendButton, !draft.trim() && styles.disabled]} accessibilityLabel="Enviar dúvida"><Send size={17} color="#FFFFFF" /></TouchableOpacity>
      </View>
      <Text style={[styles.disclaimer, { backgroundColor: dm.card, color: dm.sub }]}>Assistente automático para dúvidas de uso. Não fornece orientação médica.</Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, chat: { flex: 1 }, chatContent: { padding: 14, gap: 11, paddingBottom: 18 }, row: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 7 }, botRow: { justifyContent: 'flex-start' }, userRow: { justifyContent: 'flex-end' }, botIcon: { width: 27, height: 27, borderRadius: 10, backgroundColor: COLORS.primaryDk, alignItems: 'center', justifyContent: 'center' }, bubble: { maxWidth: '86%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 }, botBubble: { borderBottomLeftRadius: 5 }, userBubble: { backgroundColor: COLORS.primaryDk, borderColor: COLORS.primaryDk, borderBottomRightRadius: 5 }, messageText: { fontSize: 12, lineHeight: 18 }, faqTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 0.7, marginTop: 6 }, faqList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, faqButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 }, faqText: { fontSize: 10, fontWeight: '700' }, composer: { borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 6, flexDirection: 'row', gap: 8, alignItems: 'center' }, input: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, fontSize: 13 }, sendButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryDk }, disabled: { opacity: 0.45 }, disclaimer: { paddingHorizontal: 10, paddingBottom: 7, fontSize: 9, textAlign: 'center' },
});
