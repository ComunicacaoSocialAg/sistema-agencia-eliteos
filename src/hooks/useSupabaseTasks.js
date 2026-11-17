import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const TASK_SELECT = '*, client:clients(id,name,brand_color), checklist:task_checklists(*), comments:task_comments(*)';
const TASK_COLUMNS = [
  'title', 'client_id', 'project_id', 'assigned_to', 'assigned_to_id', 'status', 'tag', 'priority',
  'deadline', 'estimated_hours', 'actual_hours', 'tracked_seconds', 'notes', 'external_links',
];

export function normalizeTaskStatus(status) {
  if (status === 'a-fazer') return 'backlog';
  if (status === 'finalizado' || status === 'publicado') return 'concluido';
  return status;
}

function taskFields(input) {
  const payload = Object.fromEntries(TASK_COLUMNS
    .filter(key => input[key] !== undefined).map(key => [key, input[key]]));
  if (payload.status) payload.status = normalizeTaskStatus(payload.status);
  if (payload.priority === 'urgent') payload.priority = 'high';
  if (payload.title !== undefined) payload.title = payload.title.trim();
  if (input.description && !payload.notes) payload.notes = input.description;
  for (const key of ['client_id', 'assigned_to_id', 'deadline']) {
    if (payload[key] === '') payload[key] = null;
  }
  for (const key of ['estimated_hours', 'actual_hours', 'tracked_seconds']) {
    if (payload[key] !== undefined && !Number.isFinite(Number(payload[key]))) delete payload[key];
  }
  if (input.attachments !== undefined) payload.external_links = input.attachments;
  return payload;
}

function presentTask(row) {
  const status = normalizeTaskStatus(row.status);
  const links = Array.isArray(row.external_links) ? row.external_links : [];
  return {
    ...row,
    status,
    demand_status: status.replaceAll('-', '_'),
    description: row.notes,
    attachments: links,
    client_name: row.client?.name,
    checklist: [...(row.checklist || [])].sort((a, b) => a.position - b.position)
      .map(item => ({ ...item, text: item.label })),
    comments: [...(row.comments || [])].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || ''))),
  };
}

function confirmed({ data, error }) {
  if (error || !data) throw error || new Error('Gravação não confirmada');
  return data;
}

