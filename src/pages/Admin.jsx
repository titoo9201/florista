import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authHeaders, apiFetch, resolveAssetUrl } from '../lib/contentApi';
import { getSeedProducts } from '../lib/seedContent';
import { useContent } from '../context/ContentContext';

const tabs = [
  ['home', 'Home collection'],
  ['bouquets', 'Bouquets'],
  ['candles', 'Candles & decor'],
];

const imageSlots = [
  ['home.hero', 'Home hero image'],
  ['home.custom-order', 'Home custom-order image'],
  ['bouquets.hero', 'Bouquets hero image'],
  ['candles.hero', 'Candles hero image'],
];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_HELP = 'Accepted: JPG, PNG or WebP • Maximum: 3 MB (3,145,728 bytes)';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProductEditor({ product, token, onSaved, onDeleted }) {
  const [form, setForm] = useState(() => ({ ...product, price: product.price?.includes('[price]') ? '' : product.price }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const seedImage = getSeedProducts().find((item) => item.id === product.id)?.image;
  const restoreImage = form.imageHistory?.[form.imageHistory.length - 1] || form.originalImage || seedImage;
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const saved = await apiFetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ ...form, categories: form.categories || [] }),
      });
      onSaved(saved);
      setMessage('Saved');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(file) {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('This image is too large. Maximum allowed size is 3 MB (3,145,728 bytes).');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const dataUrl = await readImage(file);
      update('image', { ...form.image, src: dataUrl });
      const uploaded = await apiFetch('/api/admin/uploads', {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      });
      update('image', { ...form.image, src: resolveAssetUrl(uploaded.src) });
      setMessage('Image uploaded — save the product to apply it.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${form.name}"?`)) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/products/${product.id}`, { method: 'DELETE', headers: authHeaders(token) });
      onDeleted(product.id);
    } catch (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  function restore() {
    if (!restoreImage) return;
    update('image', restoreImage);
    setMessage('Previous photo selected — click Save changes to restore it.');
  }

  return (
    <article className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full shrink-0 sm:w-40">
          <div className="flex h-48 items-center justify-center overflow-hidden rounded-media border border-line bg-cream p-2 sm:h-40">
            {form.image?.src ? (
              <img
                src={form.image.src}
                alt={form.image.alt || ''}
                onError={(event) => {
                  if (restoreImage?.src && event.currentTarget.src !== new URL(restoreImage.src, window.location.href).href) {
                    event.currentTarget.src = restoreImage.src;
                  } else {
                    event.currentTarget.style.display = 'none';
                  }
                }}
                className="max-h-full w-full object-contain"
              />
            ) : (
              <span className="text-center text-xs">No image</span>
            )}
          </div>
          {restoreImage && restoreImage.src !== form.image?.src && (
            <button type="button" className="mt-2 w-full text-left text-xs underline" onClick={restore}>
              Restore previous photo
            </button>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">Name<input value={form.name} onChange={(e) => update('name', e.target.value)} className="admin-input" /></label>
            <label className="text-xs">Price<input value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="₹1200" className="admin-input" /></label>
          </div>
          <label className="mt-3 block text-xs">Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="admin-input" rows="2" /></label>
          <label className="mt-3 block text-xs">Image alt text<input value={form.image?.alt || ''} onChange={(e) => update('image', { ...form.image, alt: e.target.value })} className="admin-input" /></label>
          <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="admin-secondary cursor-pointer text-center">Replace image<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files[0])} /></label>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.hidden)} onChange={(e) => update('hidden', e.target.checked)} /> Hide from website</label>
            <button type="button" className="admin-primary w-full sm:w-auto" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
            <button type="button" className="min-h-11 text-left text-sm text-error underline sm:ml-2" disabled={busy} onClick={remove}>Delete</button>
            {message && <span className="text-xs">{message}</span>}
          </div>
          <p className="mt-2 text-xs text-ink/70">{IMAGE_HELP}</p>
        </div>
      </div>
    </article>
  );
}

function NewProduct({ collection, token, onCreated }) {
  const [form, setForm] = useState({ collection, name: '', description: '', price: '', categories: [], image: { src: '', alt: '' } });
  const [message, setMessage] = useState('');
  async function create() {
    try {
      const created = await apiFetch('/api/admin/products', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(form) });
      onCreated(created);
      setForm({ ...form, name: '', description: '', price: '' });
      setMessage('Added');
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <div className="rounded-card border border-dashed border-rose bg-blush p-4">
      <h3 className="font-serif text-2xl">Add a new item</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <input className="admin-input" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="admin-input" placeholder="Price (e.g. ₹1200)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="admin-input" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row"><button type="button" className="admin-primary w-full sm:w-auto" onClick={create}>Add item</button>{message && <span className="self-center text-xs">{message}</span>}</div>
    </div>
  );
}

