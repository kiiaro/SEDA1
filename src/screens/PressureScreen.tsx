import React, { useState } from 'react';
import { Heart, Activity, CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, HealthRecord } from '../types';
import { BackHeader } from '../components/BackHeader';
import { Stepper } from '../components/Stepper';

interface PressureScreenProps {
  pressSys: number;
  setPressSys: (val: number) => void;
  pressDia: number;
  setPressDia: (val: number) => void;
  heartRate: number;
  setHeartRate: (val: number) => void;
  onSaveRecord: (record: Partial<HealthRecord>) => void;
  records: HealthRecord[];
  onBack: () => void;
  dm: DarkModeTheme;
  fontSizeScale: number;
}

export const PressureScreen: React.FC<PressureScreenProps> = ({
  pressSys,
  setPressSys,
  pressDia,
  setPressDia,
  heartRate,
  setHeartRate,
  onSaveRecord,
  records,
  onBack,
  dm,
  fontSizeScale,
}) => {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Determine systolic clinical status
  const getStatusInfo = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) {
      return {
        level: 'danger',
        color: COLORS.danger,
        title: 'Pressão Elevada (Hipertensão)',
        desc: 'Recomenda-se repousar sentado por 15 minutos e realizar nova aferição.',
        icon: AlertTriangle,
      };
    }
    if (sys >= 130 || dia >= 85) {
      return {
        level: 'warn',
        color: COLORS.warn,
        title: 'Pressão Limítrofe / Atenção',
        desc: 'Valores levemente aumentados. Monitore a ingestão de sal e líquidos.',
        icon: AlertTriangle,
      };
    }
    return {
      level: 'normal',
      color: COLORS.success,
      title: 'Pressão Ótima / Controlada',
      desc: 'Excelente! Sua pressão arterial está dentro da meta saudável.',
      icon: Heart,
    };
  };

  const status = getStatusInfo(pressSys, pressDia);

  // Dynamic header color
  const headerBg =
    pressSys >= 140
      ? 'linear-gradient(160deg, #B91C1C 0%, #E45454 100%)'
      : pressSys >= 130
      ? 'linear-gradient(160deg, #D97706 0%, #F4B740 100%)'
      : 'linear-gradient(160deg, #1E3A5F 0%, #3D6E9F 100%)';

  const handleSave = () => {
    setIsSaved(true);
    onSaveRecord({
      systolic: pressSys,
      diastolic: pressDia,
      heartRate: heartRate,
      notes: notes,
      status: status.level as 'normal' | 'warn' | 'danger',
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 2200);
  };

  // 7-day chart data
  const chartData = [...records]
    .slice(0, 7)
    .reverse()
    .map((r) => ({
      name: r.date.split(',')[0].replace('Hoje', 'Hoje').replace('Ontem', 'Ont.'),
      systolic: r.systolic,
      diastolic: r.diastolic,
    }));

  const StatusIcon = status.icon;

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Pressão Arterial"
        subtitle="Registro e curva diária de aferição"
        onBack={onBack}
        bgGradient={headerBg}
      />

      <div className="p-4 space-y-4">
        {/* Dynamic Status Banner */}
        <div
          className="rounded-2xl p-4 border flex items-center gap-3.5 transition-all shadow-xs"
          style={{
            backgroundColor: `${status.color}15`,
            borderColor: `${status.color}40`,
          }}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              status.level === 'normal' ? 'animate-heartbeat' : ''
            }`}
            style={{
              backgroundColor: status.color,
              color: '#FFFFFF',
            }}
          >
            <StatusIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: status.color }}>
              {status.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {status.desc}
            </p>
          </div>
        </div>

        {/* 3 Steppers in Card */}
        <div
          className="rounded-3xl p-5 border shadow-xs space-y-4"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          {/* 1. Systolic Stepper */}
          <div className="pb-3 border-b" style={{ borderColor: dm.border }}>
            <Stepper
              label="1. Pressão Sistólica (Máxima)"
              value={pressSys}
              onValueChange={setPressSys}
              min={60}
              max={220}
              unit="mmHg"
              color={status.color}
              fontSizeScale={fontSizeScale}
            />
          </div>

          {/* 2. Diastolic Stepper */}
          <div className="pb-3 border-b" style={{ borderColor: dm.border }}>
            <Stepper
              label="2. Pressão Diastólica (Mínima)"
              value={pressDia}
              onValueChange={setPressDia}
              min={40}
              max={140}
              unit="mmHg"
              color={COLORS.secondary}
              fontSizeScale={fontSizeScale}
            />
          </div>

          {/* 3. Heart Rate Stepper */}
          <div>
            <Stepper
              label="3. Frequência Cardíaca (Pulso)"
              value={heartRate}
              onValueChange={setHeartRate}
              min={40}
              max={200}
              unit="bpm"
              color={COLORS.purple}
              fontSizeScale={fontSizeScale}
            />
          </div>
        </div>

        {/* Clean Notes Textarea */}
        <div
          className="rounded-2xl p-3.5 border"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FileText className="w-3.5 h-3.5" />
            <span>Observações e Sintomas</span>
          </div>
          <textarea
            id="textarea-pressure-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Em repouso, após tomar medicamento matinal..."
            rows={2}
            className="w-full text-xs font-medium resize-none outline-hidden bg-transparent"
            style={{ color: dm.text }}
          />
        </div>

        {/* Save Button with State Transition */}
        <button
          id="btn-save-pressure"
          type="button"
          onClick={handleSave}
          disabled={isSaved}
          className="btn-press w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: isSaved
              ? 'linear-gradient(135deg, #2FBF71 0%, #10B981 100%)'
              : 'linear-gradient(135deg, #3D6E9F 0%, #5E8FC0 100%)',
            boxShadow: isSaved
              ? '0 8px 24px rgba(47, 191, 113, 0.4)'
              : '0 8px 24px rgba(94, 143, 192, 0.35)',
          }}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>✓ Salvo com sucesso!</span>
            </>
          ) : (
            <span>Salvar Registro de Pressão</span>
          )}
        </button>

        {/* 7-Day Dual LineChart (Sistólica + Diastólica) */}
        <div
          className="rounded-2xl p-4 border shadow-xs"
          style={{
            backgroundColor: dm.card,
            borderColor: dm.border,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dm.sub }}>
              Histórico Comparativo (7 Dias)
            </h3>
            {/* Custom Dot Legend */}
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                <span style={{ color: dm.sub }}>Sistólica</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.secondary }} />
                <span style={{ color: dm.sub }}>Diastólica</span>
              </div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dm.isDark ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="name" stroke={dm.sub} fontSize={10} tickLine={false} />
                <YAxis domain={[50, 170]} stroke={dm.sub} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: dm.card,
                    borderColor: dm.border,
                    borderRadius: 12,
                    fontSize: 11,
                    color: dm.text,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.primary }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.secondary }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
