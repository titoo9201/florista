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

const bundledByUrl = Object.fromEntries(
  Object.entries(bundledAssets).map(([key, url]) => [url, `/src/${key.slice('../'.length)}`]),
);

/**
 * Inverse of resolveAssetUrl, used before saving: uploaded photos are stored as "/api/images/<id>"
 * and built-in photos as "/src/assets/…", so saved links keep working after a redeploy.
 */
export function toStoredSrc(src) {
  if (typeof src !== 'string') return src;
  if (src.startsWith(`${API_URL}/api/`)) return src.slice(API_URL.length);
  return bundledByUrl[src] || src;
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
