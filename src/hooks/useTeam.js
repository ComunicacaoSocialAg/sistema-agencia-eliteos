import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_TEAM = [
  { id: 't1', name: 'Bruno', role: 'Diretor / Operador Estratégico', avatar_url: 'https://i.pravatar.cc/150?u=bruno' }
];

export function useTeam() {
  const [team, setTeam] = useState(DEMO_TEAM);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data } = await supabase.from('team_members').select('*').eq('is_active', true);
    if (data) setTeam(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { team, loading, refetch: fetchTeam };
}
