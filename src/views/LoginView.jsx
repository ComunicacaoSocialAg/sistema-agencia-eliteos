import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';


export default function LoginView() {
  const { signIn, signInWithGoogle, isDemoMode, isRecoveringPassword, accessError, sendPasswordResetEmail, updateUserPassword } = useAuth();
  
  const [viewMode, setViewMode] = useState(isRecoveringPassword ? 'update' : 'login');
  
  const [email, setEmail] = useState('comunicacaosocialag@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMsg('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle(email?.trim() || 'comunicacaosocialag@gmail.com');
      if (res?.error) {
        setError(res.error.message);
      } else if (res?.otpSent) {
        setSuccessMsg(res.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (isRecoveringPassword) {
      setViewMode('update');
      setError('');
      setSuccessMsg('Pronto! Agora digite sua nova senha de acesso.');
    }
  }, [isRecoveringPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (viewMode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message);
    } 
    else if (viewMode === 'forgot') {
      const { error: err } = await sendPasswordResetEmail(email);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMsg('Instruções enviadas! Verifique sua caixa de entrada.');
      }
    } 
    else if (viewMode === 'update') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }
      
      const { error: err } = await updateUserPassword(password);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMsg('Senha atualizada com sucesso! Entrando...');
        setTimeout(() => setViewMode('login'), 2000);
      }
    }

    setLoading(false);
  };

  const renderFormContent = () => {
    if (viewMode === 'forgot') {
      return (
        <>
          <h2 className="text-xl font-bold text-white mb-2">Recuperar senha</h2>
          <p className="text-sm text-cs-text-secondary mb-6">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-cs-text-secondary mb-1.5 block">E-mail da conta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-cs-text-secondary/50"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => { setViewMode('login'); setError(''); setSuccessMsg(''); }}
              className="text-xs font-medium text-cs-text-secondary hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Voltar para o login
            </button>
          </div>
        </>
      );
    }

    if (viewMode === 'update') {
      return (
        <>
          <h2 className="text-xl font-bold text-white mb-2">Criar nova senha</h2>
          <p className="text-sm text-cs-text-secondary mb-6">Por favor, crie uma nova senha forte para sua conta.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-cs-text-secondary mb-1.5 block">Nova Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-cs-text-secondary/50 pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cs-text-secondary hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-cs-text-secondary mb-1.5 block">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-cs-text-secondary/50"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </div>
        </>
      );
    }

    // Default Login view
    return (
      <>
        <h2 className="text-xl font-bold text-white mb-6">Entrar na plataforma</h2>
        {accessError && <p role="alert" className="mb-4 text-sm text-red-300">{accessError}</p>}

        {isDemoMode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-400 mb-1">Modo Demonstração</p>
                <p className="text-xs text-cs-text-secondary">O Supabase não está configurado. O sistema usará o armazenamento local.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:scale-[0.99] text-zinc-900 py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <div className="text-left">
              <span className="block leading-tight">{googleLoading ? 'Conectando ao Google...' : 'Entrar com Google'}</span>
              <span className="block text-[11px] font-medium text-zinc-600">comunicacaosocialag@gmail.com</span>
            </div>
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-cs-border" />
            <span className="flex-shrink mx-3 text-[11px] font-mono uppercase tracking-wider text-cs-text-secondary">
              ou e-mail e senha
            </span>
            <div className="flex-grow border-t border-cs-border" />
          </div>

          <div>
            <label className="text-sm font-medium text-cs-text-secondary mb-1.5 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-cs-text-secondary/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-cs-text-secondary mb-1.5 block">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-cs-text-secondary/50 pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cs-text-secondary hover:text-white transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {isDemoMode && <div className="pt-2 border-t border-cs-border/60">
            <p className="text-[11px] font-medium text-cs-text-secondary mb-2.5 text-center">Acesso rápido para testes:</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@csag.com');
                  setPassword('demo123');
                  signIn('admin@csag.com', 'demo123');
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-cs-bg hover:bg-yellow-500/10 border border-cs-border hover:border-yellow-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-yellow-400 block">Bruno (Agência)</span>
                  <span className="text-[10px] text-cs-text-secondary">Sócio-Diretor e Operador Único</span>
                </div>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('cliente@dralberto.com.br');
                  setPassword('demo123');
                  signIn('cliente@dralberto.com.br', 'demo123');
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-cs-bg hover:bg-blue-500/10 border border-cs-border hover:border-blue-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-blue-400 block">Dr. Alberto Brasil</span>
                  <span className="text-[10px] text-cs-text-secondary">Cirurgião Vascular (CFM 2.336/2023)</span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">Portal Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('cliente@dubola.com.br');
                  setPassword('demo123');
                  signIn('cliente@dubola.com.br', 'demo123');
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-cs-bg hover:bg-orange-500/10 border border-cs-border hover:border-orange-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-orange-400 block">Roberto (Dubola)</span>
                  <span className="text-[10px] text-cs-text-secondary">Dubola Molhos Especiais</span>
                </div>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold">Portal Cliente</span>
              </button>
            </div>
          </div>}
        </div>

        {/* Ações Auxiliares */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-2">
            <button 
              type="button" 
              onClick={() => { setViewMode('forgot'); setError(''); setSuccessMsg(''); }}
              className="text-xs font-medium text-cs-text-secondary hover:text-yellow-400 transition-colors"
            >
              Esqueceu a senha?
            </button>
            
            <button 
              type="button" 
              onClick={() => alert('Para criar uma conta, contate o administrador da agência')}
              className="text-xs font-medium text-cs-text-secondary hover:text-white transition-colors"
            >
              Novo usuário? <span className="text-yellow-400">Solicitar acesso</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-cs-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cs-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-3xl"></div>
      </div>

      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes logoFadeIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(255,209,0,0.2)); }
          50% { filter: drop-shadow(0 0 25px rgba(255,209,0,0.4)); }
        }
        .logo-animated {
          animation: logoFadeIn 0.8s ease-out, logoFloat 4s ease-in-out 0.8s infinite, glowPulse 3s ease-in-out infinite;
        }
        @keyframes cardSlide {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .card-animated {
          animation: cardSlide 0.6s ease-out 0.3s both;
        }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img 
            src="/logo.png?v=4" 
            alt="Comunicação Social Ag" 
            className="h-20 mx-auto mb-5 logo-animated object-contain" 
          />
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight" style={{animation: 'cardSlide 0.5s ease-out 0.2s both'}}>Comunica OS</h1>
          <p className="text-cs-text-secondary text-sm" style={{animation: 'cardSlide 0.5s ease-out 0.4s both'}}>Sistema de Gestão da Agência</p>
        </div>

        <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-2xl card-animated">
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm mb-6">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="flex items-start gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5 text-sm mb-6">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderFormContent()}
          </form>
        </div>

        <p className="text-center text-xs text-cs-text-secondary mt-6" style={{animation: 'cardSlide 0.5s ease-out 1s both'}}>
          © 2026 <span className="text-yellow-400 font-bold">Comunicação Social Ag</span>
        </p>
      </div>
    </div>
  );
}
