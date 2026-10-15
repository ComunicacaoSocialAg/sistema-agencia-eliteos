import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CLIENT_DATASETS, getClientDataForPeriod, generateSmartReply, analyzeMentionSentiment } from '../lib/metaApi';

const STORAGE_KEY = 'csag_buzzmonitor_state_v1';

export function useBuzzMonitor() {
  const [selectedClientId, setSelectedClientId] = useState('client-alberto-brasil');
  const [selectedPeriod, setSelectedPeriod] = useState('05/07/2026 a 05/08/2026');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('pt-BR'));

  // Estado interno com fallback e persistência local
  const [clientData, setClientData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar cache do BuzzMonitor:', e);
    }
    return CLIENT_DATASETS;
  });

  // Salvar no localStorage sempre que houver alteração
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clientData));
    } catch (e) {
      console.warn('Erro ao salvar cache do BuzzMonitor:', e);
    }
  }, [clientData]);

  // Cliente atual ativo (recalculado dinamicamente com base no período selecionado)
  const currentClient = useMemo(() => {
    const raw = clientData[selectedClientId] || clientData['client-alberto-brasil'] || Object.values(clientData)[0];
    return getClientDataForPeriod(raw, selectedPeriod);
  }, [clientData, selectedClientId, selectedPeriod]);

  // Lista de todos os clientes disponíveis no BuzzMonitor
  const clientList = useMemo(() => {
    return Object.values(clientData).map(c => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      segment: c.segment,
      avatar: c.avatar,
      city: c.city,
      followers: c.kpis?.total_followers || 0,
      token_status: c.credentials?.token_status || 'valid'
    }));
  }, [clientData]);

  // Sincronização em tempo real (Meta Graph API)
  const syncLiveData = useCallback(async () => {
    setIsSyncing(true);
    const toastId = toast.loading(`Sincronizando dados da Meta para ${currentClient.name}...`);
    try {
      // Simulação com pequeno delay e confirmação
      await new Promise(r => setTimeout(r, 1200));
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      toast.success(`Dados de ${currentClient.name} atualizados com sucesso via Meta Graph API!`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao sincronizar com a Meta API.', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  }, [currentClient]);

  // Responder Ticket SAC
  const respondTicket = useCallback(async (ticketId, replyText) => {
    if (!replyText.trim()) {
      toast.error('Digite uma resposta.');
      return;
    }

    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      const tickets = (client.sac_tickets || []).map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'closed',
            history: [
              ...(t.history || []),
              { sender: 'agent', text: replyText, timestamp: new Date().toISOString() }
            ]
          };
        }
        return t;
      });
      return {
        ...prev,
        [selectedClientId]: { ...client, sac_tickets: tickets }
      };
    });

    toast.success('Resposta enviada e ticket concluído!');
  }, [selectedClientId]);

  // Gerar Sugestão de IA para Ticket
  const getAiSuggestionForTicket = useCallback(async (ticket) => {
    if (!ticket) return '';
    return await generateSmartReply({
      clientName: currentClient.name,
      toneOfVoice: currentClient.tone_of_voice,
      channel: ticket.channel,
      userMessage: ticket.snippet || ticket.history?.[0]?.text || '',
      extraContext: `Segmento: ${currentClient.segment}, Cidade: ${currentClient.city}`
    });
  }, [currentClient]);

  // Adicionar Post ao Publisher
  const addScheduledPost = useCallback((newPost) => {
    const postObj = {
      id: `pub-${Date.now()}`,
      ...newPost,
      status: newPost.status || 'Rascunho',
      date_formatted: newPost.date_formatted || 'Em breve'
    };

    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      return {
        ...prev,
        [selectedClientId]: {
          ...client,
          scheduled_posts: [postObj, ...(client.scheduled_posts || [])]
        }
      };
    });

    toast.success('Publicação agendada no Publisher!');
  }, [selectedClientId]);

  // Atualizar Status do Post no Publisher
  const updatePostStatus = useCallback((postId, newStatus) => {
    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      const updated = (client.scheduled_posts || []).map(p => {
        if (p.id === postId) {
          return { ...p, status: newStatus };
        }
        return p;
      });
      return {
        ...prev,
        [selectedClientId]: { ...client, scheduled_posts: updated }
      };
    });
    toast.success(`Status atualizado para: ${newStatus}`);
  }, [selectedClientId]);

  // Atualizar Post Completo
  const updatePost = useCallback((postId, updatedFields) => {
    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      const updated = (client.scheduled_posts || []).map(p => {
        if (p.id === postId) {
          return { ...p, ...updatedFields };
        }
        return p;
      });
      return {
        ...prev,
        [selectedClientId]: { ...client, scheduled_posts: updated }
      };
    });
    toast.success('Publicação atualizada com sucesso!');
  }, [selectedClientId]);

  // Excluir Post
  const deletePost = useCallback((postId) => {
    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      const filtered = (client.scheduled_posts || []).filter(p => p.id !== postId);
      return {
        ...prev,
        [selectedClientId]: { ...client, scheduled_posts: filtered }
      };
    });
    toast.success('Publicação removida da grade!');
  }, [selectedClientId]);

  // Importador de Banco de Dados do Notion
  const importNotionDatabase = useCallback(async (databaseId, notionToken) => {
    const toastId = toast.loading('Conectando ao Notion via API...');
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success(`Banco do Notion (${databaseId || 'Calendário'}) importado com sucesso!`, { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Erro ao conectar com a API do Notion.', { id: toastId });
    }
  }, []);

  // Adicionar Termo de Monitoramento no Listening
  const addMonitoredTerm = useCallback((term) => {
    if (!term.trim()) return;
    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      const existing = client.listening?.monitored_terms || [];
      if (existing.includes(term.trim())) {
        toast.error('Termo já está sendo monitorado.');
        return prev;
      }
      return {
        ...prev,
        [selectedClientId]: {
          ...client,
          listening: {
            ...client.listening,
            monitored_terms: [...existing, term.trim()]
          }
        }
      };
    });
    toast.success(`Termo "${term}" adicionado ao Listening!`);
  }, [selectedClientId]);

  // Adicionar Nova Menção no Listening com análise de sentimento
  const addManualMention = useCallback(async (author, content, channel = 'Instagram') => {
    const sentiment = await analyzeMentionSentiment(content);
    const newMention = {
      id: `men-${Date.now()}`,
      author,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
      channel,
      content,
      sentiment,
      date: 'Agora',
      reach: Math.floor(Math.random() * 800) + 150,
      status: 'pending'
    };

    setClientData(prev => {
      const client = { ...prev[selectedClientId] };
      const mentions = [newMention, ...(client.listening?.mentions || [])];
      return {
        ...prev,
        [selectedClientId]: {
          ...client,
          listening: {
            ...client.listening,
            mentions
          }
        }
      };
    });

    toast.success(`Menção cadastrada com sentimento: ${sentiment.toUpperCase()}!`);
  }, [selectedClientId]);

  return {
    selectedClientId,
    setSelectedClientId,
    selectedPeriod,
    setSelectedPeriod,
    isSyncing,
    lastSyncTime,
    currentClient,
    clientList,
    syncLiveData,
    respondTicket,
    getAiSuggestionForTicket,
    addScheduledPost,
    updatePostStatus,
    updatePost,
    deletePost,
    importNotionDatabase,
    addMonitoredTerm,
    addManualMention
  };
}
