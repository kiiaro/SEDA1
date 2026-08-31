import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Heart, Activity, ArrowRight, UserCheck } from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen } from '../types';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigate, dm }) => {
  const [cpf, setCpf] = useState('123.456.789-00');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'cpf' | 'pass' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex-1 flex flex-col select-none transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      {/* Header Gradient with SEDA Logo */}
      <div
        className="relative pt-6 pb-12 px-6 flex flex-col items-center justify-center text-white"
        style={{
          background: 'linear-gradient(160deg, #3D6E9F 0%, #5E8FC0 100%)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 animate-heartbeat">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">SEDA</h1>
        </div>
        <p className="text-xs text-blue-100 font-medium">Equilíbrio de Pressão & Diabetes • SUS</p>
      </div>

      {/* Overlapping Card (borderRadius: 28px, marginTop: -24) */}
      <div
        className="flex-1 px-6 pt-6 pb-6 -mt-6 rounded-t-[28px] shadow-xl flex flex-col justify-between"
        style={{
          backgroundColor: dm.card,
          borderTop: `1px solid ${dm.border}`,
        }}
      >
        <div>
          {/* Progress Strip: 2 colored divs */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: COLORS.primary }} />
            <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: `${COLORS.primary}30` }} />
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: dm.text }}>
              Acesse sua Conta
            </h2>
            <p className="text-xs mt-1" style={{ color: dm.sub }}>
              Insira seu CPF ou cartão SUS para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CPF Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dm.sub }}>
                CPF ou Número SUS
              </label>
              <input
                id="input-cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                onFocus={() => setFocusedField('cpf')}
                onBlur={() => setFocusedField(null)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-hidden border"
                style={{
                  backgroundColor: dm.inputBg,
                  color: dm.text,
                  borderColor: focusedField === 'cpf' ? COLORS.primary : dm.border,
                  boxShadow: focusedField === 'cpf' ? `0 0 0 3px ${COLORS.primary}25` : 'none',
                }}
              />
            </div>

            {/* Password Field with Eye/EyeOff toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: dm.sub }}>
                  Senha de Acesso
                </label>
                <button
                  id="btn-forgot-password"
                  type="button"
                  onClick={() => alert('Instruções de recuperação enviadas para o WhatsApp e e-mail cadastrados!')}
                  className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl text-sm font-medium transition-all outline-hidden border"
                  style={{
                    backgroundColor: dm.inputBg,
                    color: dm.text,
                    borderColor: focusedField === 'pass' ? COLORS.primary : dm.border,
                    boxShadow: focusedField === 'pass' ? `0 0 0 3px ${COLORS.primary}25` : 'none',
                  }}
                />
                <button
                  id="btn-toggle-password"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              id="btn-submit-login"
              type="submit"
              className="btn-press w-full py-4 rounded-xl font-bold text-white text-base shadow-md flex items-center justify-center gap-2 mt-3 transition-all"
              style={{
                backgroundColor: COLORS.primary,
                boxShadow: `0 8px 20px ${COLORS.primary}40`,
              }}
            >
              <span>Entrar no SEDA</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t" style={{ borderColor: dm.border }} />
            <span className="flex-shrink mx-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              ou
            </span>
            <div className="flex-grow border-t" style={{ borderColor: dm.border }} />
          </div>

          {/* Google Login Inline SVG */}
          <button
            id="btn-google-login"
            type="button"
            onClick={onLogin}
            className="btn-press w-full py-3.5 px-4 rounded-xl border flex items-center justify-center gap-3 text-xs font-bold transition-all"
            style={{
              backgroundColor: dm.inputBg,
              borderColor: dm.border,
              color: dm.text,
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continuar com Gov.br / Google</span>
          </button>
        </div>

        {/* Bottom Switch to Register */}
        <div className="pt-4 text-center">
          <p className="text-xs" style={{ color: dm.sub }}>
            Primeiro acesso?{' '}
            <button
              id="btn-goto-register"
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline ml-1"
            >
              Criar meu cadastro
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
