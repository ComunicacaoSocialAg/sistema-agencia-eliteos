import { useState } from 'react';
import { Upload, FileAudio, Bot, CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import toast from 'react-hot-toast';

export default function AIBrainModule({ client }) {
  const { updateClient } = useClients();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setProgress(0);
    setExtractedData(null);

    // Simulate upload and processing steps
    const steps = [
      { p: 20, msg: "Fazendo upload do áudio (23MB)..." },
      { p: 40, msg: "Transcrevendo reunião de Kickoff com Gemini 1.5 Pro..." },
      { p: 60, msg: "Analisando semântica e dores do cliente..." },
      { p: 80, msg: "Extraindo Tom de Voz e Diretrizes de Marca..." },
      { p: 100, msg: "Salvando no Cérebro da Agência..." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsUploading(false);
        const mockExtracted = {
          tone_of_voice: "Sofisticado, acolhedor e direto ao ponto. Evitar jargões técnicos complexos.",
          target_audience: "Público Classe A/B, idade 25-50 anos. Pessoas que valorizam experiências exclusivas e produtos artesanais premium.",
          strategic_goals: "Tornar a marca Top of Mind no nicho artesanal em 6 meses, focando em posicionamento de alto valor agregado."
        };
        setExtractedData(mockExtracted);
        toast.success("Análise Semântica concluída!");
      }
    }, 1000);
  };

  const handleSaveToClient = async () => {
    if (!extractedData) return;
    try {
      await updateClient({
        ...client,
        tone_of_voice: extractedData.tone_of_voice,
        target_audience: extractedData.target_audience,
        strategic_goals: extractedData.strategic_goals,
      });
      toast.success("Memória do cliente atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar memória.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-cs-surface to-cs-bg border border-cs-primary/30 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <BrainCircuit size={200} className="text-cs-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cs-primary/20 rounded-lg">
              <Bot size={24} className="text-cs-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white">Cérebro de IA</h3>
          </div>
          <p className="text-cs-text-secondary text-sm mb-8 max-w-2xl">
            Faça upload da gravação da reunião de Kickoff. Nossa IA irá transcrever o áudio, compreender as entrelinhas e armazenar o <strong>Tom de Voz</strong>, <strong>Público-Alvo</strong> e <strong>Objetivos</strong> permanentemente para auxiliar a equipe de produção.
          </p>

          {!isUploading && !extractedData && (
            <div 
              onClick={handleSimulateUpload}
              className="border-2 border-dashed border-cs-border hover:border-cs-primary/50 bg-cs-surface/50 hover:bg-cs-surface-hover transition-all rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-16 h-16 bg-cs-bg rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Upload size={28} className="text-cs-text-secondary group-hover:text-cs-primary" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">Upload de Kickoff (Áudio/Vídeo)</h4>
              <p className="text-cs-text-secondary text-sm text-center">
                Arraste o arquivo .mp3, .wav ou .mp4 aqui ou clique para procurar.<br/>
                (Para fins desta simulação, basta clicar para rodar o Mock).
              </p>
            </div>
          )}

          {isUploading && (
            <div className="bg-cs-surface border border-cs-border rounded-2xl p-8 flex flex-col items-center justify-center">
              <Loader2 size={40} className="text-cs-primary animate-spin mb-6" />
              <div className="w-full max-w-md bg-cs-bg rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className="bg-cs-primary h-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-white font-medium text-center">Processando... {progress}%</p>
            </div>
          )}

          {extractedData && (
            <div className="space-y-6 mt-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-green-400 font-bold">Extração Concluída</h4>
                  <p className="text-sm text-cs-text-secondary">Os seguintes parâmetros foram identificados com base na reunião.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
                  <h5 className="text-xs text-cs-text-secondary font-bold uppercase tracking-wider mb-2">Tom de Voz</h5>
                  <p className="text-sm text-white">{extractedData.tone_of_voice}</p>
                </div>
                <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
                  <h5 className="text-xs text-cs-text-secondary font-bold uppercase tracking-wider mb-2">Público-Alvo</h5>
                  <p className="text-sm text-white">{extractedData.target_audience}</p>
                </div>
                <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
                  <h5 className="text-xs text-cs-text-secondary font-bold uppercase tracking-wider mb-2">Objetivo Estratégico</h5>
                  <p className="text-sm text-white">{extractedData.strategic_goals}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setExtractedData(null)}
                  className="px-6 py-3 border border-cs-border rounded-xl text-white font-medium hover:bg-cs-surface-hover transition-colors"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleSaveToClient}
                  className="flex-1 bg-cs-primary hover:bg-cs-primary-hover text-white rounded-xl py-3 font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center justify-center gap-2"
                >
                  <Bot size={18} /> Injetar no Cérebro do Cliente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
