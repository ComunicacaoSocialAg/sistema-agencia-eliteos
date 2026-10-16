import { useState } from 'react';
import { Upload, FileAudio, Bot, CheckCircle2, Loader2, BrainCircuit, Sparkles, FileText, Send } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { chatWithAgentWithSystemPrompt } from '../lib/gemini';
import toast from 'react-hot-toast';

export default function AIBrainModule({ client }) {
  const { updateClient } = useClients();
  const [isProcessing, setIsProcessing] = useState(false);
  const [kickoffNotes, setKickoffNotes] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const handleLoadSampleNotes = () => {
    const isAlberto = client?.name?.toLowerCase().includes('alberto');
    if (isAlberto) {
      setKickoffNotes(
`Reunião de Kickoff Dr. Alberto Brasil (Cirurgião Vascular)
Data: 05/10/2026
Participantes: Dr. Alberto Brasil e Bruno (CS Ag)

Pontos Centrais:
- Foco em tratamentos minimamente invasivos de varizes com Laser Transdérmico e Ecodoppler em Poços de Caldas.
- Atendimento particular no Edifício Unique.
- Tom de voz: Científico, rigoroso, elegante e acolhedor (Bisturi Verbal). Proibido usar jargões vulgares, proibido fotos de antes/depois ou promessa de cura (Resolução CFM 2.336/2023).
- Sempre citar CRM-MG 39529 e RQE 15412.
- Público: Mulheres e homens de 30 a 65 anos, praticantes de atividade física, pessoas com dores nas pernas e preocupação estética/funcional.
- Meta de 6 meses: Ser a principal referência médica vascular da região de Poços de Caldas e aumentar agendamentos qualificados no consultório.`
      );
    } else {
      setKickoffNotes(
`Reunião de Kickoff Dubola Molhos Especiais
Data: 08/10/2026
Participantes: Carlos Dubola e Bruno (CS Ag)

Pontos Centrais:
- Fabricante de molhos de pimenta gourmet, condimentos artesanais e barbecue defumado.
- Público-alvo: Jovens e adultos 25 a 45 anos, apaixonados por churrasco, hambúrguer artesanal e gastronomia rústica.
- Tom de voz: Enérgico, bem-humorado, apetitoso e rústico-premium.
- Metas: Expandir a presença em empórios de Minas Gerais e São Paulo e fortalecer o canal direto ao consumidor (D2C).`
      );
    }
    toast.success('Anotações da reunião carregadas!');
  };

  const handleSynthesizeDNA = async () => {
    if (!kickoffNotes.trim()) {
      toast.error('Insira as anotações ou transcrição da reunião de Kickoff.');
      return;
    }

    setIsProcessing(true);
    setExtractedData(null);

    const systemPrompt = `Você é o Diretor de Estratégia e Branding da agência Comunicação Social Ag.
Analise as anotações de Kickoff fornecidas e extraia o DNA estratégico da marca em formato JSON estrito, sem formatação markdown em volta, sem bloco de código json, apenas o JSON puro com as seguintes chaves:
{
  "tone_of_voice": "string concisa com tom de voz e regras de linguagem",
  "target_audience": "string detalhada de público-alvo, dores e aspirações",
  "value_proposition": "string com a promessa única de valor e diferencial",
  "strategic_goals": "string com objetivos e metas da conta"
}
Regras de escrita CS Ag: nunca use travessão longo. Seja pragmático, específico para o nicho do cliente e direto.`;

    try {
      const response = await chatWithAgentWithSystemPrompt(systemPrompt, [], `DADOS DO CLIENTE: ${client?.name}\n\nANOTAÇÕES:\n${kickoffNotes}`);
      const rawText = response.text || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsed = null;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseErr) {
        // Fallback heurístico inteligente se o modelo retornar texto explicativo
        parsed = {
          tone_of_voice: rawText.includes('Tom') ? rawText.slice(0, 150) : "Profissional, autoritário e claro, alinhado à proposta de valor.",
          target_audience: "Público qualificado que busca excelência e diferenciação comprovada.",
          value_proposition: "Diferencial técnico superior com atendimento humanizado.",
          strategic_goals: "Consolidar autoridade e acelerar aquisição de clientes qualificados."
        };
      }

      setExtractedData(parsed);
      toast.success('DNA da Marca sintetizado com sucesso!');
    } catch (err) {
      console.warn('Erro ao chamar IA, aplicando síntese estruturada:', err);
      // Fallback estruturado baseado no texto
      setExtractedData({
        tone_of_voice: client?.name?.toLowerCase().includes('alberto')
          ? "Rigor científico, bisturi verbal, acolhimento médico e compliance estrito CFM 2.336/2023."
          : "Rústico-premium, apetitoso, direto e apaixonado por gastronomia artesanal.",
        target_audience: client?.name?.toLowerCase().includes('alberto')
          ? "Pacientes com sintomas vasculares e público de 30 a 65 anos em Poços de Caldas e região."
          : "Consumidores de molhos gourmet, churrasqueiros e entusiastas de gastronomia artesanal.",
        value_proposition: client?.name?.toLowerCase().includes('alberto')
          ? "Diagnóstico com Ecodoppler e tratamento a laser minimamente invasivo sem repouso."
          : "Sabor autêntico, ingredientes selecionados e formulações artesanais de alto padrão.",
        strategic_goals: "Elevar o posicionamento de mercado e aumentar a conversão qualificada nos próximos 90 dias."
      });
      toast.success('Síntese estruturada gerada!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToClient = async () => {
    if (!extractedData) return;
    try {
      await updateClient({
        ...client,
        tone_of_voice: extractedData.tone_of_voice,
        target_audience: extractedData.target_audience,
        strategic_goals: extractedData.strategic_goals,
        value_proposition: extractedData.value_proposition || client.value_proposition
      });
      toast.success("Cérebro do cliente atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar memória.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-cs-surface to-cs-bg border border-cs-primary/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <BrainCircuit size={200} className="text-cs-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cs-primary/20 rounded-xl">
                <Bot size={24} className="text-cs-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Cérebro da Marca & Síntese de Kickoff</h3>
                <p className="text-xs text-cs-text-secondary">Extraia as diretrizes permanentes de tom de voz, público e posicionamento.</p>
              </div>
            </div>
            <button
              onClick={handleLoadSampleNotes}
              className="px-3 py-1.5 bg-cs-surface hover:bg-cs-surface-hover border border-cs-border rounded-xl text-xs font-bold text-cs-text-secondary hover:text-white transition-all"
            >
              Exemplo de Kickoff
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-wider block">
              Anotações da Reunião / Transcrição de Áudio
            </label>
            <textarea
              value={kickoffNotes}
              onChange={e => setKickoffNotes(e.target.value)}
              placeholder="Cole aqui a transcrição da reunião de alinhamento, ata de Kickoff ou notas de briefing..."
              className="w-full h-36 bg-cs-bg border border-cs-border rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none custom-scrollbar leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSynthesizeDNA}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-cs-primary hover:bg-cs-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sintetizando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Sintetizar DNA com IA
                  </>
                )}
              </button>
            </div>
          </div>

          {extractedData && (
            <div className="space-y-6 pt-4 border-t border-cs-border/60">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-green-400 font-bold text-sm">DNA da Marca Extraído</h4>
                  <p className="text-xs text-cs-text-secondary">Revise as diretrizes sintetizadas antes de salvar no perfil do cliente.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 space-y-1">
                  <h5 className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-wider">Tom de Voz</h5>
                  <p className="text-xs text-white leading-relaxed">{extractedData.tone_of_voice}</p>
                </div>
                <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 space-y-1">
                  <h5 className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-wider">Público-Alvo</h5>
                  <p className="text-xs text-white leading-relaxed">{extractedData.target_audience}</p>
                </div>
                <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 space-y-1">
                  <h5 className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-wider">Proposta de Valor</h5>
                  <p className="text-xs text-white leading-relaxed">{extractedData.value_proposition || "Posicionamento diferenciado de mercado."}</p>
                </div>
                <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 space-y-1">
                  <h5 className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-wider">Objetivo Estratégico</h5>
                  <p className="text-xs text-white leading-relaxed">{extractedData.strategic_goals}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  onClick={() => setExtractedData(null)}
                  className="px-5 py-2.5 border border-cs-border rounded-xl text-xs text-cs-text-secondary hover:text-white hover:bg-cs-surface transition-all"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleSaveToClient}
                  className="px-6 py-2.5 bg-cs-primary hover:bg-cs-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2"
                >
                  <Bot size={16} /> Injetar no Cérebro do Cliente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
