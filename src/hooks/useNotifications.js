import { useState, useEffect, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useDeals } from './useDeals';
import { isPast, addDays, parseISO } from 'date-fns';

export function useNotifications() {
  const { tasks } = useTasks();
  const { deals } = useDeals();
  const [dismissed, setDismissed] = useState([]);

  const generateAlerts = useCallback(() => {
    const alerts = [];
    const now = new Date();
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeDeals = Array.isArray(deals) ? deals : [];

    // 1. Tasks with deadlines in the next 24h
    safeTasks.forEach(t => {
      if (t.status === 'concluido' || !t.deadline) return;
      try {
        const d = parseISO(t.deadline);
        if (isNaN(d.getTime())) return;
        if (isPast(d) && t.status !== 'concluido') {
          alerts.push({ id: `overdue-${t.id}`, type: 'danger', title: 'Prazo vencido', message: `"${t.title}" está atrasada`, icon: '🔴' });
        } else if (d <= addDays(now, 1)) {
          alerts.push({ id: `deadline-${t.id}`, type: 'warning', title: 'Prazo próximo', message: `"${t.title}" vence em menos de 24h`, icon: '🟡' });
        }
      } catch {}
    });

    // 2. Tasks awaiting client approval for 3+ days  
    safeTasks.forEach(t => {
      if (t.status === 'aprovacao-cliente' || t.status === 'aguardando-cliente') {
        alerts.push({ id: `approval-${t.id}`, type: 'info', title: 'Aguardando cliente', message: `"${t.title}" aguarda aprovação`, icon: '🟠' });
      }
    });

    // 3. Deals stuck in same stage
    safeDeals.forEach(d => {
      if (['ganho', 'perdido'].includes(d.status)) return;
      alerts.push({ id: `deal-${d.id}`, type: 'info', title: 'Deal ativo', message: `"${d.company}" em ${d.status}`, icon: '💼' });
    });

    return alerts.filter(a => !dismissed.includes(a.id));
  }, [tasks, deals, dismissed]);

  const dismiss = (id) => setDismissed(prev => [...prev, id]);
  const dismissAll = () => setDismissed(generateAlerts().map(a => a.id));

  return { alerts: generateAlerts(), dismiss, dismissAll };
}
