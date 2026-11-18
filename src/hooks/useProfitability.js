import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { areIdsMatching, useClients } from './useClients';
import { useTasks } from './useTasks';
import { useTeam } from './useTeam';

export function useProfitability() {
  const { user, isDemoMode } = useAuth();
  const hasReactiveContext = Boolean(user);
  const { clients = [], loading: clientsLoading, refetch: refetchClients } = useClients();
  const { allTasks = [], tasks = [] } = useTasks(undefined, { showArchived: true });
  const { team = [], loading: teamLoading, refetch: refetchTeam } = useTeam();

  const [remoteData, setRemoteData] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(!hasReactiveContext && isSupabaseConfigured);

  const fetchProfitability = useCallback(async () => {
    if (hasReactiveContext) {
      await Promise.allSettled([
        refetchClients?.(),
        refetchTeam?.(),
      ]);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setRemoteData([]);
      setRemoteLoading(false);
      return;
    }

    setRemoteLoading(true);
    try {
      const [{ data: remoteClients }, { data: remoteTasks }, { data: teamMembers }] = await Promise.all([
        supabase.from('clients').select('id, name, monthly_fee'),
        supabase.from('tasks').select('client_id, tracked_seconds, actual_hours, assigned_to_id, assigned_to'),
        supabase.from('team_members').select('id, name, hourly_cost'),
      ]);

      const rateById = (teamMembers || []).reduce((acc, m) => ({ ...acc, [m.id]: Number(m.hourly_cost) || 50 }), {});
      const rateByName = (teamMembers || []).reduce((acc, m) => ({ ...acc, [m.name]: Number(m.hourly_cost) || 50 }), {});

      const consolidated = (remoteClients || []).map(client => {
        const clientTasks = (remoteTasks || []).filter(t => t.client_id === client.id);
        const costHours = clientTasks.reduce((acc, t) => {
          const rate = rateById[t.assigned_to_id] || rateByName[t.assigned_to] || 50;
          const trackedHours = (Number(t.tracked_seconds) || 0) / 3600;
          const hours = trackedHours > 0 ? trackedHours : (Number(t.actual_hours) || 0);
          return acc + (hours * rate);
        }, 0);

        const revenue = Number(client.monthly_fee) || 0;
        const profit = revenue - costHours;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          id: client.id,
          name: client.name,
          revenue,
          costHours,
          costDirect: 0,
          profit,
          margin,
        };
      });

      setRemoteData(consolidated.sort((a, b) => b.margin - a.margin));
    } catch (err) {
      console.error('[Profitability] Error:', err);
    } finally {
      setRemoteLoading(false);
    }
  }, [hasReactiveContext, refetchClients, refetchTeam]);

  useEffect(() => {
    if (!hasReactiveContext) {
      fetchProfitability();
    }
  }, [hasReactiveContext, fetchProfitability]);

  const reactiveData = useMemo(() => {
    if (!hasReactiveContext) return [];
    const taskList = allTasks.length > 0 ? allTasks : tasks;
    const rateById = (team || []).reduce((acc, m) => ({ ...acc, [m.id]: Number(m.hourly_cost) || 50 }), {});
    const rateByName = (team || []).reduce((acc, m) => ({ ...acc, [m.name]: Number(m.hourly_cost) || 50 }), {});

    return (clients || [])
      .map(client => {
        const clientTasks = taskList.filter(t =>
          areIdsMatching(t.client_id, client.id, t.client_name || t.client?.name, client.name)
        );
        const costHours = clientTasks.reduce((acc, t) => {
          const rate = rateById[t.assigned_to_id] || rateByName[t.assigned_to] || 50;
          const trackedSeconds = Number(t.tracked_seconds ?? t.trackedSeconds) || 0;
          const hours = trackedSeconds > 0 ? trackedSeconds / 3600 : (Number(t.actual_hours) || 0);
          return acc + (hours * rate);
        }, 0);

        const revenue = Number(client.monthly_fee) || 0;
        const profit = revenue - costHours;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          id: client.id,
          name: client.name,
          revenue,
          costHours,
          costDirect: 0,
          profit,
          margin,
        };
      })
      .sort((a, b) => b.margin - a.margin);
  }, [hasReactiveContext, clients, allTasks, tasks, team]);

  const data = hasReactiveContext ? reactiveData : remoteData;
  const loading = hasReactiveContext ? ((isSupabaseConfigured && !isDemoMode) ? (clientsLoading || teamLoading) : false) : remoteLoading;

  return { data, loading, refetch: fetchProfitability };
}
