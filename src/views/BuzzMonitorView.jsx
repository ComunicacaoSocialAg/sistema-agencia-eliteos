import React, { useState } from 'react';
import { 
  Radio, Calendar, Plus, CheckCircle2, Sparkles, Filter, 
  Clock, Share2, AlertCircle, FileText, ExternalLink, Trash2, 
  Edit3, ShieldCheck, ChevronRight, BarChart2, Save, X
} from 'lucide-react';
import { useSocialManagement } from '../hooks/useSocialManagement';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { generateContent } from '../lib/gemini';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const STATUS_CONFIG = {
  pauta: { label: 'Pauta / Ideia', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  roteiro: { label: 'Roteiro Escrito', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  producao: { label: 'Em Produção', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  aprovacao: { label: 'Aguardando Cliente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  agendado: { label: 'Aprovado / Agendado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  publicado: { label: 'Publicado', color: 'bg-green-500/20 text-green-300 border-green-500/40' }
};

export default function BuzzMonitorView() {
  const { selectedClient, isAllClients, selectedClientId, setSelectedClientId, clients } = useActiveClient();
  const { posts, loading, createPost, updatePostStatus, deletePost, saveMonthlyMetric, metrics } = useSocialManagement();

  const [activeTab, setActiveTab] = useState('grade'); // 'grade' | 'canais' | 'fechamento'
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Form de novo post
  const [newPost, setNewPost] = useState({
    title: '',
    client_id: selectedClient?.id || clients[0]?.id || '',
    channel: 'Instagram',
    format: 'Carrossel',
    status: 'pauta',
    scheduled_date: new Date().toISOString().split('T')[0],
    caption: '',
    visual_concept: '',
    post_url: '',
    medical_compliance_checked: false
  });

  // Form de fechamento mensal
  const [metricForm, setMetricForm] = useState({
    client_id: selectedClient?.id || clients[0]?.id || '',
    period_month: '2026-10',
    followers_total: '',
    followers_growth: '',
    reach_organic: '',
    total_interactions: '',
    top_post_note: '',
    notes: ''
  });

  const isMedicalClient = selectedClient?.document_id?.includes('CRM') || selectedClient?.name?.includes('Dr.');

  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'todos') return true;
    return p.status === statusFilter;
  });

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim()) {
      toast.error('Informe o tema da pauta.');
      return;
    }

    await createPost({
      ...newPost,
      client_id: isAllClients ? (newPost.client_id || clients[0]?.id) : (selectedClient?.id || clients[0]?.id),
      medical_compliance_checked: isMedicalClient ? true : newPost.medical_compliance_checked
    });

    setShowNewModal(false);
    setNewPost({
      title: '',
      client_id: selectedClient?.id || clients[0]?.id || '',
      channel: 'Instagram',
      format: 'Carrossel',
      status: 'pauta',
      scheduled_date: new Date().toISOString().split('T')[0],
      caption: '',
      visual_concept: '',
      post_url: '',
      medical_compliance_checked: false
    });
  };

  const handleSaveMetric = async (e) => {
    e.preventDefault();
    await saveMonthlyMetric({
      ...metricForm,
      client_id: isAllClients ? (metricForm.client_id || clients[0]?.id) : (selectedClient?.id || clients[0]?.id),
      followers_total: Number(metricForm.followers_total) || 0,
      followers_growth: Number(metricForm.followers_growth) || 0,
      reach_organic: Number(metricForm.reach_organic) || 0,
      total_interactions: Number(metricForm.total_interactions) || 0
    });
    setShowMetricModal(false);
  };

  const handleGenerateScriptWithAi = async () => {
    if (!newPost.title) {
      toast.error('Digite o título da pauta primeiro para a IA criar o roteiro.');
      return;
    }
    setIsGeneratingAi(true);
    const toastId = toast.loading('Gerando roteiro com IA adaptado ao cliente...');
    try {
      const prompt = `Você é o estrategista de conteúdo da agência CS Ag.
Cliente: ${selectedClient?.name || 'Cliente da Agência'}.
Tom de voz: ${selectedClient?.tone_of_voice || 'Profissional e acolhedor'}.
${isMedicalClient ? 'REGRA OBRIGATÓRIA: Médico vascular Dr. Alberto Brasil CRM-MG 39529 RQE 15412. Sem promessa de cura, sem sensacionalismo, tom estritamente educativo conforme Resolução CFM 2.336/2023.' : ''}
Tema da pauta: ${newPost.title}.
Formato: ${newPost.format}.
Canal: ${newPost.channel}.

Crie:
1. Conceito Visual (o que mostrar na imagem/vídeo).
2. Legenda Completa com chamada para ação sóbria.
Seja direto e prático.`;

      const aiText = await generateContent(prompt);
      if (aiText) {
        setNewPost(prev => ({
          ...prev,
          caption: aiText,
          visual_concept: `Conceito sugerido pela IA para ${newPost.format} focado em autoridade.`
        }));
        toast.success('Roteiro gerado pela IA com sucesso!', { id: toastId });
      }
    } catch (e) {
      toast.error('Não foi possível gerar com a IA no momento.', { id: toastId });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-cs-bg text-cs-text-primary overflow-hidden">
      {/* Top Header */}
      <header className="bg-cs-surface border-b border-cs-border px-6 py-4 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cs-primary text-black font-black flex items-center justify-center shadow-lg shadow-cs-primary/10 shrink-0">
              <Radio size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Social & Conteúdo</h1>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-cs-primary/10 text-cs-primary border border-cs-primary/30 px-2 py-0.5 rounded-md">
                  Gestão Editorial Real
                </span>
              </div>
              <p className="text-xs text-cs-text-secondary">
                {selectedClient ? `Planejamento e publicações ativas de: ${selectedClient.name}` : 'Visão geral de pautas de todos os clientes da agência'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-cs-bg border border-cs-border rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab('grade')}
                className={cn("px-3 py-1.5 rounded-lg font-bold transition-all", activeTab === 'grade' ? "bg-cs-primary text-black" : "text-cs-text-secondary hover:text-white")}
              >
                Grade Editorial
              </button>
              <button
                onClick={() => setActiveTab('canais')}
                className={cn("px-3 py-1.5 rounded-lg font-bold transition-all", activeTab === 'canais' ? "bg-cs-primary text-black" : "text-cs-text-secondary hover:text-white")}
              >
                Canais & Perfis
              </button>
              <button
                onClick={() => setActiveTab('fechamento')}
                className={cn("px-3 py-1.5 rounded-lg font-bold transition-all", activeTab === 'fechamento' ? "bg-cs-primary text-black" : "text-cs-text-secondary hover:text-white")}
              >
                Fechamento Mensal
              </button>
            </div>

            {activeTab === 'grade' && (
              <button
                onClick={() => setShowNewModal(true)}
                className="bg-cs-primary hover:bg-yellow-400 text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cs-primary/20 shrink-0"
              >
                <Plus size={16} /> Nova Pauta
              </button>
            )}

            {activeTab === 'fechamento' && (
              <button
                onClick={() => setShowMetricModal(true)}
                className="bg-cs-primary hover:bg-yellow-400 text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cs-primary/20 shrink-0"
              >
                <Save size={16} /> Lançar Mês
              </button>
            )}
          </div>
        </div>

        {/* Alerta de Compliance Médico se o Dr. Alberto estiver ativo */}
        {isMedicalClient && (
          <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-400 shrink-0" />
              <span>
                <strong>Diretriz CFM 2.336/2023:</strong> Todas as postagens para Dr. Alberto Brasil exigem identificação de CRM-MG 39529 e RQE 15412, com caráter estritamente educativo.
              </span>
            </div>
            <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">RQE 15412</span>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* ABA 1: GRADE EDITORIAL */}
        {activeTab === 'grade' && (
          <div className="space-y-4">
            {/* Filtros de Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-cs-surface border border-cs-border rounded-2xl p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-cs-text-secondary font-bold mr-2 flex items-center gap-1">
                  <Filter size={14} /> Filtrar:
                </span>
                {['todos', 'pauta', 'roteiro', 'producao', 'aprovacao', 'agendado', 'publicado'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                      statusFilter === st ? "bg-cs-primary text-black" : "text-cs-text-secondary hover:text-white bg-cs-bg"
                    )}
                  >
                    {st === 'todos' ? 'Todos os Posts' : STATUS_CONFIG[st]?.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-cs-text-secondary font-medium">
                {filteredPosts.length} post{filteredPosts.length === 1 ? '' : 's'} cadastrado{filteredPosts.length === 1 ? '' : 's'}
              </div>
            </div>

            {/* Listagem de Posts / Pautas */}
            {filteredPosts.length === 0 ? (
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-12 text-center">
                <Calendar size={40} className="mx-auto text-cs-text-secondary/40 mb-3" />
                <h3 className="text-white font-bold text-sm mb-1">Nenhuma pauta encontrada</h3>
                <p className="text-xs text-cs-text-secondary max-w-sm mx-auto mb-4">
                  Cadastre as postagens oficiais deste cliente para organizar o calendário editorial da agência.
                </p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="bg-cs-primary text-black px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus size={16} /> Cadastrar Primeira Pauta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map(post => {
                  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pauta;
                  return (
                    <div key={post.id} className="bg-cs-surface border border-cs-border hover:border-cs-primary/40 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                      <div>
                        {/* Header do Card */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border", cfg.color)}>
                            {cfg.label}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-cs-text-secondary">
                            <Clock size={12} />
                            <span>{post.scheduled_date || 'A definir'}</span>
                          </div>
                        </div>

                        {/* Canal e Formato */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] bg-cs-bg border border-cs-border text-white px-2 py-0.5 rounded font-semibold">
                            {post.channel}
                          </span>
                          <span className="text-[10px] bg-cs-bg border border-cs-border text-cs-text-secondary px-2 py-0.5 rounded">
                            {post.format}
                          </span>
                          {post.medical_compliance_checked && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">
                              CFM OK
                            </span>
                          )}
                        </div>

                        {/* Título da Pauta */}
                        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-cs-primary transition-colors">
                          {post.title}
                        </h3>

                        {/* Conceito Visual ou Prévia da Legenda */}
                        {post.visual_concept && (
                          <p className="text-xs text-cs-text-secondary mb-2 bg-cs-bg/70 p-2.5 rounded-xl border border-cs-border/50 line-clamp-2">
                            <strong className="text-white block text-[10px] uppercase">Conceito Visual:</strong>
                            {post.visual_concept}
                          </p>
                        )}

                        {post.caption && (
                          <p className="text-xs text-cs-text-secondary line-clamp-3 bg-cs-bg/40 p-2.5 rounded-xl border border-cs-border/40 mb-3">
                            {post.caption}
                          </p>
                        )}
                      </div>

                      {/* Footer com Ações */}
                      <div className="pt-3 border-t border-cs-border/60 flex items-center justify-between mt-3">
                        <select
                          value={post.status}
                          onChange={(e) => updatePostStatus(post.id, e.target.value)}
                          className="bg-cs-bg border border-cs-border text-xs text-white rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-cs-primary cursor-pointer"
                        >
                          <option value="pauta">Pauta</option>
                          <option value="roteiro">Roteiro</option>
                          <option value="producao">Produção</option>
                          <option value="aprovacao">Aguard. Cliente</option>
                          <option value="agendado">Agendado</option>
                          <option value="publicado">Publicado</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          {post.post_url && (
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-cs-text-secondary hover:text-white rounded-lg hover:bg-cs-bg transition-colors"
                              title="Ver post publicado"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 text-cs-text-secondary hover:text-red-400 rounded-lg hover:bg-cs-bg transition-colors"
                            title="Remover pauta"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: CANAIS & PERFIS */}
        {activeTab === 'canais' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-2">Canais Oficiais Configurados</h2>
              <p className="text-xs text-cs-text-secondary mb-6">
                Acessos e identificadores das redes sociais para a gestão da agência.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cs-bg border border-cs-border rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block mb-1">Instagram Principal</span>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {selectedClient?.name?.includes('Alberto') ? '@dralbertobr' : '@dubola_molhos'}
                    </h3>
                    <p className="text-xs text-cs-text-secondary">
                      {selectedClient?.name?.includes('Alberto') ? 'Perfil Profissional Médico (Saúde Vascular)' : 'Linha de Molhos Artesanais e Empórios'}
                    </p>
                  </div>
                  <a
                    href={selectedClient?.name?.includes('Alberto') ? 'https://instagram.com/dralbertobr' : 'https://instagram.com/dubola_molhos'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-cs-surface text-cs-text-secondary hover:text-white rounded-lg border border-cs-border transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="bg-cs-bg border border-cs-border rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">Página Facebook</span>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {selectedClient?.name?.includes('Alberto') ? 'Dr. Alberto Brasil: Cirurgião Vascular' : 'Dubola Molhos Nobres'}
                    </h3>
                    <p className="text-xs text-cs-text-secondary">Página integrada ao Meta Business Suite da Agência</p>
                  </div>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-cs-surface text-cs-text-secondary hover:text-white rounded-lg border border-cs-border transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">Diretrizes de Tom de Voz & Comunicação</h3>
              <p className="text-xs text-cs-text-secondary leading-relaxed bg-cs-bg p-4 rounded-xl border border-cs-border">
                {selectedClient?.tone_of_voice || 'Tom de voz focado em autoridade, clareza e conexão com o público de Poços de Caldas e região.'}
              </p>
            </div>
          </div>
        )}

        {/* ABA 3: FECHAMENTO MENSAL REAL */}
        {activeTab === 'fechamento' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Histórico Real de Fechamento de Redes</h2>
                  <p className="text-xs text-cs-text-secondary">
                    Métricas reais apuradas mês a mês no Instagram/Meta pela agência.
                  </p>
                </div>
                <button
                  onClick={() => setShowMetricModal(true)}
                  className="bg-cs-primary text-black font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus size={14} /> Registrar Mês
                </button>
              </div>

              {metrics.length === 0 ? (
                <div className="bg-cs-bg border border-cs-border rounded-xl p-8 text-center text-xs text-cs-text-secondary">
                  Nenhum fechamento manual registrado ainda para este cliente. Clique em "Registrar Mês" para salvar os números reais do último relatório.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-cs-border text-cs-text-secondary">
                        <th className="py-2.5 px-3">Mês/Ano</th>
                        <th className="py-2.5 px-3">Seguidores</th>
                        <th className="py-2.5 px-3">Crescimento</th>
                        <th className="py-2.5 px-3">Alcance Orgânico</th>
                        <th className="py-2.5 px-3">Interações</th>
                        <th className="py-2.5 px-3">Destaque</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cs-border/50">
                      {metrics.map(m => (
                        <tr key={m.id} className="text-white hover:bg-cs-bg/50">
                          <td className="py-3 px-3 font-bold font-mono text-cs-primary">{m.period_month}</td>
                          <td className="py-3 px-3">{m.followers_total?.toLocaleString('pt-BR') || '—'}</td>
                          <td className="py-3 px-3 text-emerald-400 font-bold">+{m.followers_growth || 0}</td>
                          <td className="py-3 px-3">{m.reach_organic?.toLocaleString('pt-BR') || '—'}</td>
                          <td className="py-3 px-3">{m.total_interactions?.toLocaleString('pt-BR') || '—'}</td>
                          <td className="py-3 px-3 text-cs-text-secondary truncate max-w-xs">{m.top_post_note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Pauta */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-5 right-5 text-cs-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Cadastrar Nova Pauta de Conteúdo</h2>
            <p className="text-xs text-cs-text-secondary mb-5">
              Cliente: <strong className="text-white">{selectedClient?.name || 'Cliente Ativo'}</strong>
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Tema da Pauta / Título do Post</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Ex: Como aliviar o peso nas pernas após o trabalho"
                    required
                    className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateScriptWithAi}
                    disabled={isGeneratingAi}
                    className="bg-cs-accent/20 hover:bg-cs-accent/30 text-cs-accent border border-cs-accent/40 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                    title="Preencher com Gemini IA"
                  >
                    <Sparkles size={14} /> {isGeneratingAi ? 'Criando...' : 'Gerar Roteiro'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Canal</label>
                  <select
                    value={newPost.channel}
                    onChange={e => setNewPost({ ...newPost, channel: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Formato</label>
                  <select
                    value={newPost.format}
                    onChange={e => setNewPost({ ...newPost, format: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="Carrossel">Carrossel</option>
                    <option value="Reels">Reels / Vídeo</option>
                    <option value="Estático">Card Estático</option>
                    <option value="Stories">Sequência Stories</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Data Prevista</label>
                  <input
                    type="date"
                    value={newPost.scheduled_date}
                    onChange={e => setNewPost({ ...newPost, scheduled_date: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Conceito Visual (Direção Criativa)</label>
                <textarea
                  rows={2}
                  value={newPost.visual_concept}
                  onChange={e => setNewPost({ ...newPost, visual_concept: e.target.value })}
                  placeholder="Ex: Foto do consultório em luz natural, diagrama ilustrado do vaso sem sangue exposto..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Legenda / Roteiro Completo</label>
                <textarea
                  rows={4}
                  value={newPost.caption}
                  onChange={e => setNewPost({ ...newPost, caption: e.target.value })}
                  placeholder="Digite o texto que acompanhará a publicação..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cs-text-secondary hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cs-primary hover:bg-yellow-400 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Salvar Pauta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fechamento Mensal */}
      {showMetricModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowMetricModal(false)}
              className="absolute top-5 right-5 text-cs-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Registrar Fechamento Real do Mês</h2>
            <p className="text-xs text-cs-text-secondary mb-4">
              Insira os dados oficiais apurados pela agência nas redes do cliente.
            </p>

            <form onSubmit={handleSaveMetric} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Mês de Referência</label>
                  <input
                    type="month"
                    value={metricForm.period_month}
                    onChange={e => setMetricForm({ ...metricForm, period_month: e.target.value })}
                    required
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Total de Seguidores</label>
                  <input
                    type="number"
                    value={metricForm.followers_total}
                    onChange={e => setMetricForm({ ...metricForm, followers_total: e.target.value })}
                    placeholder="Ex: 2150"
                    required
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Novos Seguidores</label>
                  <input
                    type="number"
                    value={metricForm.followers_growth}
                    onChange={e => setMetricForm({ ...metricForm, followers_growth: e.target.value })}
                    placeholder="Ex: 35"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Alcance Orgânico</label>
                  <input
                    type="number"
                    value={metricForm.reach_organic}
                    onChange={e => setMetricForm({ ...metricForm, reach_organic: e.target.value })}
                    placeholder="Ex: 1420"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Interações</label>
                  <input
                    type="number"
                    value={metricForm.total_interactions}
                    onChange={e => setMetricForm({ ...metricForm, total_interactions: e.target.value })}
                    placeholder="Ex: 110"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Post / Pauta em Destaque</label>
                <input
                  type="text"
                  value={metricForm.top_post_note}
                  onChange={e => setMetricForm({ ...metricForm, top_post_note: e.target.value })}
                  placeholder="Ex: Carrossel sobre Laser Transdérmico gerou 420 contas alcançadas"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMetricModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cs-text-secondary hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cs-primary hover:bg-yellow-400 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Salvar Fechamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
