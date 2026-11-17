import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { useDeliverables, copyApprovalUrl, openApprovalAsset } from '../hooks/useDeliverables';

const labels = {
  pendente: 'Aguardando decisão', aprovado: 'Aprovada',
  reprovado: 'Ajustes solicitados', ajustes: 'Ajustes solicitados', com_ressalvas: 'Ajustes solicitados',
};
const field = 'w-full rounded-lg border border-cs-border bg-cs-bg px-3 py-2 text-sm text-white focus-visible:outline-cs-primary';
const button = 'rounded-lg border border-cs-border px-3 py-2 text-sm text-white hover:bg-cs-surface-hover focus-visible:outline-cs-primary disabled:opacity-50';

export default function ApprovalFlow({ taskId }) {
  const { versions, loading, error, refresh, uploadVersion, updateStatus, demo, staff } = useDeliverables(taskId);
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [inputRevision, setInputRevision] = useState(0);
  const baseId = useId();
  const latest = versions[0];

  async function publish(event) {
    event.preventDefault();
    if (busy || (!file && !link.trim())) return;
    setBusy(true);
    try {
      if (await uploadVersion(file || link, name)) {
        setFile(null);
        setLink('');
        setName('');
        setInputRevision(current => current + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  async function decide(status) {
    if (busy || !latest) return;
    setBusy(true);
    try {
      if (await updateStatus(latest.id, status, status === 'aprovado' ? '' : feedback)) {
        setFeedback('');
        setAdjusting(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function open(version) {
    const tab = window.open('', '_blank');
    if (!tab) {
      toast.error('Permita a abertura de uma nova aba e tente novamente.');
      return;
    }
    tab.opener = null;
    try {
      await openApprovalAsset(version, tab);
    } catch (err) {
      tab.close();
      toast.error(err.message);
    }
  }

  async function share() {
    try {
      await copyApprovalUrl(taskId);
      toast.success('Link de aprovação copiado! Envie no WhatsApp do cliente.');
    } catch {
      setShareLink(new URL('/aprovar/' + encodeURIComponent(taskId), window.location.origin).href);
    }
  }

  return (
    <div className="space-y-5">
      {staff && (
        <form onSubmit={publish} className="space-y-3 rounded-xl border border-cs-border p-4">
          <h3 className="font-semibold text-white">Enviar versão para aprovação</h3>
          <label className="block space-y-1 text-sm text-cs-text-secondary" htmlFor={baseId + '-name'}>
            <span>Nome da versão</span>
            <input id={baseId + '-name'} className={field} value={name} onChange={event => setName(event.target.value)} maxLength={255} />
          </label>
          <label className="block space-y-1 text-sm text-cs-text-secondary" htmlFor={baseId + '-link'}>
            <span>Link da peça, do site ou do planejamento</span>
            <input id={baseId + '-link'} className={field} type="url" value={link} onChange={event => { setLink(event.target.value); setFile(null); setInputRevision(value => value + 1); }} />
          </label>
          {!demo && (
            <label className="block space-y-1 text-sm text-cs-text-secondary" htmlFor={baseId + '-file'}>
              <span>Ou anexe imagem, PDF ou vídeo de até 20 MB</span>
              <input key={inputRevision} id={baseId + '-file'} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,video/mp4,video/webm,video/quicktime"
                className={field} onChange={event => { const selected = event.target.files[0]; setFile(selected || null); if (selected) setLink(''); }} />
            </label>
          )}
          <button className={button + ' bg-cs-primary font-semibold text-black'} disabled={busy || (!file && !link.trim())}>
            {busy ? 'Salvando…' : 'Enviar para aprovação'}
          </button>
        </form>
      )}
      {staff && !demo && latest && (
        <div className="space-y-2">
          <button type="button" className={button} onClick={share}>Copiar link para o cliente</button>
          {shareLink && <input className={field} aria-label="Link para o cliente" readOnly value={shareLink} onFocus={event => event.target.select()} />}
        </div>
      )}
      {loading && <p role="status" className="text-sm text-cs-text-secondary">Carregando versões…</p>}
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-300">{error} <button className={button} onClick={refresh}>Tentar novamente</button></div>}
      {!loading && !error && versions.length === 0 && <p className="text-sm text-cs-text-secondary">Nenhuma versão enviada para esta demanda.</p>}
      {versions.map((version, index) => (
        <article key={version.id} className="space-y-3 rounded-xl border border-cs-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="min-w-0 break-words font-semibold text-white">{version.file_name}</h4>
            <span className="text-xs text-cs-text-secondary">Versão {version.version_number} · {index > 0 && version.status === 'pendente' ? 'Substituída' : labels[version.status]}</span>
          </div>
          <button type="button" className={button} onClick={() => open(version)}>Abrir material</button>
          {version.client_comment && <p className="whitespace-pre-wrap break-words text-sm text-cs-text-secondary">{version.client_comment}</p>}
          {version.reviewed_at && <p className="text-xs text-cs-text-secondary">Decisão registrada em {new Date(version.reviewed_at).toLocaleDateString('pt-BR')}</p>}
          {index === 0 && version.status === 'pendente' && (
            <div className="space-y-3 border-t border-cs-border pt-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button + ' border-green-600 text-green-300'} disabled={busy} onClick={() => decide('aprovado')}>
                  {staff ? 'Registrar aprovação recebida' : 'Aprovar esta versão'}
                </button>
                <button type="button" className={button} disabled={busy} aria-expanded={adjusting} onClick={() => setAdjusting(value => !value)}>
                  {staff ? 'Registrar ajustes recebidos' : 'Pedir ajustes'}
                </button>
              </div>
              {adjusting && (
                <div className="space-y-2">
                  <label className="block text-sm text-cs-text-secondary" htmlFor={baseId + '-feedback'}>O que precisa mudar?</label>
                  <textarea id={baseId + '-feedback'} className={field} rows={3} maxLength={4000} value={feedback} onChange={event => setFeedback(event.target.value)} />
                  <button type="button" className={button} disabled={busy || !feedback.trim()} onClick={() => decide('reprovado')}>Registrar pedido de ajustes</button>
                </div>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
