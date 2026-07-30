import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// Usuários mock para modo demonstração (sem Supabase ou quando Supabase não responde)
const DEMO_USERS = {
  'admin@csag.com': { id: 'demo-admin', name: 'Bruno', role: 'admin', roleTitle: 'Sócio-Diretor', email: 'admin@csag.com' },
  'deise@csag.com': { id: 'demo-commercial', name: 'Deise', role: 'admin', roleTitle: 'Sócia-Diretora', email: 'deise@csag.com' },
  'producao@csag.com': { id: 'demo-prod', name: 'Carlos', role: 'production', roleTitle: 'Diretor de Arte', email: 'producao@csag.com' },
  'cliente@pontocor.com': { id: 'demo-client', name: 'Fernando (Ponto Cor)', role: 'client', roleTitle: 'Cliente', email: 'cliente@pontocor.com', client_id: '11111111-0000-0000-0000-000000000001' },
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
        // Não usar await aqui para não bloquear a UI ("lento pra carregar")
        loadProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeoutId);
      console.warn('[Auth] Erro ao conectar com Supabase. Ativando modo demo.');
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
        // Perfil não encontrado no banco → criar um admin de emergência na memória
        console.warn('[Auth] Perfil não encontrado. Modo Admin emergencial.');
        setProfile({
          id: userId,
          name: email?.split('@')[0] || 'Admin',
          role: 'admin',
          roleTitle: 'Administrador',
        });
      }
    } catch (e) {
      console.error('[Auth] Erro ao carregar perfil:', e);
      setProfile({
        id: userId,
        name: email?.split('@')[0] || 'Admin',
        role: 'admin',
        roleTitle: 'Administrador',
      });
    }
  }

  async function signIn(email, password) {
    // SEMPRE permitir login demo se a senha for demo123 ou se estivermos em modo fallback
    const isDemoEmail = !!DEMO_USERS[email.toLowerCase()];
    const isDemoPassword = password === 'demo123';

    if (fallbackToDemo || !isSupabaseConfigured || (isDemoEmail && isDemoPassword)) {
      const demoUser = DEMO_USERS[email.toLowerCase()];
      if (demoUser && (isDemoPassword || !isSupabaseConfigured)) {
        setUser(demoUser);
        setProfile(demoUser);
        console.log('[Auth] Login Demo bem-sucedido:', email);
        return { error: null };
      }
    }

    // Modo Supabase real (se não for demo ou senha demo errada)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
      } catch (err) {
        return { error: err };
      }
    }

    return { error: { message: 'Serviço de autenticação indisponível no momento.' } };
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

  const role = profile?.role || null;
  const isAdmin = role === 'admin';
  const isCommercial = role === 'commercial';
  const isProduction = role === 'production';
  const isClient = role === 'client';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, role,
      isAdmin, isCommercial, isProduction, isClient,
      signIn, signOut,
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
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
