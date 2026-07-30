import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useDeliverables(taskId) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!taskId || !isSupabaseConfigured) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('task_deliverables')
      .select(`*`)
      .eq('task_id', taskId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
    } else {
      setVersions(data);
    }
    setLoading(false);
  }, [taskId]);

  const uploadVersion = async (fileOrLink, uploadedBy) => {
    const isLink = typeof fileOrLink === 'string';
    const fileName = isLink ? 'Link Externo' : fileOrLink.name;
    let finalUrl = '';

    if (!isSupabaseConfigured) {
      // Demo mode fallback
      finalUrl = isLink ? fileOrLink : URL.createObjectURL(fileOrLink);
      const mockVersion = {
        id: crypto.randomUUID(),
        task_id: taskId,
        version_number: versions.length + 1,
        file_url: finalUrl,
        file_name: fileName,
        status: 'pendente',
        created_at: new Date().toISOString()
      };
      setVersions(prev => [mockVersion, ...prev]);
      toast.success('Entregável enviado com sucesso (Demo)');
      return;
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
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao enviar entregável: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (versionId, status, comment, reviewerId) => {
    setVersions(prev => prev.map(v => v.id === versionId ? { ...v, status, client_comment: comment } : v));

    if (!isSupabaseConfigured) {
      toast.success('Status atualizado (Demo)');
      return;
    }

    const { error } = await supabase
      .from('task_deliverables')
      .update({
        status,
        client_comment: comment,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', versionId);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Avaliação enviada com sucesso!');
      
      // Automation: Update Task status based on version approval
      if (status === 'aprovado') {
        await supabase.from('tasks').update({ status: 'concluido' }).eq('id', taskId);
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
    }
  };

  return { versions, loading, fetchVersions, uploadVersion, updateStatus };
}
