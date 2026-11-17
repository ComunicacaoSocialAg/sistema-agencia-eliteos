import { useCallback } from 'react';
import { addDays, addMonths, addWeeks, format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { operationId } from '../lib/operationId';
import { useTasks } from './useTasks';

export function useRecurring() {
  const { user, profile, isDemoMode } = useAuth();
  const { refresh } = useTasks();
  const canGenerate = isSupabaseConfigured && !isDemoMode && user?.id === profile?.id
    && ['admin', 'commercial', 'production'].includes(profile?.role) && !user?.id?.startsWith('demo-');

  const checkAndGenerate = useCallback(async () => {
    if (!canGenerate) return;
    const today = new Date();
    try {
      const { data: rules, error } = await supabase.from('recurring_tasks').select('*')
        .eq('is_active', true).lte('next_generation_date', format(today, 'yyyy-MM-dd'));
      if (error) throw error;

      let advanced = 0;
      let taskSaved = false;
      for (const rule of rules || []) {
        const date = parseISO(rule.next_generation_date);
        const step = Number.isInteger(rule.interval) && rule.interval > 0 ? rule.interval : 1;
        const next = rule.frequency === 'monthly' ? addMonths(date, step) : addWeeks(date, step);
        if (!['monthly', 'weekly'].includes(rule.frequency) || Number.isNaN(next.getTime())) continue;

        const id = await operationId(`recorrencia-${rule.id}-${rule.next_generation_date}`, true);
        const { error: insertError } = await supabase.from('tasks').upsert({
          id, title: rule.title, notes: rule.notes, tag: rule.tag, client_id: rule.client_id,
          assigned_to_id: rule.assigned_to_id, estimated_hours: rule.estimated_hours,
          status: 'backlog', deadline: format(addDays(today, 7), 'yyyy-MM-dd'),
        }, { ignoreDuplicates: true });
        if (insertError) throw insertError;
        taskSaved = true;

        const { data: updated, error: updateError } = await supabase.from('recurring_tasks')
          .update({ next_generation_date: format(next, 'yyyy-MM-dd') })
          .eq('id', rule.id).eq('next_generation_date', rule.next_generation_date).select('id').maybeSingle();
        if (updateError) {
          await refresh?.();
          throw updateError;
        }
        if (updated) advanced++;
      }

      if (taskSaved) await refresh?.();
      if (advanced) toast.success(advanced === 1 ? 'Uma tarefa recorrente gerada.' : `${advanced} tarefas recorrentes geradas.`);
    } catch {
      toast.error('Não foi possível atualizar as recorrências. Elas serão conferidas ao reabrir o sistema.');
    }
  }, [canGenerate, refresh]);

  return { checkAndGenerate };
}
