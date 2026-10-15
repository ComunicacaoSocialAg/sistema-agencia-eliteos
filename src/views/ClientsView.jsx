import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Target, 
  DollarSign, 
  Mail, 
  Phone, 
  Folder, 
  ExternalLink, 
  X,
  MoreHorizontal,
  Edit3,
  LayoutGrid,
  List,
  Kanban,
  CheckCircle2,
  Trash2,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useIntelligence } from '../hooks/useIntelligence';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useDeals } from '../hooks/useDeals';
import { cn } from '../utils/cn';
import ClientWorkspace from '../components/ClientWorkspace';
import NewProjectModal from '../components/NewProjectModal';
import ReviewCenterHub from '../components/ReviewCenterHub';
import { useAllDeliverables } from '../hooks/useDeliverables';
import { createClientFolderStructure, createProjectFolder, createProposalFolder } from '../lib/googleDrive';

const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
};

const STATUS_LABELS = {
  active: 'ATIVO',
  inactive: 'INATIVO',
  pending: 'PENDENTE'
};

const PROJECT_STATUS_COLORS = {
  'backlog': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  'em-andamento': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'aguardando-cliente': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'concluido': 'bg-green-500/10 text-green-400 border-green-500/20',
};

const PROJECT_STATUS_LABELS = {
  'backlog': 'BACKLOG',
  'em-andamento': 'EM ANDAMENTO',
  'aguardando-cliente': 'AGUARD. CLIENTE',
  'concluido': 'CONCLUÍDO',
};