export function useSupabaseTasks(accountId) {
  const [state, setState] = useState({ accountId: null, tasks: [], error: false });
  const revision = useRef(0);
  const currentAccount = useRef(null);
  const ready = state.accountId === accountId;
  const tasks = ready ? state.tasks : [];

  const refresh = useCallback(async () => {
    if (!accountId) return;
    const request = ++revision.current;
    try {
      const rows = confirmed(await supabase.from('tasks').select(TASK_SELECT)
        .order('created_at', { ascending: false }));
      if (request === revision.current) setState({ accountId, tasks: rows.map(presentTask), error: false });
    } catch {
      if (request === revision.current) {
        setState(previous => ({
          accountId, tasks: previous.accountId === accountId ? previous.tasks : [], error: true,
        }));
      }
    }
  }, [accountId]);

  useEffect(() => {
    currentAccount.current = accountId;
    refresh();
    return () => {
      currentAccount.current = null;
      revision.current++;
    };
  }, [accountId, refresh]);

  function saveRow(row) {
    if (currentAccount.current !== accountId) return null;
    revision.current++;
    const task = presentTask(row);
    setState(previous => {
      if (previous.accountId !== accountId) return previous;
      return {
        ...previous,
        tasks: previous.tasks.some(t => t.id === task.id)
          ? previous.tasks.map(t => t.id === task.id && !(t.updated_at > task.updated_at) ? task : t)
          : [task, ...previous.tasks],
      };
    });
    return task;
  }

  async function saveChecklist(taskId, items) {
    if (!items.length) return [];
    const rows = items.map((item, index) => ({
      id: /^[a-f0-9-]{36}$/i.test(item.id || '') ? item.id : crypto.randomUUID(),
      task_id: taskId, label: item.label || item.text,
      is_done: Boolean(item.is_done), position: item.position ?? index,
    }));
    return confirmed(await supabase.from('task_checklists').upsert(rows).select());
  }

  async function createTask(input) {
    if (!accountId || !ready || !input.title?.trim()) {
      toast.error('Aguarde a conexão para salvar a tarefa.');
      return null;
    }
    try {
      const values = { status: 'backlog', priority: 'medium', assigned_to: 'Bruno', ...taskFields(input) };
      const query = supabase.from('tasks');
      let result;
      if (input.id) {
        result = await query.upsert({ ...values, id: input.id }, { ignoreDuplicates: true })
          .select(TASK_SELECT).maybeSingle();
        if (!result.error && !result.data) {
          result = await supabase.from('tasks').select(TASK_SELECT).eq('id', input.id).single();
        }
      } else {
        result = await query.insert(values).select(TASK_SELECT).single();
      }
      const row = confirmed(result);
      try {
        if (input.checklist?.length && !row.checklist?.length) row.checklist = await saveChecklist(row.id, input.checklist);
      } catch {
        toast.error('Tarefa salva. Reabra a tarefa para incluir o checklist.');
        return saveRow(row);
      }
      toast.success('Tarefa salva.');
      return saveRow(row);
    } catch {
      toast.error('Não foi possível salvar a tarefa. Confira a conexão e os dados do cliente.');
      return null;
    }
  }

  async function updateTask(input) {
    const current = tasks.find(task => task.id === input.id);
    if (!accountId || !current) return null;
    const previous = taskFields(current);
    const fields = Object.fromEntries(Object.entries(taskFields(input))
      .filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(previous[key])));
    let row = current;
    try {
      if (Object.keys(fields).length) {
        row = confirmed(await supabase.from('tasks')
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq('id', current.id).select(TASK_SELECT).single());
      }
      if (input.checklist && JSON.stringify(input.checklist) !== JSON.stringify(current.checklist)) {
        const changed = input.checklist.filter(item => !current.checklist.some(old =>
          old.id === item.id && old.label === (item.label || item.text) && old.is_done === item.is_done));
        const saved = await saveChecklist(current.id, changed.map(item => ({
          ...item, position: input.checklist.indexOf(item),
        })));
        const savedById = new Map(saved.map(item => [item.id, item]));
        row = { ...row, checklist: [...(row.checklist || [])
          .filter(item => !savedById.has(item.id)), ...saved] };
      }
      return saveRow(row);
    } catch {
      if (row !== current) saveRow(row);
      toast.error('A alteração da tarefa não foi confirmada. Confira a tarefa e tente novamente.');
      return null;
    }
  }

  async function deleteTask(id) {
    if (!accountId) return false;
    try {
      confirmed(await supabase.from('tasks').delete().eq('id', id).select('id').single());
      if (currentAccount.current !== accountId) return false;
      revision.current++;
      setState(previous => previous.accountId === accountId
        ? { ...previous, tasks: previous.tasks.filter(task => task.id !== id) } : previous);
      toast.success('Tarefa excluída.');
      return true;
    } catch {
      toast.error('Não foi possível excluir a tarefa.');
      return false;
    }
  }

  async function toggleChecklist(taskId, itemId) {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return null;
    return updateTask({
      id: taskId,
      checklist: task.checklist.map(item => item.id === itemId ? { ...item, is_done: !item.is_done } : item),
    });
  }

  async function addComment(taskId, content, authorName = 'Bruno', isAI = false) {
    const task = tasks.find(item => item.id === taskId);
    if (!accountId || !task || !content.trim()) return null;
    try {
      const comment = confirmed(await supabase.from('task_comments').insert({
        task_id: taskId, content: content.trim(), author_name: authorName, is_ai: isAI,
      }).select().single());
      if (currentAccount.current !== accountId) return null;
      revision.current++;
      setState(previous => previous.accountId === accountId ? {
        ...previous, tasks: previous.tasks.map(item => item.id === taskId
          ? { ...item, comments: [...item.comments, comment] } : item),
      } : previous);
      return comment;
    } catch {
      toast.error('Não foi possível salvar o comentário.');
      return null;
    }
  }

  return {
    tasks, loading: Boolean(accountId && !ready), error: ready && state.error, refresh,
    createTask, updateTask, deleteTask, toggleChecklist, addComment,
  };
}
