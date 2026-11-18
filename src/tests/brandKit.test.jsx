import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook, waitFor } from '@testing-library/react';
import {
  BRAND_DEFAULTS,
  normalizeHexColor,
  parseKeywords,
  getClientBrandKit,
  buildClientBrandPayload,
} from '../lib/brandKit';
import BrandKitEditor from '../components/BrandKitEditor';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('brandKit utilities', () => {
  it('normalizes valid hex strings and falls back on invalid input', () => {
    expect(normalizeHexColor('0284C7')).toBe('#0284c7');
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
    expect(normalizeHexColor('  #1E3A8A  ')).toBe('#1e3a8a');
    expect(normalizeHexColor('not-a-color', '#ef4444')).toBe('#ef4444');
    expect(normalizeHexColor(null, BRAND_DEFAULTS.primary_color)).toBe(BRAND_DEFAULTS.primary_color);
  });

  it('parses comma-separated strings and arrays into clean keyword lists', () => {
    expect(parseKeywords(' #vascular, flebologia ,  , #saude ')).toEqual([
      'vascular',
      'flebologia',
      'saude',
    ]);
    expect(parseKeywords(['#marca', ' premium ', ''])).toEqual(['marca', 'premium']);
    expect(parseKeywords(null)).toEqual([]);
  });

  it('extracts unified Brand Kit from client and agency_metadata', () => {
    const kit = getClientBrandKit({
      id: 'client-alberto',
      name: 'Dr. Alberto Brasil',
      brand_color: '#0284c7',
      logo_url: 'https://example.com/logo.png',
      tone_of_voice: 'Etico e acolhedor',
      agency_metadata: {
        primary_color: '#1e3a5f',
        secondary_color: '#0f172a',
        accent_color: '#d97706',
        typography: 'Source Serif + Inter',
        drive_url: 'https://drive.google.com/drive/folders/abc',
        keywords: ['vascular', 'poços de caldas'],
      },
      social_media_config: {
        instagram_handle: '@dralbertobrasil',
      },
    });

    expect(kit.primary_color).toBe('#1e3a5f');
    expect(kit.brand_color).toBe('#1e3a5f');
    expect(kit.secondary_color).toBe('#0f172a');
    expect(kit.accent_color).toBe('#d97706');
    expect(kit.typography).toBe('Source Serif + Inter');
    expect(kit.drive_url).toBe('https://drive.google.com/drive/folders/abc');
    expect(kit.instagram).toBe('@dralbertobrasil');
    expect(kit.keywords).toEqual(['vascular', 'poços de caldas']);
  });

  it('keeps brand_color and primary_color synchronized when building payload', () => {
    const client = {
      id: 'c1',
      name: 'Clínica Exemplo',
      brand_color: '#0284c7',
      social_media_config: { facebook_page_id: '123' },
    };

    const payload = buildClientBrandPayload(client, {
      primary_color: '8B1E24',
      secondary_color: '#111827',
      accent_color: '#F59E0B',
      typography: 'Playfair Display + Plus Jakarta Sans',
      keywords: '#cirurgia, #confianca',
      instagram: 'clinicaexemplo',
      drive_url: ' https://drive.google.com/drive/folders/xyz ',
    });

    expect(payload.brand_color).toBe('#8b1e24');
    expect(payload.primary_color).toBe('#8b1e24');
    expect(payload.secondary_color).toBe('#111827');
    expect(payload.accent_color).toBe('#f59e0b');
    expect(payload.keywords).toEqual(['cirurgia', 'confianca']);
    expect(payload.drive_url).toBe('https://drive.google.com/drive/folders/xyz');
    expect(payload.social_media_config).toEqual({
      facebook_page_id: '123',
      instagram_handle: '@clinicaexemplo',
    });
  });
});

describe('BrandKitEditor component', () => {
  it('allows switching to edit mode and saving updated colors synced', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const client = {
      id: '87c0b28f-83f0-43ab-aefe-45bda539e8c2',
      name: 'Dr. Alberto Brasil',
      brand_color: '#0284c7',
      primary_color: '#0284c7',
      secondary_color: '#0f172a',
      accent_color: '#38bdf8',
    };

    render(<BrandKitEditor client={client} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /Editar Identidade/i }));

    const hexInput = screen.getByLabelText('HEX Primária');
    fireEvent.change(hexInput, { target: { value: '#7c2d12' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Salvar Identidade/i }));
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedArg = onSave.mock.calls[0][0];
    expect(savedArg.primary_color).toBe('#7c2d12');
    expect(savedArg.brand_color).toBe('#7c2d12');
  });
});

describe('useProfitability hook', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('computes real profit and margin from monthly_fee and tracked task seconds', async () => {
    vi.doMock('../lib/supabase', () => ({
      isSupabaseConfigured: true,
      supabase: {
        from: (table) => ({
          select: async () => {
            if (table === 'clients') {
              return {
                data: [
                  { id: 'c1', name: 'Cliente A', monthly_fee: 4000 },
                  { id: 'c2', name: 'Cliente B', monthly_fee: 1000 },
                ],
              };
            }
            if (table === 'tasks') {
              return {
                data: [
                  { client_id: 'c1', tracked_seconds: 36000, assigned_to_id: 'u1' }, // 10h * 100 = 1000
                  { client_id: 'c2', tracked_seconds: 18000, assigned_to_id: 'u1' }, // 5h * 100 = 500
                ],
              };
            }
            if (table === 'team_members') {
              return {
                data: [{ id: 'u1', name: 'Bruno', hourly_cost: 100 }],
              };
            }
            return { data: [] };
          },
        }),
      },
    }));

    const { useProfitability } = await import('../hooks/useProfitability');
    const { result } = renderHook(() => useProfitability());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0]).toMatchObject({
      id: 'c1',
      revenue: 4000,
      costHours: 1000,
      profit: 3000,
      margin: 75,
    });
    expect(result.current.data[1]).toMatchObject({
      id: 'c2',
      revenue: 1000,
      costHours: 500,
      profit: 500,
      margin: 50,
    });
  });

  it('returns empty dataset when supabase is not configured', async () => {
    vi.doMock('../lib/supabase', () => ({
      isSupabaseConfigured: false,
      supabase: null,
    }));

    const { useProfitability } = await import('../hooks/useProfitability');
    const { result } = renderHook(() => useProfitability());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual([]);
  });
});
