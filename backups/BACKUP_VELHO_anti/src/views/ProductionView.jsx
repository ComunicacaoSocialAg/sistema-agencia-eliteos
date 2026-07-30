import { useState, useEffect, useRef } from 'react';
import { Calendar, MoreHorizontal, Play, Pause, Clock, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays, Plus, X, User, Zap, Globe, RefreshCw, CheckCircle2, MessageSquare, Share2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import NewTaskModal from '../components/NewTaskModal';
import TaskModal from '../components/TaskModal';
import { useGoogleSync } from '../hooks/useGoogleSync';
import { useClients } from '../hooks/useClients';


const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-zinc-600', dot: 'bg-zinc-400', border: 'border-zinc-500/30' },
  { id: 'briefing', title: 'Briefing / Plan', color: 'bg-blue-600', dot: 'bg-blue-400', border: 'border-blue-500/30' },
  { id: 'em-producao', title: 'Em Produção', color: 'bg-purple-600', dot: 'bg-purple-400', border: 'border-purple-500/30' },
  { id: 'revisao-interna', title: 'Revisão Interna', color: 'bg-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-500/30' },
  { id: 'aguardando-cliente', title: 'Aguardando Cliente', color: 'bg-orange-600', dot: 'bg-orange-400', border: 'border-orange-500/30' },
  { id: 'ajustes', title: 'Ajustes / Refação', color: 'bg-red-600', dot: 'bg-red-400', border: 'border-red-500/30' },
  { id: 'concluido', title: 'Concluído / Agendado', color: 'bg-green-600', dot: 'bg-green-400', border: 'border-green-500/30' },
];

const TAG_COLORS = {
  'Social Media': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Branding': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Vídeo': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Web': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Campanha': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};



function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

const TEAM_MEMBERS = ['Bruno', 'Deise', 'Carlos', 'Ana'];
const TAGS = ['Social Media', 'Branding', 'Vídeo', 'Web', 'Campanha'];
const CLIENTS = ['Ponto Cor', 'TechStart App', 'Café Blend', 'Clínica Sorriso'];



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

