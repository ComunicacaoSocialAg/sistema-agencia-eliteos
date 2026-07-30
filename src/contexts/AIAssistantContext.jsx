import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AIAssistantContext = createContext(null);

export function AIAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('csag_copilot_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [memories, setMemories] = useState([]);
  const [moduleContext, setModuleContext] = useState({
    module: 'geral',
    title: 'Assistente Geral',
    data: {},
    systemHint: '',
  });

  // Carregar histórico e memórias ao iniciar
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    async function loadAIData() {
      try {
        const { data: convs } = await supabase
          .from('ai_conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (convs?.[0]) {
          setHistory(convs[0].history || []);
        }

        const { data: mems } = await supabase
          .from('ai_memories')
          .select('*');
        
        setMemories(mems || []);
      } catch (e) {
        console.warn('[AI Context] Não foi possível carregar dados da IA:', e?.message);
      }
    }
    loadAIData();
  }, []);

  // Salvar histórico sempre que mudar
  const saveHistory = useCallback(async (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('csag_copilot_history', JSON.stringify(newHistory));
    } catch (e) {
      // Ignore quota errors
    }

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('ai_conversations').upsert({
        user_id: user.id,
        module: moduleContext.module,
        history: newHistory,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module' });
    } catch (e) {
      console.warn('[AI Context] Erro ao salvar histórico no Supabase:', e?.message);
    }
  }, [moduleContext.module]);

  const addMemory = useCallback(async (clientId, key, value) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data: mem } = await supabase.from('ai_memories').upsert({
        client_id: clientId,
        key,
        value
      }, { onConflict: 'client_id,key' }).select().single();
      
      if (mem) setMemories(prev => [...prev.filter(m => m.id !== mem.id), mem]);
    } catch (e) {
      console.warn('[AI Context] Erro ao salvar memória:', e?.message);
    }
  }, []);

  const setContext = useCallback((ctx) => {
    setModuleContext(ctx);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  return (
    <AIAssistantContext.Provider value={{ 
      isOpen, open, close, toggle, 
      moduleContext, setContext, 
      history, saveHistory,
      memories, addMemory
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error('useAIAssistant must be used inside <AIAssistantProvider>');
  return ctx;
}
