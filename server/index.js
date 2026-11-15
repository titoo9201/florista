// Florista content/admin API — Express + MongoDB.
// Public:  GET /api/content, GET /api/images/:id, GET /api/health
// Admin:   POST /api/admin/login (passkey) → token, then Bearer token for everything under /api/admin
import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Binary, MongoClient, ObjectId } from 'mongodb';

// ---------- config (all from environment variables) ----------
const {
  MONGODB_URI,
  MONGODB_DB = 'florista',
  ADMIN_PASSKEY,
  TOKEN_SECRET,
  ALLOWED_ORIGINS,
  PORT = 5000,
} = process.env;

const missing = ['MONGODB_URI', 'ADMIN_PASSKEY', 'TOKEN_SECRET', 'ALLOWED_ORIGINS'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const COLLECTIONS = ['home', 'bouquets', 'candles'];
const IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png'];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

// ---------- database ----------
const client = new MongoClient(MONGODB_URI);
let db;
try {
  await client.connect();
  db = client.db(MONGODB_DB);
} catch (error) {
  if (error?.codeName === 'AtlasError' && error?.code === 8000) {
    console.error('MongoDB authentication failed. Check the database username/password in server/.env and URL-encode special password characters.');
  } else {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
  process.exit(1);
}
const products = db.collection('products');
const siteImages = db.collection('siteImages');
const uploads = db.collection('uploads');
const meta = db.collection('meta');
await products.createIndex({ collection: 1, order: 1 });
console.log(`Connected to MongoDB database "${MONGODB_DB}"`);

// ---------- helpers ----------
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : undefined);

function cleanImage(img) {
  if (!img || typeof img !== 'object') return undefined;
  const src = str(img.src, 500);
  if (!src) return undefined;
  return { src, alt: str(img.alt, 300), width: num(img.width), height: num(img.height) };
}

/** Whitelists product fields coming from the admin panel. */
function cleanProduct(body, { partial = false } = {}) {
  const out = {};
  if (!partial || 'name' in body) out.name = str(body.name, 120);
  if (!partial || 'description' in body) out.description = str(body.description, 500);
  if (!partial || 'price' in body) out.price = str(body.price, 40);
  if (!partial || 'categories' in body) {
    out.categories = Array.isArray(body.categories) ? body.categories.map((c) => str(c, 40)).filter(Boolean).slice(0, 10) : [];
  }
  if (!partial || 'link' in body) out.link = str(body.link, 200) || null;
  if (!partial || 'hidden' in body) out.hidden = Boolean(body.hidden);
  if (!partial || 'image' in body) out.image = cleanImage(body.image) ?? { src: '', alt: '' };
  return out;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'item';
const toApi = ({ _id, ...doc }) => ({ id: _id, ...doc });

/** Deletes an uploaded image if `src` points at one of ours (/api/images/<id>). */
async function deleteUpload(src) {
  const m = typeof src === 'string' && src.match(/^\/api\/images\/([a-f0-9]{24})$/);
  if (m) await uploads.deleteOne({ _id: new ObjectId(m[1]) });
}

async function deleteUploads(sources) {
  const uniqueSources = [...new Set(sources.filter(Boolean))];
  await Promise.all(uniqueSources.map(deleteUpload));
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- app ----------
const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy (needed for rate limiting by IP)
app.use(
  cors({
    origin: ALLOWED_ORIGINS.split(',').map((o) => o.trim().replace(/\/$/, '')),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Everything the public website needs, in one request.
app.get(
  '/api/content',
  wrap(async (_req, res) => {
    const [state, items, images] = await Promise.all([
      meta.findOne({ _id: 'site' }),
      products.find().sort({ collection: 1, order: 1 }).toArray(),
      siteImages.find().toArray(),
    ]);
    res.set('Cache-Control', 'no-cache');
    res.json({
      seeded: Boolean(state?.seeded),
      products: items.map(toApi),
      siteImages: Object.fromEntries(images.map(({ _id, ...img }) => [_id, img])),
    });
  }),
);

// Uploaded photos (stored in MongoDB). Ids never change, so browsers/CDNs may cache forever.
app.get(
  '/api/images/:id',
  wrap(async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.sendStatus(404);
    const doc = await uploads.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.sendStatus(404);
    res.set({ 'Content-Type': doc.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' });
    res.send(doc.data.buffer);
  }),
);

// ---------- admin auth ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8, // 8 attempts per 15 minutes per IP — protects the 6-digit passkey from guessing
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
});

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const ok = crypto.timingSafeEqual(sha(req.body?.passkey ?? ''), sha(ADMIN_PASSKEY));
  if (!ok) return res.status(401).json({ error: 'Incorrect passkey' });
  const token = jwt.sign({ role: 'admin' }, TOKEN_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    if (jwt.verify(token, TOKEN_SECRET).role !== 'admin') throw new Error('role');
    next();
  } catch {
    res.status(401).json({ error: 'Session expired — please enter the passkey again.' });
  }
}
app.use('/api/admin', requireAdmin);

app.get('/api/admin/me', (_req, res) => res.json({ ok: true }));

// First run: copy the website's current items into the database.
app.post(
  '/api/admin/seed',
  wrap(async (req, res) => {
    const state = await meta.findOne({ _id: 'site' });
    if (state?.seeded) return res.status(409).json({ error: 'Already imported' });
    const list = Array.isArray(req.body?.products) ? req.body.products : [];
    const docs = list
      .filter((p) => COLLECTIONS.includes(p.collection) && str(p.id, 80))
      .map((p, i) => ({
        _id: str(p.id, 80),
        collection: p.collection,
        order: num(p.order) ?? i,
        ...cleanProduct(p),
        originalImage: cleanImage(p.image),
        updatedAt: new Date(),
      }));
    if (docs.length) await products.insertMany(docs, { ordered: false }).catch((e) => { if (e.code !== 11000) throw e; });
    await meta.updateOne({ _id: 'site' }, { $set: { seeded: true, seededAt: new Date() } }, { upsert: true });
    res.json({ imported: docs.length });
  }),
);

// ---------- products ----------
app.post(
  '/api/admin/products',
  wrap(async (req, res) => {
    const collection = req.body?.collection;
    if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Unknown collection' });
    const fields = cleanProduct(req.body);
    if (!fields.name) return res.status(400).json({ error: 'Name is required' });
    const last = await products.find({ collection }).sort({ order: -1 }).limit(1).next();
    const doc = {
      _id: `${slug(fields.name)}-${crypto.randomBytes(3).toString('hex')}`,
      collection,
      order: (last?.order ?? -1) + 1,
      ...fields,
      updatedAt: new Date(),
    };
    await products.insertOne(doc);
    res.status(201).json(toApi(doc));
  }),
);

app.put(
  '/api/admin/products/:id',
  wrap(async (req, res) => {
    const fields = cleanProduct(req.body ?? {}, { partial: true });
    if ('name' in fields && !fields.name) return res.status(400).json({ error: 'Name is required' });
    const before = await products.findOne({ _id: req.params.id });
    if (!before) return res.status(404).json({ error: 'Not found' });
    const update = { $set: { ...fields, updatedAt: new Date() } };
    const replacingImage = fields.image && before.image?.src !== fields.image.src;
    const previousImageSources = replacingImage
      ? [before.image?.src, ...(before.imageHistory || []).map((image) => image.src)]
      : [];
    if (replacingImage) update.$unset = { imageHistory: '' };
    const after = await products.findOneAndUpdate(
      { _id: req.params.id },
      update,
      { returnDocument: 'after' },
    );
    if (replacingImage) await deleteUploads(previousImageSources);
    res.json(toApi(after));
  }),
);

app.delete(
  '/api/admin/products/:id',
  wrap(async (req, res) => {
    const doc = await products.findOneAndDelete({ _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await deleteUploads([
      doc.image?.src,
      doc.originalImage?.src,
      ...(doc.imageHistory || []).map((image) => image.src),
    ]);
    res.json({ ok: true });
  }),
);

app.put(
  '/api/admin/order',
  wrap(async (req, res) => {
    const { collection, ids } = req.body ?? {};
    if (!COLLECTIONS.includes(collection) || !Array.isArray(ids)) return res.status(400).json({ error: 'Bad request' });
    await products.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: String(id), collection }, update: { $set: { order } } } })));
    res.json({ ok: true });
  }),
);

