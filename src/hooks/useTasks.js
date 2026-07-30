import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Demo data fallback
const DEMO_TASKS = [];


import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export function useTasks(clientId, options = {}) {
  const { showArchived = false } = options;
  const [tasks, setTasks] = useState(() => {
    let initial = DEMO_TASKS;
    if (clientId) {
      initial = initial.filter(t => t.client_id === clientId || (t.client && t.client.name === clientId));
    }
    if (!showArchived) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      initial = initial.filter(t => {
        if (t.status !== 'concluido') return true;
        if (!t.deadline) return true;
        const d = new Date(t.deadline);
        return d >= thirtyDaysAgo;
      });
    }
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          if (t.status !== 'concluido') return true;
          if (!t.deadline) return true;
          const d = new Date(t.deadline);
          return d >= thirtyDaysAgo;
        });
      }

      setTasks(data);
      setLoading(false);
    }, (err) => {
      console.warn('[Firebase] Erro ao buscar tarefas:', err.message);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId, showArchived]);

  const updateTask = async (updatedTask) => {
    if (!isFirebaseConfigured) {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      return;
    }

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
      client: { name: taskData.client_name || 'Novo Cliente' },
      comments: [],
      checklist: initialChecklist || [],
      is_tracking: false,
      tracked_seconds: 0,
      created_at: new Date().toISOString(),
    };

    if (!isFirebaseConfigured) {
      newTask.id = crypto.randomUUID();
      setTasks(prev => [...prev, newTask]);
      toast.success('Tarefa criada (Modo Demo)');
      return newTask;
    }

    try {
      const docRef = doc(collection(db, 'tasks'));
      newTask.id = docRef.id;
      const { client, is_tracking, ...dbTask } = newTask;
      await setDoc(docRef, dbTask);
      toast.success('Tarefa criada com sucesso!');
      return newTask;
    } catch (e) {
      toast.error('Erro ao salvar tarefa');
      return null;
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

    if (!isFirebaseConfigured) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
      ));
      return;
    }

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

  const toggleChecklist = async (taskId, itemId) => {
    if (!isFirebaseConfigured) {
      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t;
        const newChecklist = t.checklist.map(item => 
          item.id === itemId ? { ...item, is_done: !item.is_done } : item
        );
        return { ...t, checklist: newChecklist };
      }));
      return;
    }

    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newChecklist = task.checklist.map(item => 
          item.id === itemId ? { ...item, is_done: !item.is_done } : item
        );
        await updateDoc(doc(db, 'tasks', taskId), { checklist: newChecklist });
      }
    } catch (e) {
      toast.error('Erro ao atualizar checklist');
    }
  };

  const moveTask = async (taskId, newStatus) => {
    if (!isFirebaseConfigured) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
      toast.success(`Movido para ${newStatus}`);
      return;
    }

    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      toast.success(`Movido para ${newStatus}`);
    } catch (e) {
      toast.error('Erro ao mover tarefa');
    }
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

  return { tasks, loading, error, updateTask, createTask, addComment, toggleChecklist, moveTask, applyTemplate, refetch: () => {} };
}
