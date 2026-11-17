import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from './useTasks';

export const APPROVAL_EVENT = 'csag:approval-updated';
const STORAGE_KEY = 'csag_custom_deliverables';
const BUCKET = 'agency-approvals';
const MAX_FILE = 20 * 1024 * 1024;
const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm', 'video/quicktime'];

const DEFAULT_DEMO_DELIVERABLES = [
  {
    id: 'deliv-1',
    task_id: 'task-alberto-1',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Carrossel_VarizesLaser_v1.png',
    status: 'pendente',
    client_comment: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'deliv-2',
    task_id: 'task-dubola-1',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Manual_Identidade_Visual_Dubola_v1.pdf',
    status: 'aprovado',
    client_comment: 'Excelente! Aprovado pela diretoria.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'deliv-3',
    task_id: 'task-alberto-2',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Reels_DopplerVascular_v1.mp4',
    status: 'pendente',
    client_comment: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'deliv-4',
    task_id: 'task-dubola-2',
    version_number: 1,
    file_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    file_name: 'Banner_Lancamento_Molho_Defumado_v1.png',
    status: 'ajustes',
    client_comment: 'Por favor aumentar o destaque do selo artesanal e o selo sem glúten.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

function readVersions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch { /* dados de demonstração */ }
  return DEFAULT_DEMO_DELIVERABLES;
}

function newestFirst(a, b) {
  return b.version_number - a.version_number
    || String(b.created_at || '').localeCompare(String(a.created_at || ''))
    || String(b.id).localeCompare(String(a.id));
}

function safeLink(value) {
  try {
    const url = new URL(value);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* URL inválida */ }
  return null;
}

export function getPublicAppOrigin() {
  if (typeof window === 'undefined') return 'https://sistema-agencia-eliteos.vercel.app';
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.endsWith('.local');
  return isLocal ? 'https://sistema-agencia-eliteos.vercel.app' : window.location.origin;
}

export function copyApprovalUrl(taskId) {
  const link = new URL('/aprovar/' + encodeURIComponent(taskId), getPublicAppOrigin()).href;
  return navigator.clipboard?.writeText(link).then(() => link) ?? Promise.reject(new Error('Área de transferência indisponível'));
}

export async function openApprovalAsset(version, target) {
  if (version.file_url?.startsWith('storage:')) {
    const { data, error } = await supabase.storage.from(BUCKET)
      .createSignedUrl(version.file_url.slice(8), 60, { download: version.file_name });
    if (error || !data?.signedUrl) throw new Error('Não foi possível abrir o arquivo. Recarregue e tente novamente.');
    target.location.replace(data.signedUrl);
    return;
  }
  const url = safeLink(version.file_url);
  if (!url) throw new Error('Este material precisa ser reenviado com um link válido.');
  target.location.replace(url);
}

function useVersions(taskId) {
  const { user, role, isDemoMode } = useAuth();
  const { refresh: refreshTasks, updateTask } = useTasks();
  const accountId = user?.id || null;
  const scopeKey = accountId || (taskId ? 'public' : null);
  const [result, setResult] = useState({ accountId: null, taskId: undefined, items: [], error: '' });
  const request = useRef(0);
  const inFlight = useRef(false);
  const pendingUpload = useRef(null);
  const demo = isDemoMode || !isSupabaseConfigured;
  const staff = ['admin', 'commercial', 'production'].includes(role);

  const refresh = useCallback(async () => {
    const id = ++request.current;
    if (!scopeKey) return;
    try {
      let items;
      if (demo) {
        items = readVersions().filter(item => !taskId || item.task_id === taskId);
      } else {
        const { data, error } = await supabase.rpc('approval_versions', { p_task_id: taskId || null });
        if (error) throw error;
        items = data || [];
      }
      if (request.current === id) setResult({ accountId: scopeKey, taskId, items: [...items].sort(newestFirst), error: '' });
    } catch {
      if (request.current === id) setResult({ accountId: scopeKey, taskId, items: [], error: 'Não foi possível carregar as versões.' });
    }
  }, [scopeKey, demo, taskId]);

  useEffect(() => {
    refresh();
    window.addEventListener(APPROVAL_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      request.current++;
      window.removeEventListener(APPROVAL_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  async function completeChange() {
    window.dispatchEvent(new Event(APPROVAL_EVENT));
    await refreshTasks?.();
  }

  async function addDeliverable({ taskId: targetId, fileOrUrl, fileName }) {
    if (!staff || !accountId || !targetId || inFlight.current) return null;
    inFlight.current = true;
    try {
      const isLink = typeof fileOrUrl === 'string';
      let url = isLink ? safeLink(fileOrUrl.trim()) : null;
      if (isLink && !url) throw new Error('Informe um link completo com http ou https.');
      if (!isLink && (demo || !fileOrUrl || !FILE_TYPES.includes(fileOrUrl.type) || fileOrUrl.size > MAX_FILE)) {
        throw new Error(demo ? 'Use um link na demonstração.' : 'Escolha uma imagem, PDF ou vídeo compatível de até 20 MB. Para arquivos maiores, use um link.');
      }
      const name = (fileName?.trim() || (isLink ? new URL(url).hostname : fileOrUrl.name)).slice(0, 255);
      const key = isLink ? `${targetId}:${name}:${url}` : fileOrUrl;
      if (pendingUpload.current?.key !== key || pendingUpload.current.taskId !== targetId) {
        pendingUpload.current = { key, taskId: targetId, id: crypto.randomUUID(), uploaded: false };
      }
      const version = pendingUpload.current;
      let saved;
      if (demo) {
        const items = readVersions();
        const existing = items.find(item => item.id === version.id);
        saved = existing || {
          id: version.id, task_id: targetId, file_url: url, file_name: name, status: 'pendente',
          version_number: Math.max(0, ...items.filter(item => item.task_id === targetId).map(item => item.version_number)) + 1,
          created_at: new Date().toISOString(),
        };
        if (!await updateTask({ id: targetId, status: 'aguardando-cliente', demand_status: 'aguardando_cliente' })) {
          throw new Error('A demanda precisa existir para receber uma versão.');
        }
        if (!existing) localStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...items]));
      } else {
        if (!isLink) {
          const path = `${targetId}/${version.id}`;
          if (!version.uploaded) {
            const { error } = await supabase.storage.from(BUCKET).upload(path, fileOrUrl, { contentType: fileOrUrl.type });
            if (error) {
              const probe = await supabase.storage.from(BUCKET).createSignedUrl(path, 30);
              if (!probe.data?.signedUrl) throw error;
            }
            version.uploaded = true;
          }
          url = 'storage:' + path;
        }
        const { data, error } = await supabase.rpc('publish_approval_version', {
          p_task_id: targetId, p_version_id: version.id, p_file_url: url, p_file_name: name,
        });
        if (error || !data) throw error || new Error('O envio não foi confirmado.');
        saved = data;
      }
      pendingUpload.current = null;
      await completeChange();
      toast.success('Versão enviada para aprovação.');
      return saved;
    } catch (error) {
      toast.error(error?.message || 'A versão não foi confirmada. Tente novamente.');
      return null;
    } finally {
      inFlight.current = false;
    }
  }

  async function updateDeliverableStatus(versionId, targetId, status, comment = '') {
    if (!scopeKey || inFlight.current) return null;
    const feedback = comment.trim();
    const decision = status === 'ajustes' ? 'reprovado' : status;
    if (!['aprovado', 'reprovado', 'com_ressalvas'].includes(decision)
        || (decision !== 'aprovado' && !feedback) || feedback.length > 4000) {
      toast.error('Escreva o que precisa mudar para pedir ajustes.');
      return null;
    }
    inFlight.current = true;
    try {
      let saved;
      if (demo) {
        const items = readVersions();
        const latest = items.filter(item => item.task_id === targetId).sort(newestFirst)[0];
        if (latest?.id !== versionId || latest.status !== 'pendente') {
          throw new Error('Abra a versão atual e confira se ainda está pendente.');
        }
        if (!await updateTask({
          id: targetId, status: decision === 'aprovado' ? 'em-producao' : 'ajustes',
          demand_status: decision === 'aprovado' ? 'em_producao' : 'ajustes',
        })) throw new Error('Não foi possível atualizar a demanda.');
        saved = { ...latest, status: decision, client_comment: feedback, reviewed_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(item => item.id === versionId ? saved : item)));
      } else {
        const { data, error } = await supabase.rpc('review_approval_version', {
          p_version_id: versionId, p_status: decision, p_comment: feedback || null,
        });
        if (error || !data) throw error || new Error('A decisão não foi confirmada.');
        saved = data;
      }
      await completeChange();
      toast.success(decision === 'aprovado' ? 'Aprovação registrada.' : 'Pedido de ajustes registrado.');
      return saved;
    } catch (error) {
      toast.error(error?.message || 'Não foi possível registrar a decisão.');
      await refresh();
      return null;
    } finally {
      inFlight.current = false;
    }
  }

  const loaded = result.accountId === scopeKey && result.taskId === taskId;
  return {
    deliverables: loaded ? result.items : [], loading: Boolean(scopeKey && !loaded),
    error: loaded ? result.error : '', refresh, addDeliverable, updateDeliverableStatus, demo, staff,
  };
}

export function useDeliverables(taskId) {
  const list = useVersions(taskId);
  return {
    ...list, versions: list.deliverables,
    uploadVersion: (fileOrUrl, fileName) => list.addDeliverable({ taskId, fileOrUrl, fileName }),
    updateStatus: (id, status, comment) => list.updateDeliverableStatus(id, taskId, status, comment),
  };
}

export function useAllDeliverables() {
  return useVersions(null);
}
