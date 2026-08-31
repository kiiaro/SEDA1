import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, History, Bell, Users, User } from 'lucide-react-native';
import { DarkModeTheme, Screen } from '../types';
import { COLORS } from '../constants/theme';

interface NavBarProps {
  activeTab: string;
  onTabChange: (screen: Screen) => void;
  dm: DarkModeTheme;
  unreadAlertsCount?: number;
}

export const NavBar: React.FC<NavBarProps> = ({
  activeTab,
  onTabChange,
  dm,
  unreadAlertsCount = 2,
}) => {
  const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'alerts', label: 'Alertas', icon: Bell, badge: unreadAlertsCount },
    { id: 'family', label: 'Família', icon: Users },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

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
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id as Screen)}
              activeOpacity={0.7}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive ? `${COLORS.primary}18` : 'transparent',
                },
              ]}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  size={21}
                  color={isActive ? COLORS.primary : dm.sub}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.badge && tab.badge > 0 && !isActive && (
                  <View style={styles.badgeDot} />
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? COLORS.primary : dm.sub,
                    fontWeight: isActive ? '800' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>

              {isActive && <View style={styles.activePill} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 4,
    paddingHorizontal: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: 52,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 14,
    minHeight: 46,
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
    marginTop: 2,
    letterSpacing: -0.2,
  },
  activePill: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
});
