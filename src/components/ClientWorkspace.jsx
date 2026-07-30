import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Kanban, 
  CheckCircle2, 
  Share2, 
  FileText, 
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
  Zap,
  Lock,
  Eye,
  EyeOff,
  Bot,
  Sparkles,
  Copy,
  Trash2,
  Rocket,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateStrategicPlan } from '../lib/openai';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useClientPortal } from '../hooks/useClientPortal';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { useInvoices } from '../hooks/useInvoices';
import { cn } from '../utils/cn';
import NewTaskModal from './NewTaskModal';

function NPSModal({ onScore }) {
  const [score, setScore] = useState(null);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-cs-primary/20 text-cs-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <TrendingIcon size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sua opinião importa!</h2>
        <p className="text-sm text-cs-text-secondary mb-8">De 0 a 10, o quanto você recomendaria a CS Ag para um parceiro?</p>
        
        <div className="grid grid-cols-5 gap-2 mb-8">
          {[1,2,3,4,5,6,7,8,9,10].map(s => (
            <button 
              key={s} 
              onClick={() => setScore(s)}
              className={cn(
                "w-full aspect-square rounded-lg border font-bold transition-all",
                score === s ? "bg-cs-primary border-cs-primary text-white scale-110" : "bg-cs-bg border-cs-border text-cs-text-secondary hover:border-cs-primary hover:text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <button 
          onClick={() => score && onScore(score)}
          disabled={!score}
          className="w-full bg-cs-primary hover:bg-cs-primary-hover disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all"
        >
          Enviar Feedback
        </button>
      </div>
    </div>
  );
}

import ClientLifecycle from './ClientLifecycle';
import StrategicRoadmap from './StrategicRoadmap';
import MeetingMinutes from './MeetingMinutes';
import OnboardingModule from './OnboardingModule';
import AIBrainModule from './AIBrainModule';
import ClientConfigModal from './ClientConfigModal';
import GovernanceModule from './GovernanceModule';
import { reportei } from '../lib/reportei';

export default function ClientWorkspace({ client: initialClient, onBack, viewMode = 'internal', onUpdateClient }) {
  const [client, setClient] = useState(initialClient);
  const [activeTab, setActiveTab] = useState('overview');
  const isPortal = viewMode === 'portal';
  const { dashboard, loading } = useClientPortal(isPortal ? client.id : null);
  const { setContext } = useAIAssistant();
  const { tasks, createTask } = useTasks(client.id);
  const { invoices } = useInvoices();
  const clientInvoices = invoices.filter(inv => inv.client_id === client.id || (inv.client && inv.client.name === client.name));
  const [showNPS, setShowNPS] = useState(false);
  const [showNewDemand, setShowNewDemand] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    setClient(initialClient);
  }, [initialClient]);

  const handleUpdateClient = (updatedClient) => {
    setClient(updatedClient);
    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
  };

  // Sincronizar contexto da IA com dados do Reportei e Memórias Persistentes
  useEffect(() => {
    async function updateContext() {
      let memories = {};
      
      // Busca as memórias da IA deste cliente
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
          dashboard,
          ai_memories: memories, // Injeta as memórias permanentemente no prompt!
          reportei_linked: !!client.reportei_config?.project_id,
          reportei_id: client.reportei_config?.project_id
        }
      });
    }
    
    updateContext();
  }, [client, dashboard, setContext]);

  const tabs = [
    { id: 'overview', label: 'Geral', icon: LayoutDashboard },
    { id: 'dna', label: 'DNA da Marca', icon: Target },
    { id: 'roadmap', label: 'Estratégia', icon: TrendingIcon },
    { id: 'production', label: 'Produção', icon: Kanban },
    { id: 'reports', label: 'Relatórios', icon: BarChart2 },
    { id: 'approvals', label: 'Review Center', icon: CheckCircle2 },
    { id: 'meetings', label: 'Atas & Decisões', icon: MessageSquare },
    { id: 'assets', label: 'Dados & Social', icon: Share2 },
    { id: 'vault', label: 'Cofre Seguro', icon: Lock },
    ...(!isPortal ? [{ id: 'brain', label: 'Cérebro IA', icon: Bot }] : []),
    ...(!isPortal ? [{ id: 'profitability', label: 'Rentabilidade', icon: CircleDollarSign }] : []),
    ...(!isPortal ? [{ id: 'onboarding', label: 'Onboarding', icon: Rocket }] : []),
    ...(!isPortal ? [{ id: 'governance', label: 'Governança & Ritos', icon: Shield }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-cs-bg animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="bg-cs-surface border-b border-cs-border px-8 py-6 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {!isPortal && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-cs-bg border border-cs-border rounded-lg text-cs-text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ backgroundColor: client?.brand_color || '#3b82f6' }}
            >
              {client?.name ? client.name.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{client?.name || 'Novo Cliente'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase">Ativo</span>
              </div>
              <p className="text-cs-text-secondary text-sm">
                {client?.contact_name || 'Sem contato'} {client?.contact_email ? `• ${client.contact_email}` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isPortal ? (
              <button className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cs-primary/20">
                <MessageSquare size={16} /> Suporte Agência
              </button>
            ) : (
              <>
                <button onClick={() => setShowConfigModal(true)} className="bg-cs-surface-hover border border-cs-border text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Settings size={16} /> Configurar
                </button>
                <button onClick={() => setShowNewDemand(true)} className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cs-primary/20">
                  <Plus size={16} /> Nova Demanda
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden group",
                activeTab === tab.id 
                  ? "text-cs-primary bg-cs-primary/5" 
                  : "text-cs-text-secondary hover:text-white hover:bg-cs-bg"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cs-primary animate-in zoom-in duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Visual Lifecycle Stepper - Always visible on top of General/Roadmap */}
        {(activeTab === 'overview' || activeTab === 'roadmap') && (
          <ClientLifecycle currentStage={client.lifecycle_stage || 'performance'} />
        )}

        {activeTab === 'overview' && <OverviewTab client={client} isPortal={isPortal} dashboard={dashboard} invoices={clientInvoices} tasks={tasks} />}
        {activeTab === 'dna' && (
        <DNATab client={client} createTask={createTask} />
      )}  {activeTab === 'roadmap' && <StrategicRoadmap clientId={client.id} client={client} />}
        {activeTab === 'production' && <ProductionTab client={client} tasks={tasks} />}
        {activeTab === 'reports' && (
          <div className="p-12 text-center bg-cs-surface border border-cs-border rounded-3xl">
             <BarChart2 size={48} className="mx-auto text-cs-text-secondary opacity-20 mb-4" />
             <h3 className="text-white font-bold mb-2">Relatórios em Preparação</h3>
             <p className="text-xs text-cs-text-secondary">Estamos processando os dados do último período para você.</p>
          </div>
        )}
        {activeTab === 'approvals' && <ApprovalsTab client={client} />}
        {activeTab === 'meetings' && <MeetingMinutes clientId={client.id} />}
        {activeTab === 'assets' && <AssetsTab client={client} />}
        {activeTab === 'vault' && <VaultTab client={client} isPortal={isPortal} />}
        {activeTab === 'brain' && !isPortal && <AIBrainModule client={client} />}
        {activeTab === 'profitability' && <ProfitabilityTab client={client} tasks={tasks} />}
        {activeTab === 'onboarding' && !isPortal && <OnboardingModule client={client} onUpdateClient={handleUpdateClient} />}
        {activeTab === 'governance' && !isPortal && <GovernanceModule client={client} />}
      </div>

      {showConfigModal && (
        <ClientConfigModal 
          client={client} 
          onClose={() => setShowConfigModal(false)} 
          onSave={handleUpdateClient} 
        />
      )}

      {showNPS && <NPSModal onScore={(s) => { console.log('NPS:', s); setShowNPS(false); }} />}
      {showNewDemand && (
        <NewTaskModal 
          onClose={() => setShowNewDemand(false)} 
          onSave={(task) => {
            createTask(task);
            setShowNewDemand(false);
          }} 
          initialClient={client}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS FOR TABS ---

function OverviewTab({ client, isPortal, dashboard, invoices = [], tasks = [] }) {
  const [liveMetrics, setLiveMetrics] = useState(null);

  useEffect(() => {
    if (client.reportei_config?.project_id) {
      reportei.getMetrics(client.reportei_config.project_id).then(setLiveMetrics);
    }
  }, [client]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Live Performance - REAL TIME FROM REPORTEI */}
        {client.reportei_config?.project_id && (
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Zap size={18} className="text-cs-accent animate-pulse" /> Performance Live (Reportei)
              </h3>
              <span className="text-[10px] text-cs-text-secondary font-mono">LIVE SYNC ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-cs-bg border border-cs-border rounded-xl p-4 group-hover:border-cs-primary transition-colors">
                <div className="flex items-center gap-2 mb-2">
                   <Camera size={14} className="text-pink-500" />
                   <span className="text-[10px] text-cs-text-secondary font-bold uppercase">Redes Sociais</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {typeof liveMetrics?.instagram?.followers === 'number' 
                    ? liveMetrics.instagram.followers.toLocaleString() 
                    : '---'}
                </div>
                <p className="text-[10px] text-cs-text-secondary mt-1">Seguidores Totais</p>
              </div>
              
              <div className="bg-cs-bg border border-cs-border rounded-xl p-4 group-hover:border-cs-primary transition-colors">
                <div className="flex items-center gap-2 mb-2">
                   <TrendingIcon size={14} className="text-blue-500" />
                   <span className="text-[10px] text-cs-text-secondary font-bold uppercase">Meta Ads</span>
                </div>
                <div className="text-lg font-bold text-white">
                  R$ {typeof liveMetrics?.facebook_ads?.spend === 'number' 
                    ? liveMetrics.facebook_ads.spend.toLocaleString() 
                    : '---'}
                </div>
                <p className="text-[10px] text-green-400 font-bold mt-1">{liveMetrics?.facebook_ads?.conversions || 0} Conversões</p>
              </div>

              <div className="bg-cs-bg border border-cs-border rounded-xl p-4 group-hover:border-cs-primary transition-colors">
                <div className="flex items-center gap-2 mb-2">
                   <Globe size={14} className="text-cs-primary" />
                   <span className="text-[10px] text-cs-text-secondary font-bold uppercase">Google Ads</span>
                </div>
                <div className="text-lg font-bold text-white">
                  R$ {typeof liveMetrics?.google_ads?.spend === 'number' 
                    ? liveMetrics.google_ads.spend.toLocaleString() 
                    : '---'}
                </div>
                <p className="text-[10px] text-cs-text-secondary mt-1">{liveMetrics?.google_ads?.clicks || 0} Cliques</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Campaigns - Portal Only */}
        {isPortal && dashboard?.campaigns?.length > 0 && (
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingIcon size={18} className="text-green-400" /> Campanhas Ativas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(dashboard?.campaigns || []).map((c, i) => (
                <div key={i} className="bg-cs-bg border border-cs-border rounded-xl p-4">
                  <p className="text-[10px] text-cs-text-secondary uppercase font-bold mb-1">{c.name}</p>
                  <div className="flex justify-between items-end">
                    <div className="text-lg font-bold text-white">R$ {c.spent?.toLocaleString()}</div>
                    <div className="text-xs text-green-400 font-bold">ROAS {c.roas}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-cs-primary" /> {isPortal ? 'Minhas Entregas' : 'Projetos em Destaque'}
          </h3>
          <div className="space-y-4">
            {(isPortal ? (dashboard?.nextDeliveries || []) : tasks.slice(0, 4)).map((p, i) => (
              <div key={i} className="bg-cs-bg border border-cs-border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium text-sm">{p.title || p.name}</h4>
                    <p className="text-[10px] text-cs-text-secondary mt-0.5">Prazo: {p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold capitalize border",
                    (p.status === 'concluido' || p.status === 'Finalizado') ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-cs-primary/10 text-cs-primary border-cs-primary/20"
                  )}>
                    {p.status?.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {!isPortal && tasks.length === 0 && (
              <p className="text-[10px] text-cs-text-secondary text-center py-4">Nenhuma tarefa aberta recentemente.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Live Metrics - Portal Only */}
        {isPortal && (
          <div className="bg-gradient-to-br from-cs-primary/20 to-cs-bg border border-cs-primary/30 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Clock size={18} /> Time Tracking
            </h3>
            <div className="text-3xl font-bold text-white mb-1">{dashboard?.monthlyHours || 0}h</div>
            <p className="text-xs text-cs-text-secondary mb-4">Investidas este mês no seu projeto.</p>
            <div className="w-full h-1.5 bg-cs-bg rounded-full overflow-hidden">
              <div className="h-full bg-cs-primary" style={{ width: '65%' }}></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
            <p className="text-cs-text-secondary text-xs mb-1">Última Aprovação</p>
            <p className="text-white font-bold">
              {isPortal && dashboard?.approvals?.[0] ? dashboard.approvals[0].item : 'Nenhuma este mês'}
            </p>
            <p className="text-[10px] text-green-400 mt-1">Aprovado recentemente</p>
          </div>
          
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
            <p className="text-cs-text-secondary text-xs mb-1">Fee Mensal</p>
            <p className="text-white font-bold">R$ {client.monthly_fee?.toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-cs-text-secondary mt-1">Status: Regular</p>
          </div>

          <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
            <p className="text-cs-text-secondary text-xs mb-3 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <CircleDollarSign size={14} className="text-green-400" /> Cobranças Recentes
            </p>
            <div className="space-y-2">
              {invoices.slice(0, 3).map((inv, idx) => (
                <div key={inv.id || idx} className="flex justify-between items-center bg-cs-bg/50 p-2.5 border border-cs-border rounded-xl">
                  <div className="min-w-0">
                    <p className="text-white font-medium text-xs truncate max-w-[130px]">{inv.service}</p>
                    <p className="text-[9px] text-cs-text-secondary mt-0.5">Vencimento: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('pt-BR') : '---'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-xs">R$ {inv.amount?.toLocaleString('pt-BR')}</p>
                    <span className={cn(
                      "text-[8px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 capitalize",
                      inv.status === 'paid' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      inv.status === 'pending' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {inv.status === 'paid' ? 'Pago' : inv.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <p className="text-[10px] text-cs-text-secondary text-center py-2">Nenhuma cobrança registrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyTab({ client }) {
  return (
    <div className="max-w-4xl space-y-8">
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target size={20} className="text-cs-primary" /> Planejamento Estratégico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
            <h4 className="text-white text-sm font-bold mb-3">Diferenciais da Marca</h4>
            <ul className="text-xs text-cs-text-secondary space-y-2 list-disc pl-4">
              <li>Produção 100% nacional e artesanal.</li>
              <li>Matéria-prima certificada ecologicamente.</li>
              <li>Atendimento personalizado VIP.</li>
            </ul>
          </div>
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
            <h4 className="text-white text-sm font-bold mb-3">Objetivos do Semestre</h4>
            <ul className="text-xs text-cs-text-secondary space-y-2 list-disc pl-4">
              <li>Aumentar base de leads em 40%.</li>
              <li>Consolidar presença no Instagram e TikTok.</li>
              <li>Lançamento da nova linha premium em Junho.</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-white text-sm font-bold mb-4">Assets da Marca</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Logo Principal', 'Logo Secundário', 'Manual da Marca', 'Banco de Fotos'].map((item, i) => (
            <div key={i} className="bg-cs-surface border border-cs-border rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-cs-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-cs-bg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={20} className="text-cs-text-secondary group-hover:text-cs-primary" />
              </div>
              <span className="text-xs text-white font-medium">{item}</span>
              <button className="mt-3 text-[10px] text-cs-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir <ExternalLink size={10} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductionTab({ client, tasks = [] }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Fluxo de Entrega</h3>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-cs-surface border border-cs-border rounded-full text-xs text-cs-text-secondary">Total: {tasks.length} tarefas</span>
        </div>
      </div>
      
      <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden shadow-2xl">
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
              <tr key={row.id || i} className="border-b border-cs-border/50 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{row.title}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] border capitalize",
                    row.status === 'concluido' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    row.status === 'em-producao' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    row.status === 'aguardando-cliente' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                    row.status === 'ajustes' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  )}>
                    {row.status?.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">{row.assigned_to || 'Sem responsável'}</td>
                <td className="px-6 py-4">{row.deadline ? new Date(row.deadline).toLocaleDateString('pt-BR') : '---'}</td>
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

function ApprovalsTab({ client }) {
  const handleCopyLink = () => {
    const link = `${window.location.origin}/approve/${client.id}`;
    navigator.clipboard.writeText(link);
    alert('Link de aprovação copiado! Envie para o cliente no WhatsApp.');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-cs-surface border border-cs-border rounded-2xl p-6">
        <div>
          <h3 className="text-white font-bold mb-1">Review Center do Cliente</h3>
          <p className="text-cs-text-secondary text-xs">Acompanhe as aprovações pendentes deste cliente.</p>
        </div>
        <button onClick={handleCopyLink} className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2">
          COPIAR LINK MÁGICO
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden group">
          <div className="aspect-square bg-cs-bg relative">
            <img 
              src={`https://picsum.photos/seed/${client.name + item}/600/600`} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
              alt="Preview"
            />
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded shadow-lg">PENDENTE</span>
            </div>
          </div>
          <div className="p-4">
            <h4 className="text-white font-medium text-sm mb-1">Post Carrossel: {item}</h4>
            <p className="text-[10px] text-cs-text-secondary mb-4">Campanha: Coleção Inverno</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-2 rounded-lg transition-colors">APROVAR</button>
              <button className="flex-1 bg-cs-bg border border-cs-border hover:border-red-500/50 text-white text-[10px] font-bold py-2 rounded-lg transition-colors">AJUSTES</button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

function AssetsTab({ client }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Presença Digital</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-cs-surface border border-cs-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Camera size={20} className="text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Instagram</p>
                <p className="text-xs text-cs-text-secondary">@pontocor_oficial</p>
              </div>
            </div>
            <button className="text-cs-text-secondary hover:text-white"><ExternalLink size={16} /></button>
          </div>
          <div className="flex items-center justify-between p-4 bg-cs-surface border border-cs-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">LinkedIn</p>
                <p className="text-xs text-cs-text-secondary">Ponto Cor Fotografia</p>
              </div>
            </div>
            <button className="text-cs-text-secondary hover:text-white"><ExternalLink size={16} /></button>
          </div>
          <div className="flex items-center justify-between p-4 bg-cs-surface border border-cs-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cs-primary/10 flex items-center justify-center">
                <Globe size={20} className="text-cs-primary" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Website Principal</p>
                <p className="text-xs text-cs-text-secondary">pontocor.com.br</p>
              </div>
            </div>
            <button className="text-cs-text-secondary hover:text-white"><ExternalLink size={16} /></button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Pastas de Trabalho</h3>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Share2 size={24} className="text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Google Drive Central</h4>
              <p className="text-[10px] text-cs-text-secondary">Acesso compartilhado com a equipe</p>
            </div>
          </div>
          <button className="w-full bg-cs-bg border border-cs-border hover:border-cs-primary text-white py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
            ACESSAR DRIVE DO CLIENTE <ExternalLink size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}

function DocsTab({ client }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Informações Cadastrais</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-cs-text-secondary uppercase">CNPJ</label>
              <p className="text-sm text-white font-mono">12.345.678/0001-90</p>
            </div>
            <div>
              <label className="text-[10px] text-cs-text-secondary uppercase">Razão Social</label>
              <p className="text-sm text-white">Ponto Cor ME</p>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-cs-text-secondary uppercase">Endereço</label>
            <p className="text-sm text-white">Av. Paulista, 1000 - São Paulo, SP</p>
          </div>
        </div>
      </div>
      
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Contratos e Anexos</h3>
        <div className="space-y-3">
          {[
            { n: 'Contrato de Prestação de Serviços - 2026', s: '2.4 MB' },
            { n: 'Aditivo 01 - Campanha Extra', s: '1.1 MB' },
            { n: 'Proposta Comercial Aprovada', s: '4.5 MB' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-cs-bg border border-cs-border rounded-lg group hover:border-cs-primary transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-cs-text-secondary group-hover:text-cs-primary" />
                <div>
                  <p className="text-xs text-white font-medium">{doc.n}</p>
                  <p className="text-[10px] text-cs-text-secondary">{doc.s}</p>
                </div>
              </div>
              <button className="text-cs-text-secondary hover:text-white"><DownloadIcon size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DownloadIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function DNATab({ client, createTask }) {
  const [formsLink, setFormsLink] = useState(client.forms_url || '');
  const [pastedAnswers, setPastedAnswers] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPlan, setAiPlan] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const copyQuestions = () => {
    const questions = `1. Qual é a principal dor que o seu produto/serviço resolve hoje?
2. Cite 3 concorrentes diretos que você admira e 1 que você não gosta (e o porquê).
3. Se a sua marca fosse uma pessoa famosa, quem seria e por quê?
4. Quais são os 3 produtos/serviços mais rentáveis (Curva A)?
5. Quais objeções de vendas sua equipe mais escuta?`;
    navigator.clipboard.writeText(questions);
    alert('Perguntas copiadas! Cole no seu Google Forms.');
  };

  const handleAnalyze = async () => {
    if (!pastedAnswers) return alert('Cole as respostas do cliente primeiro.');
    setIsAnalyzing(true);
    try {
      const { text } = await generateStrategicPlan(client, pastedAnswers);
      setAiPlan(text);
    } catch (err) {
      alert('Erro ao analisar: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('ai_memories').upsert({
          client_id: client.id,
          key: 'strategic_plan_3months',
          value: aiPlan
        }, { onConflict: 'client_id,key' }); // Corrigido onConflict sem espaço
        
        if (error) {
          console.error('Erro no upsert da memória:', error);
          // Não vamos travar a criação das tarefas se a memória falhar.
        }
      }

      const t1 = await createTask({
        title: 'Mês 1: Setup, Alinhamento e Tração',
        client_id: client.id,
        client_name: client.name,
        status: 'backlog',
        tag: 'Onboarding',
        estimated_hours: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      if (!t1) throw new Error('A criação da tarefa 1 falhou no banco de dados. Verifique console.');

      const t2 = await createTask({
        title: 'Mês 2: Escala, Conversão e Otimização',
        client_id: client.id,
        client_name: client.name,
        status: 'backlog',
        tag: 'Campanhas',
        estimated_hours: 15,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      if (!t2) throw new Error('A criação da tarefa 2 falhou no banco de dados. Verifique console.');

      const t3 = await createTask({
        title: 'Mês 3: Retenção, BI e Automação',
        client_id: client.id,
        client_name: client.name,
        status: 'backlog',
        tag: 'Automação',
        estimated_hours: 15,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      if (!t3) throw new Error('A criação da tarefa 3 falhou no banco de dados. Verifique console.');

      alert('Plano de 3 meses aprovado! Tarefas enviadas para a Produção e Memória salva.');
      setAiPlan('');
      setPastedAnswers('');
    } catch (e) {
      console.error('Erro completo:', e);
      alert('Erro ao salvar plano: ' + e.message);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ONBOARDING & BUSINESS CORE */}
      <section className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Bot size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <Target size={22} className="text-cs-accent" /> Onboarding & Business Core
          </h3>
          <p className="text-sm text-cs-text-secondary mb-8">Gerencie a entrada do cliente, colete respostas do Forms e crie o plano de ação estratégico com IA.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Esquerda: Forms */}
            <div className="space-y-6">
              <div className="bg-cs-bg border border-cs-border rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-blue-400" /> 1. Questionário (Google Forms)
                </h4>
                <p className="text-xs text-cs-text-secondary mb-4">Envie o questionário estrutural para o cliente mapear o DNA do negócio.</p>
                
                <button onClick={copyQuestions} className="w-full mb-4 bg-cs-surface border border-cs-border hover:border-cs-primary text-white py-2 rounded-xl text-xs font-bold transition-all">
                  COPIAR PERGUNTAS BASE
                </button>

                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Link do Forms do Cliente</label>
                <div className="flex gap-2">
                  <input type="url" value={formsLink} onChange={e => setFormsLink(e.target.value)} placeholder="https://forms.google.com/..." className="flex-1 bg-cs-surface border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:border-cs-primary focus:outline-none" />
                  <button className="bg-cs-primary text-white px-4 rounded-xl text-xs font-bold hover:bg-cs-primary-hover transition-colors">Salvar</button>
                </div>
              </div>

              <div className="bg-cs-bg border border-cs-border rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                  <Bot size={16} className="text-cs-accent" /> 2. Análise de Respostas (IA)
                </h4>
                <p className="text-xs text-cs-text-secondary mb-4">Cole as respostas que o cliente deu no Forms para gerar o planejamento.</p>
                
                <textarea 
                  value={pastedAnswers}
                  onChange={e => setPastedAnswers(e.target.value)}
                  placeholder="Cole aqui as respostas enviadas pelo cliente..."
                  className="w-full h-24 bg-cs-surface border border-cs-border rounded-xl p-3 text-xs text-white focus:border-cs-accent focus:outline-none resize-none mb-3 custom-scrollbar"
                />
                
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-cs-accent to-purple-600 hover:from-purple-600 hover:to-cs-accent text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cs-accent/20"
                >
                  {isAnalyzing ? <span className="animate-pulse">Analisando DNA da Marca...</span> : <><Sparkles size={14} /> GERAR PLANO ESTRATÉGICO</>}
                </button>
              </div>
            </div>

            {/* Direita: Plano Gerado */}
            <div className="bg-cs-bg border border-cs-border rounded-2xl p-6 flex flex-col">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                <Kanban size={16} className="text-green-400" /> 3. Plano de Ação Validado
              </h4>
              
              <div className="flex-1 bg-cs-surface border border-cs-border rounded-xl p-4 overflow-y-auto custom-scrollbar">
                {aiPlan ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-cs-text-primary bg-transparent p-0 m-0 border-0">{aiPlan}</pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-cs-text-secondary opacity-50">
                    <Target size={32} className="mb-2" />
                    <p className="text-xs text-center">Aguardando análise da IA para<br/>gerar o plano de 30 dias.</p>
                  </div>
                )}
              </div>
              
              {aiPlan && (
                <button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  {isApproving ? 'CONVERTENDO...' : 'APROVAR & CONVERTER EM TAREFAS'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Strategic Info (View Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-400" /> Público-Alvo (Cadastrado)
          </h4>
          <p className="text-sm text-cs-text-secondary leading-relaxed">
            {client.target_audience || "Definição de público pendente. Use a IA acima para gerar."}
          </p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-400" /> Tom de Voz (Cadastrado)
          </h4>
          <p className="text-sm text-cs-text-secondary leading-relaxed">
            {client.tone_of_voice || "Definição de tom de voz pendente. Use a IA acima para gerar."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfitabilityTab({ client, tasks = [] }) {
  const { team } = useTeam();

  // Filtrar tarefas apenas deste cliente (já pré-filtradas de forma otimizada pelo useTasks)
  const clientTasks = tasks;
  
  // Calcular custo estimado e real
  let realTeamCost = 0;
  let estimatedBurnRate = 0;
  clientTasks.forEach(task => {
    const hoursTracked = (task.tracked_seconds || 0) / 3600;
    const hoursEstimated = task.estimated_hours || 0;
    
    const assignee = team.find(m => m.id === task.assigned_to_id || m.name === task.assigned_to);
    const hourlyCost = assignee?.hourly_cost || 50; 
    
    realTeamCost += (hoursTracked * hourlyCost);
    estimatedBurnRate += (hoursEstimated * hourlyCost);
  });

  const revenue = Number(client.monthly_fee) || 0;
  const overhead = (revenue * 0.15); // 15% custos fixos da agência (aluguel, software)
  const profit = revenue - realTeamCost - overhead;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const isBurnRateHigh = revenue > 0 && estimatedBurnRate > (revenue * 0.70);

  // Cálculo de Status
  let marginStatus = 'SAUDÁVEL';
  let marginColor = 'text-green-400';
  let marginBg = 'bg-green-500/10 border-green-500/20';
  if (margin < 40 && margin > 15) {
    marginStatus = 'ATENÇÃO';
    marginColor = 'text-yellow-400';
    marginBg = 'bg-yellow-500/10 border-yellow-500/20';
  } else if (margin <= 15) {
    marginStatus = 'CRÍTICO';
    marginColor = 'text-red-400';
    marginBg = 'bg-red-500/10 border-red-500/20';
  }

  const teamCostPercent = revenue > 0 ? (realTeamCost / revenue) * 100 : 0;
  const overheadPercent = revenue > 0 ? (overhead / revenue) * 100 : 0;
  const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isBurnRateHigh && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle size={24} className="text-red-400" />
          <div>
            <h4 className="text-red-400 font-bold">Aviso de Burn Rate Elevado</h4>
            <p className="text-sm text-white/80">O custo estimado de produção (R$ {estimatedBurnRate.toLocaleString('pt-BR')}) para este contrato ultrapassa 70% da receita mensal. Revise os tempos estimados das tarefas.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Receita Mensal</p>
          <p className="text-xl font-bold text-white">R$ {revenue.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Custo de Operação (Burn)</p>
          <p className="text-xl font-bold text-red-400">R$ {realTeamCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Lucro Líquido Real</p>
          <p className="text-xl font-bold text-green-400">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <p className="text-cs-text-secondary text-[10px] uppercase font-bold mb-1">Margem Real</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-white">{margin.toFixed(1)}%</p>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${marginColor} ${marginBg}`}>{marginStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h4 className="text-white font-bold mb-6 flex items-center gap-2">
            <TrendingIcon size={18} className="text-cs-primary" /> Decomposição de Custos
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Equipe (Horas Gastas)', val: realTeamCost, color: 'bg-cs-primary', p: teamCostPercent },
              { label: 'Custos Fixos / Ferramentas', val: overhead, color: 'bg-purple-500', p: overheadPercent },
              { label: 'Lucro Líquido', val: profit, color: 'bg-green-500', p: profitPercent },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-cs-text-secondary">{item.label}</span>
                  <span className="text-white font-medium">R$ {item.val.toLocaleString('pt-BR')} ({item.p}%)</span>
                </div>
                <div className="w-full h-2 bg-cs-bg rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.p}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" /> Alertas de Eficiência
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-cs-bg border border-cs-border rounded-xl">
              <p className="text-xs text-white font-medium">Ociosidade Detectada</p>
              <p className="text-[10px] text-cs-text-secondary mt-1">Este cliente consumiu menos 15% das horas planejadas este mês. Margem subiu.</p>
            </div>
            <div className="p-3 bg-cs-bg border border-cs-border rounded-xl">
              <p className="text-xs text-white font-medium">Equilíbrio de Fee</p>
              <p className="text-[10px] text-cs-text-secondary mt-1">O valor do fee está alinhado com o mercado para o volume atual de jobs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultTab({ client, isPortal }) {
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});
  const [newItem, setNewItem] = useState({ platform_name: '', encrypted_username: '', encrypted_password: '', notes: '' });

  useEffect(() => {
    async function fetchVault() {
      if (!isSupabaseConfigured) {
        const safeName = (client?.name || 'cliente').toLowerCase().replace(/\s+/g, '');
        setVaultItems([
          { id: '1', platform_name: 'Instagram', encrypted_username: '@' + safeName, encrypted_password: '••••••••', notes: 'Login via App' }
        ]);
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
    if (!newItem.platform_name) return;
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('client_vault').insert([{ ...newItem, client_id: client.id }]).select().single();
        if (error) throw error;
        setVaultItems([...vaultItems, data]);
      } else {
        setVaultItems([...vaultItems, { ...newItem, id: Date.now().toString() }]);
      }
      setNewItem({ platform_name: '', encrypted_username: '', encrypted_password: '', notes: '' });
    } catch (e) {
      alert('Erro ao salvar no cofre.');
    }
  };

  const togglePassword = (id) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover esta credencial?')) return;
    setVaultItems(prev => prev.filter(item => item.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('client_vault').delete().eq('id', id);
    }
    toast.success('Credencial removida do cofre');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-cs-primary rounded-xl flex items-center justify-center shadow-lg shadow-cs-primary/20">
            <Lock size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Cofre Seguro</h3>
            <p className="text-cs-text-secondary text-sm">Credenciais e chaves de acesso criptografadas.</p>
          </div>
        </div>

        {loading ? (
          <p className="text-cs-text-secondary text-center py-8">Carregando cofre...</p>
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
                    <button onClick={() => copyToClipboard(item.encrypted_username, 'Login')} className="text-cs-text-secondary hover:text-cs-primary transition-colors p-1" title="Copiar login">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-cs-surface px-3 py-2 rounded-lg border border-cs-border relative">
                    <span className="text-[10px] text-cs-text-secondary w-12">Senha:</span>
                    <span className="text-sm text-white font-mono flex-1 break-all">{showPassword[item.id] ? item.encrypted_password : '••••••••••••'}</span>
                    <button onClick={() => copyToClipboard(item.encrypted_password, 'Senha')} className="text-cs-text-secondary hover:text-cs-primary transition-colors p-1" title="Copiar senha">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => togglePassword(item.id)} className="text-cs-text-secondary hover:text-white transition-colors p-1">
                      {showPassword[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-cs-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg" title="Remover credencial">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {vaultItems.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-cs-border rounded-2xl bg-cs-surface/20">
                <Lock size={32} className="mx-auto text-cs-text-secondary mb-4 opacity-50" />
                <p className="text-cs-text-secondary font-medium">Nenhuma credencial cadastrada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-2xl">
        <h4 className="text-lg font-bold text-white mb-6">Adicionar Credencial</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Plataforma *</label>
            <input 
              type="text" 
              placeholder="Ex: Instagram, Google Ads" 
              value={newItem.platform_name}
              onChange={e => setNewItem({...newItem, platform_name: e.target.value})}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Login / Email</label>
            <input 
              type="text" 
              value={newItem.encrypted_username}
              onChange={e => setNewItem({...newItem, encrypted_username: e.target.value})}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none font-mono transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Senha</label>
            <input 
              type="password" 
              value={newItem.encrypted_password}
              onChange={e => setNewItem({...newItem, encrypted_password: e.target.value})}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none font-mono transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Observações (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ex: Autenticação em 2 fatores no celular" 
              value={newItem.notes}
              onChange={e => setNewItem({...newItem, notes: e.target.value})}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:border-cs-primary outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleSave} className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-cs-primary/30 transition-all active:scale-95">
            SALVAR NO COFRE
          </button>
        </div>
      </div>
    </div>
  );
}
