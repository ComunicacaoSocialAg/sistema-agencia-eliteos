import { useState } from 'react';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  Plus, 
  CheckCircle2, 
  MessageSquare,
  History,
  ExternalLink,
  Sparkles,
  ChevronRight,
  User,
  Calendar,
  AlertCircle,
  Globe,
  Zap,
  Paperclip,
  FileText,
  Download
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../utils/cn';
import ApprovalFlow from './ApprovalFlow';
import { chatWithAgent, isAIConfigured } from '../lib/gemini';

const TAG_COLORS = {
  'Social Media': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Branding': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Vídeo': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Web': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Campanha': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

// --- UTILS ---
function safeParseISO(dateStr) {
  if (!dateStr) return null;
  try {
    const d = parseISO(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
}

export default function TaskModal({ task, onClose, onUpdate, onAddComment, onToggleChecklist, columns = [], user }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [newComment, setNewComment] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');

  if (!task) return null;

  // Safe data access
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const clientName = task.client?.name || (typeof task.client === 'string' ? task.client : 'Cliente');
  const taskIdDisplay = (task.id || 'TASK').toString().slice(0, 4);
  const deadlineDate = safeParseISO(task.deadline);
  const tagColorClass = TAG_COLORS[task.tag] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  const handleGenerateCopy = async () => {
    if (!isAIConfigured) {
      alert('Nenhuma IA configurada. Adicione VITE_GEMINI_API_KEY ou VITE_OPENAI_API_KEY no .env');
      return;
    }
    setIsGenerating(true);
    try {
      const clientContext = task.client ? `
        Diretrizes da Marca (Memória IA):
        - Tom de Voz: ${task.client.tone_of_voice || 'Padrão profissional'}
        - Público-Alvo: ${task.client.target_audience || 'Geral'}
        - Objetivos: ${task.client.strategic_goals || 'Gerar engajamento'}
      ` : '';

      const prompt = `Gere 3 opções de copy para a tarefa: "${task.title}". Contexto: ${task.notes || 'Sem notas adicionais'}. Cliente: ${clientName}. ${clientContext}`;
      const response = await chatWithAgent('content', [], prompt);
      setGeneratedCopy(response.text);
      onAddComment(task.id, `📝 Sugestões de Copy:\n\n${response.text}`, 'Co-piloto AI', true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment.trim(), user?.name || 'Bruno');
    setNewComment('');
  };

  const handleAISummary = () => {
    setIsSummarizing(true);
    setTimeout(() => {
      const summary = "A equipe está focada na revisão final. Houve um ajuste solicitado na legenda e a arte já foi aprovada internamente.";
      onAddComment(task.id, `🤖 Resumo da IA: ${summary}`, 'Co-piloto AI', true);
      setIsSummarizing(false);
    }, 1500);
  };

  const col = columns.find(c => c.id === task.status);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-5xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header - Elite Design */}
        <div className="p-8 border-b border-cs-border flex items-start justify-between bg-gradient-to-r from-cs-surface-hover/40 to-transparent">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={cn("text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider", tagColorClass)}>
                {task.tag || 'GERAL'}
              </span>
              <div className="flex items-center gap-1.5 text-cs-text-secondary text-xs">
                <span className="font-bold text-white hover:text-cs-primary cursor-pointer transition-colors">{clientName}</span>
                <ChevronRight size={12} />
                <span>ID-{taskIdDisplay}</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{task.title || 'Sem título'}</h2>
          </div>
          <div className="flex items-center gap-2">
             <button className="bg-cs-bg hover:bg-cs-surface-hover border border-cs-border text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
               <History size={14} /> LOG
             </button>
             <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-2.5 hover:bg-white/5 rounded-xl transition-all">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-cs-border bg-cs-surface/50">
          {[
            { id: 'geral', label: 'Geral', icon: MessageSquare },
            { id: 'ativos', label: 'Ativos & Links', icon: ExternalLink },
            { id: 'aprovacoes', label: 'Review Center', icon: CheckCircle2 }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2",
                activeTab === tab.id ? "text-cs-primary" : "text-cs-text-secondary hover:text-white"
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
            <div className="lg:col-span-8 p-8 space-y-8 border-r border-cs-border overflow-y-auto custom-scrollbar">
              {activeTab === 'geral' ? (
                <>
                  {/* AI Assistant Context Banner */}
                  <div className="bg-gradient-to-br from-cs-primary/15 to-cs-accent/5 border border-cs-primary/20 rounded-2xl p-6 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cs-primary flex items-center justify-center shadow-xl shadow-cs-primary/30 animate-pulse">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-bold tracking-tight">Análise do Co-piloto</p>
                        <p className="text-xs text-cs-text-secondary">IA identificou {checklist.filter(i => !i.is_done).length} itens pendentes no checklist.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleAISummary}
                      disabled={isSummarizing}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white px-4 py-2 rounded-xl transition-all"
                    >
                      {isSummarizing ? 'ANALISANDO...' : 'RESUMIR STATUS'}
                    </button>
                  </div>

                  {/* Laboratório de Criação - IA In-context */}
                  <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-cs-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={80} className="text-cs-primary" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cs-primary flex items-center justify-center shadow-lg shadow-cs-primary/30">
                            <Zap size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">Laboratório de Criação</h3>
                            <p className="text-[10px] text-cs-text-secondary">Gere legendas, roteiros ou copies em segundos.</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleGenerateCopy}
                          disabled={isGenerating}
                          className="bg-white text-cs-bg hover:bg-cs-primary hover:text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isGenerating ? 'CRIANDO...' : <><Sparkles size={12} /> GERAR COPY</>}
                        </button>
                      </div>
                      
                      {generatedCopy && (
                        <div className="mt-4 p-4 bg-cs-bg/50 border border-cs-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                           <p className="text-xs text-cs-text-primary leading-relaxed whitespace-pre-wrap">{generatedCopy}</p>
                           <button 
                             onClick={() => { navigator.clipboard.writeText(generatedCopy); alert('Copiado!'); }}
                             className="mt-3 text-[9px] font-bold text-cs-primary hover:text-white transition-colors uppercase"
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
                      <button className="text-[10px] text-cs-primary hover:text-white font-bold flex items-center gap-1 transition-colors">
                        <Plus size={12} /> ADICIONAR ITEM
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {checklist.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => onToggleChecklist(task.id, item.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                            item.is_done ? "bg-cs-bg/20 border-transparent opacity-60" : "bg-cs-surface border-cs-border hover:border-cs-primary hover:shadow-lg"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                            item.is_done ? "bg-green-500 text-white" : "bg-cs-bg border-2 border-cs-border group-hover:border-cs-primary"
                          )}>
                            {item.is_done && <CheckCircle2 size={16} />}
                          </div>
                          <span className={cn("text-sm", item.is_done ? "line-through text-cs-text-secondary" : "text-white font-semibold")}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                      {checklist.length === 0 && (
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
                    <div className="space-y-5">
                      {comments.map(comment => {
                        const commentDate = safeParseISO(comment.created_at);
                        return (
                          <div key={comment.id} className={cn(
                            "p-5 rounded-2xl border transition-all",
                            comment.is_ai ? "bg-cs-primary/10 border-cs-primary/30 shadow-lg shadow-cs-primary/5" : "bg-cs-surface border-cs-border"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm",
                                  comment.is_ai ? "bg-cs-primary text-white" : "bg-cs-surface-hover text-cs-text-secondary border border-cs-border"
                                )}>
                                  {comment.is_ai ? <Sparkles size={14} /> : (comment.author_name?.charAt(0) || 'U')}
                                </div>
                                <span className={cn("text-xs font-bold tracking-tight", comment.is_ai ? "text-cs-primary" : "text-white")}>
                                  {comment.author_name || 'Usuário'}
                                </span>
                              </div>
                              <span className="text-[10px] text-cs-text-secondary font-medium">
                                {commentDate ? format(commentDate, "dd 'de' MMM, HH:mm", { locale: ptBR }) : 'Recentemente'}
                              </span>
                            </div>
                            <p className="text-sm text-cs-text-primary leading-relaxed antialiased">{comment.content}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Input Area */}
                    <div className="flex gap-4 bg-cs-surface border border-cs-border p-4 rounded-2xl mt-6 focus-within:border-cs-primary focus-within:ring-4 focus-within:ring-cs-primary/10 transition-all">
                      <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                        placeholder="Escreva algo para a equipe..."
                        className="flex-1 bg-transparent border-none px-2 text-sm text-white focus:outline-none placeholder:text-cs-text-secondary"
                      />
                      <button onClick={handleAddComment} className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20">
                        COMENTAR
                      </button>
                    </div>
                  </section>
                </>
              ) : activeTab === 'ativos' ? (
                <div className="p-8 space-y-12">
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <Paperclip size={18} className="text-zinc-400" />
                        Materiais de Apoio & Referências
                      </h3>
                      <button className="text-[10px] font-bold text-cs-primary hover:text-white transition-colors uppercase tracking-widest bg-cs-primary/10 px-4 py-2 rounded-lg">
                        + ADICIONAR MATERIAL
                      </button>
                    </div>
                    <p className="text-xs text-cs-text-secondary mb-6">
                      Adicione aqui manuais de marca, briefings em PDF, imagens de referência ou planilhas que auxiliem na produção desta tarefa. (Para enviar peças para aprovação, use o Review Center).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Placeholder for Attachments */}
                      <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 flex items-center justify-between group hover:border-cs-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-cs-bg rounded-xl group-hover:bg-cs-primary/10 transition-colors">
                            <FileText size={16} className="text-cs-text-secondary group-hover:text-cs-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Brandbook_2026.pdf</p>
                            <p className="text-[10px] text-cs-text-secondary">2.4 MB</p>
                          </div>
                        </div>
                        <Download size={16} className="text-cs-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 flex items-center justify-between group hover:border-cs-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-cs-bg rounded-xl group-hover:bg-cs-primary/10 transition-colors">
                            <ExternalLink size={16} className="text-cs-text-secondary group-hover:text-cs-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Pasta no Google Drive</p>
                            <p className="text-[10px] text-cs-text-secondary">Link Externo</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-cs-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
                      <CheckCircle2 size={24} className="text-cs-primary" />
                      Review Center
                    </h3>
                    <p className="text-xs text-cs-text-secondary">
                      Envie arquivos ou links do Figma para o cliente aprovar. O histórico ficará registrado aqui.
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
            <div className="lg:col-span-4 p-8 bg-cs-bg/20 space-y-8 flex flex-col">
              {/* Status Section */}
              <section>
                <h3 className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-4">Fluxo de Trabalho</h3>
                <div className="space-y-2">
                  {columns.map(c => (
                    <button 
                      key={c.id} 
                      disabled={task.status === c.id}
                      onClick={() => onUpdate({ ...task, status: c.id })}
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between border",
                        task.status === c.id 
                          ? `bg-cs-surface ${c.border || 'border-cs-primary/50'} text-white shadow-xl scale-[1.02]` 
                          : "bg-transparent border-transparent text-cs-text-secondary hover:bg-cs-surface/40 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", c.dot || 'bg-zinc-400')} />
                        {(c.title || 'Status').toUpperCase()}
                      </div>
                      {task.status === c.id && <CheckCircle2 size={16} className="text-cs-primary" />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Esforço e Tempo */}
              <section className="bg-cs-surface border border-cs-border rounded-3xl p-6 shadow-inner">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Estimativa</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={task.estimated_hours || 1}
                        onChange={(e) => onUpdate({ ...task, estimated_hours: parseFloat(e.target.value) })}
                        className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-sm font-bold text-white w-20 focus:border-cs-primary focus:outline-none"
                      />
                      <span className="text-xs text-cs-text-secondary">horas</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Realizado</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder={task.estimated_hours || 1}
                        value={task.actual_hours || ''}
                        onChange={(e) => onUpdate({ ...task, actual_hours: parseFloat(e.target.value) })}
                        className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-sm font-bold text-cs-primary w-20 focus:border-cs-primary focus:outline-none"
                      />
                      <span className="text-xs text-cs-text-secondary">horas</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Meta Details */}
              <div className="mt-auto space-y-6 pt-8 border-t border-cs-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-cs-text-secondary">
                    <User size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Responsável</span>
                  </div>
                  <div className="flex items-center gap-2 bg-cs-surface px-3 py-1.5 rounded-xl border border-cs-border">
                    <div className="w-5 h-5 rounded-lg bg-cs-primary flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                       {(task.assigned_to || 'U').charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-white">{task.assigned_to || 'Equipe'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-cs-text-secondary">
                    <Calendar size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Deadline</span>
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-xl border",
                    deadlineDate && isPast(deadlineDate) && task.status !== 'concluido' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-cs-surface border-cs-border text-white'
                  )}>
                    {deadlineDate ? format(deadlineDate, "dd/MM/yyyy") : 'Sem data'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
