import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle2, XCircle, AlertCircle, Clock, ExternalLink, Download, MessageSquare, Zap, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
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
        // Obter do localStorage em modo demo
        try {
          const rawTasks = localStorage.getItem('csag_custom_tasks');
          const allTasks = rawTasks ? JSON.parse(rawTasks) : [];
          const foundTask = allTasks.find(t => t.id === taskId) || allTasks[0] || {
            id: taskId,
            title: 'Campanha de Demonstração',
            client: { name: 'Dubola Molhos Especiais' },
            client_name: 'Dubola Molhos Especiais',
            deadline: new Date().toISOString()
          };
          setTask(foundTask);

          const rawDeliv = localStorage.getItem('csag_custom_deliverables');
          const allDeliv = rawDeliv ? JSON.parse(rawDeliv) : [];
          let foundVersions = allDeliv.filter(d => d.task_id === foundTask.id).sort((a, b) => b.version_number - a.version_number);
          
          if (foundVersions.length === 0) {
            foundVersions = [
              {
                id: 'v1',
                task_id: foundTask.id,
                version_number: 1,
                file_name: 'Arte_Campanha_Oficial_v1.png',
                file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
                status: 'pendente'
              }
            ];
          }
          setVersions(foundVersions);
        } catch (e) {
          console.warn(e);
        }
        setLoading(false);
        return;
      }

      try {
        let taskData = null;
        let versionsData = null;

        if (isSupabaseConfigured && supabase) {
          try {
            const { data: remoteTask } = await supabase
              .from('tasks')
              .select('*, client:clients(name)')
              .eq('id', taskId)
              .single();
            taskData = remoteTask;

            const { data: remoteVersions } = await supabase
              .from('task_deliverables')
              .select('*')
              .eq('task_id', taskId)
              .order('version_number', { ascending: false });
            versionsData = remoteVersions;
          } catch (e) {
            console.warn('Erro ao consultar Supabase em PublicApprovalView:', e);
          }
        }

        // Fallback robusto para localStorage caso não esteja no Supabase
        if (!taskData) {
          const rawTasks = localStorage.getItem('csag_custom_tasks');
          if (rawTasks) {
            const allTasks = JSON.parse(rawTasks);
            taskData = allTasks.find(t => t.id === taskId) || null;
          }
        }

        if (!versionsData || versionsData.length === 0) {
          const rawDeliv = localStorage.getItem('csag_custom_deliverables') || localStorage.getItem('csag_deliverables_v2');
          if (rawDeliv) {
            const allDeliv = JSON.parse(rawDeliv);
            versionsData = allDeliv.filter(d => d.task_id === taskId);
          }
          if ((!versionsData || versionsData.length === 0) && taskData) {
            versionsData = [{
              id: `deliv-${taskData.id}`,
              task_id: taskData.id,
              version_number: 1,
              file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
              file_name: taskData.title || 'Peça Criativa',
              status: taskData.status === 'concluido' ? 'aprovado' : (taskData.status === 'ajustes' ? 'ajustes' : 'pendente'),
              created_at: taskData.created_at || new Date().toISOString()
            }];
          }
        }

        setTask(taskData);
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
      toast.error('Por favor, adicione uma nota explicando os ajustes necessários.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Atualizar no estado local
      setVersions(prev => prev.map(v => v.id === versionId ? { ...v, status, client_comment: comment } : v));

      // 2. Atualizar em localStorage para manter tudo sincronizado
      try {
        const rawDeliv = localStorage.getItem('csag_custom_deliverables');
        if (rawDeliv) {
          const allDeliv = JSON.parse(rawDeliv);
          const updatedDeliv = allDeliv.map(d => d.id === versionId ? { ...d, status, client_comment: comment } : d);
          localStorage.setItem('csag_custom_deliverables', JSON.stringify(updatedDeliv));
        }

        const rawTasks = localStorage.getItem('csag_custom_tasks');
        if (rawTasks) {
          const allTasks = JSON.parse(rawTasks);
          const nextStatus = status === 'aprovado' ? 'concluido' : 'ajustes';
          const updatedTasks = allTasks.map(t => {
            if (t.id === (task?.id || taskId)) {
              const comments = t.comments || [];
              if (comment) {
                comments.push({
                  id: `comment-${Date.now()}`,
                  author_name: task?.client?.name || 'Cliente (Link Público)',
                  content: `**Decisão do Cliente:** ${status.toUpperCase()}\n${comment}`,
                  created_at: new Date().toISOString()
                });
              }
              return { ...t, status: nextStatus, comments };
            }
            return t;
          });
          localStorage.setItem('csag_custom_tasks', JSON.stringify(updatedTasks));
        }
      } catch (e) {
        console.warn(e);
      }

      // 3. Se Supabase estiver configurado, salvar no banco
      if (isSupabaseConfigured) {
        await supabase
          .from('task_deliverables')
          .update({ 
            status, 
            client_comment: comment,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', versionId);

        const nextTaskStatus = status === 'aprovado' ? 'concluido' : 'ajustes';
        await supabase
          .from('tasks')
          .update({ 
            status: nextTaskStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        const reviewComment = status === 'aprovado'
          ? `🎉 O cliente APROVOU o material pelo link público.`
          : `💬 O cliente solicitou AJUSTES pelo link público. Feedback: "${comment}"`;

        await supabase
          .from('task_comments')
          .insert({
            task_id: taskId,
            content: reviewComment,
            author_name: task.client?.name || 'Cliente',
            is_ai: false
          });
      }

      setShowCommentForm(null);
      setComment('');
      if (status === 'aprovado') {
        toast.success('🎉 Material aprovado com sucesso!');
      } else {
        toast.success('Feedback de ajustes enviado para a agência!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar avaliação: ' + err.message);
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
        <p className="text-cs-text-secondary">Não encontramos o material solicitado. Entre em contato com a equipe da agência.</p>
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
              <Zap size={24} className="text-black font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Portal de Aprovação Segura</h1>
              <p className="text-[10px] text-cs-text-secondary uppercase tracking-widest font-bold">Comunicação Social Ag</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{task.client?.name || task.client_name}</p>
            <p className="text-[10px] text-cs-text-secondary truncate max-w-xs">{task.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Area: Latest Deliverable */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-cs-primary uppercase tracking-[0.2em]">Material para Avaliação do Cliente</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">{task.title}</h2>
              {task.description && (
                <p className="text-sm text-cs-text-secondary leading-relaxed">{task.description}</p>
              )}
            </div>

            {!latestVersion ? (
              <div className="p-12 border-2 border-dashed border-cs-border rounded-3xl text-center bg-cs-surface/20">
                <Clock size={48} className="mx-auto text-cs-text-secondary mb-4 opacity-20" />
                <p className="text-cs-text-secondary font-medium">Aguardando o envio da peça pela equipe de criação.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Preview Card */}
                <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden shadow-2xl group transition-all hover:border-cs-primary/30">
                  <div className="aspect-video bg-cs-bg flex items-center justify-center relative overflow-hidden">
                    {latestVersion.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || latestVersion.file_url?.includes('unsplash') ? (
                      <img src={latestVersion.file_url} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-8">
                         <Download size={64} className="mx-auto text-cs-primary mb-4 opacity-50" />
                         <p className="text-sm text-cs-text-secondary">Visualizar entregável em formato externo</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-t from-cs-surface to-transparent">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest">Versão {latestVersion.version_number}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase bg-cs-bg border border-cs-border text-cs-primary">
                          {latestVersion.version_number === 1 ? 'Entrega Original' :
                           latestVersion.version_number === 2 ? '1ª Rodada de Ajustes' :
                           latestVersion.version_number === 3 ? '2ª Rodada de Ajustes' :
                           `Ajuste Excedente (${latestVersion.version_number}ª rodada)`}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">{latestVersion.file_name || 'Entregável de Criação'}</p>
                    </div>
                    <a 
                      href={latestVersion.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-white hover:bg-cs-primary hover:text-black text-black px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xl shrink-0"
                    >
                      <ExternalLink size={16} /> VER ARQUIVO ORIGINAL
                    </a>
                  </div>
                </div>

                {/* Status-specific messaging */}
                {latestVersion.status === 'aprovado' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4 animate-in zoom-in-95">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 text-black">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-400">Este material foi APROVADO com sucesso!</p>
                      <p className="text-xs text-green-400/70">A equipe de produção já recebeu a confirmação para publicação.</p>
                    </div>
                  </div>
                )}

                {(latestVersion.status === 'ajustes' || latestVersion.status === 'reprovado') && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 animate-in zoom-in-95">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-400">Ajustes solicitados nesta versão</p>
                      <p className="text-xs text-red-400/80 mt-0.5">{latestVersion.client_comment || 'A equipe está aplicando as alterações solicitadas.'}</p>
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
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Sua Decisão</h3>
                
                {showCommentForm ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest">Descreva os ajustes necessários *</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ex: Por favor trocar a imagem de fundo e ajustar o texto da data..."
                      className="w-full bg-cs-bg border border-cs-border rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cs-primary h-32 resize-none leading-relaxed"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleReview(latestVersion.id, 'reprovado')}
                        disabled={submitting}
                        className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                      >
                        REPROVAR
                      </button>
                      <button 
                        onClick={() => handleReview(latestVersion.id, 'com_ressalvas')}
                        disabled={submitting}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black text-[10px] font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50"
                      >
                        RESSALVAS
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowCommentForm(null)}
                      className="w-full text-[10px] font-bold text-cs-text-secondary hover:text-white transition-colors py-2 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft size={12} /> Voltar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleReview(latestVersion.id, 'aprovado')}
                      disabled={submitting}
                      className="w-full bg-cs-primary hover:bg-cs-primary-hover text-black font-black py-4 rounded-2xl text-xs shadow-xl shadow-cs-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-wider"
                    >
                      <CheckCircle2 size={18} /> APROVAR ESTA PEÇA
                    </button>
                    <button 
                      onClick={() => setShowCommentForm('reprovar')}
                      disabled={submitting}
                      className="w-full bg-cs-bg border border-cs-border hover:border-red-500/50 text-white py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-wider"
                    >
                      <MessageSquare size={16} /> SOLICITAR AJUSTES
                    </button>
                    <p className="text-[10px] text-cs-text-secondary text-center leading-relaxed px-2">
                      Ao aprovar, a agência recebe autorização para publicação imediata.
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
