import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, 
  Target, 
  Activity, 
  MoreVertical, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Trash2,
  Shield,
  Mail,
  UserCheck
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useClients } from '../hooks/useClients';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS = {
  'backlog': 'Backlog',
  'briefing': 'Briefing',
  'em-producao': 'Produção',
  'revisao-interna': 'Revisão',
  'aguardando-cliente': 'Cliente',
  'ajustes': 'Ajustes',
  'finalizado': 'Concluído'
};

const STATUS_COLORS = {
  'backlog': 'bg-zinc-500',
  'briefing': 'bg-blue-500',
  'em-producao': 'bg-purple-500',
  'revisao-interna': 'bg-orange-500',
  'aguardando-cliente': 'bg-yellow-500',
  'ajustes': 'bg-red-500',
  'finalizado': 'bg-green-500'
};

import { useProfitability } from '../hooks/useProfitability';
import { useIntelligence } from '../hooks/useIntelligence';

export default function ManagementView() {
  const { tasks } = useTasks();
  const { clients } = useClients();
  const { data: profitability = [] } = useProfitability();
  const { healthScores, capacity } = useIntelligence();
  const { allUsers, createUser, deleteUser } = useAuth();
  const [searchMember, setSearchMember] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'production', client_id: '' });

  // 1. Team Load Calculation (Now using real capacity data)
  const teamLoad = useMemo(() => {
    return capacity;
  }, [capacity]);

  // 2. Project Distribution
  const statusDistribution = useMemo(() => {
    const dist = {};
    tasks.forEach(t => {
      dist[t.status] = (dist[t.status] || 0) + 1;
    });
    return dist;
  }, [tasks]);

  // 3. Profitability (Agency Global) - Using real hook data
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((acc, c) => acc + (c.monthly_fee || 0), 0);
    const totalProfit = profitability.reduce((acc, p) => acc + (p.profit || 0), 0);
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, netProfit: totalProfit, margin };
  }, [clients, profitability]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    await createUser(newUser);
    toast.success(`Usuário criado! Convite enviado para ${newUser.email}`);
    setNewUser({ name: '', email: '', role: 'production', client_id: '' });
    setShowAddUserModal(false);
  };

  const handleSendInvite = (email) => {
    toast.success(`Convite de acesso reenviado para ${email}`);
  };

  return (
    <div className="h-full flex flex-col bg-cs-bg p-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Painel de Gestão 360</h2>
          <p className="text-cs-text-secondary">Visão estratégica da operação, equipe e rentabilidade global.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'dashboard' 
                ? "bg-cs-primary text-black font-bold" 
                : "bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-white"
            )}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'users' 
                ? "bg-cs-primary text-black font-bold" 
                : "bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-white"
            )}
          >
            Usuários e Acessos
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Briefcase size={18} className="text-blue-400" /></div>
                <span className="text-xs text-cs-text-secondary font-medium">Fee Total Mensal</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
              </div>
              <p className="text-[10px] text-cs-text-secondary mt-1">Soma de todos os contratos ativos</p>
            </div>

            <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Activity size={18} className="text-purple-400" /></div>
                <span className="text-xs text-cs-text-secondary font-medium">Efficiency Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">88.5%</div>
              <p className="text-[10px] text-green-400 mt-1">↑ 4% em relação ao mês anterior</p>
            </div>

            <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg"><TrendingUp size={18} className="text-green-400" /></div>
                <span className="text-xs text-cs-text-secondary font-medium">Margem Líquida</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.margin.toFixed(1)}%</div>
              <div className="w-full bg-cs-bg h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${stats.margin}%` }}></div>
              </div>
            </div>

            <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg"><AlertCircle size={18} className="text-orange-400" /></div>
                <span className="text-xs text-cs-text-secondary font-medium">Gargalos Ativos</span>
              </div>
              <div className="text-2xl font-bold text-white">{statusDistribution['aguardando-cliente'] || 0}</div>
              <p className="text-[10px] text-cs-text-secondary mt-1">Jobs parados no cliente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resource Management (Team Load) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users size={20} className="text-cs-primary" /> 
                    Ocupação da Equipe
                  </h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cs-text-secondary" />
                    <input 
                      type="text" 
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      placeholder="Filtrar colaborador..."
                      className="bg-cs-bg border border-cs-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-cs-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(teamLoad || [])
                    .filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase()))
                    .map(member => (
                    <div key={member.name} className="bg-cs-bg/50 border border-cs-border rounded-xl p-4 group hover:border-cs-primary transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cs-surface flex items-center justify-center font-bold text-cs-primary border border-cs-border group-hover:scale-105 transition-transform">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">{member.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-cs-text-secondary">{member.tasksCount} ativos</span>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-bold border",
                          member.load7d > 80 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          member.load7d > 50 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          {member.load7d}% LOAD
                        </div>
                      </div>
                      
                      <div className="w-full h-1.5 bg-cs-surface rounded-full overflow-hidden mb-3">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            member.load7d > 80 ? "bg-red-500" : member.load7d > 50 ? "bg-yellow-500" : "bg-green-500"
                          )} 
                          style={{ width: `${Math.min(member.load7d, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] text-cs-text-secondary uppercase font-bold">Capacidade Semanal</span>
                        <span className="text-[10px] text-white font-mono">{Math.max(40 - (member.tasksCount * 4), 0)}h livres</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Process & Bottlenecks */}
            <div className="space-y-6">
              <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-yellow-400" />
                  Gargalos de Processo
                </h3>
                <div className="space-y-4">
                  {Object.keys(STATUS_LABELS).map(status => {
                    const count = statusDistribution[status] || 0;
                    const percentage = (count / tasks.length) * 100;
                    return (
                      <div key={status} className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-cs-text-secondary group-hover:text-white transition-colors">{STATUS_LABELS[status]}</span>
                          <span className="text-white font-medium">{count} items</span>
                        </div>
                        <div className="w-full h-2 bg-cs-bg rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000", STATUS_COLORS[status])} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-cs-primary/20 to-transparent border border-cs-primary/30 rounded-2xl p-6 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-cs-primary" /> Insights de Gestão
                  </h4>
                  <p className="text-sm text-cs-text-secondary leading-relaxed">
                    {statusDistribution['aguardando-cliente'] > 3 
                      ? "Você tem muitos itens parados no cliente. Sugerimos agendar uma reunião de alinhamento."
                      : "O fluxo de produção está saudável. Capacidade para novos projetos detectada."}
                  </p>
                  <button className="mt-4 text-xs text-cs-primary font-bold hover:underline">VER MAIS INSIGHTS</button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Activity size={100} className="text-cs-primary" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Users Management View */
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck size={20} className="text-cs-primary" />
                Usuários Cadastrados
              </h3>
              <p className="text-xs text-cs-text-secondary mt-0.5">Gerenciamento completo de acessos e permissões da agência.</p>
            </div>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="bg-cs-primary text-black font-bold px-4 py-2 rounded-lg text-xs hover:bg-opacity-95 transition-colors flex items-center gap-2 shadow-lg shadow-cs-primary/10"
            >
              <Plus size={14} /> Novo Usuário
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-cs-border text-cs-text-secondary text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail corporativo</th>
                  <th className="py-3 px-4">Nível de Acesso</th>
                  <th className="py-3 px-4">Associação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cs-border">
                {allUsers.map(u => {
                  const associatedClient = clients.find(c => c.id === u.client_id);
                  return (
                    <tr key={u.id} className="hover:bg-cs-bg/35 transition-colors group">
                      <td className="py-4 px-4 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cs-bg border border-cs-border flex items-center justify-center font-bold text-cs-primary text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="py-4 px-4 text-cs-text-secondary text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="opacity-75" />
                          {u.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-bold border inline-flex items-center gap-1",
                          u.role === 'admin' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          u.role === 'commercial' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          u.role === 'client' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          <Shield size={10} />
                          {u.roleTitle}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-cs-text-secondary text-xs">
                        {u.role === 'client' ? (
                          associatedClient ? (
                            <span className="text-white font-medium">{associatedClient.name}</span>
                          ) : (
                            <span className="text-red-400/80">Sem cliente vinculado</span>
                          )
                        ) : (
                          <span className="opacity-50">Corporativo (Agência)</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleSendInvite(u.email)}
                            className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-primary hover:bg-cs-primary/10 transition-colors shrink-0"
                            title="Reenviar Convite"
                          >
                            <Mail size={14} />
                          </button>
                          <button 
                            onClick={() => deleteUser(u.id)}
                            disabled={u.id === 'demo-admin' || u.id === 'demo-commercial'}
                            className={cn(
                              "p-1.5 rounded-lg text-cs-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0",
                              (u.id === 'demo-admin' || u.id === 'demo-commercial') && "opacity-20 cursor-not-allowed"
                            )}
                            title="Excluir usuário"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-cs-border flex justify-between items-center bg-cs-bg/30">
              <h3 className="font-bold text-white text-lg">Cadastrar Novo Usuário</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-cs-text-secondary hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-cs-text-secondary uppercase mb-1.5">Nome do Usuário</label>
                <input 
                  type="text"
                  required
                  value={newUser.name}
                  onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo do usuário"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cs-text-secondary uppercase mb-1.5">E-mail corporativo</label>
                <input 
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemplo@csag.com.br"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cs-text-secondary uppercase mb-1.5">Nível de Acesso (Cargo)</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value, client_id: e.target.value === 'client' ? prev.client_id : '' }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary transition-colors"
                >
                  <option value="admin">Sócio-Diretor (Acesso Total)</option>
                  <option value="commercial">Comercial (CRM e Atendimento)</option>
                  <option value="production">Especialista (Criação e Produção)</option>
                  <option value="client">Cliente (Apenas Portal do Cliente)</option>
                </select>
              </div>

              {newUser.role === 'client' && (
                <div>
                  <label className="block text-xs font-bold text-cs-text-secondary uppercase mb-1.5">Associar a Cliente</label>
                  <select
                    required
                    value={newUser.client_id}
                    onChange={e => setNewUser(prev => ({ ...prev, client_id: e.target.value }))}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary transition-colors"
                  >
                    <option value="">Selecione uma conta...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-transparent hover:bg-cs-bg border border-cs-border text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cs-primary hover:bg-opacity-95 text-black text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

