import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Zap, Clock, AlertTriangle, CheckCircle2,
  Calendar, TrendingUp, Folder, ChevronRight, Sparkles,
  Sun, Sunset, Moon, RefreshCw, User
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateContent } from '../lib/gemini';
import { cn as clsxCn } from '../utils/cn';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-zinc-600', dot: 'bg-zinc-400', border: 'border-zinc-500/30' },
  { id: 'briefing', title: 'Briefing / Planejamento', color: 'bg-blue-600', dot: 'bg-blue-400', border: 'border-blue-500/30' },
  { id: 'em-producao', title: 'Em Produção', color: 'bg-purple-600', dot: 'bg-purple-400', border: 'border-purple-500/30' },
  { id: 'revisao-interna', title: 'Revisão Interna', color: 'bg-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-500/30' },
  { id: 'aguardando-cliente', title: 'Aguardando Cliente', color: 'bg-orange-600', dot: 'bg-orange-400', border: 'border-orange-500/30' },
  { id: 'ajustes', title: 'Ajustes / Refação', color: 'bg-red-600', dot: 'bg-red-400', border: 'border-red-500/30' },
  { id: 'concluido', title: 'Concluído / Agendado', color: 'bg-green-600', dot: 'bg-green-400', border: 'border-green-500/30' },
];

