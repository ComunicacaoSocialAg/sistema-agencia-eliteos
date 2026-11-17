export async function operationId(key, remote) {
  if (!remote) return key;
  const bytes = new TextEncoder().encode(key);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  hash[6] = (hash[6] & 0x0f) | 0x80;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = Array.from(hash.slice(0, 16), byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}
