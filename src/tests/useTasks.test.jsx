import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../hooks/useTasks';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocking Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
  isFirebaseConfigured: false
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn()
  }
}));

describe('useTasks Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with tasks', async () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toBeDefined();
    expect(Array.isArray(result.current.tasks)).toBe(true);
    expect(result.current.tasks.length).toBeGreaterThan(0);
  });

  it('should create a task locally first (optimistic UI)', async () => {
    const { result } = renderHook(() => useTasks());
    
    let created;
    await act(async () => {
      created = await result.current.createTask({
        title: 'Nova Tarefa de Teste',
        client_id: 'client-dubola',
        priority: 'high',
        tag: 'Social Media'
      });
    });

    expect(created).toBeDefined();
    expect(result.current.tasks.some(t => t.title === 'Nova Tarefa de Teste')).toBe(true);
  });
});
