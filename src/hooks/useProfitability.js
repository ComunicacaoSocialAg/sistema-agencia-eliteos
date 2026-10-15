import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useProfitability() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfitability = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Sem banco não há horas cronometradas nem fees confiáveis: não exibimos margem estimada.
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Get Clients and their monthly fee
      const { data: clients } = await supabase.from('clients').select('id, name, monthly_fee');
      
      // 2. Get Tasks with Time tracking per client
      const { data: tasks } = await supabase.from('tasks').select('client_id, tracked_seconds, assigned_to_id');
      
      // 3. Get Hourly Rates from team_members
      const { data: teamMembers } = await supabase.from('team_members').select('id, name, hourly_cost');
      const rateMap = (teamMembers || []).reduce((acc, m) => ({ ...acc, [m.id]: m.hourly_cost || 50 }), {});

      const consolidated = (clients || []).map(client => {
        const clientTasks = (tasks || []).filter(t => t.client_id === client.id);
        const costHours = clientTasks.reduce((acc, t) => {
          const rate = rateMap[t.assigned_to_id] || 50;
          const hours = (t.tracked_seconds || 0) / 3600;
          return acc + (hours * rate);
        }, 0);

        const revenue = client.monthly_fee || 0;
        const profit = revenue - costHours;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          id: client.id,
          name: client.name,
          revenue,
          costHours,
          costDirect: 0,
          margin
        };
      });

      setData(consolidated.sort((a, b) => b.margin - a.margin));
    } catch (err) {
      console.error('[Profitability] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfitability();
  }, [fetchProfitability]);

  return { data, loading, refetch: fetchProfitability };
}
