import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useClients } from './useClients';
import { useTasks } from './useTasks';

const PRIORITIES = { urgent: 0, high: 1, medium: 2, low: 3 };

function compareNextAction(a, b) {
  return (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31')
    || (PRIORITIES[a.priority] ?? 2) - (PRIORITIES[b.priority] ?? 2);
}

export function useFocusTasks() {
  const { clients, loading: loadingClients } = useClients();
  const {
    tasks: allTasks, createTask, updateTask, loading, error, refresh, remoteMode,
  } = useTasks();
  const [focusedId, setFocusedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saving = useRef(false);

  const tasks = allTasks.filter(task => task.status !== 'concluido');
  const activeTask = tasks.find(task => task.id === focusedId)
    || tasks.filter(task => task.status !== 'aguardando-cliente').sort(compareNextAction)[0]
    || null;

  async function createQuickDemand({ title, clientId, deadline, priority = 'high', tag = 'Demanda' }) {
    if (!title?.trim() || !clientId) {
      toast.error('Descreva a demanda e selecione o cliente.');
      return null;
    }
    if (saving.current) return null;
    saving.current = true;
    setIsSubmitting(true);
    try {
      const client = clients.find(item => item.id === clientId);
      const saved = await createTask({
        title: title.trim(), client_id: clientId, client_name: client?.name,
        deadline: deadline || null, priority, tag, status: 'em-producao',
        demand_status: 'em_producao',
      });
      if (saved) setFocusedId(saved.id);
      return saved;
    } finally {
      saving.current = false;
      setIsSubmitting(false);
    }
  }

  async function completeActiveTask(taskId) {
    const saved = await updateTask({ id: taskId, status: 'concluido', demand_status: 'concluido' });
    if (!saved) return false;
    setFocusedId(null);
    toast.success('Tarefa concluída.');
    return true;
  }

  async function pauseActiveTask(taskId, pauseType, reason = '') {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return false;
    const waiting = pauseType === 'cliente';
    const status = waiting ? 'aguardando-cliente' : 'revisao-interna';
    const label = waiting ? 'Aguardando cliente' : 'Bloqueio interno';
    const annotation = `${new Date().toLocaleDateString('pt-BR')} | ${label}${reason ? `: ${reason}` : ''}`;
    const notes = [task.notes || task.description, annotation].filter(Boolean).join('\n');
    const saved = await updateTask({ id: taskId, status, demand_status: status.replaceAll('-', '_'), notes });
    if (!saved) return false;
    const next = tasks.filter(item => item.id !== taskId && item.status !== 'aguardando-cliente')
      .sort(compareNextAction)[0];
    setFocusedId(next?.id || null);
    toast.success(waiting ? 'Tarefa movida para Aguardando cliente.' : 'Tarefa movida para Revisão.');
    return true;
  }

  return {
    tasks, clients, activeTask, loading: loading || loadingClients, error, remoteMode, isSubmitting,
    createQuickDemand, completeActiveTask, pauseActiveTask,
    setTaskToFocus: task => setFocusedId(task.id), refreshTasks: refresh,
  };
}
