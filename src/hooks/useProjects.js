import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useTasks } from './useTasks';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, db, isFirebaseConfigured } from '../lib/firebase';

const DEFAULT_DEMO_PROJECTS = [
  {
    id: 'proj-alberto-1',
    name: 'Calendário de Autoridade Vascular & Clínica Unique',
    client_id: 'client-alberto-brasil',
    client_name: 'Dr. Alberto Brasil (Cirurgia Vascular)',
    type: 'campanha',
    type_label: 'Campanha de Autoridade Médica',
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    value: 22500,
    status: 'em-andamento',
    description: 'Campanha trimestral de posicionamento de alta autoridade científica para cirurgia vascular e laser transdérmico.',
    task_count: 12,
    tasks_done: 8,
    drive_folder_url: 'https://drive.google.com/drive/folders/demo-dr-alberto',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'proj-dubola-1',
    name: 'Rebranding & Novo Posicionamento',
    client_id: 'client-dubola',
    client_name: 'Dubola Molhos Especiais',
    type: 'branding',
    type_label: 'Identidade & Branding',
    start_date: '2026-04-15',
    end_date: '2026-06-15',
    value: 14000,
    status: 'em-andamento',
    description: 'Redesign completo da identidade visual, novos rótulos, manual de marca e lançamento.',
    task_count: 10,
    tasks_done: 7,
    drive_folder_url: 'https://drive.google.com/drive/folders/demo-dubola',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: 'proj-interno-1',
    name: 'Comunica OS 2.0 - Portal do Cliente',
    client_id: 'internal',
    client_name: 'Comunicação Social Ag',
    type: 'interno',
    type_label: 'Projeto Interno',
    start_date: '2026-01-10',
    end_date: '2026-08-30',
    value: 0,
    status: 'em-andamento',
    description: 'Evolução tecnológica da plataforma de gestão e automações da agência.',
    task_count: 12,
    tasks_done: 10,
    created_at: new Date(Date.now() - 3600000 * 240).toISOString()
  }
];

