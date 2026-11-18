/**
 * Utilitários compartilhados para leitura, normalização e persistência do Brand Kit
 * e metadados de onboarding por cliente. Mantém brand_color e primary_color sempre sincronizados.
 */

export const BRAND_DEFAULTS = {
  primary_color: '#3b82f6',
  secondary_color: '#18181b',
  accent_color: '#10b981',
  typography: 'Inter + Plus Jakarta Sans',
  tone_of_voice: '',
  keywords: [],
  logo_url: '',
  drive_url: '',
  website: '',
  instagram: '',
  ai_instructions: '',
};

/**
 * Normaliza uma string de cor para formato HEX #rrggbb quando válida.
 */
export function normalizeHexColor(value, fallback = '#3b82f6') {
  if (!value || typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

/**
 * Converte string separada por vírgulas ou array em lista limpa de palavras-chave.
 */
export function parseKeywords(input) {
  if (Array.isArray(input)) {
    return input.map(item => String(item || '').trim().replace(/^#/, '')).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map(item => item.trim().replace(/^#/, ''))
      .filter(Boolean);
  }
  return [];
}

/**
 * Extrai um objeto de Brand Kit consistente a partir do cliente.
 */
export function getClientBrandKit(client = {}) {
  const meta = client?.agency_metadata || {};
  const primary = normalizeHexColor(
    client?.primary_color || meta.primary_color || client?.brand_color,
    BRAND_DEFAULTS.primary_color
  );
  const secondary = normalizeHexColor(
    client?.secondary_color || meta.secondary_color,
    BRAND_DEFAULTS.secondary_color
  );
  const accent = normalizeHexColor(
    client?.accent_color || meta.accent_color,
    BRAND_DEFAULTS.accent_color
  );

  return {
    primary_color: primary,
    brand_color: primary,
    secondary_color: secondary,
    accent_color: accent,
    typography: client?.typography || meta.typography || BRAND_DEFAULTS.typography,
    tone_of_voice: client?.tone_of_voice || '',
    keywords: parseKeywords(client?.keywords ?? meta.keywords),
    logo_url: client?.logo_url || '',
    drive_url: client?.drive_url || meta.drive_url || '',
    website: client?.website || meta.website || '',
    instagram: client?.instagram || meta.instagram || client?.social_media_config?.instagram_handle || client?.reportei_config?.instagram_handle || '',
    ai_instructions: client?.ai_instructions || meta.ai_instructions || '',
    assets: Array.isArray(client?.assets)
      ? client.assets
      : Array.isArray(meta.assets)
        ? meta.assets
        : [],
  };
}

/**
 * Monta o payload de atualização do cliente mantendo brand_color e primary_color alinhados.
 */
export function buildClientBrandPayload(client, brandValues) {
  const primary = normalizeHexColor(
    brandValues.primary_color ?? brandValues.brand_color ?? client?.primary_color ?? client?.brand_color,
    BRAND_DEFAULTS.primary_color
  );
  const secondary = normalizeHexColor(
    brandValues.secondary_color ?? client?.secondary_color,
    BRAND_DEFAULTS.secondary_color
  );
  const accent = normalizeHexColor(
    brandValues.accent_color ?? client?.accent_color,
    BRAND_DEFAULTS.accent_color
  );
  const instagramClean = (brandValues.instagram ?? client?.instagram ?? '').trim();

  return {
    ...client,
    logo_url: (brandValues.logo_url ?? client?.logo_url ?? '').trim() || null,
    brand_color: primary,
    primary_color: primary,
    secondary_color: secondary,
    accent_color: accent,
    typography: (brandValues.typography ?? client?.typography ?? '').trim() || BRAND_DEFAULTS.typography,
    tone_of_voice: (brandValues.tone_of_voice ?? client?.tone_of_voice ?? '').trim(),
    keywords: parseKeywords(brandValues.keywords ?? client?.keywords),
    drive_url: (brandValues.drive_url ?? client?.drive_url ?? '').trim(),
    website: (brandValues.website ?? client?.website ?? '').trim(),
    instagram: instagramClean,
    ai_instructions: (brandValues.ai_instructions ?? client?.ai_instructions ?? '').trim(),
    social_media_config: {
      ...(client?.social_media_config || {}),
      ...(instagramClean ? { instagram_handle: instagramClean.startsWith('@') ? instagramClean : `@${instagramClean}` } : {}),
    },
  };
}
