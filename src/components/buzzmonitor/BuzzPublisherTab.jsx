import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Sparkles, Plus, Image as ImageIcon, Video, 
  Layers, CheckCircle2, Clock, Eye, Send, Trash2, Smartphone, Hash, ArrowRight,
  Filter, Copy, ExternalLink, Grid, LayoutGrid, Search, Share2, Check, Edit3,
  AlertCircle, X, RefreshCw, Play, FileText, Heart, MessageSquare, Tag, Columns
} from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import BuzzMobilePreview from './BuzzMobilePreview';

const FUNNEL_COLORS = {
  'ATR': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'CON': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'CVR': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const FUNNEL_LABELS = {
  'ATR': 'Atração (Topo)',
  'CON': 'Consideração (Meio)',
  'CVR': 'Conversão (Fundo)',
};

const KANBAN_COLUMNS = [
  { id: 'pauta', title: '💡 Pautas & Roteiros', statuses: ['Pauta Estruturada', 'Rascunho'], dot: 'bg-zinc-500' },
  { id: 'producao', title: '✍️ Em Produção', statuses: ['Em Produção'], dot: 'bg-yellow-500' },
  { id: 'revisao', title: '🔍 Revisão Interna', statuses: ['Em Revisão Interna'], dot: 'bg-purple-500' },
  { id: 'aguardando', title: '📱 Aguardando Cliente', statuses: ['Aguardando Aprovação'], dot: 'bg-orange-500' },
  { id: 'aprovado', title: '✅ Aprovado & Agendado', statuses: ['Aprovado pelo Cliente', 'Agendado', 'Publicado'], dot: 'bg-green-500' }
];

export default function BuzzPublisherTab({ 
  client, 
  onAddPost, 
  onUpdateStatus, 
  onUpdatePost, 
  onDeletePost, 
  onImportNotion 
}) {
  const scheduledPosts = client?.scheduled_posts || [];
  const [activeViewMode, setActiveViewMode] = useState('grade'); // 'grade' | 'kanban' | 'feed' | 'create'
  
  // Filters
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [selectedFunnel, setSelectedFunnel] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedPostModal, setSelectedPostModal] = useState(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [notionDbId, setNotionDbId] = useState(import.meta.env.VITE_NOTION_DB_ID || '');
  const [notionToken, setNotionToken] = useState(import.meta.env.VITE_NOTION_TOKEN || '');
  const [isSyncingNotion, setIsSyncingNotion] = useState(false);

  // Form State for Creator
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Carrossel',
    semana: 1,
    dia_semana: 'Segunda-feira',
    funnel_stage: 'CON',
    strategic_pillar: 'O Olhar do Especialista',
    channels: ['Instagram Feed', 'Facebook'],
    date: '2026-08-25T18:00',
    date_formatted: '25/08/2026 às 18:00',
    hook_clinical_reasoning: '',
    cta: 'Agende sua avaliação pelo link da bio.',
    compliance: `${client?.name || 'Médico Especialista'} | ${client?.document_id || 'CRM'}. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023.`,
    caption: '',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
    status: 'Em Revisão Interna'
  });

  // Funnel counts
  const funnelStats = useMemo(() => {
    const atr = scheduledPosts.filter(p => p.funnel_stage === 'ATR').length;
    const con = scheduledPosts.filter(p => p.funnel_stage === 'CON').length;
    const cvr = scheduledPosts.filter(p => p.funnel_stage === 'CVR').length;
    const approved = scheduledPosts.filter(p => p.status === 'Aprovado pelo Cliente' || p.status === 'Agendado').length;
    return { atr, con, cvr, approved, total: scheduledPosts.length };
  }, [scheduledPosts]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return scheduledPosts.filter(post => {
      if (selectedWeek !== 'all' && String(post.semana) !== String(selectedWeek)) return false;
      if (selectedFunnel !== 'all' && post.funnel_stage !== selectedFunnel) return false;
      if (selectedFormat !== 'all' && post.type !== selectedFormat) return false;
      if (selectedStatus !== 'all' && post.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(q);
        const matchesCaption = post.caption?.toLowerCase().includes(q);
        const matchesHook = post.hook_clinical_reasoning?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCaption && !matchesHook) return false;
      }
      return true;
    });
  }, [scheduledPosts, selectedWeek, selectedFunnel, selectedFormat, selectedStatus, searchQuery]);

  // Copywriter Gemini AI
  const handleGenerateCopy = async (targetFormData, isModal = false) => {
    const currentData = isModal ? targetFormData : formData;
    if (!currentData.title?.trim()) {
      toast.error('Informe o título ou tema do post primeiro.');
      return;
    }
    setIsGeneratingCopy(true);
    try {
      const { generateContent } = await import('../../lib/gemini');
      const prompt = `Você é o copywriter sênior especialista em marketing médico ético do sistema Comunica OS.
Cliente: "${client?.name}"
Especialidade: "${client?.document_id || 'Medicina'}"
Posicionamento da Marca: "${client?.tone_of_voice || 'Bisturi Verbal - Rigor Científico e Excelência Médica'}"
Segmento: ${client?.segment}
Cidade: ${client?.city}

Informações do Post:
- Título/Tema: "${currentData.title}"
- Formato: ${currentData.type}
- Etapa do Funil: ${currentData.funnel_stage || 'Consideração'}
- Pilar Estratégico: ${currentData.strategic_pillar || 'Geral'}
- Raciocínio Clínico / Gancho Central: "${currentData.hook_clinical_reasoning || currentData.title}"
- Chamada para Ação (CTA): "${currentData.cta || 'Agende sua avaliação.'}"
- Compliance Obrigatório CFM: "${currentData.compliance || ''}"

Diretrizes Obrigatórias:
1. Comece com um gancho forte, elegante e direto ao ponto na primeira linha.
2. Explique a fisiopatologia ou a lógica médica de forma didática, sem sensacionalismo e sem promessas milagrosas (Resolução CFM 2.336/2023).
3. Conecte com a dor/sintoma do paciente e explique a tecnologia minimamente invasiva como solução.
4. Feche com a CTA estratégica clara orientando para o link da bio / agendamento no consultório.
5. Anexe a assinatura e compliance no rodapé.
6. Adicione 4 a 6 hashtags estratégicas e locais no final (ex: #CirurgiaVascular #PocosDeCaldas).
7. Escreva em Português do Brasil de forma impecável.`;

      const generated = await generateContent(prompt);
      if (isModal) {
        setSelectedPostModal(prev => ({ ...prev, caption: generated }));
        if (onUpdatePost) onUpdatePost(targetFormData.id, { caption: generated });
      } else {
        setFormData(prev => ({ ...prev, caption: generated }));
      }
      toast.success('Legenda médica redigida com sucesso pela IA!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar legenda com IA.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Informe o título do post.');
      return;
    }

    onAddPost({
      ...formData,
      post_id: scheduledPosts.length + 1,
      id: `dr-alb-${Date.now()}`
    });

    setActiveViewMode('grade');
    toast.success('Publicação adicionada com sucesso!');
  };

  const handleCopyApprovalLink = (postId, e) => {
    if (e) e.stopPropagation();
    const link = `${window.location.origin}/aprovar/${postId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de aprovação do cliente copiado!');
  };

  const handleSyncNotion = async () => {
    setIsSyncingNotion(true);
    try {
      if (onImportNotion) {
        await onImportNotion(notionDbId, notionToken);
      }
      setIsNotionModalOpen(false);
    } finally {
      setIsSyncingNotion(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img 
                src={client?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop'} 
                alt={client?.name}
                className="w-11 h-11 rounded-xl object-cover border border-cs-primary/30 shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <CalendarIcon size={20} className="text-cs-primary" />
                  Grade & Central Editorial: {client?.name}
                </h3>
                <p className="text-xs text-cs-text-secondary">
                  Planejamento trimestral com rigor científico, compliance CFM 2.336/2023 e esteira de produção.
                </p>
              </div>
            </div>

            {/* Funnel distribution pill stats */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cs-bg text-white border border-cs-border">
                Total: <strong className="text-cs-primary">{funnelStats.total} posts</strong>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Atração (ATR): <strong>{funnelStats.atr}</strong>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Consideração (CON): <strong>{funnelStats.con}</strong>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Conversão (CVR): <strong>{funnelStats.cvr}</strong>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30">
                Aprovados: <strong>{funnelStats.approved}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons & View Mode Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsNotionModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-cs-text-secondary hover:text-white bg-cs-bg border border-cs-border hover:border-cs-primary/50 flex items-center justify-center gap-1.5 transition-colors"
              title="Importar ou sincronizar com banco de dados do Notion"
            >
              <RefreshCw size={14} className="text-cs-primary" />
              <span>Sincronizar Notion</span>
            </button>

            {/* View Mode Switcher */}
            <div className="bg-cs-bg border border-cs-border rounded-xl p-1 flex items-center gap-1">
              <button 
                onClick={() => setActiveViewMode('grade')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeViewMode === 'grade' ? "bg-cs-surface text-white shadow-sm border border-cs-border" : "text-cs-text-secondary hover:text-white"
                )}
                title="Visão Grade Editorial"
              >
                <LayoutGrid size={14} />
                <span>Grade (36)</span>
              </button>
              <button 
                onClick={() => setActiveViewMode('kanban')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeViewMode === 'kanban' ? "bg-cs-surface text-white shadow-sm border border-cs-border" : "text-cs-text-secondary hover:text-white"
                )}
                title="Visão Kanban de Produção"
              >
                <Columns size={14} />
                <span>Kanban</span>
              </button>
              <button 
                onClick={() => setActiveViewMode('feed')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeViewMode === 'feed' ? "bg-cs-surface text-white shadow-sm border border-cs-border" : "text-cs-text-secondary hover:text-white"
                )}
                title="Visão Grid Feed Instagram"
              >
                <Grid size={14} />
                <span>Feed 3x3</span>
              </button>
              <button 
                onClick={() => setActiveViewMode('create')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeViewMode === 'create' ? "bg-cs-primary text-black" : "text-cs-primary hover:bg-cs-primary/10"
                )}
              >
                <Plus size={14} />
                <span>Novo Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR (When not in create mode) */}
      {activeViewMode !== 'create' && (
        <div className="bg-cs-surface border border-cs-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cs-text-secondary" />
              <input 
                type="text"
                placeholder="Buscar tema, raciocínio clínico ou título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cs-bg border border-cs-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary"
              />
            </div>

            {/* Filter by Week */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] uppercase font-bold text-cs-text-secondary">Semana:</label>
              <select 
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-cs-bg border border-cs-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cs-primary cursor-pointer"
              >
                <option value="all">Todas as 12 Semanas</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                  <option key={w} value={w}>Semana {w}</option>
                ))}
              </select>
            </div>

            {/* Filter by Funnel */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] uppercase font-bold text-cs-text-secondary">Funil:</label>
              <select 
                value={selectedFunnel}
                onChange={(e) => setSelectedFunnel(e.target.value)}
                className="bg-cs-bg border border-cs-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cs-primary cursor-pointer"
              >
                <option value="all">Todos os Funis</option>
                <option value="ATR">🔵 Atração (ATR)</option>
                <option value="CON">🟣 Consideração (CON)</option>
                <option value="CVR">🟡 Conversão (CVR)</option>
              </select>
            </div>

            {/* Filter by Format */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] uppercase font-bold text-cs-text-secondary">Formato:</label>
              <select 
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="bg-cs-bg border border-cs-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cs-primary cursor-pointer"
              >
                <option value="all">Todos os Formatos</option>
                <option value="Carrossel">Carrossel Clínico</option>
                <option value="Imagem Única">Imagem Única</option>
                <option value="Vídeo / Reels">Vídeo / Reels</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] uppercase font-bold text-cs-text-secondary">Status:</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-cs-bg border border-cs-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cs-primary cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="Aprovado pelo Cliente">Aprovado pelo Cliente</option>
                <option value="Em Revisão Interna">Em Revisão Interna</option>
                <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                <option value="Em Produção">Em Produção</option>
                <option value="Pauta Estruturada">Pauta Estruturada</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-cs-text-secondary font-bold">
            Mostrando <span className="text-white">{filteredPosts.length}</span> de {scheduledPosts.length} posts
          </div>
        </div>
      )}

      {/* VIEW 1: GRADE EDITORIAL */}
      {activeViewMode === 'grade' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full bg-cs-surface border border-cs-border rounded-2xl py-16 text-center text-cs-text-secondary text-xs">
              Nenhuma publicação corresponde aos filtros selecionados.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => setSelectedPostModal(post)}
                className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-xl relative"
              >
                <div>
                  {/* Top Image Preview */}
                  <div className="h-44 bg-zinc-950 relative overflow-hidden">
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Semana & Funil Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-black/80 text-white backdrop-blur-md border border-white/10">
                        SEM {post.semana || 1} • {post.dia_semana || 'Seg'}
                      </span>
                      {post.funnel_stage && (
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black border backdrop-blur-md", FUNNEL_COLORS[post.funnel_stage])}>
                          {post.funnel_stage}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md",
                        post.status === 'Aprovado pelo Cliente' || post.status === 'Agendado' ? "bg-green-500/20 text-green-400 border-green-500/40" :
                        post.status === 'Em Revisão Interna' ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                        post.status === 'Aguardando Aprovação' ? "bg-orange-500/20 text-orange-400 border-orange-500/40" :
                        "bg-zinc-800/90 text-zinc-300 border-zinc-700"
                      )}>
                        {post.status}
                      </span>
                    </div>

                    {/* Format Badge */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                      {post.type === 'Vídeo / Reels' ? <Video size={11} className="text-red-400" /> : <Layers size={11} className="text-blue-400" />}
                      <span>{post.format_label || post.type}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="text-[11px] text-cs-primary font-bold flex items-center gap-1.5">
                      <Clock size={12} /> {post.date_formatted}
                    </div>

                    <h5 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-cs-primary transition-colors">
                      {post.title}
                    </h5>

                    {/* Clinical Hook Box */}
                    {post.hook_clinical_reasoning && (
                      <div className="p-2.5 rounded-xl bg-cs-bg/80 border border-cs-border/60 text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                        <strong className="text-white font-bold block mb-0.5">Raciocínio Clínico:</strong>
                        {post.hook_clinical_reasoning}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-4 pt-0 border-t border-cs-border/40 mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {post.channels?.map((ch, idx) => (
                      <span key={idx} className="text-[10px] bg-cs-bg text-cs-text-secondary px-1.5 py-0.5 rounded border border-cs-border">
                        {ch}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopyApprovalLink(post.id, e)}
                      className="p-1.5 bg-cs-bg hover:bg-cs-primary/20 text-cs-text-secondary hover:text-cs-primary rounded-lg text-xs font-bold transition-colors border border-cs-border"
                      title="Copiar Link de Aprovação do Cliente"
                    >
                      <Copy size={13} />
                    </button>
                    {post.status !== 'Aprovado pelo Cliente' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(post.id, 'Aprovado pelo Cliente'); }}
                        className="px-2.5 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Marcar como Aprovado pelo Cliente"
                      >
                        <CheckCircle2 size={13} />
                        <span>Aprovar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN DE PRODUÇÃO DE SOCIAL MEDIA */}
      {activeViewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colPosts = filteredPosts.filter(p => col.statuses.includes(p.status));
            return (
              <div key={col.id} className="bg-cs-surface border border-cs-border rounded-2xl p-4 flex flex-col min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-cs-border">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full", col.dot)} />
                    <h4 className="text-xs font-bold text-white">{col.title}</h4>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cs-bg text-cs-text-secondary border border-cs-border">
                    {colPosts.length}
                  </span>
                </div>

                {/* Column Posts */}
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                  {colPosts.length === 0 ? (
                    <div className="h-32 border border-dashed border-cs-border rounded-xl flex items-center justify-center text-[11px] text-cs-text-secondary">
                      Nenhum post nesta etapa
                    </div>
                  ) : (
                    colPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPostModal(post)}
                        className="bg-cs-bg border border-cs-border hover:border-cs-primary/50 p-3.5 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-cs-primary">SEM {post.semana || 1} • {post.dia_semana}</span>
                          {post.funnel_stage && (
                            <span className={cn("px-1.5 py-0.5 rounded font-black text-[9px] border", FUNNEL_COLORS[post.funnel_stage])}>
                              {post.funnel_stage}
                            </span>
                          )}
                        </div>

                        <h6 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-cs-primary transition-colors">
                          {post.title}
                        </h6>

                        <div className="flex items-center justify-between text-[10px] text-cs-text-secondary pt-1 border-t border-cs-border/40">
                          <span>{post.type}</span>
                          <button
                            onClick={(e) => handleCopyApprovalLink(post.id, e)}
                            className="p-1 hover:text-cs-primary transition-colors"
                            title="Copiar link"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: GRID FEED INSTAGRAM (3x3) */}
      {activeViewMode === 'feed' && (
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-6">
          {/* Simulated Instagram Header */}
          <div className="max-w-2xl mx-auto flex items-center gap-6 pb-6 border-b border-cs-border">
            <img 
              src={client?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop'} 
              alt={client?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-cs-primary shadow-lg"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="text-base font-bold text-white">{client?.handle?.replace('@', '') || 'dralbertobr'}</h4>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} className="fill-blue-500 text-black" /> Verificado Oficial
                </span>
              </div>
              <div className="flex items-center gap-5 text-xs text-zinc-300">
                <span><strong>{scheduledPosts.length}</strong> publicações</span>
                <span><strong>2.015</strong> seguidores</span>
                <span><strong>482</strong> seguindo</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                <strong className="text-white block">{client?.name}</strong>
                {client?.tone_of_voice || 'Bisturi Verbal • Cirurgia Vascular & Laser Transdérmico sem repouso'}
              </p>
            </div>
          </div>

          {/* 3x3 Photo Grid */}
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2">
            {scheduledPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => setSelectedPostModal(post)}
                className="aspect-square bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer"
              >
                <img 
                  src={post.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Type Badge Top Right */}
                <div className="absolute top-1.5 right-1.5">
                  {post.type === 'Carrossel' && <Layers size={14} className="text-white drop-shadow" />}
                  {post.type === 'Vídeo / Reels' && <Play size={14} className="text-white drop-shadow fill-white" />}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center text-white space-y-1">
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cs-primary text-black">
                    SEM {post.semana || 1}
                  </span>
                  <p className="text-[11px] font-bold line-clamp-2">{post.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-300 pt-1">
                    <span className="flex items-center gap-1"><Heart size={10} className="fill-white" /> 24</span>
                    <span className="flex items-center gap-1"><MessageSquare size={10} className="fill-white" /> 4</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: CRIADOR & COPYWRITER COM IA */}
      {activeViewMode === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="lg:col-span-7 bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-cs-primary" />
                Criador de Conteúdo & Copywriter com IA (Bisturi Verbal)
              </h4>
              <button 
                onClick={() => setActiveViewMode('grade')}
                className="text-xs text-cs-text-secondary hover:text-white"
              >
                Voltar à Grade
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                  Tema / Título da Pauta
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: A veia nutridora invisível: Por que tratar apenas a superfície..." 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                    Semana
                  </label>
                  <select 
                    value={formData.semana}
                    onChange={(e) => setFormData({ ...formData, semana: Number(e.target.value) })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                      <option key={w} value={w}>Semana {w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                    Dia da Semana
                  </label>
                  <select 
                    value={formData.dia_semana}
                    onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                    Etapa do Funil
                  </label>
                  <select 
                    value={formData.funnel_stage}
                    onChange={(e) => setFormData({ ...formData, funnel_stage: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="ATR">Atração (ATR)</option>
                    <option value="CON">Consideração (CON)</option>
                    <option value="CVR">Conversão (CVR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                    Formato
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="Carrossel">Carrossel Clínico</option>
                    <option value="Imagem Única">Imagem Única / Alerta</option>
                    <option value="Vídeo / Reels">Vídeo / Reels</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                    Data e Hora
                  </label>
                  <input 
                    type="datetime-local" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, date_formatted: e.target.value.replace('T', ' às ') })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1.5">
                  Raciocínio Clínico / Gancho Médico
                </label>
                <textarea 
                  rows={2}
                  value={formData.hook_clinical_reasoning}
                  onChange={(e) => setFormData({ ...formData, hook_clinical_reasoning: e.target.value })}
                  placeholder="Ex: A persistência de vasinhos não decorre de azar biológico, mas da ausência de neutralização da veia nutridora..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary">
                    Legenda do Post (Copy Completa)
                  </label>
                  <button 
                    type="button" 
                    onClick={() => handleGenerateCopy(formData)}
                    disabled={isGeneratingCopy}
                    className="text-[11px] text-cs-primary hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    {isGeneratingCopy ? 'Redigindo com Gemini...' : 'Gerar Legenda com Gemini AI'}
                  </button>
                </div>
                <textarea 
                  rows={6}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Escreva a legenda médica ou clique no botão acima para a IA redigir com rigor científico e compliance CFM..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveViewMode('grade')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-cs-text-secondary hover:text-white bg-cs-bg border border-cs-border"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-cs-primary hover:bg-yellow-400 flex items-center gap-1.5 shadow-lg shadow-cs-primary/10 transition-colors"
                >
                  <CalendarIcon size={14} /> Salvar & Agendar Pauta
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Preview Side */}
          <div className="lg:col-span-5 bg-cs-surface border border-cs-border rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Smartphone size={14} className="text-cs-primary" />
              Simulador Mobile Feed Instagram
            </div>
            <BuzzMobilePreview client={client} post={formData} />
          </div>
        </div>
      )}

      {/* POST DETAIL & APPROVAL MODAL */}
      {selectedPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-cs-border flex items-center justify-between sticky top-0 bg-cs-surface z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cs-bg text-cs-primary border border-cs-border">
                  SEMANA {selectedPostModal.semana || 1} • {selectedPostModal.dia_semana}
                </span>
                {selectedPostModal.funnel_stage && (
                  <span className={cn("text-xs font-black px-2.5 py-1 rounded-lg border", FUNNEL_COLORS[selectedPostModal.funnel_stage])}>
                    {FUNNEL_LABELS[selectedPostModal.funnel_stage] || selectedPostModal.funnel_stage}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedPostModal(null)}
                className="p-1 text-cs-text-secondary hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Image & Mobile Simulator */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl overflow-hidden border border-cs-border shadow-md">
                  <img 
                    src={selectedPostModal.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'} 
                    alt={selectedPostModal.title} 
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-3 bg-cs-bg border border-cs-border rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-cs-text-secondary">
                    <span>Data Agendada:</span>
                    <strong className="text-white">{selectedPostModal.date_formatted}</strong>
                  </div>
                  <div className="flex items-center justify-between text-cs-text-secondary">
                    <span>Formato:</span>
                    <strong className="text-white">{selectedPostModal.format_label || selectedPostModal.type}</strong>
                  </div>
                  <div className="flex items-center justify-between text-cs-text-secondary">
                    <span>Pilar Estratégico:</span>
                    <strong className="text-white">{selectedPostModal.strategic_pillar || 'Geral'}</strong>
                  </div>
                </div>

                <button
                  onClick={(e) => handleCopyApprovalLink(selectedPostModal.id, e)}
                  className="w-full py-2.5 px-4 rounded-xl bg-cs-primary/10 hover:bg-cs-primary/20 text-cs-primary border border-cs-primary/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 size={14} /> Copiar Link Público de Aprovação
                </button>
              </div>

              {/* Right Column: Details, Clinical Hook and Full Copy */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedPostModal.title}
                  </h3>
                </div>

                {/* Clinical Reasoning */}
                {selectedPostModal.hook_clinical_reasoning && (
                  <div className="p-3.5 bg-cs-bg border border-blue-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1">
                      <Sparkles size={11} /> Raciocínio Clínico Estruturado
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {selectedPostModal.hook_clinical_reasoning}
                    </p>
                  </div>
                )}

                {/* Compliance Box */}
                {selectedPostModal.compliance && (
                  <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-[10px] text-zinc-400 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <span>{selectedPostModal.compliance}</span>
                  </div>
                )}

                {/* Caption Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary">
                      Legenda Completa
                    </label>
                    <button
                      onClick={() => handleGenerateCopy(selectedPostModal, true)}
                      disabled={isGeneratingCopy}
                      className="text-[11px] text-cs-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={11} /> {isGeneratingCopy ? 'Reescrevendo...' : 'Aprimorar com Gemini AI'}
                    </button>
                  </div>
                  <textarea 
                    rows={8}
                    value={selectedPostModal.caption}
                    onChange={(e) => {
                      const newCap = e.target.value;
                      setSelectedPostModal(prev => ({ ...prev, caption: newCap }));
                      if (onUpdatePost) onUpdatePost(selectedPostModal.id, { caption: newCap });
                    }}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none leading-relaxed custom-scrollbar"
                  />
                </div>

                {/* Status Switcher & Close */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cs-border">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-cs-text-secondary">Status:</label>
                    <select
                      value={selectedPostModal.status}
                      onChange={(e) => {
                        const newStat = e.target.value;
                        setSelectedPostModal(prev => ({ ...prev, status: newStat }));
                        onUpdateStatus(selectedPostModal.id, newStat);
                      }}
                      className="bg-cs-bg border border-cs-border rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cs-primary"
                    >
                      <option value="Pauta Estruturada">💡 Pauta Estruturada</option>
                      <option value="Em Produção">✍️ Em Produção</option>
                      <option value="Em Revisão Interna">🔍 Em Revisão Interna</option>
                      <option value="Aguardando Aprovação">📱 Aguardando Aprovação</option>
                      <option value="Aprovado pelo Cliente">✅ Aprovado pelo Cliente</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setSelectedPostModal(null)}
                    className="px-5 py-2 bg-cs-primary text-black rounded-xl text-xs font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Salvar & Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTION SYNC MODAL */}
      {isNotionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-cs-border pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw size={16} className="text-cs-primary" />
                Sincronizar Banco de Dados do Notion
              </h4>
              <button onClick={() => setIsNotionModalOpen(false)} className="text-cs-text-secondary hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-cs-text-secondary leading-relaxed">
              Conecte a sua integração do Notion para importar automaticamente páginas de calendário, propriedades e copies.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1">
                  ID do Banco / URL do Notion
                </label>
                <input 
                  type="text" 
                  value={notionDbId}
                  onChange={(e) => setNotionDbId(e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-cs-text-secondary block mb-1">
                  Token de Integração (Internal Secret)
                </label>
                <input 
                  type="password" 
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cs-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button 
                onClick={() => setIsNotionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-cs-text-secondary hover:text-white bg-cs-bg border border-cs-border"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSyncNotion}
                disabled={isSyncingNotion}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-cs-primary hover:bg-yellow-400 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={cn(isSyncingNotion && "animate-spin")} />
                {isSyncingNotion ? "Importando..." : "Importar Dados do Notion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
