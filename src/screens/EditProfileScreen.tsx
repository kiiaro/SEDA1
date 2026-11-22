import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Save } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { MotionButton as TouchableOpacity } from '../components/Motion';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const EditProfileScreen: React.FC<Props> = ({ user, onSave, onBack, dm }) => {
  const [draft, setDraft] = useState<UserProfile>({ ...user, emergencyContact: { ...user.emergencyContact } });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof UserProfile, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const updateEmergency = (key: keyof UserProfile['emergencyContact'], value: string) =>
    setDraft((current) => ({ ...current, emergencyContact: { ...current.emergencyContact, [key]: value } }));

  const save = async () => {
    if (!draft.name.trim()) { Alert.alert('Nome obrigatório', 'Informe como você quer aparecer no SEDA.'); return; }
    if (draft.phone && draft.phone.replace(/\D/g, '').length < 10) { Alert.alert('Telefone inválido', 'Informe o DDD e o número completo.'); return; }
    if (draft.emergencyContact.phone && draft.emergencyContact.phone.replace(/\D/g, '').length < 10) { Alert.alert('Contato de emergência inválido', 'Informe o DDD e o número completo.'); return; }
    setSaving(true);
    try { await onSave({ ...draft, name: draft.name.trim(), phone: draft.phone.trim() }); }
    catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Verifique a conexão e tente novamente.'); }
    finally { setSaving(false); }
  };

  const field = (label: string, value: string, onChangeText: (value: string) => void, options: { keyboardType?: 'default' | 'phone-pad' | 'numeric'; placeholder?: string } = {}) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: dm.sub }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={options.placeholder ?? label}
        placeholderTextColor={dm.sub}
        keyboardType={options.keyboardType ?? 'default'}
        autoCapitalize={options.keyboardType === 'phone-pad' || options.keyboardType === 'numeric' ? 'none' : 'words'}
        style={[styles.input, { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border }]}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: dm.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader title="Editar perfil" subtitle="Atualize seus dados de contato" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
          <Text style={[styles.sectionTitle, { color: dm.text }]}>Dados pessoais</Text>
          {field('Nome completo', draft.name, (value) => update('name', value))}
          {field('Telefone com DDD', draft.phone, (value) => update('phone', value), { keyboardType: 'phone-pad', placeholder: '(00) 00000-0000' })}
          {field('CPF', draft.cpf, (value) => update('cpf', value), { keyboardType: 'numeric', placeholder: '000.000.000-00' })}
          {field('Data de nascimento', draft.birthDate, (value) => update('birthDate', value), { placeholder: 'DD/MM/AAAA' })}
          {draft.userType === 'Paciente' ? (
            <>
              {field('Cartão SUS', draft.susCard, (value) => update('susCard', value), { keyboardType: 'numeric' })}
              {field('Tipo sanguíneo', draft.bloodType, (value) => update('bloodType', value), { placeholder: 'Ex.: O+' })}
            </>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
          <Text style={[styles.sectionTitle, { color: dm.text }]}>Contato de emergência</Text>
          {field('Nome do contato', draft.emergencyContact.name, (value) => updateEmergency('name', value))}
          {field('Parentesco ou vínculo', draft.emergencyContact.relation, (value) => updateEmergency('relation', value), { placeholder: 'Ex.: filha, irmão, cuidador' })}
          {field('Telefone com DDD', draft.emergencyContact.phone, (value) => updateEmergency('phone', value), { keyboardType: 'phone-pad', placeholder: '(00) 00000-0000' })}
        </View>

        <TouchableOpacity onPress={save} disabled={saving} style={[styles.saveButton, saving && styles.disabled]}>
          <Save size={18} color="#FFFFFF" />
          <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
        </TouchableOpacity>
        <Text style={[styles.note, { color: dm.sub }]}>Seu tipo de conta ({user.userType}) não pode ser alterado por esta tela.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 28, gap: 12 }, card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 }, sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 2 }, field: { gap: 5 }, label: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 }, input: { minHeight: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }, saveButton: { minHeight: 48, backgroundColor: COLORS.primaryDk, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }, disabled: { opacity: 0.6 }, note: { textAlign: 'center', fontSize: 10, lineHeight: 15 },
});
