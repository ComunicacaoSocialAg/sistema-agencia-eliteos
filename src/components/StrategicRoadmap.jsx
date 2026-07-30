import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Zap,
  BarChart3,
  Globe,
  Camera,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  FileText,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateContent } from '../lib/gemini';
import { cn } from '../utils/cn';

const DEFAULT_PLANS = [
  {
    id: 'plan-1',
    channel: 'Meta Ads',
    objective: 'Conversão / Vendas Diretas',
    budget: 3500,
    kpi: 'CPL < R$ 12,00',
    status: 'Em Execução',
    iconName: 'Camera',
    color: 'text-purple-400'
  },
  {
    id: 'plan-2',
    channel: 'Google Search',
    objective: 'Captura de Demanda Ativa',
    budget: 1500,
    kpi: 'ROAS > 4.5x',
    status: 'Aguardando Verba',
    iconName: 'Globe',
    color: 'text-blue-400'
  },
  {
    id: 'plan-3',
    channel: 'Conteúdo / SEO',
    objective: 'Autoridade de Marca',
    budget: 0,
    kpi: '10 Posts/Mês',
    status: 'Planejado',
    iconName: 'Zap',
    color: 'text-yellow-400'
  }
];

export default function StrategicRoadmap({ clientId, client }) {
  const storageKey = `csag_roadmap_${clientId || client?.id || 'demo'}`;

  const [plans, setPlans] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const savedDocs = localStorage.getItem(`${storageKey}_docs`);
      return savedDocs ? JSON.parse(savedDocs) : [
        { id: 'doc-1', name: 'Planejamento Estratégico Q1/2026', url: client?.drive_url || '#', type: 'drive' },
        { id: 'doc-2', name: 'Estudo de Persona e Canais', url: '#', type: 'pdf' }
      ];
    } catch {
      return [];
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', url: '' });

  const [planForm, setPlanForm] = useState({
    channel: '',
    objective: '',
    budget: '',
    kpi: '',
    status: 'Planejado',
    color: 'text-cs-primary'
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(plans));
    } catch (e) {
      console.warn('Erro ao salvar roadmap:', e);
    }
  }, [plans, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_docs`, JSON.stringify(documents));
    } catch (e) {
      console.warn('Erro ao salvar documentos estratégicos:', e);
    }
  }, [documents, storageKey]);

  const totalBudget = plans.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);

  const openAddModal = () => {
    setEditingPlan(null);
    setPlanForm({
      channel: '',
      objective: '',
      budget: '',
      kpi: '',
      status: 'Planejado',
      color: 'text-cs-primary'
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      channel: plan.channel,
      objective: plan.objective,
      budget: plan.budget,
      kpi: plan.kpi,
      status: plan.status,
      color: plan.color || 'text-cs-primary'
    });
    setShowModal(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!planForm.channel.trim()) {
      toast.error('Informe o nome do canal.');
      return;
    }

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planForm, budget: Number(planForm.budget) || 0 } : p));
      toast.success('Canal estratégico atualizado!');
    } else {
      const newPlan = {
        id: `plan-${Date.now()}`,
        ...planForm,
        budget: Number(planForm.budget) || 0,
        iconName: planForm.channel.toLowerCase().includes('google') ? 'Globe' : planForm.channel.toLowerCase().includes('meta') || planForm.channel.toLowerCase().includes('insta') ? 'Camera' : 'Zap'
      };
      setPlans(prev => [...prev, newPlan]);
      toast.success('Novo canal estratégico adicionado!');
    }
    setShowModal(false);
  };

  const handleDeletePlan = (id) => {
    if (confirm('Deseja realmente remover este canal da estratégia?')) {
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Canal removido.');
    }
  };

  const handleGenerateAiSuggestion = async () => {
    setLoadingAi(true);
    try {
      const prompt = `Atue como Diretor Estratégico de Mídia de uma Agência de Comunicação. 
      Analise o cliente "${client?.name || 'Cliente'}" (Público: ${client?.target_audience || 'Geral'}, Tom: ${client?.tone_of_voice || 'Profissional'}) e a distribuição atual de verba: ${JSON.stringify(plans)}.
      Recomende 1 novo canal de tráfego/comunicação para otimizar os resultados deste cliente. Responda em no máximo 3 frases com o canal sugerido, verba teste estimada e o motivo estratégico.`;

      const response = await generateContent(prompt);
      setAiSuggestion(response);
      toast.success('Sugestão estratégica gerada pela IA!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar sugestão da IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim() || !newDoc.url.trim()) {
      toast.error('Preencha nome e link do documento.');
      return;
    }
    setDocuments(prev => [...prev, { id: `doc-${Date.now()}`, name: newDoc.name, url: newDoc.url, type: 'link' }]);
    setNewDoc({ name: '', url: '' });
    setShowDocModal(false);
    toast.success('Documento estratégico vinculado!');
  };

  const handleDeleteDoc = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.success('Documento removido.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Roadmap & Plano Estratégico</h3>
          <p className="text-xs text-cs-text-secondary uppercase tracking-widest font-bold">Planejamento de Mídias, Canais e Orçamentos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-cs-surface border border-cs-border rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] text-cs-text-secondary uppercase font-bold block">Verba Estratégica Mensal</span>
            <span className="text-sm font-bold text-white font-mono">R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2"
          >
            <Plus size={16} /> Novo Canal
          </button>
        </div>
      </div>

      {/* Grid de Canais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-cs-surface border border-cs-border rounded-2xl p-6 hover:border-cs-primary/40 transition-all group relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 bg-cs-bg rounded-xl flex items-center justify-center border border-cs-border group-hover:scale-110 transition-transform", plan.color)}>
                  {plan.iconName === 'Globe' ? <Globe size={24} /> : plan.iconName === 'Camera' ? <Camera size={24} /> : <Zap size={24} />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(plan)}
                    className="p-1.5 rounded-lg text-cs-text-secondary hover:text-white hover:bg-cs-bg transition-colors"
                    title="Editar Canal"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1.5 rounded-lg text-cs-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Excluir Canal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="text-white font-bold mb-1">{plan.channel}</h4>
              <p className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest mb-4">{plan.objective}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center bg-cs-bg/50 p-2.5 rounded-xl border border-cs-border">
                  <span className="text-[10px] text-cs-text-secondary uppercase font-bold">Investimento</span>
                  <span className="text-sm font-mono font-bold text-white">R$ {(Number(plan.budget) || 0).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center bg-cs-bg/50 p-2.5 rounded-xl border border-cs-border">
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase">KPI / Meta</span>
                  <span className="text-xs font-bold text-cs-primary">{plan.kpi || '---'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cs-border flex items-center justify-between relative z-10">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded uppercase border",
                plan.status === 'Em Execução' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                plan.status === 'Aguardando Verba' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                'bg-cs-bg text-cs-text-secondary border-cs-border'
              )}>
                {plan.status}
              </span>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full p-12 text-center bg-cs-surface border border-cs-border rounded-2xl">
            <Target size={40} className="mx-auto text-cs-text-secondary opacity-30 mb-3" />
            <h4 className="text-white font-bold text-sm mb-1">Nenhum canal estratégico cadastrado</h4>
            <p className="text-xs text-cs-text-secondary mb-4">Clique em "Novo Canal" para incluir o plano de mídia do cliente.</p>
            <button onClick={openAddModal} className="bg-cs-primary text-white text-xs font-bold px-4 py-2 rounded-xl">
              Adicionar Canal
            </button>
          </div>
        )}
      </div>

      {/* Seção de Documentação & Planejamento Estratégico */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-cs-border pb-4">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <FileText size={18} className="text-cs-primary" /> Documentos & Arquivos Estratégicos
            </h4>
            <p className="text-xs text-cs-text-secondary">Acesse os relatórios de planejamento, PDFs e apresentações de mídia.</p>
          </div>
          <button 
            onClick={() => setShowDocModal(true)}
            className="bg-cs-bg border border-cs-border hover:border-cs-primary text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Anexar Documento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3.5 bg-cs-bg border border-cs-border rounded-xl group hover:border-cs-primary/50 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-cs-primary/10 text-cs-primary flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{doc.name}</p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cs-primary hover:underline flex items-center gap-1">
                    Abrir Documento <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteDoc(doc.id)}
                className="p-1.5 text-cs-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assistente de IA de Estratégia */}
      <div className="bg-cs-bg/50 border border-cs-border border-dashed rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-cs-primary/10 text-cs-primary rounded-full flex items-center justify-center">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="text-white font-bold text-base mb-1">Cérebro Estratégico da IA</h4>
          <p className="text-xs text-cs-text-secondary max-w-lg">
            Nossa IA analisa o segmento e histórico da marca para sugerir novas mídias e alocações orçamentárias eficientes.
          </p>
        </div>

        {aiSuggestion && (
          <div className="bg-cs-surface border border-cs-primary/30 rounded-xl p-4 text-xs text-cs-text-primary text-left max-w-xl animate-in fade-in duration-300">
            <p className="font-bold text-cs-primary mb-1 flex items-center gap-1.5">
              <Zap size={14} /> Recomendação da IA:
            </p>
            <p className="text-cs-text-secondary leading-relaxed">{aiSuggestion}</p>
          </div>
        )}

        <button 
          onClick={handleGenerateAiSuggestion}
          disabled={loadingAi}
          className="bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          {loadingAi ? 'Analisando Mercado...' : 'GERAR SUGESTÃO DA IA COM GEMINI'}
        </button>
      </div>

      {/* Modal Adicionar / Editar Canal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-cs-border pb-4">
              <h3 className="text-lg font-bold text-white">{editingPlan ? 'Editar Canal Estratégico' : 'Novo Canal Estratégico'}</h3>
              <button onClick={() => setShowModal(false)} className="text-cs-text-secondary hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Canal de Comunicação / Mídia *</label>
                <input 
                  type="text"
                  value={planForm.channel}
                  onChange={e => setPlanForm(p => ({ ...p, channel: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: Meta Ads, TikTok Ads, SEO, Influenciadores..."
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Objetivo do Canal</label>
                <input 
                  type="text"
                  value={planForm.objective}
                  onChange={e => setPlanForm(p => ({ ...p, objective: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: Conversão Direta, Branding, Geração de Leads..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Verba Estimada (R$)</label>
                  <input 
                    type="number"
                    value={planForm.budget}
                    onChange={e => setPlanForm(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cs-primary"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">KPI / Meta Esperada</label>
                  <input 
                    type="text"
                    value={planForm.kpi}
                    onChange={e => setPlanForm(p => ({ ...p, kpi: e.target.value }))}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                    placeholder="Ex: CPL < R$ 15, ROAS 4.0x"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Status da Mídia</label>
                <select
                  value={planForm.status}
                  onChange={e => setPlanForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                >
                  <option value="Em Execução">Em Execução</option>
                  <option value="Aguardando Verba">Aguardando Verba</option>
                  <option value="Planejado">Planejado</option>
                  <option value="Pausado">Pausado</option>
                </select>
              </div>

              <div className="pt-4 border-t border-cs-border flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-cs-text-secondary">
                  Cancelar
                </button>
                <button type="submit" className="bg-cs-primary text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5">
                  <Save size={14} /> Salvar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Documento */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-cs-border pb-4">
              <h3 className="text-lg font-bold text-white">Anexar Documento Estratégico</h3>
              <button onClick={() => setShowDocModal(false)} className="text-cs-text-secondary hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Nome do Arquivo / Relatório *</label>
                <input 
                  type="text"
                  value={newDoc.name}
                  onChange={e => setNewDoc(d => ({ ...d, name: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: Planejamento Mídia Q2"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Link do Arquivo (Google Drive / Canva / PDF) *</label>
                <input 
                  type="url"
                  value={newDoc.url}
                  onChange={e => setNewDoc(d => ({ ...d, url: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-cs-border flex justify-end gap-3">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 text-xs font-bold text-cs-text-secondary">
                  Cancelar
                </button>
                <button type="submit" className="bg-cs-primary text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5">
                  <Save size={14} /> Vincular Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
