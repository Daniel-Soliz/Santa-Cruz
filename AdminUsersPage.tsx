import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, UserPlus, KeyRound, Lock, AlertCircle, Check } from 'lucide-react';
import { api } from '../../services/api';
import { UserRole } from '../../types';

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Atendente');
  const [tempPassword, setTempPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.adminGetUsers();
      setUsers(data);
    } catch (e) {
      console.error('Error fetching users', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !tempPassword) return;

    try {
      await api.adminCreateUser({
        name,
        email,
        role,
        tempPassword
      });
      setSuccessMsg(`Usuário ${name} criado com sucesso! Ele deverá alterar a senha no primeiro acesso.`);
      setName('');
      setEmail('');
      setTempPassword('');
      setIsModalOpen(false);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar usuário');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#722238]">
            Usuários e Perfis de Acesso (RBAC)
          </h2>
          <p className="text-xs text-stone-500">
            Apenas o Dono pode cadastrar operadores com papéis restritos (Dono, Gerente e Atendente).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#F9D71C] text-[#722238] font-bold text-xs sm:text-sm hover:bg-[#E8C60B] border border-amber-400 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Operador</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8EC] text-stone-600 font-bold uppercase tracking-wider border-b border-amber-200/80">
              <tr>
                <th className="py-3.5 px-4">Nome</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4">Perfil</th>
                <th className="py-3.5 px-4">Segurança</th>
                <th className="py-3.5 px-4">Último Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-stone-50/80">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{u.name}</td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                      u.role === 'Dono'
                        ? 'bg-[#722238] text-white'
                        : u.role === 'Gerente'
                          ? 'bg-[#1F5FA8] text-white'
                          : 'bg-stone-200 text-stone-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.mustChangePassword ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                        Troca de Senha Pendente
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                        Senha Atualizada
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : 'Nunca acessou'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-amber-300 space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-xl text-[#722238]">
              Cadastrar Novo Operador
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@deliciadonordeste.com.br"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Perfil de Acesso *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                >
                  <option value="Atendente">Atendente (Apenas visualiza e gerencia pedidos)</option>
                  <option value="Gerente">Gerente (Pedidos, cardápio, cupons, avaliações e relatórios)</option>
                  <option value="Dono">Dono (Acesso irrestrito a configurações, finanças e usuários)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Senha Provisória *
                </label>
                <input
                  type="password"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-hidden"
                />
                <span className="text-[10px] text-stone-400 block mt-1">
                  O operador será forçado a criar sua senha pessoal no primeiro login.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 text-xs font-bold hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F9D71C] text-[#722238] text-xs font-bold hover:bg-[#E8C60B] border border-amber-400"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
