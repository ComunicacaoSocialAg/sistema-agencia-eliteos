import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Target, 
  DollarSign, 
  Mail, 
  Phone, 
  Folder, 
  ExternalLink, 
  X,
  MoreHorizontal,
  Edit3
} from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useIntelligence } from '../hooks/useIntelligence';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { cn } from '../utils/cn';
import ClientWorkspace from '../components/ClientWorkspace';

const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
};

const STATUS_LABELS = {
  active: 'ATIVO',
  inactive: 'INATIVO',
  pending: 'PENDENTE'
};

function ClientCard({ client, onClick, score }) {
  return (
    <div 
      onClick={onClick}
      className="bg-cs-surface border border-cs-border rounded-2xl p-5 hover:border-cs-primary/50 transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Users size={80} />
      </div>
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${client.brand_color}cc, ${client.brand_color}44)` }}>
          {client.name.charAt(0)}
        </div>
        <div className="text-right">
          <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 inline-block", STATUS_COLORS[client.status])}>
            {STATUS_LABELS[client.status]}
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <div className={cn("w-1.5 h-1.5 rounded-full", score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500")} />
            <span className="text-[10px] text-cs-text-secondary font-bold tracking-widest uppercase">Health: {score || 0}%</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white group-hover:text-cs-primary transition-colors truncate">{client.name}</h3>
        <p className="text-xs text-cs-text-secondary mb-4 truncate">{client.contact_name || 'Sem contato'}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-cs-border/50">
          <div>
            <p className="text-[9px] text-cs-text-secondary font-bold uppercase tracking-widest">Fee Mensal</p>
            <p className="text-sm font-bold text-white">R$ {client.monthly_fee?.toLocaleString()}</p>
          </div>
          <button className="p-2 bg-cs-bg rounded-lg text-cs-text-secondary group-hover:text-cs-primary transition-colors border border-cs-border group-hover:border-cs-primary/30">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', contact_name: '', monthly_fee: '', contact_email: '', contact_phone: '', drive_url: '', notes: '' });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50">
          <h3 className="text-lg font-bold text-white">Cadastrar Novo Cliente</h3>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Nome da Agência / Cliente</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Ponto Cor" autoFocus
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cs-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Contato Principal</label>
              <input type="text" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Fernando"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cs-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Fee Mensal (R$)</label>
              <input type="number" value={form.monthly_fee} onChange={e => set('monthly_fee', e.target.value)} placeholder="15000"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cs-primary" />
            </div>
          </div>
          <button 
            onClick={() => { onSave(form); onClose(); }}
            className="w-full bg-cs-primary hover:bg-cs-primary-hover text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-cs-primary/20"
          >
            CONFIRMAR CADASTRO
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsView() {
  const { clients, loading, totalMRR, createClient } = useClients();
  const { healthScores, capacity } = useIntelligence();
  const { setContext } = useAIAssistant();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    setContext({
      module: 'clientes',
      title: 'Clientes & Projetos',
      data: {
        total_clientes: clients.length,
        clientes_ativos: clients.filter(c => c.status === 'active').length,
        mrr_total: totalMRR,
      },
    });
  }, [clients, totalMRR, setContext]);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedClient) {
    return (
      <ClientWorkspace 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)} 
      />
    );
  }

  if (loading && clients.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-cs-bg">
        <div className="w-10 h-10 border-4 border-cs-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-cs-bg overflow-y-auto custom-scrollbar">
      <div className="p-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Clientes & Projetos</h2>
            <p className="text-sm text-cs-text-secondary">{clients.filter(c => c.status === 'active').length} contas sob gestão ativa.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-cs-primary/20 flex items-center gap-2">
            <Plus size={18} /> NOVO CLIENTE
          </button>
        </div>

        {/* Capacity Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-cs-surface border border-cs-border rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Target size={14} className="text-cs-primary" /> Previsão de Carga da Equipe (7 dias)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(capacity || []).slice(0,3).map(member => (
                <div key={member.name} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white font-bold uppercase">{member.name}</span>
                    <span className={cn(
                      "font-bold",
                      member.load7d > 90 ? "text-red-400" : member.load7d > 70 ? "text-yellow-400" : "text-green-400"
                    )}>{member.load7d}%</span>
                  </div>
                  <div className="h-2 bg-cs-bg rounded-full overflow-hidden border border-cs-border">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        member.load7d > 90 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : member.load7d > 70 ? "bg-yellow-500" : "bg-cs-primary"
                      )} 
                      style={{ width: `${Math.min(member.load7d, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cs-surface to-cs-bg border border-cs-border rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-green-400" />
              <span className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest">Receita Recorrente (MRR)</span>
            </div>
            <div className="text-3xl font-black text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalMRR)}
            </div>
            <div className="text-[10px] text-green-400 mt-1 font-bold">▲ 12.5% vs mês anterior</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cs-text-secondary" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar por nome do cliente ou contato..."
            className="w-full bg-cs-surface border border-cs-border rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-cs-primary transition-all placeholder:text-cs-text-secondary/50 shadow-inner" />
        </div>
      </div>

      <div className="flex-1 px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onClick={() => setSelectedClient(client)} 
              score={healthScores[client.id] || 0}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-24 bg-cs-surface border border-cs-border rounded-3xl border-dashed">
              <Users size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-cs-text-secondary font-medium uppercase tracking-widest text-xs">Nenhum cliente na lista</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewClientModal onClose={() => setShowModal(false)} onSave={createClient} />
      )}
    </div>
  );
}
