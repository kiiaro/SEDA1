import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Stethoscope,
  Video,
  MapPin,
  Check,
  ArrowRight,
  Building2,
} from 'lucide-react';
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
    <div className="flex-1 flex flex-col select-none pb-8 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Agendar Consulta SUS"
        subtitle="Preencha os dados do atendimento"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 100%)"
      />

      <form onSubmit={handleSave} className="p-4 space-y-4">
        {/* Error Banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-xs text-red-700 dark:text-red-300 font-bold animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Quem agenda: Toggle Paciente / Familiar */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            1. Quem está realizando o agendamento?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-agenda-paciente"
              type="button"
              onClick={() => setBookedBy('Paciente')}
              className="btn-press py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center"
              style={{
                backgroundColor: bookedBy === 'Paciente' ? `${COLORS.primary}18` : dm.bg,
                borderColor: bookedBy === 'Paciente' ? COLORS.primary : dm.border,
                color: bookedBy === 'Paciente' ? COLORS.primary : dm.sub,
              }}
            >
              Eu Mesmo (Paciente)
            </button>

            <button
              id="btn-agenda-familiar"
              type="button"
              onClick={() => setBookedBy('Familiar')}
              className="btn-press py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center"
              style={{
                backgroundColor: bookedBy === 'Familiar' ? `${COLORS.primary}18` : dm.bg,
                borderColor: bookedBy === 'Familiar' ? COLORS.primary : dm.border,
                color: bookedBy === 'Familiar' ? COLORS.primary : dm.sub,
              }}
            >
              Familiar / Cuidador
            </button>
          </div>
        </div>

        {/* 2. Tipo: Toggle Presencial / Teleconsulta */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            2. Formato do Atendimento
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-type-presencial"
              type="button"
              onClick={() => setType('presencial')}
              className="btn-press py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: type === 'presencial' ? `${COLORS.primary}18` : dm.bg,
                borderColor: type === 'presencial' ? COLORS.primary : dm.border,
                color: type === 'presencial' ? COLORS.primary : dm.sub,
              }}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Presencial na UBS</span>
            </button>

            <button
              id="btn-type-teleconsulta"
              type="button"
              onClick={() => setType('teleconsulta')}
              className="btn-press py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: type === 'teleconsulta' ? `${COLORS.purple}18` : dm.bg,
                borderColor: type === 'teleconsulta' ? COLORS.purple : dm.border,
                color: type === 'teleconsulta' ? COLORS.purple : dm.sub,
              }}
            >
              <Video className="w-4 h-4" />
              <span>Teleconsulta Online</span>
            </button>
          </div>
        </div>

        {/* 3. Médico */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            3. Nome do Médico / Profissional
          </label>
          <input
            id="input-new-appt-doctor"
            type="text"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            placeholder="Ex: Dra. Juliana Santos"
            className="w-full px-3.5 py-3 rounded-xl text-sm font-semibold border outline-hidden"
            style={{
              backgroundColor: dm.bg,
              borderColor: dm.border,
              color: dm.text,
            }}
          />
        </div>

        {/* 4. Especialidade: 8 Pills Clicáveis (flex-wrap) */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            4. Especialidade Médica
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SPECIALTIES.map((spec) => {
              const isSelected = specialty === spec;
              return (
                <button
                  id={`btn-spec-${spec.replace(/\s+/g, '-').toLowerCase()}`}
                  key={spec}
                  type="button"
                  onClick={() => setSpecialty(spec)}
                  className="btn-press px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: isSelected ? `${COLORS.primary}18` : dm.bg,
                    borderColor: isSelected ? COLORS.primary : dm.border,
                    color: isSelected ? COLORS.primary : dm.sub,
                  }}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Local (Radio-style se presencial) */}
        {type === 'presencial' && (
          <div
            className="rounded-2xl p-4 border shadow-xs space-y-2"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              5. Unidade de Saúde (UBS / AME)
            </label>
            {HEALTH_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc.name;
              return (
                <button
                  id={`btn-loc-${loc.id}`}
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocation(loc.name)}
                  className="btn-press w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all"
                  style={{
                    backgroundColor: isSelected ? `${COLORS.primary}12` : dm.bg,
                    borderColor: isSelected ? COLORS.primary : dm.border,
                  }}
                >
                  <div>
                    <p className="text-xs font-bold" style={{ color: dm.text }}>
                      {loc.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{loc.address}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* 6. Data + Hora (Nativos lado a lado) */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            6. Data e Horário
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Data
              </span>
              <input
                id="input-new-appt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-hidden"
                style={{
                  backgroundColor: dm.bg,
                  borderColor: dm.border,
                  color: dm.text,
                }}
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Horário
              </span>
              <input
                id="input-new-appt-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-hidden"
                style={{
                  backgroundColor: dm.bg,
                  borderColor: dm.border,
                  color: dm.text,
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          id="btn-submit-new-appointment"
          type="submit"
          className="btn-press w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2 mt-2"
          style={{
            backgroundColor: COLORS.primary,
            boxShadow: `0 8px 24px ${COLORS.primary}40`,
          }}
        >
          <span>Confirmar Agendamento</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
