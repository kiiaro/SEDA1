import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, CalendarPlus, Droplets, HeartPulse, Mic, QrCode, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen, UserProfile } from '../types';
import { MotionButton as TouchableOpacity } from './Motion';

interface QuickRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (screen: Screen) => void;
  dm: DarkModeTheme;
  userType?: UserProfile['userType'];
  monitoredPatientName?: string;
}

export const QuickRegisterModal: React.FC<QuickRegisterModalProps> = ({
  visible,
  onClose,
  onSelect,
  dm,
  userType = 'Paciente',
  monitoredPatientName,
}) => {
  const isProfessional = userType === 'Profissional';
  const isFamiliar = userType === 'Familiar';

  const options: Array<{
    screen: Screen;
    title: string;
    desc: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
  }> = isProfessional
    ? [
        {
          screen: 'connections',
          title: 'Gerar QR Code e Pacientes',
          desc: 'Conecte novos pacientes e acesse o chat clínico',
          color: COLORS.primary,
          bg: 'rgba(0, 182, 144, 0.12)',
          icon: <QrCode size={20} color={COLORS.primary} />,
        },
        {
          screen: 'new_appointment',
          title: 'Novo Atendimento',
          desc: 'Agende consulta presencial na UBS ou teleconsulta',
          color: COLORS.secondary,
          bg: 'rgba(38, 77, 140, 0.12)',
          icon: <CalendarPlus size={20} color={COLORS.secondary} />,
        },
        {
          screen: 'appointments',
          title: 'Agenda Clínica',
          desc: 'Consulte próximos atendimentos e histórico',
          color: COLORS.primary,
          bg: 'rgba(0, 182, 144, 0.12)',
          icon: <CalendarDays size={20} color={COLORS.primary} />,
        },
      ]
    : [
        {
          screen: 'pressure',
          title: 'Pressão Arterial',
          desc: 'Sistólica, diastólica e pulso cardíaco',
          color: COLORS.primary,
          bg: 'rgba(0, 182, 144, 0.12)',
          icon: <HeartPulse size={20} color={COLORS.primary} />,
        },
        {
          screen: 'glucose',
          title: 'Glicemia Capilar',
          desc: 'Medição em jejum ou pós-refeição',
          color: COLORS.secondary,
          bg: 'rgba(38, 77, 140, 0.12)',
          icon: <Droplets size={20} color={COLORS.secondary} />,
        },
        {
          screen: 'voice',
          title: 'Registro por Voz',
          desc: 'Fale sua pressão, glicemia ou batimentos',
          color: COLORS.primary,
          bg: 'rgba(0, 182, 144, 0.12)',
          icon: <Mic size={20} color={COLORS.primary} />,
        },
      ];

  const modalTitle = isProfessional ? 'Ações Clínicas' : 'Novo Registro';
  const modalSubtitle = isProfessional
    ? 'Atalhos rápidos para o consultório'
    : isFamiliar && monitoredPatientName
      ? `Registrar medição para ${monitoredPatientName}`
      : 'Escolha como deseja registrar sua saúde';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: dm.text }]}>{modalTitle}</Text>
              <Text style={[styles.subtitle, { color: dm.sub }]}>{modalSubtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar menu de registros"
              style={[styles.closeBtn, { backgroundColor: dm.inputBg, borderColor: dm.border }]}
            >
              <X size={16} color={dm.sub} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.screen}
                onPress={() => {
                  onClose();
                  onSelect(opt.screen);
                }}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={opt.title}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: dm.isDark ? '#0D172B' : '#F8FAFC',
                    borderColor: dm.border,
                  },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: opt.bg }]}>
                  {opt.icon}
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={[styles.optionTitle, { color: dm.text }]}>{opt.title}</Text>
                  <Text style={[styles.optionDesc, { color: dm.sub }]}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  sheet: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextBox: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
  },
});
