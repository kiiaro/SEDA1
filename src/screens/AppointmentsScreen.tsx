import React, { useState } from 'react';
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
  ChevronRight,
  User,
  Building2,
} from 'lucide-react';
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

  // Filtering upcoming vs past
  const upcomingList = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && a.date >= todayStr
  );

  const pastList = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.date < todayStr
  );

  const currentList = activeTab === 'upcoming' ? upcomingList : pastList;

  // Next appointment for top glassmorphism card
  const nextAppt = upcomingList.sort((a, b) => a.date.localeCompare(b.date))[0];

  const handleConfirmCancel = () => {
    if (cancelModalAppt) {
      onCancelAppointment(cancelModalAppt.id);
      setCancelModalAppt(null);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600">
            <Hourglass className="w-3.5 h-3.5" /> Pendente UBS
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Realizada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-600">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col select-none pb-16 transition-colors duration-300 relative" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Consultas Médicas SUS"
        subtitle="Agendamentos presenciais e teleconsultas"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 100%)"
        rightElement={
          <button
            id="btn-header-new-appt"
            type="button"
            onClick={() => onNavigate('new_appointment')}
            className="btn-press p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
            aria-label="Nova consulta"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Top Glassmorphism Highlight Card for Next Appointment */}
        {nextAppt && (
          <div
            className="rounded-2xl p-4 text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3D6E9F 0%, #5E8FC0 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Próximo Atendimento
              </span>
              <span className="text-xs font-bold text-white">
                {nextAppt.date} • {nextAppt.time}
              </span>
            </div>

            <h3 className="text-base font-black truncate">{nextAppt.doctor}</h3>
            <p className="text-xs text-blue-100 font-medium">{nextAppt.specialty}</p>
            <p className="text-[11px] text-white/90 mt-1 truncate">
              📍 {nextAppt.location || 'Teleconsulta Conecte SUS'}
            </p>
          </div>
        )}

        {/* 2 Tabs: Próximas / Passadas */}
        <div
          className="p-1 rounded-2xl border flex items-center gap-1 shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <button
            id="btn-appt-tab-upcoming"
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className="btn-press flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center"
            style={{
              backgroundColor: activeTab === 'upcoming' ? COLORS.primary : 'transparent',
              color: activeTab === 'upcoming' ? '#FFFFFF' : dm.sub,
              boxShadow: activeTab === 'upcoming' ? '0 2px 8px rgba(94,143,192,0.35)' : 'none',
            }}
          >
            Próximas ({upcomingList.length})
          </button>

          <button
            id="btn-appt-tab-past"
            type="button"
            onClick={() => setActiveTab('past')}
            className="btn-press flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center"
            style={{
              backgroundColor: activeTab === 'past' ? COLORS.primary : 'transparent',
              color: activeTab === 'past' ? '#FFFFFF' : dm.sub,
              boxShadow: activeTab === 'past' ? '0 2px 8px rgba(94,143,192,0.35)' : 'none',
            }}
          >
            Histórico ({pastList.length})
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <div
              className="rounded-2xl p-8 border text-center"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
              }}
            >
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">
                Nenhuma consulta encontrada nesta categoria.
              </p>
            </div>
          ) : (
            currentList.map((appt) => (
              <div
                key={appt.id}
                className="rounded-2xl p-4 border shadow-xs transition-all space-y-3 animate-float-up"
                style={{
                  backgroundColor: dm.card,
                  borderColor: dm.border,
                }}
              >
                {/* Top: Doctor, Specialty and Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor:
                          appt.type === 'teleconsulta' ? `${COLORS.purple}18` : `${COLORS.primary}18`,
                        color: appt.type === 'teleconsulta' ? COLORS.purple : COLORS.primary,
                      }}
                    >
                      {appt.type === 'teleconsulta' ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <Stethoscope className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold" style={{ color: dm.text }}>
                        {appt.doctor}
                      </h4>
                      <p className="text-xs text-slate-500">{appt.specialty}</p>
                    </div>
                  </div>

                  <div>{getStatusBadge(appt.status)}</div>
                </div>

                {/* Details Section with dm.bg background */}
                <div
                  className="rounded-xl p-3 space-y-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: dm.bg,
                    color: dm.text,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Data: {appt.date}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                    <span>Horário: {appt.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{appt.location || 'Teleconsulta Conecte SUS'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    <span>Agendado por: {appt.bookedBy}</span>
                  </div>
                </div>

                {/* Yellow Notes Box (#FEF3C7) */}
                {appt.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    📌 <strong>Orientação:</strong> {appt.notes}
                  </div>
                )}

                {/* Conditional Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {appt.type === 'teleconsulta' ? (
                    <button
                      id={`btn-tele-join-${appt.id}`}
                      type="button"
                      onClick={() => alert(`Entrando na Sala de Teleconsulta SUS com ${appt.doctor}...`)}
                      className="btn-press flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #3D6E9F 0%, #5E8FC0 100%)',
                      }}
                    >
                      <Video className="w-4 h-4" />
                      <span>Entrar na Sala Virtual</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-map-${appt.id}`}
                      type="button"
                      onClick={() => alert(`Abrindo rota no mapa para: ${appt.location}`)}
                      className="btn-press flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: dm.bg,
                        borderColor: dm.border,
                        color: dm.text,
                      }}
                    >
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>Como Chegar</span>
                    </button>
                  )}

                  {appt.status !== 'cancelled' && (
                    <button
                      id={`btn-cancel-appt-trigger-${appt.id}`}
                      type="button"
                      onClick={() => setCancelModalAppt(appt)}
                      className="btn-press w-10 h-10 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100"
                      aria-label="Cancelar consulta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button (+) Fixed above Navbar */}
      <button
        id="btn-fab-new-appointment"
        type="button"
        onClick={() => onNavigate('new_appointment')}
        className="btn-press absolute bottom-4 right-4 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-2xl z-20"
        style={{
          backgroundColor: COLORS.primary,
          boxShadow: '0 8px 24px rgba(94, 143, 192, 0.5)',
        }}
        aria-label="Agendar Nova Consulta"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Cancellation Bottom Sheet Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-[440px] rounded-t-[24px] p-6 shadow-2xl border-t animate-float-up"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            {/* Drag Handle (40x4px) */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

            <h3 className="text-lg font-black text-center" style={{ color: dm.text }}>
              Deseja Cancelar esta Consulta?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Consulta com <strong>{cancelModalAppt.doctor}</strong> em {cancelModalAppt.date} às {cancelModalAppt.time}.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                id="btn-keep-appointment"
                type="button"
                onClick={() => setCancelModalAppt(null)}
                className="btn-press flex-1 py-3.5 rounded-xl font-bold text-xs border"
                style={{
                  backgroundColor: dm.bg,
                  borderColor: dm.border,
                  color: dm.text,
                }}
              >
                Manter Agendamento
              </button>

              <button
                id="btn-confirm-cancel-appointment"
                type="button"
                onClick={handleConfirmCancel}
                className="btn-press flex-1 py-3.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 shadow-md"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