function ClientCard({ client, onClick, onOpenReview, score, pendingReviewsCount = 0 }) {
  return (
    <div 
      onClick={onClick}
      className="bg-cs-surface border border-cs-border rounded-2xl p-5 hover:border-cs-primary/50 transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Users size={80} />
      </div>
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${client.brand_color || '#3b82f6'}cc, ${client.brand_color || '#3b82f6'}44)` }}>
          {client.name.charAt(0)}
        </div>
        <div className="text-right">
          <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 inline-block", STATUS_COLORS[client.status])}>
            {STATUS_LABELS[client.status]}
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <div className={cn("w-1.5 h-1.5 rounded-full", score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500")} />
            <span className="text-[10px] text-cs-text-secondary font-bold tracking-widest uppercase">Health: {score || 0}%</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white group-hover:text-cs-primary transition-colors truncate">{client.name}</h3>
        <p className="text-xs text-cs-text-secondary mb-4 truncate">{client.contact_name || 'Sem contato'}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-cs-border/50 gap-2">
          <div>
            <p className="text-[9px] text-cs-text-secondary font-bold uppercase tracking-widest">Fee Mensal</p>
            <p className="text-sm font-bold text-white">R$ {client.monthly_fee?.toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenReview(); }}
              className={cn(
                "px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border cursor-pointer",
                pendingReviewsCount > 0 
                  ? "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20" 
                  : "bg-cs-bg text-cs-text-secondary border-cs-border hover:text-white hover:border-cs-primary/40"
              )}
              title="Abrir Review Center e aprovações deste cliente"
            >
              <CheckCircle2 size={12} className={pendingReviewsCount > 0 ? "text-orange-400 animate-pulse" : "text-cs-primary"} />
              Review
              {pendingReviewsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-orange-500 text-black text-[9px] font-black flex items-center justify-center">
                  {pendingReviewsCount}
                </span>
              )}
            </button>

            <button 
              onClick={onClick}
              className="p-2 bg-cs-bg rounded-lg text-cs-text-secondary group-hover:text-cs-primary transition-colors border border-cs-border group-hover:border-cs-primary/30 cursor-pointer"
              title="Abrir workspace do cliente"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectGridCard({ project, onStatusChange, onDelete }) {
  const pct = project.task_count > 0 ? Math.round((project.tasks_done / project.task_count) * 100) : 0;
  
  return (
    <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 hover:border-cs-primary/50 transition-all flex flex-col justify-between group relative">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 rounded-lg bg-cs-primary/10 flex items-center justify-center text-lg">
            {project.type === 'social-media' ? '📱' :
             project.type === 'branding' ? '🎨' :
             project.type === 'site' ? '🌐' :
             project.type === 'video' ? '🎬' :
             project.type === 'campanha' ? '📣' :
             project.type === 'trafego' ? '📊' :
             project.type === 'evento' ? '🚀' :
             project.type === 'interno' ? '🏠' :
             project.type === 'proposta' ? '💼' : '✏️'}
          </div>
          <select 
            value={project.status} 
            onChange={(e) => onStatusChange(project.id, e.target.value)}
            className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border bg-cs-bg focus:outline-none cursor-pointer", PROJECT_STATUS_COLORS[project.status] || PROJECT_STATUS_COLORS.backlog)}
          >
            <option value="backlog">BACKLOG</option>
            <option value="em-andamento">EM ANDAMENTO</option>
            <option value="aguardando-cliente">AGUARD. CLIENTE</option>
            <option value="concluido">CONCLUÍDO</option>
          </select>
        </div>

        <h3 className="font-bold text-white text-base mb-1 truncate" title={project.name}>{project.name}</h3>
        <p className="text-xs text-cs-text-secondary mb-4 truncate">{project.client_name || 'Interno da Agência'}</p>

        {/* Progress */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-cs-text-secondary font-medium">Progresso das Tarefas</span>
            <span className="text-white font-bold">{pct}% ({project.tasks_done}/{project.task_count})</span>
          </div>
          <div className="w-full bg-cs-bg rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-cs-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-cs-border/50 flex items-center justify-between text-xs text-cs-text-secondary">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-cs-text-secondary">Prazo</p>
          <p className="text-white font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString('pt-BR') : 'Sem prazo'}</p>
        </div>
        <div className="flex items-center gap-2">
          {project.value > 0 && (
            <div className="text-right mr-2">
              <p className="text-[9px] uppercase tracking-widest text-cs-text-secondary">Valor</p>
              <p className="text-green-400 font-bold">R$ {Number(project.value).toLocaleString('pt-BR')}</p>
            </div>
          )}
          <button 
            onClick={() => onDelete(project.id)}
            className="p-1.5 rounded-lg text-cs-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Remover Projeto"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewClientModal({ onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [form, setForm] = useState({
    name: '',
    document_id: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    monthly_fee: '',
    billing_day: '10',
    contract_start_date: '',
    brand_color: '#3b82f6',
    drive_url: '',
    reportei_url: '',
    tone_of_voice: '',
    target_audience: '',
    strategic_goals: '',
    notes: ''
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">Cadastrar Novo Cliente</h3>
            <p className="text-xs text-cs-text-secondary">Preencha os dados completos para onboarding da conta na agência.</p>
          </div>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-cs-border bg-cs-bg/30 shrink-0">
          {[
            { id: 'geral', label: '1. Contato & Empresa' },
            { id: 'financeiro', label: '2. Financeiro' },
            { id: 'drive', label: '3. Links & Drive' },
            { id: 'branding', label: '4. Branding & IA' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-cs-primary text-white bg-cs-primary/10'
                  : 'border-transparent text-cs-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {activeTab === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Nome da Empresa / Marca *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Queijaria Poços de Caldas" autoFocus
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Razão Social / CNPJ</label>
                <input type="text" value={form.document_id} onChange={e => set('document_id', e.target.value)} placeholder="00.000.000/0001-00"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Nome do Contato Principal *</label>
                <input type="text" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Ex: Roberto Silva"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">E-mail Principal</label>
                <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="roberto@empresa.com"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">WhatsApp / Telefone</label>
                <input type="text" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="(35) 99999-8888"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Fee Mensal / Retainer (R$) *</label>
                <input type="number" value={form.monthly_fee} onChange={e => set('monthly_fee', e.target.value)} placeholder="15000"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary font-bold text-green-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Dia de Vencimento Fatura</label>
                <select value={form.billing_day} onChange={e => set('billing_day', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary">
                  {['05', '10', '15', '20', '25', '30'].map(day => (
                    <option key={day} value={day}>Dia {day}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Data de Início do Contrato</label>
                <input type="date" value={form.contract_start_date} onChange={e => set('contract_start_date', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Link da Pasta no Google Drive</label>
                <input type="url" value={form.drive_url} onChange={e => set('drive_url', e.target.value)} placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Link do Relatório (Reportei / Dashboard Externa)</label>
                <input type="url" value={form.reportei_url} onChange={e => set('reportei_url', e.target.value)} placeholder="https://app.reportei.com/report/..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Cor da Marca (HEX)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.brand_color} onChange={e => set('brand_color', e.target.value)} className="w-10 h-10 rounded-xl bg-cs-bg border border-cs-border cursor-pointer" />
                  <input type="text" value={form.brand_color} onChange={e => set('brand_color', e.target.value)} className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white font-mono text-sm uppercase" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Tom de Voz da Comunicação</label>
                <input type="text" value={form.tone_of_voice} onChange={e => set('tone_of_voice', e.target.value)} placeholder="Ex: Sofisticado, rústico-chique e próximo."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Público-Alvo Principal</label>
                <input type="text" value={form.target_audience} onChange={e => set('target_audience', e.target.value)} placeholder="Ex: Homens e Mulheres 30-55 anos classe A/B."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">Objetivo Estratégico do Cliente</label>
                <textarea rows={2} value={form.strategic_goals} onChange={e => set('strategic_goals', e.target.value)} placeholder="Ex: Ser a maior referência da região em gastronomia artesanal..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-primary custom-scrollbar" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-cs-border bg-cs-bg/50 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-cs-text-secondary hover:text-white uppercase tracking-wider">Cancelar</button>
          <button 
            onClick={() => {
              if (!form.name.trim()) return;
              onSave(form);
              onClose();
            }}
            className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-cs-primary/20 cursor-pointer"
          >
            Salvar e Cadastrar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsView() {
  const { clients, loading: clientsLoading, totalMRR, createClient, updateClient } = useClients();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject } = useProjects();
  const { tasks, createTask } = useTasks();
  const { deliverables } = useAllDeliverables();
  const { createDeal } = useDeals();
  
  const { healthScores, capacity } = useIntelligence();
  const { setContext } = useAIAssistant();
  
  const [viewTab, setViewTab] = useState('clients'); // 'clients' | 'projects' | 'review'
  const [projectViewMode, setProjectViewMode] = useState('grid'); // 'grid' | 'list' | 'kanban'
  const [search, setSearch] = useState('');
  
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientInitialTab, setClientInitialTab] = useState('overview');

  const pendingDeliverables = (deliverables || []).filter(d => d.status === 'pendente');

  useEffect(() => {
    setContext({
      module: 'clientes',
      title: 'Clientes & Projetos',
      data: {
        total_clientes: clients.length,
        clientes_ativos: clients.filter(c => c.status === 'active').length,
        mrr_total: totalMRR,
        total_projetos: projects.length,
        pendentes_review: pendingDeliverables.length,
      },
    });
  }, [clients, totalMRR, projects, pendingDeliverables.length, setContext]);

  // Filter clients
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter projects
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInjectTestData = async () => {
    try {
      await createClient({
        name: 'Dr. Alberto Brasil',
        contact_name: 'Alberto',
        contact_email: 'contato@dralbertobrasil.com',
        monthly_fee: 5000,
        brand_color: '#0ea5e9',
        notes: 'Clínica médica. Foco em autoridade e captação de pacientes particulares.',
        tone_of_voice: 'Profissional, acolhedor e científico.',
        target_audience: 'Pacientes 30-60 anos buscando atendimento humanizado.',
        strategic_goals: 'Aumentar agendamentos via WhatsApp em 30%.'
      });

      await createClient({
        name: 'Dubola Molhos Especiais',
        contact_name: 'Carlos Dubola',
        contact_email: 'carlos@dubola.com.br',
        monthly_fee: 3500,
        brand_color: '#ef4444',
        notes: 'Marca de molhos de pimenta e condimentos artesanais.',
        tone_of_voice: 'Jovem, divertido, ousado e apetitoso.',
        target_audience: 'Jovens adultos que gostam de churrasco, hambúrguer e pimentas.',
        strategic_goals: 'Expandir a marca para empórios premium e e-commerce.'
      });

      alert('Dados de teste injetados com sucesso!');
    } catch (err) {
      console.error('Erro ao injetar dados:', err);
      alert('Erro ao injetar dados. Verifique o console.');
    }
  };

  const handleCreateClient = async (clientData) => {
    try {
      const folder = await createClientFolderStructure(clientData.name);
      if (folder) {
        clientData.drive_url = folder.url;
      }
    } catch (err) {
      console.warn('Google Drive não configurado ou erro ao criar pasta do cliente:', err);
    }
    await createClient(clientData);
  };

  const handleCreateProject = async (projectData) => {
    let driveUrl = '';
    try {
      if (projectData.is_proposal) {
        const folder = await createProposalFolder(projectData.name);
        if (folder) driveUrl = folder.url;
      } else if (!projectData.is_internal) {
        const folder = await createProjectFolder(projectData.name);
        if (folder) driveUrl = folder.url;
      }
    } catch (err) {
      console.warn('Google Drive não configurado ou erro ao criar pasta do projeto:', err);
    }

    // 1. Create project
    const projDataToSave = { ...projectData, drive_folder_url: driveUrl };
    const proj = await createProject(projDataToSave);
    
    // 2. If it has tasks, create them in useTasks
    if (projectData.tasks && projectData.tasks.length > 0) {
      for (const t of projectData.tasks) {
        await createTask({
          title: t.title,
          client_id: projectData.client_id || null,
          client_name: projectData.client_name || 'Interno',
          tag: t.tag || 'Campanha',
          estimated_hours: t.estimated_hours || 4,
          status: t.status || 'backlog',
          deadline: t.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigned_to: t.assigned_to || 'Bruno',
        });
      }
    }

    // 3. If it's a proposal, create a deal in the CRM (useDeals)
    if (projectData.is_proposal) {
      await createDeal({
        company: projectData.client_name || 'Novo Prospect',
        contact: 'Contato Inicial',
        value: projectData.value || 0,
        status: 'proposta',
        probability: 50,
        assigned_to: 'Bruno',
      });
    }
  };

  const handleStatusChange = (projectId, newStatus) => {
    updateProject({ id: projectId, status: newStatus });
  };

  if (selectedClient) {
    return (
      <ClientWorkspace 
        client={selectedClient} 
        initialTab={clientInitialTab}
        onBack={() => { setSelectedClient(null); setClientInitialTab('overview'); }} 
        onUpdateClient={updateClient}
      />
    );
  }

  const isLoading = (viewTab === 'clients' ? clientsLoading : projectsLoading) && clients.length === 0;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-cs-bg">
        <div className="w-10 h-10 border-4 border-cs-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Categories for projects
  const clientProjects = filteredProjects.filter(p => !p.is_internal && !p.is_proposal);
  const internalProjects = filteredProjects.filter(p => p.is_internal);
  const crmProposals = filteredProjects.filter(p => p.is_proposal);

  return (
    <div className="h-full flex flex-col bg-cs-bg overflow-y-auto custom-scrollbar">
      <div className="p-8 pb-0 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Clientes & Projetos</h2>
            <p className="text-sm text-cs-text-secondary">
              {viewTab === 'clients' 
                ? `${clients.filter(c => c.status === 'active').length} contas sob gestão ativa.`
                : viewTab === 'projects'
                ? `${projects.filter(p => p.status === 'em-andamento').length} projetos ativos em andamento.`
                : `${pendingDeliverables.length} peças aguardando aprovação ou validação do cliente.`
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleInjectTestData}
              className="bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-400 px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              Injetar Teste
            </button>
            <button 
              onClick={() => setShowNewClientModal(true)}
              className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 text-cs-text-secondary hover:text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} /> NOVO CLIENTE
            </button>
            <button 
              onClick={() => setShowNewProjectModal(true)}
              className="bg-cs-primary hover:bg-cs-primary-hover text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-cs-primary/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} /> NOVO PROJETO
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-cs-border mb-6">
          <button
            onClick={() => { setViewTab('clients'); setSearch(''); }}
            className={cn(
              "px-6 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              viewTab === 'clients' ? "border-cs-primary text-white" : "border-transparent text-cs-text-secondary hover:text-white"
            )}
          >
            <Users size={14} /> Clientes ({clients.length})
          </button>
          <button
            onClick={() => { setViewTab('projects'); setSearch(''); }}
            className={cn(
              "px-6 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              viewTab === 'projects' ? "border-cs-primary text-white" : "border-transparent text-cs-text-secondary hover:text-white"
            )}
          >
            <Folder size={14} /> Projetos ({projects.length})
          </button>
          <button
            onClick={() => { setViewTab('review'); setSearch(''); }}
            className={cn(
              "px-6 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer relative",
              viewTab === 'review' ? "border-cs-primary text-white" : "border-transparent text-cs-text-secondary hover:text-white"
            )}
          >
            <CheckCircle2 size={14} className={pendingDeliverables.length > 0 ? "text-orange-400 animate-pulse" : "text-cs-primary"} /> 
            Review Center
            {pendingDeliverables.length > 0 ? (
              <span className="px-1.5 py-0.5 bg-orange-500 text-black text-[10px] font-black rounded-full shadow-sm">
                {pendingDeliverables.length}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-cs-surface border border-cs-border text-cs-text-secondary text-[10px] font-bold rounded-full">
                {deliverables.length}
              </span>
            )}
          </button>
        </div>

        {/* Capacity Panel & stats (only on clients tab) */}
        {viewTab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-cs-surface border border-cs-border rounded-3xl p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <Target size={14} className="text-cs-primary" /> Previsão de Carga da Equipe (7 dias)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(capacity || []).slice(0,3).map(member => (
                  <div key={member.name} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white font-bold uppercase">{member.name}</span>
                      <span className={cn(
                        "font-bold",
                        member.load7d > 90 ? "text-red-400" : member.load7d > 70 ? "text-yellow-400" : "text-green-400"
                      )}>{member.load7d}%</span>
                    </div>
                    <div className="h-2 bg-cs-bg rounded-full overflow-hidden border border-cs-border">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          member.load7d > 90 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : member.load7d > 70 ? "bg-yellow-500" : "bg-cs-primary"
                        )} 
                        style={{ width: `${Math.min(member.load7d, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cs-surface to-cs-bg border border-cs-border rounded-3xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-green-400" />
                <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Receita Recorrente (MRR)</span>
              </div>
              <div className="text-3xl font-black text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalMRR)}
              </div>
              <div className="text-[10px] text-green-400 mt-1 font-bold">▲ 12.5% vs mês anterior</div>
            </div>
          </div>
        )}

        {/* Project View Mode Selector (only on projects tab) */}
        {viewTab === 'projects' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex bg-cs-surface border border-cs-border rounded-xl p-1 shrink-0">
              {[
                { id: 'grid', label: 'Grid', icon: LayoutGrid },
                { id: 'list', label: 'Lista', icon: List },
                { id: 'kanban', label: 'Kanban', icon: Kanban }
              ].map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setProjectViewMode(mode.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      projectViewMode === mode.id 
                        ? "bg-cs-primary/15 text-cs-primary border border-cs-primary/10" 
                        : "text-cs-text-secondary hover:text-white"
                    )}
                  >
                    <Icon size={14} /> {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search (only for clients and projects tabs) */}
        {viewTab !== 'review' && (
          <div className="relative mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cs-text-secondary" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder={viewTab === 'clients' ? "Filtrar por nome do cliente ou contato..." : "Filtrar por nome do projeto ou cliente..."}
              className="w-full bg-cs-surface border border-cs-border rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-cs-primary transition-all placeholder:text-cs-text-secondary/50 shadow-inner" 
            />
          </div>
        )}
      </div>

      <div className="flex-1 px-8 pb-8">
        {/* REVIEW CENTER TAB */}
        {viewTab === 'review' && (
          <ReviewCenterHub 
            onOpenClientWorkspace={(client, tab) => {
              setSelectedClient(client);
              setClientInitialTab(tab || 'approvals');
            }}
          />
        )}

        {/* CLIENTS TAB */}
        {viewTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map(client => {
              const clientPendingReviews = (deliverables || []).filter(d => {
                const task = tasks.find(t => t.id === d.task_id);
                return (task?.client_id === client.id || task?.client_name === client.name || task?.client?.name === client.name) && d.status === 'pendente';
              }).length;

              return (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  onClick={() => {
                    setSelectedClient(client);
                    setClientInitialTab('overview');
                  }} 
                  onOpenReview={() => {
                    setSelectedClient(client);
                    setClientInitialTab('approvals');
                  }}
                  score={healthScores[client.id] || 0}
                  pendingReviewsCount={clientPendingReviews}
                />
              );
            })}
            {filteredClients.length === 0 && (
              <div className="col-span-full text-center py-24 bg-cs-surface border border-cs-border rounded-3xl border-dashed">
                <Users size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-cs-text-secondary font-medium uppercase tracking-widest text-xs">Nenhum cliente na lista</p>
              </div>
            )}
          </div>
        )}

        {/* PROJECTS TAB */}
        {viewTab === 'projects' && (
          <>
            {/* GRID VIEW */}
            {projectViewMode === 'grid' && (
              <div className="space-y-8">
                {/* 1. Clientes Projects */}
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FolderOpen size={14} className="text-cs-primary" /> Projetos de Clientes ({clientProjects.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clientProjects.map(proj => (
                      <ProjectGridCard key={proj.id} project={proj} onStatusChange={handleStatusChange} onDelete={deleteProject} />
                    ))}
                    {clientProjects.length === 0 && (
                      <div className="col-span-full text-center py-10 bg-cs-surface/20 border border-cs-border rounded-2xl border-dashed text-cs-text-secondary text-xs">
                        Nenhum projeto de cliente encontrado.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Internal Projects */}
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target size={14} className="text-cs-accent" /> Demandas Internas da Agência ({internalProjects.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {internalProjects.map(proj => (
                      <ProjectGridCard key={proj.id} project={proj} onStatusChange={handleStatusChange} onDelete={deleteProject} />
                    ))}
                    {internalProjects.length === 0 && (
                      <div className="col-span-full text-center py-10 bg-cs-surface/20 border border-cs-border rounded-2xl border-dashed text-cs-text-secondary text-xs">
                        Nenhuma demanda interna cadastrada.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Proposals */}
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <DollarSign size={14} className="text-green-400" /> Propostas e CRM ({crmProposals.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {crmProposals.map(proj => (
                      <ProjectGridCard key={proj.id} project={proj} onStatusChange={handleStatusChange} onDelete={deleteProject} />
                    ))}
                    {crmProposals.length === 0 && (
                      <div className="col-span-full text-center py-10 bg-cs-surface/20 border border-cs-border rounded-2xl border-dashed text-cs-text-secondary text-xs">
                        Nenhuma proposta ativa em negociação.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LIST VIEW */}
            {projectViewMode === 'list' && (
              <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-cs-text-secondary">
                  <thead className="bg-cs-bg/50 text-[10px] font-bold text-white uppercase tracking-wider border-b border-cs-border">
                    <tr>
                      <th className="p-4">Projeto</th>
                      <th className="p-4">Cliente / Tipo</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Progresso</th>
                      <th className="p-4">Prazo</th>
                      <th className="p-4 text-right">Valor</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cs-border/50">
                    {filteredProjects.map(proj => {
                      const pct = proj.task_count > 0 ? Math.round((proj.tasks_done / proj.task_count) * 100) : 0;
                      return (
                        <tr key={proj.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 font-semibold text-white">{proj.name}</td>
                          <td className="p-4">
                            <span className="text-white block">{proj.client_name || 'Interno'}</span>
                            <span className="text-[10px] text-cs-text-secondary uppercase">{proj.type_label}</span>
                          </td>
                          <td className="p-4">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", PROJECT_STATUS_COLORS[proj.status] || PROJECT_STATUS_COLORS.backlog)}>
                              {PROJECT_STATUS_LABELS[proj.status] || proj.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <div className="w-16 bg-cs-bg rounded-full h-1 overflow-hidden">
                                <div className="h-full bg-cs-primary rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-white font-bold">{pct}%</span>
                            </div>
                          </td>
                          <td className="p-4">{proj.end_date ? new Date(proj.end_date).toLocaleDateString('pt-BR') : '—'}</td>
                          <td className="p-4 text-right font-bold text-white">
                            {proj.value > 0 ? `R$ ${proj.value.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => deleteProject(proj.id)}
                              className="text-cs-text-secondary hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Remover Projeto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-cs-text-secondary">Nenhum projeto encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* KANBAN VIEW */}
            {projectViewMode === 'kanban' && (
              <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar h-[600px]">
                {Object.entries(PROJECT_STATUS_LABELS).map(([statusKey, statusLabel]) => {
                  const statusProjects = filteredProjects.filter(p => p.status === statusKey);
                  return (
                    <div key={statusKey} className="w-80 shrink-0 flex flex-col bg-cs-surface/40 border border-cs-border rounded-2xl max-h-full">
                      <div className="p-4 border-b border-cs-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            statusKey === 'backlog' ? "bg-zinc-400" :
                            statusKey === 'em-andamento' ? "bg-blue-400" :
                            statusKey === 'aguardando-cliente' ? "bg-orange-400" : "bg-green-400"
                          )} />
                          <h4 className="font-bold text-white text-sm">{statusLabel}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-cs-text-secondary bg-cs-bg px-2 py-0.5 rounded-full border border-cs-border">
                          {statusProjects.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {statusProjects.map(proj => {
                          const pct = proj.task_count > 0 ? Math.round((proj.tasks_done / proj.task_count) * 100) : 0;
                          return (
                            <div key={proj.id} className="bg-cs-surface border border-cs-border hover:border-cs-primary/30 p-4 rounded-xl space-y-3 shadow-sm transition-all">
                              <div className="flex items-start justify-between">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cs-bg text-cs-text-secondary border border-cs-border truncate max-w-[120px]">
                                  {proj.client_name || 'Interno'}
                                </span>
                                <select 
                                  value={proj.status} 
                                  onChange={(e) => handleStatusChange(proj.id, e.target.value)}
                                  className="text-[9px] bg-cs-bg border border-cs-border text-cs-text-secondary rounded px-1 py-0.5 focus:outline-none focus:border-cs-primary cursor-pointer font-bold"
                                >
                                  <option value="backlog">BACKLOG</option>
                                  <option value="em-andamento">EM ANDAMENTO</option>
                                  <option value="aguardando-cliente">AGUARD. CLIENTE</option>
                                  <option value="concluido">CONCLUÍDO</option>
                                </select>
                              </div>
                              <h5 className="font-bold text-white text-xs leading-snug">{proj.name}</h5>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[9px] text-cs-text-secondary">
                                  <span>Progresso</span>
                                  <span>{pct}% ({proj.tasks_done}/{proj.task_count})</span>
                                </div>
                                <div className="w-full bg-cs-bg rounded-full h-1 overflow-hidden">
                                  <div className="h-full bg-cs-primary rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {statusProjects.length === 0 && (
                          <div className="text-center py-8 text-cs-text-secondary/40 text-xs">Sem projetos nesta coluna.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showNewClientModal && (
        <NewClientModal onClose={() => setShowNewClientModal(false)} onSave={handleCreateClient} />
      )}

      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)} 
          onSave={handleCreateProject} 
          clients={clients} 
        />
      )}
    </div>
  );
}
