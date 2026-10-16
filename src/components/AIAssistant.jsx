import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Loader2, Maximize2, Minimize2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { chatWithAgentWithSystemPrompt, isAIConfigured } from '../lib/gemini';
import { cn } from '../utils/cn';

const MODULE_CONFIGS = {
  producao: { label: 'Produção', color: 'text-purple-400', agent: 'analyst' },
  crm: { label: 'CRM & Vendas', color: 'text-blue-400', agent: 'analyst' },
  financeiro: { label: 'Financeiro', color: 'text-green-400', agent: 'analyst' },
  relatorios: { label: 'Relatórios & BI', color: 'text-yellow-400', agent: 'analyst' },
  gestao: { label: 'Gestão da Agência', color: 'text-orange-400', agent: 'analyst' },
  cliente: { label: 'Hub do Cliente', color: 'text-indigo-400', agent: 'content' },
  clientes: { label: 'Clientes & Projetos', color: 'text-teal-400', agent: 'analyst' },
  geral: { label: 'Assistente Geral', color: 'text-cs-accent', agent: 'content' },
};

function buildSystemPrompt(moduleContext, memories) {
  const base = `Você é o co-piloto de IA do CS Ag OS, sistema operacional da agência Comunicação Social Ag (comunicacaosocialag.com.br).
Você tem acesso completo aos dados da agência em tempo real. Seja direto, prático e responda SEMPRE em português brasileiro.
Mantenha a memória de longo prazo do que já aprendemos sobre os clientes.

## Memórias Relevantes (O que já aprendemos):
${memories.length > 0 ? memories.map(m => `- ${m.key}: ${m.value}`).join('\n') : 'Nenhuma memória registrada ainda.'}

## Contexto Atual da Tela — ${moduleContext.title}
Você está "vendo" exatamente o que o usuário Bruno vê agora. Use os dados técnicos abaixo para ser preciso:
\`\`\`json
${JSON.stringify(moduleContext.data, null, 2)}
\`\`\`

Regras de Ouro:
1. Se o Bruno pedir para criar algo, use o contexto do cliente atual.
2. Seja proativo: se notar um atraso ou baixa margem nos dados, avise.
3. Use markdown para listas e tabelas.`;

  return base;
}

