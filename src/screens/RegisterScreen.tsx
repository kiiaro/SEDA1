import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCheck, ShieldCheck, Heart } from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen } from '../types';
import { BackHeader } from '../components/BackHeader';

interface RegisterScreenProps {
  onRegisterComplete: () => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterComplete,
  onBack,
  dm,
}) => {
  const [userType, setUserType] = useState<'Paciente' | 'Familiar' | 'Profissional'>('Paciente');
  const [name, setName] = useState('Antônio Carlos Silva');
  const [cpf, setCpf] = useState('123.456.789-00');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [birthDate, setBirthDate] = useState('14/05/1962');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');

  const userTypes: ('Paciente' | 'Familiar' | 'Profissional')[] = ['Paciente', 'Familiar', 'Profissional'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterComplete();
  };

  return (
    <div className="flex-1 flex flex-col select-none transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Cadastro SEDA"
        subtitle="Vínculo integrado com UBS & SUS"
        onBack={onBack}
      />

      <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-4 overflow-y-auto">
        {/* User Type Selector Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: dm.sub }}>
            Tipo de Perfil
          </label>
          <div className="grid grid-cols-3 gap-2">
            {userTypes.map((type) => {
              const isSelected = userType === type;
              return (
                <button
                  id={`btn-usertype-${type}`}
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className="btn-press py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center"
                  style={{
                    backgroundColor: isSelected ? `${COLORS.primary}18` : dm.card,
                    borderColor: isSelected ? COLORS.primary : dm.border,
                    color: isSelected ? COLORS.primary : dm.sub,
                    boxShadow: isSelected ? `0 2px 8px ${COLORS.primary}30` : 'none',
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: dm.sub }}>
            Nome Completo
          </label>
          <input
            id="input-reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-3 rounded-xl text-sm font-medium border outline-hidden"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
              color: dm.text,
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: dm.sub }}>
              CPF
            </label>
            <input
              id="input-reg-cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              className="w-full px-3.5 py-3 rounded-xl text-sm font-medium border outline-hidden"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
                color: dm.text,
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: dm.sub }}>
              Nascimento
            </label>
            <input
              id="input-reg-birth"
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full px-3.5 py-3 rounded-xl text-sm font-medium border outline-hidden"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
                color: dm.text,
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: dm.sub }}>
            Telefone / WhatsApp
          </label>
          <input
            id="input-reg-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3.5 py-3 rounded-xl text-sm font-medium border outline-hidden"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
              color: dm.text,
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: dm.sub }}>
              Senha
            </label>
            <input
              id="input-reg-pass1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-3 rounded-xl text-sm font-medium border outline-hidden"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
                color: dm.text,
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: dm.sub }}>
              Confirmar
            </label>
            <input
              id="input-reg-pass2"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-3 rounded-xl text-sm font-medium border outline-hidden"
              style={{
                backgroundColor: dm.card,
                borderColor: dm.border,
                color: dm.text,
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          id="btn-reg-complete"
          type="submit"
          className="btn-press w-full py-4 rounded-xl font-bold text-white text-base shadow-md flex items-center justify-center gap-2 mt-4"
          style={{
            backgroundColor: COLORS.primary,
            boxShadow: `0 8px 20px ${COLORS.primary}40`,
          }}
        >
          <span>Finalizar Cadastro</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
