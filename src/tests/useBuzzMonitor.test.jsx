import { renderHook, act } from '@testing-library/react';
import { useBuzzMonitor } from '../hooks/useBuzzMonitor';
import { calculateEngagementRate, CLIENT_DATASETS } from '../lib/metaApi';
import { describe, it, expect, beforeEach } from 'vitest';

describe('useBuzzMonitor & Meta API Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with Dr. Alberto Brasil as default client dataset', () => {
    const { result } = renderHook(() => useBuzzMonitor());
    expect(result.current.selectedClientId).toBe('client-alberto-brasil');
    expect(result.current.currentClient.name).toContain('Dr. Alberto Brasil');
    expect(result.current.currentClient.kpis.total_reach).toBe(1142);
    expect(result.current.currentClient.posts.length).toBe(5);
  });

  it('should calculate engagement rates correctly', () => {
    const rate = calculateEngagementRate(35, 1142);
    expect(rate).toBe('3.07%');
    expect(calculateEngagementRate(0, 0)).toBe('0.00%');
  });

  it('should switch clients and load corresponding KPIs', () => {
    const { result } = renderHook(() => useBuzzMonitor());

    act(() => {
      result.current.setSelectedClientId('client-dubola');
    });

    expect(result.current.currentClient.name).toContain('Dubola');
    expect(result.current.currentClient.kpis.total_followers).toBe(18450);
  });

  it('should respond and close a SAC ticket', async () => {
    const { result } = renderHook(() => useBuzzMonitor());

    await act(async () => {
      await result.current.respondTicket('sac-101', 'Resposta de teste enviada pela agência');
    });

    const ticket = result.current.currentClient.sac_tickets.find(t => t.id === 'sac-101');
    expect(ticket.status).toBe('closed');
    expect(ticket.history.some(h => h.text === 'Resposta de teste enviada pela agência')).toBe(true);
  });

  it('should add a new post to the Publisher queue', () => {
    const { result } = renderHook(() => useBuzzMonitor());

    act(() => {
      result.current.addScheduledPost({
        title: 'Novo Post de Teste',
        type: 'Carrossel',
        caption: 'Legenda do post de teste',
        date_formatted: '25/08/2026 às 18:00'
      });
    });

    const posts = result.current.currentClient.scheduled_posts;
    expect(posts.some(p => p.title === 'Novo Post de Teste')).toBe(true);
  });

  it('should add a new monitored term in Social Listening', () => {
    const { result } = renderHook(() => useBuzzMonitor());

    act(() => {
      result.current.addMonitoredTerm('clinica vascular sul de minas');
    });

    const terms = result.current.currentClient.listening.monitored_terms;
    expect(terms).toContain('clinica vascular sul de minas');
  });
});
