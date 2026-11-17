import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from '../lib/contentApi';

/**
 * Admin passkey. Two passkeys open the panel:
 *  • the master passkey (server setting, developer only) — always works, cannot be changed here;
 *  • the admin passkey — set / changed here. Changing it replaces the previous admin passkey.
 */
export default function SecurityTab({ token, onToken }) {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', ok: false });
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const loadStatus = useCallback(() => {
    apiFetch('/api/admin/passkey', { headers: authHeaders(token) }).then(setStatus).catch(() => setStatus(null));
  }, [token]);
  useEffect(() => loadStatus(), [loadStatus]);

  async function submit(event) {
    event.preventDefault();
    if (form.next.trim().length < 6) return setMessage({ text: 'New passkey must be at least 6 characters.', ok: false });
    if (form.next !== form.confirm) return setMessage({ text: 'The two new passkeys do not match.', ok: false });
    setBusy(true);
    setMessage({ text: '', ok: false });
    try {
      const result = await apiFetch('/api/admin/passkey', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ current: form.current, next: form.next }),
      });
      onToken(result.token);
      setForm({ current: '', next: '', confirm: '' });
      setMessage({ text: 'Admin passkey saved ✓ You can now log in with it (the master passkey still works too). Other devices have been logged out.', ok: true });
      loadStatus();
    } catch (error) {
      setMessage({ text: error.message, ok: false });
    } finally {
      setBusy(false);
    }
  }

  const type = show ? 'text' : 'password';
  const hasAdmin = status?.adminPasskeySet;
  return (
    <section className="grid max-w-2xl gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-eyebrow text-ink/75">Master passkey</p>
          <p className="mt-2 text-sm font-medium">🔐 Always active</p>
          <p className="mt-1 text-xs leading-5 text-ink/75">Set by your developer on the server. It always works and cannot be changed or removed from this panel.</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-eyebrow text-ink/75">Admin passkey</p>
          <p className="mt-2 text-sm font-medium">{status === null ? '…' : hasAdmin ? '✅ Set' : '— Not set yet'}</p>
          <p className="mt-1 text-xs leading-5 text-ink/75">
            {hasAdmin && status.updatedAt
              ? `Last changed ${new Date(status.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}. Works alongside the master passkey.`
              : 'Your own passkey. Once set, both passkeys open this panel.'}
          </p>
        </div>
      </div>

      <form data-tour="passkey-form" onSubmit={submit} className="rounded-card border border-line bg-card p-5" aria-busy={busy}>
        <h2 className="font-serif text-3xl">{hasAdmin ? 'Change admin passkey' : 'Set your admin passkey'}</h2>
        <p className="mt-2 text-sm">
          The passkey opens this admin panel (tap the logo 4 times on the Home page). {hasAdmin ? 'The new one replaces your old admin passkey.' : ''} The master passkey keeps working either way.
        </p>
        <label className="mt-5 block text-xs">
          Current passkey
          <input className="admin-input" type={type} autoComplete="current-password" value={form.current} onChange={update('current')} required />
          <span className="mt-1 block text-[11px] text-ink/70">Type the master passkey or your current admin passkey.</span>
        </label>
        <label className="mt-3 block text-xs">
          New admin passkey
          <input className="admin-input" type={type} autoComplete="new-password" value={form.next} onChange={update('next')} required minLength={6} maxLength={64} />
          <span className="mt-1 block text-[11px] text-ink/70">6–64 characters. Letters + numbers are safer. Example: Rose2026 (it can’t be the same as the master passkey).</span>
        </label>
        <label className="mt-3 block text-xs">
          New admin passkey again
          <input className="admin-input" type={type} autoComplete="new-password" value={form.confirm} onChange={update('confirm')} required />
        </label>
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passkeys
        </label>
        <button type="submit" className="admin-primary mt-3 w-full sm:w-auto" disabled={busy}>{busy ? 'Saving…' : hasAdmin ? 'Change admin passkey' : 'Set admin passkey'}</button>
        {message.text && (
          <p className={`mt-3 text-sm ${message.ok ? '' : 'text-error'}`} role={message.ok ? 'status' : 'alert'}>{message.text}</p>
        )}
      </form>
      <p className="text-xs text-ink/70">
        Forgot your admin passkey? Log in with the master passkey and set a new one here — or ask your developer.
      </p>
    </section>
  );
}
