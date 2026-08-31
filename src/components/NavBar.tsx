import React from 'react';
import { Home, History, Bell, Users, User } from 'lucide-react';
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
    <nav
      className="sticky bottom-0 left-0 right-0 w-full border-t z-30 transition-colors duration-200"
      style={{
        backgroundColor: dm.card,
        borderColor: dm.border,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 min-h-[58px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as Screen)}
              className="btn-press flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl relative transition-all duration-200 min-h-[46px]"
              style={{
                backgroundColor: isActive ? `${COLORS.primary}18` : 'transparent',
                color: isActive ? COLORS.primary : dm.sub,
              }}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-transform"
                  style={{
                    strokeWidth: isActive ? 2.5 : 2,
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  }}
                />
                {tab.badge && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </div>

              <span
                className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap"
                style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? COLORS.primary : dm.sub,
                }}
              >
                {tab.label}
              </span>

              {/* Active 16x3px bottom pill indicator */}
              {isActive && (
                <div
                  className="mt-0.5 rounded-full"
                  style={{
                    width: 16,
                    height: 3,
                    backgroundColor: COLORS.primary,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
