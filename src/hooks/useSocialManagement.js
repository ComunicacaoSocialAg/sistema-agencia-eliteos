import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useActiveClient, CLIENT_ALIASES } from '../contexts/ActiveClientContext';

const LOCAL_POSTS_KEY = 'csag_custom_social_posts_v1';
const LOCAL_METRICS_KEY = 'csag_custom_social_metrics_v1';

export function useSocialManagement() {
  const { selectedClientId, selectedClient, isAllClients, matchesSelectedClient } = useActiveClient();
  const [posts, setPosts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados reais no Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      loadFromLocalStorage();
      setLoading(false);
      return;
    }

    try {
      const { data: postsData, error: postsErr } = await supabase
        .from('social_posts')
        .select('*')
        .order('scheduled_date', { ascending: true });

      const { data: metricsData, error: metricsErr } = await supabase
        .from('social_metrics')
        .select('*')
        .order('period_month', { ascending: false });

      if (!postsErr && postsData) {
        setPosts(postsData);
        try { localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(postsData)); } catch (_) {}
      } else {
        loadFromLocalStorage();
      }

      if (!metricsErr && metricsData) {
        setMetrics(metricsData);
        try { localStorage.setItem(LOCAL_METRICS_KEY, JSON.stringify(metricsData)); } catch (_) {}
      }
    } catch (e) {
      console.warn('Erro ao carregar social management:', e);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const savedPosts = localStorage.getItem(LOCAL_POSTS_KEY);
      if (savedPosts) setPosts(JSON.parse(savedPosts));
      const savedMetrics = localStorage.getItem(LOCAL_METRICS_KEY);
      if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar posts conforme o cliente ativo
  const filteredPosts = posts.filter(p => {
    if (isAllClients) return true;
    return matchesSelectedClient(p.client_id);
  });

  // Criar nova pauta/post
  const createPost = async (postData) => {
    const id = `post-${Date.now()}`;
    const newPost = {
      id,
      client_id: postData.client_id || selectedClient?.id || '87c0b28f-83f0-43ab-aefe-45bda539e8c2',
      title: postData.title,
      channel: postData.channel || 'Instagram',
      format: postData.format || 'Carrossel',
      status: postData.status || 'pauta',
      scheduled_date: postData.scheduled_date || new Date().toISOString().split('T')[0],
      caption: postData.caption || '',
      visual_concept: postData.visual_concept || '',
      asset_url: postData.asset_url || '',
      post_url: postData.post_url || '',
      medical_compliance_checked: !!postData.medical_compliance_checked,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPosts(prev => [newPost, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('social_posts').insert([newPost]);
        if (error) throw error;
      } catch (err) {
        console.warn('Erro ao salvar no Supabase, mantendo local:', err);
      }
    }

    try {
      const current = JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || '[]');
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify([newPost, ...current]));
    } catch (_) {}

    toast.success('Pauta cadastrada com sucesso!');
    return newPost;
  };

  // Atualizar status do post
  const updatePostStatus = async (postId, newStatus) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_posts').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', postId);
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const current = JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || '[]');
      const updated = current.map(p => p.id === postId ? { ...p, status: newStatus } : p);
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(updated));
    } catch (_) {}

    toast.success(`Status atualizado para: ${newStatus}`);
  };

  // Atualizar dados completos do post
  const updatePost = async (postId, updates) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_posts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', postId);
      } catch (e) {
        console.warn(e);
      }
    }

    toast.success('Pauta atualizada com sucesso!');
  };

  // Excluir post
  const deletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_posts').delete().eq('id', postId);
      } catch (e) {
        console.warn(e);
      }
    }

    toast.success('Pauta removida.');
  };

  // Salvar registro de métricas mensais reais
  const saveMonthlyMetric = async (metricData) => {
    const id = `metric-${metricData.client_id}-${metricData.period_month}`;
    const item = {
      id,
      ...metricData,
      updated_at: new Date().toISOString()
    };

    setMetrics(prev => [item, ...prev.filter(m => m.id !== id)]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_metrics').upsert([item]);
      } catch (e) {
        console.warn(e);
      }
    }

    toast.success('Métricas mensais salvas com sucesso!');
  };

  return {
    posts: filteredPosts,
    allPosts: posts,
    metrics,
    loading,
    createPost,
    updatePostStatus,
    updatePost,
    deletePost,
    saveMonthlyMetric,
    refreshData: fetchData
  };
}
