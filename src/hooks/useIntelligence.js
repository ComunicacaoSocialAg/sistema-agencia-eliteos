import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { areIdsMatching, useClients } from './useClients';
import { useTasks } from './useTasks';
import { useTeam } from './useTeam';

const todayISO = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

export function useIntelligence() {
  const { isDemoMode } = useAuth();
  const { clients = [], refetch: refetchClients } = useClients();
  const { allTasks = [], tasks = [] } = useTasks(undefined, { showArchived: true });
  const { team = [], refetch: refetchTeam } = useTeam();

  const [remoteHealthScores, setRemoteHealthScores] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const remote = isSupabaseConfigured && !isDemoMode;

  const fetchData = useCallback(async () => {
    if (!remote || !supabase) {
      setRemoteHealthScores({});
      setRecentLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [{ data: healthData }, { data: logsData }] = await Promise.all([
        supabase.from('client_health_scores').select('*'),
        supabase.from('audit_logs').select('*').limit(10).order('created_at', { ascending: false }),
      ]);

      const healthMap = (healthData || []).reduce((acc, curr) => ({ ...acc, [curr.client_id]: curr.score }), {});
      setRemoteHealthScores(healthMap);
      setRecentLogs(logsData || []);
    } catch (err) {
      console.error('Error in useIntelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [remote]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const taskList = allTasks.length > 0 ? allTasks : tasks;

  const capacity = useMemo(() => {
    const members = team?.length ? team : [{ id: 't1', name: 'Bruno', capacity_hours: 40 }];
    return members.map(member => {
      const cap = Number(member.capacity_hours) || 40;
      const activeTasks = taskList.filter(t => {
        const isDone = t.status === 'concluido' || t.status === 'finalizado';
        if (isDone) return false;
        return t.assigned_to_id
          ? t.assigned_to_id === member.id || (t.assigned_to || 'Bruno') === member.name
          : (t.assigned_to || 'Bruno') === member.name;
      });
      const estimatedHours = activeTasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 1), 0);
      const load = Math.min(Math.round((estimatedHours / cap) * 100), 100);
      return {
        name: member.name,
        load7d: load,
        tasksCount: activeTasks.length,
        estimatedHours,
        capacityHours: cap,
        freeHours: Math.max(cap - estimatedHours, 0),
      };
    });
  }, [team, taskList]);

  const healthScores = useMemo(() => {
    const today = todayISO();
    const sevenDaysAgo = Date.now() - (7 * 86400000);
    const localMap = {};

    (clients || []).forEach(client => {
      const clientTasks = taskList.filter(t =>
        areIdsMatching(t.client_id, client.id, t.client_name || t.client?.name, client.name)
      );

      let delayedCount = 0;
      let reworkCount = 0;
      let latestActivity = 0;

      clientTasks.forEach(t => {
        const isDone = t.status === 'concluido' || t.status === 'finalizado';
        const deadlineStr = t.deadline ? String(t.deadline).slice(0, 10) : '';
        const completedStr = t.completed_at ? String(t.completed_at).slice(0, 10) : '';

        if ((!isDone && deadlineStr && deadlineStr < today) || (isDone && deadlineStr && completedStr && completedStr > deadlineStr)) {
          delayedCount += 1;
        }
        if (t.status === 'ajustes') {
          reworkCount += 1;
        }
        const ts = Date.parse(t.updated_at || t.created_at || '') || 0;
        if (ts > latestActivity) latestActivity = ts;
      });

      const stalePenalty = latestActivity > 0 && latestActivity < sevenDaysAgo ? 20 : 0;
      localMap[client.id] = Math.max(0, Math.min(100, 100 - (delayedCount * 5) - (reworkCount * 10) - stalePenalty));
    });

    return { ...localMap, ...remoteHealthScores };
  }, [clients, taskList, remoteHealthScores]);

  const hourMetrics = useMemo(() => {
    return (clients || []).map(client => ({
      id: client.id,
      name: client.name,
      monthly_hours_contracted: client.monthly_hours_contracted || 10,
    }));
  }, [clients]);

  const refresh = useCallback(async () => {
    await Promise.allSettled([
      fetchData(),
      refetchClients?.(),
      refetchTeam?.(),
    ]);
  }, [fetchData, refetchClients, refetchTeam]);

  return { healthScores, hourMetrics, recentLogs, capacity, loading, refresh };
}
