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
import { DarkModeTheme } from '../types';
import { BackHeader } from '../components/BackHeader';

interface RegisterScreenProps {
  onRegisterComplete: () => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterComplete,
  onBack,
  dm,
}) => {
  const [userType, setUserType] = useState<'Paciente' | 'Familiar' | 'Profissional'>('Paciente');
  const [name, setName] = useState('Antônio Carlos Silva');
  const [cpf, setCpf] = useState('123.456.789-00');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [birthDate, setBirthDate] = useState('14/05/1962');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');

  const userTypes: ('Paciente' | 'Familiar' | 'Profissional')[] = [
    'Paciente',
    'Familiar',
    'Profissional',
  ];

  return (
    <View style={[styles.container, { backgroundColor: dm.bg }]}>
      <BackHeader
        title="Cadastro SEDA"
        subtitle="Vínculo integrado com UBS & SUS"
        onBack={onBack}
      />

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: dm.sub }]}>CPF</Text>
            <TextInput
              value={cpf}
              onChangeText={setCpf}
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
          onPress={onRegisterComplete}
          activeOpacity={0.8}
          style={[styles.submitBtn, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.submitBtnText}>Finalizar Cadastro</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
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
