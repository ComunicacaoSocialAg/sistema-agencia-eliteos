import { useState } from 'react';
import {
  X, ChevronRight, ChevronLeft, Folder, Users, Building2,
  Zap, Plus, Trash2, Calendar, DollarSign, FolderOpen, Check
} from 'lucide-react';
import { cn } from '../utils/cn';
import { PROJECT_TYPES, PROJECT_TEMPLATES, generateProjectTasks } from '../lib/projectTemplates';

// ─── Passo 1: Tipo do Projeto ─────────────────────────────────────────────────
function StepType({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Que tipo de projeto é este?</h3>
        <p className="text-xs text-cs-text-secondary">Escolha o tipo para carregar o template de tarefas padrão.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {PROJECT_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
              selected === type.id
                ? "border-cs-primary bg-cs-primary/10 text-white"
                : "border-cs-border bg-cs-bg hover:border-cs-primary/50 text-cs-text-secondary hover:text-white"
            )}
          >
            <span className="text-2xl">{type.icon}</span>
            <span className="text-sm font-medium leading-tight">{type.label}</span>
            {selected === type.id && (
              <Check size={14} className="ml-auto text-cs-primary shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Passo 2: Dados do Projeto ────────────────────────────────────────────────
function StepDetails({ form, setForm, clients, selectedType }) {
  const template = PROJECT_TEMPLATES[selectedType];
  const isInternal = selectedType === 'interno';
  const isProposal = selectedType === 'proposta';

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Detalhes do Projeto</h3>
        <p className="text-xs text-cs-text-secondary">
          {isProposal
            ? 'Um deal será criado automaticamente no CRM e uma pasta no Google Drive.'
            : isInternal
            ? 'Projeto interno da agência, sem vínculo com cliente externo.'
            : 'Preencha os dados do projeto para gerar as tarefas automaticamente.'}
        </p>
      </div>

      {/* Nome */}
      <div>
        <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1.5 block">
          Nome do Projeto *
        </label>
        <input
          autoFocus
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder={template?.name || 'Ex: Campanha de Verão 2026'}
          className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary"
        />
      </div>

      {/* Cliente */}
      {!isInternal && (
        <div>
          <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
            <Users size={11} /> {isProposal ? 'Prospect (cliente potencial)' : 'Cliente'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.client_id}
              onChange={e => {
                const c = clients.find(x => x.id === e.target.value);
                setForm(f => ({ ...f, client_id: e.target.value, client_name: c?.name || '' }));
              }}
              className="col-span-1 bg-cs-bg border border-cs-border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cs-primary"
            >
              <option value="">Selecionar cliente existente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_id: '', client_name: e.target.value }))}
              placeholder="Ou digitar nome do prospect"
              className="col-span-1 bg-cs-bg border border-cs-border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cs-primary placeholder:text-cs-text-secondary/50"
            />
          </div>
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
            <Calendar size={11} /> Início
          </label>
          <input
            type="date"
            value={form.start_date}
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cs-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
            <Calendar size={11} /> Prazo Final
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
            className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cs-primary"
          />
        </div>
      </div>

      {/* Valor */}
      <div>
        <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
          <DollarSign size={11} /> Valor do Projeto (R$)
        </label>
        <input
          type="number"
          value={form.value}
          onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
          placeholder="0 para projetos inclusos no fee"
          className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cs-primary placeholder:text-cs-text-secondary/50"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1.5 block">
          Descrição / Objetivo
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder={template?.description || 'Descreva o objetivo deste projeto...'}
          rows={2}
          className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cs-primary resize-none placeholder:text-cs-text-secondary/50"
        />
      </div>
    </div>
  );
}

