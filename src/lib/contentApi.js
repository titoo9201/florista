const bundledAssets = import.meta.glob('../assets/images/**/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
});

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function resolveBundledAsset(src) {
  if (typeof src !== 'string' || !src.startsWith('/src/assets/')) return src;
  const assetKey = `../${src.slice('/src/'.length)}`;
  return bundledAssets[assetKey] || src;
}

export function resolveAssetUrl(src) {
  if (typeof src !== 'string') return src;
  if (src.startsWith('/api/')) return `${API_URL}${src}`;
  return resolveBundledAsset(src);
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Could not connect to the Florista server.');
  return body;
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}