function getStoredProjects() {
  try {
    const raw = localStorage.getItem('csag_custom_projects');
    if (!raw) {
      localStorage.setItem('csag_custom_projects', JSON.stringify(DEFAULT_DEMO_PROJECTS));
      return DEFAULT_DEMO_PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_PROJECTS;
  }
}

function saveStoredProjects(items) {
  try {
    localStorage.setItem('csag_custom_projects', JSON.stringify(items));
  } catch (e) {
    console.warn('Erro ao salvar projetos:', e);
  }
}

function useDemoProjects(enabled) {
  const [projects, setProjects] = useState(() => enabled ? getStoredProjects() : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    if (!isFirebaseConfigured || !db) {
      setProjects(getStoredProjects());
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) {
        setProjects(data);
      } else {
        setProjects(getStoredProjects());
      }
      setLoading(false);
    }, (error) => {
      console.warn('[Firebase] Erro ao buscar projetos:', error.message);
      setProjects(getStoredProjects());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [enabled]);

  const createProject = useCallback(async (projectData) => {
    const newProject = {
      ...projectData,
      id: projectData.id || `proj-${Date.now()}`,
      created_at: new Date().toISOString(),
      task_count: projectData.tasks?.length || 0,
      tasks_done: 0,
      status: 'em-andamento',
    };

    if (!isFirebaseConfigured || !db) {
      const current = getStoredProjects();
      const updated = [newProject, ...current];
      saveStoredProjects(updated);
      setProjects(updated);
      toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
      return newProject;
    }

    try {
      const docRef = doc(collection(db, 'projects'));
      newProject.id = docRef.id;
      const { tasks, ...projectToSave } = newProject;
      await setDoc(docRef, projectToSave);
      toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
      return newProject;
    } catch (e) {
      console.warn('Erro ao salvar no Firebase, salvando local:', e);
      const current = getStoredProjects();
      const updated = [newProject, ...current];
      saveStoredProjects(updated);
      setProjects(updated);
      toast.success(`Projeto "${newProject.name}" salvo localmente.`);
      return newProject;
    }
  }, []);

  const updateProject = useCallback(async (updated) => {
    const current = getStoredProjects();
    const next = current.map(p => p.id === updated.id ? { ...p, ...updated } : p);
    saveStoredProjects(next);
    setProjects(next);

    if (!isFirebaseConfigured || !db) {
      toast.success('Projeto atualizado.');
      return;
    }

    try {
      const { id, tasks, ...data } = updated;
      const docRef = doc(db, 'projects', id);
      await updateDoc(docRef, data);
      toast.success('Projeto atualizado.');
    } catch (e) {
      console.warn('Erro ao atualizar no Firebase:', e);
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const current = getStoredProjects();
    const next = current.filter(p => p.id !== projectId);
    saveStoredProjects(next);
    setProjects(next);

    if (!isFirebaseConfigured || !db) {
      toast.success('Projeto removido.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      toast.success('Projeto removido.');
    } catch (e) {
      console.warn('Erro ao remover no Firebase:', e);
    }
  }, []);

  const updateProjectDriveFolderUrl = useCallback(async (projectId, url) => {
    const current = getStoredProjects();
    const next = current.map(p => p.id === projectId ? { ...p, drive_folder_url: url } : p);
    saveStoredProjects(next);
    setProjects(next);

    if (!isFirebaseConfigured || !db) return;

    try {
      await updateDoc(doc(db, 'projects', projectId), { drive_folder_url: url });
    } catch (e) {
      console.error('Erro ao salvar URL do Drive no Firebase', e);
    }
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    updateProjectDriveFolderUrl,
  };
}

const PROJECTS_EVENT = 'csag:projects-changed';

export function useProjects() {
  const { role, isDemoMode } = useAuth();
  const remote = isSupabaseConfigured && !isDemoMode;
  const enabled = remote && ['admin', 'commercial', 'production'].includes(role);
  const demo = useDemoProjects(!remote);
  const { allTasks, refresh: refreshTasks } = useTasks();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRows(data);
      setError('');
    } catch {
      setError('Não foi possível carregar os projetos.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    window.addEventListener(PROJECTS_EVENT, refresh);
    return () => window.removeEventListener(PROJECTS_EVENT, refresh);
  }, [enabled, refresh]);

  async function createProject(project) {
    if (!enabled) return null;
    const { id, tasks, ...fields } = project;
    try {
      const { data, error } = await supabase.rpc('create_agency_project', {
        p_id: id, p_project: fields, p_tasks: tasks,
      });
      const result = Array.isArray(data) ? data[0] : data;
      if (error || !result?.id) throw error;
      window.dispatchEvent(new Event(PROJECTS_EVENT));
      if (project.is_proposal) window.dispatchEvent(new Event('csag:deals-changed'));
      await refreshTasks();
      toast.success('Projeto e tarefas registrados.');
      return result;
    } catch (error) {
      toast.error(error?.code === '42501' ? 'Sua conta não tem acesso para criar este projeto.' :
        'Não foi possível salvar o projeto. Confira os dados e tente novamente.');
      return null;
    }
  }

  async function changeProject(id, fields) {
    if (!enabled) return false;
    try {
      const table = supabase.from('projects');
      const operation = fields ? table.update(fields) : table.delete();
      const { data, error } = await operation.eq('id', id).select('id').single();
      if (error || !data) throw error;
      window.dispatchEvent(new Event(PROJECTS_EVENT));
      toast.success(fields ? 'Projeto atualizado.' : 'Projeto removido.');
      return true;
    } catch {
      toast.error('A mudança no projeto não foi confirmada.');
      return false;
    }
  }

  if (!remote) return demo;
  const projects = enabled ? rows.map(project => {
    const tasks = allTasks.filter(task => task.project_id === project.id);
    return { ...project, task_count: tasks.length, tasks_done: tasks.filter(task => task.status === 'concluido').length };
  }) : [];
  return {
    projects, remote, loading: enabled && loading, error, refresh, createProject,
    updateProject: ({ id, status }) => changeProject(id, { status }),
    updateProjectDriveFolderUrl: (id, url) => changeProject(id, { drive_folder_url: url }),
    deleteProject: id => window.confirm('Remover o projeto? As tarefas continuam em Produção.') && changeProject(id, null),
  };
}
