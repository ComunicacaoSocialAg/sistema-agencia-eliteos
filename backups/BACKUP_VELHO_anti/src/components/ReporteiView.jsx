import { useState } from 'react';
import { 
  BarChart2, 
  ExternalLink, 
  RefreshCw, 
  FileText,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function ReporteiView({ client, reportConfig }) {
  const [loading, setLoading] = useState(false);
  const reportUrl = reportConfig?.report_url || '';

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Relatórios de Performance</h3>
          <p className="text-xs text-cs-text-secondary uppercase tracking-widest font-bold">Powered by Reportei API</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-cs-surface border border-cs-border text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:bg-cs-surface-hover">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> ATUALIZAR DADOS
          </button>
          {reportUrl && (
            <a 
              href={reportUrl} 
              target="_blank" 
              rel="noreferrer"
              className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cs-primary/20"
            >
              <ExternalLink size={14} /> ABRIR EXTERNO
            </a>
          )}
        </div>
      </div>

      {/* Insight da IA sobre o Relatório */}
      <div className="bg-gradient-to-br from-cs-primary/20 to-cs-bg border border-cs-primary/30 rounded-2xl p-6 relative overflow-hidden group">
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cs-primary flex items-center justify-center shrink-0 shadow-lg shadow-cs-primary/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Análise do Co-piloto IA</h4>
            <p className="text-xs text-cs-text-secondary leading-relaxed">
              Com base nos dados do Reportei, notei que o custo por clique (CPC) no Facebook Ads caiu 12% em relação ao mês anterior, enquanto o engajamento no Instagram subiu. Recomendo manter a estratégia de vídeos curtos (Reels).
            </p>
          </div>
        </div>
      </div>

      {/* Report Iframe or Placeholder */}
      <div className="flex-1 bg-cs-surface border border-cs-border rounded-2xl overflow-hidden min-h-[600px] relative group">
        {reportUrl ? (
          <iframe 
            src={reportUrl} 
            className="w-full h-full border-none opacity-90 group-hover:opacity-100 transition-opacity"
            title="Reportei View"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-cs-bg rounded-2xl flex items-center justify-center mb-4 text-cs-text-secondary border border-cs-border">
              <BarChart2 size={32} />
            </div>
            <h4 className="text-white font-bold mb-2">Nenhum relatório vinculado</h4>
            <p className="text-xs text-cs-text-secondary max-w-xs mb-6">
              Vincule o link do Relatório Web do Reportei nas configurações deste cliente para visualizá-lo aqui.
            </p>
            {!reportConfig && (
               <button className="bg-cs-bg border border-cs-border hover:border-cs-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all">
                CONFIGURAR AGORA
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
