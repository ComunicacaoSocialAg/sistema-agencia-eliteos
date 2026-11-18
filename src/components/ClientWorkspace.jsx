import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Kanban,
  CheckCircle2,
  Share2,
  ExternalLink,
  Globe,
  Camera,
  Users,
  MessageSquare,
  ArrowLeft,
  Settings,
  Plus,
  CircleDollarSign,
  TrendingUp as TrendingIcon,
  BarChart2,
  AlertTriangle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Bot,
  Copy,
  Trash2,
  Rocket,
  Palette,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useAuth } from '../contexts/AuthContext';
import { copyApprovalUrl } from '../hooks/useDeliverables';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { useInvoices } from '../hooks/useInvoices';
import { useSocialManagement } from '../hooks/useSocialManagement';
import { useCampaignManagement } from '../hooks/useCampaignManagement';
import { areIdsMatching } from '../hooks/useClients';
import { getClientBrandKit } from '../lib/brandKit';
import { cn } from '../utils/cn';
import NewTaskModal from './NewTaskModal';
import ClientLifecycle from './ClientLifecycle';
import OnboardingModule from './OnboardingModule';
import BrandKitEditor from './BrandKitEditor';
import AIBrainModule from './AIBrainModule';
import ClientConfigModal from './ClientConfigModal';
import ApprovalFlow from './ApprovalFlow';
import TaskModal from './TaskModal';

