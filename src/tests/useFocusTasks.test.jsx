import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksProvider, useTasks } from '../hooks/useTasks';
import { useFocusTasks } from '../hooks/useFocusTasks';

vi.mock('../lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const client = { id: 'client-pilot', name: 'Cliente fictício', status: 'active' };

describe('Demandas compartilhadas por Direção do Dia e Produção', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csag_custom_tasks', '[]');
    localStorage.setItem('csag_custom_clients', JSON.stringify([client]));
  });

  it('registra a demanda uma vez, atualiza as duas telas e preserva após reabrir', async () => {
    const initial = renderHook(() => ({ today: useFocusTasks(), production: useTasks() }), { wrapper: TasksProvider });
    expect(initial.result.current.production.tasks).toEqual([]);
    expect(initial.result.current.today.clients.map(item => item.id)).toContain(client.id);
    let task;
    await act(async () => {
      task = await initial.result.current.today.createQuickDemand({
        title: 'Preparar primeira entrega', clientId: client.id, deadline: '2099-01-14',
      });
    });
    expect(task.client_id).toBe(client.id);
    expect(initial.result.current.today.activeTask.id).toBe(task.id);
    expect(initial.result.current.production.tasks).toMatchObject([
      { id: task.id, deadline: '2099-01-14', status: 'em-producao' },
    ]);

    await act(async () => {
      await initial.result.current.production.updateTask({ id: task.id, status: 'revisao-interna' });
    });
    expect(initial.result.current.today.activeTask.status).toBe('revisao-interna');
    initial.unmount();

    const reopened = renderHook(() => ({ today: useFocusTasks(), production: useTasks() }), { wrapper: TasksProvider });
    expect(reopened.result.current.today.activeTask.id).toBe(task.id);
    await act(async () => {
      await reopened.result.current.today.completeActiveTask(task.id);
    });
    expect(reopened.result.current.today.tasks).toEqual([]);
    expect(reopened.result.current.production.tasks).toMatchObject([{ id: task.id, status: 'concluido' }]);
  });

  it('não escolhe automaticamente um cliente nem atribui prazo quando o usuário omite', async () => {
    const { result } = renderHook(() => useFocusTasks(), { wrapper: TasksProvider });
    await act(async () => {
      expect(await result.current.createQuickDemand({ title: 'Demanda' })).toBeNull();
      await result.current.createQuickDemand({ title: 'Demanda', clientId: client.id });
    });
    expect(result.current.tasks).toMatchObject([{ client_id: client.id, deadline: null }]);
  });
});
