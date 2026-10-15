import React, { useState } from 'react';
import { 
  Headphones, MessageSquare, Sparkles, Send, CheckCircle2, Clock, 
  AlertTriangle, Filter, User, Bot, CornerDownRight, Copy, Check
} from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function BuzzSACTab({ client, onRespondTicket, onGetAiSuggestion }) {
  const tickets = client.sac_tickets || [];
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleSelectTicket = (t) => {
    setSelectedTicketId(t.id);
    setReplyText(t.suggested_ai_reply || '');
  };

  const handleGenerateAI = async () => {
    if (!activeTicket) return;
    setIsGeneratingAI(true);
    try {
      const suggestion = await onGetAiSuggestion(activeTicket);
      setReplyText(suggestion);
      toast.success('Sugestão gerada com o tom de voz da marca!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar sugestão de IA.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSend = () => {
    if (!activeTicket || !replyText.trim()) return;
    onRespondTicket(activeTicket.id, replyText.trim());
    setReplyText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'open') return t.status === 'open';
    if (statusFilter === 'closed') return t.status === 'closed';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header SAC */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Headphones size={20} className="text-cs-primary" />
            SAC 2.0 & Omni-Inbox: {client.name}
          </h3>
          <p className="text-xs text-cs-text-secondary mt-1">
            Atendimento unificado de Directs do Instagram, Comentários do Facebook e Avaliações com Copiloto de IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-cs-bg border border-cs-border rounded-xl p-1 flex items-center gap-1">
            <button 
              onClick={() => setStatusFilter('all')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", statusFilter === 'all' ? "bg-cs-surface text-white" : "text-cs-text-secondary hover:text-white")}
            >
              Todos ({tickets.length})
            </button>
            <button 
              onClick={() => setStatusFilter('open')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1", statusFilter === 'open' ? "bg-amber-500/20 text-amber-400" : "text-cs-text-secondary hover:text-amber-400")}
            >
              Pendentes ({tickets.filter(t => t.status === 'open').length})
            </button>
            <button 
              onClick={() => setStatusFilter('closed')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1", statusFilter === 'closed' ? "bg-green-500/20 text-green-400" : "text-cs-text-secondary hover:text-green-400")}
            >
              Respondidos
            </button>
          </div>
        </div>
      </div>

      {/* Layout Split: Lista de Tickets + Detalhes/Resposta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Coluna Esquerda: Lista de Tickets (5 colunas) */}
        <div className="lg:col-span-5 bg-cs-surface border border-cs-border rounded-2xl p-4 flex flex-col">
          <div className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-3 px-2">
            Conversas & Mensagens ({filteredTickets.length})
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-1 max-h-[520px]">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 text-cs-text-secondary text-xs">
                Nenhum atendimento pendente para este filtro!
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer text-left relative",
                      isSelected 
                        ? "bg-cs-primary/10 border-cs-primary text-white shadow-md shadow-cs-primary/5" 
                        : "bg-cs-bg border-cs-border hover:border-cs-border/80 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-xs text-white truncate">{t.author}</span>
                        <span className="text-[10px] text-cs-text-secondary bg-cs-surface px-1.5 py-0.2 rounded border border-cs-border/60">
                          {t.channel}
                        </span>
                      </div>
                      <span className="text-[10px] text-cs-text-secondary shrink-0">{t.date}</span>
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1 leading-relaxed">
                      {t.snippet}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-cs-border/40">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        t.urgency === 'high' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        t.urgency === 'medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}>
                        Urgência {t.urgency}
                      </span>

                      <span className={cn(
                        "text-[10px] font-bold flex items-center gap-1",
                        t.status === 'closed' ? "text-green-400" : "text-amber-400"
                      )}>
                        {t.status === 'closed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {t.status === 'closed' ? 'Concluído' : 'Aguardando Resposta'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Detalhe do Ticket + Copiloto de IA (7 colunas) */}
        <div className="lg:col-span-7 bg-cs-surface border border-cs-border rounded-2xl p-6 flex flex-col justify-between">
          {activeTicket ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Header do Ticket Ativo */}
              <div className="flex items-center justify-between pb-4 border-b border-cs-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cs-primary/20 text-cs-primary font-bold flex items-center justify-center text-sm border border-cs-primary/30">
                    {activeTicket.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {activeTicket.author}
                      <span className="text-[10px] font-normal text-cs-text-secondary bg-cs-bg px-2 py-0.5 rounded border border-cs-border">
                        {activeTicket.channel}
                      </span>
                    </h4>
                    <span className="text-[11px] text-cs-text-secondary">Enviado: {activeTicket.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border",
                    activeTicket.status === 'closed' ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  )}>
                    {activeTicket.status === 'closed' ? 'Ticket Respondido' : 'Pendente de Resposta'}
                  </span>
                </div>
              </div>

              {/* Histórico da Conversa */}
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-56 pr-2">
                {activeTicket.history?.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed",
                      msg.sender === 'user' 
                        ? "bg-cs-bg border border-cs-border text-zinc-200 self-start rounded-tl-none" 
                        : "bg-cs-primary/15 border border-cs-primary/30 text-white self-end rounded-tr-none"
                    )}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cs-text-secondary mb-1">
                      {msg.sender === 'user' ? activeTicket.author : `Agência Comunica (em nome de ${client.name})`}
                    </span>
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Caixa de Elaboração de Resposta com Copiloto IA */}
              <div className="bg-cs-bg border border-cs-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Bot size={16} className="text-cs-primary" />
                    Copiloto de Atendimento Inteligente
                  </div>

                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="bg-cs-primary/20 text-cs-primary hover:bg-cs-primary/30 border border-cs-primary/30 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    {isGeneratingAI ? 'Gerando com IA...' : 'Regenerar com IA'}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escreva ou edite a resposta para o cliente..."
                  className="w-full bg-cs-surface border border-cs-border rounded-lg p-3 text-xs text-white placeholder:text-cs-text-secondary focus:outline-none focus:border-cs-primary resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-cs-text-secondary truncate">
                    Tom de voz ativo: <span className="text-white font-medium">{client.tone_of_voice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-cs-surface text-cs-text-secondary hover:text-white rounded-lg border border-cs-border hover:border-cs-border/80 transition-colors"
                      title="Copiar texto"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      className="bg-cs-primary text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                      <Send size={13} />
                      Enviar Resposta & Fechar Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-cs-text-secondary text-xs">
              Selecione um ticket na coluna ao lado para visualizar e responder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
