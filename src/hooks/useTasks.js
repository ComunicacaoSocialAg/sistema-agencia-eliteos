import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const INITIAL_DEMO_TASKS = [
  {
    id: 'task-1',
    title: 'Carrossel Lançamento Linha Gourmet (3/3)',
    description: 'Criar conceito visual e arte para Instagram e Meta Ads do molho especial.',
    client_id: 'client-dubola',
    client_name: 'Dubola Molhos Especiais',
    client: { name: 'Dubola Molhos Especiais' },
    status: 'em-producao',
    demand_status: 'em_producao',
    priority: 'high',
    assigned_to: 'Ana (Designer)',
    deadline: '2026-08-05',
    checklist: [
      { id: 'chk-1', text: 'Design dos 3 cards', is_done: true },
      { id: 'chk-2', text: 'Revisão de Copywriting', is_done: false }
    ],
    comments: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Setup de Mídia Meta Ads & Pixel GA4',
    description: 'Configuração do gerenciador de anúncios e conversão da landing page.',
    client_id: 'client-pontocor',
    client_name: 'Ponto Cor Fotografia',
    client: { name: 'Ponto Cor Fotografia' },
    status: 'aguardando-cliente',
    demand_status: 'aguardando_cliente',
    priority: 'medium',
    assigned_to: 'Carlos (Mídia)',
    deadline: '2026-08-08',
    checklist: [],
    comments: [],
    created_at: new Date().toISOString()
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
          if (t.status !== 'concluido' && t.demand_status !== 'publicado') return true;
          if (!t.deadline) return true;
          const d = new Date(t.deadline);
          return d >= thirtyDaysAgo;
        });
      }

      setTasks(data);
      setLoading(false);
    }, (err) => {
      console.warn('[Firebase] Erro ao buscar tarefas:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId, showArchived]);

  // Persistência local em modo demo
  useEffect(() => {
    if (!isFirebaseConfigured) {
      try {
        localStorage.setItem('csag_custom_tasks', JSON.stringify(tasks));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [tasks]);

  const updateTask = async (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));

    if (!isFirebaseConfigured) return;

    try {
      const { id, is_tracking, client, ...dbTask } = updatedTask;
      await updateDoc(doc(db, 'tasks', id), dbTask);
    } catch (e) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const createTask = async (taskData) => {
    const { checklist: initialChecklist, ...baseData } = taskData;
    const newTask = {
      ...baseData,
      id: taskData.id || crypto.randomUUID(),
      client: { name: taskData.client_name || 'Novo Cliente' },
      comments: taskData.comments || [],
      checklist: initialChecklist || [],
      status: taskData.status || 'a-fazer',
      demand_status: taskData.demand_status || 'em_producao',
      is_tracking: false,
      tracked_seconds: 0,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    if (!isFirebaseConfigured) {
      toast.success('Tarefa criada com sucesso!');
      return newTask;
    }

    try {
      const docRef = doc(collection(db, 'tasks'));
      newTask.id = docRef.id;
      const { client, is_tracking, ...dbTask } = newTask;
      await setDoc(docRef, dbTask);
      toast.success('Tarefa salva no banco!');
      return newTask;
    } catch (e) {
      toast.error('Erro ao salvar tarefa');
      return null;
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (!isFirebaseConfigured) {
      toast.success('Tarefa excluída!');
      return;
    }
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success('Tarefa excluída!');
    } catch (e) {
      toast.error('Erro ao remover tarefa');
    }
  };

  const addComment = async (taskId, content, authorName = 'Bruno', isAI = false) => {
    const newComment = {
      id: crypto.randomUUID(),
      author_name: authorName,
      content,
      is_ai: isAI,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
    ));

    if (!isFirebaseConfigured) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedComments = [...(task.comments || []), newComment];
        await updateDoc(doc(db, 'tasks', taskId), { comments: updatedComments });
      }
    } catch (e) {
      toast.error('Erro ao adicionar comentário');
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
    addComment 
  };
}
