import { useState } from 'react';
import { Sparkles, X, ChevronRight, CheckCircle2, Copy, FileText, Send } from 'lucide-react';
import { chatWithAgent, isGeminiConfigured } from '../lib/gemini';
import { cn } from '../utils/cn';

export default function AIBriefingModal({ onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1: Input, 2: Review
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState(null);

  const generateBriefing = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const response = await chatWithAgent('brief', [], description);
      setBriefing(response.text);
      setStep(2);
    } catch (error) {
      alert('Erro ao gerar briefing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-gradient-to-r from-cs-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cs-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-cs-primary/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assistente de Briefing IA</h2>
              <p className="text-xs text-cs-text-secondary italic">Transforme ideias soltas em um plano estruturado.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="bg-cs-bg/50 border border-cs-border rounded-2xl p-6">
                <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest block mb-4">O que precisa ser criado?</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Preciso de uma campanha de posts para a Dubola focada na linha de molhos artesanais no e-commerce, com tom gourmet e apetitoso..."
                  rows={6}
                  className="w-full bg-transparent border-none text-white text-lg placeholder:text-cs-text-secondary/30 focus:outline-none resize-none leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-cs-text-secondary font-medium">
                  <CheckCircle2 size={12} className="text-cs-primary" /> Sugestão: Descreva o objetivo e o tom de voz.
                </div>
                <button 
                  onClick={generateBriefing}
                  disabled={loading || !description.trim() || !isGeminiConfigured}
                  className={cn(
                    "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-cs-primary/20",
                    loading || !description.trim() ? "bg-cs-surface text-cs-text-secondary" : "bg-cs-primary text-white hover:bg-cs-primary-hover active:scale-95"
                  )}
                >
                  {loading ? 'ANALISANDO COM IA...' : <><Sparkles size={18} /> ESTRUTURAR BRIEFING</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-cs-bg/50 border border-cs-border rounded-2xl p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="prose prose-invert prose-sm max-w-none">
                  {briefing.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 text-cs-text-primary leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl border border-cs-border text-cs-text-secondary hover:text-white font-bold text-sm transition-all"
                >
                  REFAZER DESCRIÇÃO
                </button>
                <button 
                  onClick={() => onConfirm(briefing)}
                  className="flex-[2] bg-cs-primary hover:bg-cs-primary-hover text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-cs-primary/20 flex items-center justify-center gap-2"
                >
                  <FileText size={18} /> USAR ESTE BRIEFING
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-cs-bg border-t border-cs-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-tighter">Gemini 1.5 Flash Ativo</span>
        </div>
      </div>
    </div>
  );
}
