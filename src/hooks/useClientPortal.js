import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTasks } from './useTasks';
import { useClients } from './useClients';
import { APPROVAL_EVENT, useAllDeliverables } from './useDeliverables';

export function useClientPortal() {
  const { user, profile, isDemoMode } = useAuth();
  const { allTasks, createTask } = useTasks();
  const { clients } = useClients();
  const { deliverables } = useAllDeliverables();
  const account = profile?.role === 'client' && profile?.client_id ? user?.id : null;
  const [result, setResult] = useState(null);
  const version = useRef(0);

  const refresh = useCallback(async () => {
    if (!account || isDemoMode) return;
    const id = ++version.current;
    try {
      const { data, error } = await supabase.rpc('client_portal');
      if (error) throw error;
      if (id === version.current) setResult({ account, client: data?.client, projects: data?.projects || [], tasks: data?.tasks || [], error: '' });
    } catch {
      if (id === version.current) setResult({ account, error: 'Não foi possível carregar a sua área.' });
    }
  }, [account, isDemoMode]);

  useEffect(() => {
    refresh();
    window.addEventListener(APPROVAL_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      version.current++;
      window.removeEventListener(APPROVAL_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  async function requestTask(values) {
    if (!account) return null;
    if (isDemoMode) return createTask({
      id: values.id, title: values.title, notes: values.notes, tag: values.tag,
      priority: values.priority, deadline: values.deadline, status: 'briefing',
      client_id: profile.client_id,
    });
    const { data, error } = await supabase.rpc('request_client_task', {
      p_id: values.id, p_title: values.title, p_notes: values.notes,
      p_tag: values.tag, p_priority: values.priority, p_deadline: values.deadline,
    });
    if (error || !data) throw error || new Error('O envio da solicitação não foi confirmado.');
    await refresh();
    return data;
  }

  if (account && isDemoMode) {
    const client = clients.find(item => item.id === profile.client_id);
    return { client, projects: [], tasks: allTasks.filter(task => task.client_id === profile.client_id).map(task => {
      const latest = deliverables.find(item => item.task_id === task.id);
      return { ...task, approval_status: latest?.status, version_number: latest?.version_number };
    }), requestTask, refresh };
  }
  const current = result?.account === account ? result : null;
  return {
    client: current?.client, projects: current?.projects || [], tasks: current?.tasks || [], error: current?.error,
    loading: Boolean(account && !current), refresh, requestTask,
  };
}
