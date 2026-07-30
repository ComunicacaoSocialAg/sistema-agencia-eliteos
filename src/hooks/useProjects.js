import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Hook para gerenciar projetos (em memória + preparado para Firebase)
// Um "Projeto" é um container de tarefas com escopo, prazo e tipo definidos.

const DEMO_PROJECTS = [];


import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export function useProjects() {
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.warn('[Firebase] Erro ao buscar projetos:', error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createProject = useCallback(async (projectData) => {
    const newProject = {
      ...projectData,
      created_at: new Date().toISOString(),
      task_count: projectData.tasks?.length || 0,
      tasks_done: 0,
      status: 'em-andamento',
    };

    if (!isFirebaseConfigured) {
      newProject.id = `proj-${Date.now()}`;
      setProjects(prev => [newProject, ...prev]);
      toast.success(`Projeto "${newProject.name}" criado (Modo Demo).`);
      return newProject;
    }

    try {
      const docRef = doc(collection(db, 'projects'));
      newProject.id = docRef.id;
      // Note: As tasks não são salvas dentro do documento do projeto (é recomendado usar a collection tasks)
      // O salvamento das tarefas via batch ocorrerá no local onde createProject for chamado (ou via useTasks).
      const { tasks, ...projectToSave } = newProject;
      await setDoc(docRef, projectToSave);
      toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
      return newProject;
    } catch (e) {
      toast.error('Erro ao criar projeto');
      throw e;
    }
  }, []);

  const updateProject = useCallback(async (updated) => {
    if (!isFirebaseConfigured) {
      setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      toast.success('Projeto atualizado (Modo Demo)');
      return;
    }

    try {
      const { id, tasks, ...data } = updated;
      const docRef = doc(db, 'projects', id);
      await updateDoc(docRef, data);
      toast.success('Projeto atualizado.');
    } catch (e) {
      toast.error('Erro ao atualizar projeto');
      throw e;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    if (!isFirebaseConfigured) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Projeto removido (Modo Demo).');
      return;
    }

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      toast.success('Projeto removido.');
    } catch (e) {
      toast.error('Erro ao remover projeto');
      throw e;
    }
  }, []);

  const updateProjectDriveFolderUrl = useCallback(async (projectId, url) => {
    if (!isFirebaseConfigured) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, drive_folder_url: url } : p));
      return;
    }

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
