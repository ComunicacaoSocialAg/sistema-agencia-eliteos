import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Demo data fallback
const DEMO_TASKS = [
  { id: '1', title: 'Campanha Dia das Mães', client_id: '11111111-0000-0000-0000-000000000001', client: { name: 'Ponto Cor' }, status: 'em-producao', deadline: '2026-05-20', assigned_to: 'Bruno', tag: 'Social Media', estimated_hours: 8, tracked_seconds: 7200, is_tracking: false, comments: [{ id: 'c0', author_name: 'Bruno', content: 'Conceito aprovado internamente. Seguindo para produção.', created_at: new Date().toISOString(), is_ai: false }], checklist: [{ id: 'l0a', label: 'Roteiro aprovado', is_done: true }, { id: 'l0b', label: 'Arte finalizada', is_done: false }, { id: 'l0c', label: 'Revisão de texto', is_done: false }] },
  { id: '2', title: 'Identidade Visual V2', client_id: '11111111-0000-0000-0000-000000000002', client: { name: 'TechStart App' }, status: 'briefing', deadline: '2026-05-25', assigned_to: 'Ana', tag: 'Branding', estimated_hours: 16, tracked_seconds: 0, is_tracking: false, comments: [], checklist: [{ id: 'l1a', label: 'Briefing preenchido', is_done: false }, { id: 'l1b', label: 'Moodboard aprovado', is_done: false }] },
  { id: '3', title: 'Post Carrossel Instagram', client_id: '11111111-0000-0000-0000-000000000003', client: { name: 'Café Blend' }, status: 'revisao-interna', deadline: '2026-05-18', assigned_to: 'Carlos', tag: 'Social Media', estimated_hours: 3, tracked_seconds: 5400, is_tracking: false, comments: [{ id: 'c1', author_name: 'Carlos', content: 'Aguardando revisão do diretor de arte.', created_at: new Date().toISOString(), is_ai: false }], checklist: [{ id: 'l1', label: 'Legenda', is_done: true }, { id: 'l2', label: 'Design', is_done: false }] },
  { id: '4', title: 'Catálogo Digital 2026', client_id: '11111111-0000-0000-0000-000000000001', client: { name: 'Ponto Cor' }, status: 'aprovacao-cliente', deadline: '2026-05-22', assigned_to: 'Ana', tag: 'Branding', estimated_hours: 12, tracked_seconds: 28800, is_tracking: false, comments: [{ id: 'c2', author_name: 'Ana', content: 'Enviado para aprovação do Fernando.', created_at: new Date().toISOString(), is_ai: false }], checklist: [{ id: 'l3', label: 'Layout aprovado', is_done: true }, { id: 'l4', label: 'Textos revisados', is_done: true }, { id: 'l5', label: 'Aprovação do cliente', is_done: false }] },
  { id: '5', title: 'Vídeo Manifesto Marca', client_id: '11111111-0000-0000-0000-000000000001', client: { name: 'Ponto Cor' }, status: 'concluido', deadline: '2026-04-30', assigned_to: 'Bruno', tag: 'Vídeo', estimated_hours: 20, tracked_seconds: 72000, is_tracking: false, comments: [{ id: 'c3', author_name: 'Fernando', content: 'Ficou incrível! Aprovado.', created_at: '2026-04-28T14:00:00Z', is_ai: false }], checklist: [{ id: 'l6', label: 'Roteiro', is_done: true }, { id: 'l7', label: 'Filmagem', is_done: true }, { id: 'l8', label: 'Edição', is_done: true }] },
  { id: '6', title: 'Landing Page Promoção', client_id: '11111111-0000-0000-0000-000000000004', client: { name: 'Clínica Sorriso' }, status: 'backlog', deadline: '2026-06-01', assigned_to: 'Deise', tag: 'Web', estimated_hours: 10, tracked_seconds: 0, is_tracking: false, comments: [], checklist: [] },
  { id: '7', title: 'Planejamento Redes Sociais Jun', client_id: '11111111-0000-0000-0000-000000000003', client: { name: 'Café Blend' }, status: 'em-producao', deadline: '2026-05-28', assigned_to: 'Carlos', tag: 'Social Media', estimated_hours: 6, tracked_seconds: 3600, is_tracking: false, comments: [], checklist: [{ id: 'l9', label: 'Grade de conteúdo', is_done: true }, { id: 'l10', label: 'Legendas', is_done: false }, { id: 'l11', label: 'Artes', is_done: false }] },
];

