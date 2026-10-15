import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

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
    title: 'Setup de Tráfego Pago Meta Ads (Campanha Gourmet Churrasco)',
    description: 'Estruturação de público Lookalike e criativos em vídeo para conversão no e-commerce.',
    client_id: 'client-dubola',
    client_name: 'Dubola Molhos Especiais',
    client: { name: 'Dubola Molhos Especiais' },
    status: 'em-producao',
    demand_status: 'em_producao',
    priority: 'high',
    tag: 'Campanha',
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

export function useTasks(clientId, options = {}) {
  const { showArchived = false } = options;

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('csag_custom_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_DEMO_TASKS;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let q = collection(db, 'tasks');
    if (clientId) {
      q = query(q, where('client_id', '==', clientId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (!showArchived) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        data = data.filter(t => {
          if (t.status !== 'concluido' && t.status !== 'finalizado' && t.demand_status !== 'publicado') return true;
          if (!t.deadline) return true;
          const d = new Date(t.deadline);
          return d >= thirtyDaysAgo;
        });
      }

      if (data.length > 0) {
        setTasks(data);
      }
      setLoading(false);
    }, (err) => {
      console.warn('[Firebase] Erro ao buscar tarefas:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId, showArchived]);

  // Persistência local em modo demo
  useEffect(() => {
    try {
      localStorage.setItem('csag_custom_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn(e);
    }
  }, [tasks]);

  const updateTask = async (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));

    if (!isFirebaseConfigured || !db) return;

    try {
      const { id, is_tracking, client, ...dbTask } = updatedTask;
      await updateDoc(doc(db, 'tasks', id), dbTask);
    } catch (e) {
      console.warn('Erro ao atualizar tarefa no Firebase:', e);
    }
  };

  const createTask = async (taskData) => {
    const { checklist: initialChecklist, ...baseData } = taskData;
    const newTask = {
      ...baseData,
      id: taskData.id || `task-${Date.now()}`,
      client: { name: taskData.client_name || 'Novo Cliente' },
      comments: taskData.comments || [],
      checklist: initialChecklist || [],
      status: taskData.status || 'a-fazer',
      demand_status: taskData.demand_status || 'em_producao',
      tag: taskData.tag || 'Social Media',
      priority: taskData.priority || 'medium',
      assigned_to: taskData.assigned_to || 'Bruno',
      estimated_hours: taskData.estimated_hours || 2.0,
      actual_hours: 0,
      is_tracking: false,
      tracked_seconds: 0,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    toast.success('Tarefa criada com sucesso!');

    if (!isFirebaseConfigured || !db) {
      return newTask;
    }

    try {
      const docRef = doc(collection(db, 'tasks'));
      newTask.id = docRef.id;
      const { client, is_tracking, ...dbTask } = newTask;
      await setDoc(docRef, dbTask);
      return newTask;
    } catch (e) {
      console.warn('Erro ao salvar no Firebase, mantendo local:', e);
      return newTask;
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('Tarefa excluída!');

    if (!isFirebaseConfigured || !db) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (e) {
      console.warn('Erro ao remover no Firebase:', e);
    }
  };

  const toggleChecklist = async (taskId, itemId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newChecklist = (t.checklist || []).map(item =>
        item.id === itemId ? { ...item, is_done: !item.is_done } : item
      );
      const updated = { ...t, checklist: newChecklist };
      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'tasks', taskId), { checklist: newChecklist }).catch(() => {});
      }
      return updated;
    }));
  };

  const applyTemplate = async (templateType, targetClientId = null) => {
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
        status: item.status || 'a-fazer',
        demand_status: 'em_producao',
        tag: item.tag || 'Social Media',
        client_id: targetClientId || clientId || 'ce45a984-093d-4484-9ee4-9177d56310e3',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      });
      if (task) created.push(task);
    }

    toast.success(`Template "${templateType}" aplicado com sucesso!`);
    return created;
  };

  const addComment = async (taskId, content, authorName = 'Bruno', isAI = false) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author_name: authorName,
      content,
      is_ai: isAI,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
    ));

    if (!isFirebaseConfigured || !db) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedComments = [...(task.comments || []), newComment];
        await updateDoc(doc(db, 'tasks', taskId), { comments: updatedComments });
      }
    } catch (e) {
      console.warn('Erro ao adicionar comentário no Firebase:', e);
    }
  };

  // Filtrar tarefas se clientId for fornecido
  const filteredTasks = clientId 
    ? tasks.filter(t => t.client_id === clientId || (t.client && t.client.name === clientId))
    : tasks;

  return { 
    tasks: filteredTasks, 
    allTasks: tasks, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleChecklist,
    applyTemplate,
    addComment 
  };
}
