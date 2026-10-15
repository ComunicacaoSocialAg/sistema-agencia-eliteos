import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, Clock, CheckCircle2, MessageSquare, Plus, 
  Calendar, MoreHorizontal, LayoutGrid, CalendarDays, Zap, 
  ChevronLeft, ChevronRight, X, Sparkles, RefreshCw, Share2, Filter, ExternalLink, Copy 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO, isSameDay, isToday, isPast, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTasks } from '../hooks/useTasks';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../contexts/AuthContext';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useGoogleSync } from '../hooks/useGoogleSync';
import { useActiveClient } from '../contexts/ActiveClientContext';
import TaskModal from '../components/TaskModal';
import NewTaskModal from '../components/NewTaskModal';
import { cn } from '../utils/cn';

// --- CONSTANTS ---
const COLUMNS = [
  { id: 'backlog', title: 'Backlog', dot: 'bg-zinc-500', color: 'border-zinc-500/30', count: 0 },
  { id: 'briefing', title: 'Briefing', dot: 'bg-blue-500', color: 'border-blue-500/30', count: 0 },
  { id: 'em-producao', title: 'Produção', dot: 'bg-yellow-500', color: 'border-yellow-500/30', count: 0 },
  { id: 'revisao-interna', title: 'Revisão', dot: 'bg-purple-500', color: 'border-purple-500/30', count: 0 },
  { id: 'aguardando-cliente', title: 'Cliente', dot: 'bg-orange-500', color: 'border-orange-500/30', count: 0 },
  { id: 'ajustes', title: 'Ajustes', dot: 'bg-red-500', color: 'border-red-500/30', count: 0 },
  { id: 'concluido', title: 'Concluído', dot: 'bg-green-500', color: 'border-green-500/30', count: 0 },
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
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

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

// --- TASK CARD ---
function TaskCard({ task, onTaskClick, onUpdate }) {
  const checklist = task.checklist || [];
  const comments = task.comments || [];
  const clientName = task.client_name || task.client?.name || 'Cliente';
  const assignedTo = task.assigned_to || 'Bruno';

  const handleCopyApprovalLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/aprovar/${task.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de aprovação copiado!');
  };
  
  return (
    <div 
      className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 p-5 rounded-2xl shadow-sm hover:shadow-xl group transition-all duration-200 cursor-pointer active:scale-[0.99] relative"
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start justify-between mb-2.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cs-bg text-cs-text-secondary border border-cs-border uppercase tracking-wider truncate max-w-[150px]">
          {clientName}
        </span>
        <button 
          onClick={handleCopyApprovalLink}
          className="text-cs-text-secondary hover:text-cs-primary p-1 transition-colors"
          title="Copiar Link de Aprovação do Cliente"
        >
          <Copy size={12} />
        </button>
      </div>

      <h4 className="font-bold text-white mb-3 text-sm leading-snug tracking-tight">{task.title || 'Sem título'}</h4>

      {/* Tag */}
      <div className="mb-3">
        <span className={cn("text-[9px] px-2 py-0.5 rounded-lg border font-bold uppercase tracking-wider", TAG_COLORS[task.tag] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20')}>
          {task.tag || 'Geral'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 text-xs text-cs-text-secondary mt-1 pt-2 border-t border-cs-border/40">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-cs-primary/70" />
          <span className="text-[10px]">
            {task.deadline && safeParseISO(task.deadline)
              ? format(safeParseISO(task.deadline), "dd MMM", { locale: ptBR }) 
              : 'S/ prazo'}
          </span>
        </div>

        {/* Checklist Progress */}
        {checklist.length > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cs-primary/10 text-cs-primary border border-cs-primary/20">
            <CheckCircle2 size={10} />
            <span className="font-bold text-[9px]">
              {checklist.filter(i => i.is_done).length}/{checklist.length}
            </span>
          </div>
        )}

        {/* Effort Display */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cs-bg text-cs-text-secondary border border-cs-border">
          <Clock size={10} />
          <span className="font-bold text-[9px]">{task.actual_hours || task.estimated_hours || 1}h</span>
        </div>

        {/* Timer Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ ...task, isTracking: !task.isTracking });
          }}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold transition-all ml-auto",
            task.isTracking
              ? "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse"
              : "bg-cs-bg text-cs-text-secondary border-cs-border hover:text-white hover:border-cs-primary/30"
          )}
          title={task.isTracking ? 'Pausar timer' : 'Iniciar timer'}
        >
          {task.isTracking ? <Pause size={9} /> : <Play size={9} />}
          {formatTime(task.trackedSeconds || 0)}
        </button>

        <div className="flex items-center gap-1 bg-cs-bg px-1.5 py-0.5 rounded border border-cs-border">
          <div className="w-3.5 h-3.5 rounded-full bg-cs-primary flex items-center justify-center text-[7px] text-black font-bold">
            {assignedTo.charAt(0)}
          </div>
          <span className="font-bold text-white text-[9px]">{assignedTo}</span>
        </div>
      </div>
    </div>
  );
}

// --- KANBAN VIEW ---
function KanbanView({ tasks = [], onTaskClick, onUpdate }) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden flex items-start gap-4 p-6 custom-scrollbar">
      {COLUMNS.map(column => {
        const colTasks = tasks.filter(t => {
          if (column.id === 'concluido') return t.status === 'concluido' || t.status === 'finalizado';
          return t.status === column.id;
        });

        return (
          <div key={column.id} className="flex-shrink-0 w-80 h-full flex flex-col bg-cs-surface/40 rounded-2xl border border-cs-border overflow-hidden">
            {/* Header Column */}
            <div className="p-4 border-b border-cs-border flex items-center justify-between bg-cs-bg/30">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.dot}`}></div>
                <h3 className="font-bold text-white text-sm">{column.title}</h3>
              </div>
              <span className="text-xs font-bold text-cs-text-secondary bg-cs-bg px-2 py-0.5 rounded-full border border-cs-border font-mono">
                {colTasks.length}
              </span>
            </div>

            {/* Column Cards Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {colTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onTaskClick={onTaskClick} 
                  onUpdate={onUpdate} 
                />
              ))}

              {colTasks.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-cs-border/40 rounded-xl text-xs text-cs-text-secondary/60">
                  Nenhum item
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- CALENDAR VIEW ---
function CalendarView({ tasks = [], onTaskClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDayOfWeek = startOfMonth(currentMonth).getDay();

  return (
    <div className="h-full flex flex-col p-6 bg-cs-bg overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-bold text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 rounded-lg bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white transition-colors text-xs font-bold">
            Hoje
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-cs-text-secondary py-1 uppercase">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-1 overflow-hidden">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded-xl bg-cs-surface/10"></div>
        ))}

        {days.map(day => {
          const dayTasks = safeTasks.filter(t => {
            const d = safeParseISO(t.deadline);
            return d && isSameDay(d, day);
          });
          const isCurrentDay = isToday(day);
          return (
            <div key={day.toISOString()} className={cn(
              "rounded-xl border p-2 flex flex-col gap-1 overflow-hidden transition-colors",
              isCurrentDay ? "border-cs-primary bg-cs-primary/5" : "border-cs-border bg-cs-surface/30 hover:bg-cs-surface/60"
            )}>
              <span className={cn("text-xs font-bold self-start w-5 h-5 rounded-full flex items-center justify-center",
                isCurrentDay ? "bg-cs-primary text-black" : "text-cs-text-secondary"
              )}>
                {format(day, 'd')}
              </span>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {dayTasks.map(task => {
                  const col = COLUMNS.find(c => c.id === task.status);
                  return (
                    <button 
                      key={task.id} 
                      onClick={() => onTaskClick(task)}
                      className="w-full text-left truncate text-[10px] px-2 py-1 rounded-lg flex items-center gap-1.5 bg-cs-bg border border-cs-border hover:border-cs-primary transition-colors text-white font-medium"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${col?.dot || 'bg-zinc-400'}`}></div>
                      <span className="truncate">{task.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
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
  const { isConnected, syncing, connectGoogle, syncCalendar } = useGoogleSync();
  const [localTasks, setLocalTasks] = useState([]);
  const [viewMode, setViewMode] = useState('kanban');
  const { selectedClientId, matchesSelectedClient } = useActiveClient();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedClientForTemplate, setSelectedClientForTemplate] = useState('');
  const [filterClient, setFilterClient] = useState(() => selectedClientId !== 'all' ? selectedClientId : 'todos');
  const [filterTag, setFilterTag] = useState('todos');
  const timerRef = useRef(null);

  // Manter sincronizado quando mudar no header
  useEffect(() => {
    if (selectedClientId !== 'all') {
      setFilterClient(selectedClientId);
    }
  }, [selectedClientId]);

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

  const filteredTasks = useMemo(() => {
    return localTasks.filter(t => {
      const matchClient = filterClient === 'todos' 
        ? (selectedClientId === 'all' || matchesSelectedClient(t.client_id))
        : (t.client_id === filterClient || matchesSelectedClient(t.client_id) || (t.client && t.client.name === filterClient));
      const matchTag = filterTag === 'todos' || t.tag === filterTag;
      return matchClient && matchTag;
    });
  }, [localTasks, filterClient, filterTag, selectedClientId, matchesSelectedClient]);

  const activeTrackers = localTasks.filter(t => t.isTracking).length;

  return (
    <div className="h-full flex flex-col bg-cs-bg overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 pt-6 pb-4 gap-4 shrink-0 border-b border-cs-border/60">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-2.5">
             Mesa de Produção
             <Zap size={20} className="text-cs-primary fill-cs-primary/20" />
          </h2>
          <p className="text-xs text-cs-text-secondary">
            Workflow e esteira de entregas ágeis da agência
            {activeTrackers > 0 && (
              <span className="ml-3 text-green-400 font-bold animate-pulse">
                ● {activeTrackers} timer{activeTrackers > 1 ? 's' : ''} ativo{activeTrackers > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-cs-surface border border-cs-border px-3 py-1.5 rounded-xl text-xs">
            <Filter size={13} className="text-cs-text-secondary" />
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-cs-bg">Todos Clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-cs-bg">{c.name}</option>
              ))}
            </select>
            <span className="text-cs-border">|</span>
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-cs-bg">Todas Categorias</option>
              {['Social Media', 'Branding', 'Vídeo', 'Web', 'Campanha'].map(tag => (
                <option key={tag} value={tag} className="bg-cs-bg">{tag}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex bg-cs-surface border border-cs-border rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider", viewMode === 'kanban' ? "bg-cs-primary text-black font-bold shadow-md" : "text-cs-text-secondary hover:text-white")}
            >
              <LayoutGrid size={13} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider", viewMode === 'calendar' ? "bg-cs-primary text-black font-bold shadow-md" : "text-cs-text-secondary hover:text-white")}
            >
              <CalendarDays size={13} /> Calendário
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-cs-surface border border-cs-border hover:border-cs-primary text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LayoutGrid size={14} className="text-cs-primary" /> Templates
            </button>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={15} /> Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban'
          ? <KanbanView tasks={filteredTasks} onTaskClick={setSelectedTask} onUpdate={handleUpdate} />
          : <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />
        }
      </div>

      {/* Task Modal */}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateModal(false)}>
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-cs-border pb-4">
              <h2 className="text-lg font-bold text-white">Carregar Template de Produção</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-cs-text-secondary hover:text-white"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Cliente Destino</label>
                <select
                  value={selectedClientForTemplate}
                  onChange={e => setSelectedClientForTemplate(e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => {
                    const targetId = selectedClientForTemplate || clients[0]?.id || 'ce45a984-093d-4484-9ee4-9177d56310e3';
                    applyTemplate('social-media', targetId);
                    setShowTemplateModal(false);
                  }}
                  className="p-5 border border-cs-border rounded-2xl bg-cs-bg hover:border-cs-primary transition-all text-left group"
                >
                  <div className="text-cs-primary mb-2"><Share2 size={24} /></div>
                  <h3 className="text-sm font-bold text-white mb-1">Social Media</h3>
                  <p className="text-[10px] text-cs-text-secondary">4 tarefas mensais (Copy, Artes, Revisão, Agendamento)</p>
                </button>
                <button 
                  onClick={() => {
                    const targetId = selectedClientForTemplate || clients[0]?.id || 'ce45a984-093d-4484-9ee4-9177d56310e3';
                    applyTemplate('onboarding', targetId);
                    setShowTemplateModal(false);
                  }}
                  className="p-5 border border-cs-border rounded-2xl bg-cs-bg hover:border-cs-primary transition-all text-left group"
                >
                  <div className="text-cs-primary mb-2"><Zap size={24} /></div>
                  <h3 className="text-sm font-bold text-white mb-1">Onboarding</h3>
                  <p className="text-[10px] text-cs-text-secondary">3 tarefas de Setup, Boas-vindas e Kickoff</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
