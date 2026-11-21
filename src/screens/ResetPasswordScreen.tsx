import React, { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { MotionButton } from '../components/Motion';
import { useInputVisibility } from '../components/useInputVisibility';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';

export function ResetPasswordScreen({ onSave, onBack, dm }: { onSave: (password: string) => Promise<void>; onBack: () => void; dm: DarkModeTheme }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const { scrollRef, keepInputVisible } = useInputVisibility();
  const submit = async () => {
    if (password.length < 8) { setMessage('Use pelo menos 8 caracteres.'); return; }
    if (password !== confirm) { setMessage('As senhas estão diferentes.'); return; }
    setBusy(true); setMessage('');
    try { await onSave(password); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'O link pode ter expirado. Solicite outro e-mail.'); }
    finally { setBusy(false); }
  };
  return <View style={[styles.page, { backgroundColor: dm.bg }]}>
    <BackHeader title="Nova senha" subtitle="Escolha uma senha para sua conta" onBack={onBack} bgGradient={['#1E3A5F', '#3D6E9F']} />
    <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
        <Text style={[styles.title, { color: dm.text }]}>Redefina sua senha</Text>
        <Text style={[styles.help, { color: dm.sub }]}>Crie uma senha com pelo menos 8 caracteres.</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: dm.sub }]}>Nova senha</Text>
          <View style={styles.inputWrap}><TextInput value={password} onChangeText={setPassword} onFocus={keepInputVisible} secureTextEntry={!visible} autoComplete="new-password" autoCapitalize="none" style={[styles.input, { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border }]} /><MotionButton onPress={() => setVisible(!visible)} accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} style={styles.eye}>{visible ? <EyeOff size={19} color={dm.sub} /> : <Eye size={19} color={dm.sub} />}</MotionButton></View>
        </View>
        <View style={styles.field}><Text style={[styles.label, { color: dm.sub }]}>Confirmar senha</Text><TextInput value={confirm} onChangeText={setConfirm} onFocus={keepInputVisible} secureTextEntry={!visible} autoComplete="new-password" autoCapitalize="none" returnKeyType="done" onSubmitEditing={submit} style={[styles.input, { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border }]} /></View>
        {message ? <Text accessibilityRole="alert" style={[styles.feedback, { color: dm.text, borderColor: dm.border }]}>{message}</Text> : null}
        <MotionButton onPress={submit} disabled={busy} style={styles.button}><Text style={styles.buttonText}>{busy ? 'Salvando...' : 'Salvar nova senha'}</Text><ArrowRight size={18} color="#fff" /></MotionButton>
        <Text style={[styles.footer, { color: dm.sub }]}>Depois de salvar, entre novamente com sua senha nova.</Text>
      </View>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, content: { flexGrow: 1, padding: 18, justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: '800' }, help: { fontSize: 14, lineHeight: 20, marginTop: -8 },
  field: { gap: 7 }, label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingRight: 52, fontSize: 16 },
  eye: { position: 'absolute', right: 8, minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  feedback: { padding: 12, borderWidth: 1, borderRadius: 12, fontSize: 13, lineHeight: 18 },
  button: { minHeight: 52, borderRadius: 15, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 }, footer: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
