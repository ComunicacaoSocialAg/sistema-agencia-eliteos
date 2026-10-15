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
  TrendingUp,
  FolderOpen,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
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
  'aguardando-cliente': { label: 'Aguardando sua aprovação', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'aprovacao-cliente': { label: 'Aguardando sua aprovação', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'ajustes': { label: 'Em ajustes', color: 'text-red-400', bg: 'bg-red-500/10' },
  'concluido': { label: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/10' },
  'finalizado': { label: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/10' },
};

export default function ClientHubView() {
  const { profile, user } = useAuth();
  const { clients } = useClients();
  const { tasks, allTasks, createTask, addComment } = useTasks();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newRequest, setNewRequest] = useState('');
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [pieceType, setPieceType] = useState('Carrossel');
  const [desiredDeadline, setDesiredDeadline] = useState('');
  const [requestPriority, setRequestPriority] = useState('medium');

  // Resolução resiliente do cliente logado
  const client = clients.find(c => 
    c.id === profile?.client_id || 
    c.contact_email?.toLowerCase() === profile?.email?.toLowerCase() ||
    c.id === user?.client_id ||
    (profile?.name?.includes('Alberto') && (c.name?.includes('Alberto') || c.id?.includes('alberto'))) ||
    (profile?.name?.includes('Dubola') && (c.name?.includes('Dubola') || c.id?.includes('dubola')))
  ) || clients[0];

  const { dashboard, loading } = useClientPortal(client?.id);

  // Filtra tarefas do cliente
  const clientTasks = (allTasks || tasks).filter(t => 
    t.client_id === client?.id || 
    t.client?.name?.toLowerCase() === client?.name?.toLowerCase() ||
    (t.client_name && t.client_name.toLowerCase() === client?.name?.toLowerCase())
  );

  const pendingApprovals = clientTasks.filter(t => 
    t.status === 'aguardando-cliente' || 
    t.status === 'aprovacao-cliente' || 
    t.demand_status === 'aguardando_cliente'
  );
  
  const activeTasks = clientTasks.filter(t => 
    !['concluido', 'finalizado', 'backlog'].includes(t.status)
  );
  
  const completedTasks = clientTasks.filter(t => 
    t.status === 'concluido' || t.status === 'finalizado'
  );

  const isMedicalClient = client?.document_id?.includes('CRM') || 
                          client?.name?.includes('Dr.') || 
                          client?.tone_of_voice?.includes('CFM');

  // Handler para enviar nova solicitação (cria tarefa no Kanban e adiciona comentário)
  const handleSendRequest = async () => {
    if (!newRequest.trim()) {
      toast.error('Descreva o que você precisa antes de enviar.');
      return;
    }
    
    const title = newRequestTitle.trim() || `[${pieceType}] ${newRequest.substring(0, 45)}...`;
    const targetDeadline = desiredDeadline || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    
    await createTask({
      title,
      description: `Tipo de Peça: ${pieceType}\nPrioridade: ${requestPriority}\nPrazo Desejado: ${targetDeadline}\n\nBriefing do Cliente:\n${newRequest}`,
      client_id: client?.id,
      client_name: client?.name,
      status: 'briefing',
      demand_status: 'em_producao',
      priority: requestPriority,
      tag: pieceType === 'Vídeo Reels' ? 'Vídeo' : pieceType === 'Anúncio Pago' ? 'Mídia Paga' : 'Social Media',
      assigned_to: 'Bruno',
      deadline: targetDeadline,
      comments: [
        {
          id: `comment-${Date.now()}`,
          author_name: profile?.name || client?.contact_name || 'Cliente',
          content: `Solicitação enviada via Portal do Cliente:\n\nFormato: ${pieceType}\nPrazo Solicitado: ${targetDeadline}\n\n${newRequest}`,
          created_at: new Date().toISOString()
        }
      ]
    });
    
    setRequestSent(true);
    setNewRequest('');
    setNewRequestTitle('');
    setDesiredDeadline('');
    toast.success('Solicitação enviada com sucesso para a equipe da agência!');
    setTimeout(() => setRequestSent(false), 4000);
  };

  // Handler de voz
  const toggleVoice = () => {
    if (isRecording) {
      window.__clientSpeech?.stop();
      setIsRecording(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { 
        toast.error('Seu navegador não suporta gravação de voz. Use o Google Chrome.'); 
        return; 
      }
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

  if (!client) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-cs-bg p-8 text-center">
        <img src="/logo.png" alt="CS Ag" className="h-16 mb-6 opacity-30" />
        <div className="text-red-400 mb-2 text-lg font-bold">Nenhum cliente associado à sua conta</div>
        <p className="text-cs-text-secondary text-sm">Contate o administrador da agência para vincular sua conta.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'aprovacoes', label: `Aprovações (${pendingApprovals.length})`, icon: FileCheck },
    { id: 'solicitacoes', label: 'Nova Solicitação', icon: MessageSquarePlus },
  ];

  return (
    <div className="h-full flex flex-col bg-cs-bg overflow-y-auto custom-scrollbar">
      {/* Header do Portal */}
      <div className="bg-cs-surface border-b border-cs-border p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl border border-white/10"
              style={{ background: `linear-gradient(135deg, ${client.brand_color || '#3b82f6'}, #18181b)` }}>
              {client.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{client.name}</h1>
              <p className="text-xs text-cs-text-secondary">Portal Oficial do Cliente • Olá, {profile?.name || client.contact_name || 'Cliente'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {client.drive_url && (
              <a 
                href={client.drive_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <FolderOpen size={15} /> Pasta no Drive <ExternalLink size={12} />
              </a>
            )}
            <img src="/logo.png" alt="CS Ag" className="h-10 opacity-70" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedTask(null); }}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-cs-primary text-black font-bold shadow-lg shadow-cs-primary/10" 
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
      <div className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Em andamento</span>
                </div>
                <div className="text-3xl font-black text-white font-mono">{activeTasks.length}</div>
                <p className="text-[10px] text-cs-text-secondary mt-1">Jobs em produção ou revisão</p>
              </div>

              <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-orange-400" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Aguardando Você</span>
                </div>
                <div className="text-3xl font-black text-orange-400 font-mono">{pendingApprovals.length}</div>
                <p className="text-[10px] text-cs-text-secondary mt-1">Materiais prontos para aprovação</p>
              </div>

              <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Entregas Concluídas</span>
                </div>
                <div className="text-3xl font-black text-green-400 font-mono">{completedTasks.length}</div>
                <p className="text-[10px] text-cs-text-secondary mt-1">Peças publicadas com sucesso</p>
              </div>

              <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-cs-primary" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Status da Conta</span>
                </div>
                <div className="text-xl font-bold text-white uppercase mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  Operação Ativa
                </div>
                <p className="text-[10px] text-cs-text-secondary mt-1">SLA e ritos em dia</p>
              </div>
            </div>

            {/* Tarefas ativas do cliente */}
            <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-cs-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={16} className="text-yellow-400" />
                  Demandas e Cronograma da Sua Marca
                </h3>
                <span className="text-xs text-cs-text-secondary font-mono">{clientTasks.length} demandas cadastradas</span>
              </div>
              <div className="divide-y divide-cs-border">
                {clientTasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500/20" />
                    <p className="text-cs-text-secondary text-sm">Nenhum projeto ativo no momento. Tudo em dia! 🎉</p>
                  </div>
                ) : (
                  clientTasks.map(task => {
                    const status = STATUS_MAP[task.status] || STATUS_MAP['backlog'];
                    const deadline = safeDate(task.deadline);
                    return (
                      <div 
                        key={task.id} 
                        className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group flex items-center justify-between"
                        onClick={() => { setSelectedTask(task); setActiveTab('aprovacoes'); }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border", status.bg, status.color)}>
                            {status.label}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">{task.title || 'Sem título'}</h4>
                            <p className="text-[10px] text-cs-text-secondary mt-0.5">
                              {task.tag || 'Geral'} • Prazo: {deadline ? format(deadline, "dd 'de' MMM", { locale: ptBR }) : 'Em definição'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cs-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold">Ver Peça & Aprovar</span>
                          <ChevronRight size={16} className="text-cs-text-secondary group-hover:text-yellow-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'aprovacoes' && (
          <div className="space-y-6">
            {selectedTask ? (
              <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/40">
                  <div>
                    <button onClick={() => setSelectedTask(null)} className="text-xs text-cs-text-secondary hover:text-white mb-2 flex items-center gap-1">
                      ← Voltar à lista
                    </button>
                    <h3 className="text-xl font-bold text-white">{selectedTask.title}</h3>
                    <p className="text-xs text-cs-text-secondary mt-1">{selectedTask.description || selectedTask.notes || 'Sem briefing adicional.'}</p>
                  </div>
                  <div className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase border", (STATUS_MAP[selectedTask.status] || STATUS_MAP['backlog']).bg, (STATUS_MAP[selectedTask.status] || STATUS_MAP['backlog']).color)}>
                    {(STATUS_MAP[selectedTask.status] || STATUS_MAP['backlog']).label}
                  </div>
                </div>
                <div className="p-8">
                  <ApprovalFlow 
                    taskId={selectedTask.id} 
                    userRole="client" 
                    userId={profile?.id} 
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white">Central de Avaliação & Aprovação</h2>
                  <p className="text-xs text-cs-text-secondary">Revise as peças produzidas pela agência, solicite ajustes com notas de voz ou aprove com 1 clique.</p>
                </div>

                {pendingApprovals.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} /> Aguardando Sua Aprovação Imediata ({pendingApprovals.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingApprovals.map(task => (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)}
                          className="bg-cs-surface border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500 transition-all cursor-pointer group shadow-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 uppercase">
                              {task.tag || 'Criativo'}
                            </span>
                            <span className="text-xs text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Revisar Agora <ChevronRight size={14} />
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors mb-1">{task.title}</h4>
                          <p className="text-xs text-cs-text-secondary line-clamp-2">{task.description || 'Clique para abrir o entregável e registrar sua decisão.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demais tarefas para acompanhamento */}
                <div className="pt-4 space-y-4">
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest">
                    Todas as Demandas da Conta ({clientTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {clientTasks.map(task => {
                      const status = STATUS_MAP[task.status] || STATUS_MAP['backlog'];
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)}
                          className="bg-cs-surface border border-cs-border rounded-2xl p-5 hover:border-cs-primary/40 transition-all cursor-pointer group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase", status.bg, status.color)}>
                              {status.label}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-cs-primary transition-colors">{task.title}</h4>
                              <p className="text-[10px] text-cs-text-secondary">{task.tag || 'Social Media'}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-cs-text-secondary group-hover:text-white transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'solicitacoes' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-cs-border bg-cs-bg/30">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus size={22} className="text-yellow-400" />
                  Abrir Nova Solicitação para a Agência
                </h3>
                <p className="text-xs text-cs-text-secondary mt-1">
                  Precisa de um post novo, ajuste em arte, vídeo ou campanha? Digite abaixo ou use o microfone para gravar seu pedido.
                </p>
              </div>
              <div className="p-8 space-y-6">
                {isMedicalClient && (
                  <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 text-xs text-sky-300 flex items-start gap-3">
                    <Sparkles size={18} className="text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white mb-0.5">Conformidade Médica CFM 2.336/2023 Ativa</p>
                      <p className="leading-relaxed opacity-90">
                        Para o Dr. Alberto Brasil, toda peça criada inclui obrigatoriamente CRM-MG 39529 e RQE 15412. Conteúdo estritamente educativo, sem promessas de resultado e sem antes/depois.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Tipo de Peça / Formato</label>
                    <select
                      value={pieceType}
                      onChange={(e) => setPieceType(e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cs-primary cursor-pointer"
                    >
                      <option value="Carrossel">Carrossel (Instagram/LinkedIn)</option>
                      <option value="Post Único">Post Estático / Feed</option>
                      <option value="Story">Sequência de Stories</option>
                      <option value="Vídeo Reels">Roteiro / Edição Reels</option>
                      <option value="Anúncio Pago">Criativo para Meta/Google Ads</option>
                      <option value="Landing Page">Landing Page / Site</option>
                      <option value="Identidade Visual">Design / Embalagem / Impresso</option>
                      <option value="Outro">Outra Demanda</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Prazo Desejado</label>
                    <input
                      type="date"
                      value={desiredDeadline}
                      onChange={(e) => setDesiredDeadline(e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cs-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Prioridade</label>
                    <select
                      value={requestPriority}
                      onChange={(e) => setRequestPriority(e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cs-primary cursor-pointer"
                    >
                      <option value="medium">Normal (Planejada)</option>
                      <option value="high">Alta (Prioritária)</option>
                      <option value="urgent">Urgente (Imediata)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Título Resumido da Demanda</label>
                  <input
                    type="text"
                    value={newRequestTitle}
                    onChange={(e) => setNewRequestTitle(e.target.value)}
                    placeholder="Ex: Post sobre mitos e verdades do laser transdérmico"
                    className="w-full bg-cs-bg border border-cs-border rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Descrição / Detalhes do Pedido *</label>
                  <div className="relative">
                    <textarea
                      value={newRequest}
                      onChange={(e) => setNewRequest(e.target.value)}
                      placeholder="Ex: Bruno, gostaria de focar no esclarecimento para pacientes que sentem peso nas pernas ao final do dia..."
                      className="w-full bg-cs-bg border border-cs-border rounded-2xl p-5 pr-16 text-sm text-white focus:outline-none focus:border-cs-primary resize-none h-36 placeholder:text-cs-text-secondary/50 leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={cn(
                        "absolute right-4 bottom-4 p-3 rounded-xl transition-all shadow-lg",
                        isRecording 
                          ? "bg-red-500 text-white animate-pulse shadow-red-500/30" 
                          : "bg-cs-surface hover:bg-yellow-500/20 text-cs-text-secondary hover:text-yellow-400 border border-cs-border"
                      )}
                      title={isRecording ? "Parar gravação" : "Ditar por voz"}
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  </div>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-pulse">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    🎤 Gravando áudio... Fale normalmente seu pedido que converteremos em texto.
                  </div>
                )}

                {requestSent && (
                  <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-2xl p-4 animate-in fade-in">
                    <CheckCircle2 size={16} />
                    Sua demanda foi gerada no Kanban da agência e a equipe já foi notificada!
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={!newRequest.trim()}
                  className="w-full bg-cs-primary hover:bg-cs-primary-hover disabled:opacity-30 disabled:grayscale text-black font-bold py-4 rounded-2xl text-sm transition-all shadow-xl shadow-cs-primary/20 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Send size={18} />
                  Enviar Demanda para a Agência
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-cs-border bg-cs-surface/50 flex items-center justify-between text-xs text-cs-text-secondary">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CS Ag" className="h-6 opacity-40" />
          <span>Comunica OS • Central de Atendimento ao Cliente</span>
        </div>
        <span>
          © 2026 Comunicação Social Ag
        </span>
      </div>
    </div>
  );
}
