import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// Usuários para operação da agência e acesso dos clientes
export const DEMO_USERS = {
  'admin@csag.com': { id: 'demo-admin', name: 'Bruno', role: 'admin', roleTitle: 'Sócio-Diretor & Operador Geral', email: 'admin@csag.com' },
  'cliente@dubola.com.br': { id: 'demo-client-dubola', name: 'Roberto (Dubola Molhos)', role: 'client', roleTitle: 'Cliente', email: 'cliente@dubola.com.br', client_id: 'client-dubola' },
  'cliente@dralberto.com.br': { id: 'demo-client-alberto', name: 'Dr. Alberto Brasil', role: 'client', roleTitle: 'Cliente (Cirurgião Vascular)', email: 'cliente@dralberto.com.br', client_id: 'client-alberto-brasil' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackToDemo, setFallbackToDemo] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setFallbackToDemo(true);
      setLoading(false);
      return;
    }

    // Timeout de segurança ultra-rápido: se Supabase travar por 1s, vai direto pro demo
    const timeoutId = setTimeout(() => {
      console.warn('[Auth] Supabase timeout após 1s. Ativando modo demo.');
      setFallbackToDemo(true);
      setLoading(false);
    }, 1000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id, session.user.email);
      } else {
        const stored = localStorage.getItem('csag_demo_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed) {
              setUser(parsed);
              setProfile(parsed);
            } else {
              setUser(DEMO_USERS['admin@csag.com']);
              setProfile(DEMO_USERS['admin@csag.com']);
            }
          } catch (e) {
            console.warn(e);
            setUser(DEMO_USERS['admin@csag.com']);
            setProfile(DEMO_USERS['admin@csag.com']);
          }
        } else {
          setUser(DEMO_USERS['admin@csag.com']);
          setProfile(DEMO_USERS['admin@csag.com']);
        }
      }
      setLoading(false);
    }).catch((e) => {
      clearTimeout(timeoutId);
      console.warn('[Auth] Erro ao conectar com Supabase. Ativando modo demo:', e);
      const stored = localStorage.getItem('csag_demo_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed) {
            setUser(parsed);
            setProfile(parsed);
          } else {
            setUser(DEMO_USERS['admin@csag.com']);
            setProfile(DEMO_USERS['admin@csag.com']);
          }
        } catch (err) {
          console.warn(err);
          setUser(DEMO_USERS['admin@csag.com']);
          setProfile(DEMO_USERS['admin@csag.com']);
        }
      } else {
        setUser(DEMO_USERS['admin@csag.com']);
        setProfile(DEMO_USERS['admin@csag.com']);
      }
      setFallbackToDemo(true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }

      if (session?.user) {
        setUser(session.user);
        setFallbackToDemo(false);
        loadProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId, email) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
      } else {
        // Perfil não encontrado no banco → NÃO conceder admin automaticamente.
        // Um usuário autenticado sem linha em `profiles` é um estado de erro
        // (cadastro incompleto, falha de sincronização), não motivo para
        // escalar privilégio. Fica sem role até um admin de verdade resolver.
        console.error('[Auth] Perfil não encontrado para o usuário. Acesso negado por padrão.');
        setProfile(null);
        setUser(null);
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('[Auth] Erro ao carregar perfil:', e);
      setProfile(null);
      setUser(null);
    }
  }

  async function signIn(email, password) {
    // Login demo só é permitido quando NÃO há Supabase real disponível
    // (sem configuração ou em fallback por indisponibilidade). Nunca como
    // atalho paralelo quando a autenticação real está ativa — isso era um
    // backdoor: qualquer pessoa com email+senha demo entrava como admin
    // mesmo em produção com Supabase configurado e saudável.
    const isRealAuthUnavailable = fallbackToDemo || !isSupabaseConfigured;

    if (isRealAuthUnavailable) {
      const demoUser = DEMO_USERS[email.toLowerCase()];
      const isDemoPassword = password === 'demo123';
      if (demoUser && isDemoPassword) {
        setUser(demoUser);
        setProfile(demoUser);
        try {
          localStorage.setItem('csag_demo_user', JSON.stringify(demoUser));
        } catch (e) {
          console.warn(e);
        }
        console.log('[Auth] Login Demo bem-sucedido (Supabase indisponível):', email);
        return { error: null };
      }
      return { error: { message: 'Credenciais de demonstração inválidas.' } };
    }

    // Modo Supabase real (único caminho quando a autenticação está disponível)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (err) {
      return { error: err };
    }
  }

  async function sendPasswordResetEmail(email) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase não configurado.' } };
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      return { data, error };
    } catch (err) {
      return { error: err };
    }
  }

  async function updateUserPassword(newPassword) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase não configurado.' } };
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
        setIsRecoveringPassword(false);
      }
      return { data, error };
    } catch (err) {
      return { error: err };
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem('csag_demo_user');
    } catch (e) {
      console.warn(e);
    }
    if (fallbackToDemo || !isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    async function fetchAllUsers() {
      const localUsers = JSON.parse(localStorage.getItem('csag_custom_users') || '[]');
      const defaultUsersArray = Object.values(DEMO_USERS);
      let combined = [...defaultUsersArray, ...localUsers];

      if (isSupabaseConfigured && !fallbackToDemo) {
        try {
          const { data: profilesData } = await supabase.from('profiles').select('*');
          if (profilesData && profilesData.length > 0) {
            const merged = profilesData.map(p => ({
              id: p.id,
              name: p.name,
              role: p.role,
              roleTitle: p.role === 'admin' ? 'Sócio-Diretor' : p.role === 'client' ? 'Cliente' : 'Especialista',
              email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '')}@csag.com`,
              client_id: p.client_id
            }));
            setAllUsers(merged);
            return;
          }
        } catch (e) {
          console.warn('[Auth] Falha ao carregar perfis do Supabase, usando demo:', e);
        }
      }
      setAllUsers(combined);
    }
    if (!loading) {
      fetchAllUsers();
    }
  }, [loading, fallbackToDemo]);

  const createUser = async (newUser) => {
    const formattedUser = {
      id: newUser.id || `custom-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      roleTitle: newUser.role === 'admin' ? 'Sócio-Diretor' : newUser.role === 'client' ? 'Cliente' : 'Especialista',
      client_id: newUser.client_id || null
    };

    if (isSupabaseConfigured && !fallbackToDemo) {
      try {
        const { error } = await supabase.from('profiles').insert({
          id: formattedUser.id,
          name: formattedUser.name,
          role: formattedUser.role,
          client_id: formattedUser.client_id
        });
        if (error) console.warn('[Auth] Supabase insert warning:', error.message);
      } catch (e) {
        console.warn('[Auth] Erro ao cadastrar no Supabase:', e.message);
      }
    }

    const custom = JSON.parse(localStorage.getItem('csag_custom_users') || '[]');
    custom.push(formattedUser);
    localStorage.setItem('csag_custom_users', JSON.stringify(custom));

    setAllUsers(prev => {
      const exists = prev.some(u => u.email === formattedUser.email);
      if (exists) return prev;
      return [...prev, formattedUser];
    });

    return { error: null };
  };

  const deleteUser = async (userId) => {
    if (isSupabaseConfigured && !fallbackToDemo) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (e) {
        console.warn('[Auth] Erro ao deletar no Supabase:', e.message);
      }
    }

    const custom = JSON.parse(localStorage.getItem('csag_custom_users') || '[]');
    const filtered = custom.filter(u => u.id !== userId);
    localStorage.setItem('csag_custom_users', JSON.stringify(filtered));

    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const switchDemoUser = (emailOrKey) => {
    const target = DEMO_USERS[emailOrKey.toLowerCase()] || allUsers.find(u => u.email.toLowerCase() === emailOrKey.toLowerCase());
    if (target) {
      setUser(target);
      setProfile(target);
      try {
        localStorage.setItem('csag_demo_user', JSON.stringify(target));
      } catch (e) {
        console.warn(e);
      }
      return target;
    }
    return null;
  };

  const role = profile?.role || null;
  const isAdmin = role === 'admin';
  const isCommercial = role === 'commercial';
  const isProduction = role === 'production';
  const isClient = role === 'client';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, role,
      isAdmin, isCommercial, isProduction, isClient,
      signIn, signOut, switchDemoUser,
      allUsers, createUser, deleteUser,
      isDemoMode: fallbackToDemo || !isSupabaseConfigured,
      isRecoveringPassword, sendPasswordResetEmail, updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Sem AuthProvider por perto: não há motivo para conceder admin por
    // padrão. Retorna estado "deslogado" — mesmo padrão fail-closed do
    // resto do arquivo.
    return {
      user: null,
      profile: null,
      role: null,
      loading: false,
      isDemoMode: true,
      signIn: async () => ({ error: { message: 'AuthProvider não encontrado.' } }),
      signOut: () => {},
      switchDemoUser: () => {},
      isRecoveringPassword: false,
    };
  }
  return ctx;
}

