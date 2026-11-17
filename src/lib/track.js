import { API_URL } from './contentApi';

// Anonymous visitor stats for the admin dashboard. Only a random id is stored in the browser —
// no names, emails or IP addresses. Admins' own visits and "Do Not Track" browsers are not counted.
const VISITOR_KEY = 'florista_vid';

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function shouldSkip() {
  if (navigator.doNotTrack === '1' || window.location.pathname.startsWith('/admin')) return true;
  try {
    return Boolean(localStorage.getItem('florista_admin_token'));
  } catch {
    return false;
  }
}

/** Sends one event: track('pageview', { path }) or track('whatsapp', { product }). Never throws. */
export function track(type, data = {}) {
  if (!API_URL || shouldSkip()) return;
  fetch(`${API_URL}/api/track`, {
    method: 'POST',
    // text/plain keeps this a "simple" request (no CORS preflight), which browsers require for keepalive.
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ type, vid: visitorId(), ...data }),
    keepalive: true, // still delivered when the visitor leaves for WhatsApp
  }).catch(() => {});
}
