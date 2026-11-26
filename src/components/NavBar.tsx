import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotionButton as TouchableOpacity } from './Motion';
import {
  Home,
  FileText,
  Plus,
  Bell,
  User,
  MessageCircle,
  Users,
} from 'lucide-react-native';
import { DarkModeTheme, Screen, UserProfile } from '../types';
import { COLORS } from '../constants/theme';

interface NavBarProps {
  activeTab: string;
  onTabChange: (screen: Screen) => void;
  onQuickAction?: () => void;
  dm: DarkModeTheme;
  unreadAlertsCount?: number;
  userType: UserProfile['userType'];
}

export const NavBar: React.FC<NavBarProps> = ({
  activeTab,
  onTabChange,
  onQuickAction,
  dm,
  unreadAlertsCount = 2,
  userType,
}) => {
  const isProfessional = userType === 'Profissional';
  const isFamiliar = userType === 'Familiar';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dm.card,
          borderTopColor: dm.border,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {/* Tab 1: Home / Painel */}
        <TouchableOpacity
          onPress={() => onTabChange('home')}
          activeOpacity={0.7}
          style={styles.tabButton}
          accessibilityLabel="Início"
        >
          <Home
            size={22}
            color={activeTab === 'home' ? '#00b690' : dm.sub}
            strokeWidth={activeTab === 'home' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'home' ? '#00b690' : dm.sub,
                fontWeight: activeTab === 'home' ? '800' : '600',
              },
            ]}
          >
            {isProfessional ? 'Painel' : 'Início'}
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Histórico / Agenda */}
        <TouchableOpacity
          onPress={() => onTabChange(isProfessional ? 'appointments' : 'history')}
          activeOpacity={0.7}
          style={styles.tabButton}
          accessibilityLabel={isProfessional ? 'Agenda' : 'Histórico'}
        >
          <FileText
            size={22}
            color={
              (isProfessional && activeTab === 'appointments') ||
              (!isProfessional && activeTab === 'history')
                ? '#00b690'
                : dm.sub
            }
            strokeWidth={
              (isProfessional && activeTab === 'appointments') ||
              (!isProfessional && activeTab === 'history')
                ? 2.5
                : 2
            }
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  (isProfessional && activeTab === 'appointments') ||
                  (!isProfessional && activeTab === 'history')
                    ? '#00b690'
                    : dm.sub,
                fontWeight:
                  (isProfessional && activeTab === 'appointments') ||
                  (!isProfessional && activeTab === 'history')
                    ? '800'
                    : '600',
              },
            ]}
          >
            {isProfessional ? 'Agenda' : 'Diário'}
          </Text>
        </TouchableOpacity>

        {/* Center Floating Action Button (+) inspired by reference UI */}
        <View style={styles.centerFabWrapper}>
          <TouchableOpacity
            onPress={() => {
              if (onQuickAction) {
                onQuickAction();
              } else {
                onTabChange(isProfessional ? 'connections' : 'pressure');
              }
            }}
            activeOpacity={0.85}
            style={[
              styles.fabButton,
              {
                backgroundColor: '#00b690',
              },
            ]}
            accessibilityLabel="Ação Rápida"
          >
            <Plus size={26} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Tab 4: Alertas / Pacientes / Família */}
        <TouchableOpacity
          onPress={() =>
            onTabChange(isProfessional ? 'connections' : isFamiliar ? 'family' : 'alerts')
          }
          activeOpacity={0.7}
          style={styles.tabButton}
          accessibilityLabel={
            isProfessional ? 'Pacientes' : isFamiliar ? 'Família' : 'Alertas'
          }
        >
          <View style={styles.iconWrapper}>
            {isProfessional ? (
              <Users
                size={22}
                color={activeTab === 'connections' ? '#00b690' : dm.sub}
                strokeWidth={activeTab === 'connections' ? 2.5 : 2}
              />
            ) : isFamiliar ? (
              <Users
                size={22}
                color={activeTab === 'family' ? '#00b690' : dm.sub}
                strokeWidth={activeTab === 'family' ? 2.5 : 2}
              />
            ) : (
              <Bell
                size={22}
                color={activeTab === 'alerts' ? '#00b690' : dm.sub}
                strokeWidth={activeTab === 'alerts' ? 2.5 : 2}
              />
            )}
            {!isProfessional && !isFamiliar && unreadAlertsCount > 0 && activeTab !== 'alerts' && (
              <View style={styles.badgeDot} />
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  (isProfessional && activeTab === 'connections') ||
                  (isFamiliar && activeTab === 'family') ||
                  (!isProfessional && !isFamiliar && activeTab === 'alerts')
                    ? '#00b690'
                    : dm.sub,
                fontWeight:
                  (isProfessional && activeTab === 'connections') ||
                  (isFamiliar && activeTab === 'family') ||
                  (!isProfessional && !isFamiliar && activeTab === 'alerts')
                    ? '800'
                    : '600',
              },
            ]}
          >
            {isProfessional ? 'Pacientes' : isFamiliar ? 'Família' : 'Alertas'}
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Perfil */}
        <TouchableOpacity
          onPress={() => onTabChange('profile')}
          activeOpacity={0.7}
          style={styles.tabButton}
          accessibilityLabel="Perfil"
        >
          <User
            size={22}
            color={activeTab === 'profile' ? '#00b690' : dm.sub}
            strokeWidth={activeTab === 'profile' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'profile' ? '#00b690' : dm.sub,
                fontWeight: activeTab === 'profile' ? '800' : '600',
              },
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  centerFabWrapper: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00b690',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrapper: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: -0.2,
  },
});
