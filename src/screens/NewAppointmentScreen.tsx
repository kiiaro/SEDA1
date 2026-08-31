import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  AlertTriangle,
  Stethoscope,
  Video,
  Check,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS, HEALTH_LOCATIONS, SPECIALTIES } from '../constants/theme';
import { Appointment, DarkModeTheme, Screen } from '../types';
import { BackHeader } from '../components/BackHeader';

interface NewAppointmentScreenProps {
  onSaveAppointment: (appt: Appointment) => void;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const NewAppointmentScreen: React.FC<NewAppointmentScreenProps> = ({
  onSaveAppointment,
  onNavigate,
  onBack,
  dm,
}) => {
  const [bookedBy, setBookedBy] = useState<'Paciente' | 'Familiar'>('Paciente');
  const [type, setType] = useState<'presencial' | 'teleconsulta'>('presencial');
  const [doctor, setDoctor] = useState('Dr. Marcelo Antunes');
  const [specialty, setSpecialty] = useState('Cardiologia SUS');
  const [selectedLocation, setSelectedLocation] = useState(HEALTH_LOCATIONS[0].name);
  const [date, setDate] = useState('2026-09-12');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = () => {
    if (!doctor.trim()) {
      setErrorMessage('Informe o nome do médico ou especialista.');
      return;
    }
    if (!date) {
      setErrorMessage('Selecione a data da consulta.');
      return;
    }

    setErrorMessage('');

    const newAppt: Appointment = {
      id: Date.now(),
      doctor: doctor.trim(),
      specialty: specialty,
      date: date,
      time: time,
      type: type,
      status: 'pending',
      location: type === 'presencial' ? selectedLocation : 'Teleconsulta Conecte SUS',
      bookedBy: bookedBy === 'Paciente' ? 'Antônio Carlos Silva' : 'Ana Silva (Familiar / Cuidadora)',
      notes: notes.trim() || 'Acompanhamento preventivo periódico.',
    };

    onSaveAppointment(newAppt);
    onNavigate('appointments');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title="Agendar Consulta SUS"
        subtitle="Preencha os dados do atendimento"
        onBack={onBack}
        bgGradient={['#1E3A5F', '#3D6E9F']}
      />

      <View style={styles.form}>
        {/* Error */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* 1. Quem agenda */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dm.sub }]}>
            1. Quem está realizando o agendamento?
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setBookedBy('Paciente')}
              activeOpacity={0.7}
              style={[
                styles.toggleBtn,
                bookedBy === 'Paciente'
                  ? { backgroundColor: `${COLORS.primary}18`, borderColor: COLORS.primary }
                  : { backgroundColor: dm.inputBg, borderColor: dm.border },
              ]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: bookedBy === 'Paciente' ? COLORS.primary : dm.sub },
                ]}
              >
                Eu Mesmo (Paciente)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setBookedBy('Familiar')}
              activeOpacity={0.7}
              style={[
                styles.toggleBtn,
                bookedBy === 'Familiar'
                  ? { backgroundColor: `${COLORS.primary}18`, borderColor: COLORS.primary }
                  : { backgroundColor: dm.inputBg, borderColor: dm.border },
              ]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: bookedBy === 'Familiar' ? COLORS.primary : dm.sub },
                ]}
              >
                Familiar / Cuidador
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Formato */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dm.sub }]}>
            2. Formato do Atendimento
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setType('presencial')}
              activeOpacity={0.7}
              style={[
                styles.toggleBtn,
                type === 'presencial'
                  ? { backgroundColor: `${COLORS.primary}18`, borderColor: COLORS.primary }
                  : { backgroundColor: dm.inputBg, borderColor: dm.border },
              ]}
            >
              <Stethoscope size={16} color={type === 'presencial' ? COLORS.primary : dm.sub} />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: type === 'presencial' ? COLORS.primary : dm.sub },
                ]}
              >
                Presencial UBS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setType('teleconsulta')}
              activeOpacity={0.7}
              style={[
                styles.toggleBtn,
                type === 'teleconsulta'
                  ? { backgroundColor: 'rgba(107, 127, 212, 0.18)', borderColor: '#6B7FD4' }
                  : { backgroundColor: dm.inputBg, borderColor: dm.border },
              ]}
            >
              <Video size={16} color={type === 'teleconsulta' ? '#6B7FD4' : dm.sub} />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: type === 'teleconsulta' ? '#6B7FD4' : dm.sub },
                ]}
              >
                Teleconsulta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Médico */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dm.sub }]}>
            3. Nome do Médico / Profissional
          </Text>
          <TextInput
            value={doctor}
            onChangeText={setDoctor}
            placeholder="Ex: Dra. Juliana Santos"
            placeholderTextColor={dm.sub}
            style={[
              styles.input,
              {
                backgroundColor: dm.inputBg,
                borderColor: dm.border,
                color: dm.text,
              },
            ]}
          />
        </View>

        {/* 4. Especialidade */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dm.sub }]}>
            4. Especialidade Médica
          </Text>
          <View style={styles.pillsWrap}>
            {SPECIALTIES.map((spec) => {
              const isSelected = specialty === spec;
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => setSpecialty(spec)}
                  activeOpacity={0.7}
                  style={[
                    styles.specPill,
                    {
                      backgroundColor: isSelected ? `${COLORS.primary}18` : dm.inputBg,
                      borderColor: isSelected ? COLORS.primary : dm.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.specPillText,
                      { color: isSelected ? COLORS.primary : dm.sub },
                    ]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Local */}
        {type === 'presencial' && (
          <View
            style={[
              styles.card,
              { backgroundColor: dm.card, borderColor: dm.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: dm.sub }]}>
              5. Unidade de Saúde (UBS / AME)
            </Text>
            <View style={styles.locationsList}>
              {HEALTH_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc.name;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => setSelectedLocation(loc.name)}
                    activeOpacity={0.7}
                    style={[
                      styles.locationItem,
                      {
                        backgroundColor: isSelected ? `${COLORS.primary}12` : dm.inputBg,
                        borderColor: isSelected ? COLORS.primary : dm.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.locName, { color: dm.text }]}>
                        {loc.name}
                      </Text>
                      <Text style={styles.locAddr}>{loc.address}</Text>
                    </View>
                    {isSelected && <Check size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 6. Data & Hora */}
        <View
          style={[
            styles.card,
            { backgroundColor: dm.card, borderColor: dm.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dm.sub }]}>
            6. Data e Horário
          </Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Data (AAAA-MM-DD)</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-09-12"
                placeholderTextColor={dm.sub}
                style={[
                  styles.input,
                  {
                    backgroundColor: dm.inputBg,
                    borderColor: dm.border,
                    color: dm.text,
                  },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Horário (HH:MM)</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="10:00"
                placeholderTextColor={dm.sub}
                style={[
                  styles.input,
                  {
                    backgroundColor: dm.inputBg,
                    borderColor: dm.border,
                    color: dm.text,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={[styles.submitBtn, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.submitBtnText}>Confirmar Agendamento</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
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
  form: {
    padding: 16,
    gap: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 13,
    fontWeight: '700',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  specPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  specPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  locationsList: {
    gap: 8,
    marginTop: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  locName: {
    fontSize: 12,
    fontWeight: '800',
  },
  locAddr: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
