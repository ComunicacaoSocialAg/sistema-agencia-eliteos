import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useIntelligence() {
  const [healthScores, setHealthScores] = useState({});
  const [hourMetrics, setHourMetrics] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [capacity, setCapacity] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Demo Data
      setHealthScores({
        '11111111-0000-0000-0000-000000000001': 95,
        '11111111-0000-0000-0000-000000000002': 65,
        '11111111-0000-0000-0000-000000000003': 40
      });
      setHourMetrics([
        { name: 'Ponto Cor', contracted: 15, consumed: 8, usage_percent: 53 },
        { name: 'TechStart', contracted: 20, consumed: 18, usage_percent: 90 }
      ]);
      setCapacity([
        { name: 'Bruno', load7d: 85, tasksCount: 12 },
        { name: 'Deise', load7d: 45, tasksCount: 5 },
        { name: 'Carlos', load7d: 70, tasksCount: 8 }
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Health Scores
      const { data: healthData } = await supabase.from('client_health_scores').select('*');
      const healthMap = (healthData || []).reduce((acc, curr) => ({ ...acc, [curr.client_id]: curr.score }), {});
      setHealthScores(healthMap);

      // 2. Capacity (Simulation for now)
      const { data: teamData } = await supabase.from('team_members').select('name');
      const { data: tasksData } = await supabase.from('tasks').select('assigned_to, status');
      
      const capacityData = teamData?.map(member => {
        const activeTasks = tasksData?.filter(t => t.assigned_to === member.name && t.status !== 'concluido') || [];
        const load = Math.min(activeTasks.length * 10, 100); // 10% load per task
        return {
          name: member.name,
          load7d: load,
          tasksCount: activeTasks.length
        };
      }) || [];
      setCapacity(capacityData);

      // 3. Hour Metrics
      const { data: hourData } = await supabase.from('clients').select('id, name, monthly_hours_contracted');
      setHourMetrics(hourData || []);

      // 4. Logs
      const { data: logsData } = await supabase.from('audit_logs').select('*').limit(10).order('created_at', { ascending: false });
      setRecentLogs(logsData || []);

    } catch (err) {
      console.error('Error in useIntelligence:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { healthScores, hourMetrics, recentLogs, capacity, loading, refresh: fetchData };
}