// ─── Passo 3: Template de Tarefas ─────────────────────────────────────────────
function StepTasks({ tasks, setTasks, startDate }) {
  const TAGS = ['Social Media', 'Branding', 'Vídeo', 'Web', 'Campanha'];
  const MEMBERS = ['Bruno', 'Carlos', 'Ana'];

  const addTask = () => {
    setTasks(prev => [...prev, {
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      tag: 'Campanha',
      estimated_hours: 4,
      day_offset: 0,
      status: 'backlog',
      assigned_to: 'Bruno',
    }]);
  };

  const removeTask = (index) => setTasks(prev => prev.filter((_, i) => i !== index));

  const updateTask = (index, field, value) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const getDeadline = (dayOffset) => {
    if (!startDate) return '';
    const d = new Date(startDate);
    d.setDate(d.getDate() + (dayOffset || 0));
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-0.5">Template de Tarefas</h3>
          <p className="text-xs text-cs-text-secondary">Edite, remova ou adicione tarefas antes de disparar no Kanban.</p>
        </div>
        <button
          onClick={addTask}
          className="flex items-center gap-1.5 text-xs bg-cs-primary/10 hover:bg-cs-primary/20 text-cs-primary px-3 py-1.5 rounded-lg border border-cs-primary/20 transition-colors"
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {tasks.map((task, index) => (
          <div key={task.id || index} className="bg-cs-bg border border-cs-border rounded-xl p-4 space-y-3">
            {/* Row 1: Title + Remove */}
            <div className="flex gap-2">
              <input
                value={task.title}
                onChange={e => updateTask(index, 'title', e.target.value)}
                placeholder="Nome da tarefa"
                className="flex-1 bg-cs-surface border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
              <button onClick={() => removeTask(index)} className="p-2 text-cs-text-secondary hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Row 2: Meta info */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-cs-text-secondary uppercase tracking-wider block mb-1">D+</label>
                <input
                  type="number"
                  min={0}
                  value={task.day_offset || 0}
                  onChange={e => updateTask(index, 'day_offset', parseInt(e.target.value) || 0)}
                  className="w-full bg-cs-surface border border-cs-border rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cs-primary text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-cs-text-secondary uppercase tracking-wider block mb-1">Vencimento</label>
                <div className="text-xs text-cs-text-secondary py-1.5 px-2">{getDeadline(task.day_offset)}</div>
              </div>
              <div>
                <label className="text-[10px] text-cs-text-secondary uppercase tracking-wider block mb-1">Tag</label>
                <select
                  value={task.tag}
                  onChange={e => updateTask(index, 'tag', e.target.value)}
                  className="w-full bg-cs-surface border border-cs-border rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cs-primary"
                >
                  {TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-cs-text-secondary uppercase tracking-wider block mb-1">Responsável</label>
                <select
                  value={task.assigned_to || 'Bruno'}
                  onChange={e => updateTask(index, 'assigned_to', e.target.value)}
                  className="w-full bg-cs-surface border border-cs-border rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cs-primary"
                >
                  {MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-10 border border-dashed border-cs-border rounded-xl">
            <p className="text-cs-text-secondary text-sm">Nenhuma tarefa adicionada.</p>
            <button onClick={addTask} className="mt-2 text-cs-primary text-sm hover:underline">
              + Adicionar primeira tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Passo 4: Confirmação ─────────────────────────────────────────────────────
function StepConfirm({ form, tasks, selectedType }) {
  const typeInfo = PROJECT_TYPES.find(t => t.id === selectedType);
  const isProposal = selectedType === 'proposta';

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Tudo pronto para disparar</h3>
        <p className="text-xs text-cs-text-secondary">Revise o resumo antes de criar o projeto e as tarefas no sistema.</p>
      </div>

      <div className="bg-cs-bg border border-cs-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{typeInfo?.icon}</span>
          <div>
            <p className="font-bold text-white text-base">{form.name || 'Sem título'}</p>
            <p className="text-xs text-cs-text-secondary">{typeInfo?.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-cs-surface rounded-xl p-3">
            <p className="text-cs-text-secondary mb-0.5">Cliente</p>
            <p className="text-white font-medium">{form.client_name || 'Interno'}</p>
          </div>
          <div className="bg-cs-surface rounded-xl p-3">
            <p className="text-cs-text-secondary mb-0.5">Prazo</p>
            <p className="text-white font-medium">{form.end_date || 'Sem prazo'}</p>
          </div>
          {form.value > 0 && (
            <div className="bg-cs-surface rounded-xl p-3">
              <p className="text-cs-text-secondary mb-0.5">Valor</p>
              <p className="text-green-400 font-bold">R$ {Number(form.value).toLocaleString('pt-BR')}</p>
            </div>
          )}
          <div className="bg-cs-surface rounded-xl p-3">
            <p className="text-cs-text-secondary mb-0.5">Tarefas</p>
            <p className="text-white font-medium">{tasks.length} tarefas</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-cs-text-secondary">
          <Zap size={12} className="text-cs-primary" />
          <span>{tasks.length} tarefas serão criadas no Kanban de Produção.</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-cs-text-secondary">
          <FolderOpen size={12} className="text-cs-primary" />
          <span>Uma pasta será criada no Google Drive (quando configurado).</span>
        </div>
        {isProposal && (
          <div className="flex items-center gap-2 text-xs text-cs-text-secondary">
            <Building2 size={12} className="text-cs-primary" />
            <span>Um deal será criado automaticamente no CRM.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal Principal ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'type', label: 'Tipo' },
  { id: 'details', label: 'Dados' },
  { id: 'tasks', label: 'Tarefas' },
  { id: 'confirm', label: 'Confirmar' },
];

export default function NewProjectModal({ onClose, onSave, clients = [] }) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    name: '',
    client_id: '',
    client_name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    value: '',
    description: '',
  });

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    // Pré-carrega tasks do template
    const template = PROJECT_TEMPLATES[typeId];
    if (template) {
      setTasks(template.tasks.map((t, i) => ({ ...t, id: `tpl-${i}` })));
      if (!form.name) {
        setForm(f => ({ ...f, name: template.name }));
      }
    }
  };

  const canProceed = () => {
    if (step === 0) return !!selectedType;
    if (step === 1) return !!form.name.trim();
    return true;
  };

  const handleFinish = () => {
    const projectData = {
      ...form,
      type: selectedType,
      type_label: PROJECT_TYPES.find(t => t.id === selectedType)?.label || selectedType,
      value: Number(form.value) || 0,
      is_internal: selectedType === 'interno',
      is_proposal: selectedType === 'proposta',
      tasks,
    };
    onSave(projectData);
    onClose();
  };

  const currentStepId = STEPS[step].id;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-cs-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cs-primary/15 rounded-xl flex items-center justify-center">
              <Folder size={18} className="text-cs-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Novo Projeto</h2>
              <p className="text-xs text-cs-text-secondary">{STEPS[step].label} — Passo {step + 1} de {STEPS.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-1"><X size={20} /></button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                  i < step ? "bg-cs-primary text-white" :
                  i === step ? "bg-cs-primary/20 text-cs-primary border border-cs-primary" :
                  "bg-cs-bg text-cs-text-secondary border border-cs-border"
                )}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className={cn("text-[10px] font-medium", i === step ? "text-white" : "text-cs-text-secondary")}>{s.label}</span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-cs-border w-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {currentStepId === 'type' && <StepType selected={selectedType} onSelect={handleTypeSelect} />}
          {currentStepId === 'details' && <StepDetails form={form} setForm={setForm} clients={clients} selectedType={selectedType} />}
          {currentStepId === 'tasks' && <StepTasks tasks={tasks} setTasks={setTasks} startDate={form.start_date} />}
          {currentStepId === 'confirm' && <StepConfirm form={form} tasks={tasks} selectedType={selectedType} />}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-cs-border flex items-center justify-between shrink-0">
          <button
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-cs-bg border border-cs-border text-cs-text-secondary hover:text-white rounded-xl text-sm transition-colors"
          >
            <ChevronLeft size={16} /> {step === 0 ? 'Cancelar' : 'Voltar'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-2 bg-cs-primary hover:bg-cs-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20"
            >
              Próximo <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-5 py-2 bg-cs-primary hover:bg-cs-primary-hover text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cs-primary/20"
            >
              <Zap size={16} /> Disparar Projeto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
