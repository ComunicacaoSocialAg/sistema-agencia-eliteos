import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

const DEFAULT_DEMO_DELIVERABLES = [
  {
    id: 'deliv-1',
    task_id: 'task-alberto-1',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Carrossel_VarizesLaser_v1.png',
    status: 'pendente',
    client_comment: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'deliv-2',
    task_id: 'task-dubola-1',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Manual_Identidade_Visual_Dubola_v1.pdf',
    status: 'aprovado',
    client_comment: 'Excelente! Aprovado pela diretoria.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'deliv-3',
    task_id: 'task-alberto-2',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Reels_DopplerVascular_v1.mp4',
    status: 'pendente',
    client_comment: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'deliv-4',
    task_id: 'task-dubola-2',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Banner_Lancamento_Molho_Defumado_v1.png',
    status: 'ajustes',
    client_comment: 'Por favor aumentar o destaque do selo artesanal e o selo sem glúten.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

function getStoredDeliverables() {
  try {
    const raw = localStorage.getItem('csag_custom_deliverables');
    if (!raw) {
      localStorage.setItem('csag_custom_deliverables', JSON.stringify(DEFAULT_DEMO_DELIVERABLES));
      return DEFAULT_DEMO_DELIVERABLES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_DELIVERABLES;
  }
}

function saveStoredDeliverables(items) {
  try {
    localStorage.setItem('csag_custom_deliverables', JSON.stringify(items));
  } catch (e) {
    console.warn('Erro ao salvar entregáveis:', e);
  }
}

export function useDeliverables(taskId) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);

    if (!isSupabaseConfigured) {
      const all = getStoredDeliverables();
      const filtered = all.filter(d => d.task_id === taskId).sort((a, b) => b.version_number - a.version_number);
      setVersions(filtered);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('task_deliverables')
        .select(`*`)
        .eq('task_id', taskId)
        .order('version_number', { ascending: false });

      if (error) {
        // Fallback to local storage
        const all = getStoredDeliverables();
        const filtered = all.filter(d => d.task_id === taskId).sort((a, b) => b.version_number - a.version_number);
        setVersions(filtered);
      } else {
        setVersions(data || []);
      }
    } catch {
      const all = getStoredDeliverables();
      const filtered = all.filter(d => d.task_id === taskId).sort((a, b) => b.version_number - a.version_number);
      setVersions(filtered);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const uploadVersion = async (fileOrLink, uploadedBy = 'Equipe CS Ag') => {
    const isLink = typeof fileOrLink === 'string';
    const fileName = isLink ? (fileOrLink.startsWith('http') ? fileOrLink : 'Link Externo') : fileOrLink.name;
    let finalUrl = '';

    if (!isSupabaseConfigured) {
      // Demo mode fallback
      finalUrl = isLink ? fileOrLink : (typeof URL !== 'undefined' && fileOrLink instanceof Blob ? URL.createObjectURL(fileOrLink) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
      const all = getStoredDeliverables();
      const existingTaskVersions = all.filter(d => d.task_id === taskId);
      const nextVersionNum = existingTaskVersions.length + 1;

      const mockVersion = {
        id: `deliv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        task_id: taskId,
        version_number: nextVersionNum,
        file_url: finalUrl,
        file_name: fileName,
        status: 'pendente',
        uploaded_by: uploadedBy,
        created_at: new Date().toISOString()
      };

      const updated = [mockVersion, ...all];
      saveStoredDeliverables(updated);
      setVersions(prev => [mockVersion, ...prev]);

      // Atualizar status da tarefa para 'aguardando-cliente' no localStorage
      try {
        const rawTasks = localStorage.getItem('csag_custom_tasks');
        if (rawTasks) {
          const tasks = JSON.parse(rawTasks);
          const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'aguardando-cliente' } : t);
          localStorage.setItem('csag_custom_tasks', JSON.stringify(updatedTasks));
        }
      } catch (e) {
        console.warn(e);
      }

      toast.success(`Entregável v${nextVersionNum} enviado para aprovação!`);
      return mockVersion;
    }

    try {
      setLoading(true);

      if (isLink) {
        finalUrl = fileOrLink;
      } else {
        const fileExt = fileOrLink.name.split('.').pop();
        const uploadName = `${taskId}/deliverables/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('deliverables')
          .upload(uploadName, fileOrLink);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('deliverables')
          .getPublicUrl(uploadName);
        
        finalUrl = publicUrl;
      }

      const { data: versionData, error: versionError } = await supabase
        .from('task_deliverables')
        .insert({
          task_id: taskId,
          version_number: versions.length + 1,
          file_url: finalUrl,
          file_name: fileName,
          uploaded_by: uploadedBy,
          status: 'pendente'
        })
        .select()
        .single();

      if (versionError) throw versionError;

      setVersions(prev => [versionData, ...prev]);
      toast.success('Entregável enviado para aprovação!');
      return versionData;
    } catch (err) {
      console.error('Upload error:', err);
      // Fallback local
      finalUrl = isLink ? fileOrLink : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
      const all = getStoredDeliverables();
      const mockVersion = {
        id: `deliv-${Date.now()}`,
        task_id: taskId,
        version_number: versions.length + 1,
        file_url: finalUrl,
        file_name: fileName,
        status: 'pendente',
        uploaded_by: uploadedBy,
        created_at: new Date().toISOString()
      };
      saveStoredDeliverables([mockVersion, ...all]);
      setVersions(prev => [mockVersion, ...prev]);
      toast.success('Entregável registrado em modo seguro local!');
      return mockVersion;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (versionId, status, comment, reviewerId) => {
    // 1. Atualizar no estado local do hook
    setVersions(prev => prev.map(v => v.id === versionId ? { ...v, status, client_comment: comment } : v));

    // 2. Atualizar no localStorage
    const all = getStoredDeliverables();
    const updatedDeliverables = all.map(d => d.id === versionId ? { ...d, status, client_comment: comment, reviewed_at: new Date().toISOString() } : d);
    saveStoredDeliverables(updatedDeliverables);

    // 3. Atualizar status da Tarefa correspondente
    try {
      const rawTasks = localStorage.getItem('csag_custom_tasks');
      if (rawTasks) {
        const tasks = JSON.parse(rawTasks);
        const targetStatus = status === 'aprovado' ? 'finalizado' : 'ajustes';
        const updatedTasks = tasks.map(t => {
          if (t.id === taskId) {
            const comments = t.comments || [];
            if (comment) {
              comments.push({
                id: `comment-${Date.now()}`,
                author: 'Cliente (Review Center)',
                text: `**Avaliação do Entregável:** ${status.toUpperCase()}\n${comment}`,
                date: 'Agora',
                is_system: true
              });
            }
            return { ...t, status: targetStatus, comments };
          }
          return t;
        });
        localStorage.setItem('csag_custom_tasks', JSON.stringify(updatedTasks));
      }
    } catch (e) {
      console.warn(e);
    }

    // 4. Se Supabase ativo, sincronizar no banco
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('task_deliverables')
          .update({
            status,
            client_comment: comment,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', versionId);

        if (status === 'aprovado') {
          await supabase.from('tasks').update({ status: 'finalizado' }).eq('id', taskId);
        } else if (status === 'reprovado' || status === 'com_ressalvas') {
          await supabase.from('tasks').update({ status: 'ajustes' }).eq('id', taskId);
          if (comment) {
            await supabase.from('task_comments').insert({
              task_id: taskId,
              content: `**Feedback de Ajuste (Cliente):**\n${comment}`,
              author_name: 'Cliente',
              is_system: false
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao sincronizar com Supabase:', err);
      }
    }

    if (status === 'aprovado') {
      toast.success('🎉 Entregável APROVADO! Tarefa concluída.');
    } else {
      toast.success('Feedback de ajuste enviado para a equipe de criação!');
    }
  };

  return { versions, loading, fetchVersions, uploadVersion, updateStatus };
}

export function getAllDeliverables() {
  return getStoredDeliverables();
}

export function useAllDeliverables() {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      const items = getStoredDeliverables();
      setDeliverables(items);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('task_deliverables')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) {
        setDeliverables(getStoredDeliverables());
      } else {
        setDeliverables(data);
      }
    } catch {
      setDeliverables(getStoredDeliverables());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateDeliverableStatus = async (versionId, taskId, status, comment = '') => {
    // 1. Atualizar localStorage
    const all = getStoredDeliverables();
    const updated = all.map(d => d.id === versionId ? { ...d, status, client_comment: comment, reviewed_at: new Date().toISOString() } : d);
    saveStoredDeliverables(updated);
    setDeliverables(updated);

    // 2. Atualizar tarefas
    try {
      const rawTasks = localStorage.getItem('csag_custom_tasks');
      if (rawTasks) {
        const tasks = JSON.parse(rawTasks);
        const targetStatus = status === 'aprovado' ? 'finalizado' : 'ajustes';
        const updatedTasks = tasks.map(t => {
          if (t.id === taskId) {
            const comments = t.comments || [];
            if (comment) {
              comments.push({
                id: `comment-${Date.now()}`,
                author: 'Equipe (Review Center)',
                text: `**Avaliação do Entregável:** ${status.toUpperCase()}\n${comment}`,
                date: 'Agora',
                is_system: true
              });
            }
            return { ...t, status: targetStatus, comments };
          }
          return t;
        });
        localStorage.setItem('csag_custom_tasks', JSON.stringify(updatedTasks));
      }
    } catch (e) {
      console.warn(e);
    }

    // 3. Supabase sync se disponível
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('task_deliverables')
          .update({
            status,
            client_comment: comment,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', versionId);

        if (status === 'aprovado') {
          await supabase.from('tasks').update({ status: 'finalizado' }).eq('id', taskId);
        } else {
          await supabase.from('tasks').update({ status: 'ajustes' }).eq('id', taskId);
        }
      } catch (err) {
        console.warn('Erro ao sincronizar com Supabase:', err);
      }
    }

    if (status === 'aprovado') {
      toast.success('🎉 Entregável APROVADO com sucesso!');
    } else {
      toast.success('Entregável marcado para AJUSTES.');
    }
  };

  const addDeliverable = async ({ taskId, fileOrUrl, fileName, versionNumber }) => {
    const isLink = typeof fileOrUrl === 'string';
    const finalName = fileName || (isLink ? 'Link Externo' : 'Novo Arquivo');
    const finalUrl = isLink ? fileOrUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
    
    const newDeliverable = {
      id: `deliv-${Date.now()}`,
      task_id: taskId,
      version_number: versionNumber || 1,
      file_url: finalUrl,
      file_name: finalName,
      status: 'pendente',
      client_comment: null,
      created_at: new Date().toISOString()
    };

    const all = getStoredDeliverables();
    const updated = [newDeliverable, ...all];
    saveStoredDeliverables(updated);
    setDeliverables(updated);

    // Update task status
    try {
      const rawTasks = localStorage.getItem('csag_custom_tasks');
      if (rawTasks) {
        const tasks = JSON.parse(rawTasks);
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'aguardando-cliente' } : t);
        localStorage.setItem('csag_custom_tasks', JSON.stringify(updatedTasks));
      }
    } catch (e) {
      console.warn(e);
    }

    toast.success('🚀 Novo entregável enviado para o Review Center!');
    return newDeliverable;
  };

  return { deliverables, loading, refresh, updateDeliverableStatus, addDeliverable };
}
