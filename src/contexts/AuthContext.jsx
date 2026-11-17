import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// Usuários para operação da agência e acesso dos clientes
export const DEMO_USERS = {
  'comunicacaosocialag@gmail.com': { id: 'd65aab16-de91-4dfc-b673-f98a4e53f8b0', name: 'Bruno (CS Ag)', role: 'admin', roleTitle: 'Sócio-Diretor & Operador Geral', email: 'comunicacaosocialag@gmail.com' },
  'admin@csag.com': { id: 'demo-admin', name: 'Bruno', role: 'admin', roleTitle: 'Sócio-Diretor & Operador Geral', email: 'admin@csag.com' },
  'cliente@dubola.com.br': { id: 'demo-client-dubola', name: 'Roberto (Dubola Molhos)', role: 'client', roleTitle: 'Cliente', email: 'cliente@dubola.com.br', client_id: 'client-dubola' },
  'cliente@dralberto.com.br': { id: 'demo-client-alberto', name: 'Dr. Alberto Brasil', role: 'client', roleTitle: 'Cliente (Cirurgião Vascular)', email: 'cliente@dralberto.com.br', client_id: 'client-alberto-brasil' },
};

const ROLE_TITLES = { admin: 'Administrador', commercial: 'Comercial', production: 'Produção', client: 'Cliente' };
const DEMO_STORAGE = 'csag_demo_user';

function readDemoUsers() {
  try {
    const custom = JSON.parse(localStorage.getItem('csag_custom_users') || '[]');
    return [...Object.values(DEMO_USERS), ...(Array.isArray(custom) ? custom : [])];
  } catch {
    return Object.values(DEMO_USERS);
  }
}

