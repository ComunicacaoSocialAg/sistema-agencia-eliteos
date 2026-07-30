import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../hooks/useTasks';
import { describe, it, expect, vi } from 'vitest';

// Mocking Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn()
          }))
        }))
      }))
    })),
    removeChannel: vi.fn()
  },
  isSupabaseConfigured: true
}));

describe('useTasks Hook', () => {
  it('should initialize with tasks', async () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toBeDefined();
  });

  it('should create a task locally first (optimistic UI)', async () => {
    const { result } = renderHook(() => useTasks());
    
    await act(async () => {
      await result.current.createTask({ title: 'Test Task', client_id: '1' });
    });

    expect(result.current.tasks.some(t => t.title === 'Test Task')).toBe(true);
  });
});
