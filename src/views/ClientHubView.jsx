import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientPortal } from '../hooks/useClientPortal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const STAGES = {
  backlog: 'Na fila', briefing: 'Em briefing', 'em-producao': 'Em produção',
  'revisao-interna': 'Em revisão', 'aguardando-cliente': 'Aguardando sua avaliação',
  ajustes: 'Em ajustes', concluido: 'Concluída', finalizado: 'Concluída',
};
const WORK_TYPES = ['Social Media', 'Campanha', 'Planejamento', 'Web', 'Branding', 'Vídeo', 'Outro'];
const control = 'w-full rounded-lg border border-cs-border bg-cs-bg p-3 text-sm text-white focus-visible:outline-cs-primary';
const button = 'rounded-lg border border-cs-border px-4 py-2 text-sm text-white focus-visible:outline-cs-primary disabled:opacity-50';

function displayDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : '';
}

export default function ClientHubView() {
  const { profile } = useAuth();
  const { client, projects, tasks, loading, error, refresh, requestTask } = useClientPortal();
  const [tab, setTab] = useState('work');
  const [busy, setBusy] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [receipt, setReceipt] = useState('');
  const pending = useRef(null);
  const submitting = useRef(false);
  const pendingReviews = tasks.filter(task => task.approval_status === 'pendente');

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || client.status === 'inactive') return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const values = {
      title: String(fields.get('title')).trim(), notes: String(fields.get('notes')).trim(),
      tag: String(fields.get('tag')), priority: String(fields.get('priority')),
      deadline: String(fields.get('deadline')) || null,
    };
    if (!values.title || !values.notes) return;
    const signature = JSON.stringify(values);
    if (pending.current?.signature !== signature) pending.current = { signature, id: crypto.randomUUID() };
    submitting.current = true;
    setBusy(true);
    setReceipt('');
    try {
      const saved = await requestTask({ ...values, id: pending.current.id });
      if (!saved) throw new Error('O envio não foi confirmado. Tente novamente.');
      pending.current = null;
      form.reset();
      setReceipt('Sua solicitação foi registrada e está na fila de briefing.');
    } catch (err) {
      toast.error(err.message || 'Não foi possível enviar a solicitação.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (loading) return <p role="status" className="p-6 text-cs-text-secondary">Carregando sua área…</p>;
  if (error) return <p role="alert" className="p-6 text-red-300">{error} <button type="button" onClick={refresh} className={button}>Tentar novamente</button></p>;
  if (!client) return <p className="p-6 text-cs-text-secondary">Sua conta ainda precisa ser vinculada a um cliente. Fale com a agência.</p>;

  const tabs = [
    ['work', 'Demandas'], ['approvals', `Aprovações (${pendingReviews.length})`], ['new', 'Nova solicitação'],
  ];
  const listed = tab === 'approvals' ? tasks.filter(task => task.version_number)
    : tasks.filter(task => !projectId || task.project_id === projectId);

  return (
    <section className="h-full overflow-y-auto bg-cs-bg">
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-sm text-cs-text-secondary">Olá, {profile?.name || 'cliente'}.</p>
        </header>
        <nav className="flex flex-wrap gap-2 border-b border-cs-border pb-4" aria-label="Área do cliente">
          {tabs.map(([id, name]) => <button key={id} type="button" aria-pressed={tab === id}
            className={button + (tab === id ? ' border-cs-primary text-cs-primary' : '')} onClick={() => setTab(id)}>{name}</button>)}
        </nav>
        {tab === 'work' && projects.length > 0 && (
          <label className="block max-w-sm space-y-1 text-sm text-cs-text-secondary">
            Projeto
            <select className={control} value={projectId} onChange={event => setProjectId(event.target.value)}>
              <option value="">Todos os projetos</option>
              {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
        )}
        {tab === 'new' ? (
          client.status === 'inactive'
            ? <p className="text-sm text-cs-text-secondary">A agência pode reativar sua conta para receber novas solicitações.</p>
            : <form onSubmit={submit} className="max-w-xl space-y-4">
              <h2 className="text-lg font-semibold text-white">Nova solicitação</h2>
              <label className="block space-y-1 text-sm text-cs-text-secondary">Título<input name="title" className={control} required maxLength={200} /></label>
              <label className="block space-y-1 text-sm text-cs-text-secondary">O que você precisa?<textarea name="notes" className={control} required rows={4} maxLength={8000} /></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block space-y-1 text-sm text-cs-text-secondary">Tipo de trabalho<select name="tag" className={control}>{WORK_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
                <label className="block space-y-1 text-sm text-cs-text-secondary">Prioridade<select name="priority" className={control} defaultValue="medium"><option value="low">Baixa</option><option value="medium">Normal</option><option value="high">Alta</option></select></label>
                <label className="block space-y-1 text-sm text-cs-text-secondary">Prazo desejado<input name="deadline" className={control} type="date" /></label>
              </div>
              <button className={button + ' bg-cs-primary font-semibold text-black'} disabled={busy}>{busy ? 'Enviando…' : 'Enviar solicitação'}</button>
              {receipt && <p role="status" className="text-sm text-green-300">{receipt}</p>}
            </form>
        ) : (
          <div className="divide-y divide-cs-border">
            {listed.length === 0 && <p className="py-5 text-sm text-cs-text-secondary">{tab === 'approvals' ? 'Nenhuma versão enviada para avaliação.' : 'Nenhuma demanda registrada para sua conta.'}</p>}
            {listed.map(task => (
              <article key={task.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0 space-y-1">
                  <h2 className="break-words font-semibold text-white">{task.title}</h2>
                  <p className="text-sm text-cs-text-secondary">{STAGES[task.status] || 'Em acompanhamento'}{displayDate(task.deadline) && ` · ${displayDate(task.deadline)}`}</p>
                  {task.approval_status === 'aprovado' && <p className="text-sm text-green-300">Versão aprovada</p>}
                  {['reprovado','com_ressalvas'].includes(task.approval_status) && <p className="text-sm text-orange-300">Ajustes solicitados</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.version_number && <Link className={button} to={'/aprovar/' + task.id}>{task.approval_status === 'pendente' ? 'Avaliar versão' : 'Ver versões'}</Link>}
                  {['concluido','finalizado'].includes(task.status) && (Array.isArray(task.external_links) ? task.external_links : [])
                    .filter(link => link?.kind === 'delivery' && /^https?:\/\//i.test(link.url || ''))
                    .map(link => <a key={link.url} className={button} href={link.url} target="_blank" rel="noreferrer">Abrir entrega</a>)}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
