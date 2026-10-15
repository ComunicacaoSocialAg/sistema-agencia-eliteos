import { useState, useEffect } from 'react';
import { 
  FileUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Globe,
  Mic,
  MicOff
} from 'lucide-react';
import { useDeliverables } from '../hooks/useDeliverables';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function ApprovalFlow({ taskId, userRole, userId }) {
  const { versions, loading, fetchVersions, uploadVersion, updateStatus } = useDeliverables(taskId);
  const [showCommentForm, setShowCommentForm] = useState(null); // versionId
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    await uploadVersion(file, userId);
    setIsUploading(false);
  };

  const handleReview = async (versionId, status) => {
    if ((status === 'reprovado' || status === 'com_ressalvas') && !comment.trim()) {
      toast.error('O comentário é obrigatório para reprovações ou ressalvas.');
      return;
    }
    await updateStatus(versionId, status, comment, userId);
    setShowCommentForm(null);
    setComment('');
  };

  const isAgency = ['admin', 'production'].includes(userRole);
  const isClient = userRole === 'client';

  return (
    <div className="space-y-6">
      {/* Upload Section (Agency Only) */}
      {isAgency && (
        <div className="flex flex-col gap-4">
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FileUp size={16} className="text-cs-primary" />
              Enviar para Aprovação
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opção 1: Link */}
              <div className="bg-cs-bg border border-cs-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Opção 1: Link Externo</span>
                  <input 
                    type="url" 
                    placeholder="Cole o link do Figma, Drive, Vercel..."
                    className="w-full bg-cs-surface border border-cs-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary mb-3"
                    id="link-upload"
                  />
                </div>
                <button 
                  onClick={async () => {
                    const input = document.getElementById('link-upload');
                    if (!input.value) return;
                    setIsUploading(true);
                    await uploadVersion(input.value, userId);
                    input.value = '';
                    setIsUploading(false);
                  }}
                  disabled={isUploading}
                  className="w-full py-2 bg-cs-primary/10 hover:bg-cs-primary/20 text-cs-primary rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'ENVIANDO...' : 'ENVIAR LINK'}
                </button>
              </div>

              {/* Opção 2: Arquivo */}
              <div className="bg-cs-bg border border-cs-border border-dashed rounded-xl p-4 flex flex-col items-center justify-center relative hover:border-cs-primary/50 transition-colors group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileUpload} 
                  disabled={isUploading} 
                />
                <div className="p-2 bg-cs-surface rounded-full group-hover:bg-cs-primary/10 transition-colors mb-2">
                  <FileUp className="text-cs-text-secondary group-hover:text-cs-primary transition-colors" size={20} />
                </div>
                <span className="text-xs text-white font-medium">Upload de Arquivo</span>
                <span className="text-[10px] text-cs-text-secondary mt-1">Imagens, PDFs ou Vídeos</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              const url = `${window.location.origin}/aprovar/${taskId}`;
              navigator.clipboard.writeText(url);
              alert('Link de aprovação copiado!');
            }}
            className="w-full py-3 bg-cs-bg border border-cs-primary/30 hover:border-cs-primary hover:bg-cs-primary/5 text-cs-primary hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
          >
            <Globe size={14} className="group-hover:animate-spin" /> GERAR LINK DE APROVAÇÃO EXTERNA
          </button>
        </div>
      )}

      {/* Timeline Section */}
      <div className="space-y-4">
        {versions.length === 0 ? (
          <div className="text-center py-12 border border-cs-border rounded-xl bg-cs-surface/30">
            <Clock className="mx-auto text-cs-text-secondary opacity-20 mb-3" size={48} />
            <p className="text-cs-text-secondary text-sm">Nenhum arquivo enviado para aprovação ainda.</p>
          </div>
        ) : (
          versions.map((v, idx) => (
            <div key={v.id} className="relative pl-8 pb-4 group last:pb-0">
              {/* Vertical line connector */}
              {idx !== versions.length - 1 && (
                <div className="absolute left-[11px] top-[24px] bottom-0 w-[2px] bg-cs-border" />
              )}
              
              {/* Status Dot */}
              <div className={cn(
                "absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-cs-bg flex items-center justify-center z-10",
                v.status === 'aprovado' ? "bg-green-500 text-white" :
                v.status === 'reprovado' ? "bg-red-500 text-white" :
                v.status === 'com_ressalvas' ? "bg-yellow-500 text-white" :
                "bg-cs-border text-cs-text-secondary"
              )}>
                {v.status === 'aprovado' ? <CheckCircle2 size={12} /> :
                 v.status === 'reprovado' ? <XCircle size={12} /> :
                 v.status === 'com_ressalvas' ? <AlertCircle size={12} /> :
                 <Clock size={12} />}
              </div>

              <div className="bg-cs-surface border border-cs-border rounded-xl overflow-hidden shadow-sm hover:border-cs-primary/30 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm">Versão {v.version_number}</h4>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-md font-bold uppercase border",
                          v.version_number === 1 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          v.version_number <= 3 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {v.version_number === 1 ? 'Entrega Original' :
                           v.version_number === 2 ? '1ª Rodada de Ajustes' :
                           v.version_number === 3 ? '2ª Rodada de Ajustes' :
                           `Ajuste Excedente (${v.version_number}ª rodada)`}
                        </span>
                      </div>
                      <p className="text-[10px] text-cs-text-secondary">
                        {format(new Date(v.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border",
                      v.status === 'aprovado' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      v.status === 'reprovado' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      v.status === 'com_ressalvas' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-cs-bg text-cs-text-secondary border-cs-border"
                    )}>
                      {v.status === 'pendente' ? 'Aguardando' : v.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* File Preview/Link */}
                  <div className="bg-cs-bg rounded-lg p-3 flex items-center justify-between group/file">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-cs-surface rounded-lg">
                        <FileUp size={16} className="text-cs-primary" />
                      </div>
                      <span className="text-xs text-white truncate font-medium">{v.file_name}</span>
                    </div>
                    <a 
                      href={v.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1.5 text-cs-text-secondary hover:text-cs-primary transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>

                  {/* Client Feedback */}
                  {v.client_comment && (
                    <div className="mt-3 p-3 bg-cs-bg border-l-2 border-cs-primary rounded-r-lg">
                      <p className="text-[10px] font-bold text-cs-primary uppercase mb-1 flex items-center gap-1">
                        <MessageSquare size={10} /> Feedback do Cliente
                      </p>
                      <p className="text-xs text-white leading-relaxed">{v.client_comment}</p>
                    </div>
                  )}

                  {/* Actions (Client Only & Pending) */}
                  {isClient && v.status === 'pendente' && (
                    <div className="mt-4 pt-4 border-t border-cs-border">
                      {showCommentForm === v.id ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <div className="relative">
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Escreva seu comentário ou use o microfone para ditar..."
                              className="w-full bg-cs-bg border border-cs-border rounded-lg p-3 pr-12 text-xs text-white focus:outline-none focus:border-cs-primary resize-none h-20"
                            />
                            <button
                              onClick={() => {
                                if (isRecording) {
                                  window.__speechRecognition?.stop();
                                  setIsRecording(false);
                                } else {
                                  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                  if (!SpeechRecognition) {
                                    alert('Seu navegador não suporta digitação por voz. Use o Google Chrome.');
                                    return;
                                  }
                                  const recognition = new SpeechRecognition();
                                  recognition.lang = 'pt-BR';
                                  recognition.continuous = true;
                                  recognition.interimResults = true;
                                  
                                  recognition.onstart = () => setIsRecording(true);
                                  recognition.onresult = (e) => {
                                    let finalTranscript = '';
                                    for (let i = e.resultIndex; i < e.results.length; ++i) {
                                      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
                                    }
                                    if (finalTranscript) setComment(prev => prev + finalTranscript);
                                  };
                                  recognition.onend = () => setIsRecording(false);
                                  recognition.onerror = () => setIsRecording(false);
                                  
                                  window.__speechRecognition = recognition;
                                  recognition.start();
                                }
                              }}
                              className={cn(
                                "absolute right-3 bottom-3 p-2 rounded-lg transition-all",
                                isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-cs-surface hover:bg-cs-primary/20 text-cs-text-secondary hover:text-cs-primary"
                              )}
                              title={isRecording ? "Parar gravação" : "Ditar alterações por voz (IA)"}
                            >
                              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                          </div>
                          {isRecording && <p className="text-[10px] text-red-400 animate-pulse">🎤 Ouvindo suas alterações... fale naturalmente.</p>}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleReview(v.id, 'reprovado')}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 rounded-lg"
                            >
                              CONFIRMAR REPROVAÇÃO
                            </button>
                            <button 
                              onClick={() => handleReview(v.id, 'com_ressalvas')}
                              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold py-2 rounded-lg"
                            >
                              APROVAR COM RESSALVAS
                            </button>
                            <button 
                              onClick={() => { setShowCommentForm(null); setComment(''); setIsRecording(false); window.__speechRecognition?.stop(); }}
                              className="px-3 bg-cs-bg border border-cs-border text-cs-text-secondary text-[10px] font-bold rounded-lg"
                            >
                              CANCELAR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleReview(v.id, 'aprovado')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={14} /> APROVAR AGORA
                          </button>
                          <button 
                            onClick={() => setShowCommentForm(v.id)}
                            className="flex-1 bg-cs-bg border border-cs-border hover:border-red-500/50 text-white text-[10px] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle size={14} /> REPROVAR / AJUSTES
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
