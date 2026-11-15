export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export function resolveAssetUrl(src) {
  return typeof src === 'string' && src.startsWith('/api/') ? `${API_URL}${src}` : src;
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
