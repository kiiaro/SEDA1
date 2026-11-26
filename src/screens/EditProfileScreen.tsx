import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Camera,
  Crop,
  HeartPulse,
  Pill,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { PhotoCropModal } from '../components/PhotoCropModal';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, UserProfile } from '../types';
import {
  LoadedPhotoDraft,
  loadPhotoDimensionsWeb,
  pickRawImageWeb,
} from '../lib/avatarUtils';

interface Props {
  user: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
}

const PRESET_CONDITIONS = [
  'Hipertensão Arterial Sistêmica',
  'Diabetes Mellitus Tipo 2',
  'Colesterol Alto',
  'Cardiopatia',
];

export const EditProfileScreen: React.FC<Props> = ({ user, onSave, onBack, dm }) => {
  const [draft, setDraft] = useState<UserProfile>({
    ...user,
    professionalInfo: {
      councilRegister: user.professionalInfo?.councilRegister ?? '',
      specialty: user.professionalInfo?.specialty ?? '',
      clinicName: user.professionalInfo?.clinicName ?? '',
    },
    monitoredPatient: {
      name: user.monitoredPatient?.name ?? '',
      relation: user.monitoredPatient?.relation ?? '',
      phone: user.monitoredPatient?.phone ?? '',
      birthDate: user.monitoredPatient?.birthDate ?? '',
      conditions: [...(user.monitoredPatient?.conditions ?? user.conditions ?? [])],
      notes: user.monitoredPatient?.notes ?? '',
    },
    emergencyContact: { ...user.emergencyContact },
    conditions: [...user.conditions],
    medications: user.medications.map((m) => ({ ...m })),
  });
  const [saving, setSaving] = useState(false);

  // Condition & medication quick add inputs
  const [customCondition, setCustomCondition] = useState('');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medNextTime, setMedNextTime] = useState('08:00');
  const [cropDraft, setCropDraft] = useState<LoadedPhotoDraft | null>(null);

  const initials =
    draft.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'S';

  const update = (key: keyof UserProfile, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const updateEmergency = (key: keyof UserProfile['emergencyContact'], value: string) =>
    setDraft((current) => ({
      ...current,
      emergencyContact: { ...current.emergencyContact, [key]: value },
    }));

  const updateProfessional = (
    key: keyof NonNullable<UserProfile['professionalInfo']>,
    value: string
  ) =>
    setDraft((current) => ({
      ...current,
      professionalInfo: {
        councilRegister: current.professionalInfo?.councilRegister ?? '',
        specialty: current.professionalInfo?.specialty ?? '',
        clinicName: current.professionalInfo?.clinicName ?? '',
        [key]: value,
      },
    }));

  const updateMonitored = (
    key: keyof NonNullable<UserProfile['monitoredPatient']>,
    value: string
  ) =>
    setDraft((current) => ({
      ...current,
      monitoredPatient: {
        name: current.monitoredPatient?.name ?? '',
        relation: current.monitoredPatient?.relation ?? '',
        phone: current.monitoredPatient?.phone ?? '',
        conditions: current.monitoredPatient?.conditions ?? [],
        notes: current.monitoredPatient?.notes ?? '',
        [key]: value,
      },
    }));

  const activeConditions =
    draft.userType === 'Familiar'
      ? draft.monitoredPatient?.conditions ?? []
      : draft.conditions;

  const setActiveConditions = (next: string[]) => {
    setDraft((current) => {
      if (current.userType === 'Familiar') {
        return {
          ...current,
          monitoredPatient: {
            name: current.monitoredPatient?.name ?? '',
            relation: current.monitoredPatient?.relation ?? '',
            phone: current.monitoredPatient?.phone ?? '',
            notes: current.monitoredPatient?.notes ?? '',
            conditions: next,
          },
        };
      }
      return { ...current, conditions: next };
    });
  };

  const toggleCondition = (cond: string) => {
    const exists = activeConditions.includes(cond);
    setActiveConditions(
      exists ? activeConditions.filter((c) => c !== cond) : [...activeConditions, cond]
    );
  };

  const addCustomCondition = () => {
    const trimmed = customCondition.trim();
    if (!trimmed) return;
    if (!activeConditions.includes(trimmed)) {
      setActiveConditions([...activeConditions, trimmed]);
    }
    setCustomCondition('');
  };

  const addMedication = () => {
    const name = medName.trim();
    if (!name) {
      Alert.alert('Nome do remédio', 'Informe o nome da medicação.');
      return;
    }
    setDraft((current) => ({
      ...current,
      medications: [
        ...current.medications,
        {
          name,
          dosage: medDosage.trim() || 'Conforme receita',
          frequency: medFrequency.trim() || 'Uso diário',
          nextTime: medNextTime.trim() || '08:00',
        },
      ],
    }));
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedNextTime('08:00');
  };

  const removeMedication = (index: number) => {
    setDraft((current) => ({
      ...current,
      medications: current.medications.filter((_, idx) => idx !== index),
    }));
  };

  const handlePickPhoto = () => {
    pickRawImageWeb(
      (loaded) => setCropDraft(loaded),
      (msg) => Alert.alert('Foto de perfil', msg)
    );
  };

  const handleRecropCurrent = async () => {
    if (!draft.avatarUrl) return;
    try {
      const loaded = await loadPhotoDimensionsWeb(draft.avatarUrl);
      setCropDraft(loaded);
    } catch (err) {
      Alert.alert('Foto de perfil', err instanceof Error ? err.message : 'Não foi possível abrir a foto.');
    }
  };

  const save = async () => {
    if (!draft.name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe como você quer aparecer no SEDA.');
      return;
    }
    if (draft.phone && draft.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Telefone inválido', 'Informe o DDD e o número completo.');
      return;
    }
    if (
      draft.emergencyContact.phone &&
      draft.emergencyContact.phone.replace(/\D/g, '').length < 10
    ) {
      Alert.alert('Contato de emergência inválido', 'Informe o DDD e o número completo.');
      return;
    }
    if (
      draft.userType === 'Familiar' &&
      draft.monitoredPatient?.phone &&
      draft.monitoredPatient.phone.replace(/\D/g, '').length < 10
    ) {
      Alert.alert('Telefone do paciente inválido', 'Informe o DDD e o número completo.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...draft,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        professionalInfo:
          draft.userType === 'Profissional'
            ? {
                councilRegister: draft.professionalInfo?.councilRegister.trim() ?? '',
                specialty: draft.professionalInfo?.specialty.trim() ?? '',
                clinicName: draft.professionalInfo?.clinicName.trim() ?? '',
              }
            : draft.professionalInfo,
        monitoredPatient:
          draft.userType === 'Familiar'
            ? {
                name: draft.monitoredPatient?.name.trim() ?? '',
                relation: draft.monitoredPatient?.relation.trim() || 'Familiar',
                phone: draft.monitoredPatient?.phone.trim() ?? '',
                birthDate: draft.monitoredPatient?.birthDate?.trim() ?? '',
                conditions: draft.monitoredPatient?.conditions ?? [],
                notes: draft.monitoredPatient?.notes?.trim() ?? '',
              }
            : draft.monitoredPatient,
      });
    } catch (error) {
      Alert.alert(
        'Não foi possível salvar',
        error instanceof Error ? error.message : 'Verifique a conexão e tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    options: { keyboardType?: 'default' | 'phone-pad' | 'numeric'; placeholder?: string } = {}
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: dm.sub }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={options.placeholder ?? label}
        placeholderTextColor={dm.sub}
        keyboardType={options.keyboardType ?? 'default'}
        autoCapitalize={
          options.keyboardType === 'phone-pad' || options.keyboardType === 'numeric'
            ? 'none'
            : 'words'
        }
        style={[
          styles.input,
          { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border },
        ]}
      />
    </View>
  );

  const roleOptions: Array<{
    id: UserProfile['userType'];
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'Paciente',
      label: 'Paciente',
      icon: (
        <HeartPulse
          size={15}
          color={draft.userType === 'Paciente' ? COLORS.primary : dm.sub}
        />
      ),
    },
    {
      id: 'Familiar',
      label: 'Familiar',
      icon: (
        <Users
          size={15}
          color={draft.userType === 'Familiar' ? COLORS.primary : dm.sub}
        />
      ),
    },
    {
      id: 'Profissional',
      label: 'Profissional',
      icon: (
        <Stethoscope
          size={15}
          color={draft.userType === 'Profissional' ? COLORS.primary : dm.sub}
        />
      ),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: dm.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader
        title="Configurar perfil"
        subtitle={`Conta ${draft.userType} · Dados e preferências`}
        onBack={onBack}
        dm={dm}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo Card */}
        <FadeInItem delay={0}>
          <View style={[styles.photoCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <TouchableOpacity
              onPress={handlePickPhoto}
              accessibilityRole="button"
              accessibilityLabel="Escolher foto de perfil"
              style={[styles.avatarRing, { borderColor: COLORS.primary }]}
            >
              {draft.avatarUrl ? (
                <Image source={{ uri: draft.avatarUrl }} resizeMode="cover" style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.secondary }]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.photoInfo}>
              <Text style={[styles.photoTitle, { color: dm.text }]}>Foto de perfil</Text>
              <Text style={[styles.photoSub, { color: dm.sub }]}>
                Envie uma imagem para recortar e ajustar no formato do perfil
              </Text>
              <View style={styles.photoActions}>
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  style={[styles.photoBtn, { backgroundColor: COLORS.primary }]}
                >
                  <Camera size={14} color="#FFFFFF" />
                  <Text style={styles.photoBtnText}>
                    {draft.avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
                  </Text>
                </TouchableOpacity>
                {draft.avatarUrl ? (
                  <>
                    <TouchableOpacity
                      onPress={handleRecropCurrent}
                      accessibilityRole="button"
                      accessibilityLabel="Cortar foto atual"
                      style={[styles.removePhotoBtn, { borderColor: dm.border, flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                    >
                      <Crop size={14} color={COLORS.secondary} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: dm.text }}>Cortar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDraft((c) => ({ ...c, avatarUrl: undefined }))}
                      accessibilityLabel="Remover foto de perfil"
                      style={[styles.removePhotoBtn, { borderColor: dm.border }]}
                    >
                      <Trash2 size={14} color={COLORS.danger} />
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </View>
          </View>
        </FadeInItem>

        <PhotoCropModal
          photo={cropDraft}
          onCancel={() => setCropDraft(null)}
          onConfirm={(croppedDataUrl) => {
            setDraft((current) => ({ ...current, avatarUrl: croppedDataUrl }));
            setCropDraft(null);
          }}
          dm={dm}
        />

        {/* Role Selector */}
        <FadeInItem delay={40}>
          <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.sectionTitle, { color: dm.text }]}>Tipo de perfil</Text>
            <View style={styles.roleRow}>
              {roleOptions.map((item) => {
                const selected = draft.userType === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      setDraft((current) => ({ ...current, userType: item.id }))
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Perfil ${item.label}`}
                    style={[
                      styles.roleBtn,
                      {
                        backgroundColor: selected
                          ? 'rgba(0, 182, 144, 0.12)'
                          : dm.inputBg,
                        borderColor: selected ? COLORS.primary : dm.border,
                      },
                    ]}
                  >
                    {item.icon}
                    <Text
                      style={[
                        styles.roleBtnText,
                        { color: selected ? COLORS.primary : dm.sub },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </FadeInItem>

        {/* Personal Data */}
        <FadeInItem delay={70}>
          <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <Text style={[styles.sectionTitle, { color: dm.text }]}>Dados pessoais</Text>
            {field('Nome completo', draft.name, (value) => update('name', value))}
            {field('Telefone com DDD', draft.phone, (value) => update('phone', value), {
              keyboardType: 'phone-pad',
              placeholder: '(00) 00000-0000',
            })}
            {field('CPF', draft.cpf, (value) => update('cpf', value), {
              keyboardType: 'numeric',
              placeholder: '000.000.000-00',
            })}
            {field('Data de nascimento', draft.birthDate, (value) => update('birthDate', value), {
              placeholder: 'DD/MM/AAAA',
            })}
            {draft.userType === 'Paciente' ? (
              <>
                {field('Cartão SUS', draft.susCard, (value) => update('susCard', value), {
                  keyboardType: 'numeric',
                  placeholder: '000 0000 0000 0000',
                })}
                {field('Tipo sanguíneo', draft.bloodType, (value) => update('bloodType', value), {
                  placeholder: 'Ex.: O+',
                })}
              </>
            ) : null}
          </View>
        </FadeInItem>

        {/* Professional Config */}
        {draft.userType === 'Profissional' && (
          <FadeInItem delay={100}>
            <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
              <Text style={[styles.sectionTitle, { color: dm.text }]}>
                Credenciais Profissionais
              </Text>
              {field(
                'Registro (CRM / COREN / CRP)',
                draft.professionalInfo?.councilRegister ?? '',
                (value) => updateProfessional('councilRegister', value),
                { placeholder: 'Ex.: CRM-SP 148920' }
              )}
              {field(
                'Especialidade',
                draft.professionalInfo?.specialty ?? '',
                (value) => updateProfessional('specialty', value),
                { placeholder: 'Ex.: Clínico Geral · Hiperdia' }
              )}
              {field(
                'Unidade de Saúde / Consultório',
                draft.professionalInfo?.clinicName ?? '',
                (value) => updateProfessional('clinicName', value),
                { placeholder: 'Ex.: UBS Vila Esperança' }
              )}
            </View>
          </FadeInItem>
        )}

        {/* Monitored Patient Config for Familiar */}
        {draft.userType === 'Familiar' && (
          <FadeInItem delay={100}>
            <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
              <Text style={[styles.sectionTitle, { color: dm.text }]}>
                Paciente Acompanhado
              </Text>
              {field(
                'Nome completo do paciente',
                draft.monitoredPatient?.name ?? '',
                (value) => updateMonitored('name', value),
                { placeholder: 'Ex.: Dona Maria Silva' }
              )}
              {field(
                'Parentesco ou vínculo',
                draft.monitoredPatient?.relation ?? '',
                (value) => updateMonitored('relation', value),
                { placeholder: 'Ex.: Mãe, Pai, Avó' }
              )}
              {field(
                'Telefone / WhatsApp do paciente',
                draft.monitoredPatient?.phone ?? '',
                (value) => updateMonitored('phone', value),
                { keyboardType: 'phone-pad', placeholder: '(00) 00000-0000' }
              )}
              {field(
                'Unidade / Observações clínicas',
                draft.monitoredPatient?.notes ?? '',
                (value) => updateMonitored('notes', value),
                { placeholder: 'Ex.: Programa Hiperdia · UBS Central' }
              )}
            </View>
          </FadeInItem>
        )}

        {/* Conditions & Medications for Paciente and Familiar */}
        {draft.userType !== 'Profissional' && (
          <>
            <FadeInItem delay={130}>
              <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
                <Text style={[styles.sectionTitle, { color: dm.text }]}>
                  {draft.userType === 'Familiar'
                    ? 'Condições do Paciente'
                    : 'Condições Monitoradas'}
                </Text>

                <View style={styles.chipWrap}>
                  {PRESET_CONDITIONS.map((cond) => {
                    const selected = activeConditions.includes(cond);
                    return (
                      <TouchableOpacity
                        key={cond}
                        onPress={() => toggleCondition(cond)}
                        style={[
                          styles.condChip,
                          {
                            backgroundColor: selected
                              ? 'rgba(0, 182, 144, 0.14)'
                              : dm.inputBg,
                            borderColor: selected ? COLORS.primary : dm.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.condChipText,
                            { color: selected ? COLORS.primary : dm.sub },
                          ]}
                        >
                          {cond}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeConditions.filter((c) => !PRESET_CONDITIONS.includes(c)).length > 0 && (
                  <View style={styles.chipWrap}>
                    {activeConditions
                      .filter((c) => !PRESET_CONDITIONS.includes(c))
                      .map((cond) => (
                        <TouchableOpacity
                          key={cond}
                          onPress={() => toggleCondition(cond)}
                          style={[
                            styles.condChip,
                            {
                              backgroundColor: 'rgba(38, 77, 140, 0.1)',
                              borderColor: COLORS.secondary,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            },
                          ]}
                        >
                          <Text style={[styles.condChipText, { color: COLORS.secondary }]}>
                            {cond}
                          </Text>
                          <X size={12} color={COLORS.secondary} />
                        </TouchableOpacity>
                      ))}
                  </View>
                )}

                <View style={styles.inlineAddRow}>
                  <TextInput
                    value={customCondition}
                    onChangeText={setCustomCondition}
                    placeholder="Adicionar outra condição..."
                    placeholderTextColor={dm.sub}
                    style={[
                      styles.input,
                      { flex: 1, color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={addCustomCondition}
                    accessibilityRole="button"
                    accessibilityLabel="Adicionar condição"
                    style={styles.inlineAddBtn}
                  >
                    <Plus size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </FadeInItem>

            <FadeInItem delay={160}>
              <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
                <View style={styles.medHeader}>
                  <Pill size={16} color={COLORS.primary} />
                  <Text style={[styles.sectionTitle, { color: dm.text, marginBottom: 0 }]}>
                    {draft.userType === 'Familiar'
                      ? 'Medicações do Paciente'
                      : 'Prescrição & Remédios'}
                  </Text>
                </View>

                {draft.medications.length > 0 ? (
                  <View style={styles.medList}>
                    {draft.medications.map((med, idx) => (
                      <View
                        key={`${med.name}-${idx}`}
                        style={[
                          styles.medRow,
                          { backgroundColor: dm.inputBg, borderColor: dm.border },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.medName, { color: dm.text }]}>
                            {med.name} ({med.dosage})
                          </Text>
                          <Text style={[styles.medMeta, { color: dm.sub }]}>
                            {med.frequency} · {med.nextTime}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeMedication(idx)}
                          accessibilityLabel={`Remover ${med.name}`}
                          style={styles.medRemoveBtn}
                        >
                          <Trash2 size={15} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptyMedText, { color: dm.sub }]}>
                    Nenhuma medicação cadastrada ainda.
                  </Text>
                )}

                <View style={[styles.newMedBox, { borderTopColor: dm.border }]}>
                  <Text style={[styles.label, { color: dm.sub }]}>Adicionar medicamento</Text>
                  <View style={styles.twoCol}>
                    <TextInput
                      value={medName}
                      onChangeText={setMedName}
                      placeholder="Nome (ex.: Losartana)"
                      placeholderTextColor={dm.sub}
                      style={[
                        styles.input,
                        { flex: 2, color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border },
                      ]}
                    />
                    <TextInput
                      value={medDosage}
                      onChangeText={setMedDosage}
                      placeholder="Dose (50mg)"
                      placeholderTextColor={dm.sub}
                      style={[
                        styles.input,
                        { flex: 1, color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border },
                      ]}
                    />
                  </View>
                  <View style={styles.twoCol}>
                    <TextInput
                      value={medFrequency}
                      onChangeText={setMedFrequency}
                      placeholder="Frequência (1x ao dia)"
                      placeholderTextColor={dm.sub}
                      style={[
                        styles.input,
                        { flex: 2, color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border },
                      ]}
                    />
                    <TextInput
                      value={medNextTime}
                      onChangeText={setMedNextTime}
                      placeholder="08:00"
                      placeholderTextColor={dm.sub}
                      style={[
                        styles.input,
                        { flex: 1, color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={addMedication}
                    accessibilityRole="button"
                    accessibilityLabel="Adicionar medicamento"
                    style={styles.addMedBtn}
                  >
                    <Plus size={15} color={COLORS.primary} />
                    <Text style={styles.addMedBtnText}>Adicionar medicamento</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeInItem>

            <FadeInItem delay={190}>
              <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
                <Text style={[styles.sectionTitle, { color: dm.text }]}>
                  Contato de emergência
                </Text>
                {field('Nome do contato', draft.emergencyContact.name, (value) =>
                  updateEmergency('name', value)
                )}
                {field(
                  'Parentesco ou vínculo',
                  draft.emergencyContact.relation,
                  (value) => updateEmergency('relation', value),
                  { placeholder: 'Ex.: filha, irmão, cuidador' }
                )}
                {field(
                  'Telefone com DDD',
                  draft.emergencyContact.phone,
                  (value) => updateEmergency('phone', value),
                  { keyboardType: 'phone-pad', placeholder: '(00) 00000-0000' }
                )}
              </View>
            </FadeInItem>
          </>
        )}

        <TouchableOpacity
          onPress={save}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Salvar alterações"
          style={[styles.saveButton, saving && styles.disabled]}
        >
          <Save size={18} color="#FFFFFF" />
          <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 32, gap: 12 },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    padding: 3,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfo: { flex: 1, gap: 4 },
  photoTitle: { fontSize: 15, fontWeight: '800' },
  photoSub: { fontSize: 12, lineHeight: 16 },
  photoActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  photoBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  removePhotoBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  roleBtnText: { fontSize: 12, fontWeight: '800' },
  field: { gap: 5 },
  label: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
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
  inlineAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medList: {
    gap: 8,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  medName: { fontSize: 13, fontWeight: '800' },
  medMeta: { fontSize: 11, marginTop: 2 },
  medRemoveBtn: { padding: 6 },
  emptyMedText: { fontSize: 12 },
  newMedBox: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 182, 144, 0.12)',
  },
  addMedBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  saveButton: {
    minHeight: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.6 },
});
