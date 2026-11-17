import { createContext, createElement, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { normalizeTaskStatus, useSupabaseTasks } from './useSupabaseTasks';
import toast from 'react-hot-toast';
import { areIdsMatching } from './useClients';

const INITIAL_DEMO_TASKS = [
  {
    id: 'task-alberto-1',
    title: 'Carrossel: Mitos e Verdades sobre Varizes e Laser Transdérmico',
    description: 'Post carrossel educativo sobre tratamento de varizes com laser. Compliance CFM 2.336/2023: CRM-MG 39529 e RQE 15412.',
    client_id: 'client-alberto-brasil',
    client_name: 'Dr. Alberto Brasil (Cirurgia Vascular)',
    client: { name: 'Dr. Alberto Brasil (Cirurgia Vascular)' },
    status: 'aguardando-cliente',
    demand_status: 'aguardando_cliente',
    priority: 'high',
    tag: 'Social Media',
    assigned_to: 'Bruno',
    deadline: '2026-10-15',
    estimated_hours: 3.5,
    actual_hours: 2.0,
    tracked_seconds: 7200,
    is_tracking: false,
    checklist: [
      { id: 'chk-1', text: 'Roteiro e Copywriting aprovados com rigor científico', is_done: true },
      { id: 'chk-2', text: 'Design dos 4 cards com identidade azul e grafismos', is_done: true },
      { id: 'chk-3', text: 'Inserção de CRM 39529 e RQE 15412', is_done: true }
    ],
    comments: [
      { id: 'c-1', author_name: 'Bruno (Agência)', content: 'Carrossel finalizado e submetido para validação do Dr. Alberto.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() }
    ],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'task-dubola-1',
    title: 'Manual de Identidade Visual e Redesign de Rótulo Habanero',
    description: 'Finalização do manual da marca Dubola e novos rótulos para molhos gourmet com código de barras.',
    client_id: 'client-dubola',
    client_name: 'Dubola Molhos Especiais',
    client: { name: 'Dubola Molhos Especiais' },
    status: 'concluido',
    demand_status: 'concluido',
    priority: 'urgent',
    tag: 'Branding',
    assigned_to: 'Bruno',
    deadline: '2026-10-10',
    estimated_hours: 12.0,
    actual_hours: 11.5,
    tracked_seconds: 41400,
    is_tracking: false,
    checklist: [
      { id: 'chk-4', text: 'Definição de tipografia e paleta rústica', is_done: true },
      { id: 'chk-5', text: 'Guia de aplicação para embalagens de vidro', is_done: true },
      { id: 'chk-6', text: 'Aprovação final do Roberto', is_done: true }
    ],
    comments: [
      { id: 'c-2', author_name: 'Roberto Dubola', content: 'Manual aprovado! Ficou muito elegante.', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
    ],
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'task-dubola-2',
    title: 'Roteiro e Edição de Reels: Harmonização com Carnes Defumadas',
    description: 'Produção de vídeo orgânico para Instagram e TikTok demonstrando o uso prático dos molhos artesanais em cortes de carne nobres.',
    client_id: 'client-dubola',
    client_name: 'Dubola Molhos Especiais',
    client: { name: 'Dubola Molhos Especiais' },
    status: 'em-producao',
    demand_status: 'em_producao',
    priority: 'high',
    tag: 'Social Media',
    assigned_to: 'Bruno',
    deadline: '2026-10-20',
    estimated_hours: 4.0,
    actual_hours: 1.5,
    tracked_seconds: 5400,
    is_tracking: false,
    checklist: [
      { id: 'chk-7', text: 'Pixel e API de Conversões verificados no e-commerce', is_done: true },
      { id: 'chk-8', text: 'Subir criativos em teste A/B', is_done: false }
    ],
    comments: [],
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'task-alberto-2',
    title: 'Reels: Como funciona o Doppler Vascular no diagnóstico preciso',
    description: 'Edição de vídeo com áudio do Dr. Alberto explicando a tecnologia de diagnóstico.',
    client_id: 'client-alberto-brasil',
    client_name: 'Dr. Alberto Brasil (Cirurgia Vascular)',
    client: { name: 'Dr. Alberto Brasil (Cirurgia Vascular)' },
    status: 'revisao-interna',
    demand_status: 'revisao_interna',
    priority: 'medium',
    tag: 'Vídeo',
    assigned_to: 'Bruno',
    deadline: '2026-10-18',
    estimated_hours: 4.0,
    actual_hours: 3.0,
    tracked_seconds: 10800,
    is_tracking: false,
    checklist: [
      { id: 'chk-9', text: 'Corte e sincronia com trilha sonora médica', is_done: true },
      { id: 'chk-10', text: 'Correção de cor e lettering com CRM/RQE', is_done: true }
    ],
    comments: [],
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

const TASK_KEY = 'csag_custom_tasks';
const TASK_EVENT = 'csag_tasks_updated';

function readBrowserTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASK_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    // Preserve the existing browser data when it cannot be read.
  }
  return INITIAL_DEMO_TASKS;
}

function useBrowserTasks(enabled = true) {
  const [tasks, setTasks] = useState(() => enabled ? readBrowserTasks() : []);

  useEffect(() => {
    if (!enabled) return;
    const sync = event => {
      if (event?.type === 'storage' && event.key !== TASK_KEY && event.key !== null) return;
      setTasks(readBrowserTasks());
    };
    window.addEventListener('storage', sync);
    window.addEventListener(TASK_EVENT, sync);
    sync();
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(TASK_EVENT, sync);
    };
  }, [enabled]);

  function commit(update) {
    try {
      const previous = readBrowserTasks();
      const next = update(previous);
      if (next !== previous) {
        localStorage.setItem(TASK_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(TASK_EVENT));
      }
      return true;
    } catch {
      toast.error('Não foi possível salvar neste navegador. Verifique o armazenamento.');
      return false;
    }
  }

  async function createTask(input) {
    if (!input.title?.trim()) return null;
    const task = {
      demoOnly: true,
      client: { name: input.client_name || 'Interno' },
      comments: [], checklist: [], demand_status: 'em_producao', tag: 'Social Media',
      priority: 'medium', assigned_to: 'Bruno', estimated_hours: 2, actual_hours: 0,
      is_tracking: false, tracked_seconds: 0,
      ...input,
      id: input.id || `task-${crypto.randomUUID()}`,
      title: input.title.trim(),
      status: normalizeTaskStatus(input.status || 'backlog'),
      created_at: new Date().toISOString(),
    };
    const existing = readBrowserTasks().find(item => item.id === task.id);
    if (existing) return existing;
    if (!commit(previous => [task, ...previous])) return null;
    toast.success('Tarefa salva neste navegador.');
    return task;
  }

  async function updateTask(input) {
    let saved = null;
    const success = commit(previous => previous.map(task => {
      if (task.id !== input.id) return task;
      saved = { ...task, ...input };
      if (saved.status === 'concluido' && task.status !== 'concluido') saved.completed_at = new Date().toISOString();
      if (saved.status !== 'concluido') saved.completed_at = null;
      return saved;
    }));
    return success ? saved : null;
  }

  async function deleteTask(id) {
    const success = commit(previous => previous.filter(task => task.id !== id));
    if (success) toast.success('Tarefa excluída.');
    return success;
  }

  async function toggleChecklist(taskId, itemId) {
    const task = readBrowserTasks().find(item => item.id === taskId);
    if (!task) return null;
    return updateTask({
      id: taskId,
      checklist: (task.checklist || []).map(item => item.id === itemId ? { ...item, is_done: !item.is_done } : item),
    });
  }

  async function addComment(taskId, content, authorName = 'Bruno', isAI = false) {
    const task = readBrowserTasks().find(item => item.id === taskId);
    if (!task || !content.trim()) return null;
    const comment = {
      id: `comment-${crypto.randomUUID()}`,
      author_name: authorName, content: content.trim(), is_ai: isAI, created_at: new Date().toISOString(),
    };
    return await updateTask({ id: taskId, comments: [...(task.comments || []), comment] }) ? comment : null;
  }

  return { tasks, loading: false, createTask, updateTask, deleteTask, toggleChecklist, addComment };
}

const TaskContext = createContext(null);
const byNewest = (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''));

export function TasksProvider({ children }) {
  const { user, profile, isDemoMode } = useAuth();
  const serverMode = isSupabaseConfigured && !isDemoMode && !user?.id?.startsWith('demo-');
  const accountId = serverMode && profile?.role !== 'client' && user?.id === profile?.id ? user?.id : null;
  const browser = useBrowserTasks(!serverMode || Boolean(accountId && profile.role !== 'client'));
  const remote = useSupabaseTasks(accountId);
  const remoteIds = new Set(remote.tasks.map(task => task.id));
  const demoIds = new Set(INITIAL_DEMO_TASKS.map(task => task.id));
  const legacy = accountId && profile.role !== 'client'
    ? browser.tasks.filter(task => !remoteIds.has(task.id) && !demoIds.has(task.id) && !task.demoOnly
      && !String(task.id).startsWith('demo-')).map(task => ({ ...task, browserOnly: true }))
    : [];
  const legacyIds = new Set(legacy.map(task => task.id));
  const tasks = serverMode ? [...remote.tasks, ...legacy].sort(byNewest) : browser.tasks;
  const value = serverMode ? {
    ...remote,
    tasks,
    loading: !accountId || remote.loading,
    remoteMode: true,
    createTask: remote.createTask,
    updateTask: task => legacyIds.has(task.id) ? browser.updateTask(task) : remote.updateTask(task),
    deleteTask: id => legacyIds.has(id) ? browser.deleteTask(id) : remote.deleteTask(id),
    addComment: (id, ...args) => legacyIds.has(id) ? browser.addComment(id, ...args) : remote.addComment(id, ...args),
    toggleChecklist: (id, item) => legacyIds.has(id) ? browser.toggleChecklist(id, item) : remote.toggleChecklist(id, item),
  } : browser;
  return createElement(TaskContext.Provider, { value }, children);
}

export function useTasks(clientId, { showArchived = false } = {}) {
  const shared = useContext(TaskContext);
  const fallback = useBrowserTasks(!shared);
  const collection = shared || fallback;
  const allTasks = useMemo(() => collection.tasks.map(task => task.status === normalizeTaskStatus(task.status)
    ? task : { ...task, status: normalizeTaskStatus(task.status) }), [collection.tasks]);
  const tasks = useMemo(() => {
    const archiveBefore = new Date();
    archiveBefore.setDate(archiveBefore.getDate() - 30);
    return allTasks.filter(task => {
      if (clientId && !areIdsMatching(task.client_id, clientId, task.client_name || task.client?.name, '')) return false;
      return showArchived || task.status !== 'concluido' || !task.deadline || new Date(task.deadline) >= archiveBefore;
    });
  }, [allTasks, clientId, showArchived]);
  return {
    ...collection,
    tasks,
    allTasks,
    applyTemplate: (type, targetClientId) => applyTaskTemplate(collection.createTask, type, targetClientId || clientId),
  };
}

async function applyTaskTemplate(createTask, templateType, clientId) {
    if (!clientId) {
      toast.error('Selecione o cliente para aplicar o modelo.');
      return [];
    }
    const templates = {
      'social-media': [
        { title: 'Planejamento Editorial do Mês', priority: 'high', tag: 'Social Media', status: 'em-producao' },
        { title: 'Criação de Artes Carrossel', priority: 'medium', tag: 'Social Media', status: 'em-producao' },
        { title: 'Redação de Copy e Legendas', priority: 'medium', tag: 'Social Media', status: 'revisao-interna' },
        { title: 'Agendamento e Publicação', priority: 'low', tag: 'Social Media', status: 'aguardando-cliente' }
      ],
      'onboarding': [
        { title: 'Disparo de Boas-Vindas & Acessos', priority: 'high', tag: 'Social Media', status: 'em-producao' },
        { title: 'Auditoria de Ativos & Drive', priority: 'high', tag: 'Branding', status: 'revisao-interna' },
        { title: 'Reunião de Kickoff Estratégico', priority: 'urgent', tag: 'Campanha', status: 'em-producao' }
      ]
    };

    const selectedTemplate = templates[templateType] || templates['social-media'];
    const created = [];

    for (const item of selectedTemplate) {
      const task = await createTask({
        title: item.title,
        priority: item.priority,
        status: item.status || 'backlog',
        demand_status: 'em_producao',
        tag: item.tag || 'Social Media',
        client_id: clientId,
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      });
      if (task) created.push(task);
    }

    if (created.length === selectedTemplate.length) toast.success('Modelo aplicado.');
    return created;
  }
