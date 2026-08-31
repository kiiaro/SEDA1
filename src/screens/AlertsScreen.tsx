import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowRight, Check } from 'lucide-react-native';
import { AlertItem, DarkModeTheme, Screen } from '../types';
import { BackHeader } from '../components/BackHeader';

interface AlertsScreenProps {
  alerts: AlertItem[];
  onDismissAlert: (id: string) => void;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onDismissAlert,
  onNavigate,
  onBack,
  dm,
}) => {
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Central de Alertas"
        subtitle="Notificações críticas, remédios e consultas"
        onBack={onBack}
        bgGradient={['#991B1B', '#DC2626', '#E45454']}
      />

      <View style={styles.content}>
        {alerts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.emptyIconBox}>
              <Check size={32} color="#16A34A" />
            </View>
            <Text style={[styles.emptyTitle, { color: dm.text }]}>
              Nenhum alerta pendente
            </Text>
            <Text style={[styles.emptyDesc, { color: dm.sub }]}>
              Todas as suas medicações e medições estão 100% em dia.
            </Text>
          </View>
        ) : (
          alerts.map((alt) => (
            <View
              key={alt.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: dm.card,
                  borderColor: dm.border,
                  borderLeftColor: alt.color,
                },
              ]}
            >
              <View style={styles.alertTop}>
                <View style={styles.alertMainInfo}>
                  <View
                    style={[
                      styles.emojiBox,
                      { backgroundColor: `${alt.color}18` },
                    ]}
                  >
                    <Text style={styles.emojiText}>{alt.emoji}</Text>
                  </View>

                  <View style={styles.alertTextWrapper}>
                    <Text style={[styles.alertTitle, { color: dm.text }]}>
                      {alt.title}
                    </Text>
                    <Text style={[styles.alertDesc, { color: dm.sub }]}>
                      {alt.desc}
                    </Text>
                  </View>
                </View>

                <View style={styles.timeBadge}>
                  <Text style={[styles.timeText, { color: dm.sub }]}>
                    {alt.time}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View
                style={[
                  styles.alertActions,
                  { borderTopColor: dm.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => onDismissAlert(alt.id)}
                  activeOpacity={0.7}
                  style={styles.dismissBtn}
                >
                  <Text style={[styles.dismissBtnText, { color: dm.sub }]}>
                    Dispensar
                  </Text>
                </TouchableOpacity>

                {alt.actionLabel && (
                  <TouchableOpacity
                    onPress={() => {
                      if (alt.actionScreen) {
                        onNavigate(alt.actionScreen);
                      } else {
                        onDismissAlert(alt.id);
                      }
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: alt.color },
                    ]}
                  >
                    <Text style={styles.actionBtnText}>{alt.actionLabel}</Text>
                    <ArrowRight size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
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
  content: {
    padding: 16,
    gap: 12,
  },
  emptyCard: {
    borderRadius: 22,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 18,
  },
  alertCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
    elevation: 1,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  alertMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  emojiBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  alertTextWrapper: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  alertDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dismissBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