export default function AIAssistant() {
  const { isOpen, toggle, close, moduleContext, history, saveHistory, memories } = useAIAssistant();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferredProvider, setPreferredProvider] = useState('auto');
  const [isListening, setIsListening] = useState(false);
  const [prevModule, setPrevModule] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInput(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Add context-switch message when module changes
  useEffect(() => {
    if (moduleContext?.module && moduleContext.module !== prevModule && isOpen) {
      setPrevModule(moduleContext.module);
      saveHistory([
        ...history,
        {
          role: 'system-notice',
          text: `Contexto atualizado: agora vejo os dados de **${moduleContext.title}**.`,
        }
      ]);
    }
  }, [moduleContext?.module, isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newHistory = [...history, { role: 'user', text }];
    setInput('');
    saveHistory([...newHistory, { role: 'loading' }]);
    setIsLoading(true);

    try {
      const chatHistory = history
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({ role: m.role, text: m.text }));

      const systemPrompt = buildSystemPrompt(moduleContext, memories);
      const response = await chatWithAgentWithSystemPrompt(systemPrompt, chatHistory, text, preferredProvider);

      saveHistory([
        ...newHistory,
        { role: 'ai', text: response.text },
      ]);
    } catch (err) {
      saveHistory([
        ...newHistory,
        { role: 'ai', text: `❌ ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const config = MODULE_CONFIGS[moduleContext?.module] || MODULE_CONFIGS.geral;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggle}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
          isOpen
            ? "bg-cs-surface border border-cs-border scale-90"
            : "bg-gradient-to-br from-cs-primary to-cs-accent hover:scale-110 shadow-cs-accent/30"
        )}
        title="Assistente de IA"
      >
        {isOpen
          ? <ChevronDown size={22} className="text-cs-text-secondary" />
          : <Sparkles size={22} className="text-white animate-pulse" />
        }
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-24 right-6 z-40 bg-cs-surface border border-cs-border rounded-2xl shadow-2xl shadow-black/50 flex flex-col transition-all duration-300",
          isExpanded ? "w-[520px] h-[75vh]" : "w-96 h-[520px]"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cs-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cs-primary to-cs-accent flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Co-piloto IA</div>
                <div className={cn("text-[10px] font-medium", config.color)}>
                  📍 {config.label}
                  {!isAIConfigured && ' • (sem API key)'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={preferredProvider}
                onChange={e => setPreferredProvider(e.target.value)}
                className="text-[10px] bg-cs-bg text-cs-text-secondary border border-cs-border rounded px-1.5 py-0.5 focus:outline-none focus:border-cs-accent mr-2 cursor-pointer transition-colors"
                title="Selecione o provedor de IA preferencial"
              >
                <option value="auto">Auto</option>
                <option value="gemini">Gemini</option>
                <option value="gpt">GPT</option>
              </select>
              <button
                onClick={() => setIsExpanded(v => !v)}
                className="p-1.5 text-cs-text-secondary hover:text-white hover:bg-cs-surface-hover rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={close}
                className="p-1.5 text-cs-text-secondary hover:text-white hover:bg-cs-surface-hover rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cs-primary/20 to-cs-accent/20 border border-cs-border flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-cs-accent" />
                </div>
                <p className="text-white font-medium text-sm mb-1">Olá! Como posso ajudar?</p>
                <p className="text-cs-text-secondary text-xs">
                  Tenho acesso aos dados de <span className={cn("font-medium", config.color)}>{config.label}</span>.<br />
                  Pergunte qualquer coisa sobre esses dados!
                </p>
                {/* Quick prompts */}
                <div className="mt-4 flex flex-col gap-2">
                  {getQuickPrompts(moduleContext?.module).map((prompt, i) => (
                    <button key={i} onClick={() => { setInput(prompt); }}
                      className="text-left text-xs px-3 py-2 bg-cs-bg border border-cs-border hover:border-cs-primary rounded-lg text-cs-text-secondary hover:text-white transition-colors">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((msg, i) => {
              if (msg.role === 'system-notice') {
                return (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-cs-text-secondary bg-cs-bg border border-cs-border px-2 py-0.5 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              if (msg.role === 'loading') {
                return (
                  <div key={i} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-cs-accent flex items-center justify-center shrink-0">
                      <Bot size={12} className="text-white" />
                    </div>
                    <div className="bg-cs-bg border border-cs-border rounded-xl px-3 py-2 flex items-center gap-2">
                      <Loader2 size={13} className="text-cs-accent animate-spin" />
                      <span className="text-xs text-cs-text-secondary">Analisando dados...</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className={cn("flex gap-2", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-cs-accent flex items-center justify-center shrink-0 mt-1">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap",
                    msg.role === 'user'
                      ? "bg-cs-primary text-white"
                      : "bg-cs-bg border border-cs-border text-cs-text-primary"
                  )}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-cs-border shrink-0">
            <div className="flex gap-2">
              <button
                onClick={toggleListen}
                disabled={isLoading}
                className={cn(
                  "w-8 h-8 self-end rounded-lg flex items-center justify-center transition-all shadow-lg shrink-0",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                    : "bg-cs-surface border border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-primary"
                )}
                title={isListening ? "Parar gravação" : "Falar com IA"}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
              </button>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Ouvindo..." : "Pergunte ou peça um briefing..."}
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-accent resize-none placeholder:text-cs-text-secondary"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 self-end bg-cs-accent hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getQuickPrompts(module) {
  const prompts = {
    producao: [
      '📊 Quais tarefas estão atrasadas hoje?',
      '👥 Quem está mais sobrecarregado na equipe?',
      '🚨 Resumo de tudo aguardando cliente',
    ],
    crm: [
      '🎯 Quais leads devo priorizar esta semana?',
      '💰 Qual é o valor total do pipeline?',
      '📈 Calcule a taxa de conversão do funil',
    ],
    financeiro: [
      '📊 Como está a margem de lucro este mês?',
      '⚠️ Quais clientes estão em inadimplência?',
      '💡 Sugira ações para aumentar o MRR',
    ],
    relatorios: [
      '📝 Gere um resumo executivo das métricas',
      '🔍 Qual campanha teve melhor desempenho?',
      '📢 Escreva o texto do relatório mensal',
    ],
    gestao: [
      '⚡ Qual job tem maior margem de lucro?',
      '🏋️ Como distribuir melhor a carga da equipe?',
      '📊 Calcule a rentabilidade por cliente',
    ],
    cliente: [
      '✉️ Escreva um e-mail de follow-up para aprovação',
      '📋 Resuma o status das campanhas ativas',
      '🎨 Sugira melhorias para as próximas peças',
    ],
  };
  return prompts[module] || [
    '🤖 O que você pode fazer por mim?',
    '📊 Analise os dados da agência',
    '💡 Sugira melhorias para a agência',
  ];
}


