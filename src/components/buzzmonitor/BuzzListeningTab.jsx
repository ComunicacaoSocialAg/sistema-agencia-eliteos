import React, { useState } from 'react';
import { 
  Radio, Sparkles, Plus, Search, ThumbsUp, MinusCircle, AlertCircle, 
  MessageSquare, Hash, TrendingUp, Filter, Share2, Globe, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../utils/cn';

const SENTIMENT_COLORS = {
  positive: '#10b981', // Verde
  neutral: '#71717a',  // Cinza
  negative: '#ef4444'  // Vermelho
};

export default function BuzzListeningTab({ client, onAddTerm, onAddMention }) {
  const [newTerm, setNewTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [testMentionText, setTestMentionText] = useState('');
  const [testAuthor, setTestAuthor] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const listening = client.listening || {
    monitored_terms: [],
    sentiment: { positive: 70, neutral: 20, negative: 10 },
    trending_topics: [],
    mentions: []
  };

  const sentimentData = [
    { name: 'Positivo', value: listening.sentiment?.positive || 70, color: SENTIMENT_COLORS.positive },
    { name: 'Neutro', value: listening.sentiment?.neutral || 20, color: SENTIMENT_COLORS.neutral },
    { name: 'Negativo', value: listening.sentiment?.negative || 10, color: SENTIMENT_COLORS.negative }
  ];

  const handleAddTerm = (e) => {
    e.preventDefault();
    if (newTerm.trim()) {
      onAddTerm(newTerm.trim());
      setNewTerm('');
    }
  };

  const handleTestMention = async (e) => {
    e.preventDefault();
    if (!testMentionText.trim()) return;
    setIsAnalyzing(true);
    try {
      await onAddMention(testAuthor.trim() || 'Usuário Anônimo', testMentionText.trim(), 'Instagram');
      setTestMentionText('');
      setTestAuthor('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredMentions = (listening.mentions || []).filter(m => {
    const matchSentiment = filterSentiment === 'all' || m.sentiment === filterSentiment;
    const matchSearch = !searchTerm || 
      m.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSentiment && matchSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header com Status do Listening */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Radio size={20} className="text-cs-primary" />
              Social Listening em Tempo Real: {client.name}
            </h3>
          </div>
          <p className="text-xs text-cs-text-secondary mt-1">
            Monitorando redes sociais, comentários, avaliações do Google e palavras-chave da região.
          </p>
        </div>

        <form onSubmit={handleAddTerm} className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Adicionar termo/hashtag..." 
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary w-48 md:w-60"
          />
          <button 
            type="submit"
            className="bg-cs-primary text-black font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 hover:bg-yellow-400 transition-colors shrink-0"
          >
            <Plus size={14} /> Monitorar
          </button>
        </form>
      </div>

      {/* Grid de Métricas de Sentimento e Tópicos Quentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico de Sentimento */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-cs-primary" />
                Índice de Sentimento da Marca
              </h4>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                IA Classificada
              </span>
            </div>
            <p className="text-[11px] text-cs-text-secondary mt-0.5">Baseado em {listening.sentiment_volume || 48} menções analisadas</p>
          </div>

          <div className="h-44 flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-green-400">{listening.sentiment?.positive || 74}%</span>
              <span className="text-[9px] text-cs-text-secondary uppercase font-bold">Positivo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-cs-border/60 pt-3 text-center text-xs">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-1.5">
              <div className="text-[10px] text-green-400 font-bold">Positivo</div>
              <div className="font-bold text-white">{listening.sentiment?.positive || 74}%</div>
            </div>
            <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-lg p-1.5">
              <div className="text-[10px] text-zinc-400 font-bold">Neutro</div>
              <div className="font-bold text-white">{listening.sentiment?.neutral || 22}%</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-1.5">
              <div className="text-[10px] text-red-400 font-bold">Negativo</div>
              <div className="font-bold text-white">{listening.sentiment?.negative || 4}%</div>
            </div>
          </div>
        </div>

        {/* Termos Monitorados & Tópicos Quentes */}
        <div className="md:col-span-2 bg-cs-surface border border-cs-border rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash size={16} className="text-cs-primary" />
                Termos & Hashtags Monitoradas ({listening.monitored_terms?.length || 0})
              </h4>
              <span className="text-[10px] text-cs-text-secondary">Radar ativo</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {listening.monitored_terms?.map((term, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cs-bg border border-cs-border text-white flex items-center gap-1.5 hover:border-cs-primary/50 transition-colors"
                >
                  <span className="text-cs-primary">#</span> {term}
                </span>
              ))}
            </div>

            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-amber-400" />
              Tópicos Mais Citados (Nuvem de Assuntos)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {listening.trending_topics?.map((topic, idx) => (
                <div key={idx} className="bg-cs-bg border border-cs-border rounded-xl p-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{topic.term}</div>
                    <div className="text-[10px] text-cs-text-secondary">{topic.count} menções</div>
                  </div>
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0 ml-2",
                    topic.sentiment === 'positive' ? "bg-green-500" :
                    topic.sentiment === 'negative' ? "bg-red-500" : "bg-zinc-500"
                  )} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cs-border/60 text-xs text-cs-text-secondary flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-400 shrink-0" />
            <span>Alertas de crise automáticos configurados para picos de sentimento negativo superior a 15%.</span>
          </div>
        </div>
      </div>

      {/* Simulador de Ingestão de Menção com Gemini AI */}
      <div className="bg-gradient-to-r from-cs-surface to-cs-primary/5 border border-cs-border rounded-2xl p-5">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-cs-primary" />
          Testar Ingestão & Análise de Sentimento com IA (Gemini)
        </h4>
        <p className="text-xs text-cs-text-secondary mb-4">
          Insira qualquer texto de comentário, tweet ou review para que o Gemini classifique e insira no feed.
        </p>

        <form onSubmit={handleTestMention} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="Nome do Autor (ex: Mariana Souza)" 
              value={testAuthor}
              onChange={(e) => setTestAuthor(e.target.value)}
              className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary"
            />
            <input 
              type="text" 
              placeholder="Mensagem ou comentário coletado..." 
              value={testMentionText}
              onChange={(e) => setTestMentionText(e.target.value)}
              className="md:col-span-2 bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary"
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isAnalyzing || !testMentionText.trim()}
              className="bg-cs-primary text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Classificando com IA...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Analisar Sentimento & Ingerir
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Stream de Menções Coletadas */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-cs-primary" />
              Feed de Menções Coletadas ({filteredMentions.length})
            </h4>
            <p className="text-xs text-cs-text-secondary">Publicações que citam a marca ou os termos monitorados</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cs-text-secondary" />
              <input 
                type="text" 
                placeholder="Buscar menções..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-cs-bg border border-cs-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary w-40 md:w-52"
              />
            </div>

            <div className="flex items-center bg-cs-bg border border-cs-border rounded-xl p-1 gap-1">
              <button 
                onClick={() => setFilterSentiment('all')}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all", filterSentiment === 'all' ? "bg-cs-surface text-white" : "text-cs-text-secondary hover:text-white")}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterSentiment('positive')}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1", filterSentiment === 'positive' ? "bg-green-500/20 text-green-400" : "text-cs-text-secondary hover:text-green-400")}
              >
                <ThumbsUp size={12} /> Positivo
              </button>
              <button 
                onClick={() => setFilterSentiment('neutral')}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all", filterSentiment === 'neutral' ? "bg-zinc-500/20 text-zinc-300" : "text-cs-text-secondary hover:text-zinc-300")}
              >
                Neutro
              </button>
              <button 
                onClick={() => setFilterSentiment('negative')}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1", filterSentiment === 'negative' ? "bg-red-500/20 text-red-400" : "text-cs-text-secondary hover:text-red-400")}
              >
                <AlertCircle size={12} /> Negativo
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredMentions.length === 0 ? (
            <div className="text-center py-12 text-cs-text-secondary text-xs">
              Nenhuma menção encontrada para o filtro selecionado.
            </div>
          ) : (
            filteredMentions.map((mention) => (
              <div 
                key={mention.id} 
                className="bg-cs-bg border border-cs-border rounded-xl p-4 hover:border-cs-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img 
                    src={mention.avatar} 
                    alt={mention.author} 
                    className="w-10 h-10 rounded-full object-cover border border-cs-border shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{mention.author}</span>
                      <span className="text-[11px] text-cs-text-secondary bg-cs-surface px-2 py-0.5 rounded border border-cs-border/60">
                        {mention.channel}
                      </span>
                      <span className="text-[11px] text-cs-text-secondary font-mono">{mention.date}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">{mention.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-cs-text-secondary">
                      <span>Alcance Estimado: <strong>{mention.reach} contas</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                    mention.sentiment === 'positive' ? "bg-green-500/10 text-green-400 border-green-500/30" :
                    mention.sentiment === 'negative' ? "bg-red-500/10 text-red-400 border-red-500/30" :
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                  )}>
                    {mention.sentiment === 'positive' ? 'Positivo 🟢' : mention.sentiment === 'negative' ? 'Negativo 🔴' : 'Neutro ⚪'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
