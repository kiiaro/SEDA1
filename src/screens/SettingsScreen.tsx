import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Type,
  Globe,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, FontSizeScale, Screen } from '../types';
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
  const [language, setLanguage] = useState('pt-BR');

  // Custom Toggle Component (52x30px, borderRadius 15, dot 24x24)
  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (val: boolean) => void;
    id: string;
  }> = ({ checked, onChange, id }) => {
    return (
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative transition-colors duration-300 select-none cursor-pointer shrink-0"
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          backgroundColor: checked ? COLORS.primary : '#CBD5E1',
        }}
      >
        <span
          className="absolute top-[3px] rounded-full bg-white shadow-md transition-all duration-300"
          style={{
            width: 24,
            height: 24,
            left: checked ? 25 : 3,
          }}
        />
      </button>
    );
  };

  const fontOptions: { id: FontSizeScale; label: string }[] = [
    { id: 'normal', label: 'Normal (1x)' },
    { id: 'large', label: 'Grande (1.12x)' },
    { id: 'xl', label: 'Extra Grande (1.26x)' },
  ];

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Configurações & Acessibilidade"
        subtitle="Ajustes visuais, tamanho de fonte e alertas"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 100%)"
      />

      <div className="p-4 space-y-4">
        {/* Dark Mode Toggle */}
        <div
          className="rounded-2xl p-4 border shadow-xs flex items-center justify-between"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}18`, color: COLORS.primary }}
            >
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.text }}>
                Modo Escuro (Dark Mode)
              </h3>
              <p className="text-xs text-slate-500">Conforto visual para leitura noturna</p>
            </div>
          </div>

          <ToggleSwitch
            id="toggle-dark-mode"
            checked={darkMode}
            onChange={setDarkMode}
          />
        </div>

        {/* Accessible Font Scaling (3 toggle buttons) */}
        <div
          className="rounded-2xl p-4 border shadow-xs space-y-3"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tamanho do Texto (Acessibilidade 45+)
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {fontOptions.map((opt) => {
              const isSelected = fontSize === opt.id;
              return (
                <button
                  id={`btn-fontsize-${opt.id}`}
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSize(opt.id)}
                  className="btn-press py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center"
                  style={{
                    backgroundColor: isSelected ? `${COLORS.primary}18` : dm.bg,
                    borderColor: isSelected ? COLORS.primary : dm.border,
                    color: isSelected ? COLORS.primary : dm.sub,
                    boxShadow: isSelected ? `0 2px 8px ${COLORS.primary}25` : 'none',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Notification Toggles */}
        <div
          className="rounded-2xl p-4 border shadow-xs space-y-3.5"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Notificações e Lembretes
            </h3>
          </div>

          {/* Toggle 1 */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold" style={{ color: dm.text }}>
                Lembrete de Remédios
              </p>
              <p className="text-[10px] text-slate-500">Aviso sonoro no horário da dose</p>
            </div>
            <ToggleSwitch
              id="toggle-notify-meds"
              checked={notifyMeds}
              onChange={setNotifyMeds}
            />
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: dm.border }}>
            <div>
              <p className="font-bold" style={{ color: dm.text }}>
                Aferição de Pressão & Glicose
              </p>
              <p className="text-[10px] text-slate-500">Lembrete matinal e noturno</p>
            </div>
            <ToggleSwitch
              id="toggle-notify-press"
              checked={notifyPress}
              onChange={setNotifyPress}
            />
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: dm.border }}>
            <div>
              <p className="font-bold" style={{ color: dm.text }}>
                Consultas & Agendamentos UBS
              </p>
              <p className="text-[10px] text-slate-500">Aviso com 24h de antecedência</p>
            </div>
            <ToggleSwitch
              id="toggle-notify-appts"
              checked={notifyAppts}
              onChange={setNotifyAppts}
            />
          </div>
        </div>

        {/* Native Language Select */}
        <div
          className="rounded-2xl p-4 border shadow-xs flex items-center justify-between"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.text }}>
                Idioma do Sistema
              </h3>
              <p className="text-[10px] text-slate-500">Português do Brasil (Padrão SUS)</p>
            </div>
          </div>

          <select
            id="select-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-bold bg-transparent outline-hidden p-1 border rounded-lg"
            style={{ color: dm.text, borderColor: dm.border }}
          >
            <option value="pt-BR">Português (BR)</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Links: Privacidade, Ajuda e Suporte com ChevronRight */}
        <div
          className="rounded-2xl border shadow-xs overflow-hidden"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <button
            id="btn-settings-privacy"
            type="button"
            onClick={() => alert('SEDA está em total conformidade com a LGPD e sigilo médico SUS.')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            style={{ color: dm.text, borderColor: dm.border }}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Privacidade & Proteção de Dados (LGPD)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="btn-settings-help"
            type="button"
            onClick={() => alert('Central de Ajuda SEDA: WhatsApp de Suporte (11) 98765-4321 ou ligue 136 (Disque Saúde SUS).')}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            style={{ color: dm.text }}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Ajuda, Tutorial & Suporte SUS</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