// ---------- uploads ----------
app.post(
  '/api/admin/uploads',
  wrap(async (req, res) => {
    const m = String(req.body?.dataUrl ?? '').match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!m || !IMAGE_TYPES.includes(m[1])) return res.status(400).json({ error: 'Please upload a JPG, PNG or WebP image.' });
    const data = Buffer.from(m[2], 'base64');
    if (data.length > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'Image is too large (max 3 MB after compression).' });
    const { insertedId } = await uploads.insertOne({
      contentType: m[1],
      data: new Binary(data),
      size: data.length,
      width: num(req.body.width),
      height: num(req.body.height),
      createdAt: new Date(),
    });
    res.status(201).json({ src: `/api/images/${insertedId}` });
  }),
);

// ---------- page photos (overrides keyed by slot, e.g. "home.hero") ----------
const KEY = /^[a-z0-9][a-z0-9.-]{0,60}$/;

app.put(
  '/api/admin/site-images/:key',
  wrap(async (req, res) => {
    if (!KEY.test(req.params.key)) return res.status(400).json({ error: 'Bad key' });
    const image = cleanImage(req.body);
    if (!image) return res.status(400).json({ error: 'Image is required' });
    const before = await siteImages.findOne({ _id: req.params.key });
    const update = { $set: { ...image, updatedAt: new Date() } };
    const replacingImage = before && before.src !== image.src;
    const previousImageSources = replacingImage
      ? [before.src, ...(before.previousImages || []).map((item) => item.src)]
      : [];
    if (replacingImage) update.$unset = { previousImages: '' };
    await siteImages.updateOne({ _id: req.params.key }, update, { upsert: true });
    if (replacingImage) await deleteUploads(previousImageSources);
    res.json({ key: req.params.key, ...image });
  }),
);

app.delete(
  '/api/admin/site-images/:key',
  wrap(async (req, res) => {
    const doc = await siteImages.findOneAndDelete({ _id: req.params.key });
    if (doc) await deleteUploads([doc.src, ...(doc.previousImages || []).map((image) => image.src)]);
    res.json({ ok: true });
  }),
);

// ---------- errors ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.type === 'entity.too.large' ? 413 : 500).json({ error: err.type === 'entity.too.large' ? 'Upload too large' : 'Server error' });
});

app.listen(PORT, () => console.log(`Florista API listening on :${PORT}`));
