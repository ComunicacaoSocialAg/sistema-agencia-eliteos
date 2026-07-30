import { useState } from 'react';
import { 
  FileText, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function MeetingMinutes({ clientId }) {
  const [minutes, setMinutes] = useState([
    {
      id: 1,
      title: 'Alinhamento Mensal - Estratégia Outono',
      date: '2024-05-02',
      participants: ['Bruno (Agência)', 'Ana (Ponto Cor)'],
      summary: 'Revisão dos resultados de Abril e planejamento da campanha de Dia dos Namorados.',
      decisions: [
        'Aumentar verba em 15% no Meta Ads',
        'Focar em Reels para o público jovem',
        'Novo ensaio fotográfico dia 15/05'
      ],
      nextSteps: ['Criar Campanha Meta', 'Agendar Fotógrafo']
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Central de Alinhamento</h3>
          <p className="text-xs text-cs-text-secondary uppercase tracking-widest font-bold">Histórico de Decisões e Atas</p>
        </div>
        <button className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cs-primary/20">
          <Plus size={14} /> NOVA ATA
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {minutes.map((m) => (
          <div key={m.id} className="bg-cs-surface border border-cs-border rounded-2xl p-6 hover:border-cs-primary/40 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cs-bg rounded-xl flex items-center justify-center text-cs-primary border border-cs-border group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold group-hover:text-cs-primary transition-colors">{m.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-cs-text-secondary font-bold uppercase">
                      <Calendar size={12} /> {m.date}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-cs-text-secondary font-bold uppercase">
                      <Users size={12} /> {m.participants.length} Participantes
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-cs-text-secondary hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="bg-cs-bg/50 border border-cs-border rounded-xl p-4 mb-4">
              <p className="text-xs text-cs-text-secondary leading-relaxed italic">"{m.summary}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-green-400" /> Decisões Tomadas
                </h5>
                <ul className="space-y-2">
                  {m.decisions.map((d, i) => (
                    <li key={i} className="text-xs text-cs-text-primary flex items-start gap-2">
                      <span className="w-1 h-1 bg-cs-primary rounded-full mt-1.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare size={12} className="text-cs-primary" /> Próximos Passos
                </h5>
                <div className="flex flex-wrap gap-2">
                  {m.nextSteps.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-cs-surface border border-cs-border rounded-lg text-[10px] font-bold text-cs-text-secondary group-hover:text-cs-primary transition-colors">
                      {s.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