function safeDate(str) {
  try { return str ? parseISO(str) : null; } catch { return null; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Bom dia', icon: Sun };
  if (h < 18) return { text: 'Boa tarde', icon: Sunset };
  return { text: 'Boa noite', icon: Moon };
}

const STATUS_COLOR = {
  'backlog': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  'briefing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'em-producao': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'revisao-interna': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'aguardando-cliente': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'ajustes': 'bg-red-500/10 text-red-400 border-red-500/20',
  'concluido': 'bg-green-500/10 text-green-400 border-green-500/20',
};
const STATUS_LABEL = {
  'backlog': 'Backlog', 'briefing': 'Briefing', 'em-producao': 'Em Produção',
  'revisao-interna': 'Revisão', 'aguardando-cliente': 'Aguard. Cliente',
  'ajustes': 'Ajustes', 'concluido': 'Concluído',
};

function TaskRow({ task, onOpen }) {
  const deadline = safeDate(task.deadline);
  const isOverdue = deadline && isPast(deadline) && task.status !== 'concluido';
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null;

  return (
    <button
      onClick={() => onOpen?.(task)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-cs-bg hover:bg-cs-surface border border-cs-border hover:border-cs-primary/30 transition-all text-left group"
    >
      <div className={cn("w-2 h-2 rounded-full shrink-0", isOverdue ? "bg-red-500 animate-pulse" : "bg-cs-primary")} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{task.title}</p>
        <p className="text-[10px] text-cs-text-secondary truncate">{task.client?.name || task.client_name || '—'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {deadline && (
          <span className={cn("text-[10px] font-bold", isOverdue ? "text-red-400" : daysLeft === 0 ? "text-orange-400" : "text-cs-text-secondary")}>
            {isOverdue ? `${Math.abs(daysLeft)}d atrasada` : daysLeft === 0 ? 'Hoje' : daysLeft === 1 ? 'Amanhã' : `${daysLeft}d`}
          </span>
        )}
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold", STATUS_COLOR[task.status] || STATUS_COLOR.backlog)}>
          {STATUS_LABEL[task.status] || task.status}
        </span>
      </div>
    </button>
  );
}

function SectionCard({ title, icon: Icon, count, color = 'cs-primary', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-cs-bg/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-${color}/15 flex items-center justify-center`}>
            <Icon size={16} className={`text-${color}`} />
          </div>
          <span className="font-bold text-white text-sm">{title}</span>
          {count > 0 && (
            <span className="text-[10px] bg-cs-bg border border-cs-border text-cs-text-secondary px-1.5 py-0.5 rounded-full font-bold">
              {count}
            </span>
          )}
        </div>
        <ChevronRight size={16} className={cn("text-cs-text-secondary transition-transform", open && "rotate-90")} />
      </button>
      {open && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}

function AIBriefing({ tasks, userName }) {
  const [briefing, setBriefing] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    const overdue = tasks.filter(t => {
      const d = safeDate(t.deadline);
      return d && isPast(d) && t.status !== 'concluido';
    });
    const today = tasks.filter(t => {
      const d = safeDate(t.deadline);
      return d && isToday(d);
    });

    const prompt = `Você é um assistente de gestão de agência de marketing. 
O usuário se chama ${userName}. 
Tarefas vencendo hoje: ${today.map(t => t.title).join(', ') || 'nenhuma'}. 
Tarefas atrasadas: ${overdue.map(t => t.title).join(', ') || 'nenhuma'}.
Total de tarefas ativas: ${tasks.filter(t => t.status !== 'concluido').length}.

Gere um resumo do dia em 2-3 frases, em tom profissional e motivador. Seja direto e específico. Não use listas, só texto corrido.`;

    try {
      const result = await generateContent(prompt);
      setBriefing(result);
      setGenerated(true);
    } catch {
      setBriefing('Bom trabalho hoje. Foque nas tarefas com prazo para hoje e mantenha o Kanban atualizado.');
      setGenerated(true);
    }
    setLoading(false);
  }, [tasks, userName]);

  useEffect(() => { if (!generated && tasks.length > 0) generate(); }, [tasks.length]);

  return (
    <div className="bg-gradient-to-br from-cs-primary/10 to-cs-accent/5 border border-cs-primary/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cs-primary" />
          <span className="text-xs font-bold text-cs-primary uppercase tracking-wider">Resumo IA do Dia</span>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="text-cs-text-secondary hover:text-cs-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-3 bg-cs-surface rounded animate-pulse" style={{ width: i === 0 ? '100%' : '75%' }} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/90 leading-relaxed">{briefing || 'Gerando seu resumo...'}</p>
      )}
    </div>
  );
}

export default function DashboardView({ onOpenTask }) {
  const { profile } = useAuth();
  const { tasks, updateTask, addComment, toggleChecklist } = useTasks();
  const { projects } = useProjects();
  const { setContext } = useAIAssistant();
  const [selectedTask, setSelectedTask] = useState(null);

  const handleOpenTask = onOpenTask || setSelectedTask;

  const userName = profile?.name || 'Usuário';
  const userRole = profile?.role;

  // Filtra tarefas pelo usuário logado (exceto admin vê tudo)
  const myTasks = userRole === 'admin'
    ? tasks.filter(t => t.status !== 'concluido')
    : tasks.filter(t =>
        t.status !== 'concluido' &&
        (t.assigned_to === userName || t.assigned_to_id === profile?.id)
      );

  const overdueTasks = myTasks.filter(t => {
    const d = safeDate(t.deadline);
    return d && isPast(d) && !isToday(d);
  });

  const todayTasks = myTasks.filter(t => {
    const d = safeDate(t.deadline);
    return d && isToday(d);
  });

  const tomorrowTasks = myTasks.filter(t => {
    const d = safeDate(t.deadline);
    return d && isTomorrow(d);
  });

  const weekTasks = myTasks.filter(t => {
    const d = safeDate(t.deadline);
    return d && isThisWeek(d) && !isToday(d) && !isTomorrow(d) && !isPast(d);
  });

  const backlogTasks = myTasks.filter(t => {
    const d = safeDate(t.deadline);
    return !d || (!isToday(d) && !isTomorrow(d) && !isThisWeek(d) && !isPast(d));
  });

  const activeProjects = projects.filter(p => p.status !== 'concluido' && p.status !== 'cancelado');

  const { text: greetText, icon: GreetIcon } = getGreeting();

  // Contextualiza IA do assistente
  useEffect(() => {
    setContext({
      module: 'dashboard',
      title: 'Dashboard Pessoal',
      data: {
        usuario: userName,
        tarefas_hoje_n: todayTasks.length,
        tarefas_hoje_lista: todayTasks.map(t => t.title),
        tarefas_atrasadas_n: overdueTasks.length,
        tarefas_atrasadas_lista: overdueTasks.map(t => t.title),
        tarefas_semana_n: weekTasks.length,
        projetos_ativos_n: activeProjects.length,
        projetos_ativos_lista: activeProjects.map(p => ({
          nome: p.name,
          cliente: p.client_name,
          status: p.status,
          progresso: p.task_count > 0 ? Math.round((p.tasks_done / p.task_count) * 100) + '%' : '0%'
        })),
        clientes_ativos_n: [...new Set(activeProjects.map(p => p.client_name))].filter(Boolean).length
      },
    });
  }, [todayTasks.length, overdueTasks.length, activeProjects.length]);

  return (
    <div className="h-full overflow-y-auto bg-cs-bg custom-scrollbar">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-cs-text-secondary text-sm mb-1">
              <GreetIcon size={16} />
              <span>{greetText},</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{userName}</h1>
            <p className="text-cs-text-secondary text-sm mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          {/* KPIs rápidos */}
          <div className="flex gap-3">
            {[
              { label: 'Hoje', value: todayTasks.length, color: 'text-cs-primary', bg: 'bg-cs-primary/10', border: 'border-cs-primary/20' },
              { label: 'Atrasadas', value: overdueTasks.length, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
              { label: 'Esta Semana', value: weekTasks.length, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            ].map(kpi => (
              <div key={kpi.label} className={cn("border rounded-xl px-4 py-3 text-center min-w-[80px]", kpi.bg, kpi.border)}>
                <p className={cn("text-2xl font-black", kpi.color)}>{kpi.value}</p>
                <p className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-wider">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Briefing */}
        <AIBriefing tasks={myTasks} userName={userName} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left col: Tasks */}
          <div className="lg:col-span-2 space-y-4">

            {/* Urgências / Atrasadas */}
            {overdueTasks.length > 0 && (
              <SectionCard title="Urgências e Atrasadas" icon={AlertTriangle} count={overdueTasks.length} color="red-500" defaultOpen={true}>
                {overdueTasks.map(t => <TaskRow key={t.id} task={t} onOpen={handleOpenTask} />)}
              </SectionCard>
            )}

            {/* Hoje */}
            <SectionCard title="Hoje" icon={Zap} count={todayTasks.length} color="cs-primary" defaultOpen={true}>
              {todayTasks.length === 0
                ? <p className="text-xs text-cs-text-secondary text-center py-4">Nenhuma tarefa para hoje. 🎉</p>
                : todayTasks.map(t => <TaskRow key={t.id} task={t} onOpen={handleOpenTask} />)
              }
            </SectionCard>

            {/* Amanhã */}
            {tomorrowTasks.length > 0 && (
              <SectionCard title="Amanhã" icon={Calendar} count={tomorrowTasks.length} color="blue-400" defaultOpen={false}>
                {tomorrowTasks.map(t => <TaskRow key={t.id} task={t} onOpen={handleOpenTask} />)}
              </SectionCard>
            )}

            {/* Esta Semana */}
            {weekTasks.length > 0 && (
              <SectionCard title="Esta Semana" icon={Calendar} count={weekTasks.length} color="indigo-400" defaultOpen={false}>
                {weekTasks.map(t => <TaskRow key={t.id} task={t} onOpen={handleOpenTask} />)}
              </SectionCard>
            )}

            {/* Backlog */}
            {backlogTasks.length > 0 && (
              <SectionCard title="A Fazer (Sem Prazo)" icon={Clock} count={backlogTasks.length} color="zinc-400" defaultOpen={false}>
                {backlogTasks.slice(0, 5).map(t => <TaskRow key={t.id} task={t} onOpen={handleOpenTask} />)}
                {backlogTasks.length > 5 && (
                  <p className="text-[10px] text-cs-text-secondary text-center pt-1">+ {backlogTasks.length - 5} tarefas</p>
                )}
              </SectionCard>
            )}
          </div>

          {/* Right col: Projects + Stats */}
          <div className="space-y-4">

            {/* Projetos em Andamento */}
            <div className="bg-cs-surface border border-cs-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Folder size={15} className="text-cs-primary" />
                <span className="text-sm font-bold text-white">Projetos Ativos</span>
                <span className="ml-auto text-[10px] text-cs-text-secondary">{activeProjects.length}</span>
              </div>
              <div className="space-y-3">
                {activeProjects.slice(0, 5).map(proj => {
                  const pct = proj.task_count > 0 ? Math.round((proj.tasks_done / proj.task_count) * 100) : 0;
                  return (
                    <div key={proj.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium truncate">{proj.name}</p>
                          <p className="text-[10px] text-cs-text-secondary truncate">{proj.client_name}</p>
                        </div>
                        <span className="text-[10px] text-cs-text-secondary font-bold ml-2 shrink-0">{pct}%</span>
                      </div>
                      <div className="w-full bg-cs-bg rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-cs-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {activeProjects.length === 0 && (
                  <p className="text-xs text-cs-text-secondary text-center py-4">Nenhum projeto ativo.</p>
                )}
              </div>
            </div>

            {/* Resumo de Performance */}
            <div className="bg-cs-surface border border-cs-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-cs-primary" />
                <span className="text-sm font-bold text-white">Desempenho</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Total de tarefas', value: myTasks.length, color: 'text-white' },
                  { label: 'Em produção', value: myTasks.filter(t => t.status === 'em-producao').length, color: 'text-purple-400' },
                  { label: 'Aguard. cliente', value: myTasks.filter(t => t.status === 'aguardando-cliente').length, color: 'text-orange-400' },
                  { label: 'Concluídas (demo)', value: tasks.filter(t => t.status === 'concluido').length, color: 'text-green-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-cs-text-secondary">{item.label}</span>
                    <span className={cn("text-sm font-bold", item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      {selectedTask && (
        <TaskModal
          task={tasks.find(t => t.id === selectedTask.id) || selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onAddComment={addComment}
          onToggleChecklist={toggleChecklist}
          columns={COLUMNS}
          user={profile}
        />
      )}
    </div>
  </div>
);
}



