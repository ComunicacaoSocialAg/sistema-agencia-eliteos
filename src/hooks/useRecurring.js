import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useRecurring() {
  const checkAndGenerate = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Fetch recurring tasks due today or earlier
      const today = new Date().toISOString().split('T')[0];
      const { data: recurring, error: fetchError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('is_active', true)
        .lte('next_generation_date', today);

      if (fetchError) throw fetchError;
      if (!recurring || recurring.length === 0) return;

      console.log(`[Recurring] Encontradas ${recurring.length} tarefas para gerar.`);

      for (const item of recurring) {
        // 2. Create the task
        const { error: insertError } = await supabase
          .from('tasks')
          .insert({
            title: item.title,
            notes: item.notes,
            tag: item.tag,
            client_id: item.client_id,
            assigned_to_id: item.assigned_to_id,
            estimated_hours: item.estimated_hours,
            status: 'backlog',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 7 days deadline
          });

        if (insertError) throw insertError;

        // 3. Calculate next generation date
        let nextDate = new Date(item.next_generation_date);
        if (item.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + (item.interval || 1));
        } else if (item.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7 * (item.interval || 1));
        }

        // 4. Update the recurring item
        await supabase
          .from('recurring_tasks')
          .update({
            last_generated_at: new Date().toISOString(),
            next_generation_date: nextDate.toISOString().split('T')[0]
          })
          .eq('id', item.id);
      }

      if (recurring.length > 0) {
        toast.success(`${recurring.length} tarefas recorrentes geradas com sucesso!`);
      }
    } catch (err) {
      console.error('[Recurring Error]', err);
    }
  }, []);

  return { checkAndGenerate };
}
