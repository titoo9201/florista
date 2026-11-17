import { useMemo, useState } from 'react';
import { apiFetch, authHeaders, resolveAssetUrl, toStoredSrc } from '../lib/contentApi';
import { getMissingSeedProducts, getSeedProducts } from '../lib/seedContent';
import { useContent } from '../context/ContentContext';
import { uploadImage } from './imageTools';
import { PRODUCT_GUIDE } from './fieldGuide';
import Hint from './Hint';

const COLLECTIONS = [
  ['home', 'Home collection'],
  ['bouquets', 'Bouquets'],
  ['candles', 'Candles & decor'],
];
const FILTER_SECTION = { bouquets: 'bouquets.bouquetFilters', candles: 'candles.candleFilters' };
const LINK_OPTIONS = [
  ['', 'Nothing (card is not clickable)'],
  ['/bouquets#bouquet-collection', 'Bouquets page'],
  ['/candles-decor#candle-collection', 'Candles & Decor page'],
];

const blankPrice = (price) => (price?.includes('[price]') ? '' : price || '');

/** Converts the form back into what the API stores (relative photo links). */
const toPayload = (form) => ({
  name: form.name,
  description: form.description,
  price: form.price,
  categories: form.categories || [],
  link: form.link || '',
  hidden: Boolean(form.hidden),
  image: form.image?.src ? { ...form.image, src: toStoredSrc(form.image.src) } : { src: '', alt: form.image?.alt || '' },
});

