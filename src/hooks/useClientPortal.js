import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useClientPortal(clientId) {
  const [dashboard, setDashboard] = useState({
    campaigns: [],
    monthlyHours: 0,
    nextDeliveries: [],
    approvals: [],
    npsPending: false
  });
  const [loading, setLoading] = useState(true);

  const fetchPortalData = useCallback(async () => {
    if (!clientId) return;
    
    if (!isSupabaseConfigured) {
      // Mock data for portal demo
      setDashboard({
        campaigns: [
          { name: 'Campanha de Inverno', spent: 2500, roas: 4.2 },
          { name: 'Google Search Institucional', spent: 1200, roas: 3.8 }
        ],
        monthlyHours: 42.5,
        nextDeliveries: [
          { title: 'Landing Page v1', deadline: '2026-05-10' },
          { title: 'Posts Redes Sociais', deadline: '2026-05-12' }
        ],
        approvals: [
          { item: 'Logotipo V2', date: '2026-05-01', status: 'approved' },
          { item: 'Vídeo Manifesto', date: '2026-04-28', status: 'approved' }
        ],
        npsPending: true
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    const [campaignsRes, tasksRes, approvalsRes] = await Promise.all([
      supabase.from('client_costs').select('*').eq('client_id', clientId).eq('category', 'mídia'),
      supabase.from('tasks').select('*').eq('client_id', clientId),
      supabase.from('deliverable_versions').select('*, tasks!inner(client_id)').eq('tasks.client_id', clientId).order('created_at', { ascending: false }).limit(5)
    ]);

    const activeTasks = tasksRes.data || [];
    const monthlyHours = activeTasks.reduce((acc, t) => acc + (t.tracked_seconds || 0), 0) / 3600;
    
    setDashboard({
      campaigns: campaignsRes.data || [],
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      nextDeliveries: activeTasks.filter(t => t.status !== 'concluido').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3),
      approvals: approvalsRes.data || [],
      npsPending: activeTasks.some(t => t.status === 'concluido' && !t.nps_sent) // Logic to trigger NPS
    });

    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  return { dashboard, loading, refetch: fetchPortalData };
}
