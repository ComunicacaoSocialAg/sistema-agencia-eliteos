import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle2, XCircle, AlertCircle, Clock, ExternalLink, Download, MessageSquare, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../utils/cn';

export default function PublicApprovalView() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) {
        // Mock data for demo testing
        setTask({
          id: taskId,
          title: 'Campanha de Demonstração',
          client: { name: 'Alpha Tech (Demo)' },
          deadline: new Date().toISOString()
        });
        setVersions([
          {
            id: 'v1',
            version_number: 1,
            file_name: 'layout_v1.png',
            file_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            status: 'pendente'
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        // Fetch Task
        const { data: taskData } = await supabase
          .from('tasks')
          .select('*, client:clients(name)')
          .eq('id', taskId)
          .single();
        
        setTask(taskData);

        // Fetch Deliverables
        const { data: versionsData } = await supabase
          .from('task_deliverables')
          .select('*')
          .eq('task_id', taskId)
          .order('version_number', { ascending: false });
        
        setVersions(versionsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [taskId]);

  const handleReview = async (versionId, status) => {
    if ((status === 'reprovado' || status === 'com_ressalvas') && !comment.trim()) {
      alert('Por favor, adicione um comentário explicando os ajustes necessários.');
      return;
    }

    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        setVersions(prev => prev.map(v => v.id === versionId ? { ...v, status, client_comment: comment } : v));
        setSubmitting(false);
        setShowCommentForm(null);
        setComment('');
        alert(`[Demo Mode] Avaliação recebida! O status do entregável foi definido como "${status}".`);
        return;
      }

      // 1. Atualizar o status do entregável
      const { error } = await supabase
        .from('task_deliverables')
        .update({ 
          status, 
          client_comment: comment,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', versionId);

      if (error) throw error;

      // 2. Mover o status da tarefa pai
      const nextTaskStatus = status === 'aprovado' ? 'concluido' : 'ajustes';
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: nextTaskStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskError) {
        console.error('Erro ao atualizar status da tarefa pai:', taskError);
      }

      // 3. Adicionar comentário automático de revisão na timeline para histórico
      const reviewComment = status === 'aprovado'
        ? `🎉 O cliente APROVOU o material (Versão ${latestVersion?.version_number || 1}).`
        : `💬 O cliente solicitou AJUSTES na Versão ${latestVersion?.version_number || 1}. Feedback: "${comment}"`;

      const { error: commentError } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          content: reviewComment,
          author_name: task.client?.name || 'Cliente',
          is_ai: false
        });

      if (commentError) {
        console.error('Erro ao registrar comentário de revisão:', commentError);
      }

      // Update local state
      setVersions(prev => prev.map(v => v.id === versionId ? { ...v, status, client_comment: comment } : v));
      setShowCommentForm(null);
      setComment('');
      
      alert('Avaliação enviada com sucesso! O painel interno da agência foi atualizado em tempo real.');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar avaliação: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cs-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cs-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-cs-bg flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-red-500 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-white mb-2">Link Inválido ou Expirado</h1>
        <p className="text-cs-text-secondary">Não encontramos o material solicitado. Entre em contato com a agência.</p>
      </div>
    );
  }

  const latestVersion = versions[0];

  return (
    <div className="min-h-screen bg-cs-bg text-white font-sans selection:bg-cs-primary selection:text-white">
      {/* Header */}
      <header className="border-b border-cs-border bg-cs-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cs-primary rounded-xl flex items-center justify-center shadow-lg shadow-cs-primary/20">
              <Zap size={24} className="text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Portal de Aprovação</h1>
              <p className="text-[10px] text-cs-text-secondary uppercase tracking-widest font-bold">Comunicação Social Ag</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{task.client?.name}</p>
            <p className="text-[10px] text-cs-text-secondary">Ref: {task.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Area: Latest Deliverable */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-cs-primary uppercase tracking-[0.2em]">Material para Revisão</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">{task.title}</h2>
            </div>

            {!latestVersion ? (
              <div className="p-12 border-2 border-dashed border-cs-border rounded-3xl text-center bg-cs-surface/20">
                <Clock size={48} className="mx-auto text-cs-text-secondary mb-4 opacity-20" />
                <p className="text-cs-text-secondary font-medium">Aguardando o envio do material pela equipe.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Preview Card */}
                <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden shadow-2xl group transition-all hover:border-cs-primary/30">
                  <div className="aspect-video bg-cs-bg flex items-center justify-center relative overflow-hidden">
                    {/* Simulating a preview - in a real app you'd check file type */}
                    {latestVersion.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={latestVersion.file_url} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                         <Download size={64} className="mx-auto text-cs-primary mb-4 opacity-50" />
                         <p className="text-sm text-cs-text-secondary">Clique abaixo para visualizar o arquivo</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex items-center justify-between bg-gradient-to-t from-cs-surface to-transparent">
                    <div>
                      <p className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Versão {latestVersion.version_number}</p>
                      <p className="text-sm font-bold text-white">{latestVersion.file_name}</p>
                    </div>
                    <a 
                      href={latestVersion.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-white text-cs-bg hover:bg-cs-primary hover:text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl"
                    >
                      <ExternalLink size={16} /> VER EM TELA CHEIA
                    </a>
                  </div>
                </div>

                {/* Status-specific messaging */}
                {latestVersion.status === 'aprovado' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4 animate-in zoom-in-95">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                      <CheckCircle2 size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-400">Este material já foi APROVADO!</p>
                      <p className="text-xs text-green-400/70">Nossa equipe já foi notificada e seguirá com os próximos passos.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Action & History */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Approval Box */}
            {latestVersion && latestVersion.status === 'pendente' && (
              <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-2xl sticky top-32">
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Sua Avaliação</h3>
                
                {showCommentForm ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest">O que precisa ser ajustado? *</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Descreva aqui os ajustes..."
                      className="w-full bg-cs-bg border border-cs-border rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cs-primary h-32 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleReview(latestVersion.id, 'reprovado')}
                        disabled={submitting}
                        className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                      >
                        REPROVAR
                      </button>
                      <button 
                        onClick={() => handleReview(latestVersion.id, 'com_ressalvas')}
                        disabled={submitting}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50"
                      >
                        RESSALVAS
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowCommentForm(null)}
                      className="w-full text-[10px] font-bold text-cs-text-secondary hover:text-white transition-colors"
                    >
                      VOLTAR
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleReview(latestVersion.id, 'aprovado')}
                      disabled={submitting}
                      className="w-full bg-cs-primary hover:bg-cs-primary-hover text-white py-5 rounded-2xl font-bold text-xs shadow-xl shadow-cs-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} /> APROVAR AGORA
                    </button>
                    <button 
                      onClick={() => setShowCommentForm('reprovar')}
                      disabled={submitting}
                      className="w-full bg-cs-bg border border-cs-border hover:border-red-500/50 text-white py-5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      <MessageSquare size={18} /> SOLICITAR AJUSTES
                    </button>
                    <p className="text-[10px] text-cs-text-secondary text-center leading-relaxed px-4">
                      Ao clicar em aprovar, você confirma que o material está pronto para uso ou publicação.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Versions History */}
            {versions.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest px-2">Histórico de Versões</h3>
                <div className="space-y-2">
                  {versions.slice(1).map(v => (
                    <div key={v.id} className="bg-cs-surface/50 border border-cs-border rounded-2xl p-4 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                      <div>
                        <p className="text-xs font-bold text-white">Versão {v.version_number}</p>
                        <p className="text-[10px] text-cs-text-secondary capitalize">{v.status.replace('_', ' ')}</p>
                      </div>
                      <a href={v.file_url} target="_blank" rel="noreferrer" className="text-cs-text-secondary hover:text-white transition-colors">
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-cs-border mt-12 text-center">
        <p className="text-xs text-cs-text-secondary">
          Sistema Seguro de Aprovação • {new Date().getFullYear()} Comunicação Social Ag
        </p>
      </footer>
    </div>
  );
}
