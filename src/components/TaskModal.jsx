import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  X,
  Clock,
  Plus,
  CheckCircle2,
  MessageSquare,
  History,
  ExternalLink,
  Sparkles,
  ChevronRight,
  User,
  Calendar,
  Zap,
  Paperclip,
  Trash2,
  Palette,
  FolderOpen,
  Globe,
  Camera,
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { cn } from '../utils/cn';
import ApprovalFlow from './ApprovalFlow';
import { chatWithAgent, generateContent, isAIConfigured } from '../lib/gemini';
import { areIdsMatching, useClients } from '../hooks/useClients';
import { useTeam } from '../hooks/useTeam';
import { getClientBrandKit } from '../lib/brandKit';

const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', dot: 'bg-zinc-500', border: 'border-zinc-500/30' },
  { id: 'briefing', title: 'Briefing', dot: 'bg-blue-500', border: 'border-blue-500/30' },
  { id: 'em-producao', title: 'Produção', dot: 'bg-yellow-500', border: 'border-yellow-500/30' },
  { id: 'revisao-interna', title: 'Revisão', dot: 'bg-purple-500', border: 'border-purple-500/30' },
  { id: 'aguardando-cliente', title: 'Cliente', dot: 'bg-orange-500', border: 'border-orange-500/30' },
  { id: 'ajustes', title: 'Ajustes', dot: 'bg-red-500', border: 'border-red-500/30' },
  { id: 'concluido', title: 'Concluído', dot: 'bg-green-500', border: 'border-green-500/30' },
];

