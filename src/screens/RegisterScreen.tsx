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
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, UserProfile } from '../types';
import { BackHeader } from '../components/BackHeader';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { useInputVisibility } from '../components/useInputVisibility';

interface RegisterScreenProps {
  onRegisterComplete: (email: string, password: string, profile: UserProfile) => Promise<void>;
  onLoginGoogle?: (preferredRole?: UserProfile['userType']) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
}

const PRESET_CONDITIONS = [
  'Hipertensão Arterial Sistêmica',
  'Diabetes Mellitus Tipo 2',
  'Colesterol Alto',
  'Cardiopatia',
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterComplete,
  onLoginGoogle,
  onBack,
  dm,
}) => {
  const [userType, setUserType] = useState<'Paciente' | 'Familiar' | 'Profissional'>('Paciente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [susCard, setSusCard] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [councilRegister, setCouncilRegister] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientRelation, setPatientRelation] = useState('Mãe / Pai');
  const [patientPhone, setPatientPhone] = useState('');
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
      showError('Informe seu nome e um e-mail válido.');
      return;
    }
    if (password.length < 6 || password !== confirmPassword) {
      showError('Use uma senha de ao menos 6 caracteres e confirme-a.');
      return;
    }
    setBusy(true);
    setErrorMessage('');
    const profile: UserProfile = {
      name: name.trim(),
      cpf: cpf.trim(),
      phone: phone.trim(),
      birthDate: birthDate.trim(),
      susCard: userType === 'Paciente' ? susCard.trim() : '',
      userType,
      bloodType: '',
      professionalInfo:
        userType === 'Profissional'
          ? {
              councilRegister: councilRegister.trim(),
              specialty: specialty.trim(),
              clinicName: clinicName.trim(),
            }
          : undefined,
      monitoredPatient:
        userType === 'Familiar'
          ? {
              name: patientName.trim(),
              relation: patientRelation.trim() || 'Familiar',
              phone: patientPhone.trim(),
              conditions: selectedConditions,
            }
          : undefined,
      emergencyContact: { name: '', phone: '', relation: '' },
      conditions: userType === 'Paciente' ? selectedConditions : [],
      medications: [],
    };
    try {
      await onRegisterComplete(email.trim().toLowerCase(), password, profile);
    } catch (error: any) {
      const err = error instanceof Error ? error.message : 'Não foi possível criar a conta.';
      if (err.toLowerCase().includes('rate') || err.toLowerCase().includes('limit') || err.toLowerCase().includes('over_email')) {
        showError('⚠️ Limite de envio de e-mails atingido no servidor Supabase. Cadastre-se em 1 clique com o botão "Continuar com o Google" acima.');
      } else {
        showError(err);
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions((curr) =>
      curr.includes(cond) ? curr.filter((item) => item !== cond) : [...curr, cond]
    );
  };

  const handleGoogle = async () => {
    if (!onLoginGoogle) return;
    setBusy(true);
    setErrorMessage('');
    try {
      await onLoginGoogle(userType);
    } catch (error: any) {
      showError(error instanceof Error ? error.message : 'Falha na autenticação Google.');
    } finally {
      setBusy(false);
    }
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
        subtitle="Sistema de Equilíbrio de Diabetes e Artérias"
        onBack={onBack}
        dm={dm}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.formScroll}
        contentContainerStyle={[styles.formContent, compact && styles.formContentCompact]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FadeInItem delay={0}>
        {/* Google Quick Sign Up */}
        <TouchableOpacity
          onPress={handleGoogle}
          disabled={busy}
          activeOpacity={0.8}
          style={[styles.googleBtn, { borderColor: dm.border, backgroundColor: dm.card }]}
          accessibilityLabel="Cadastrar com Google"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <Path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <Path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <Path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </Svg>
          <Text style={[styles.googleBtnText, { color: dm.text }]}>
            Cadastrar com o Google
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: dm.border }]} />
          <Text style={[styles.dividerText, { color: dm.sub }]}>OU PREENCHA OS DADOS</Text>
          <View style={[styles.dividerLine, { backgroundColor: dm.border }]} />
        </View>

        </FadeInItem>

        {errorMessage ? (
          <View style={[styles.errorBox, { borderColor: COLORS.secondary, backgroundColor: 'rgba(38, 77, 140, 0.10)' }]}>
            <Text style={[styles.errorText, { color: dm.text }]}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* User Type Toggle */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>Tipo de Perfil</Text>
          <Text style={[styles.profileHint, { color: dm.sub }]}>
            {userType === 'Paciente'
              ? 'Registre e acompanhe suas próprias medições de pressão e glicemia.'
              : userType === 'Familiar'
              ? 'Acompanhe a saúde de pais ou familiares, com alertas e lembretes de remédios.'
              : 'Gere QR Codes de conexão, acompanhe pacientes e converse pelo chat.'}
          </Text>
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
                      backgroundColor: isSelected ? 'rgba(0, 182, 144, 0.12)' : dm.card,
                      borderColor: isSelected ? '#00b690' : dm.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      {
                        color: isSelected ? '#00b690' : dm.sub,
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
            placeholder="Ex.: Maria Silva"
            placeholderTextColor={dm.sub}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>E-mail</Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            onFocus={keepInputVisible}
            placeholder="maria@exemplo.com"
            placeholderTextColor={dm.sub}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => cpfRef.current?.focus()}
            style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
          />
        </View>

        <View style={[styles.row, compact && styles.rowCompact]}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>CPF</Text>
            <TextInput
              ref={cpfRef}
              value={cpf}
              onChangeText={setCpf}
              onFocus={keepInputVisible}
              placeholder="000.000.000-00"
              placeholderTextColor={dm.sub}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => birthDateRef.current?.focus()}
              style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>Nascimento</Text>
            <TextInput
              ref={birthDateRef}
              value={birthDate}
              onChangeText={setBirthDate}
              onFocus={keepInputVisible}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={dm.sub}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>WhatsApp / Celular</Text>
          <TextInput
            ref={phoneRef}
            value={phone}
            onChangeText={setPhone}
            onFocus={keepInputVisible}
            placeholder="(11) 90000-0000"
            placeholderTextColor={dm.sub}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
          />
        </View>

        {/* Role-Specific Profile Configuration */}
        {userType === 'Profissional' && (
          <View style={[styles.roleConfigCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.roleConfigTitle, { color: dm.text }]}>Dados Profissionais</Text>
            <View style={styles.section}>
              <Text style={[styles.label, { color: dm.sub }]}>Registro (CRM / COREN)</Text>
              <TextInput
                value={councilRegister}
                onChangeText={setCouncilRegister}
                onFocus={keepInputVisible}
                placeholder="Ex.: CRM-SP 123456"
                placeholderTextColor={dm.sub}
                style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
              />
            </View>
            <View style={styles.section}>
              <Text style={[styles.label, { color: dm.sub }]}>Especialidade</Text>
              <TextInput
                value={specialty}
                onChangeText={setSpecialty}
                onFocus={keepInputVisible}
                placeholder="Ex.: Clínico Geral / Cardiologia"
                placeholderTextColor={dm.sub}
                style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
              />
            </View>
            <View style={styles.section}>
              <Text style={[styles.label, { color: dm.sub }]}>Unidade / Consultório</Text>
              <TextInput
                value={clinicName}
                onChangeText={setClinicName}
                onFocus={keepInputVisible}
                placeholder="Ex.: UBS Vila Esperança"
                placeholderTextColor={dm.sub}
                style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
              />
            </View>
          </View>
        )}

        {userType === 'Familiar' && (
          <View style={[styles.roleConfigCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.roleConfigTitle, { color: dm.text }]}>Paciente Acompanhado</Text>
            <View style={styles.section}>
              <Text style={[styles.label, { color: dm.sub }]}>Nome do Paciente</Text>
              <TextInput
                value={patientName}
                onChangeText={setPatientName}
                onFocus={keepInputVisible}
                placeholder="Ex.: Dona Maria Silva"
                placeholderTextColor={dm.sub}
                style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
              />
            </View>
            <View style={[styles.row, compact && styles.rowCompact]}>
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={[styles.label, { color: dm.sub }]}>Parentesco</Text>
                <TextInput
                  value={patientRelation}
                  onChangeText={setPatientRelation}
                  onFocus={keepInputVisible}
                  placeholder="Ex.: Mãe / Pai"
                  placeholderTextColor={dm.sub}
                  style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
                />
              </View>
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={[styles.label, { color: dm.sub }]}>Telefone do Paciente</Text>
                <TextInput
                  value={patientPhone}
                  onChangeText={setPatientPhone}
                  onFocus={keepInputVisible}
                  placeholder="(11) 98765-4321"
                  placeholderTextColor={dm.sub}
                  keyboardType="phone-pad"
                  style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
                />
              </View>
            </View>
          </View>
        )}

        {userType === 'Paciente' && (
          <View style={[styles.roleConfigCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.roleConfigTitle, { color: dm.text }]}>Saúde & Cartão SUS (opcional)</Text>
            <View style={styles.section}>
              <Text style={[styles.label, { color: dm.sub }]}>Número do Cartão SUS</Text>
              <TextInput
                value={susCard}
                onChangeText={setSusCard}
                onFocus={keepInputVisible}
                placeholder="000 0000 0000 0000"
                placeholderTextColor={dm.sub}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: dm.inputBg, borderColor: dm.border, color: dm.text }]}
              />
            </View>
            <View style={styles.section}>
              <Text style={[styles.label, { color: dm.sub }]}>Condições Monitoradas</Text>
              <View style={styles.chipWrap}>
                {PRESET_CONDITIONS.map((cond) => {
                  const active = selectedConditions.includes(cond);
                  return (
                    <TouchableOpacity
                      key={cond}
                      onPress={() => toggleCondition(cond)}
                      style={[
                        styles.condChip,
                        {
                          backgroundColor: active ? 'rgba(0, 182, 144, 0.14)' : dm.inputBg,
                          borderColor: active ? '#00b690' : dm.border,
                        },
                      ]}
                    >
                      <Text style={[styles.condChipText, { color: active ? '#00b690' : dm.sub }]}>
                        {cond}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        <View style={[styles.row, compact && styles.rowCompact]}>
          <View style={[styles.section, { flex: 1 }]}>
            <View style={styles.passwordLabelRow}>
              <Text style={[styles.label, { color: dm.sub }]}>Senha</Text>
              <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
                <Text style={[styles.showPassword, { color: '#00b690' }]}>
                  {showPasswords ? 'Ocultar' : 'Ver'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              onFocus={keepInputVisible}
              placeholder="Mín. 6 dígitos"
              placeholderTextColor={dm.sub}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>Confirmar Senha</Text>
            <TextInput
              ref={confirmPasswordRef}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={keepInputVisible}
              placeholder="Repita a senha"
              placeholderTextColor={dm.sub}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]}
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={busy}
          activeOpacity={0.8}
          style={[styles.submitBtn, { backgroundColor: '#00b690' }]}
        >
          <Text style={styles.submitBtnText}>{busy ? 'Criando conta...' : 'Finalizar Cadastro'}</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  errorBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCompact: { flexDirection: 'column' },
  passwordLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  showPassword: { fontSize: 11, fontWeight: '800' },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileHint: { fontSize: 12, lineHeight: 17 },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeRowCompact: { flexWrap: 'wrap' },
  typeBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnCompact: {
    minWidth: '45%',
  },
  typeBtnText: { fontSize: 13 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  roleConfigCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  roleConfigTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  condChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  condChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
