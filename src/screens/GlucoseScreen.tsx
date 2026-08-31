import React, { useState } from 'react';
import { Droplets, Utensils, Clock, CheckCircle2, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { HealthRing } from '../components/HealthRing';
import { Stepper } from '../components/Stepper';

interface GlucoseScreenProps {
  glucose: number;
  setGlucose: (val: number) => void;
  onSaveRecord: (record: Partial<HealthRecord>) => void;
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const GlucoseScreen: React.FC<GlucoseScreenProps> = ({
  glucose,
  setGlucose,
  onSaveRecord,
  records,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [mealContext, setMealContext] = useState<'before' | 'after'>('before');
  const [timeStr, setTimeStr] = useState('07:45');
  const [isSaved, setIsSaved] = useState(false);

  // Status calculation
  const getGlucoseStatus = (val: number) => {
    if (val > 126) {
      return {
        level: 'danger',
        label: '⬆️ Hiperglicemia (Alta)',
        color: COLORS.danger,
        desc: 'Taxa acima da meta em jejum/pré-refeição. Beba água e evite carboidratos rápidos.',
      };
    }
    if (val < 70) {
      return {
        level: 'warn',
        label: '⬇️ Hipoglicemia (Baixa)',
        color: COLORS.primary,
        desc: 'Atenção com sintomas de tontura e suor frio. Consuma um carboidrato rápido se indicado.',
      };
    }
    return {
      level: 'normal',
      label: 'Normal / Alvo Atingido',
      color: COLORS.accent,
      desc: 'Excelente! Sua glicemia está na faixa esperada para seu perfil de tratamento.',
    };
  };

  const status = getGlucoseStatus(glucose);

  const handleSave = () => {
    setIsSaved(true);
    onSaveRecord({
      glucose: glucose,
      mealContext: mealContext,
      time: timeStr,
      status: status.level as 'normal' | 'warn' | 'danger',
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 2200);
  };

  // 7-day glucose chart data
  const chartData = [...records]
    .slice(0, 7)
    .reverse()
    .map((r) => ({
      name: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.'),
      glucose: r.glucose,
    }));

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Glicemia Capilar"
        subtitle="Monitoramento de glicose e refeições"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #2D6A4F 0%, #59B98A 100%)"
      />

      <div className="p-4 space-y-4">
        {/* Large Health Ring at Top (size 130, stroke 12) */}
        <div
          className="rounded-3xl p-5 border shadow-xs flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="my-2">
            <HealthRing
              value={glucose}
              max={300}
              color={status.color}
              size={130}
              stroke={12}
              unit="mg/dL"
              label="Glicose"
            />
          </div>

          {/* Stepper with Dynamic Color Matching Ring */}
          <div className="w-full mt-2">
            <Stepper
              value={glucose}
              onValueChange={setGlucose}
              min={20}
              max={600}
              step={1}
              unit="mg/dL"
              color={status.color}
              fontSizeScale={fontSizeScale}
            />
          </div>

          {/* Textual Status Badge */}
          <div
            className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5"
            style={{
              backgroundColor: `${status.color}20`,
              color: status.color,
            }}
          >
            <span>{status.label}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[280px] leading-snug">
            {status.desc}
          </p>
        </div>

        {/* Meal Context Toggle & Native Time Input */}
        <div
          className="rounded-2xl p-4 border shadow-xs space-y-3"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Contexto da Medição
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-meal-before"
                type="button"
                onClick={() => setMealContext('before')}
                className="btn-press py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: mealContext === 'before' ? `${COLORS.warn}25` : dm.bg,
                  borderColor: mealContext === 'before' ? COLORS.warn : dm.border,
                  color: mealContext === 'before' ? '#b45309' : dm.sub,
                }}
              >
                <Utensils className="w-4 h-4" />
                <span>Antes da Refeição (Jejum)</span>
              </button>

              <button
                id="btn-meal-after"
                type="button"
                onClick={() => setMealContext('after')}
                className="btn-press py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: mealContext === 'after' ? `${COLORS.warn}25` : dm.bg,
                  borderColor: mealContext === 'after' ? COLORS.warn : dm.border,
                  color: mealContext === 'after' ? '#b45309' : dm.sub,
                }}
              >
                <Utensils className="w-4 h-4" />
                <span>Pós-Prandial (2h após)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Horário da Aferição
            </label>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <input
                id="input-glucose-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="px-4 py-2.5 rounded-xl border text-sm font-bold tracking-wider outline-hidden"
                style={{
                  backgroundColor: dm.bg,
                  borderColor: dm.border,
                  color: dm.text,
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button with State Transition */}
        <button
          id="btn-save-glucose"
          type="button"
          onClick={handleSave}
          disabled={isSaved}
          className="btn-press w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: isSaved
              ? 'linear-gradient(135deg, #2FBF71 0%, #10B981 100%)'
              : `linear-gradient(135deg, ${status.color} 0%, #3D6E9F 100%)`,
            boxShadow: `0 8px 24px ${status.color}40`,
          }}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>✓ Salvo com sucesso!</span>
            </>
          ) : (
            <span>Salvar Registro de Glicose</span>
          )}
        </button>

        {/* AreaChart with Yellow Gradient (warn) */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
              Curva Glicêmica dos Últimos 7 Dias
            </h3>
            <span className="text-xs font-bold text-amber-600">Meta: &lt; 126 mg/dL</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucWarnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.warn} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={COLORS.warn} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dm.isDark ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" stroke={dm.sub} fontSize={10} tickLine={false} />
                <YAxis domain={[60, 200]} stroke={dm.sub} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: dm.card,
                    borderColor: dm.border,
                    borderRadius: 12,
                    fontSize: 11,
                    color: dm.text,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="glucose"
                  stroke={COLORS.warn}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#glucWarnGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
