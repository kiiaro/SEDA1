import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, UserProfile } from '../types';
import { BackHeader } from '../components/BackHeader';

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

  const handleRegister = async () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Informe seu nome e um e-mail válido.'); return;
    }
    if (password.length < 8 || password !== confirmPassword) {
      setErrorMessage('Use uma senha de ao menos 8 caracteres e confirme-a.'); return;
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
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a conta.'); }
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
        title="Cadastro SEDA"
        subtitle="Crie sua conta segura"
        onBack={onBack}
      />

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {errorMessage ? <Text style={[styles.errorText, { backgroundColor: dm.card, borderColor: dm.border }]}>{errorMessage}</Text> : null}
        {/* User Type Toggle */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>Tipo de Perfil</Text>
          <View style={styles.typeRow}>
            {userTypes.map((type) => {
              const isSelected = userType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setUserType(type)}
                  activeOpacity={0.7}
                  style={[
                    styles.typeBtn,
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
            style={[
              styles.input,
              { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: dm.sub }]}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="voce@exemplo.com" placeholderTextColor={dm.sub} style={[styles.input, { backgroundColor: dm.card, borderColor: dm.border, color: dm.text }]} />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>CPF</Text>
            <TextInput
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
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
              value={birthDate}
              onChangeText={setBirthDate}
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
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Opcional"
            placeholderTextColor={dm.sub}
            style={[
              styles.input,
              { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
            ]}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[
                styles.input,
                { backgroundColor: dm.card, borderColor: dm.border, color: dm.text },
              ]}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>Confirmar</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
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
    gap: 14,
  },
  section: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
