import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Moon,
  Sun,
  Type,
  Globe,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, FontSizeScale } from '../types';
import { BackHeader } from '../components/BackHeader';

interface SettingsScreenProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  fontSize: FontSizeScale;
  setFontSize: (val: FontSizeScale) => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  onBack,
  dm,
}) => {
  const [notifyMeds, setNotifyMeds] = useState(true);
  const [notifyPress, setNotifyPress] = useState(true);
  const [notifyAppts, setNotifyAppts] = useState(true);

  const fontOptions: { id: FontSizeScale; label: string }[] = [
    { id: 'normal', label: 'Normal (1x)' },
    { id: 'large', label: 'Grande (1.12x)' },
    { id: 'xl', label: 'Extra (1.26x)' },
  ];

  const handlePrivacy = () => {
    Alert.alert('Privacidade & LGPD', 'SEDA está em total conformidade com a LGPD e sigilo médico SUS.');
  };

  const handleHelp = () => {
    Alert.alert('Central de Ajuda SEDA', 'WhatsApp de Suporte (11) 98765-4321 ou ligue 136 (Disque Saúde SUS).');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Configurações & Acessibilidade"
        subtitle="Ajustes visuais, tamanho de fonte e alertas"
        onBack={onBack}
        bgGradient={['#1E3A5F', '#3D6E9F']}
      />

      <View style={styles.content}>
        {/* Dark Mode */}
        <View
          style={[
            styles.card,
            styles.toggleCard,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.cardLeft}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${COLORS.primary}18` },
              ]}
            >
              {darkMode ? (
                <Moon size={20} color={COLORS.primary} />
              ) : (
                <Sun size={20} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.cardTextWrapper}>
              <Text style={[styles.cardTitle, { color: dm.text }]}>
                Modo Escuro (Dark Mode)
              </Text>
              <Text style={[styles.cardSub, { color: dm.sub }]}>
                Conforto visual para leitura noturna
              </Text>
            </View>
          </View>

          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Font Scaling */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.headerLeft}>
            <Type size={16} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: dm.sub }]}>
              Tamanho do Texto (Acessibilidade 45+)
            </Text>
          </View>

          <View style={styles.fontOptionsRow}>
            {fontOptions.map((opt) => {
              const isSelected = fontSize === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setFontSize(opt.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.fontBtn,
                    {
                      backgroundColor: isSelected ? `${COLORS.primary}18` : dm.inputBg,
                      borderColor: isSelected ? COLORS.primary : dm.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.fontBtnText,
                      {
                        color: isSelected ? COLORS.primary : dm.sub,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.headerLeft}>
            <Bell size={16} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: dm.sub }]}>
              Notificações e Lembretes
            </Text>
          </View>

          <View style={styles.notifyItem}>
            <View style={styles.notifyTextWrapper}>
              <Text style={[styles.notifyTitle, { color: dm.text }]}>
                Lembrete de Remédios
              </Text>
              <Text style={[styles.notifySub, { color: dm.sub }]}>
                Aviso sonoro no horário da dose
              </Text>
            </View>
            <Switch
              value={notifyMeds}
              onValueChange={setNotifyMeds}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.notifyItem, styles.itemBorder, { borderTopColor: dm.border }]}>
            <View style={styles.notifyTextWrapper}>
              <Text style={[styles.notifyTitle, { color: dm.text }]}>
                Aferição de Pressão & Glicose
              </Text>
              <Text style={[styles.notifySub, { color: dm.sub }]}>
                Lembrete matinal e noturno
              </Text>
            </View>
            <Switch
              value={notifyPress}
              onValueChange={setNotifyPress}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.notifyItem, styles.itemBorder, { borderTopColor: dm.border }]}>
            <View style={styles.notifyTextWrapper}>
              <Text style={[styles.notifyTitle, { color: dm.text }]}>
                Consultas & Agendamentos UBS
              </Text>
              <Text style={[styles.notifySub, { color: dm.sub }]}>
                Aviso com 24h de antecedência
              </Text>
            </View>
            <Switch
              value={notifyAppts}
              onValueChange={setNotifyAppts}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Language */}
        <View
          style={[
            styles.card,
            styles.toggleCard,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.cardLeft}>
            <Globe size={20} color={COLORS.primary} />
            <View style={styles.cardTextWrapper}>
              <Text style={[styles.cardTitle, { color: dm.text }]}>
                Idioma do Sistema
              </Text>
              <Text style={[styles.cardSub, { color: dm.sub }]}>
                Português do Brasil (Padrão SUS)
              </Text>
            </View>
          </View>

          <View style={[styles.langBadge, { backgroundColor: `${COLORS.primary}15` }]}>
            <Text style={[styles.langBadgeText, { color: COLORS.primary }]}>
              Português (BR)
            </Text>
          </View>
        </View>

        {/* Privacy & Help links */}
        <View
          style={[
            styles.card,
            styles.linksCard,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <TouchableOpacity
            onPress={handlePrivacy}
            activeOpacity={0.7}
            style={[styles.linkRow, { borderBottomColor: dm.border }]}
          >
            <View style={styles.linkLeft}>
              <Lock size={16} color={dm.sub} />
              <Text style={[styles.linkTitle, { color: dm.text }]}>
                Privacidade & Proteção de Dados (LGPD)
              </Text>
            </View>
            <ChevronRight size={16} color={dm.sub} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHelp}
            activeOpacity={0.7}
            style={styles.linkRowNoBorder}
          >
            <View style={styles.linkLeft}>
              <HelpCircle size={16} color={dm.sub} />
              <Text style={[styles.linkTitle, { color: dm.text }]}>
                Ajuda, Tutorial & Suporte SUS
              </Text>
            </View>
            <ChevronRight size={16} color={dm.sub} />
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
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fontOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnText: {
    fontSize: 11,
  },
  notifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemBorder: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
  },
  notifyTextWrapper: {
    flex: 1,
  },
  notifyTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  notifySub: {
    fontSize: 10,
    marginTop: 1,
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  linksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  linkRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  linkTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
});