export default function ClientWorkspace({ client: initialClient, onBack, viewMode = 'internal', onUpdateClient, initialTab = 'overview' }) {
  const [client, setClient] = useState(initialClient);
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const isPortal = viewMode === 'portal';
  const { role, profile, isDemoMode, createUser } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const { setContext } = useAIAssistant();
  const { tasks, createTask, updateTask, addComment, toggleChecklist } = useTasks(client.id);
  const { invoices } = useInvoices();
  const clientInvoices = invoices.filter(inv => areIdsMatching(inv.client_id, client.id, inv.client?.name || inv.client_name, client.name));
  const [showNewDemand, setShowNewDemand] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  useEffect(() => {
    setClient(initialClient);
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialClient, initialTab]);

  const handleUpdateClient = async (updatedClient) => {
    const saved = onUpdateClient ? await onUpdateClient(updatedClient) : updatedClient;
    if (saved) setClient(saved);
    return saved;
  };

  useEffect(() => {
    async function updateContext() {
      let memories = {};
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('ai_memories')
          .select('key, value')
          .eq('client_id', client.id);

        if (data) {
          data.forEach(m => {
            memories[m.key] = m.value;
          });
        }
      }

      setContext({
        module: 'cliente',
        title: `Hub: ${client.name}`,
        data: {
          client,
          ai_memories: memories,
          reportei_linked: !!client.reportei_config?.project_id,
          reportei_id: client.reportei_config?.project_id
        }
      });
    }

    updateContext();
  }, [client, setContext]);

  const tabs = [
    { id: 'overview', label: 'Geral', icon: LayoutDashboard },
    ...(!isPortal ? [{ id: 'onboarding', label: 'Onboarding & DNA', icon: Rocket }] : []),
    { id: 'brand', label: 'Brand Kit', icon: Palette },
    { id: 'production', label: 'Produção', icon: Kanban },
    { id: 'reports', label: 'Relatórios', icon: BarChart2 },
    { id: 'approvals', label: 'Review Center', icon: CheckCircle2 },
    { id: 'assets', label: 'Dados & Links', icon: Share2 },
    ...(!isPortal ? [{ id: 'brain', label: 'Cérebro IA', icon: Bot }] : []),
    ...(!isPortal ? [{ id: 'profitability', label: 'Rentabilidade', icon: CircleDollarSign }] : []),
    { id: 'vault', label: 'Acessos', icon: Lock },
  ];

  const brandKit = getClientBrandKit(client);

  const handleGenerateWhatsAppReport = () => {
    const pendingApproval = tasks.filter(t => t.status === 'aguardando-cliente' || t.status === 'aprovacao-cliente');
    const inProgress = tasks.filter(t => ['em-producao', 'briefing', 'revisao-interna', 'ajustes'].includes(t.status));
    const done = tasks.filter(t => ['concluido', 'finalizado'].includes(t.status));

    let msg = `*Status Semanal CS Ag | ${client?.name}*\n`;
    msg += `Olá, ${client?.contact_name || 'equipe'}! Segue o resumo das entregas desta semana:\n\n`;

    if (pendingApproval.length > 0) {
      msg += `*Aguardando Sua Aprovação:*\n`;
      pendingApproval.forEach(t => {
        msg += `• ${t.title} (Link: ${window.location.origin}/aprovar/${t.id})\n`;
      });
      msg += `\n`;
    }

    if (inProgress.length > 0) {
      msg += `*Em Produção / Criação:*\n`;
      inProgress.forEach(t => {
        const deadlineStr = t.deadline ? ` (Prazo: ${new Date(t.deadline).toLocaleDateString('pt-BR')})` : '';
        msg += `• ${t.title}${deadlineStr}\n`;
      });
      msg += `\n`;
    }

    if (done.length > 0) {
      msg += `*Concluído Recentemente:*\n`;
      done.slice(0, 5).forEach(t => {
        msg += `• ${t.title}\n`;
      });
      msg += `\n`;
    }

    msg += `Qualquer ajuste ou nova prioridade, estamos à disposição.\nComunicação Social Ag`;

    navigator.clipboard.writeText(msg);
    toast.success('Resumo semanal copiado para envio no WhatsApp!');
  };

  return (
    <div className="flex flex-col h-full bg-cs-bg animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="bg-cs-surface border-b border-cs-border px-6 sm:px-8 py-6 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {!isPortal && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 hover:bg-cs-bg border border-cs-border rounded-lg text-cs-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: brandKit.primary_color }}
            >
              {brandKit.logo_url && /^https?:\/\//i.test(brandKit.logo_url) ? (
                <img src={brandKit.logo_url} alt={client?.name} className="w-full h-full object-cover" />
              ) : (
                client?.name ? client.name.charAt(0) : 'C'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{client?.name || 'Cliente'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase">
                  {client?.status === 'inactive' ? 'Inativo' : 'Ativo'}
                </span>
              </div>
              <p className="text-cs-text-secondary text-xs sm:text-sm">
                {client?.contact_name || 'Sem contato'} {client?.contact_email ? `• ${client.contact_email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isPortal && (
              <>
                <button
                  type="button"
                  onClick={handleGenerateWhatsAppReport}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={15} /> Relatório WhatsApp
                </button>
                {role === 'admin' && !isDemoMode && (
                  <button type="button" onClick={() => setShowInvite(true)} className="bg-cs-surface-hover border border-cs-border text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer">
                    Convidar cliente
                  </button>
                )}
                <button type="button" onClick={() => setShowConfigModal(true)} className="bg-cs-surface-hover border border-cs-border text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
                  <Settings size={15} /> Configurar
                </button>
                <button type="button" onClick={() => setShowNewDemand(true)} className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-2 shadow-lg shadow-cs-primary/20 cursor-pointer">
                  <Plus size={15} /> Nova Demanda
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'text-cs-primary bg-cs-primary/5'
                  : 'text-cs-text-secondary hover:text-white hover:bg-cs-bg'
              )}
            >
              <tab.icon size={15} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cs-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
        {activeTab === 'overview' && (
          <>
            <ClientLifecycle
              currentStage={client.lifecycle_stage || 'onboarding'}
              onStageChange={!isPortal ? async (stageId) => {
                const updated = await handleUpdateClient({ ...client, lifecycle_stage: stageId });
                if (updated) toast.success('Estágio do cliente atualizado.');
              } : undefined}
            />
            <OverviewTab
              client={client}
              invoices={clientInvoices}
              tasks={tasks}
              onOpenTab={setActiveTab}
              onOpenTask={(t) => setSelectedTaskId(t.id)}
            />
          </>
        )}
        {activeTab === 'onboarding' && !isPortal && (
          <OnboardingModule client={client} onUpdateClient={handleUpdateClient} />
        )}
        {activeTab === 'brand' && (
          <BrandKitEditor
            client={client}
            onSave={handleUpdateClient}
            onOpenOnboarding={!isPortal ? () => setActiveTab('onboarding') : undefined}
          />
        )}
        {activeTab === 'production' && (
          <ProductionTab
            tasks={tasks}
            onOpenTask={(t) => setSelectedTaskId(t.id)}
            onUpdateTask={updateTask}
            onNewDemand={!isPortal ? () => setShowNewDemand(true) : undefined}
          />
        )}
        {activeTab === 'reports' && <ClientReportsTab client={client} tasks={tasks} />}
        {activeTab === 'approvals' && <ApprovalsTab client={client} />}
        {activeTab === 'assets' && <AssetsTab client={client} />}
        {activeTab === 'brain' && !isPortal && <AIBrainModule client={client} />}
        {activeTab === 'profitability' && !isPortal && <ProfitabilityTab client={client} tasks={tasks} />}
        {activeTab === 'vault' && <VaultTab client={client} />}
      </div>

      {showInvite && <ClientInvite client={client} createUser={createUser} onClose={() => setShowInvite(false)} />}

      {showConfigModal && (
        <ClientConfigModal
          client={client}
          onClose={() => setShowConfigModal(false)}
          onSave={handleUpdateClient}
        />
      )}

      {showNewDemand && (
        <NewTaskModal
          onClose={() => setShowNewDemand(false)}
          onSave={createTask}
          initialClient={client}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={updateTask}
          onAddComment={addComment}
          onToggleChecklist={toggleChecklist}
          user={profile || { name: 'Bruno', role }}
        />
      )}
    </div>
  );
}

function ClientInvite({ client, createUser, onClose }) {
  const [name, setName] = useState(client.contact_name || '');
  const [email, setEmail] = useState(client.contact_email || '');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const input = 'w-full rounded-lg border border-cs-border bg-cs-bg p-2 text-white';

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const result = await createUser({ name, email, role: 'client', client_id: client.id });
      if (!result?.accessLink) setError(result?.error?.message || 'O link não foi gerado.');
      else setLink(result.accessLink);
    } finally {
      setSaving(false);
    }
  }

  async function copy(event) {
    const field = event.currentTarget.closest('div').querySelector('input');
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Convite copiado.');
    } catch {
      field?.select();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="client-invite-title"
        className="w-full max-w-md space-y-4 rounded-2xl border border-cs-border bg-cs-surface p-6">
        <h2 id="client-invite-title" className="text-lg font-semibold text-white">Convidar cliente</h2>
        <p className="text-sm text-cs-text-secondary">O acesso fica vinculado à conta de {client.name}.</p>
        {!link ? <>
          <label className="block text-sm text-cs-text-secondary">Nome<input className={input} value={name} onChange={event => setName(event.target.value)} autoFocus required /></label>
          <label className="block text-sm text-cs-text-secondary">E-mail<input className={input} type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
          <button type="submit" disabled={saving} className="rounded-lg bg-cs-primary px-4 py-2 text-sm font-semibold text-black">{saving ? 'Gerando…' : 'Gerar link de convite'}</button>
        </> : <div className="space-y-2">
          <label className="block text-sm text-cs-text-secondary">Link de convite<input className={input} readOnly value={link} onFocus={event => event.target.select()} /></label>
          <button type="button" onClick={copy} className="rounded-lg bg-cs-primary px-4 py-2 text-sm font-semibold text-black">Copiar convite</button>
        </div>}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="button" onClick={onClose} className="block text-sm text-cs-text-secondary underline">Fechar</button>
      </form>
    </div>
  );
}

function OverviewTab({ client, invoices = [], tasks = [], onOpenTab, onOpenTask }) {
  const kit = getClientBrandKit(client);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Palette size={17} className="text-cs-primary" /> Resumo de Identidade & Estratégia
            </h3>
            <button type="button" onClick={() => onOpenTab('brand')} className="text-xs font-bold text-cs-primary hover:underline cursor-pointer">
              Editar Brand Kit
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: 'Primária', hex: kit.primary_color },
              { label: 'Secundária', hex: kit.secondary_color },
              { label: 'Destaque', hex: kit.accent_color },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-2 bg-cs-bg border border-cs-border px-3 py-1.5 rounded-xl text-xs">
                <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                <span className="text-cs-text-secondary">{c.label}:</span>
                <span className="font-mono text-white uppercase">{c.hex}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-cs-bg border border-cs-border rounded-xl p-3">
              <span className="text-cs-text-secondary block mb-1">Tipografia</span>
              <span className="text-white font-semibold">{kit.typography || 'Não configurada'}</span>
            </div>
            <div className="bg-cs-bg border border-cs-border rounded-xl p-3">
              <span className="text-cs-text-secondary block mb-1">Tom de Voz</span>
              <span className="text-white font-semibold">{kit.tone_of_voice || 'Não configurado'}</span>
            </div>
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Kanban size={18} className="text-cs-primary" /> Tarefas em Andamento ({tasks.length})
            </h3>
            <button
              type="button"
              onClick={() => onOpenTab('production')}
              className="text-xs font-bold text-cs-primary hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((p, i) => (
              <button
                key={p.id || i}
                type="button"
                onClick={() => onOpenTask?.(p)}
                className="w-full text-left bg-cs-bg border border-cs-border hover:border-cs-primary/40 rounded-xl p-4 flex justify-between items-start gap-3 transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-white font-medium text-sm">{p.title}</h4>
                  <p className="text-[11px] text-cs-text-secondary mt-0.5">
                    Prazo: {p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold capitalize border shrink-0',
                  p.status === 'concluido' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-cs-primary/10 text-cs-primary border-cs-primary/20'
                )}>
                  {p.status?.replace('-', ' ')}
                </span>
              </button>
            ))}
            {tasks.length === 0 && (
              <p className="text-xs text-cs-text-secondary text-center py-4">Nenhuma tarefa registrada para esta conta.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-xs mb-1">Fee Mensal</p>
          <p className="text-xl font-bold text-white">R$ {Number(client.monthly_fee || 0).toLocaleString('pt-BR')}</p>
          <p className="text-[11px] text-cs-text-secondary mt-1">
            Vencimento: dia {client.billing_day || '10'} · {client.monthly_hours_contracted || 10}h/mês
          </p>
        </div>

        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-cs-text-secondary text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <CircleDollarSign size={14} className="text-green-400" /> Cobranças Recentes
            </p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('csag:navigate', { detail: { view: 'financeiro', clientId: client.id } }))}
              className="text-[11px] font-bold text-cs-primary hover:underline cursor-pointer"
            >
              Abrir Financeiro
            </button>
          </div>
          <div className="space-y-2">
            {invoices.slice(0, 4).map((inv, idx) => (
              <div key={inv.id || idx} className="flex justify-between items-center bg-cs-bg/50 p-2.5 border border-cs-border rounded-xl">
                <div className="min-w-0">
                  <p className="text-white font-medium text-xs truncate max-w-[130px]">{inv.service}</p>
                  <p className="text-[10px] text-cs-text-secondary mt-0.5">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-xs">R$ {Number(inv.amount || 0).toLocaleString('pt-BR')}</p>
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 capitalize',
                    inv.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : inv.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                  )}>
                    {inv.status === 'paid' ? 'Pago' : inv.status === 'pending' ? 'Pendente' : 'Atrasado'}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-xs text-cs-text-secondary text-center py-2">Nenhuma cobrança registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductionTab({ tasks = [], onOpenTask, onUpdateTask, onNewDemand }) {
  const STATUS_OPTIONS = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'briefing', label: 'Briefing' },
    { id: 'em-producao', label: 'Em Produção' },
    { id: 'revisao-interna', label: 'Revisão Interna' },
    { id: 'aguardando-cliente', label: 'Aguard. Cliente' },
    { id: 'ajustes', label: 'Ajustes' },
    { id: 'concluido', label: 'Concluído' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Fluxo de Entrega</h3>
          <span className="px-3 py-1 bg-cs-surface border border-cs-border rounded-full text-xs text-cs-text-secondary">
            Total: {tasks.length} tarefas
          </span>
        </div>
        {onNewDemand && (
          <button
            type="button"
            onClick={onNewDemand}
            className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Nova Demanda
          </button>
        )}
      </div>

      <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cs-border text-[10px] text-cs-text-secondary uppercase tracking-widest bg-cs-bg/50">
              <th className="px-6 py-4 font-medium">Tarefa</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Responsável</th>
              <th className="px-6 py-4 font-medium">Prazo</th>
            </tr>
          </thead>
          <tbody className="text-xs text-cs-text-primary">
            {tasks.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onOpenTask?.(row)}
                className="border-b border-cs-border/50 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-white">{row.title}</td>
                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                  {onUpdateTask ? (
                    <select
                      aria-label={`Status de ${row.title}`}
                      value={row.status || 'backlog'}
                      onChange={e => onUpdateTask({ id: row.id, status: e.target.value })}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-cs-bg focus:outline-none focus:border-cs-primary cursor-pointer',
                        row.status === 'concluido' ? 'text-green-400 border-green-500/30'
                          : row.status === 'em-producao' ? 'text-purple-400 border-purple-500/30'
                            : row.status === 'aguardando-cliente' ? 'text-yellow-400 border-yellow-500/30'
                              : row.status === 'ajustes' ? 'text-red-400 border-red-500/30'
                                : 'text-zinc-300 border-cs-border'
                      )}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id} className="bg-cs-bg text-white">{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] border capitalize',
                      row.status === 'concluido' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                    )}>
                      {row.status?.replace('-', ' ')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{row.assigned_to || 'Sem responsável'}</td>
                <td className="px-6 py-4">{row.deadline ? new Date(row.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-cs-text-secondary font-medium">
                  Nenhuma tarefa em andamento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientReportsTab({ client, tasks = [] }) {
  const { allPosts, metrics, loading: socialLoading } = useSocialManagement();
  const { reports, loading: mediaLoading } = useCampaignManagement();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const clientMetrics = metrics.filter(m => areIdsMatching(m.client_id, client.id, '', client.name));
  const latestOrganic = clientMetrics.find(m => m.period_month === currentMonth) || clientMetrics[0];
  const clientMedia = reports.filter(r => areIdsMatching(r.client_id, client.id, '', client.name));
  const publishedCount = allPosts.filter(p => areIdsMatching(p.client_id, client.id, '', client.name) && p.status === 'publicado').length;
  const completedCount = tasks.filter(t => t.status === 'concluido').length;

  const openModuleForClient = (view) => {
    window.dispatchEvent(new CustomEvent('csag:navigate', { detail: { view, clientId: client.id } }));
  };

  if (socialLoading || mediaLoading) {
    return <p className="text-sm text-cs-text-secondary py-8">Carregando indicadores da conta...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cs-surface border border-cs-border rounded-2xl p-4">
        <span className="text-xs text-cs-text-secondary">
          Ações rápidas para consolidar dados e enviar prestação de contas de <strong className="text-white">{client.name}</strong>:
        </span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => openModuleForClient('relatorios')} className="bg-cs-primary text-black px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer">
            Abrir Relatório Mensal
          </button>
          <button type="button" onClick={() => openModuleForClient('buzzmonitor')} className="bg-cs-bg border border-cs-border hover:border-cs-primary/40 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
            Abrir Social & Conteúdo
          </button>
          <button type="button" onClick={() => openModuleForClient('midia')} className="bg-cs-bg border border-cs-border hover:border-cs-primary/40 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
            Abrir Mídia Paga
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <span className="text-[10px] font-bold text-cs-text-secondary uppercase">Entregas Concluídas</span>
          <p className="text-2xl font-bold text-white mt-1">{completedCount}</p>
          <p className="text-xs text-cs-text-secondary mt-1">De {tasks.length} tarefas registradas</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <span className="text-[10px] font-bold text-cs-text-secondary uppercase">Posts Publicados</span>
          <p className="text-2xl font-bold text-white mt-1">{publishedCount}</p>
          <p className="text-xs text-cs-text-secondary mt-1">Registrados na grade editorial</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <span className="text-[10px] font-bold text-cs-text-secondary uppercase">Seguidores / Alcance</span>
          <p className="text-2xl font-bold text-white mt-1">
            {latestOrganic ? Number(latestOrganic.followers_total || 0).toLocaleString('pt-BR') : 'Sem lançamento'}
          </p>
          <p className="text-xs text-cs-text-secondary mt-1">
            {latestOrganic ? `Período ${latestOrganic.period_month}` : 'Lance fechamentos em Social & Conteúdo'}
          </p>
        </div>
      </div>

      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Prestações de Contas de Mídia Paga ({clientMedia.length})</h3>
        {clientMedia.length === 0 ? (
          <p className="text-xs text-cs-text-secondary">Nenhum relatório mensal de mídia paga lançado para esta conta.</p>
        ) : (
          <div className="space-y-3">
            {clientMedia.map(rep => (
              <div key={rep.id} className="bg-cs-bg border border-cs-border rounded-xl p-4 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-white">{rep.period_label}</strong>
                  <span className="text-emerald-400 font-mono">
                    R$ {Number(rep.invested_amount || 0).toLocaleString('pt-BR')} · {rep.conversions_count || 0} conversões
                  </span>
                </div>
                {rep.diagnosis && <p className="text-xs text-cs-text-secondary">{rep.diagnosis}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalsTab({ client }) {
  const { tasks } = useTasks(client.id);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const clientTasks = tasks.filter(t => t.client_id === client.id || (t.client && t.client.name === client.name));
  const activeReviewTasks = clientTasks.filter(t => t.status === 'aguardando-cliente' || t.status === 'revisao-interna' || t.status === 'ajustes');
  const displayTasks = activeReviewTasks.length > 0 ? activeReviewTasks : clientTasks;

  const handleCopyLink = async (taskId) => {
    try {
      await copyApprovalUrl(taskId);
      toast.success('Link de aprovação copiado.');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const currentTask = clientTasks.find(t => t.id === selectedTaskId) || displayTasks[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cs-surface border border-cs-border rounded-2xl p-6 shadow-xl">
        <div>
          <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-cs-primary" /> Review Center do Cliente
          </h3>
          <p className="text-cs-text-secondary text-xs">Envie versões e consulte o histórico de decisões do cliente.</p>
        </div>
      </div>

      {displayTasks.length === 0 ? (
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-12 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-cs-primary/30" />
          <h4 className="text-white font-bold text-base mb-1">Nenhuma peça em revisão no momento</h4>
          <p className="text-xs text-cs-text-secondary">Crie uma nova demanda ou envie um entregável no Kanban de Produção.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest px-1">Demandas da Conta</h4>
            {displayTasks.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className={cn(
                  'p-4 rounded-2xl border transition-all cursor-pointer',
                  currentTask?.id === t.id
                    ? 'bg-cs-surface border-cs-primary shadow-lg shadow-cs-primary/10'
                    : 'bg-cs-surface/40 border-cs-border hover:border-cs-primary/40 text-cs-text-secondary'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded uppercase border',
                    t.status === 'aguardando-cliente' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      : t.status === 'concluido' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-cs-bg text-cs-text-secondary border-cs-border'
                  )}>
                    {t.status}
                  </span>
                  {t.status === 'aguardando-cliente' && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleCopyLink(t.id); }}
                      className="text-cs-text-secondary hover:text-cs-primary transition-colors p-1 cursor-pointer"
                      title="Copiar Link de Aprovação"
                    >
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>
                <h5 className="text-sm font-bold text-white mb-1 line-clamp-1">{t.title}</h5>
                <p className="text-[10px] text-cs-text-secondary">{t.tag || 'Social Media'} • {t.deadline ? new Date(t.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8 bg-cs-surface border border-cs-border rounded-3xl p-6 shadow-2xl">
            {currentTask ? (
              <div>
                <div className="border-b border-cs-border pb-4 mb-6 flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold text-white">{currentTask.title}</h4>
                    <p className="text-xs text-cs-text-secondary mt-0.5">{currentTask.description || 'Envie e valide entregáveis desta demanda.'}</p>
                  </div>
                  <a
                    href={`/aprovar/${currentTask.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-cs-primary hover:underline flex items-center gap-1"
                  >
                    Visualização do Cliente <ExternalLink size={12} />
                  </a>
                </div>
                <ApprovalFlow taskId={currentTask.id} />
              </div>
            ) : (
              <p className="text-xs text-cs-text-secondary text-center py-12">Selecione uma tarefa ao lado para visualizar os entregáveis.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetsTab({ client }) {
  const kit = getClientBrandKit(client);
  const instagramClean = (kit.instagram || '').replace(/^@/, '').trim();
  const instagramUrl = instagramClean ? `https://instagram.com/${instagramClean}` : '';
  const websiteUrl = /^https?:\/\//i.test(kit.website || '') ? kit.website : '';
  const driveUrl = /^https?:\/\//i.test(kit.drive_url || '') ? kit.drive_url : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Presença Digital</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-cs-surface border border-cs-border rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                <Camera size={20} className="text-pink-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium">Instagram</p>
                <p className="text-xs text-cs-text-secondary truncate">{instagramClean ? `@${instagramClean}` : 'Não informado'}</p>
              </div>
            </div>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-cs-primary hover:underline text-xs font-bold flex items-center gap-1 shrink-0">
                Abrir <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-cs-surface border border-cs-border rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-cs-primary/10 flex items-center justify-center shrink-0">
                <Globe size={20} className="text-cs-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium">Website Principal</p>
                <p className="text-xs text-cs-text-secondary truncate">{websiteUrl || 'Não informado'}</p>
              </div>
            </div>
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cs-primary hover:underline text-xs font-bold flex items-center gap-1 shrink-0">
                Abrir <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-cs-surface border border-cs-border rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Users size={20} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium">Contato Principal</p>
                <p className="text-xs text-cs-text-secondary truncate">{client?.contact_name || 'Não informado'} {client?.contact_phone ? `• ${client.contact_phone}` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Pastas de Trabalho</h3>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Share2 size={24} className="text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Google Drive Central</h4>
              <p className="text-[11px] text-cs-text-secondary">Repositório oficial compartilhado com a equipe</p>
            </div>
          </div>
          {driveUrl ? (
            <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-cs-bg border border-cs-border hover:border-cs-primary text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              ACESSAR DRIVE DO CLIENTE <ExternalLink size={14} />
            </a>
          ) : (
            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              Nenhum link do Google Drive cadastrado ainda. Adicione na aba Brand Kit ou no Onboarding.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfitabilityTab({ client, tasks = [] }) {
  const { team } = useTeam();

  let realTeamCost = 0;
  let estimatedBurnRate = 0;
  let totalTrackedHours = 0;
  let totalEstimatedHours = 0;

  tasks.forEach(task => {
    const hoursTracked = (task.tracked_seconds || 0) / 3600;
    const hoursEstimated = Number(task.estimated_hours || 0);
    const assignee = team.find(m => m.id === task.assigned_to_id || m.name === task.assigned_to);
    const hourlyCost = assignee?.hourly_cost || 50;

    totalTrackedHours += hoursTracked;
    totalEstimatedHours += hoursEstimated;
    realTeamCost += hoursTracked * hourlyCost;
    estimatedBurnRate += hoursEstimated * hourlyCost;
  });

  const revenue = Number(client.monthly_fee) || 0;
  const profit = revenue - realTeamCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const isBurnRateHigh = revenue > 0 && estimatedBurnRate > revenue * 0.70;

  let marginStatus = 'SEM RECEITA';
  let marginColor = 'text-zinc-400';
  let marginBg = 'bg-zinc-500/10 border-zinc-500/20';
  if (revenue > 0) {
    if (margin >= 40) {
      marginStatus = 'SAUDÁVEL';
      marginColor = 'text-green-400';
      marginBg = 'bg-green-500/10 border-green-500/20';
    } else if (margin > 15) {
      marginStatus = 'ATENÇÃO';
      marginColor = 'text-yellow-400';
      marginBg = 'bg-yellow-500/10 border-yellow-500/20';
    } else {
      marginStatus = 'CRÍTICO';
      marginColor = 'text-red-400';
      marginBg = 'bg-red-500/10 border-red-500/20';
    }
  }

  const teamCostPercent = revenue > 0 ? Math.min(100, (realTeamCost / revenue) * 100) : 0;
  const profitPercent = revenue > 0 ? Math.max(0, Math.min(100, (profit / revenue) * 100)) : 0;

  return (
    <div className="space-y-8">
      {isBurnRateHigh && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle size={24} className="text-red-400" />
          <div>
            <h4 className="text-red-400 font-bold">Aviso de Burn Rate Elevado</h4>
            <p className="text-sm text-white/80">O custo estimado de produção (R$ {estimatedBurnRate.toLocaleString('pt-BR')}) ultrapassa 70% da receita mensal.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Fee Mensal</p>
          <p className="text-xl font-bold text-white">R$ {revenue.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Custo Apontado</p>
          <p className="text-xl font-bold text-red-400">R$ {realTeamCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Resultado Bruto</p>
          <p className="text-xl font-bold text-green-400">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Margem Apurada</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-white">{margin.toFixed(1)}%</p>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${marginColor} ${marginBg}`}>{marginStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
          <h4 className="text-white font-bold flex items-center gap-2">
            <TrendingIcon size={18} className="text-cs-primary" /> Decomposição Real
          </h4>
          {[
            { label: 'Horas Apontadas (Cronômetro)', val: realTeamCost, color: 'bg-cs-primary', p: teamCostPercent },
            { label: 'Saldo sobre Fee', val: Math.max(0, profit), color: 'bg-green-500', p: profitPercent },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-cs-text-secondary">{item.label}</span>
                <span className="text-white font-medium">R$ {item.val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ({item.p.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2 bg-cs-bg rounded-full overflow-hidden">
                <div className={cn('h-full transition-all duration-500', item.color)} style={{ width: `${item.p}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-3">
          <h4 className="text-white font-bold flex items-center gap-2">
            <Clock size={18} className="text-cs-primary" /> Diagnóstico de Horas Reais
          </h4>
          <p className="text-xs text-cs-text-secondary">
            Horas contratadas no mês: <strong className="text-white">{client.monthly_hours_contracted || 10}h</strong> ·
            Horas estimadas em tarefas: <strong className="text-white">{totalEstimatedHours.toFixed(1)}h</strong> ·
            Horas cronometradas: <strong className="text-white">{totalTrackedHours.toFixed(1)}h</strong>
          </p>
          {totalTrackedHours === 0 && (
            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              Nenhuma hora foi cronometrada ainda nas tarefas deste cliente. A margem acima reflete apenas o fee cadastrado sem apontamento de tempo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Ofuscação simples apenas para evitar texto puro em listagem; sem criptografia server-side.
function encodeNote(str) {
  if (!str) return '';
  return 'ENC:' + btoa(encodeURIComponent(str).split('').reverse().join(''));
}

function decodeNote(str) {
  if (!str) return '';
  if (!str.startsWith('ENC:')) return str;
  try {
    const raw = str.slice(4);
    const rev = atob(raw).split('').reverse().join('');
    return decodeURIComponent(rev);
  } catch {
    return str;
  }
}

function VaultTab({ client }) {
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});
  const [newItem, setNewItem] = useState({ platform_name: '', encrypted_username: '', encrypted_password: '', notes: '' });

  useEffect(() => {
    async function fetchVault() {
      if (!isSupabaseConfigured) {
        setVaultItems([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('client_vault').select('*').eq('client_id', client.id);
        if (data) setVaultItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVault();
  }, [client.id]);

  const handleSave = async () => {
    if (!newItem.platform_name.trim()) return;
    try {
      const itemToSave = {
        ...newItem,
        encrypted_password: encodeNote(newItem.encrypted_password)
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('client_vault').insert([{ ...itemToSave, client_id: client.id }]).select().single();
        if (error) throw error;
        setVaultItems(prev => [...prev, data]);
      } else {
        setVaultItems(prev => [...prev, { ...itemToSave, id: `vault-${Date.now()}` }]);
      }
      setNewItem({ platform_name: '', encrypted_username: '', encrypted_password: '', notes: '' });
      toast.success('Registro salvo.');
    } catch {
      toast.error('Erro ao salvar registro de acesso.');
    }
  };

  const togglePassword = (id) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;
    setVaultItems(prev => prev.filter(item => item.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('client_vault').delete().eq('id', id);
    }
    toast.success('Registro removido.');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-white mb-0.5">Aviso de Segurança sobre Acessos</strong>
          Esta tabela é protegida apenas por RLS do Supabase, sem criptografia de ponta a ponta ou cofres dedicados. Armazene aqui preferencialmente referências de acesso (ex: ID da conta de anúncios, e-mail de login, onde está a senha no seu gerenciador) em vez de senhas críticas em claro.
        </div>
      </div>

      <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-cs-primary rounded-xl flex items-center justify-center shadow-lg shadow-cs-primary/20">
            <Lock size={24} className="text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Referências de Acesso</h3>
            <p className="text-cs-text-secondary text-sm">Contas de anúncios, perfis e orientações de login desta conta.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-cs-text-secondary text-center py-8">Carregando registros...</p>
        ) : (
          <div className="space-y-4">
            {vaultItems.map(item => (
              <div key={item.id} className="bg-cs-bg border border-cs-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex-1">
                  <h4 className="text-white font-bold">{item.platform_name}</h4>
                  <p className="text-xs text-cs-text-secondary mt-1">{item.notes}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 bg-cs-surface px-3 py-2 rounded-lg border border-cs-border">
                    <span className="text-[10px] text-cs-text-secondary w-12">Login:</span>
                    <span className="text-sm text-white font-mono break-all flex-1">{item.encrypted_username}</span>
                    <button type="button" onClick={() => copyToClipboard(item.encrypted_username, 'Login')} className="text-cs-text-secondary hover:text-cs-primary transition-colors p-1 cursor-pointer">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-cs-surface px-3 py-2 rounded-lg border border-cs-border relative">
                    <span className="text-[10px] text-cs-text-secondary w-12">Nota:</span>
                    <span className="text-sm text-white font-mono flex-1 break-all">{showPassword[item.id] ? decodeNote(item.encrypted_password) : '••••••••••••'}</span>
                    <button type="button" onClick={() => copyToClipboard(decodeNote(item.encrypted_password), 'Nota')} className="text-cs-text-secondary hover:text-cs-primary transition-colors p-1 cursor-pointer">
                      <Copy size={14} />
                    </button>
                    <button type="button" onClick={() => togglePassword(item.id)} className="text-cs-text-secondary hover:text-white transition-colors p-1 cursor-pointer">
                      {showPassword[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(item.id)} className="opacity-70 group-hover:opacity-100 transition-opacity p-2 text-cs-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {vaultItems.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-cs-border rounded-2xl bg-cs-surface/20">
                <Lock size={32} className="mx-auto text-cs-text-secondary mb-4 opacity-50" />
                <p className="text-cs-text-secondary font-medium">Nenhum acesso registrado para esta conta.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-2xl">
        <h4 className="text-lg font-bold text-white mb-6">Adicionar Referência de Acesso</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Plataforma *</label>
            <input
              type="text"
              placeholder="Ex: Meta Business Manager, Google Ads"
              value={newItem.platform_name}
              onChange={e => setNewItem({ ...newItem, platform_name: e.target.value })}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">ID / Login / E-mail</label>
            <input
              type="text"
              value={newItem.encrypted_username}
              onChange={e => setNewItem({ ...newItem, encrypted_username: e.target.value })}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Referência / Chave</label>
            <input
              type="password"
              value={newItem.encrypted_password}
              onChange={e => setNewItem({ ...newItem, encrypted_password: e.target.value })}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Observações</label>
            <input
              type="text"
              placeholder="Ex: Acesso via 1Password / 2FA no celular do cliente"
              value={newItem.notes}
              onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button type="button" onClick={handleSave} className="bg-cs-primary hover:bg-cs-primary-hover text-black px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg shadow-cs-primary/30 transition-all cursor-pointer">
            SALVAR REGISTRO
          </button>
        </div>
      </div>
    </div>
  );
}