// --- CALENDAR VIEW ---
function CalendarView({ tasks = [], onTaskClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDayOfWeek = startOfMonth(currentMonth).getDay();

  return (
    <div className="h-full flex flex-col p-6 bg-cs-bg overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-bold text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 rounded-lg bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white transition-colors text-sm">
            Hoje
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-cs-text-secondary py-2">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-1 overflow-hidden">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded-lg bg-cs-surface/20"></div>
        ))}

        {days.map(day => {
          const dayTasks = safeTasks.filter(t => {
            const d = safeParseISO(t.deadline);
            return d && isSameDay(d, day);
          });
          const isCurrentDay = isToday(day);
          return (
            <div key={day.toISOString()} className={cn(
              "rounded-lg border p-2 flex flex-col gap-1 overflow-hidden transition-colors",
              isCurrentDay ? "border-cs-primary bg-cs-primary/5" : "border-cs-border bg-cs-surface/30 hover:bg-cs-surface/60"
            )}>
              <span className={cn("text-xs font-bold self-start w-6 h-6 rounded-full flex items-center justify-center",
                isCurrentDay ? "bg-cs-primary text-white" : "text-cs-text-secondary"
              )}>
                {format(day, 'd')}
              </span>
              {dayTasks.slice(0, 2).map(task => {
                const col = COLUMNS.find(c => c.id === task.status);
                return (
                  <button key={task.id} onClick={() => onTaskClick(task)}
                    className="w-full text-left truncate text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-cs-bg border border-cs-border hover:border-cs-primary transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${col?.dot || 'bg-zinc-400'}`}></div>
                    <span className="text-white truncate">{task.title || 'Sem título'}</span>
                  </button>
                );
              })}
              {dayTasks.length > 2 && (
                <span className="text-[10px] text-cs-text-secondary pl-1">+{dayTasks.length - 2} mais</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- KANBAN VIEW ---
function KanbanView({ tasks = [], onTaskClick, onUpdate }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const getTasksByStatus = (status) => safeTasks.filter(t => (t.status || 'backlog') === status);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-start gap-4 pb-4">
        {COLUMNS.map(column => {
          const colTasks = getTasksByStatus(column.id);
          return (
            <div key={column.id} className="flex-shrink-0 w-80 h-full flex flex-col bg-cs-surface/50 rounded-xl border border-cs-border">
              <div className="p-4 border-b border-cs-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-white text-sm">{column.title}</h3>
                </div>
                <span className="text-xs font-medium text-cs-text-secondary bg-cs-surface px-2 py-0.5 rounded-full border border-cs-border">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colTasks.map(task => (
                  <KanbanCard key={task.id} task={task} onTaskClick={onTaskClick} onUpdate={onUpdate} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- KANBAN CARD ---
function KanbanCard({ task, onTaskClick, onUpdate }) {
  const { toggleChecklist } = useTasks();
  
  if (!task) return null;

  // Safe data access
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const clientName = task.client?.name || (typeof task.client === 'string' ? task.client : 'Cliente');
  const assignedTo = task.assigned_to || 'Equipe';
  
  return (
    <div className="bg-cs-surface border border-cs-border hover:border-cs-primary/30 p-6 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-cs-primary/5 group transition-all duration-500 cursor-pointer active:scale-[0.98]" onClick={() => onTaskClick(task)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-cs-bg text-cs-text-secondary border border-cs-border uppercase tracking-widest">
          {clientName}
        </span>
        <button className="text-cs-text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); }}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h4 className="font-bold text-white mb-4 text-sm leading-snug tracking-tight">{task.title || 'Sem título'}</h4>

      {/* Tag */}
      <div className="mb-4">
        <span className={cn("text-[9px] px-2 py-1 rounded-lg border font-bold uppercase tracking-wider", TAG_COLORS[task.tag] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20')}>
          {task.tag || 'Geral'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-cs-text-secondary mt-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-cs-primary/70" />
          {task.deadline && safeParseISO(task.deadline)
            ? format(safeParseISO(task.deadline), "dd MMM", { locale: ptBR }) 
            : 'S/ data'}
        </div>

        {/* Checklist Progress */}
        {checklist.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cs-primary/10 text-cs-primary border border-cs-primary/20">
            <CheckCircle2 size={12} />
            <span className="font-bold text-[10px]">
              {checklist.filter(i => i.is_done).length}/{checklist.length}
            </span>
          </div>
        )}

        {/* Effort Display */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cs-bg text-cs-text-secondary border border-cs-border">
          <Clock size={12} />
          <span className="font-bold text-[10px]">{task.actual_hours || task.estimated_hours || 1}h</span>
        </div>

        {comments.length > 0 && (
          <div className="flex items-center gap-1 text-cs-text-secondary">
            <MessageSquare size={12} />
            <span className="text-[10px]">{comments.length}</span>
          </div>
        )}

        {/* Timer Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ ...task, isTracking: !task.isTracking });
          }}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all",
            task.isTracking
              ? "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse"
              : "bg-cs-bg text-cs-text-secondary border-cs-border hover:text-white hover:border-cs-primary/30"
          )}
          title={task.isTracking ? 'Pausar timer' : 'Iniciar timer'}
        >
          {task.isTracking ? <Pause size={10} /> : <Play size={10} />}
          {formatTime(task.trackedSeconds || 0)}
        </button>

        <div className="ml-auto flex items-center gap-1.5 bg-cs-bg px-2 py-1 rounded-lg border border-cs-border">
          <div className="w-4 h-4 rounded-full bg-cs-primary flex items-center justify-center text-[8px] text-white font-bold">
            {assignedTo.charAt(0)}
          </div>
          <span className="font-bold text-white text-[10px] uppercase tracking-tighter">{assignedTo}</span>
        </div>
      </div>
    </div>
  );
}


// --- MAIN COMPONENT ---
export default function ProductionView() {
  const { tasks = [], updateTask: saveTask, addComment, toggleChecklist, createTask, applyTemplate } = useTasks();
  const { clients = [] } = useClients();
  const { profile } = useAuth();
  const { setContext } = useAIAssistant();
  const { isConnected, syncing, connectGoogle, syncCalendar, syncTasks } = useGoogleSync();
  const [localTasks, setLocalTasks] = useState([]);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const timerRef = useRef(null);

  // Sync remote tasks to local (add is_tracking client-side)
  useEffect(() => {
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    setLocalTasks(tasksArray.map(t => ({ 
      ...t, 
      isTracking: !!t.is_tracking, 
      trackedSeconds: Number(t.tracked_seconds) || 0 
    })));
  }, [tasks]);

  // Global tick for all tracking tasks
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setLocalTasks(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(t =>
          t.isTracking ? { ...t, trackedSeconds: (t.trackedSeconds || 0) + 1 } : t
        );
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleUpdate = (updatedTask) => {
    setLocalTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
    if (!updatedTask.isTracking) {
      saveTask({ ...updatedTask, tracked_seconds: updatedTask.trackedSeconds });
    }
  };

  // Set AI context with real task data
  useEffect(() => {
    if (!localTasks || !setContext) return;
    
    const overdue = localTasks.filter(t => {
      const d = safeParseISO(t.deadline);
      return d && isPast(d) && t.status !== 'concluido';
    });

    setContext({
      module: 'producao',
      title: 'Atendimento & Produção',
      data: {
        total_tarefas: localTasks.length,
        por_status: Object.fromEntries(
          COLUMNS.map(c => [c.id, localTasks.filter(t => t.status === c.id).length])
        ),
        atrasadas: overdue.map(t => ({ 
          titulo: t.title || 'Sem título', 
          cliente: t.client?.name || t.client || 'Sem cliente', 
          responsavel: t.assigned_to || 'N/A', 
          prazo: t.deadline 
        })),
        timers_ativos: localTasks.filter(t => t.isTracking).length,
      },
    });
  }, [localTasks, setContext]);

  const activeTrackers = localTasks.filter(t => t.isTracking).length;

  return (
    <div className="h-full flex flex-col bg-cs-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-3">
             Mesa de Produção
             <Zap size={20} className="text-cs-primary fill-cs-primary/20" />
          </h2>
          <p className="text-sm text-cs-text-secondary">
            Acompanhamento e fluxo de entregas
            {activeTrackers > 0 && (
              <span className="ml-3 text-cs-primary font-bold animate-pulse">
                ● {activeTrackers} timer{activeTrackers > 1 ? 's' : ''} ativo{activeTrackers > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Google Sync - Simplified UI */}
          <div className="flex gap-2 mr-4 border-r border-cs-border pr-4">
            {!isConnected ? (
              <button 
                onClick={connectGoogle}
                className="text-[10px] font-bold text-cs-text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> CONECTAR GOOGLE
              </button>
            ) : (
              <button 
                onClick={() => syncCalendar(localTasks)}
                disabled={syncing}
                className="text-[10px] font-bold text-cs-primary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> SYNC ATIVA
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-cs-surface border border-cs-border rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest", viewMode === 'kanban' ? "bg-cs-primary text-white shadow-lg shadow-cs-primary/20" : "text-cs-text-secondary hover:text-white")}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest", viewMode === 'calendar' ? "bg-cs-primary text-white shadow-lg shadow-cs-primary/20" : "text-cs-text-secondary hover:text-white")}
            >
              <CalendarDays size={14} /> Calendário
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-cs-surface border border-cs-border hover:border-cs-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-surface/20 flex items-center gap-2 active:scale-95"
            >
              <LayoutGrid size={16} className="text-cs-primary" /> TEMPLATES
            </button>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-cs-primary hover:bg-cs-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2 active:scale-95"
            >
              <Plus size={16} /> NOVA TAREFA
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban'
          ? <KanbanView tasks={localTasks} onTaskClick={setSelectedTask} onUpdate={handleUpdate} />
          : <CalendarView tasks={localTasks} onTaskClick={setSelectedTask} />
        }
      </div>

      {/* Task Modal - Integrated with Elite Hooks */}
      {selectedTask && (
        <TaskModal
          task={localTasks.find(t => t.id === selectedTask.id) || selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onAddComment={addComment}
          onToggleChecklist={toggleChecklist}
          columns={COLUMNS}
          user={profile}
        />
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSave={(formData) => createTask(formData)}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateModal(false)}>
          <div className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Carregar Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-cs-text-secondary hover:text-white"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    const clientId = prompt("Qual o ID do cliente? (Deixe em branco para Demo)");
                    applyTemplate('social-media', clientId || '11111111-0000-0000-0000-000000000001', 'Cliente Selecionado');
                    setShowTemplateModal(false);
                  }}
                  className="p-4 border border-cs-border rounded-xl bg-cs-bg hover:border-cs-primary transition-all text-left group"
                >
                  <div className="text-cs-primary mb-2"><Share2 size={24} /></div>
                  <h3 className="text-sm font-bold text-white mb-1">Social Media</h3>
                  <p className="text-[10px] text-cs-text-secondary">4 tarefas padrão (Mensal)</p>
                </button>
                <button 
                  onClick={() => {
                    const clientId = prompt("Qual o ID do cliente? (Deixe em branco para Demo)");
                    applyTemplate('onboarding', clientId || '11111111-0000-0000-0000-000000000001', 'Cliente Selecionado');
                    setShowTemplateModal(false);
                  }}
                  className="p-4 border border-cs-border rounded-xl bg-cs-bg hover:border-cs-primary transition-all text-left group"
                >
                  <div className="text-cs-primary mb-2"><Zap size={24} /></div>
                  <h3 className="text-sm font-bold text-white mb-1">Onboarding</h3>
                  <p className="text-[10px] text-cs-text-secondary">3 tarefas iniciais</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
