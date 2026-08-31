import React from 'react';
import {
  User,
  Settings,
  LogOut,
  Pill,
  ShieldAlert,
  Phone,
  Calendar,
  CreditCard,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen, UserProfile } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  dm: DarkModeTheme;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigate,
  onLogout,
  dm,
}) => {
  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      {/* Header Gradient with Big 80x80 Avatar */}
      <div
        className="relative pt-6 pb-12 px-6 flex flex-col items-center justify-center text-white"
        style={{
          background: 'linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 60%, #5E8FC0 100%)',
        }}
      >
        <div className="relative mb-3">
          {/* Big 80x80px circular avatar */}
          <div
            className="rounded-full flex items-center justify-center text-white font-black text-2xl border-4 shadow-xl"
            style={{
              width: 80,
              height: 80,
              backgroundColor: COLORS.primary,
              borderColor: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            AS
          </div>
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <h1 className="text-xl font-black tracking-tight text-center">{user.name}</h1>
        <p className="text-xs text-blue-100 font-medium text-center mt-0.5">
          Cartão SUS: {user.susCard}
        </p>
      </div>

      {/* Cards Overlap (-marginTop: 24) */}
      <div className="p-4 -mt-6 space-y-3.5 z-10">
        {/* Conditions Tags (pills arredondadas com cor danger) */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Diagnósticos & Condições Monitoradas
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {user.conditions.map((cond, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: 'rgba(228, 84, 84, 0.12)',
                  borderColor: 'rgba(228, 84, 84, 0.3)',
                  color: COLORS.danger,
                }}
              >
                ● {cond}
              </span>
            ))}
          </div>
        </div>

        {/* Daily Medications */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prescrição Médica Ativa
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">3 Registrados</span>
          </div>

          <div className="space-y-2">
            {user.medications.map((med, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                style={{
                  backgroundColor: dm.bg,
                  borderColor: dm.border,
                }}
              >
                <div>
                  <p className="font-bold" style={{ color: dm.text }}>
                    {med.name} <span className="text-sky-600 font-normal">({med.dosage})</span>
                  </p>
                  <p className="text-[10px] text-slate-400">{med.frequency}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Próxima dose
                  </span>
                  <span className="font-bold text-emerald-600">{med.nextTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contato de Emergência Principal
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <div>
              <p className="font-bold" style={{ color: dm.text }}>
                {user.emergencyContact.name}
              </p>
              <p className="text-slate-500 text-[11px]">{user.emergencyContact.relation}</p>
            </div>
            <a
              href={`tel:${user.emergencyContact.phone.replace(/\D/g, '')}`}
              className="btn-press px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Ligar</span>
            </a>
          </div>
        </div>

        {/* Action Buttons: Configurações e Sair lado a lado */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="btn-profile-settings"
            type="button"
            onClick={() => onNavigate('settings')}
            className="btn-press flex-1 py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
              color: dm.text,
            }}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Configurações</span>
          </button>

          <button
            id="btn-profile-logout"
            type="button"
            onClick={onLogout}
            className="btn-press flex-1 py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all text-red-600 shadow-xs"
            style={{
              backgroundColor: dm.card,
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
