import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Plus, 
  Filter, 
  Search, 
  FileUp, 
  MessageSquare, 
  Sparkles,
  Download,
  Eye,
  Check,
  X,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDeliverables, useAllDeliverables } from '../hooks/useDeliverables';
import { useClients, areIdsMatching } from '../hooks/useClients';
import { useTasks } from '../hooks/useTasks';
import { cn } from '../utils/cn';
import ApprovalFlow from './ApprovalFlow';

export default function ReviewCenterHub({ onOpenClientWorkspace }) {
  const { clients } = useClients();
  const { tasks, allTasks } = useTasks();
  const { deliverables, loading, updateDeliverableStatus, addDeliverable } = useAllDeliverables();

  const [filterClient, setFilterClient] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [search, setSearch] = useState('');
  
  // Modais
  const [selectedReviewTaskId, setSelectedReviewTaskId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form novo entregável
  const [uploadClientId, setUploadClientId] = useState('');
  const [uploadTaskId, setUploadTaskId] = useState('');
  const [uploadFileType, setUploadFileType] = useState('link'); // 'link' | 'file'
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');

  const combinedTasks = allTasks || tasks || [];

  // Mapear cada entregável com sua respectiva tarefa e cliente
  const mappedDeliverables = useMemo(() => {
    return deliverables.map(deliv => {
      const isDubolaHint = (deliv.file_name || '').toLowerCase().includes('dubola') || 
                           (deliv.file_name || '').toLowerCase().includes('habanero') || 
                           (deliv.file_name || '').toLowerCase().includes('rótulo') || 
                           (deliv.file_name || '').toLowerCase().includes('molho');
      const isAlbertoHint = (deliv.file_name || '').toLowerCase().includes('alberto') || 
                            (deliv.file_name || '').toLowerCase().includes('varizes') || 
                            (deliv.file_name || '').toLowerCase().includes('laser');

      const task = combinedTasks.find(t => t.id === deliv.task_id) || {
        id: deliv.task_id,
        title: deliv.file_name || 'Demanda sem título',
        client_id: isDubolaHint ? 'client-dubola' : (isAlbertoHint ? 'client-alberto-brasil' : (deliv.client_id || 'client-alberto-brasil')),
        client_name: isDubolaHint ? 'Dubola Molhos Especiais' : (isAlbertoHint ? 'Dr. Alberto Brasil (Cirurgia Vascular)' : (deliv.client_name || 'Dr. Alberto Brasil (Cirurgia Vascular)'))
      };

      const targetClientId = deliv.client_id || task.client_id;
      const targetClientName = deliv.client_name || task.client_name || task.client?.name;

      const client = clients.find(c => areIdsMatching(c.id, targetClientId, c.name, targetClientName)) || {
        id: targetClientId || 'demo-client',
        name: targetClientName || 'Cliente Geral',
        brand_color: '#3b82f6'
      };

      return {
        ...deliv,
        task,
        client
      };
    });
  }, [deliverables, combinedTasks, clients]);

  // Filtragem
  const filteredDeliverables = useMemo(() => {
    return mappedDeliverables.filter(item => {
      const matchClient = filterClient === 'todos' || item.client?.id === filterClient || item.client?.name === filterClient;
      
      let matchStatus = true;
      if (filterStatus === 'pendente') matchStatus = item.status === 'pendente';
      else if (filterStatus === 'ajustes') matchStatus = item.status === 'ajustes' || item.status === 'reprovado' || item.status === 'com_ressalvas';
      else if (filterStatus === 'aprovado') matchStatus = item.status === 'aprovado';

      const matchSearch = search.trim() === '' || 
        item.file_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.task?.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.client?.name?.toLowerCase().includes(search.toLowerCase());

      return matchClient && matchStatus && matchSearch;
    });
  }, [mappedDeliverables, filterClient, filterStatus, search]);

  // Contadores
  const pendingCount = mappedDeliverables.filter(d => d.status === 'pendente').length;
  const adjustmentsCount = mappedDeliverables.filter(d => d.status === 'ajustes' || d.status === 'reprovado' || d.status === 'com_ressalvas').length;
  const approvedCount = mappedDeliverables.filter(d => d.status === 'aprovado').length;
  const totalCount = mappedDeliverables.length;

  const handleCopyLink = (taskId, e) => {
    if (e) e.stopPropagation();
    const link = `${window.location.origin}/aprovar/${taskId}`;
    navigator.clipboard.writeText(link);
    toast.success('🔗 Link mágico de aprovação copiado! Envie para o WhatsApp do cliente.');
  };

  const handleSaveUpload = async (e) => {
    e.preventDefault();
    if (!uploadTaskId) {
      toast.error('Selecione a tarefa / demanda correspondente.');
      return;
    }
    if (!uploadUrl.trim()) {
      toast.error('Informe o link do arquivo ou prévia.');
      return;
    }

    await addDeliverable({
      taskId: uploadTaskId,
      fileOrUrl: uploadUrl,
      fileName: uploadFileName.trim() || 'Entregável v1',
      versionNumber: 1
    });

    setShowUploadModal(false);
    setUploadUrl('');
    setUploadFileName('');
    setUploadTaskId('');
    setUploadClientId('');
  };

  const tasksForSelectedClient = useMemo(() => {
    if (!uploadClientId) return combinedTasks;
    return combinedTasks.filter(t => t.client_id === uploadClientId || t.client_name === uploadClientId || t.client?.name === uploadClientId);
  }, [combinedTasks, uploadClientId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => setFilterStatus('pendente')}
          className={cn(
            "bg-cs-surface border rounded-3xl p-6 shadow-xl cursor-pointer transition-all hover:scale-[1.02]",
            filterStatus === 'pendente' ? "border-orange-500 shadow-orange-500/10" : "border-cs-border"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={14} className="text-orange-400" /> Aguardando Cliente
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse"></span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{pendingCount}</div>
          <p className="text-[10px] text-cs-text-secondary mt-1">Materiais aguardando validação</p>
        </div>

        <div 
          onClick={() => setFilterStatus('ajustes')}
          className={cn(
            "bg-cs-surface border rounded-3xl p-6 shadow-xl cursor-pointer transition-all hover:scale-[1.02]",
            filterStatus === 'ajustes' ? "border-red-500 shadow-red-500/10" : "border-cs-border"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-400" /> Ajustes Solicitados
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{adjustmentsCount}</div>
          <p className="text-[10px] text-cs-text-secondary mt-1">Peças que exigem refação da equipe</p>
        </div>

        <div 
          onClick={() => setFilterStatus('aprovado')}
          className={cn(
            "bg-cs-surface border rounded-3xl p-6 shadow-xl cursor-pointer transition-all hover:scale-[1.02]",
            filterStatus === 'aprovado' ? "border-green-500 shadow-green-500/10" : "border-cs-border"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-400" /> Aprovados
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{approvedCount}</div>
          <p className="text-[10px] text-cs-text-secondary mt-1">Prontos para postagem ou disparo</p>
        </div>

        <div 
          onClick={() => setFilterStatus('todos')}
          className={cn(
            "bg-cs-surface border rounded-3xl p-6 shadow-xl cursor-pointer transition-all hover:scale-[1.02]",
            filterStatus === 'todos' ? "border-cs-primary shadow-cs-primary/10" : "border-cs-border"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-cs-primary uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} className="text-cs-primary" /> Total de Entregáveis
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalCount}</div>
          <p className="text-[10px] text-cs-text-secondary mt-1">Peças registradas no Review Center</p>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cs-surface border border-cs-border rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Client Filter */}
          <div className="flex items-center gap-2 bg-cs-bg border border-cs-border px-3 py-2 rounded-xl text-xs">
            <Filter size={13} className="text-cs-text-secondary" />
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-bold"
            >
              <option value="todos" className="bg-cs-bg">Todos os Clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-cs-bg">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-cs-bg border border-cs-border px-3 py-2 rounded-xl text-xs">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-bold"
            >
              <option value="todos" className="bg-cs-bg">Todos os Status</option>
              <option value="pendente" className="bg-cs-bg">Aguardando Cliente ({pendingCount})</option>
              <option value="ajustes" className="bg-cs-bg">Ajustes Solicitados ({adjustmentsCount})</option>
              <option value="aprovado" className="bg-cs-bg">Aprovados ({approvedCount})</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cs-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar peça, cliente ou demanda..."
              className="w-full bg-cs-bg border border-cs-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cs-primary placeholder:text-cs-text-secondary"
            />
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-cs-primary hover:bg-cs-primary-hover text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <FileUp size={15} />
          Enviar Nova Peça para Revisão
        </button>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDeliverables.map(deliv => {
          const isPending = deliv.status === 'pendente';
          const isApproved = deliv.status === 'aprovado';
          const isAdjust = deliv.status === 'ajustes' || deliv.status === 'reprovado' || deliv.status === 'com_ressalvas';

          return (
            <div 
              key={deliv.id}
              className="bg-cs-surface border border-cs-border rounded-3xl overflow-hidden shadow-lg hover:border-cs-primary/40 transition-all flex flex-col group"
            >
              {/* Preview Thumbnail */}
              <div className="aspect-video bg-cs-bg relative overflow-hidden flex items-center justify-center">
                {deliv.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || deliv.file_url?.includes('unsplash') ? (
                  <img 
                    src={deliv.file_url} 
                    alt={deliv.file_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="p-6 text-center">
                    <FolderOpen size={40} className="mx-auto text-cs-primary/40 mb-2" />
                    <p className="text-[10px] text-cs-text-secondary truncate max-w-[200px]">{deliv.file_name}</p>
                  </div>
                )}

                {/* Status Badge Over Image */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-lg border backdrop-blur-md",
                    isApproved ? "bg-green-500/90 text-black border-green-400" :
                    isAdjust ? "bg-red-500/90 text-white border-red-400" :
                    "bg-orange-500/90 text-black border-orange-400 font-black animate-pulse"
                  )}>
                    {isApproved ? 'Aprovado' : isAdjust ? 'Ajustes' : 'Pendente'}
                  </span>
                </div>

                {/* Version Tag */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/70 text-white border border-white/10 uppercase tracking-widest backdrop-blur-md">
                    v{deliv.version_number || 1}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: deliv.client?.brand_color || '#3b82f6' }}
                    />
                    <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest truncate">
                      {deliv.client?.name}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1 group-hover:text-cs-primary transition-colors">
                    {deliv.task?.title || deliv.file_name}
                  </h4>
                  <p className="text-[10px] text-cs-text-secondary truncate">{deliv.file_name}</p>

                  {/* Feedback Box if adjustments or notes */}
                  {deliv.client_comment && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <MessageSquare size={10} /> Feedback do Cliente:
                      </p>
                      <p className="text-xs text-red-300 line-clamp-2 italic">
                        "{deliv.client_comment}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-cs-border/60 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyLink(deliv.task?.id || deliv.task_id)}
                      className="w-full bg-cs-bg border border-cs-border hover:border-cs-primary/50 text-white hover:text-cs-primary py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                      title="Copiar link público para o cliente aprovar no WhatsApp"
                    >
                      <Copy size={12} /> Link Mágico
                    </button>

                    <button
                      onClick={() => setSelectedReviewTaskId(deliv.task?.id || deliv.task_id)}
                      className="w-full bg-cs-primary/10 border border-cs-primary/30 hover:bg-cs-primary/20 text-cs-primary py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye size={12} /> Revisar
                    </button>
                  </div>

                  {/* Quick Decision / Hub Jump */}
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateDeliverableStatus(deliv.id, deliv.task?.id || deliv.task_id, 'aprovado')}
                          className="text-green-400 hover:text-green-300 font-bold flex items-center gap-1 cursor-pointer"
                          title="Aprovação rápida direta da agência"
                        >
                          <Check size={12} /> Aprovar
                        </button>
                        <span className="text-cs-border">|</span>
                        <button
                          onClick={() => {
                            const note = prompt('Qual o motivo do ajuste?');
                            if (note) updateDeliverableStatus(deliv.id, deliv.task?.id || deliv.task_id, 'ajustes', note);
                          }}
                          className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X size={12} /> Pedir Ajuste
                        </button>
                      </div>
                    )}

                    {onOpenClientWorkspace && (
                      <button
                        onClick={() => onOpenClientWorkspace(deliv.client, 'approvals')}
                        className="text-cs-text-secondary hover:text-white flex items-center gap-1 ml-auto font-medium transition-colors"
                      >
                        Abrir Hub <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDeliverables.length === 0 && (
          <div className="col-span-full py-20 text-center bg-cs-surface border border-cs-border rounded-3xl border-dashed">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-cs-primary/30" />
            <h4 className="text-white font-bold text-sm">Nenhum entregável encontrado</h4>
            <p className="text-xs text-cs-text-secondary mt-1">Experimente trocar os filtros ou envie uma nova peça para revisão.</p>
          </div>
        )}
      </div>

      {/* Modal de Revisão Completa (ApprovalFlow) */}
      {selectedReviewTaskId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedReviewTaskId(null)}>
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-cs-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-cs-primary" />
                  Review Center • Gestão de Versões & Aprovações
                </h3>
                <p className="text-xs text-cs-text-secondary">Envie novas versões, aprove ou solicite ajustes diretamente.</p>
              </div>
              <button 
                onClick={() => setSelectedReviewTaskId(null)}
                className="p-2 text-cs-text-secondary hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-2">
              <ApprovalFlow 
                taskId={selectedReviewTaskId} 
                userRole="agency" 
                userId="agency-admin" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Enviar Nova Peça */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-cs-border pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp size={20} className="text-cs-primary" />
                Enviar Nova Peça para Revisão
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-cs-text-secondary hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Cliente</label>
                <select
                  value={uploadClientId}
                  onChange={e => {
                    setUploadClientId(e.target.value);
                    setUploadTaskId('');
                  }}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                  required
                >
                  <option value="">Selecione o Cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Tarefa / Demanda Vinculada</label>
                <select
                  value={uploadTaskId}
                  onChange={e => setUploadTaskId(e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                  required
                >
                  <option value="">Selecione a Demanda...</option>
                  {tasksForSelectedClient.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Nome do Arquivo / Título da Peça</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  placeholder="Ex: Post_DiaDasMaes_v1.png ou Carrossel 01"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Link do Arquivo (Figma, Drive, Imagem)</label>
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={e => setUploadUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... ou link do Figma/Drive"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-cs-primary hover:bg-cs-primary-hover text-black font-bold py-3.5 rounded-xl text-xs transition-all shadow-xl shadow-cs-primary/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <FileUp size={16} /> Enviar Peça para o Review Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
