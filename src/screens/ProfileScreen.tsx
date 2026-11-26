import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Image,
  Alert,
} from 'react-native';
import {
  Settings,
  LogOut,
  Pill,
  ShieldAlert,
  Phone,
  UserRound,
  MessageCircleQuestion,
  ChevronRight,
  Pencil,
  Camera,
  Stethoscope,
  Users,
  QrCode,
  CalendarDays,
  Bell,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen, UserProfile } from '../types';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { PhotoCropModal } from '../components/PhotoCropModal';
import { LoadedPhotoDraft, pickRawImageWeb } from '../lib/avatarUtils';
import { getProfileCompletionStatus, normalizeMonitoredPatient } from '../lib/healthUtils';

interface ProfileScreenProps {
  user: UserProfile;
  onNavigate: (screen: Screen) => void;
  onUpdateAvatar?: (avatarUrl: string) => Promise<void>;
  onLogout: () => void;
  dm: DarkModeTheme;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigate,
  onUpdateAvatar,
  onLogout,
  dm,
}) => {
  const [cropDraft, setCropDraft] = useState<LoadedPhotoDraft | null>(null);

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`).catch(() => {});
  };
  const handleChangePhoto = () => {
    pickRawImageWeb(
      (loaded) => setCropDraft(loaded),
      (msg) => Alert.alert('Foto de perfil', msg)
    );
  };
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'S';

  const completion = getProfileCompletionStatus(user);
  const monitored = normalizeMonitoredPatient(user);
  const isProfessional = user.userType === 'Profissional';
  const isFamiliar = user.userType === 'Familiar';
  const displayedConditions = isFamiliar ? monitored.conditions : user.conditions;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Minimalist Profile Header */}
      <FadeInItem delay={0}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.editProfileBtn, { backgroundColor: dm.card, borderColor: dm.border }]}
            onPress={() => onNavigate('edit_profile')}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
          >
            <Pencil size={12} color={COLORS.primary} />
            <Text style={[styles.editProfileBtnText, { color: dm.text }]}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleChangePhoto}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            style={[styles.avatarRing, { borderColor: COLORS.primary }]}
          >
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} resizeMode="cover" style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: COLORS.secondary }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={[styles.cameraBadge, { borderColor: dm.bg }]}>
              <Camera size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <PhotoCropModal
            photo={cropDraft}
            onCancel={() => setCropDraft(null)}
            onConfirm={async (croppedDataUrl) => {
              try {
                if (onUpdateAvatar) await onUpdateAvatar(croppedDataUrl);
                setCropDraft(null);
              } catch (err) {
                Alert.alert('Erro ao salvar foto', err instanceof Error ? err.message : 'Tente novamente.');
              }
            }}
            dm={dm}
          />

          <Text style={[styles.userName, { color: dm.text }]}>
            {isProfessional ? `Dr(a). ${user.name}` : user.name}
          </Text>
          <View style={[styles.profileBadge, { backgroundColor: 'rgba(0, 182, 144, 0.12)' }]}>
            <UserRound size={13} color={COLORS.primary} />
            <Text style={[styles.profileBadgeText, { color: COLORS.primary }]}>{user.userType}</Text>
          </View>
          {user.phone ? <Text style={[styles.userSus, { color: dm.sub }]}>{user.phone}</Text> : null}
          {!isProfessional && !isFamiliar && user.susCard ? (
            <Text style={[styles.userSus, { color: dm.sub }]}>
              Cartão SUS: {user.susCard}
              {user.bloodType ? ` · Tipo ${user.bloodType}` : ''}
            </Text>
          ) : null}
          {isProfessional && user.professionalInfo?.councilRegister ? (
            <Text style={[styles.userSus, { color: dm.sub }]}>
              {user.professionalInfo.councilRegister}
              {user.professionalInfo.specialty ? ` · ${user.professionalInfo.specialty}` : ''}
            </Text>
          ) : null}
        </View>
      </FadeInItem>

      {/* Main Content */}
      <View style={styles.body}>
        {/* Profile Completion Prompt if missing fields */}
        {completion.missingFields.length > 0 && (
          <FadeInItem delay={30}>
            <TouchableOpacity
              onPress={() => onNavigate('edit_profile')}
              activeOpacity={0.85}
              style={[
                styles.completionCard,
                {
                  backgroundColor: 'rgba(0, 182, 144, 0.08)',
                  borderColor: 'rgba(0, 182, 144, 0.28)',
                },
              ]}
            >
              <View style={styles.completionTop}>
                <Text style={[styles.completionTitle, { color: dm.text }]}>
                  Configuração do perfil ({completion.percent}%)
                </Text>
                <Text style={styles.manageLink}>Completar</Text>
              </View>
              <Text style={[styles.completionSub, { color: dm.sub }]}>
                Falta configurar: {completion.missingFields.join(', ')}.
              </Text>
            </TouchableOpacity>
          </FadeInItem>
        )}

        <FadeInItem delay={60}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onNavigate('support')}
            style={[styles.supportCard, { backgroundColor: dm.card, borderColor: dm.border }]}
          >
            <View style={styles.supportIcon}>
              <MessageCircleQuestion size={20} color="#FFFFFF" />
            </View>
            <View style={styles.supportCopy}>
              <Text style={[styles.supportTitle, { color: dm.text }]}>Precisa de ajuda?</Text>
              <Text style={[styles.supportSubtitle, { color: dm.sub }]}>
                Acesse o assistente e as dúvidas frequentes
              </Text>
            </View>
            <ChevronRight size={18} color={dm.sub} />
          </TouchableOpacity>
        </FadeInItem>

        {/* PROFISSIONAL SPECIFIC PROFILE CARDS */}
        {isProfessional ? (
          <>
            <FadeInItem delay={110}>
              <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeftNoMargin}>
                    <Stethoscope size={16} color={COLORS.primary} />
                    <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                      Atuação Profissional
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onNavigate('edit_profile')}>
                    <Text style={styles.manageLink}>Configurar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.profDetailsList}>
                  <View style={styles.profDetailRow}>
                    <Text style={[styles.profLabel, { color: dm.sub }]}>Registro:</Text>
                    <Text style={[styles.profVal, { color: dm.text }]}>
                      {user.professionalInfo?.councilRegister || 'Não informado'}
                    </Text>
                  </View>
                  <View style={styles.profDetailRow}>
                    <Text style={[styles.profLabel, { color: dm.sub }]}>Especialidade:</Text>
                    <Text style={[styles.profVal, { color: dm.text }]}>
                      {user.professionalInfo?.specialty || 'Não informada'}
                    </Text>
                  </View>
                  <View style={styles.profDetailRow}>
                    <Text style={[styles.profLabel, { color: dm.sub }]}>Unidade / UBS:</Text>
                    <Text style={[styles.profVal, { color: dm.text }]}>
                      {user.professionalInfo?.clinicName || 'Não informada'}
                    </Text>
                  </View>
                </View>
              </View>
            </FadeInItem>

            <FadeInItem delay={150}>
              <View style={styles.shortcutsGrid}>
                <TouchableOpacity
                  onPress={() => onNavigate('connections')}
                  style={[styles.shortcutCard, { backgroundColor: dm.card, borderColor: dm.border }]}
                >
                  <QrCode size={18} color={COLORS.primary} />
                  <Text style={[styles.shortcutText, { color: dm.text }]}>QR Code e Pacientes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onNavigate('appointments')}
                  style={[styles.shortcutCard, { backgroundColor: dm.card, borderColor: dm.border }]}
                >
                  <CalendarDays size={18} color={COLORS.secondary} />
                  <Text style={[styles.shortcutText, { color: dm.text }]}>Agenda Clínica</Text>
                </TouchableOpacity>
              </View>
            </FadeInItem>
          </>
        ) : null}

        {/* FAMILIAR MONITORED PATIENT CARD */}
        {isFamiliar ? (
          <FadeInItem delay={95}>
            <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeftNoMargin}>
                  <Users size={16} color={COLORS.secondary} />
                  <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                    Paciente Acompanhado
                  </Text>
                </View>
                <TouchableOpacity onPress={() => onNavigate('edit_profile')}>
                  <Text style={styles.manageLink}>Configurar</Text>
                </TouchableOpacity>
              </View>

              {monitored.isConfigured ? (
                <View style={styles.contactRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactName, { color: dm.text }]}>{monitored.name}</Text>
                    <Text style={[styles.contactRel, { color: dm.sub }]}>
                      {monitored.relation}
                      {monitored.notes ? ` · ${monitored.notes}` : ''}
                    </Text>
                  </View>
                  {monitored.phone ? (
                    <TouchableOpacity
                      onPress={() => handleCall(monitored.phone)}
                      style={[styles.callBtn, { backgroundColor: COLORS.primary }]}
                    >
                      <Phone size={14} color="#FFFFFF" />
                      <Text style={styles.callBtnText}>Ligar</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: dm.sub }]}>
                  Nenhum paciente configurado. Toque em "Configurar" para informar quem você acompanha.
                </Text>
              )}
            </View>
          </FadeInItem>
        ) : null}

        {/* CONDITIONS & MEDICATIONS FOR PACIENTE AND FAMILIAR */}
        {!isProfessional && (
          <>
            <FadeInItem delay={110}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: dm.card, borderColor: dm.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                    {isFamiliar ? 'Condições do Paciente' : 'Diagnósticos & Condições Monitoradas'}
                  </Text>
                  <TouchableOpacity onPress={() => onNavigate('edit_profile')}>
                    <Text style={styles.manageLink}>Gerenciar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagWrap}>
                  {displayedConditions.length === 0 ? (
                    <Text style={[styles.emptyText, { color: dm.sub }]}>
                      Nenhuma condição adicionada.
                    </Text>
                  ) : null}
                  {displayedConditions.map((cond, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.condTag,
                        {
                          backgroundColor: 'rgba(38, 77, 140, 0.08)',
                          borderColor: 'rgba(38, 77, 140, 0.25)',
                        },
                      ]}
                    >
                      <Text style={styles.condTagText}>● {cond}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </FadeInItem>

            <FadeInItem delay={160}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: dm.card, borderColor: dm.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeftNoMargin}>
                    <Pill size={16} color={COLORS.primary} />
                    <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                      {isFamiliar ? 'Medicações Monitoradas' : 'Prescrição Médica Ativa'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onNavigate('edit_profile')}>
                    <Text style={styles.manageLink}>
                      {user.medications.length > 0 ? 'Gerenciar' : 'Adicionar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.medList}>
                  {user.medications.length === 0 ? (
                    <Text style={[styles.emptyText, { color: dm.sub }]}>
                      Nenhuma medicação cadastrada. Toque em "Adicionar" para registrar os horários.
                    </Text>
                  ) : null}
                  {user.medications.map((med, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.medItem,
                        { backgroundColor: dm.inputBg, borderColor: dm.border },
                      ]}
                    >
                      <View style={styles.medInfo}>
                        <Text style={[styles.medName, { color: dm.text }]}>
                          {med.name}{' '}
                          <Text style={{ color: COLORS.primary, fontWeight: '500' }}>
                            ({med.dosage})
                          </Text>
                        </Text>
                        <Text style={[styles.medFreq, { color: dm.sub }]}>
                          {med.frequency}
                        </Text>
                      </View>

                      <View style={styles.medDose}>
                        <Text style={styles.medDoseLabel}>Próxima dose</Text>
                        <Text style={styles.medDoseTime}>{med.nextTime}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </FadeInItem>

            <FadeInItem delay={210}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: dm.card, borderColor: dm.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeftNoMargin}>
                    <ShieldAlert size={16} color="#EF4444" />
                    <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                      Contato de Emergência Principal
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onNavigate('edit_profile')}>
                    <Text style={styles.manageLink}>Editar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.contactRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactName, { color: dm.text }]}>
                      {user.emergencyContact.name || 'Nenhum contato cadastrado'}
                    </Text>
                    <Text style={[styles.contactRel, { color: dm.sub }]}>
                      {user.emergencyContact.relation || 'Toque em Editar para informar'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleCall(user.emergencyContact.phone)}
                    disabled={!user.emergencyContact.phone}
                    activeOpacity={0.8}
                    style={[styles.callBtn, !user.emergencyContact.phone && { opacity: 0.45 }]}
                  >
                    <Phone size={14} color="#FFFFFF" />
                    <Text style={styles.callBtnText}>Ligar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeInItem>

            <FadeInItem delay={230}>
              <View style={styles.shortcutsGrid}>
                <TouchableOpacity
                  onPress={() => onNavigate(isFamiliar ? 'family' : 'connections')}
                  style={[styles.shortcutCard, { backgroundColor: dm.card, borderColor: dm.border }]}
                >
                  <Users size={18} color={COLORS.primary} />
                  <Text style={[styles.shortcutText, { color: dm.text }]}>
                    {isFamiliar ? 'Rede de Cuidado' : 'Equipe Clínica'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onNavigate(isFamiliar ? 'alerts' : 'family')}
                  style={[styles.shortcutCard, { backgroundColor: dm.card, borderColor: dm.border }]}
                >
                  {isFamiliar ? (
                    <Bell size={18} color={COLORS.secondary} />
                  ) : (
                    <Users size={18} color={COLORS.secondary} />
                  )}
                  <Text style={[styles.shortcutText, { color: dm.text }]}>
                    {isFamiliar ? 'Central de Alertas' : 'Familiares'}
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeInItem>
          </>
        )}

        {/* Settings and Logout Buttons */}
        <FadeInItem delay={250}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => onNavigate('settings')}
              activeOpacity={0.7}
              style={[
                styles.actionBtn,
                { backgroundColor: dm.card, borderColor: dm.border },
              ]}
            >
              <Settings size={16} color={COLORS.secondary} />
              <Text style={[styles.actionBtnText, { color: dm.text }]}>
                Configurações
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLogout}
              activeOpacity={0.7}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: dm.card,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                },
              ]}
            >
              <LogOut size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>
                Sair do App
              </Text>
            </TouchableOpacity>
          </View>
        </FadeInItem>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  editProfileBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  editProfileBtnText: { fontSize: 11, fontWeight: '800' },
  avatarRing: {
    position: 'relative',
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    marginBottom: 10,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  profileBadgeText: { fontSize: 12, fontWeight: '800' },
  userSus: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  body: { paddingHorizontal: 18, gap: 12 },
  completionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  completionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionTitle: { fontSize: 13, fontWeight: '800' },
  completionSub: { fontSize: 11, lineHeight: 16 },
  manageLink: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  supportIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportCopy: { flex: 1, gap: 2 },
  supportTitle: { fontSize: 13, fontWeight: '800' },
  supportSubtitle: { fontSize: 11, lineHeight: 15 },
  card: { borderRadius: 20, padding: 16, borderWidth: 1 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeftNoMargin: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profDetailsList: { gap: 8 },
  profDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  profLabel: { fontSize: 12, fontWeight: '600' },
  profVal: { fontSize: 13, fontWeight: '800' },
  shortcutsGrid: { flexDirection: 'row', gap: 10 },
  shortcutCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  shortcutText: { fontSize: 12, fontWeight: '800', flex: 1 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  condTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  condTagText: { fontSize: 11, fontWeight: '800', color: COLORS.secondary },
  medList: { gap: 8 },
  emptyText: { fontSize: 13, lineHeight: 19 },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  medInfo: { flex: 1 },
  medName: { fontSize: 13, fontWeight: '800' },
  medFreq: { fontSize: 11, marginTop: 2 },
  medDose: { alignItems: 'flex-end' },
  medDoseLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  medDoseTime: { fontSize: 12, fontWeight: '800', color: COLORS.primary, marginTop: 1 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  contactName: { fontSize: 14, fontWeight: '800' },
  contactRel: { fontSize: 11, marginTop: 1 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
  callBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontWeight: '800' },
});
