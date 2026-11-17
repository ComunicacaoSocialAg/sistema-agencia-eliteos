import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { useTasks } from './useTasks';
import { operationId } from '../lib/operationId';

const POSTS_KEY = 'csag_custom_social_posts_v1';
const METRICS_KEY = 'csag_custom_social_metrics_v1';
const remote = isSupabaseConfigured;

function readStored(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function confirmed({ data, error }) {
  if (error || !data) throw error || new Error('Gravação não confirmada');
  return data;
}

export function useSocialManagement() {
  const { isAllClients, matchesSelectedClient } = useActiveClient();
  const { createTask, refresh: refreshTasks } = useTasks();
  const [posts, setPosts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (remote) {
        const [postsResult, metricsResult] = await Promise.all([
          supabase.from('social_posts').select('*').order('scheduled_date'),
          supabase.from('social_metrics').select('*').order('period_month', { ascending: false }),
        ]);
        if (!postsResult.error) setPosts(postsResult.data || []);
        if (!metricsResult.error) setMetrics(metricsResult.data || []);
        if (postsResult.error || metricsResult.error) throw new Error('Falha de leitura');
      } else {
        setPosts(readStored(POSTS_KEY));
        setMetrics(readStored(METRICS_KEY));
      }
      setError('');
    } catch {
      setError('Não foi possível carregar todas as pautas e métricas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function changePost(id, changes, creating = false) {
    try {
      const values = { ...changes, updated_at: new Date().toISOString() };
      let saved;
      if (remote) {
        const table = supabase.from('social_posts');
        const operation = creating ? table.insert({ ...values, id })
          : changes ? table.update(values).eq('id', id) : table.delete().eq('id', id);
        saved = confirmed(await operation.select().single());
      } else {
        const items = readStored(POSTS_KEY);
        const previous = items.find(post => post.id === id);
        if (!creating && !previous) return null;
        saved = { ...previous, ...values, id };
        if (saved.status === 'publicado') saved.published_at ||= new Date().toISOString();
        else saved.published_at = null;
        const next = creating ? [saved, ...items]
          : changes ? items.map(post => post.id === id ? saved : post) : items.filter(post => post.id !== id);
        localStorage.setItem(POSTS_KEY, JSON.stringify(next));
      }
      setPosts(items => creating ? [saved, ...items]
        : changes ? items.map(post => post.id === id ? saved : post) : items.filter(post => post.id !== id));
      return saved;
    } catch {
      toast.error('A mudança na pauta não foi confirmada. Tente novamente.');
      return null;
    }
  }

  async function createPost(values) {
    if (!values.client_id || !values.title?.trim()) {
      toast.error('Selecione o cliente e informe o tema da pauta.');
      return null;
    }
    const saved = await changePost('post-' + crypto.randomUUID(), {
      ...values, title: values.title.trim(), created_at: new Date().toISOString(),
    }, true);
    if (saved) toast.success('Pauta registrada.');
    return saved;
  }

  async function prepareApproval(post) {
    if (!post.client_id) return null;
    try {
      if (remote) {
        const taskId = confirmed(await supabase.rpc('prepare_social_post_approval', { p_post_id: post.id }));
        setPosts(items => items.map(item => item.id === post.id ? { ...item, task_id: taskId } : item));
        await refreshTasks();
        return taskId;
      }
      const task = await createTask({
        id: await operationId('social-' + post.id, false), title: post.title, client_id: post.client_id,
        notes: [post.caption, post.visual_concept].filter(Boolean).join('\n\n'),
        tag: 'Social Media', status: 'revisao-interna', deadline: post.scheduled_date || null,
      });
      return task && await changePost(post.id, { task_id: task.id }) ? task.id : null;
    } catch {
      toast.error('Não foi possível vincular a pauta à aprovação. Confira o cliente e tente novamente.');
      return null;
    }
  }

  async function saveMonthlyMetric(values) {
    if (!values.client_id || !/^\d{4}-\d{2}$/.test(values.period_month)) {
      toast.error('Selecione o cliente e o mês de referência.');
      return null;
    }
    const item = { ...values, id: `metric-${values.client_id}-${values.period_month}`, updated_at: new Date().toISOString() };
    try {
      const saved = remote ? confirmed(await supabase.from('social_metrics').upsert(item).select().single()) : item;
      if (!remote) localStorage.setItem(METRICS_KEY, JSON.stringify([saved, ...readStored(METRICS_KEY).filter(row => row.id !== saved.id)]));
      setMetrics(rows => [saved, ...rows.filter(row => row.id !== saved.id)]);
      toast.success('Métricas mensais registradas.');
      return saved;
    } catch {
      toast.error('As métricas não foram salvas. Tente novamente.');
      return null;
    }
  }

  return {
    posts: isAllClients ? posts : posts.filter(post => matchesSelectedClient(post.client_id)),
    allPosts: posts, metrics: isAllClients ? metrics : metrics.filter(item => matchesSelectedClient(item.client_id)),
    loading, error, createPost, prepareApproval,
    updatePostStatus: (id, status) => changePost(id, { status }),
    updatePost: changePost,
    deletePost: id => changePost(id, null),
    saveMonthlyMetric,
    refreshData: fetchData,
  };
}
