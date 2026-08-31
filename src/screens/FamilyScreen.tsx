import React, { useState } from 'react';
import { Users, Phone, MessageCircle, Plus, ShieldCheck, Heart, UserPlus, X } from 'lucide-react';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, FamilyMember } from '../types';
import { BackHeader } from '../components/BackHeader';

interface FamilyScreenProps {
  family: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onBack: () => void;
  dm: DarkModeTheme;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({
  family,
  onAddMember,
  onBack,
  dm,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Filho(a)');
  const [newRole, setNewRole] = useState<'Familiar' | 'SUS'>('Familiar');
  const [newPhone, setNewPhone] = useState('(11) 9');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const initials = newName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');

    const newMember: FamilyMember = {
      id: `f_${Date.now()}`,
      name: newName,
      relation: newRelation,
      role: newRole,
      phone: newPhone,
      avatarBg: newRole === 'SUS' ? COLORS.primary : COLORS.accent,
      initials: initials || 'CD',
      status: 'online',
      lastSeen: 'Adicionado agora',
    };

    onAddMember(newMember);
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="flex-1 flex flex-col select-none pb-6 transition-colors duration-300" style={{ backgroundColor: dm.bg }}>
      <BackHeader
        title="Rede de Cuidado"
        subtitle="Familiares, cuidadores e equipe de saúde SUS"
        onBack={onBack}
        bgGradient="linear-gradient(160deg, #0F766E 0%, #7CC9BE 100%)"
        rightElement={
          <button
            id="btn-open-add-member"
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-press p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
            aria-label="Adicionar cuidador"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        }
      />

      <div className="p-4 space-y-2">
        {/* Info Banner */}
        <div
          className="rounded-2xl p-3.5 border flex items-center gap-3 mb-3"
          style={{
            backgroundColor: 'rgba(124, 201, 190, 0.15)',
            borderColor: 'rgba(124, 201, 190, 0.3)',
          }}
        >
          <ShieldCheck className="w-6 h-6 text-teal-700 dark:text-teal-400 shrink-0" />
          <p className="text-xs font-semibold text-teal-950 dark:text-teal-200 leading-snug">
            Em caso de emergência ou pico pressórico, todos os contatos com o selo{' '}
            <strong className="text-teal-600 dark:text-teal-300">Familiar / SUS</strong> recebem alerta imediato.
          </p>
        </div>

        {/* Family Cards with vertical connector line */}
        {family.map((member, index) => {
          // Status dot color (online -> success, away -> warn, busy -> danger)
          const dotColor =
            member.status === 'online'
              ? COLORS.success
              : member.status === 'away'
              ? COLORS.warn
              : COLORS.danger;

          return (
            <React.Fragment key={member.id}>
              <div
                className="rounded-2xl p-4 border shadow-xs transition-all flex items-center justify-between gap-3 animate-float-up"
                style={{
                  backgroundColor: dm.card,
                  borderColor: dm.border,
                  animationDelay: `${index * 0.06}s`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar with color ring and status dot */}
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm border-2 shadow-xs"
                      style={{
                        backgroundColor: member.avatarBg,
                        borderColor: member.avatarBg,
                      }}
                    >
                      {member.initials}
                    </div>

                    {/* Status Dot (13x13px) in bottom right */}
                    <span
                      className="absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs"
                      style={{
                        width: 13,
                        height: 13,
                        backgroundColor: dotColor,
                      }}
                    />
                  </div>

                  {/* Name and Relation */}
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold truncate" style={{ color: dm.text }}>
                        {member.name}
                      </h3>
                      {/* Relation Badge */}
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                        style={{
                          backgroundColor: `${member.avatarBg}20`,
                          color: member.avatarBg,
                        }}
                      >
                        {member.role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {member.relation}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{member.lastSeen}</p>
                  </div>
                </div>

                {/* Direct Action triggers (Call / WhatsApp) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${member.phone.replace(/\D/g, '')}`}
                    className="btn-press w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      backgroundColor: `${COLORS.primary}15`,
                      borderColor: `${COLORS.primary}30`,
                      color: COLORS.primary,
                    }}
                    aria-label={`Ligar para ${member.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-press w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      backgroundColor: 'rgba(47, 191, 113, 0.15)',
                      borderColor: 'rgba(47, 191, 113, 0.3)',
                      color: COLORS.success,
                    }}
                    aria-label={`WhatsApp com ${member.name}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Vertical connector line (2x14px) between cards */}
              {index < family.length - 1 && (
                <div className="w-full flex justify-center py-0.5">
                  <div
                    style={{
                      width: 2,
                      height: 14,
                      backgroundColor: dm.isDark ? '#334155' : '#CBD5E1',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Dashed Add Button */}
        <button
          id="btn-dashed-add-caregiver"
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-press w-full py-3.5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all mt-3"
          style={{
            borderColor: COLORS.primary,
            color: COLORS.primary,
            backgroundColor: `${COLORS.primary}08`,
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Novo Cuidador ou Profissional</span>
        </button>
      </div>

      {/* Add Caregiver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl border animate-float-up"
            style={{
              backgroundColor: dm.card,
              borderColor: dm.border,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: dm.text }}>
                Novo Cuidador / Rede SUS
              </h3>
              <button
                id="btn-close-family-modal"
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  id="input-fam-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-hidden"
                  style={{
                    backgroundColor: dm.bg,
                    borderColor: dm.border,
                    color: dm.text,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Vínculo
                  </label>
                  <input
                    id="input-fam-rel"
                    type="text"
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    placeholder="Ex: Filho / Vizinho"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-hidden"
                    style={{
                      backgroundColor: dm.bg,
                      borderColor: dm.border,
                      color: dm.text,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Categoria
                  </label>
                  <select
                    id="select-fam-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'Familiar' | 'SUS')}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-hidden"
                    style={{
                      backgroundColor: dm.bg,
                      borderColor: dm.border,
                      color: dm.text,
                    }}
                  >
                    <option value="Familiar">Familiar / Cuidador</option>
                    <option value="SUS">Equipe de Saúde SUS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  id="input-fam-phone"
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-hidden"
                  style={{
                    backgroundColor: dm.bg,
                    borderColor: dm.border,
                    color: dm.text,
                  }}
                />
              </div>

              <button
                id="btn-submit-fam"
                type="submit"
                className="btn-press w-full py-3 rounded-xl font-bold text-white text-xs shadow-md mt-2"
                style={{ backgroundColor: COLORS.primary }}
              >
                Salvar na Rede de Cuidado
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
