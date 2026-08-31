import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Stethoscope,
  CheckCircle2,
  Hourglass,
  XCircle,
  Plus,
  Trash2,
  User,
  Building2,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Appointment, DarkModeTheme, Screen } from '../types';
import { BackHeader } from '../components/BackHeader';

interface AppointmentsScreenProps {
  appointments: Appointment[];
  onCancelAppointment: (id: number) => void;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  onCancelAppointment,
  onNavigate,
  onBack,
  dm,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingList = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && a.date >= todayStr
  );

  const pastList = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.date < todayStr
  );

  const currentList = activeTab === 'upcoming' ? upcomingList : pastList;
  const nextAppt = upcomingList.sort((a, b) => a.date.localeCompare(b.date))[0];

  const handleConfirmCancel = () => {
    if (cancelModalAppt) {
      onCancelAppointment(cancelModalAppt.id);
      setCancelModalAppt(null);
    }
  };

  const renderStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <CheckCircle2 size={12} color="#16A34A" />
            <Text style={[styles.statusText, { color: '#16A34A' }]}>Confirmado</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Hourglass size={12} color="#D97706" />
            <Text style={[styles.statusText, { color: '#D97706' }]}>Pendente UBS</Text>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
            <CheckCircle2 size={12} color="#0284C7" />
            <Text style={[styles.statusText, { color: '#0284C7' }]}>Realizada</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <XCircle size={12} color="#DC2626" />
            <Text style={[styles.statusText, { color: '#DC2626' }]}>Cancelada</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: dm.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader
          title="Consultas Médicas SUS"
          subtitle="Agendamentos presenciais e teleconsultas"
          onBack={onBack}
          bgGradient={['#1E3A5F', '#3D6E9F']}
          rightElement={
            <TouchableOpacity
              onPress={() => onNavigate('new_appointment')}
              activeOpacity={0.7}
              style={styles.headerBtn}
              accessibilityLabel="Nova consulta"
            >
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          }
        />

        <View style={styles.body}>
          {/* Highlight Next Appointment */}
          {nextAppt && (
            <LinearGradient
              colors={['#3D6E9F', '#5E8FC0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.highlightCard}
            >
              <View style={styles.highlightHeader}>
                <View style={styles.highlightTag}>
                  <Text style={styles.highlightTagText}>Próximo Atendimento</Text>
                </View>
                <Text style={styles.highlightDateTime}>
                  {nextAppt.date} • {nextAppt.time}
                </Text>
              </View>

              <Text style={styles.highlightDoctor}>{nextAppt.doctor}</Text>
              <Text style={styles.highlightSpecialty}>{nextAppt.specialty}</Text>
              <Text style={styles.highlightLocation} numberOfLines={1}>
                📍 {nextAppt.location || 'Teleconsulta Conecte SUS'}
              </Text>
            </LinearGradient>
          )}

          {/* 2 Tabs */}
          <View
            style={[
              styles.tabsWrapper,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('upcoming')}
              activeOpacity={0.7}
              style={[
                styles.tabBtn,
                activeTab === 'upcoming' && { backgroundColor: COLORS.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'upcoming' ? '#FFFFFF' : dm.sub },
                ]}
              >
                Próximas ({upcomingList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('past')}
              activeOpacity={0.7}
              style={[
                styles.tabBtn,
                activeTab === 'past' && { backgroundColor: COLORS.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'past' ? '#FFFFFF' : dm.sub },
                ]}
              >
                Histórico ({pastList.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <View style={styles.listContainer}>
            {currentList.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  { backgroundColor: dm.card, borderColor: dm.border },
                ]}
              >
                <Calendar size={36} color={dm.sub} />
                <Text style={[styles.emptyText, { color: dm.sub }]}>
                  Nenhuma consulta encontrada nesta categoria.
                </Text>
              </View>
            ) : (
              currentList.map((appt) => (
                <View
                  key={appt.id}
                  style={[
                    styles.apptCard,
                    { backgroundColor: dm.card, borderColor: dm.border },
                  ]}
                >
                  <View style={styles.apptTop}>
                    <View style={styles.doctorInfo}>
                      <View
                        style={[
                          styles.doctorIconBox,
                          {
                            backgroundColor:
                              appt.type === 'teleconsulta'
                                ? 'rgba(107, 127, 212, 0.15)'
                                : `${COLORS.primary}18`,
                          },
                        ]}
                      >
                        {appt.type === 'teleconsulta' ? (
                          <Video size={18} color="#6B7FD4" />
                        ) : (
                          <Stethoscope size={18} color={COLORS.primary} />
                        )}
                      </View>
                      <View>
                        <Text style={[styles.doctorName, { color: dm.text }]}>
                          {appt.doctor}
                        </Text>
                        <Text style={[styles.doctorSpecialty, { color: dm.sub }]}>
                          {appt.specialty}
                        </Text>
                      </View>
                    </View>

                    {renderStatusBadge(appt.status)}
                  </View>

                  <View
                    style={[
                      styles.detailsBox,
                      { backgroundColor: dm.inputBg },
                    ]}
                  >
                    <View style={styles.detailRow}>
                      <Calendar size={12} color="#94A3B8" />
                      <Text style={[styles.detailText, { color: dm.text }]}>
                        Data: {appt.date}
                      </Text>
                      <Clock size={12} color="#94A3B8" style={{ marginLeft: 8 }} />
                      <Text style={[styles.detailText, { color: dm.text }]}>
                        {appt.time}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Building2 size={12} color="#94A3B8" />
                      <Text
                        style={[styles.detailText, { color: dm.text }]}
                        numberOfLines={1}
                      >
                        {appt.location || 'Teleconsulta Conecte SUS'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <User size={12} color="#94A3B8" />
                      <Text style={styles.bookedByText}>
                        Agendado por: {appt.bookedBy}
                      </Text>
                    </View>
                  </View>

                  {appt.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>
                        📌 <Text style={{ fontWeight: '800' }}>Orientação:</Text> {appt.notes}
                      </Text>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    {appt.type === 'teleconsulta' ? (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Teleconsulta SUS', `Entrando na sala virtual com ${appt.doctor}...`)
                        }
                        activeOpacity={0.8}
                        style={styles.virtualBtn}
                      >
                        <Video size={14} color="#FFFFFF" />
                        <Text style={styles.virtualBtnText}>Entrar na Sala Virtual</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Como Chegar', `Abrindo rota no mapa para: ${appt.location}`)
                        }
                        activeOpacity={0.7}
                        style={[
                          styles.mapBtn,
                          { backgroundColor: dm.bg, borderColor: dm.border },
                        ]}
                      >
                        <MapPin size={14} color="#EF4444" />
                        <Text style={[styles.mapBtnText, { color: dm.text }]}>Como Chegar</Text>
                      </TouchableOpacity>
                    )}

                    {appt.status !== 'cancelled' && (
                      <TouchableOpacity
                        onPress={() => setCancelModalAppt(appt)}
                        activeOpacity={0.7}
                        style={styles.trashBtn}
                        accessibilityLabel="Cancelar consulta"
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Cancel Bottom Modal */}
      <Modal
        visible={!!cancelModalAppt}
        transparent
        animationType="slide"
        onRequestClose={() => setCancelModalAppt(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <View style={styles.modalDragBar} />
            <Text style={[styles.modalTitle, { color: dm.text }]}>
              Deseja Cancelar esta Consulta?
            </Text>
            <Text style={[styles.modalDesc, { color: dm.sub }]}>
              Consulta com{' '}
              <Text style={{ fontWeight: '800' }}>{cancelModalAppt?.doctor}</Text> em{' '}
              {cancelModalAppt?.date} às {cancelModalAppt?.time}.
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setCancelModalAppt(null)}
                style={[
                  styles.keepBtn,
                  { backgroundColor: dm.inputBg, borderColor: dm.border },
                ]}
              >
                <Text style={[styles.keepBtnText, { color: dm.text }]}>
                  Manter Agendamento
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmCancel}
                style={styles.confirmCancelBtn}
              >
                <Text style={styles.confirmCancelText}>Sim, Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  body: {
    padding: 16,
    gap: 14,
  },
  highlightCard: {
    borderRadius: 20,
    padding: 16,
    elevation: 3,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  highlightTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  highlightTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  highlightDateTime: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  highlightDoctor: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  highlightSpecialty: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  highlightLocation: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 6,
  },
  tabsWrapper: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  listContainer: {
    gap: 12,
  },
  emptyBox: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  apptCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    elevation: 1,
  },
  apptTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  doctorIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '800',
  },
  doctorSpecialty: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailsBox: {
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookedByText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  notesBox: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesText: {
    fontSize: 11,
    color: '#92400E',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  virtualBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3D6E9F',
  },
  virtualBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  trashBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
  },
  modalDragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