function ImageSlot({ slot, token, current, onSaved }) {
  const [image, setImage] = useState(current || { src: '', alt: '' });
  const [message, setMessage] = useState('');
  const previousImage = image.previousImages?.[image.previousImages.length - 1];
  async function upload(file) {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('This image is too large. Maximum allowed size is 3 MB (3,145,728 bytes).');
      return;
    }
    try {
      const dataUrl = await readImage(file);
      setImage({ ...image, src: dataUrl });
      const uploaded = await apiFetch('/api/admin/uploads', { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }) });
      setImage((current) => ({ ...current, src: resolveAssetUrl(uploaded.src) }));
    } catch (error) { setMessage(error.message); }
  }
  async function save() {
    try {
      const saved = await apiFetch(`/api/admin/site-images/${slot}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(image) });
      onSaved(slot, saved);
      setMessage('Saved');
    } catch (error) { setMessage(error.message); }
  }
  function restore() {
    if (!previousImage) return;
    setImage({ ...image, src: previousImage.src, alt: previousImage.alt });
    setMessage('Previous photo selected — click Save photo to restore it.');
  }
  return (
    <div className="rounded-card border border-line bg-card p-4">
      <h3 className="font-serif text-xl">{imageSlots.find(([key]) => key === slot)?.[1]}</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-media border border-line bg-cream p-2">
          {image.src ? <img src={image.src} alt={image.alt || ''} className="max-h-full w-full object-contain" /> : <span className="text-center text-xs">No image selected</span>}
        </div>
        <div>
          <div className="flex flex-wrap gap-3">
            <label className="admin-secondary cursor-pointer">Choose image<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files[0])} /></label>
            <button type="button" className="admin-secondary" disabled={!previousImage} onClick={restore}>Restore previous</button>
          </div>
          <input className="admin-input mt-3 w-full" placeholder="Image alt text" value={image.alt || ''} onChange={(e) => setImage({ ...image, alt: e.target.value })} />
          <button type="button" className="admin-primary mt-3" onClick={save}>Save photo</button>
          <p className="mt-2 text-xs text-ink/70">{IMAGE_HELP}</p>
          {message && <p className="mt-2 text-xs">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { content, refresh } = useContent();
  const [token, setToken] = useState(() => localStorage.getItem('florista_admin_token') || '');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const currentProducts = useMemo(() => products.filter((p) => p.collection === tab), [products, tab]);

  useEffect(() => {
    if (content?.products) setProducts(content.products);
    if (content?.siteImages) setImages(content.siteImages);
  }, [content]);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/admin/me', { headers: authHeaders(token) }).catch(() => {
      localStorage.removeItem('florista_admin_token');
      setToken('');
    });
  }, [token]);

  async function login(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await apiFetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ passkey }) });
      localStorage.setItem('florista_admin_token', result.token);
      setToken(result.token);
      setPasskey('');
      await refresh();
    } catch (err) { setError(err.message); }
  }

  async function seed() {
    try {
      await apiFetch('/api/admin/seed', { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ products: getSeedProducts() }) });
      await refresh();
    } catch (err) { setError(err.message); }
  }

  if (!token) return <main className="container-page flex min-h-screen items-center justify-center py-8 sm:py-12"><form onSubmit={login} className="w-full max-w-sm rounded-card bg-card p-5 shadow-card sm:p-8"><Link to="/" className="text-sm underline">← Back to website</Link><h1 className="mt-6 font-serif text-4xl">Florista admin</h1><p className="mt-2 text-sm">Enter your private passkey to manage products and photos.</p><input autoFocus type="password" inputMode="numeric" className="admin-input mt-6 w-full" value={passkey} onChange={(e) => setPasskey(e.target.value)} placeholder="Passkey" /><button className="admin-primary mt-4 w-full" type="submit">Open admin panel</button>{error && <p className="mt-3 text-sm text-error">{error}</p>}</form></main>;

  return <main className="container-page min-h-screen py-8 md:py-12"><div className="flex flex-wrap items-center justify-between gap-4"><div><Link to="/" className="text-sm underline">← View website</Link><h1 className="mt-3 font-serif text-4xl sm:text-5xl">Admin panel</h1><p className="mt-2 text-sm">Manage prices, images, visibility and new items.</p></div><button type="button" className="admin-secondary" onClick={() => { localStorage.removeItem('florista_admin_token'); setToken(''); }}>Log out</button></div>{content && !content.seeded && <div className="mt-8 rounded-card border border-rose bg-blush p-5"><h2 className="font-serif text-2xl">Import current website items</h2><p className="mt-1 text-sm">This one-time step copies the existing products into MongoDB so you can edit them.</p><button className="admin-primary mt-4 w-full sm:w-auto" onClick={seed}>Import products</button></div>}<div className="mt-8 flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-2">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`admin-tab shrink-0 ${tab === id ? 'admin-tab-active' : ''}`}>{label}</button>)}</div><div className="mt-5 grid gap-4">{currentProducts.map((product) => <ProductEditor key={product.id} product={product} token={token} onSaved={(saved) => setProducts((all) => all.map((p) => p.id === saved.id ? saved : p))} onDeleted={(id) => setProducts((all) => all.filter((p) => p.id !== id))} />)}<NewProduct collection={tab} token={token} onCreated={(created) => setProducts((all) => [...all, created])} /></div><section className="mt-12"><h2 className="font-serif text-3xl">Page photos</h2><p className="mt-1 text-sm">Replace the main photos without changing code.</p><div className="mt-4 grid gap-4">{imageSlots.map(([slot]) => <ImageSlot key={slot} slot={slot} token={token} current={images[slot]} onSaved={(key, image) => setImages((all) => ({ ...all, [key]: image }))} />)}</div></section></main>;
}
