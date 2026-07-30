import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClients } from '../hooks/useClients';
import { useClientPortal } from '../hooks/useClientPortal';
import { useTasks } from '../hooks/useTasks';
import { 
  LayoutDashboard, 
  FileCheck, 
  MessageSquarePlus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '../utils/cn';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ApprovalFlow from '../components/ApprovalFlow';

// Safe date parser
function safeDate(str) {
  if (!str) return null;
  try { const d = parseISO(str); return isNaN(d.getTime()) ? null : d; } catch { return null; }
}

const STATUS_MAP = {
  'backlog': { label: 'Na fila', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  'briefing': { label: 'Briefing', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'em-producao': { label: 'Em produção', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'revisao-interna': { label: 'Revisão interna', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  'aprovacao-cliente': { label: 'Aguardando sua aprovação', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'ajustes': { label: 'Em ajustes', color: 'text-red-400', bg: 'bg-red-500/10' },
  'concluido': { label: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/10' },
};

export default function ClientHubView() {
  const { profile } = useAuth();
  const { clients } = useClients();
  const { tasks, addComment } = useTasks();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newRequest, setNewRequest] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const client = clients.find(c => c.id === profile?.client_id);
  const { dashboard, loading } = useClientPortal(client?.id);

  // Filtra tarefas do cliente
  const clientTasks = tasks.filter(t => 
    t.client_id === client?.id || t.client?.name === client?.name
  );
  const pendingApprovals = clientTasks.filter(t => t.status === 'aprovacao-cliente');
  const activeTasks = clientTasks.filter(t => !['concluido', 'backlog'].includes(t.status));
  const completedTasks = clientTasks.filter(t => t.status === 'concluido');

  // Handler para enviar nova solicitação (texto ou voz)
  const handleSendRequest = () => {
    if (!newRequest.trim()) return;
    
    // Cria um comentário em todas as tarefas ativas do cliente ou na primeira
    const targetTask = activeTasks[0] || clientTasks[0];
    if (targetTask) {
      addComment(targetTask.id, `📩 Solicitação do Cliente:\n\n${newRequest}`, client?.contact_name || profile?.name || 'Cliente', false);
    }
    
    setRequestSent(true);
    setNewRequest('');
    setTimeout(() => setRequestSent(false), 3000);
  };

  // Handler de voz
  const toggleVoice = () => {
    if (isRecording) {
      window.__clientSpeech?.stop();
      setIsRecording(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { alert('Seu navegador não suporta gravação de voz. Use o Google Chrome.'); return; }
      const r = new SR();
      r.lang = 'pt-BR';
      r.continuous = true;
      r.interimResults = true;
      r.onstart = () => setIsRecording(true);
      r.onresult = (e) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) t += e.results[i][0].transcript + ' ';
        }
        if (t) setNewRequest(prev => prev + t);
      };
      r.onend = () => setIsRecording(false);
      r.onerror = () => setIsRecording(false);
      window.__clientSpeech = r;
      r.start();
    }
  };

  if (loading && !client) {
    return (
      <div className="h-full flex items-center justify-center bg-cs-bg">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo-csag.png" alt="CS Ag" className="h-12 opacity-50 animate-pulse" />
          <p className="text-cs-text-secondary text-sm">Carregando seu portal...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-cs-bg p-8 text-center">
        <img src="/logo-csag.png" alt="CS Ag" className="h-16 mb-6 opacity-30" />
        <div className="text-red-400 mb-2 text-lg font-bold">Nenhum cliente associado à sua conta</div>
        <p className="text-cs-text-secondary text-sm">Contate o administrador da agência para vincular sua conta.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'aprovacoes', label: `Aprovações (${pendingApprovals.length})`, icon: FileCheck },
    { id: 'solicitacoes', label: 'Solicitações', icon: MessageSquarePlus },
  ];

  return (
    <div className="h-full flex flex-col bg-cs-bg overflow-y-auto custom-scrollbar">
      {/* Header do Portal */}
      <div className="bg-cs-surface border-b border-cs-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${client.brand_color || '#3b82f6'}cc, ${client.brand_color || '#3b82f6'}44)` }}>
              {client.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{client.name}</h1>
              <p className="text-xs text-cs-text-secondary">Portal do Cliente • Bem-vindo, {profile?.name || client.contact_name || 'Cliente'}</p>
            </div>
          </div>
          <img src="/logo-csag.png" alt="CS Ag" className="h-10 opacity-60" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedTask(null); }}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                  : "text-cs-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-yellow-400" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Em andamento</span>
                </div>
                <div className="text-2xl font-black text-white">{activeTasks.length}</div>
              </div>
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-orange-400" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Aguardando Aprovação</span>
                </div>
                <div className="text-2xl font-black text-orange-400">{pendingApprovals.length}</div>
              </div>
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Concluídos</span>
                </div>
                <div className="text-2xl font-black text-green-400">{completedTasks.length}</div>
              </div>
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-cs-primary" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Horas Investidas</span>
                </div>
                <div className="text-2xl font-black text-white">{dashboard?.monthlyHours || 0}h</div>
              </div>
            </div>

            {/* Tarefas ativas do cliente */}
            <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-cs-border">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={16} className="text-yellow-400" />
                  Seus Projetos em Andamento
                </h3>
              </div>
              <div className="divide-y divide-cs-border">
                {activeTasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500/20" />
                    <p className="text-cs-text-secondary text-sm">Nenhum projeto ativo no momento. Tudo em dia! 🎉</p>
                  </div>
                ) : (
                  activeTasks.map(task => {
                    const status = STATUS_MAP[task.status] || STATUS_MAP['backlog'];
                    const deadline = safeDate(task.deadline);
                    return (
                      <div 
                        key={task.id} 
                        className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group flex items-center justify-between"
                        onClick={() => { setSelectedTask(task); setActiveTab('aprovacoes'); }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase", status.bg, status.color)}>
                            {status.label}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">{task.title || 'Sem título'}</h4>
                            <p className="text-[10px] text-cs-text-secondary mt-0.5">
                              {task.tag || 'Geral'} • {deadline ? format(deadline, "dd 'de' MMM", { locale: ptBR }) : 'S/ prazo'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-cs-text-secondary group-hover:text-yellow-400 transition-colors" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Campanhas / Resultados */}
            {dashboard?.campaigns?.length > 0 && (
              <div className="bg-cs-surface border border-cs-border rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-green-400" />
                  Performance das Campanhas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.campaigns.map((camp, i) => (
                    <div key={i} className="bg-cs-bg rounded-2xl p-4 border border-cs-border">
                      <h4 className="text-xs font-bold text-white mb-2">{camp.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-cs-text-secondary">Investido: R$ {camp.spent?.toLocaleString()}</span>
                        <span className="text-xs font-bold text-green-400">ROAS {camp.roas}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'aprovacoes' && (
          <div className="space-y-6">
            {selectedTask ? (
              <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-cs-border flex items-center justify-between">
                  <div>
                    <button onClick={() => setSelectedTask(null)} className="text-xs text-cs-text-secondary hover:text-white mb-2 block">← Voltar</button>
                    <h3 className="text-xl font-bold text-white">{selectedTask.title}</h3>
                    <p className="text-xs text-cs-text-secondary mt-1">{selectedTask.notes || 'Sem briefing adicional.'}</p>
                  </div>
                  <div className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase", (STATUS_MAP[selectedTask.status] || STATUS_MAP['backlog']).bg, (STATUS_MAP[selectedTask.status] || STATUS_MAP['backlog']).color)}>
                    {(STATUS_MAP[selectedTask.status] || STATUS_MAP['backlog']).label}
                  </div>
                </div>
                <div className="p-6">
                  <ApprovalFlow 
                    taskId={selectedTask.id} 
                    userRole="client" 
                    userId={profile?.id} 
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white">Itens Aguardando Sua Aprovação</h2>
                {pendingApprovals.length === 0 ? (
                  <div className="bg-cs-surface border border-cs-border rounded-3xl p-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500/20" />
                    <p className="text-cs-text-secondary text-sm">Nenhuma peça aguardando aprovação.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovals.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-cs-surface border border-orange-500/20 rounded-2xl p-5 hover:border-orange-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{task.title}</h4>
                            <p className="text-[10px] text-cs-text-secondary mt-1">{task.tag} • Clique para aprovar ou solicitar ajustes</p>
                          </div>
                          <div className="bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">
                            AGUARDANDO
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Também mostra tarefas ativas para o cliente acompanhar */}
                <h2 className="text-lg font-bold text-white mt-8">Acompanhar Produção</h2>
                <div className="space-y-3">
                  {clientTasks.filter(t => t.status !== 'concluido' && t.status !== 'aprovacao-cliente').map(task => {
                    const status = STATUS_MAP[task.status] || STATUS_MAP['backlog'];
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-cs-surface border border-cs-border rounded-2xl p-5 hover:border-cs-primary/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase", status.bg, status.color)}>
                              {status.label}
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-cs-primary transition-colors">{task.title}</h4>
                          </div>
                          <ChevronRight size={16} className="text-cs-text-secondary" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'solicitacoes' && (
          <div className="space-y-6">
            <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-cs-border">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus size={20} className="text-yellow-400" />
                  Nova Solicitação ou Alteração
                </h3>
                <p className="text-xs text-cs-text-secondary mt-1">
                  Descreva sua alteração por texto ou use o microfone para ditar. A equipe receberá instantaneamente.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <textarea
                    value={newRequest}
                    onChange={(e) => setNewRequest(e.target.value)}
                    placeholder="Ex: Preciso alterar a cor do logo no post de quarta-feira. O tom está muito escuro, prefiro algo mais vibrante..."
                    className="w-full bg-cs-bg border border-cs-border rounded-2xl p-5 pr-16 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none h-36 placeholder:text-cs-text-secondary/50"
                  />
                  <button
                    onClick={toggleVoice}
                    className={cn(
                      "absolute right-4 bottom-4 p-3 rounded-xl transition-all",
                      isRecording 
                        ? "bg-red-500/20 text-red-500 animate-pulse shadow-lg shadow-red-500/20" 
                        : "bg-cs-surface hover:bg-yellow-500/10 text-cs-text-secondary hover:text-yellow-400 border border-cs-border"
                    )}
                    title={isRecording ? "Parar gravação" : "Ditar por voz"}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400 text-xs animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    🎤 Ouvindo... fale naturalmente sobre a alteração que deseja.
                  </div>
                )}

                {requestSent && (
                  <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <CheckCircle2 size={14} />
                    Solicitação enviada com sucesso! A equipe da agência foi notificada.
                  </div>
                )}

                <button
                  onClick={handleSendRequest}
                  disabled={!newRequest.trim()}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-30 disabled:grayscale text-black py-4 rounded-2xl font-bold transition-all shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  ENVIAR SOLICITAÇÃO
                </button>
              </div>
            </div>

            {/* Histórico de solicitações */}
            <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-cs-border">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Histórico de Interações</h3>
              </div>
              <div className="divide-y divide-cs-border">
                {clientTasks.flatMap(t => (t.comments || []).map(c => ({ ...c, taskTitle: t.title }))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10).map(comment => {
                  const d = safeDate(comment.created_at);
                  return (
                    <div key={comment.id} className="p-4 hover:bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold", comment.is_ai ? "text-cs-primary" : "text-white")}>
                            {comment.is_ai ? '🤖 Co-piloto' : comment.author_name || 'Equipe'}
                          </span>
                          <span className="text-[10px] text-cs-text-secondary">• {comment.taskTitle}</span>
                        </div>
                        <span className="text-[10px] text-cs-text-secondary">
                          {d ? format(d, "dd/MM HH:mm") : 'Recente'}
                        </span>
                      </div>
                      <p className="text-xs text-cs-text-primary leading-relaxed">{comment.content}</p>
                    </div>
                  );
                })}
                {clientTasks.flatMap(t => t.comments || []).length === 0 && (
                  <div className="p-8 text-center text-cs-text-secondary text-sm">Nenhuma interação registrada ainda.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cs-border bg-cs-surface/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-csag.png" alt="CS Ag" className="h-6 opacity-40" />
          <span className="text-[10px] text-cs-text-secondary">Powered by CS Ag OS</span>
        </div>
        <span className="text-[10px] text-cs-text-secondary">
          © 2026 Comunicação Social Ag
        </span>
      </div>
    </div>
  );
}
