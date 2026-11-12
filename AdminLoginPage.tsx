import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, KeyRound, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onNavigateHome }) => {
  const { login, changePassword, user, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // First access password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // If user doesn't need to change password, redirect right away
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await changePassword(password, newPassword);
      setChangeSuccess('Senha alterada com sucesso! Redirecionando para o painel...');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in and doesn't need password change, trigger onSuccess
  if (isAuthenticated && user && !user.mustChangePassword) {
    onSuccess();
    return null;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-300 overflow-hidden">
        
        {/* Card Header with Official Emblem */}
        <div className="p-6 bg-[#722238] text-white text-center space-y-3">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C] mx-auto shadow-md">
            <img 
              src="/assets/aistudio/logo_casa_do_norte_108ee79c.jpg" 
              alt="Casa do Norte Santa Cruz" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-xl">
              Painel Administrativo
            </h2>
            <p className="text-xs text-amber-200/80">
              Casa do Norte Delícia do Nordeste • Unidade Santa Cruz
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* If user logged in but must change password on first access */}
          {isAuthenticated && user?.mustChangePassword ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  Troca Obrigatória de Senha no 1º Acesso
                </span>
                <p>
                  Olá, <strong>{user.name}</strong> ({user.role}). Por segurança, defina uma nova senha pessoal forte antes de continuar para o painel de produção.
                </p>
              </div>

              {changeSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{changeSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Nova Senha Pessoal *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full text-sm p-3 rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Confirme a Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full text-sm p-3 rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-sm hover:bg-[#E8C60B] border border-amber-400 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Salvar Nova Senha e Entrar</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Regular Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dono@deliciadonordeste.com.br"
                    className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-stone-300 focus:border-[#E8365D] outline-hidden bg-stone-50"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#F9D71C] text-[#722238] font-heading font-extrabold text-sm sm:text-base hover:bg-[#E8C60B] active:scale-98 border border-amber-400 cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando permissões...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Safe Initial Provisioning Helper Note */}
          <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-2 bg-[#FFF8EC] p-3 rounded-xl border border-amber-200/60">
            <span className="font-bold text-[#722238] block flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#E8365D]" />
              Guia do 1º Acesso Administrativo:
            </span>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              O sistema possui perfis pré-configurados (<strong>Dono</strong>, <strong>Gerente</strong> e <strong>Atendente</strong>) com troca obrigatória de senha no primeiro login:
            </p>
            <div className="text-[11px] font-mono bg-white p-2 rounded border border-stone-200 space-y-0.5">
              <p>• Dono: <span className="text-[#722238] font-bold">dono@deliciadonordeste.com.br</span></p>
              <p>• Gerente: <span className="text-stone-700">gerencia@deliciadonordeste.com.br</span></p>
              <p>• Senha inicial temporária: <span className="text-stone-700">Nordeste@2026</span></p>
            </div>
            <p className="text-[10px] text-stone-400 italic">
              Conforme exigido pelo manual de segurança, a troca da senha temporária é obrigatória logo no primeiro acesso.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onNavigateHome}
              className="text-xs text-stone-500 hover:text-[#E8365D] underline cursor-pointer"
            >
              &larr; Voltar ao site público do cliente
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
