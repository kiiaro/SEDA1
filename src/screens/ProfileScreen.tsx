import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  LogOut,
  Pill,
  ShieldAlert,
  Phone,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen, UserProfile } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  dm: DarkModeTheme;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigate,
  onLogout,
  dm,
}) => {
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Big Avatar */}
      <LinearGradient
        colors={['#1E3A5F', '#3D6E9F', '#5E8FC0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userSus}>Cartão SUS: {user.susCard}</Text>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.body}>
        {/* Conditions */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dm.sub }]}>
            Diagnósticos & Condições Monitoradas
          </Text>
          <View style={styles.tagWrap}>
            {user.conditions.map((cond, idx) => (
              <View
                key={idx}
                style={[
                  styles.condTag,
                  {
                    backgroundColor: 'rgba(228, 84, 84, 0.12)',
                    borderColor: 'rgba(228, 84, 84, 0.3)',
                  },
                ]}
              >
                <Text style={styles.condTagText}>● {cond}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Medications */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Pill size={16} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { color: dm.sub }]}>
                Prescrição Médica Ativa
              </Text>
            </View>
            <Text style={styles.medCount}>3 Registrados</Text>
          </View>

          <View style={styles.medList}>
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
                    <Text style={{ color: COLORS.primary, fontWeight: '400' }}>
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

        {/* Emergency Contact */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.headerLeft}>
            <ShieldAlert size={16} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: dm.sub }]}>
              Contato de Emergência Principal
            </Text>
          </View>

          <View style={styles.contactRow}>
            <View>
              <Text style={[styles.contactName, { color: dm.text }]}>
                {user.emergencyContact.name}
              </Text>
              <Text style={[styles.contactRel, { color: dm.sub }]}>
                {user.emergencyContact.relation}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleCall(user.emergencyContact.phone)}
              activeOpacity={0.8}
              style={styles.callBtn}
            >
              <Phone size={14} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Ligar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings and Logout Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => onNavigate('settings')}
            activeOpacity={0.7}
            style={[
              styles.actionBtn,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <Settings size={16} color={dm.sub} />
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
      </View>
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
  header: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  userSus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -20,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  condTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  condTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  medList: {
    gap: 8,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 12,
    fontWeight: '800',
  },
  medFreq: {
    fontSize: 10,
    marginTop: 2,
  },
  medDose: {
    alignItems: 'flex-end',
  },
  medDoseLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  medDoseTime: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '800',
  },
  contactRel: {
    fontSize: 11,
    marginTop: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
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
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