const TAG_COLORS = {
  'Social Media': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Branding': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Vídeo': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Web': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Campanha': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const LINK_KIND_LABELS = {
  referencia: 'Referência',
  drive: 'Google Drive',
  briefing: 'Briefing / Doc',
  delivery: 'Entrega Final',
};

function safeParseISO(dateStr) {
  if (!dateStr) return null;
  try {
    const d = parseISO(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export default function TaskModal({ task, onClose, onUpdate, onAddComment, onToggleChecklist, onScheduleFollowUp, columns = [], user }) {
  const { clients = [] } = useClients();
  const { team = [] } = useTeam();

  const [activeTab, setActiveTab] = useState('geral');
  const [newComment, setNewComment] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const [linkForm, setLinkForm] = useState({ name: '', url: '', kind: 'referencia' });
  const [savingLink, setSavingLink] = useState(false);

  if (!task) return null;

  const activeColumns = columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const links = Array.isArray(task.external_links) ? task.external_links : [];

  const matchedClient = clients.find(c =>
    areIdsMatching(c.id, task.client_id, c.name, task.client_name || (typeof task.client === 'string' ? task.client : task.client?.name))
  ) || (typeof task.client === 'object' && task.client ? task.client : null);

  const clientName = matchedClient?.name || task.client_name || (typeof task.client === 'string' ? task.client : 'Cliente');
  const brandKit = matchedClient ? getClientBrandKit(matchedClient) : null;

  const teamOptions = (() => {
    const names = new Map();
    names.set('Bruno', { id: 't1', name: 'Bruno' });
    (team || []).forEach(m => {
      if (m?.name) names.set(m.name, m);
    });
    if (task.assigned_to && !names.has(task.assigned_to)) {
      names.set(task.assigned_to, { id: task.assigned_to_id || '', name: task.assigned_to });
    }
    return [...names.values()];
  })();

  const handleOpenClientWorkspace = (tab = 'overview') => {
    if (!matchedClient?.id) return;
    window.dispatchEvent(new CustomEvent('csag:navigate', {
      detail: { view: 'clientes', clientId: matchedClient.id, tab },
    }));
    onClose();
  };

  const handleAddChecklistItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newItemText.trim(),
      label: newItemText.trim(),
      is_done: false,
    };
    onUpdate({ ...task, checklist: [...checklist, newItem] });
    setNewItemText('');
    setIsAddingItem(false);
    toast.success('Item adicionado ao checklist.');
  };

  const delivery = links.find(link => link?.kind === 'delivery' && /^https?:\/\//i.test(link.url || ''));

  const saveDelivery = async () => {
    let url;
    try {
      url = new URL(deliveryUrl.trim());
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
    } catch {
      toast.error('Informe um link válido da entrega.');
      return;
    }
    setSavingDelivery(true);
    try {
      const saved = await onUpdate({
        ...task,
        external_links: [
          ...links.filter(link => link?.kind !== 'delivery'),
          { id: `deliv-${Date.now()}`, kind: 'delivery', name: 'Entrega', url: url.href },
        ],
      });
      if (saved) {
        setDeliveryUrl('');
        toast.success('Link da entrega salvo.');
      }
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleAddExternalLink = async (e) => {
    e.preventDefault();
    if (!linkForm.name.trim() || !linkForm.url.trim()) {
      toast.error('Informe o nome e a URL do material.');
      return;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(linkForm.url.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      toast.error('Informe uma URL válida iniciando com http:// ou https://');
      return;
    }

    setSavingLink(true);
    try {
      const nextLinks = [
        ...links,
        {
          id: `lnk-${Date.now()}`,
          kind: linkForm.kind || 'referencia',
          name: linkForm.name.trim(),
          url: parsedUrl.href,
        },
      ];
      const saved = await onUpdate({ ...task, external_links: nextLinks });
      if (saved) {
        setLinkForm({ name: '', url: '', kind: 'referencia' });
        toast.success('Material vinculado à tarefa.');
      }
    } finally {
      setSavingLink(false);
    }
  };

  const handleRemoveExternalLink = async (indexToRemove) => {
    const nextLinks = links.filter((_, idx) => idx !== indexToRemove);
    const saved = await onUpdate({ ...task, external_links: nextLinks });
    if (saved) toast.success('Link removido.');
  };

  const scheduleFollowUp = async () => {
    if (!followUpDate || !onScheduleFollowUp) return;
    setSavingFollowUp(true);
    try {
      const saved = await onScheduleFollowUp(task, followUpDate);
      if (saved) setFollowUpDate('');
    } catch {
      toast.error('Não foi possível marcar o acompanhamento. Tente novamente.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const taskIdDisplay = (task.id || 'TASK').toString().slice(0, 4);
  const deadlineDate = safeParseISO(task.deadline);
  const tagColorClass = TAG_COLORS[task.tag] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  const handleGenerateCopy = async () => {
    setIsGenerating(true);
    try {
      const tone = matchedClient?.tone_of_voice || 'Profissional, claro e objetivo';
      const audience = matchedClient?.target_audience || 'Público principal da marca';
      const goals = matchedClient?.strategic_goals || 'Gerar autoridade e conversões qualificadas';
      const compliance = brandKit?.ai_instructions ? `Restrições e Compliance: ${brandKit.ai_instructions}` : '';

      if (!isAIConfigured) {
        const structuredDraft = [
          `Estrutura de Copy para: ${task.title}`,
          `Cliente: ${clientName} | Canal/Tag: ${task.tag || 'Geral'}`,
          `Tom de Voz: ${tone}`,
          `Público-Alvo: ${audience}`,
          compliance || null,
          '',
          `1. Gancho de Abertura: Conecte com a dor principal do público (${audience}) sem promessas genéricas.`,
          `2. Desenvolvimento: Apresente os pontos de "${task.notes || task.title}" alinhados ao objetivo (${goals}).`,
          `3. Chamada para Ação (CTA): Convide o leitor para o próximo passo prático (agendar, responder ou acessar o link oficial).`,
        ]
          .filter(line => line !== null)
          .join('\n');

        setGeneratedCopy(structuredDraft);
        await onAddComment(task.id, `Estrutura de Copy (sem chave de IA configurada):\n\n${structuredDraft}`, 'Co-piloto AI', true);
        toast.success('Estrutura base de copy gerada com os dados da conta.');
        return;
      }

      const clientContext = matchedClient
        ? `Diretrizes da Marca (${clientName}):\n- Tom de Voz: ${tone}\n- Público-Alvo: ${audience}\n- Objetivos: ${goals}\n${compliance}`
        : '';

      const prompt = `Gere 3 opções objetivas de copy em português do Brasil (sem travessão longo) para a tarefa: "${task.title}". Contexto: ${task.notes || task.description || 'Sem notas adicionais'}. ${clientContext}`;
      const response = await chatWithAgent('content', [], prompt);
      const resultText = response?.text || '';
      setGeneratedCopy(resultText);
      await onAddComment(task.id, `Sugestões de Copy:\n\n${resultText}`, 'Co-piloto AI', true);
      toast.success('Sugestões de copy geradas e salvas nos comentários.');
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível gerar copy agora. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const saved = await onAddComment(task.id, newComment.trim(), user?.name || 'Bruno');
    if (saved) setNewComment('');
  };

  const handleAISummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      const doneCount = checklist.filter(i => i.is_done).length;
      const pendingItems = checklist.filter(i => !i.is_done).map(i => i.text || i.label).filter(Boolean);
      const trackedSeconds = Number(task.tracked_seconds ?? task.trackedSeconds) || 0;
      const trackedMin = Math.round(trackedSeconds / 60);
      const currentCol = activeColumns.find(c => c.id === task.status);
      const deadlineStr = deadlineDate ? format(deadlineDate, 'dd/MM/yyyy') : 'Sem prazo definido';
      const lastComment = comments[comments.length - 1];

      const structuredSummary = [
        `Status: ${currentCol?.title || task.status} | Prazo: ${deadlineStr}.`,
        `Checklist: ${doneCount}/${checklist.length} concluído(s)${pendingItems.length > 0 ? ` (pendentes: ${pendingItems.slice(0, 3).join(', ')})` : ''}.`,
        `Tempo cronometrado: ${trackedMin} min | Links vinculados: ${links.length}.`,
        lastComment ? `Última atualização (${lastComment.author_name || 'Equipe'}): "${String(lastComment.content || '').slice(0, 120)}"` : 'Sem comentários anteriores registrados.',
      ].join(' ');

      let finalSummary = structuredSummary;
      if (isAIConfigured) {
        try {
          const prompt = `Resuma o estado operacional real desta tarefa da agência Comunicação Social Ag em 2 frases diretas em português do Brasil (sem inventar fatos e sem travessão longo).\nDados:\nCliente: ${clientName}\nTarefa: ${task.title}\n${structuredSummary}`;
          const aiText = await generateContent(prompt, 'auto', { requireProvider: true });
          if (aiText?.trim()) finalSummary = aiText.trim();
        } catch {
          // Mantém diagnóstico operacional estruturado
        }
      }

      await onAddComment(task.id, `Diagnóstico da Tarefa: ${finalSummary}`, 'Co-piloto AI', true);
      toast.success('Diagnóstico real registrado no feed.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const trackedSecondsTotal = Number(task.tracked_seconds ?? task.trackedSeconds) || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-5xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-cs-border flex items-start justify-between gap-4 bg-gradient-to-r from-cs-surface-hover/40 to-transparent">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={cn('text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider', tagColorClass)}>
                {task.tag || 'GERAL'}
              </span>
              <div className="flex items-center gap-1.5 text-cs-text-secondary text-xs min-w-0">
                {matchedClient?.id ? (
                  <button
                    type="button"
                    onClick={() => handleOpenClientWorkspace('overview')}
                    className="font-bold text-white hover:text-cs-primary cursor-pointer transition-colors underline decoration-cs-border underline-offset-4 truncate"
                  >
                    {clientName}
                  </button>
                ) : (
                  <span className="font-bold text-white truncate">{clientName}</span>
                )}
                <ChevronRight size={12} className="shrink-0" />
                <span className="shrink-0">ID-{taskIdDisplay}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">{task.title || 'Sem título'}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toast.success(`Tempo registrado na tarefa: ${Math.round(trackedSecondsTotal / 60)} min`)}
              className="bg-cs-bg hover:bg-cs-surface-hover border border-cs-border text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <History size={14} /> {Math.round(trackedSecondsTotal / 60)}m
            </button>
            <button type="button" aria-label="Fechar tarefa" onClick={onClose} className="text-cs-text-secondary hover:text-white p-2.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 sm:px-8 border-b border-cs-border bg-cs-surface/50 overflow-x-auto custom-scrollbar shrink-0">
          {[
            { id: 'geral', label: 'Geral', icon: MessageSquare },
            { id: 'ativos', label: `Ativos & Links (${links.length})`, icon: ExternalLink },
            { id: 'aprovacoes', label: 'Review Center', icon: CheckCircle2 },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer',
                activeTab === tab.id ? 'text-cs-primary' : 'text-cs-text-secondary hover:text-white'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cs-primary rounded-t-full shadow-[0_-4px_12px_rgba(168,85,247,0.4)]" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-cs-bg/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-0">

            {/* Main Content Area */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-cs-border overflow-y-auto custom-scrollbar">
              {activeTab === 'geral' ? (
                <>
                  {/* Real Task Status Diagnosis */}
                  <div className="bg-gradient-to-br from-cs-primary/15 to-cs-accent/5 border border-cs-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-cs-primary flex items-center justify-center shadow-xl shadow-cs-primary/30 shrink-0">
                        <Sparkles size={22} className="text-black" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-bold tracking-tight">Diagnóstico Operacional</p>
                        <p className="text-xs text-cs-text-secondary">
                          {checklist.filter(i => !i.is_done).length} pendência(s) no checklist · {links.length} link(s) anexado(s) · {Math.round(trackedSecondsTotal / 60)} min cronometrados.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAISummary}
                      disabled={isSummarizing}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
                    >
                      {isSummarizing ? 'REGISTRANDO...' : 'RESUMIR STATUS'}
                    </button>
                  </div>

                  {/* Criação de Copy em Contexto */}
                  <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-cs-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cs-primary flex items-center justify-center shadow-lg shadow-cs-primary/30 shrink-0">
                            <Zap size={20} className="text-black" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">Laboratório de Criação</h3>
                            <p className="text-[10px] text-cs-text-secondary">Gera legendas, roteiros ou estrutura usando o Brand Kit da conta.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateCopy}
                          disabled={isGenerating}
                          className="bg-white text-cs-bg hover:bg-cs-primary hover:text-black px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isGenerating ? 'CRIANDO...' : <><Sparkles size={12} /> GERAR COPY</>}
                        </button>
                      </div>

                      {generatedCopy && (
                        <div className="mt-4 p-4 bg-cs-bg/50 border border-cs-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs text-cs-text-primary leading-relaxed whitespace-pre-wrap">{generatedCopy}</p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(generatedCopy);
                              toast.success('Resultado copiado.');
                            }}
                            className="mt-3 text-[10px] font-bold text-cs-primary hover:text-white transition-colors uppercase cursor-pointer"
                          >
                            COPIAR RESULTADO
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Checklist Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-cs-primary" /> Checklist de Produção
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(true)}
                        className="text-[10px] text-cs-primary hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus size={12} /> ADICIONAR ITEM
                      </button>
                    </div>

                    {isAddingItem && (
                      <div className="flex gap-2 p-3 bg-cs-surface border border-cs-primary/40 rounded-2xl animate-in fade-in">
                        <input
                          type="text"
                          value={newItemText}
                          onChange={e => setNewItemText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                          placeholder="Descreva o novo item do checklist..."
                          className="flex-1 bg-transparent text-xs text-white focus:outline-none px-2"
                          autoFocus
                        />
                        <button type="button" onClick={handleAddChecklistItem} className="px-3 py-1.5 bg-cs-primary text-black rounded-xl text-xs font-bold cursor-pointer">Adicionar</button>
                        <button type="button" onClick={() => setIsAddingItem(false)} className="px-3 py-1.5 text-cs-text-secondary hover:text-white text-xs cursor-pointer">Cancelar</button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {checklist.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onToggleChecklist(task.id, item.id)}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group',
                            item.is_done ? 'bg-cs-bg/20 border-transparent opacity-60' : 'bg-cs-surface border-cs-border hover:border-cs-primary hover:shadow-lg'
                          )}
                        >
                          <div className={cn(
                            'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                            item.is_done ? 'bg-green-500 text-white' : 'bg-cs-bg border-2 border-cs-border group-hover:border-cs-primary'
                          )}>
                            {item.is_done && <CheckCircle2 size={16} />}
                          </div>
                          <span className={cn('text-sm', item.is_done ? 'line-through text-cs-text-secondary' : 'text-white font-semibold')}>
                            {item.text || item.label || 'Item do checklist'}
                          </span>
                        </div>
                      ))}
                      {checklist.length === 0 && !isAddingItem && (
                        <div className="p-8 border border-dashed border-cs-border rounded-2xl text-center">
                          <p className="text-xs text-cs-text-secondary italic">Nenhum item definido para esta tarefa.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Comments Thread */}
                  <section className="space-y-6">
                    <h3 className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-cs-primary" /> Feed de Colaboração
                    </h3>
                    <div className="space-y-4">
                      {comments.map(comment => {
                        const commentDate = safeParseISO(comment.created_at);
                        return (
                          <div key={comment.id} className={cn(
                            'p-5 rounded-2xl border transition-all',
                            comment.is_ai ? 'bg-cs-primary/10 border-cs-primary/30 shadow-lg shadow-cs-primary/5' : 'bg-cs-surface border-cs-border'
                          )}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm',
                                  comment.is_ai ? 'bg-cs-primary text-black' : 'bg-cs-surface-hover text-cs-text-secondary border border-cs-border'
                                )}>
                                  {comment.is_ai ? <Sparkles size={14} /> : (comment.author_name?.charAt(0) || 'U')}
                                </div>
                                <span className={cn('text-xs font-bold tracking-tight', comment.is_ai ? 'text-cs-primary' : 'text-white')}>
                                  {comment.author_name || 'Usuário'}
                                </span>
                              </div>
                              <span className="text-[10px] text-cs-text-secondary font-medium">
                                {commentDate ? format(commentDate, "dd 'de' MMM, HH:mm", { locale: ptBR }) : 'Recentemente'}
                              </span>
                            </div>
                            <p className="text-sm text-cs-text-primary leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-3 bg-cs-surface border border-cs-border p-3.5 rounded-2xl mt-4 focus-within:border-cs-primary transition-all">
                      <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                        placeholder="Escreva uma atualização ou instrução para a equipe..."
                        className="flex-1 bg-transparent border-none px-2 text-sm text-white focus:outline-none placeholder:text-cs-text-secondary"
                      />
                      <button type="button" onClick={handleAddComment} className="bg-cs-primary hover:bg-cs-primary-hover text-black px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer">
                        COMENTAR
                      </button>
                    </div>
                  </section>
                </>
              ) : activeTab === 'ativos' ? (
                <div className="space-y-8">
                  {/* Materiais reais da tarefa persistidos em external_links */}
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <Paperclip size={18} className="text-cs-primary" /> Materiais & Referências da Tarefa
                      </h3>
                      <p className="text-xs text-cs-text-secondary mt-1">
                        Links salvos em <code className="text-zinc-300">external_links</code> da demanda. Para enviar versões para aprovação do cliente, use a aba Review Center.
                      </p>
                    </div>

                    <form onSubmit={handleAddExternalLink} className="bg-cs-surface border border-cs-border rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          aria-label="Nome do Material"
                          value={linkForm.name}
                          onChange={e => setLinkForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Nome (ex: Briefing Docs)"
                          className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                        />
                        <input
                          type="url"
                          aria-label="URL do Material"
                          value={linkForm.url}
                          onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                          placeholder="https://..."
                          className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                        />
                        <select
                          aria-label="Tipo do Material"
                          value={linkForm.kind}
                          onChange={e => setLinkForm(f => ({ ...f, kind: e.target.value }))}
                          className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                        >
                          <option value="referencia">Referência</option>
                          <option value="drive">Google Drive</option>
                          <option value="briefing">Briefing / Doc</option>
                          <option value="delivery">Entrega Final</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingLink || !linkForm.name.trim() || !linkForm.url.trim()}
                          className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus size={14} /> {savingLink ? 'Salvando...' : 'Adicionar Link'}
                        </button>
                      </div>
                    </form>

                    {links.length === 0 ? (
                      <div className="bg-cs-surface/40 border border-dashed border-cs-border rounded-2xl p-6 text-center text-xs text-cs-text-secondary">
                        Nenhum link anexado a esta tarefa ainda. Adicione acima um documento de referência, pasta ou entrega.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {links.map((item, idx) => (
                          <div key={item.id || `${item.url}-${idx}`} className="bg-cs-surface border border-cs-border rounded-2xl p-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cs-bg border border-cs-border text-cs-primary inline-block mb-1">
                                {LINK_KIND_LABELS[item.kind] || item.kind || 'Link'}
                              </span>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-white hover:text-cs-primary flex items-center gap-1.5 truncate"
                              >
                                <span className="truncate">{item.name || item.url}</span>
                                <ExternalLink size={12} className="shrink-0" />
                              </a>
                            </div>
                            <button
                              type="button"
                              aria-label={`Remover ${item.name || 'link'}`}
                              onClick={() => handleRemoveExternalLink(idx)}
                              className="p-2 text-cs-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Ativos Oficiais da Conta (Brand Center) */}
                  <section className="space-y-4 pt-4 border-t border-cs-border">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Palette size={17} className="text-cs-primary" /> Ativos Oficiais da Conta (Brand Center)
                        </h3>
                        <p className="text-xs text-cs-text-secondary">Canais, paleta e pasta oficial vinculados ao cliente {clientName}.</p>
                      </div>
                      {matchedClient?.id && (
                        <button
                          type="button"
                          onClick={() => handleOpenClientWorkspace('brand')}
                          className="bg-cs-bg hover:bg-white/5 border border-cs-border text-cs-primary px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Abrir Brand Kit
                        </button>
                      )}
                    </div>

                    {brandKit && (brandKit.drive_url || brandKit.website || brandKit.instagram || brandKit.assets?.length > 0) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {brandKit.drive_url && /^https?:\/\//i.test(brandKit.drive_url) && (
                          <a href={brandKit.drive_url} target="_blank" rel="noreferrer" className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 rounded-2xl p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <FolderOpen size={18} className="text-blue-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white">Pasta Oficial no Drive</p>
                                <p className="text-[11px] text-cs-text-secondary truncate">{brandKit.drive_url}</p>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-cs-text-secondary shrink-0" />
                          </a>
                        )}
                        {brandKit.website && /^https?:\/\//i.test(brandKit.website) && (
                          <a href={brandKit.website} target="_blank" rel="noreferrer" className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 rounded-2xl p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Globe size={18} className="text-cs-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white">Website Oficial</p>
                                <p className="text-[11px] text-cs-text-secondary truncate">{brandKit.website}</p>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-cs-text-secondary shrink-0" />
                          </a>
                        )}
                        {brandKit.instagram && (
                          <a
                            href={`https://instagram.com/${brandKit.instagram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 rounded-2xl p-4 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Camera size={18} className="text-pink-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white">Instagram</p>
                                <p className="text-[11px] text-cs-text-secondary truncate">@{brandKit.instagram.replace(/^@/, '')}</p>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-cs-text-secondary shrink-0" />
                          </a>
                        )}
                        {(brandKit.assets || []).map((asset, idx) => (
                          asset?.url && /^https?:\/\//i.test(asset.url) ? (
                            <a key={asset.id || idx} href={asset.url} target="_blank" rel="noreferrer" className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 rounded-2xl p-4 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{asset.name || 'Arquivo da Marca'}</p>
                                <p className="text-[11px] text-cs-text-secondary truncate">{asset.url}</p>
                              </div>
                              <ExternalLink size={14} className="text-cs-text-secondary shrink-0" />
                            </a>
                          ) : null
                        ))}
                      </div>
                    ) : (
                      <div className="bg-cs-surface/40 border border-dashed border-cs-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-cs-text-secondary">Este cliente ainda não possui Drive, site ou Instagram configurados no Brand Center.</p>
                        {matchedClient?.id && (
                          <button
                            type="button"
                            onClick={() => handleOpenClientWorkspace('brand')}
                            className="text-xs font-bold text-cs-primary hover:underline cursor-pointer"
                          >
                            Configurar no Brand Kit
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
                      <CheckCircle2 size={24} className="text-cs-primary" />
                      Review Center
                    </h3>
                    <p className="text-xs text-cs-text-secondary">
                      Envie arquivos ou links para o cliente aprovar. O histórico de decisões fica registrado aqui.
                    </p>
                  </div>
                  <ApprovalFlow
                    taskId={task.id}
                    userRole={user?.role || 'admin'}
                    userId={user?.id}
                  />
                </div>
              )}
            </div>

            {/* Sidebar - Meta Info */}
            <div className="lg:col-span-4 p-6 sm:p-8 bg-cs-bg/20 space-y-6 flex flex-col">
              {/* Status Section */}
              <section>
                <h3 className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-3">Fluxo de Trabalho</h3>
                <div className="space-y-2">
                  {activeColumns.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        const statusToDemandMap = {
                          'backlog': 'backlog',
                          'briefing': 'briefing',
                          'em-producao': 'em_producao',
                          'revisao-interna': 'revisao_interna',
                          'aguardando-cliente': 'aguardando_cliente',
                          'ajustes': 'ajustes',
                          'concluido': 'concluido',
                        };
                        onUpdate({
                          ...task,
                          status: c.id,
                          demand_status: statusToDemandMap[c.id] || c.id.replace(/-/g, '_'),
                        });
                      }}
                      className={cn(
                        'w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between border cursor-pointer',
                        task.status === c.id
                          ? `bg-cs-surface ${c.border || 'border-cs-primary/50'} text-white shadow-xl scale-[1.01]`
                          : 'bg-transparent border-transparent text-cs-text-secondary hover:bg-cs-surface/40 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-2.5 h-2.5 rounded-full shadow-sm', c.dot || 'bg-zinc-400')} />
                        {(c.title || 'Status').toUpperCase()}
                      </div>
                      {task.status === c.id && <CheckCircle2 size={16} className="text-cs-primary" />}
                    </button>
                  ))}
                </div>
              </section>

              {onScheduleFollowUp && task.status === 'concluido' && (
                <section className="space-y-3 border-t border-cs-border pt-4">
                  <h3 className="text-sm font-semibold text-white">Entrega e acompanhamento</h3>
                  {delivery && <a href={delivery.url} target="_blank" rel="noreferrer" className="text-xs text-cs-primary underline block">Abrir entrega registrada</a>}
                  <label className="block text-xs text-cs-text-secondary" htmlFor="task-delivery-url">Link da entrega</label>
                  <input id="task-delivery-url" type="url" value={deliveryUrl} onChange={event => setDeliveryUrl(event.target.value)}
                    className="w-full rounded-lg border border-cs-border bg-cs-bg p-2 text-sm text-white" />
                  <button type="button" onClick={saveDelivery} disabled={savingDelivery || !deliveryUrl.trim()}
                    className="rounded-lg bg-cs-surface border border-cs-border px-3 py-2 text-xs text-white disabled:opacity-50 cursor-pointer">Salvar link da entrega</button>
                  <label className="block text-xs text-cs-text-secondary" htmlFor="task-follow-up-date">Data do acompanhamento</label>
                  <input id="task-follow-up-date" type="date" value={followUpDate} onChange={event => setFollowUpDate(event.target.value)}
                    className="w-full rounded-lg border border-cs-border bg-cs-bg p-2 text-sm text-white" />
                  <button type="button" onClick={scheduleFollowUp} disabled={savingFollowUp || !followUpDate || !task.client_id}
                    className="rounded-lg bg-cs-primary px-3 py-2 text-xs font-semibold text-black disabled:opacity-50 cursor-pointer">Criar tarefa de acompanhamento</button>
                </section>
              )}

              {/* Esforço e Tempo */}
              <section className="bg-cs-surface border border-cs-border rounded-3xl p-5 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Estimativa</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        aria-label="Horas estimadas"
                        value={task.estimated_hours || 1}
                        onChange={(e) => onUpdate({ ...task, estimated_hours: parseFloat(e.target.value) || 0 })}
                        className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-sm font-bold text-white w-20 focus:border-cs-primary focus:outline-none"
                      />
                      <span className="text-xs text-cs-text-secondary">h</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Realizado</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        aria-label="Horas realizadas"
                        placeholder={String(task.estimated_hours || 1)}
                        value={task.actual_hours || ''}
                        onChange={(e) => onUpdate({ ...task, actual_hours: parseFloat(e.target.value) || 0 })}
                        className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-sm font-bold text-cs-primary w-20 focus:border-cs-primary focus:outline-none"
                      />
                      <span className="text-xs text-cs-text-secondary">h</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Responsável e Deadline Editáveis */}
              <div className="mt-auto space-y-4 pt-6 border-t border-cs-border/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-cs-text-secondary shrink-0">
                    <User size={15} />
                    <label htmlFor="task-assignee-select" className="text-[10px] font-bold uppercase tracking-widest">Responsável</label>
                  </div>
                  <select
                    id="task-assignee-select"
                    aria-label="Responsável da tarefa"
                    value={task.assigned_to || 'Bruno'}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      const member = teamOptions.find(m => m.name === nextName);
                      onUpdate({
                        ...task,
                        assigned_to: nextName,
                        assigned_to_id: member?.id && member.id !== 't1' ? member.id : null,
                      });
                    }}
                    className="bg-cs-surface px-3 py-1.5 rounded-xl border border-cs-border text-xs font-bold text-white focus:border-cs-primary focus:outline-none cursor-pointer"
                  >
                    {teamOptions.map(member => (
                      <option key={member.name} value={member.name} className="bg-cs-bg text-white">
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-cs-text-secondary shrink-0">
                    <Calendar size={15} />
                    <label htmlFor="task-deadline-input" className="text-[10px] font-bold uppercase tracking-widest">Deadline</label>
                  </div>
                  <input
                    id="task-deadline-input"
                    type="date"
                    aria-label="Deadline da tarefa"
                    value={task.deadline ? String(task.deadline).slice(0, 10) : ''}
                    onChange={(e) => onUpdate({ ...task, deadline: e.target.value || null })}
                    className={cn(
                      'text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:border-cs-primary',
                      deadlineDate && isPast(deadlineDate) && task.status !== 'concluido'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-cs-surface border-cs-border text-white'
                    )}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