export function AuthProvider({ children }) {
  const localPreview = !import.meta.env.PROD || ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const isDemoMode = !isSupabaseConfigured && localPreview;
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [record, setRecord] = useState(null);
  const [activationError, setActivationError] = useState('');
  const activation = useRef(null);
  const [demoUser, setDemoUser] = useState(() => {
    if (!isDemoMode) return null;
    try {
      const stored = JSON.parse(localStorage.getItem(DEMO_STORAGE) || 'null');
      return readDemoUsers().find(person => person.id === stored?.id) || null;
    } catch {
      return null;
    }
  });
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [allUsers, setAllUsers] = useState(() => isDemoMode ? readDemoUsers() : []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    let receivedEvent = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      receivedEvent = true;
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY' || (nextSession?.user &&
          new URLSearchParams(window.location.search).get('definir-senha') === '1')) {
        setIsRecoveringPassword(true);
      }
      if (event === 'SIGNED_OUT') {
        setRecord(null);
        setIsRecoveringPassword(false);
      }
    });
    const address = new URL(window.location.href);
    const fragment = new URLSearchParams(address.hash.slice(1));
    const tokenHash = fragment.get('token_hash');
    const type = fragment.get('type');
    if (!activation.current && tokenHash && ['invite', 'recovery', 'magiclink', 'email'].includes(type)) {
      address.hash = '';
      window.history.replaceState(window.history.state, '', address);
      activation.current = supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    }
    if (activation.current) {
      activation.current.then(({ data, error }) => {
        if (!active) return;
        if (error || !data?.session) {
          setActivationError('Este link de acesso expirou ou já foi usado. Solicite um novo à agência.');
          if (!receivedEvent) setSession(null);
        } else {
          setSession(data.session);
          if (['invite', 'recovery'].includes(type)) {
            setIsRecoveringPassword(true);
          }
        }
      }).catch(() => {
        if (!active) return;
        setActivationError('Não foi possível validar o link de acesso. Tente abrir um novo link.');
        if (!receivedEvent) setSession(null);
      });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (active && !receivedEvent) setSession(data.session);
      }).catch(() => {
        if (active && !receivedEvent) setSession(null);
      });
    }
    return () => { active = false; subscription.unsubscribe(); };
  }, [isDemoMode]);

  const accountId = session?.user?.id;
  useEffect(() => {
    if (!accountId) return;
    let active = true;
    async function load() {
      try {
        let { data, error } = await supabase.from('profiles').select('*').eq('id', accountId).maybeSingle();
        if ((!data || error) && supabase) {
          const ensured = await supabase.rpc('ensure_my_profile');
          if (ensured?.data?.id) data = ensured.data;
        }
        if (active) setRecord({ id: accountId, profile: data || null });
      } catch {
        if (active) setRecord({ id: accountId, profile: null });
      }
    }
    load();
    return () => { active = false; };
  }, [accountId]);

  const profile = isDemoMode
    ? demoUser
    : (record?.id === accountId && record?.profile
      ? { ...record.profile, roleTitle: record.profile.roleTitle || ROLE_TITLES[record.profile.role] || 'Colaborador' }
      : null);
  const user = isDemoMode ? demoUser : (profile ? session?.user : null);
  const role = profile?.role || null;
  const loading = !isDemoMode && (session === undefined || Boolean(accountId && record?.id !== accountId));
  const accessError = activationError || (!isDemoMode && !isSupabaseConfigured
    ? 'O acesso ao sistema ainda precisa ser configurado pela agência.'
    : !loading && accountId && !profile ? 'Sua conta ainda não tem acesso ao sistema. Fale com a agência.' : '');

  useEffect(() => {
    if (isDemoMode || role !== 'admin') return;
    let active = true;
    async function load() {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (active && !error) setAllUsers(data.map(person => ({ ...person, roleTitle: ROLE_TITLES[person.role] })));
    }
    load().catch(() => {});
    return () => { active = false; };
  }, [isDemoMode, accountId, role]);

  function switchDemoUser(email) {
    if (!isDemoMode) return null;
    const target = readDemoUsers().find(person => person.email?.toLowerCase() === email?.toLowerCase());
    if (!target) return null;
    setDemoUser(target);
    try { localStorage.setItem(DEMO_STORAGE, JSON.stringify(target)); } catch { /* sessão em memória */ }
    return target;
  }

  async function signInWithGoogle(preferredEmail = 'comunicacaosocialag@gmail.com') {
    if (isDemoMode) {
      if (switchDemoUser(preferredEmail) || switchDemoUser('admin@csag.com')) return { error: null };
      return { error: { message: 'Não foi possível entrar em modo demonstração.' } };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'O acesso ao sistema ainda precisa ser configurado.' } };
    }
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseKey },
      }).catch(() => null);
      const settings = settingsRes?.ok ? await settingsRes.json().catch(() => null) : null;

      if (settings?.external?.google) {
        return await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: { login_hint: preferredEmail },
          },
        });
      }

      // Google OAuth ainda não habilitado no painel do Supabase: envia link mágico seguro direto ao Gmail do operador
      const targetEmail = (preferredEmail || 'comunicacaosocialag@gmail.com').trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: false,
        },
      });

      if (error) {
        return { error: { message: error.message || 'Não foi possível enviar o link de acesso para o seu Gmail.' } };
      }

      return {
        otpSent: true,
        message: `Link de acesso direto enviado para ${targetEmail}. Abra seu Gmail para entrar com 1 clique.`,
        error: null,
      };
    } catch {
      return { error: { message: 'Não foi possível entrar com o Google. Confira a conexão e tente novamente.' } };
    }
  }

  async function signIn(email, password) {
    if (isDemoMode) {
      if (password === 'demo123' && switchDemoUser(email)) return { error: null };
      return { error: { message: 'Credenciais de demonstração inválidas.' } };
    }
    if (!isSupabaseConfigured) return { error: { message: 'O acesso ao sistema ainda precisa ser configurado.' } };
    try {
      return await supabase.auth.signInWithPassword({ email: email.trim(), password });
    } catch {
      return { error: { message: 'Não foi possível entrar. Confira a conexão e tente novamente.' } };
    }
  }

  async function sendPasswordResetEmail(email) {
    if (isDemoMode) return { error: { message: 'A recuperação está disponível na conta real.' } };
    try {
      return await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    } catch {
      return { error: { message: 'Não foi possível enviar a recuperação. Tente novamente.' } };
    }
  }

  async function updateUserPassword(password) {
    if (isDemoMode) return { error: { message: 'Entre na sua conta para definir a senha.' } };
    try {
      const result = await supabase.auth.updateUser({ password });
      if (!result.error) {
        const url = new URL(window.location.href);
        url.searchParams.delete('definir-senha');
        window.history.replaceState(window.history.state, '', url);
        setIsRecoveringPassword(false);
      }
      return result;
    } catch {
      return { error: { message: 'Não foi possível salvar a senha. Tente novamente.' } };
    }
  }

  async function signOut() {
    if (isDemoMode) {
      try { localStorage.removeItem(DEMO_STORAGE); } catch { /* sessão em memória */ }
      setDemoUser(null);
      return;
    }
    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setRecord(null);
    setAllUsers([]);
  }

  async function createUser(values) {
    if (!isDemoMode) {
      try {
        const { data, error } = await supabase.functions.invoke('agency-user', { body: values });
        if (error || !data?.profile || !data.tokenHash) {
          const details = error?.context?.json ? await error.context.json().catch(() => null) : data;
          return { error: { message: details?.error || 'O acesso não foi confirmado. Confira os dados e tente novamente.' } };
        }
        const person = { ...data.profile, email: values.email, roleTitle: ROLE_TITLES[data.profile.role] };
        setAllUsers(current => [...current.filter(item => item.id !== person.id), person]);
        const accessLink = new URL('/login?definir-senha=1', window.location.origin);
        accessLink.hash = new URLSearchParams({ token_hash: data.tokenHash, type: data.accessType }).toString();
        return { data: person, accessLink: accessLink.href, error: null };
      } catch {
        return { error: { message: 'Não foi possível criar o acesso.' } };
      }
    }
    const person = { ...values, id: `demo-${crypto.randomUUID()}`, roleTitle: ROLE_TITLES[values.role] };
    try {
      const custom = readDemoUsers().filter(item => !Object.values(DEMO_USERS).some(demo => demo.id === item.id));
      localStorage.setItem('csag_custom_users', JSON.stringify([...custom, person]));
      setAllUsers(readDemoUsers());
      return { data: person, error: null };
    } catch {
      return { error: { message: 'Não foi possível salvar o acesso de demonstração.' } };
    }
  }

  async function deleteUser(userId) {
    if (userId === user?.id) return { error: { message: 'Use outra conta de administrador para revogar seu próprio acesso.' } };
    if (!isDemoMode) {
      const { data, error } = await supabase.from('profiles').delete().eq('id', userId).select('id').maybeSingle();
      if (error || !data) return { error: { message: 'Não foi possível confirmar a revogação.' } };
    } else {
      const presets = Object.values(DEMO_USERS).map(person => person.id);
      const custom = readDemoUsers().filter(person => !presets.includes(person.id) && person.id !== userId);
      localStorage.setItem('csag_custom_users', JSON.stringify(custom));
    }
    setAllUsers(current => current.filter(person => person.id !== userId));
    return { error: null };
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, role, accessError,
      isAdmin: role === 'admin', isCommercial: role === 'commercial',
      isProduction: role === 'production', isClient: role === 'client',
      signIn, signInWithGoogle, signOut, switchDemoUser, allUsers: isDemoMode || role === 'admin' ? allUsers : [],
      createUser, deleteUser, isDemoMode, isRecoveringPassword, sendPasswordResetEmail, updateUserPassword,
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
      signInWithGoogle: async () => ({ error: { message: 'AuthProvider não encontrado.' } }),
      signOut: () => {},
      switchDemoUser: () => {},
      isRecoveringPassword: false,
    };
  }
  return ctx;
}

