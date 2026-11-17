import { useState } from 'react';
import { apiFetch, authHeaders, resolveAssetUrl, toStoredSrc } from '../lib/contentApi';
import { useContent } from '../context/ContentContext';
import { IMAGE_SLOTS } from '../content/sections';
import { IMAGE_HELP, uploadImage } from './imageTools';
import { PRODUCT_GUIDE, photoShapeTip } from './fieldGuide';
import Hint from './Hint';

function PhotoSlot({ slot, saved, token, onChanged }) {
  const current = saved?.src ? saved : slot.image;
  const [draft, setDraft] = useState({ src: current.src, alt: current.alt || '', width: current.width, height: current.height });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dirty = draft.src !== current.src || (draft.alt || '') !== (current.alt || '');

  async function pick(file) {
    if (!file) return;
    setBusy(true);
    setMessage('Uploading photo…');
    try {
      const uploaded = await uploadImage(file, token);
      setDraft((d) => ({ ...d, ...uploaded }));
      setMessage('Photo uploaded — click Save to put it on the website.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      // Links are stored in a redeploy-safe form ("/api/images/…" or "/src/assets/…").
      const body = { ...draft, src: toStoredSrc(draft.src) };
      await apiFetch(`/api/admin/site-images/${slot.key}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(body) });
      setMessage('Saved ✓ — live on the website.');
      onChanged();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!window.confirm('Go back to the original photo for this spot?')) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/site-images/${slot.key}`, { method: 'DELETE', headers: authHeaders(token) });
      setDraft({ src: slot.image.src, alt: slot.image.alt || '', width: slot.image.width, height: slot.image.height });
      setMessage('Original photo restored ✓');
      onChanged();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article data-tour="photo-slot" aria-busy={busy} className="rounded-card border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl">{slot.label}</h3>
        {saved?.src && <span className="shrink-0 rounded-full bg-blush px-2 py-0.5 text-[11px]">Changed</span>}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="flex h-44 items-center justify-center overflow-hidden rounded-media border border-line bg-cream">
          <img src={resolveAssetUrl(draft.src)} alt={draft.alt || ''} className="h-full w-full object-cover" />
        </div>
        <div>
          <label className={`admin-secondary inline-block cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            Change photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={(e) => pick(e.target.files[0])} />
          </label>
          <Hint guide={{ note: `${IMAGE_HELP} ${photoShapeTip(slot.image)}` }} />
          <label className="mt-3 block text-xs">
            Photo description
            <input className="admin-input" value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
            <Hint guide={PRODUCT_GUIDE.alt} />
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" className="admin-primary" disabled={busy || !dirty} onClick={save}>{busy ? 'Please wait…' : 'Save'}</button>
            {saved?.src && (
              <button type="button" className="min-h-11 text-sm underline" disabled={busy} onClick={reset}>Use original photo</button>
            )}
          </div>
          {message && <p className="mt-2 text-xs" role="status">{message}</p>}
        </div>
      </div>
    </article>
  );
}

export default function PhotosTab({ token, page: onlyPage }) {
  const { content, refresh } = useContent();
  const pages = [...new Set(IMAGE_SLOTS.map((s) => s.page))].filter((p) => !onlyPage || p === onlyPage);
  return (
    <section className="grid gap-10">
      <p className="text-sm">Every photo on the website. Changing a photo here updates it for all visitors.</p>
      {pages.map((page) => (
        <div key={page}>
          <h2 className="font-serif text-3xl">{page}</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {IMAGE_SLOTS.filter((s) => s.page === page).map((slot) => (
              <PhotoSlot key={slot.key} slot={slot} saved={content?.siteImages?.[slot.key]} token={token} onChanged={refresh} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
