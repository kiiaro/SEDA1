import React from 'react';
import { Bell, ArrowRight, CheckCircle2, ShieldAlert, Check } from 'lucide-react';
import { COLORS } from '../constants/theme';
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
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      {/* Header Red Gradient */}
      <BackHeader
        title="Central de Alertas"
        subtitle="Notificações críticas, remédios e consultas"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #991B1B 0%, #DC2626 50%, #E45454 100%)"
      />

      <div className="p-4 space-y-3">
        {alerts.length === 0 ? (
          <div
            className="rounded-2xl p-8 border text-center flex flex-col items-center justify-center"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 mb-3">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold" style={{ color: dm.text }}>
              Nenhum alerta pendente
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Todas as suas medicações e medições estão 100% em dia.
            </p>
          </div>
        ) : (
          alerts.map((alt, index) => (
            <div
              key={alt.id}
              className="rounded-2xl p-4 border shadow-xs transition-all animate-float-up"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
                borderLeft: `5px solid ${alt.color}`,
                animationDelay: `${index * 0.06}s`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Emoji in 14px rounded div with cor+'18' */}
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${alt.color}18` }}
                  >
                    {alt.emoji}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold tracking-tight" style={{ color: dm.text }}>
                      {alt.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {alt.desc}
                    </p>
                  </div>
                </div>

                {/* Timestamp in rounded badge in corner */}
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: 'rgba(100, 116, 139, 0.12)',
                    color: dm.sub,
                  }}
                >
                  {alt.time}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t" style={{ borderColor: dm.border }}>
                <button
                  id={`btn-dismiss-${alt.id}`}
                  type="button"
                  onClick={() => onDismissAlert(alt.id)}
                  className="btn-press text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg"
                >
                  Dispensar
                </button>

                {alt.actionLabel && (
                  <button
                    id={`btn-action-${alt.id}`}
                    type="button"
                    onClick={() => {
                      if (alt.actionScreen) {
                        onNavigate(alt.actionScreen);
                      } else {
                        onDismissAlert(alt.id);
                      }
                    }}
                    className="btn-press px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1"
                    style={{ backgroundColor: alt.color }}
                  >
                    <span>{alt.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
