import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, UserProfile } from '../types';
import { BackHeader } from '../components/BackHeader';
import { MotionButton as TouchableOpacity } from '../components/Motion';
import { useInputVisibility } from '../components/useInputVisibility';

interface RegisterScreenProps {
  onRegisterComplete: (email: string, password: string, profile: UserProfile) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterComplete,
  onBack,
  dm,
}) => {
  const [userType, setUserType] = useState<'Paciente' | 'Familiar' | 'Profissional'>('Paciente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const { scrollRef, keepInputVisible } = useInputVisibility();
  const emailRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const birthDateRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    Keyboard.dismiss();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRegister = async () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError('Informe seu nome e um e-mail válido.'); return;
    }
    if (password.length < 8 || password !== confirmPassword) {
      showError('Use uma senha de ao menos 8 caracteres e confirme-a.'); return;
    }
    setBusy(true);
    setErrorMessage('');
    const profile: UserProfile = {
      name: name.trim(), cpf: cpf.trim(), phone: phone.trim(), birthDate: birthDate.trim(),
      susCard: '', userType, bloodType: '',
      emergencyContact: { name: '', phone: '', relation: '' },
      conditions: [], medications: [],
    };
    try { await onRegisterComplete(email.trim().toLowerCase(), password, profile); }
    catch (error) { showError(error instanceof Error ? error.message : 'Não foi possível criar a conta.'); }
    finally { setBusy(false); }
  };

  const userTypes: ('Paciente' | 'Familiar' | 'Profissional')[] = [
    'Paciente',
    'Familiar',
    'Profissional',
  ];

  return (
    <View style={[styles.container, { backgroundColor: dm.bg }]}>
      <BackHeader
        title="Criar conta SEDA"
        subtitle="Crie sua conta segura"
        onBack={onBack}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.formScroll}
        contentContainerStyle={[styles.formContent, compact && styles.formContentCompact]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {errorMessage ? <Text style={[styles.errorText, { backgroundColor: dm.card, borderColor: dm.border }]}>{errorMessage}</Text> : null}
        {/* User Type Toggle */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>Tipo de Perfil</Text>
          <Text style={[styles.profileHint, { color: dm.sub }]}>{userType === 'Paciente' ? 'Registre e acompanhe suas próprias medições e consultas.' : userType === 'Familiar' ? 'Organize sua rotina de cuidado, registre medições e cadastre sua rede de apoio.' : 'Use o diário para registrar medições e organizar informações de acompanhamento.'}</Text>
          <View style={[styles.typeRow, compact && styles.typeRowCompact]}>
            {userTypes.map((type) => {
              const isSelected = userType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setUserType(type)}
                  activeOpacity={0.7}
                  style={[
                    styles.typeBtn,
                    compact && styles.typeBtnCompact,
                    {
                      backgroundColor: isSelected ? `${COLORS.primary}18` : dm.card,
                      borderColor: isSelected ? COLORS.primary : dm.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      {
                        color: isSelected ? COLORS.primary : dm.sub,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>Nome Completo</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={keepInputVisible}
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            style={[
              styles.input,
              { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>E-mail</Text>
          <TextInput ref={emailRef} value={email} onChangeText={setEmail} onFocus={keepInputVisible} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={() => cpfRef.current?.focus()} placeholder="voce@exemplo.com" placeholderTextColor={dm.sub} style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]} />
        </View>

        <View style={[styles.row, compact && styles.rowCompact]}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>CPF</Text>
            <TextInput
              ref={cpfRef}
              value={cpf}
              onChangeText={setCpf}
              onFocus={keepInputVisible}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => birthDateRef.current?.focus()}
              placeholder="Opcional"
              placeholderTextColor={dm.sub}
              style={[
                styles.input,
                { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
              ]}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>Nascimento</Text>
            <TextInput
              ref={birthDateRef}
              value={birthDate}
              onChangeText={setBirthDate}
              onFocus={keepInputVisible}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={dm.sub}
              style={[
                styles.input,
                { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
              ]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>Telefone / WhatsApp</Text>
          <TextInput
            ref={phoneRef}
            value={phone}
            onChangeText={setPhone}
            onFocus={keepInputVisible}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="Opcional"
            placeholderTextColor={dm.sub}
            style={[
              styles.input,
              { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
            ]}
          />
        </View>

        <View style={[styles.row, compact && styles.rowCompact]}>
          <View style={[styles.section, { flex: 1 }]}>
            <View style={styles.passwordLabelRow}>
              <Text style={[styles.label, { color: dm.sub }]}>Senha</Text>
              <TouchableOpacity onPress={() => setShowPasswords((value) => !value)} accessibilityRole="button" accessibilityLabel={showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}>
                <Text style={[styles.showPassword, { color: COLORS.primary }]}>{showPasswords ? 'Ocultar' : 'Mostrar'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              onFocus={keepInputVisible}
              secureTextEntry={!showPasswords}
              autoComplete="new-password"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              style={[
                styles.input,
                { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
              ]}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>Confirmar</Text>
            <TextInput
              ref={confirmPasswordRef}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={keepInputVisible}
              secureTextEntry={!showPasswords}
              autoComplete="new-password"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              style={[
                styles.input,
                { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
              ]}
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={busy}
          activeOpacity={0.8}
          style={[styles.submitBtn, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.submitBtnText}>{busy ? 'Criando conta...' : 'Finalizar Cadastro'}</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: { color: '#B91C1C', padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 12, fontSize: 13 },
  container: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  formContentCompact: { paddingHorizontal: 16 },
  section: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCompact: { flexDirection: 'column' },
  passwordLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  showPassword: { fontSize: 12, fontWeight: '800' },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileHint: { fontSize: 13, lineHeight: 19 },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeRowCompact: { flexWrap: 'wrap' },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnCompact: { flexBasis: '46%' },
  typeBtnText: {
    fontSize: 12,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1.5,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