function CategoryPicker({ collection, value, onChange }) {
  const { getSection } = useContent();
  const path = FILTER_SECTION[collection];
  if (!path) return null;
  const options = getSection(path).filter((f) => f.id !== 'all');
  const toggle = (id) => onChange(value.includes(id) ? value.filter((c) => c !== id) : [...value, id]);
  return (
    <fieldset className="mt-3">
      <legend className="text-xs">Categories</legend>
      <Hint guide={PRODUCT_GUIDE.categories} />
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {options.map((f) => (
          <label key={f.id} className="flex min-h-9 items-center gap-2 text-sm">
            <input type="checkbox" checked={value.includes(f.id)} onChange={() => toggle(f.id)} /> {f.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PhotoPicker({ image, onUploaded, token, busy, setBusy, setMessage, original }) {
  async function pick(file) {
    if (!file) return;
    setBusy(true);
    setMessage('Uploading photo…');
    try {
      const uploaded = await uploadImage(file, token);
      onUploaded({ ...image, ...uploaded });
      setMessage('Photo uploaded — click Save to apply it.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  const showOriginal = original?.src && toStoredSrc(original.src) !== toStoredSrc(image?.src);
  return (
    <div className="w-full shrink-0 sm:w-40">
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-media border border-line bg-cream sm:h-40">
        {image?.src ? (
          <img src={resolveAssetUrl(image.src)} alt={image.alt || ''} className="h-full w-full object-cover" />
        ) : (
          <span className="text-center text-xs">No photo yet</span>
        )}
      </div>
      <label className={`admin-secondary mt-2 block cursor-pointer text-center ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        {image?.src ? 'Change photo' : 'Add photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={(e) => pick(e.target.files[0])} />
      </label>
      <Hint guide={PRODUCT_GUIDE.photo} />
      {showOriginal && (
        <button type="button" className="mt-1 min-h-9 w-full text-left text-xs underline" onClick={() => { onUploaded(original); setMessage('Original photo selected — click Save to apply it.'); }}>
          Use original photo
        </button>
      )}
    </div>
  );
}

function ProductEditor({ product, token, isFirst, isLast, onMove, onSaved, onDeleted }) {
  const [form, setForm] = useState(() => ({ ...product, price: blankPrice(product.price), categories: product.categories || [] }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const original =
    product.originalImage ||
    getSeedProducts().find((item) => item.collection === product.collection && (item.id === product.id || item.originalId === product.id))?.image;
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const saved = await apiFetch(`/api/admin/products/${product.id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(toPayload(form)) });
      onSaved(saved);
      setMessage('Saved ✓ — live on the website.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${form.name}" from the website? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/products/${product.id}`, { method: 'DELETE', headers: authHeaders(token) });
      onDeleted(product.id);
    } catch (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  return (
    <article data-tour="product-card" aria-busy={busy} className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row">
        <PhotoPicker image={form.image} original={original} token={token} busy={busy} setBusy={setBusy} setMessage={setMessage} onUploaded={(image) => update('image', image)} />
        <div className="min-w-0 flex-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">Name<input value={form.name} onChange={(e) => update('name', e.target.value)} className="admin-input" /><Hint guide={PRODUCT_GUIDE.name} /></label>
            <label className="text-xs">Price<input value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="₹1,499" className="admin-input" /><Hint guide={PRODUCT_GUIDE.price} /></label>
          </div>
          <label className="mt-3 block text-xs">Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="admin-input" rows="2" /><Hint guide={PRODUCT_GUIDE.description} /></label>
          <label className="mt-3 block text-xs">Photo description<input value={form.image?.alt || ''} onChange={(e) => update('image', { ...form.image, alt: e.target.value })} className="admin-input" /><Hint guide={PRODUCT_GUIDE.alt} /></label>
          <CategoryPicker collection={product.collection} value={form.categories} onChange={(c) => update('categories', c)} />
          {product.collection === 'home' && (
            <label className="mt-3 block text-xs">
              When someone clicks the card, open
              <select className="admin-input" value={LINK_OPTIONS.some(([v]) => v === (form.link || '')) ? form.link || '' : form.link} onChange={(e) => update('link', e.target.value)}>
                {LINK_OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                {form.link && !LINK_OPTIONS.some(([v]) => v === form.link) && <option value={form.link}>Current: {form.link}</option>}
              </select>
              <Hint guide={PRODUCT_GUIDE.link} />
            </label>
          )}
          <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex min-h-11 flex-col items-start justify-center text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.hidden)} onChange={(e) => update('hidden', e.target.checked)} /> Hide from website</span><Hint guide={PRODUCT_GUIDE.hidden} /></label>
            <button type="button" className="admin-primary w-full sm:w-auto" disabled={busy} onClick={save}>{busy ? 'Please wait…' : 'Save'}</button>
            <div className="flex gap-2">
              <button type="button" className="admin-secondary" disabled={busy || isFirst} onClick={() => onMove(-1)} aria-label={`Move ${form.name} up`}>↑</button>
              <button type="button" className="admin-secondary" disabled={busy || isLast} onClick={() => onMove(1)} aria-label={`Move ${form.name} down`}>↓</button>
            </div>
            <button type="button" className="min-h-11 text-left text-sm text-error underline sm:ml-auto" disabled={busy} onClick={remove}>Delete</button>
          </div>
          {message && <p className="mt-2 text-xs" role="status">{message}</p>}
        </div>
      </div>
    </article>
  );
}

function NewProduct({ collection, token, onCreated }) {
  const empty = { name: '', description: '', price: '', categories: [], link: '', hidden: false, image: { src: '', alt: '' } };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function create() {
    if (!form.name.trim()) {
      setMessage('Please enter a name.');
      return;
    }
    setBusy(true);
    try {
      const created = await apiFetch('/api/admin/products', { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ collection, ...toPayload(form) }) });
      onCreated(created);
      setForm(empty);
      setMessage(`Added “${created.name}” ✓`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-tour="new-product" className="rounded-card border border-dashed border-rose bg-blush p-4">
      <h3 className="font-serif text-2xl">Add a new item</h3>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        <PhotoPicker image={form.image} token={token} busy={busy} setBusy={setBusy} setMessage={setMessage} onUploaded={(image) => update('image', image)} />
        <div className="min-w-0 flex-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">Name<input className="admin-input" value={form.name} onChange={(e) => update('name', e.target.value)} /><Hint guide={PRODUCT_GUIDE.name} /></label>
            <label className="text-xs">Price<input className="admin-input" placeholder="₹1,499" value={form.price} onChange={(e) => update('price', e.target.value)} /><Hint guide={PRODUCT_GUIDE.price} /></label>
          </div>
          <label className="mt-3 block text-xs">Description<textarea className="admin-input" rows="2" value={form.description} onChange={(e) => update('description', e.target.value)} /><Hint guide={PRODUCT_GUIDE.description} /></label>
          <label className="mt-3 block text-xs">Photo description<input className="admin-input" value={form.image.alt} onChange={(e) => update('image', { ...form.image, alt: e.target.value })} /><Hint guide={PRODUCT_GUIDE.alt} /></label>
          <CategoryPicker collection={collection} value={form.categories} onChange={(c) => update('categories', c)} />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className="admin-primary w-full sm:w-auto" disabled={busy} onClick={create}>{busy ? 'Please wait…' : 'Add item'}</button>
            {message && <span className="text-xs" role="status">{message}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsTab({ token, products, setProducts, onChanged, collection: selected, onCollectionChange }) {
  // The collection can be chosen from the admin side menu (controlled) or the tabs below.
  const [ownCollection, setOwnCollection] = useState('home');
  const collection = selected || ownCollection;
  const setCollection = onCollectionChange || setOwnCollection;
  const list = useMemo(
    () => products.filter((p) => p.collection === collection).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [products, collection],
  );

  const missing = useMemo(() => getMissingSeedProducts(products), [products]);
  const [restoreMsg, setRestoreMsg] = useState('');

  async function restoreMissing() {
    const names = missing.map((p) => `• ${p.name} (${p.collection})`).join('\n');
    if (!window.confirm(`Add these original items back to the website?\n\n${names}`)) return;
    try {
      const { imported } = await apiFetch('/api/admin/seed', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ mode: 'missing', products: missing }),
      });
      setRestoreMsg(`Restored ${imported} item${imported === 1 ? '' : 's'} ✓`);
      onChanged();
    } catch (error) {
      setRestoreMsg(error.message);
    }
  }

  async function move(index, delta) {
    const ids = list.map((p) => p.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    setProducts((all) => all.map((p) => (p.collection === collection ? { ...p, order: ids.indexOf(p.id) } : p)));
    await apiFetch('/api/admin/order', { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ collection, ids }) });
    onChanged();
  }

  return (
    <section>
      {missing.length > 0 && (
        <div data-tour="restore-missing" className="mb-5 flex flex-col gap-2 rounded-card border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{missing.length} original item{missing.length === 1 ? ' is' : 's are'} not on the website (deleted or never imported).</p>
          <button type="button" className="admin-secondary" onClick={restoreMissing}>Restore missing original items</button>
        </div>
      )}
      {restoreMsg && <p className="mb-4 text-xs" role="status">{restoreMsg}</p>}
      <div data-tour="collections" className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-2">
        {COLLECTIONS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setCollection(id)} className={`admin-tab shrink-0 ${collection === id ? 'admin-tab-active' : ''}`}>{label}</button>
        ))}
      </div>
      <div className="mt-5 grid gap-4">
        {list.map((product, i) => (
          <ProductEditor
            key={product.id}
            product={product}
            token={token}
            isFirst={i === 0}
            isLast={i === list.length - 1}
            onMove={(delta) => move(i, delta)}
            onSaved={(saved) => { setProducts((all) => all.map((p) => (p.id === saved.id ? saved : p))); onChanged(); }}
            onDeleted={(id) => { setProducts((all) => all.filter((p) => p.id !== id)); onChanged(); }}
          />
        ))}
        <NewProduct key={collection} collection={collection} token={token} onCreated={(created) => { setProducts((all) => [...all, created]); onChanged(); }} />
      </div>
    </section>
  );
}