export function useTasks() {
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: err } = await supabase
      .from('tasks')
      .select(`*, client:clients(name, brand_color), comments:task_comments(*), checklist:task_checklists(*)`)
      .order('created_at', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setTasks(data.map(t => ({
        ...t,
        client: t.client || { name: 'Sem cliente' },
        comments: t.comments || [],
        checklist: (t.checklist || []).sort((a, b) => a.position - b.position),
        is_tracking: false,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    if (!isSupabaseConfigured) return;

    // Gerar um nome único para o canal evita conflitos no React Strict Mode
    // onde o componente pode montar/desmontar rapidamente, reaproveitando o canal
    const channelName = `tasks-elite-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_checklists' }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const updateTask = async (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (!isSupabaseConfigured) return;

    const { is_tracking, comments, checklist, client, ...dbTask } = updatedTask;
    await supabase.from('tasks').update(dbTask).eq('id', updatedTask.id);
  };

  const createTask = async (taskData) => {
    const { checklist: initialChecklist, ...baseData } = taskData;
    const taskId = crypto.randomUUID();
    
    const newTask = {
      ...baseData,
      id: taskId,
      client: { name: taskData.client_name || 'Novo Cliente' },
      comments: [],
      checklist: initialChecklist || [],
      is_tracking: false,
      tracked_seconds: 0,
    };

    setTasks(prev => [...prev, newTask]);
    toast.success('Tarefa criada com sucesso!');

    if (!isSupabaseConfigured) return newTask;

    const { client, comments, checklist, is_tracking, ...dbTask } = newTask;
    const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();
    
    if (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao salvar no banco.');
      return null;
    }

    // Insert checklist items if any
    if (initialChecklist && initialChecklist.length > 0) {
      const itemsToInsert = initialChecklist.map((item, index) => ({
        task_id: data.id,
        label: item.label,
        is_done: item.is_done || false,
        position: index
      }));
      await supabase.from('task_checklists').insert(itemsToInsert);
    }

    return data;
  };

  const addComment = async (taskId, content, authorName = 'Bruno', isAI = false) => {
    const newComment = {
      id: crypto.randomUUID(),
      task_id: taskId,
      author_name: authorName,
      content,
      is_ai: isAI,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
    ));

    if (!isSupabaseConfigured) return;
    await supabase.from('task_comments').insert({ task_id: taskId, content, author_name: authorName, is_ai: isAI });
  };

  const toggleChecklist = async (taskId, itemId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newChecklist = t.checklist.map(item => 
        item.id === itemId ? { ...item, is_done: !item.is_done } : item
      );
      return { ...t, checklist: newChecklist };
    }));

    if (!isSupabaseConfigured) return;
    const task = tasks.find(t => t.id === taskId);
    const item = task?.checklist.find(i => i.id === itemId);
    if (item) {
      await supabase.from('task_checklists').update({ is_done: !item.is_done }).eq('id', itemId);
    }
  };

  const moveTask = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) updateTask({ ...task, status: newStatus });
    toast.success(`Movido para ${newStatus}`);
  };

  const applyTemplate = async (templateId, clientId, clientName) => {
    const TEMPLATES = {
      'social-media': [
        { title: 'Planejamento Mensal', tag: 'Social Media', estimated_hours: 4, status: 'backlog', checklist: [{label: 'Aprovar pauta', is_done: false}] },
        { title: 'Design - 8 Posts', tag: 'Design', estimated_hours: 12, status: 'backlog', checklist: [{label: 'Aprovar artes', is_done: false}] },
        { title: 'Agendamento e Legendas', tag: 'Social Media', estimated_hours: 4, status: 'backlog', checklist: [{label: 'Agendar posts', is_done: false}] }
      ],
      'onboarding': [
        { title: 'Reunião Kickoff', tag: 'Atendimento', estimated_hours: 2, status: 'backlog', checklist: [] },
        { title: 'Setup de Contas', tag: 'Performance', estimated_hours: 3, status: 'backlog', checklist: [{label: 'Acesso Meta', is_done: false}, {label: 'Acesso Google', is_done: false}] },
        { title: 'Criação do Brandbook', tag: 'Branding', estimated_hours: 15, status: 'backlog', checklist: [{label: 'Aprovação de Cores', is_done: false}] }
      ]
    };

    const templateTasks = TEMPLATES[templateId];
    if (!templateTasks) return;

    for (const t of templateTasks) {
      await createTask({
        title: t.title,
        client_id: clientId,
        client_name: clientName,
        tag: t.tag,
        estimated_hours: t.estimated_hours,
        status: t.status,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        checklist: t.checklist
      });
    }
    toast.success('Template aplicado!');
  };

  return { tasks, loading, error, updateTask, createTask, addComment, toggleChecklist, moveTask, applyTemplate, refetch: fetchTasks };
}
