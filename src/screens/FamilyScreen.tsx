import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  Phone,
  MessageCircle,
  Plus,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, FamilyMember } from '../types';
import { BackHeader } from '../components/BackHeader';
import { useInputVisibility } from '../components/useInputVisibility';

interface FamilyScreenProps {
  family: FamilyMember[];
  onAddMember: (member: FamilyMember) => Promise<void>;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({
  family,
  onAddMember,
  onBack,
  dm,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Filho(a)');
  const [newRole, setNewRole] = useState<'Familiar' | 'Profissional'>('Familiar');
  const [newPhone, setNewPhone] = useState('');
  const { width } = useWindowDimensions();
  const { scrollRef: modalScrollRef, keepInputVisible } = useInputVisibility();

  const handleAddSubmit = async () => {
    if (!newName.trim() || newPhone.replace(/\D/g, '').length < 10) {
      Alert.alert('Dados incompletos', 'Informe nome e telefone com DDD.'); return;
    }

    const initials = newName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');

    const newMember: FamilyMember = {
      id: `f_${Date.now()}`,
      name: newName,
      relation: newRelation,
      role: newRole,
      phone: newPhone,
      avatarBg: newRole === 'Profissional' ? COLORS.primary : COLORS.accent,
      initials: initials || 'CD',
      status: 'away',
      lastSeen: 'Contato cadastrado',
    };

    try {
      await onAddMember(newMember);
      setShowAddModal(false);
      setNewName(''); setNewPhone('');
    } catch (error) { Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.'); }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`)
      .catch(() => Alert.alert('Ligação indisponível', 'Use o telefone para ligar para este contato.'));
  };

  const handleWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const international = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
    Linking.openURL(`https://wa.me/${international}`)
      .catch(() => Alert.alert('WhatsApp indisponível', 'Confira o número cadastrado.'));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Rede de Cuidado"
        subtitle="Contatos cadastrados por você"
        onBack={onBack}
        bgGradient={[COLORS.primaryDk, COLORS.primary]}
        rightElement={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
            style={styles.headerBtn}
            accessibilityLabel="Adicionar cuidador"
          >
            <UserPlus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {family.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: dm.card, borderColor: dm.border }]}>
            <View style={styles.emptyIcon}><UserPlus size={21} color={COLORS.primaryDk} /></View>
            <Text style={[styles.emptyTitle, { color: dm.text }]}>Monte sua rede de apoio</Text>
            <Text style={[styles.emptyCopy, { color: dm.sub }]}>Cadastre pessoas de confiança para encontrar rapidamente o telefone e iniciar uma ligação ou conversa pelo WhatsApp.</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.emptyAction}><Plus size={17} color={COLORS.primaryDk} /><Text style={styles.emptyActionText}>Adicionar primeiro contato</Text></TouchableOpacity>
          </View>
        ) : null}

        {/* Info Banner */}
        {family.length > 0 ? <View
          style={[
            styles.banner,
            {
              backgroundColor: 'rgba(110, 171, 198, 0.12)',
              borderColor: 'rgba(110, 171, 198, 0.28)',
            },
          ]}
        >
          <ShieldCheck size={24} color={COLORS.primaryDk} />
          <Text style={styles.bannerText}>
            Esta lista facilita o contato direto. Toque no telefone para ligar ou no ícone de mensagem para abrir o WhatsApp. Ela não envia alertas automáticos.
          </Text>
        </View> : null}

        {/* Member Cards */}
        {family.map((member, index) => {
          return (
            <React.Fragment key={member.id}>
              <View
                style={[
                  styles.memberCard,
                  { backgroundColor: dm.card, borderColor: dm.border },
                ]}
              >
                <View style={styles.memberLeft}>
                  {/* Avatar */}
                  <View style={styles.avatarWrapper}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: member.avatarBg },
                      ]}
                    >
                      <Text style={styles.avatarText}>{member.initials}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text
                        style={[styles.memberName, { color: dm.text }]}
                        numberOfLines={1}
                      >
                        {member.name}
                      </Text>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: `${member.avatarBg}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleBadgeText,
                            { color: member.avatarBg },
                          ]}
                        >
                          {member.role}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.memberRelation}>{member.relation}</Text>
                    <Text style={styles.memberLastSeen}>{member.lastSeen}</Text>
                  </View>
                </View>

                {/* Direct Action triggers */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleCall(member.phone)}
                    activeOpacity={0.7}
                    style={[
                      styles.actionIconBtn,
                      {
                        backgroundColor: `${COLORS.primary}15`,
                        borderColor: `${COLORS.primary}30`,
                      },
                    ]}
                    accessibilityLabel={`Ligar para ${member.name}`}
                  >
                    <Phone size={16} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleWhatsApp(member.phone)}
                    activeOpacity={0.7}
                    style={[
                      styles.actionIconBtn,
                      {
                        backgroundColor: 'rgba(47, 191, 113, 0.15)',
                        borderColor: 'rgba(47, 191, 113, 0.3)',
                      },
                    ]}
                    accessibilityLabel={`WhatsApp com ${member.name}`}
                  >
                    <MessageCircle size={16} color={COLORS.success} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Vertical connector */}
              {index < family.length - 1 && (
                <View style={styles.connectorWrapper}>
                  <View
                    style={[
                      styles.connectorLine,
                      { backgroundColor: dm.isDark ? '#334155' : '#CBD5E1' },
                    ]}
                  />
                </View>
              )}
            </React.Fragment>
          );
        })}

        {/* Dashed Add Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
          style={[
            styles.dashedBtn,
            {
              borderColor: COLORS.primary,
              backgroundColor: `${COLORS.primary}08`,
            },
          ]}
        >
          <Plus size={18} color={COLORS.primary} />
          <Text style={[styles.dashedBtnText, { color: COLORS.primary }]}>
            Adicionar Novo Cuidador ou Profissional
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView style={styles.modalKeyboard} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
        <ScrollView ref={modalScrollRef} style={styles.modalScroll} contentContainerStyle={styles.modalOverlay} keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.modalCard,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dm.text }]}>
                Novo Contato de Apoio
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={dm.sub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHint, { color: dm.sub }]}>Este contato fica na sua rede de apoio. Para usar o chat do theSEDA, a outra pessoa precisa ter uma conta e aceitar um convite de conexão.</Text>

            <View style={styles.modalBody}>
              <View style={styles.formItem}>
                <Text style={[styles.modalLabel, { color: dm.sub }]}>
                  Nome Completo
                </Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  onFocus={keepInputVisible}
                  autoComplete="name"
                  placeholder="Ex: Carlos Eduardo Silva"
                  placeholderTextColor={dm.sub}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: dm.inputBg,
                      borderColor: dm.border,
                      color: dm.text,
                    },
                  ]}
                />
              </View>

              <View style={[styles.row, width < 380 && styles.rowCompact]}>
                <View style={[styles.formItem, { flex: 1 }]}>
                  <Text style={[styles.modalLabel, { color: dm.sub }]}>
                    Vínculo
                  </Text>
                  <TextInput
                    value={newRelation}
                    onChangeText={setNewRelation}
                    onFocus={keepInputVisible}
                    placeholder="Ex: Filho / Vizinho"
                    placeholderTextColor={dm.sub}
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: dm.inputBg,
                        borderColor: dm.border,
                        color: dm.text,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.formItem, { flex: 1 }]}>
                  <Text style={[styles.modalLabel, { color: dm.sub }]}>
                    Categoria
                  </Text>
                  <View style={styles.roleToggleRow}>
                    <TouchableOpacity
                      onPress={() => setNewRole('Familiar')}
                      style={[
                        styles.roleToggleBtn,
                        newRole === 'Familiar' && { backgroundColor: COLORS.primaryDk },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleToggleText,
                          { color: newRole === 'Familiar' ? '#FFFFFF' : dm.sub },
                        ]}
                      >
                        Família
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setNewRole('Profissional')}
                      style={[
                        styles.roleToggleBtn,
                        newRole === 'Profissional' && { backgroundColor: COLORS.primaryDk },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleToggleText,
                          { color: newRole === 'Profissional' ? '#FFFFFF' : dm.sub },
                        ]}
                      >
                        Profissional
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={[styles.modalLabel, { color: dm.sub }]}>
                  Telefone / WhatsApp
                </Text>
                <TextInput
                  value={newPhone}
                  onChangeText={setNewPhone}
                  onFocus={keepInputVisible}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: dm.inputBg,
                      borderColor: dm.border,
                      color: dm.text,
                    },
                  ]}
                />
              </View>

              <TouchableOpacity
                onPress={handleAddSubmit}
                activeOpacity={0.8}
                style={[
                  styles.modalSubmitBtn,
                  { backgroundColor: COLORS.primaryDk },
                ]}
              >
                <Text style={styles.modalSubmitText}>
                  Salvar na Rede de Cuidado
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.primaryDk,
  },
  emptyCard: { alignItems: 'center', borderWidth: 1, borderRadius: 20, padding: 20, gap: 9, marginBottom: 14 },
  emptyIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  emptyCopy: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  emptyAction: { minHeight: 42, paddingHorizontal: 14, borderRadius: 13, backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 2 },
  emptyActionText: { color: COLORS.primaryDk, fontSize: 12, fontWeight: '800' },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 1,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
    maxWidth: 110,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  memberRelation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  memberLastSeen: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  connectorWrapper: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  connectorLine: {
    width: 2,
    height: 12,
  },
  dashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 14,
  },
  dashedBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalKeyboard: { flex: 1 },
  modalScroll: { flex: 1 },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalHint: { fontSize: 11, lineHeight: 16, marginBottom: 10 },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 12,
  },
  formItem: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowCompact: { flexDirection: 'column' },
  modalLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 13,
    fontWeight: '600',
  },
  roleToggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  roleToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalSubmitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
