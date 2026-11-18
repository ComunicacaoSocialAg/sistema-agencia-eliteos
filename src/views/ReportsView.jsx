import { useState } from 'react';
import { Copy, FileText, Printer, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { useTasks } from '../hooks/useTasks';
import { useSocialManagement } from '../hooks/useSocialManagement';
import { useCampaignManagement } from '../hooks/useCampaignManagement';
import { generateContent } from '../lib/gemini';
import { areIdsMatching } from '../hooks/useClients';

const control = 'rounded-lg border border-cs-border bg-cs-bg px-3 py-2 text-sm text-white focus-visible:outline-cs-primary';
const button = 'inline-flex items-center gap-2 rounded-lg border border-cs-border px-3 py-2 text-sm text-white disabled:opacity-50';
const number = new Intl.NumberFormat('pt-BR');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function monthOf(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
  }).format(date);
}

function matchesMonth(label, period) {
  if (label === period) return true;
  const [year, month] = period.split('-');
  return label?.replace(/\s/g, '').toLocaleLowerCase('pt-BR') === months[Number(month) - 1] + '/' + year;
}

export default function ReportsView() {
  const { selectedClient, clients, setSelectedClientId } = useActiveClient();
  const { allTasks } = useTasks(undefined, { showArchived: true });
  const { allPosts, metrics, error: socialError, loading: socialLoading, refreshData: refreshSocial } = useSocialManagement();
  const { reports, error: mediaError, loading: mediaLoading, refreshData: refreshMedia } = useCampaignManagement();
  const [period, setPeriod] = useState(() => monthOf(new Date()));
  const [drafts, setDrafts] = useState({});
  const [generating, setGenerating] = useState(false);
  const currentKey = selectedClient ? selectedClient.id + '/' + period : '';
  const opinion = drafts[currentKey] || '';
  const updateOpinion = (key, text) => setDrafts(current => ({ ...current, [key]: text }));

  const belongsToClient = item => selectedClient && areIdsMatching(item.client_id, selectedClient.id);
  const organic = metrics.find(item => belongsToClient(item) && item.period_month === period);
  const paidReports = reports.filter(item => belongsToClient(item) && matchesMonth(item.period_label, period));
  const published = allPosts.filter(item => belongsToClient(item) && item.status === 'publicado' && monthOf(item.published_at) === period);
  const delivered = allTasks.filter(item => belongsToClient(item) && item.status === 'concluido' && monthOf(item.completed_at) === period);
  const loading = socialLoading || mediaLoading;
  const selectedPeriod = period ? period.split('-').reverse().join('/') : '';

  function summary() {
    const lines = [`*Relatório mensal | ${selectedClient.name}*`, selectedPeriod, '', '*Redes sociais*'];
    if (organic) lines.push(
      `Seguidores: ${number.format(organic.followers_total)} (${number.format(organic.followers_growth)} no mês)`,
      `Alcance orgânico: ${number.format(organic.reach_organic)}`,
      `Interações: ${number.format(organic.total_interactions)}`,
    );
    else lines.push('Métricas orgânicas ainda sem lançamento para este mês.');
    lines.push(`Publicações com data registrada: ${published.length}`, '', '*Mídia paga*');
    if (paidReports.length) paidReports.forEach(item => lines.push(
      `Investimento: ${currency.format(item.invested_amount)}. Conversões: ${number.format(item.conversions_count)}.`,
      item.diagnosis,
    ));
    else lines.push('Prestação de contas de mídia paga ainda sem lançamento para este mês.');
    lines.push('', '*Entregas concluídas*', ...(delivered.length
      ? delivered.map(item => '• ' + item.title) : ['Nenhuma entrega com data registrada neste mês.']));
    return lines.filter(line => line !== null && line !== undefined).join('\n');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary() + (opinion.trim() ? '\n\n*Parecer da agência*\n' + opinion.trim() : ''));
      toast.success('Relatório copiado.');
    } catch {
      toast.error('A área de transferência está indisponível. Use a opção de impressão.');
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      const prompt = 'Escreva um rascunho de parecer para a Comunicação Social Ag usando somente os dados abaixo. '
        + 'Não afirme cumprimento de metas, causalidade, conformidade normativa ou resultados que os dados não mostrem. '
        + 'Aponte uma ação de acompanhamento quando houver evidência para ela.\n\n' + summary();
      const text = await generateContent(prompt, 'auto', { requireProvider: true });
      if (!text?.trim()) throw new Error('Rascunho indisponível');
      updateOpinion(currentKey, text.trim());
    } catch {
      toast.error('Não foi possível gerar o rascunho. Você pode escrever o parecer no campo abaixo.');
    } finally {
      setGenerating(false);
    }
  }

  const missingData = socialError || mediaError;
  const ready = Boolean(selectedClient && period && !loading && !missingData);

  return (
    <section className="h-full overflow-y-auto bg-cs-bg p-4 pb-24 text-white sm:p-6 sm:pb-24 print:h-auto print:overflow-visible print:bg-white print:text-black">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="space-y-4">
          <h1 className="flex items-center gap-2 text-xl font-bold"><FileText size={20} /> Relatório mensal</h1>
          <div className="flex flex-wrap items-end gap-3 print:hidden">
            <label className="grid gap-1 text-xs text-cs-text-secondary">
              Cliente
              <select value={selectedClient?.id || 'all'} onChange={event => setSelectedClientId(event.target.value)} className={control}>
                <option value="all">Selecione um cliente</option>
                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs text-cs-text-secondary">
              Mês de referência
              <input type="month" className={control} value={period} onChange={event => setPeriod(event.target.value)} />
            </label>
            <button type="button" className={button} onClick={copy} disabled={!ready}><Copy size={14} /> Copiar para WhatsApp</button>
            <button type="button" className={button} onClick={() => window.print()} disabled={!ready}><Printer size={14} /> Imprimir / PDF</button>
          </div>
        </header>
        {!selectedClient && <p className="text-sm text-cs-text-secondary">Selecione o cliente para montar a prestação de contas.</p>}
        {loading && selectedClient && <p role="status" className="text-sm">Carregando dados do relatório…</p>}
        {missingData && (
          <p role="alert" className="text-sm text-red-300">Não foi possível carregar todos os dados do relatório.{' '}
            <button type="button" className="underline" onClick={() => Promise.allSettled([refreshSocial(), refreshMedia()])}>Tentar novamente</button>
          </p>
        )}
        {ready && (
          <>
            <div className="rounded-xl border border-cs-border bg-cs-surface p-5 print:bg-white">
              <p className="text-lg font-semibold">{selectedClient.name}</p>
              <p className="mb-4 text-sm text-cs-text-secondary">{selectedPeriod}</p>
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {summary().split('\n').slice(3).map((line, index) => line.startsWith('*') && line.endsWith('*')
                  ? <p key={index} className="font-semibold">{line.slice(1, -1)}</p>
                  : <p key={index}>{line || '\u00a0'}</p>)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="monthly-opinion" className="text-sm font-semibold">Parecer da agência</label>
                <button type="button" className={button + ' print:hidden'} disabled={generating}
                  onClick={generate}><Sparkles size={14} /> {generating ? 'Gerando…' : 'Gerar rascunho com IA'}</button>
              </div>
              <textarea id="monthly-opinion" rows={4} value={opinion} onChange={event => updateOpinion(currentKey, event.target.value)}
                className={control + ' w-full print:hidden'} />
              {opinion.trim() && <p className="hidden whitespace-pre-wrap text-sm print:block">{opinion}</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
