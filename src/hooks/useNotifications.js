import { useState, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useDeals } from './useDeals';
import { addDays, endOfDay, parseISO } from 'date-fns';

export function useNotifications(enabled = true) {
  const { tasks } = useTasks();
  const { deals } = useDeals(enabled);
  const [dismissed, setDismissed] = useState([]);

  const generateAlerts = useCallback(() => {
    const alerts = [];
    if (!enabled) return alerts;
    const now = new Date();
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeDeals = Array.isArray(deals) ? deals : [];

    safeTasks.forEach(t => {
      if (t.status === 'concluido' || !t.deadline) return;
      try {
        const d = endOfDay(parseISO(t.deadline));
        if (isNaN(d.getTime())) return;
        if (d < now) {
          alerts.push({
            id: `overdue-${t.id}`,
            type: 'danger',
            title: 'Prazo vencido',
            message: `"${t.title}" está atrasada`,
            icon: '🔴',
            targetView: 'producao',
            clientId: t.client_id || null,
          });
        } else if (d <= addDays(now, 1)) {
          alerts.push({
            id: `deadline-${t.id}`,
            type: 'warning',
            title: 'Prazo próximo',
            message: `"${t.title}" vence em menos de 24h`,
            icon: '🟡',
            targetView: 'producao',
            clientId: t.client_id || null,
          });
        }
      } catch {
        // Ignora data inválida
      }
    });

    safeTasks.forEach(t => {
      if (t.status === 'aprovacao-cliente' || t.status === 'aguardando-cliente') {
        alerts.push({
          id: `approval-${t.id}`,
          type: 'info',
          title: 'Aguardando cliente',
          message: `"${t.title}" aguarda aprovação`,
          icon: '🟠',
          targetView: 'producao',
          clientId: t.client_id || null,
        });
      }
    });

    safeDeals.forEach(deal => {
      if (!deal.follow_up_on || deal.localOnly || ['ganho', 'perdido'].includes(deal.status)) return;
      const date = parseISO(deal.follow_up_on);
      if (date > now || Number.isNaN(date.getTime())) return;
      alerts.push({
        id: `deal-${deal.id}-${deal.follow_up_on}`,
        type: 'info',
        title: 'Retorno comercial',
        message: `${deal.company} · ${deal.next_action || 'Retomar contato'}`,
        icon: '💼',
        targetView: 'crm',
        clientId: deal.client_id || null,
      });
    });

    return alerts.filter(a => !dismissed.includes(a.id));
  }, [tasks, deals, dismissed, enabled]);

  const dismiss = (id) => setDismissed(prev => [...prev, id]);
  const dismissAll = () => setDismissed(generateAlerts().map(a => a.id));

  return { alerts: generateAlerts(), dismiss, dismissAll };
}
