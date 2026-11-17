import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ApprovalFlow from '../components/ApprovalFlow';
import { ExternalLink, CheckCircle2, Clock } from 'lucide-react';

export default function PublicApprovalView() {
  const { taskId } = useParams();
  const { user, signOut } = useAuth();
  const { allTasks } = useTasks(undefined, { showArchived: true });
  const localMatch = allTasks?.find(item => item.id === taskId) || null;

  const [publicTask, setPublicTask] = useState(localMatch);
  const [loading, setLoading] = useState(!localMatch);
  const [error, setError] = useState('');

  const fetchPublicTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: rpcErr } = await supabase.rpc('get_public_approval_task', {
          p_task_id: taskId,
        });
        if (rpcErr) throw rpcErr;
        if (data?.id) {
          setPublicTask(data);
          setLoading(false);
          return;
        }
      }
      if (localMatch) {
        setPublicTask(localMatch);
      } else {
        setError('Esta entrega não foi encontrada ou o link está incompleto.');
      }
    } catch {
      if (localMatch) {
        setPublicTask(localMatch);
      } else {
        setError('Não foi possível abrir a página de aprovação.');
      }
    } finally {
      setLoading(false);
    }
  }, [taskId, localMatch]);

  useEffect(() => {
    fetchPublicTask();
  }, [fetchPublicTask]);

  const task = publicTask || localMatch;
  const externalLinks = Array.isArray(task?.external_links) ? task.external_links : [];

  return (
    <main className="min-h-screen bg-[#090b0e] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c222c] pb-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=4" alt="Comunicação Social Ag" className="h-9 object-contain" />
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Central de Aprovação de Entregas
              </p>
              <p className="text-xs text-zinc-400">
                Comunicação Social Ag · Revisão direta sem necessidade de login
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4 text-xs">
              <Link className="text-amber-400 hover:underline font-semibold" to="/">
                Voltar ao painel da agência
              </Link>
              <button type="button" className="text-zinc-400 hover:text-white underline" onClick={signOut}>
                Sair
              </button>
            </div>
          )}
        </header>

        {loading ? (
          <div role="status" className="rounded-2xl border border-[#1e2430] bg-[#11141b] p-8 text-center text-sm text-zinc-300">
            Carregando material para revisão...
          </div>
        ) : error || !task ? (
          <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-300 space-y-3">
            <p>{error || 'Esta aprovação não está disponível.'}</p>
            <button
              type="button"
              className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs text-white hover:bg-red-500/10"
              onClick={fetchPublicTask}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#1e2430] bg-[#11141b] p-6 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: task.brand_color || '#f59e0b' }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    {task.client_name || task.client?.name || 'Cliente CS Ag'}
                  </span>
                  {task.tag && (
                    <span className="rounded bg-[#181d26] px-2 py-0.5 text-[11px] font-mono text-zinc-300 border border-[#252c3a]">
                      {task.tag}
                    </span>
                  )}
                </div>

                {task.deadline && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                    <Clock size={13} />
                    Prazo previsto: {task.deadline}
                  </span>
                )}
              </div>

              <h1 className="break-words text-xl sm:text-2xl font-bold text-white leading-snug">
                {task.title}
              </h1>

              {(task.notes || task.description) && (
                <div className="rounded-xl border border-[#1e2430] bg-[#0b0e14] p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  <strong className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Briefing / Observações da Entrega:
                  </strong>
                  {task.notes || task.description}
                </div>
              )}

              {externalLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {externalLinks.map((lnk, idx) => (
                    lnk?.url && (
                      <a
                        key={idx}
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
                      >
                        <span>Abrir {lnk.name || 'Link da Entrega / Site'}</span>
                        <ExternalLink size={14} />
                      </a>
                    )
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#1e2430] bg-[#11141b] p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Versões e Decisão de Aprovação
                </h2>
              </div>
              <ApprovalFlow key={task.id} taskId={task.id} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
