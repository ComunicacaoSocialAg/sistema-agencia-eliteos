import React, { useState, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useFocusTasks } from '../hooks/useFocusTasks';
import { useTasks } from '../hooks/useTasks';
import { areIdsMatching, useClients } from '../hooks/useClients';
import { useDeals } from '../hooks/useDeals';
import { copyApprovalUrl, getPublicAppOrigin } from '../hooks/useDeliverables';
import { operationId } from '../lib/operationId';
import TaskModal from '../components/TaskModal';
import {
  Zap,
  CheckCircle2,
  PauseCircle,
  ArrowRight,
  FolderOpen,
  MessageSquare,
  Clock,
  Database,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Share2,
  FileCheck2,
  Target,
  SlidersHorizontal,
} from 'lucide-react';

export default function FocusActionView() {
  const {
    tasks: activeTasks,
    clients,
    activeTask,
    loading: tasksLoading,
    remoteMode,
    isSubmitting,
    createQuickDemand,
    completeActiveTask,
    pauseActiveTask,
    setTaskToFocus,
  } = useFocusTasks();

  const { allTasks, updateTask, addComment, toggleChecklist, createTask } = useTasks(undefined, { showArchived: false });
  const { totalMRR } = useClients();
  const { deals } = useDeals();

  const scheduleFollowUp = async (task, deadline) => {
    const client = clients.find(item =>
      areIdsMatching(item.id, task.client_id, item.name, task.client_name));
    if (!client) {
      toast.error('Vincule a tarefa a um cliente antes de marcar o acompanhamento.');
      return null;
    }
    return createTask({
      id: await operationId(`acompanhamento-${task.id}-${deadline}`, remoteMode),
      title: `Acompanhar: ${task.title}`,
      client_id: client.id,
      client_name: client.name,
      deadline,
      status: 'backlog',
      tag: task.tag,
      notes: `Acompanhamento da entrega "${task.title}".`,
      external_links: (task.external_links || []).filter(link => link?.kind === 'delivery'),
    });
  };

  const [demandText, setDemandText] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedTag, setSelectedTag] = useState('Social Media');
  const [modalTaskId, setModalTaskId] = useState(null);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [lastPersistedAt, setLastPersistedAt] = useState(null);
  const inputRef = useRef(null);

  const waitingApprovalTasks = useMemo(
    () => (activeTasks || []).filter(t => t.status === 'aguardando-cliente'),
    [activeTasks]
  );

  const productionQueue = useMemo(
    () => (activeTasks || []).filter(t => t.status !== 'aguardando-cliente'),
    [activeTasks]
  );

  const modalTask = useMemo(
    () => (allTasks || []).find(t => t.id === modalTaskId) || null,
    [allTasks, modalTaskId]
  );

  const nextProspect = useMemo(
    () => (deals || []).find(d => d.status !== 'ganho' && d.status !== 'perdido') || null,
    [deals]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitDemand();
    }
  };

  const handleSubmitDemand = async () => {
    if (!demandText.trim() || isSubmitting) return;
    const t0 = performance.now();
    const created = await createQuickDemand({
      title: demandText.trim(),
      clientId: selectedClientId || clients[0]?.id || '',
      deadline: deadline || null,
      priority: selectedTag === 'Urgente' ? 'high' : 'medium',
      tag: selectedTag === 'Urgente' ? 'Campanha' : selectedTag,
    });
    if (created) {
      const ms = Math.round(performance.now() - t0);
      setLastPersistedAt({
        time: new Date().toLocaleTimeString('pt-BR'),
        ms,
      });
      setDemandText('');
      setDeadline('');
    }
  };

  const handleCopyApproval = async (taskId) => {
    try {
      await copyApprovalUrl(taskId);
      toast.success('Link público de aprovação copiado! Cole no WhatsApp do cliente.');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const effectiveClientId = activeTask?.client_id || selectedClientId || clients[0]?.id;
  const currentClient = clients.find(c => c.id === effectiveClientId);
  const driveLink =
    currentClient?.drive_url ||
    `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(currentClient?.name || 'CS Ag')}`;

  return (
    <div className="h-full overflow-y-auto bg-[#090b0e] text-[#f1f3f7] p-6 lg:p-10 font-sans selection:bg-amber-500/20">
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1c222c] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${remoteMode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                {remoteMode ? 'Supabase Sincronizado em Tempo Real' : 'Modo Local'}
              </span>
              {lastPersistedAt && (
                <span className="text-[11px] font-mono text-zinc-400">
                  · Gravado às {lastPersistedAt.time} ({lastPersistedAt.ms}ms)
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Direção do Dia · Cockpit da Agência
            </h1>
            <p className="text-sm text-zinc-300 mt-1">
              Seu trabalho, seu contexto e sua próxima ação em uma única tela.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-[#12161f] border border-[#202735] text-xs font-mono text-zinc-200 flex items-center gap-2">
              <Database size={13} className="text-amber-400" />
              <span>{productionQueue.length} em fila</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#12161f] border border-[#202735] text-xs font-mono text-amber-300 flex items-center gap-2">
              <FileCheck2 size={13} className="text-amber-400" />
              <span>{waitingApprovalTasks.length} em aprovação</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#12161f] border border-[#202735] text-xs font-mono text-emerald-300 flex items-center gap-2">
              <span>MRR Ativo: R$ {totalMRR.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </header>

        {/* BLOCO 1: Caixa de Entrada Universal */}
        <section className="bg-[#11141b] border border-[#1e2430] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="universal-inbox-input"
              className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5"
            >
              <Zap size={14} />
              Caixa de Entrada Universal (Captura Instantânea)
            </label>
            <span className="text-[11px] font-mono text-zinc-400">
              Digite e pressione Enter para registrar
            </span>
          </div>

          <div className="space-y-3">
            <input
              id="universal-inbox-input"
              ref={inputRef}
              type="text"
              value={demandText}
              onChange={(e) => setDemandText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Cole um pedido de WhatsApp, ajuste de peça, link de site ou pauta..."
              className="w-full bg-[#0a0d12] border border-[#232a38] focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-3.5 text-sm lg:text-base text-white placeholder:text-zinc-500 outline-none transition-all"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <label htmlFor="quick-client-select" className="text-xs text-zinc-300">Cliente</label>
                  <select
                    id="quick-client-select"
                    value={selectedClientId || clients[0]?.id || ''}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="bg-[#161a23] border border-[#252c3a] text-xs text-zinc-200 rounded-lg px-3 py-1.5 outline-none focus:border-amber-500 transition-colors"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="quick-deadline-input" className="text-xs text-zinc-300">Prazo</label>
                  <input
                    id="quick-deadline-input"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-[#161a23] border border-[#252c3a] text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 ml-1">
                  {['Social Media', 'Branding', 'Web', 'Vídeo', 'Campanha', 'Urgente'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#151922] text-zinc-300 border border-transparent hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitDemand}
                disabled={isSubmitting || !demandText.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-xs tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Gravando...</span>
                  </>
                ) : (
                  <>
                    <span>Salvar demanda</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* BLOCO 2: Card da Próxima Ação (Uma Ação em Foco Absoluto) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              O Que Fazer Agora (Foco Principal)
            </h2>
            {activeTask && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Status: {activeTask.status}
              </span>
            )}
          </div>

          {tasksLoading ? (
            <div className="bg-[#11141b] border border-[#1e2430] rounded-2xl p-10 text-center text-zinc-400 text-sm animate-pulse">
              Sincronizando demandas ativas...
            </div>
          ) : activeTask ? (
            <div className="bg-[#12161f] border-2 border-emerald-500/30 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentClient?.brand_color || '#3b82f6' }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {currentClient?.name || activeTask.client_name || 'Cliente CS Ag'}
                  </span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-xs font-mono text-zinc-300">
                    {activeTask.tag || 'Geral'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                  <Clock size={13} className="text-zinc-400" />
                  <span>Prazo: {activeTask.deadline || 'Sem prazo'}</span>
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 leading-snug">
                {activeTask.title}
              </h3>

              {(activeTask.notes || activeTask.description) && (
                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2430] text-xs text-zinc-300 mb-6 whitespace-pre-wrap leading-relaxed">
                  <strong className="text-zinc-200 block mb-1">Contexto, Briefing & Histórico:</strong>
                  {activeTask.notes || activeTask.description}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 mb-8 pt-3 border-t border-[#1c222c]">
                <button
                  type="button"
                  onClick={() => setModalTaskId(activeTask.id)}
                  className="px-3.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal size={14} />
                  <span>Abrir Ficha / Subir Peça ou Site para Aprovação</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyApproval(activeTask.id)}
                  className="px-3.5 py-2 rounded-lg bg-[#181d26] hover:bg-[#202735] text-xs text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 border border-[#252c3a] cursor-pointer"
                >
                  <Share2 size={14} className="text-emerald-400" />
                  <span>Copiar Link de Aprovação (/aprovar)</span>
                </button>

                <a
                  href={driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#181d26] hover:bg-[#202735] text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 border border-[#252c3a]"
                >
                  <FolderOpen size={14} className="text-amber-400" />
                  <span>Google Drive do Cliente</span>
                  <ExternalLink size={11} className="text-zinc-500" />
                </a>

                {currentClient?.contact_phone && (
                  <a
                    href={`https://wa.me/55${currentClient.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá, ${currentClient.contact_name || ''}! Segue o link para aprovação da entrega "${activeTask.title}":\n\n${getPublicAppOrigin()}/aprovar/${activeTask.id}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-[#181d26] hover:bg-[#202735] text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 border border-[#252c3a]"
                  >
                    <MessageSquare size={14} className="text-emerald-400" />
                    <span>Enviar no WhatsApp ({currentClient.contact_name || 'Cliente'})</span>
                    <ExternalLink size={11} className="text-zinc-500" />
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#1c222c]">
                <button
                  type="button"
                  onClick={() => completeActiveTask(activeTask.id)}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <CheckCircle2 size={18} />
                  <span>Concluir e Puxar Próxima</span>
                </button>

                <div className="relative">
                  {!showPauseMenu ? (
                    <button
                      type="button"
                      onClick={() => setShowPauseMenu(true)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#161a23] hover:bg-[#1d2330] text-zinc-300 hover:text-white border border-[#283244] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PauseCircle size={15} className="text-amber-400" />
                      <span>Pausar / Mover para Aprovação</span>
                      <ChevronDown size={14} />
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-[#0d1016] border border-[#283244] p-2 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          pauseActiveTask(activeTask.id, 'cliente', 'Enviado para aprovação do cliente');
                          setShowPauseMenu(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        Aguardando Cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          pauseActiveTask(activeTask.id, 'interno', 'Pausado para revisão interna');
                          setShowPauseMenu(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Pausar Internamente
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPauseMenu(false)}
                        className="text-zinc-400 hover:text-white text-xs px-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#11141b] border border-dashed border-[#232b3a] rounded-2xl p-10 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
              <h3 className="text-base font-bold text-white">Mesa 100% Limpa</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Nenhuma demanda pendente na fila. Registre uma nova solicitação na Caixa de Entrada acima.
              </p>
            </div>
          )}
        </section>

        {/* BLOCO 3: Grid Duplo: Fila de Produção + Aguardando Aprovação / Prospecção */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <section className="space-y-3 bg-[#11141b] border border-[#1e2430] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Fila de Produção ({productionQueue.filter(t => t.id !== activeTask?.id).length})
              </h2>
              <span className="text-[11px] text-zinc-400">Clique para focar</span>
            </div>

            <div className="space-y-2">
              {productionQueue
                .filter(t => t.id !== activeTask?.id)
                .slice(0, 6)
                .map(task => {
                  const taskClient = clients.find(c => c.id === task.client_id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => setTaskToFocus(task)}
                      className="bg-[#0c0f15] hover:bg-[#141822] border border-[#1a202c] hover:border-[#2a3446] rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: taskClient?.brand_color || '#3b82f6' }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                            {taskClient?.name || task.client_name || 'Cliente'} · {task.tag || 'Geral'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalTaskId(task.id);
                          }}
                          className="text-[11px] px-2 py-1 rounded bg-[#171c26] text-zinc-300 hover:text-white border border-[#222938]"
                        >
                          Ficha
                        </button>
                        <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                          <span>Focar</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}

              {productionQueue.filter(t => t.id !== activeTask?.id).length === 0 && (
                <p className="text-xs text-zinc-400 py-6 text-center">
                  Nenhuma outra tarefa aguardando na fila de produção.
                </p>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="space-y-3 bg-[#11141b] border border-[#1e2430] rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                  <FileCheck2 size={14} />
                  Aguardando Cliente ({waitingApprovalTasks.length})
                </h2>
                <span className="text-[11px] text-zinc-400">Links prontos para WhatsApp</span>
              </div>

              <div className="space-y-2">
                {waitingApprovalTasks.slice(0, 5).map(task => {
                  const taskClient = clients.find(c => c.id === task.client_id);
                  return (
                    <div
                      key={task.id}
                      className="bg-[#0c0f15] border border-[#1a202c] rounded-xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {taskClient?.name || task.client_name || 'Cliente'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyApproval(task.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-semibold border border-amber-500/30 cursor-pointer"
                        >
                          Copiar Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalTaskId(task.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#171c26] hover:bg-[#202735] text-zinc-300 text-[11px] border border-[#252c3a] cursor-pointer"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  );
                })}

                {waitingApprovalTasks.length === 0 && (
                  <p className="text-xs text-zinc-400 py-4 text-center">
                    Nenhuma entrega travada esperando aprovação no momento.
                  </p>
                )}
              </div>
            </section>

            {nextProspect && (
              <section className="bg-[#11141b] border border-[#1e2430] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5">
                    <Target size={14} />
                    Meta Diária de Prospecção (15 min)
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-400">
                    R$ {Number(nextProspect.value || 1800).toLocaleString('pt-BR')}/mês
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">{nextProspect.company}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Contato: {nextProspect.contact || 'Responsável'} · {nextProspect.contact_phone || 'Sem telefone'}
                  </p>
                  {nextProspect.notes && (
                    <p className="text-xs text-zinc-300 mt-2 bg-[#0a0d12] p-2.5 rounded-lg border border-[#1c222c]">
                      {nextProspect.notes}
                    </p>
                  )}
                </div>

                {nextProspect.contact_phone && (
                  <div className="pt-1">
                    <a
                      href={`https://wa.me/55${nextProspect.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá, ${nextProspect.contact || ''}! Tudo bem? Aqui é o Bruno, da Comunicação Social Ag em Poços de Caldas. Fiz uma análise rápida da presença digital da ${nextProspect.company} e identifiquei uma oportunidade prática. Podemos conversar rapidinho?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span>Abordar no WhatsApp Agora</span>
                    </a>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTaskId(null)}
          onUpdate={updateTask}
          onAddComment={addComment}
          onToggleChecklist={toggleChecklist}
          onScheduleFollowUp={scheduleFollowUp}
        />
      )}
    </div>
  );
}
