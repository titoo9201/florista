// Florista content/admin API — Express + MongoDB.
// Public:  GET /api/content, GET /api/images/:id, GET /api/health
// Admin:   POST /api/admin/login (passkey) → token, then Bearer token for everything under /api/admin
import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Binary, MongoClient, ObjectId } from 'mongodb';
import { addressText, brandFrom, buildReply, formatDate, itemsSummary, orderTotals, formatAmount, ownerEnquiryEmail, thankYouEmail } from './emailTemplates.js';

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

// Optional: enquiry emails (EmailJS, sent from this server) and the default WhatsApp number.
// These stay on the server so they never appear in the website's JavaScript.
const {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY,
  EMAILJS_CUSTOMER_TEMPLATE_ID, // optional 2nd template: emails TO the customer (thank-you + admin replies)
  ENQUIRY_TO_EMAIL,
  WHATSAPP_NUMBER,
} = process.env;

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
const siteContent = db.collection('siteContent'); // editable website text/settings, one doc per section path
// Dashboard data: one small counter document per day, anonymous visitor ids (auto-deleted after
// 120 days) and the enquiries received through the Contact form.
const daily = db.collection('dailyStats');
const visits = db.collection('visits');
const enquiries = db.collection('enquiries');
await products.createIndex({ collection: 1, order: 1 });
await visits.createIndex({ createdAt: 1 }, { expireAfterSeconds: 120 * 24 * 60 * 60 });
await enquiries.createIndex({ createdAt: -1 });

/** Today's date in India as "YYYY-MM-DD" (the dashboard counts days in IST). */
const today = (date = new Date()) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
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
    const [state, items, images, sections] = await Promise.all([
      meta.findOne({ _id: 'site' }),
      products.find().sort({ collection: 1, order: 1 }).toArray(),
      siteImages.find().toArray(),
      siteContent.find().toArray(),
    ]);
    const sectionMap = Object.fromEntries(sections.map(({ _id, value }) => [_id, value]));
    // Until the admin saves WhatsApp settings, use the number from the server's environment.
    if (WHATSAPP_NUMBER && !sectionMap['site.whatsapp']) sectionMap['site.whatsapp'] = { number: WHATSAPP_NUMBER };
    res.set('Cache-Control', 'no-cache');
    res.json({
      seeded: Boolean(state?.seeded),
      products: items.map(toApi),
      siteImages: Object.fromEntries(images.map(({ _id, ...img }) => [_id, img])),
      sections: sectionMap,
      contactEmail: ENQUIRY_TO_EMAIL || null, // shown on the website; changed only by the developer (server env)
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

// ---------- enquiry form (Contact page) ----------
// The owner's address comes only from ENQUIRY_TO_EMAIL (server env), never from the browser — so nobody
// can use this endpoint to send email to other people. The customer only ever gets our fixed thank-you.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many enquiries from this device. Please try again in a few minutes.' },
});

const PINCODE_RE = /^[1-9]\d{5}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks and cleans the Contact form. Product names/prices are taken from the database (not from the
 * browser), so the shop always sees its real prices. Returns { data } or { error }.
 */
async function cleanEnquiry(body) {
  const name = str(body.name, 100);
  const email = str(body.email, 200);
  const phone = str(body.phone, 30);
  const message = str(body.message, 3000);
  const phoneDigits = phone.replace(/[\s\-()]/g, '').replace(/^(\+91|0091|0)/, '');
  if (name.length < 2) return { error: 'Please enter your name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };
  if (phone && !/^[6-9]\d{9}$/.test(phoneDigits)) return { error: 'Please enter a valid 10-digit phone number.' };

  // Products: [{ id, qty }] — up to 10 different products, 1–50 of each.
  const wanted = (Array.isArray(body.items) ? body.items : [])
    .slice(0, 10)
    .map((item) => ({ id: str(item?.id, 80), qty: Math.min(50, Math.max(1, Math.round(Number(item?.qty) || 1))), name: str(item?.name, 120), price: str(item?.price, 40) }))
    .filter((item) => item.id || item.name);
  const found = wanted.length ? await products.find({ _id: { $in: wanted.map((w) => w.id).filter(Boolean) } }).toArray() : [];
  const items = wanted
    .map((w) => {
      const product = found.find((f) => f._id === w.id);
      // Built-in items (before the shop's products are imported) are not in the database yet.
      return product ? { id: product._id, name: product.name, price: product.price || '', qty: w.qty, collection: product.collection } : w.name ? { id: w.id, name: w.name, price: w.price, qty: w.qty } : null;
    })
    .filter(Boolean);
  const product = str(body.product, 120) || itemsSummary(items);
  if (!items.length && message.length < 10) return { error: 'Please choose a product or tell us a little about your idea (at least 10 characters).' };

  // Delivery details (sent by the current form; older versions of the form did not have them).
  let delivery = null;
  const method = body.delivery?.method;
  if (method === 'delivery' || method === 'pickup') {
    delivery = { method };
    if (method === 'delivery') {
      delivery.recipient = str(body.delivery.recipient, 100);
      delivery.address = str(body.delivery.address, 300);
      delivery.area = str(body.delivery.area, 150);
      delivery.city = str(body.delivery.city, 60);
      delivery.pincode = str(body.delivery.pincode, 6);
      if (!phoneDigits) return { error: 'Please enter your phone number so we can reach you for the delivery.' };
      if (delivery.address.length < 5) return { error: 'Please enter the delivery address.' };
      if (delivery.city.length < 2) return { error: 'Please enter the city.' };
      if (!PINCODE_RE.test(delivery.pincode)) return { error: 'Please enter a valid 6-digit pincode.' };
    }
  }
  const date = str(body.date, 10);
  if (date) {
    const max = today(new Date(Date.now() + 366 * 24 * 60 * 60 * 1000));
    if (!DATE_RE.test(date) || date < today() || date > max) return { error: 'Please choose a date from today onwards.' };
  }
  const occasion = str(body.occasion, 40);
  return { data: { name, email, phone, product, message, items, delivery, date, occasion } };
}

/** Next order/enquiry number: FL-1001, FL-1002, … */
async function nextOrderNo() {
  const doc = await meta.findOneAndUpdate({ _id: 'orderSeq' }, { $inc: { n: 1 } }, { upsert: true, returnDocument: 'after' });
  return `FL-${1000 + (doc?.n ?? doc?.value?.n ?? 1)}`;
}

app.post(
  '/api/enquiry',
  enquiryLimiter,
  wrap(async (req, res) => {
    const body = req.body ?? {};
    if (body.company) return res.json({ ok: true }); // honeypot field filled → a bot; pretend success
    const { data, error } = await cleanEnquiry(body);
    if (error) return res.status(400).json({ error });

    // Every enquiry is kept for the admin dashboard, so nothing is lost even if the email fails.
    const orderNo = await nextOrderNo();
    const createdAt = new Date();
    const enquiry = { orderNo, ...data, createdAt, emailed: false };
    const { insertedId } = await enquiries.insertOne(enquiry);
    await daily.updateOne({ _id: today() }, { $inc: { enquiries: 1 } }, { upsert: true });

    const receivedAt = createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
    const brand = await currentBrand();
    const [result, thanks] = await Promise.all([
      sendEnquiryEmail({ ...enquiry, receivedAt }, brand),
      // With the customer template set up, the thank-you comes from here (EmailJS's own auto-reply must be off).
      EMAILJS_CUSTOMER_TEMPLATE_ID ? sendCustomerEmail({ to: data.email, toName: data.name, ...thankYouEmail(enquiry, brand) }) : null,
    ]);
    // Saved either way; if the email failed, the reason is shown on the enquiry in the dashboard.
    await enquiries.updateOne(
      { _id: insertedId },
      { $set: { ...(result.ok ? { emailed: true } : { emailError: result.error }), ...(thanks ? { thanked: thanks.ok } : {}) } },
    );
    // The enquiry is received (it is in the dashboard), so the customer gets the normal thank-you message.
    res.json({ ok: true, orderNo });
  }),
);

/**
 * Sends one email through EmailJS's REST API from this server.
 * Requirements in the EmailJS dashboard (Account → Security):
 *  • "Allow EmailJS API for non-browser applications" must be ON — otherwise EmailJS answers 403
 *    ("API access from non-browser environments is currently disabled").
 *  • If "Use Private Key" is ON, EMAILJS_PRIVATE_KEY must be set (sent as `accessToken`).
 * Returns { ok } or { ok: false, error } with EmailJS's own message.
 */
async function emailjsSend(templateId, params) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        ...(EMAILJS_PRIVATE_KEY ? { accessToken: EMAILJS_PRIVATE_KEY } : {}),
        template_params: params,
      }),
    });
    if (response.ok) return { ok: true };
    const error = `EmailJS ${response.status}: ${(await response.text()).slice(0, 240)}`;
    console.error(error);
    return { ok: false, error };
  } catch (err) {
    const error = `Could not reach EmailJS: ${err.message}`;
    console.error(error);
    return { ok: false, error };
  }
}

/**
 * New-enquiry notification to the shop (recipient always ENQUIRY_TO_EMAIL).
 * With the customer template set up, the shop gets the full designed email (products, prices, address…);
 * otherwise the "Contact Us" template (EMAILJS_TEMPLATE_ID) is used with every detail in {{message}}.
 */
async function sendEnquiryEmail(e, brand) {
  // The recipient is fixed by the developer (ENQUIRY_TO_EMAIL on the server) — the admin panel cannot change it.
  if (!ENQUIRY_TO_EMAIL || !EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !(EMAILJS_CUSTOMER_TEMPLATE_ID || EMAILJS_TEMPLATE_ID)) {
    const error = 'Email is not set up on the server (EMAILJS_SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY / ENQUIRY_TO_EMAIL missing).';
    console.error(error);
    return { ok: false, error };
  }
  if (EMAILJS_CUSTOMER_TEMPLATE_ID) {
    return sendCustomerEmail({ to: ENQUIRY_TO_EMAIL, toName: brand?.name || 'Florista', replyTo: e.email, ...ownerEnquiryEmail(e, brand || brandFrom({}, WHATSAPP_NUMBER)) });
  }
  const { lines, total } = orderTotals(e.items || []);
  const details = [
    e.orderNo && `Enquiry no.: ${e.orderNo}`,
    lines.length && `Products:\n${lines.map((l) => `• ${l.qty} × ${l.name} — ${l.line === null ? 'price on request' : formatAmount(l.line)}`).join('\n')}`,
    lines.length && `Estimated total: ${total === null ? 'to be confirmed' : formatAmount(total)}`,
    e.delivery && `${e.delivery.method === 'pickup' ? 'Pickup' : `Deliver to: ${e.delivery.recipient || e.name}`}\n${addressText(e.delivery)}`,
    e.date && `Preferred date: ${formatDate(e.date)}`,
    e.occasion && `Occasion: ${e.occasion}`,
  ].filter(Boolean);
  return emailjsSend(EMAILJS_TEMPLATE_ID, {
    to_email: ENQUIRY_TO_EMAIL,
    name: e.name,
    email: e.email,
    phone: e.phone || 'Not provided',
    product: e.product || 'Not specified',
    message: [e.message, details.join('\n\n')].filter(Boolean).join('\n\n— — —\n'),
    submitted_at: e.receivedAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }),
  });
}

/**
 * Email to a customer (template EMAILJS_CUSTOMER_TEMPLATE_ID). That EmailJS template only contains
 * Subject {{subject}}, To Email {{to_email}}, Reply To {{reply_to}} and content {{{message_html}}} —
 * the actual design comes from server/emailTemplates.js.
 */
async function sendCustomerEmail({ to, toName, subject, html, replyTo }) {
  if (!EMAILJS_CUSTOMER_TEMPLATE_ID || !EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
    return { ok: false, code: 'not_configured', error: 'Customer emails are not set up yet (EMAILJS_CUSTOMER_TEMPLATE_ID is missing on the server).' };
  }
  return emailjsSend(EMAILJS_CUSTOMER_TEMPLATE_ID, {
    to_email: to,
    email: to, // same address under the old auto-reply name, in case the template's To Email still says {{email}}
    to_name: toName,
    name: toName,
    subject,
    message_html: html,
    reply_to: replyTo || ENQUIRY_TO_EMAIL || '',
  });
}

/** Shop details for customer emails, from the admin's saved settings. */
async function currentBrand() {
  const docs = await siteContent.find({ _id: { $in: ['site.whatsapp', 'site.business', 'site.instagram'] } }).toArray();
  return brandFrom(Object.fromEntries(docs.map(({ _id, value }) => [_id, value])), WHATSAPP_NUMBER);
}

if (EMAILJS_SERVICE_ID && !EMAILJS_PRIVATE_KEY) {
  console.warn('EMAILJS_PRIVATE_KEY is empty — if "Use Private Key" is on in EmailJS, enquiry emails will be rejected.');
}

// ---------- visitor stats (anonymous) ----------
// The website sends: { type: 'pageview', path, vid } or { type: 'whatsapp', product?, vid }.
// `vid` is a random id kept in the visitor's browser — no names, emails or IP addresses are stored.
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;
const trackLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message: { ok: false } });
const statKey = (s, max = 60) => str(s, max).replace(/[.$]/g, '').replace(/\s+/g, ' ');

app.post(
  '/api/track',
  trackLimiter,
  express.text({ type: 'text/plain', limit: '2kb' }), // sent as text/plain (no preflight) — parsed below
  wrap(async (req, res) => {
    if (BOT_UA.test(req.headers['user-agent'] || '')) return res.status(204).end();
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).end();
      }
    }
    const { type, path, product, vid } = body ?? {};
    const day = today();
    const visitor = /^[a-zA-Z0-9-]{8,64}$/.test(vid || '') ? vid : null;

    if (type === 'pageview') {
      const page = statKey(String(path || '/').split(/[?#]/)[0]) || '/';
      if (!page.startsWith('/') || page.startsWith('/admin')) return res.status(204).end();
      const inc = { pageViews: 1, [`pages.${page === '/' ? 'home' : page.slice(1)}`]: 1 };
      if (visitor) {
        // First page view of this visitor today → count one visitor.
        const first = await visits.updateOne({ _id: `${day}:${visitor}` }, { $setOnInsert: { createdAt: new Date() } }, { upsert: true });
        if (first.upsertedCount) inc.visitors = 1;
      }
      await daily.updateOne({ _id: day }, { $inc: inc }, { upsert: true });
    } else if (type === 'whatsapp') {
      const name = statKey(product, 80);
      const inc = { whatsapp: 1, ...(name ? { [`orders.${name}`]: 1 } : {}) };
      await daily.updateOne({ _id: day }, { $inc: inc }, { upsert: true });
    }
    res.status(204).end();
  }),
);

// ---------- admin auth ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8, // 8 wrong attempts per 15 minutes per IP — protects the passkey from guessing
  skipSuccessfulRequests: true, // correct passkeys never use up the allowance
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
});

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

// Two passkeys open the admin panel:
//  • MASTER passkey = ADMIN_PASSKEY in the server environment. Always valid; it can only be changed by the
//    developer (edit the env + redeploy). Nothing in the admin panel can remove or replace it.
//  • ADMIN passkey  = set/changed by the admin in the panel (Security). Stored only as a scrypt hash in
//    meta { _id: 'auth' }. Changing it replaces the previous admin passkey; the master keeps working.
// ADMIN_PASSKEY_RESET=1 removes the admin passkey on start-up (the master is unaffected).
const scrypt = (passkey, salt) =>
  new Promise((resolve, reject) => crypto.scrypt(String(passkey), salt, 64, (err, key) => (err ? reject(err) : resolve(key))));

if (process.env.ADMIN_PASSKEY_RESET === '1') {
  await meta.deleteOne({ _id: 'auth' });
  console.warn('ADMIN_PASSKEY_RESET=1 → admin passkey removed; the master passkey (ADMIN_PASSKEY) still works. Remove the flag now.');
}
let auth = (await meta.findOne({ _id: 'auth' })) || { version: 0 };

const isMasterPasskey = (passkey) => crypto.timingSafeEqual(sha(passkey ?? ''), sha(ADMIN_PASSKEY));

async function isAdminPasskey(passkey) {
  if (!auth.hash || !auth.salt) return false;
  const key = await scrypt(passkey ?? '', Buffer.from(auth.salt, 'hex'));
  return crypto.timingSafeEqual(key, Buffer.from(auth.hash, 'hex'));
}

/** True for the master passkey (env) OR the admin's own passkey — both always work. */
async function passkeyMatches(passkey) {
  const master = isMasterPasskey(passkey);
  const admin = await isAdminPasskey(passkey); // always computed, so timing does not reveal which one matched
  return master || admin;
}

// `pv` (passkey version) logs out every other session when the passkey is changed.
const issueToken = () => jwt.sign({ role: 'admin', pv: auth.version || 0 }, TOKEN_SECRET, { expiresIn: '12h' });

app.post(
  '/api/admin/login',
  loginLimiter,
  wrap(async (req, res) => {
    if (!(await passkeyMatches(req.body?.passkey))) return res.status(401).json({ error: 'Incorrect passkey' });
    res.json({ token: issueToken() });
  }),
);

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    const payload = jwt.verify(token, TOKEN_SECRET);
    if (payload.role !== 'admin' || (payload.pv || 0) !== (auth.version || 0)) throw new Error('stale');
    next();
  } catch {
    res.status(401).json({ error: 'Session expired — please enter the passkey again.' });
  }
}
app.use('/api/admin', requireAdmin);

app.get('/api/admin/me', (_req, res) => res.json({ ok: true }));

// Security tab: whether an admin passkey has been set (the master passkey always exists).
app.get('/api/admin/passkey', (_req, res) => res.json({ adminPasskeySet: Boolean(auth.hash), updatedAt: auth.updatedAt || null }));

// ---------- dashboard ----------
const sumMaps = (docs, field) => {
  const out = {};
  for (const d of docs) for (const [k, v] of Object.entries(d[field] || {})) out[k] = (out[k] || 0) + v;
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
};

app.get(
  '/api/admin/stats',
  wrap(async (req, res) => {
    const span = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const dates = [];
    for (let i = span - 1; i >= 0; i--) dates.push(today(new Date(Date.now() - i * 86400000)));
    const docs = await daily.find({ _id: { $in: dates } }).toArray();
    const byDay = Object.fromEntries(docs.map((d) => [d._id, d]));
    const days = dates.map((date) => ({
      date,
      visitors: byDay[date]?.visitors || 0,
      pageViews: byDay[date]?.pageViews || 0,
      whatsapp: byDay[date]?.whatsapp || 0,
      enquiries: byDay[date]?.enquiries || 0,
    }));
    const totals = days.reduce(
      (t, d) => ({ visitors: t.visitors + d.visitors, pageViews: t.pageViews + d.pageViews, whatsapp: t.whatsapp + d.whatsapp, enquiries: t.enquiries + d.enquiries }),
      { visitors: 0, pageViews: 0, whatsapp: 0, enquiries: 0 },
    );
    const recent = await enquiries.find().sort({ createdAt: -1 }).limit(25).toArray();
    res.json({
      days,
      totals,
      topPages: sumMaps(docs, 'pages').slice(0, 8).map(([page, views]) => ({ page, views })),
      topProducts: sumMaps(docs, 'orders').slice(0, 8).map(([name, clicks]) => ({ name, clicks })),
      enquiries: recent.map(({ _id, ...e }) => ({ id: String(_id), ...e })),
      customerEmails: Boolean(EMAILJS_CUSTOMER_TEMPLATE_ID),
    });
  }),
);

// "Send test email" button: sends one test enquiry to ENQUIRY_TO_EMAIL and reports EmailJS's exact answer.
app.post(
  '/api/admin/test-email',
  wrap(async (_req, res) => {
    const result = await sendEnquiryEmail(
      {
        orderNo: 'TEST',
        name: 'Florista website (test)',
        email: ENQUIRY_TO_EMAIL || 'test@example.com',
        phone: '',
        product: 'Test email',
        message: 'This is a test email sent from the admin dashboard. If you can read this, website enquiries are being delivered.',
      },
      await currentBrand(),
    );
    res.json({ ...result, to: ENQUIRY_TO_EMAIL ? ENQUIRY_TO_EMAIL.replace(/^(.{2}).*(@.*)$/, '$1…$2') : null });
  }),
);

app.delete(
  '/api/admin/enquiries/:id',
  wrap(async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Not found' });
    await enquiries.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  }),
);

// Admin replies to an enquiry with one of the ready-made templates (server/emailTemplates.js).
// The recipient is always the email address saved on that enquiry.
app.post(
  '/api/admin/enquiries/:id/reply',
  wrap(async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const enquiry = await enquiries.findOne({ _id: new ObjectId(req.params.id) });
    if (!enquiry) return res.status(404).json({ error: 'This enquiry no longer exists.' });
    const template = String(req.body?.template ?? '');
    const email = buildReply(template, req.body?.fields, await currentBrand());
    if (email.error) return res.status(400).json({ error: email.error });
    const result = await sendCustomerEmail({ to: enquiry.email, toName: enquiry.name, ...email });
    const entry = { template, subject: email.subject, at: new Date(), ok: result.ok, ...(result.ok ? {} : { error: result.error }) };
    await enquiries.updateOne({ _id: enquiry._id }, { $push: { replies: { $each: [entry], $slice: -20 } } });
    res.json(result);
  }),
);

app.put(
  '/api/admin/passkey',
  loginLimiter, // wrong "current passkey" attempts count towards the same limit as logins
  wrap(async (req, res) => {
    const current = String(req.body?.current ?? '');
    const next = String(req.body?.next ?? '').trim();
    // Either passkey (master or the current admin passkey) may be used to authorise the change.
    if (!(await passkeyMatches(current))) return res.status(401).json({ error: 'Current passkey is incorrect' });
    if (next.length < 6 || next.length > 64) return res.status(400).json({ error: 'New passkey must be 6–64 characters long.' });
    if (next === current) return res.status(400).json({ error: 'New passkey must be different from the current one.' });
    if (isMasterPasskey(next)) return res.status(400).json({ error: 'That is the master passkey — choose a different one for the admin passkey.' });
    const salt = crypto.randomBytes(16);
    const hash = await scrypt(next, salt);
    auth = { _id: 'auth', hash: hash.toString('hex'), salt: salt.toString('hex'), version: (auth.version || 0) + 1, updatedAt: new Date() };
    await meta.replaceOne({ _id: 'auth' }, auth, { upsert: true });
    res.json({ ok: true, token: issueToken() }); // this device stays logged in; all others are signed out
  }),
);

// First run: copy the website's current items into the database.
app.post(
  '/api/admin/seed',
  wrap(async (req, res) => {
    const state = await meta.findOne({ _id: 'site' });
    // mode "missing": add back built-in items that are not in the database (existing ones are untouched).
    const restoring = req.body?.mode === 'missing';
    if (state?.seeded && !restoring) return res.status(409).json({ error: 'Already imported' });
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

// ---------- website text & settings (one document per section, e.g. "home.hero") ----------
const SECTION_PATH = /^[a-z]+\.[a-zA-Z0-9]{1,60}$/;
const MAX_SECTION_BYTES = 100 * 1024;

/** Keeps only JSON-safe data (strings, numbers, booleans, arrays, plain objects) and trims long strings. */
function cleanValue(value, depth = 0) {
  if (depth > 8) return undefined;
  if (typeof value === 'string') return value.slice(0, 5000);
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'boolean' || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 100).map((v) => cleanValue(v, depth + 1)).filter((v) => v !== undefined);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 100)) {
      if (/^[a-zA-Z0-9_-]{1,60}$/.test(k)) {
        const cleaned = cleanValue(v, depth + 1);
        if (cleaned !== undefined) out[k] = cleaned;
      }
    }
    return out;
  }
  return undefined;
}

app.put(
  '/api/admin/content/:path',
  wrap(async (req, res) => {
    if (!SECTION_PATH.test(req.params.path)) return res.status(400).json({ error: 'Bad section' });
    const value = cleanValue(req.body?.value);
    if (value === undefined) return res.status(400).json({ error: 'Nothing to save' });
    if (Buffer.byteLength(JSON.stringify(value)) > MAX_SECTION_BYTES) return res.status(413).json({ error: 'This section is too large' });
    await siteContent.updateOne({ _id: req.params.path }, { $set: { value, updatedAt: new Date() } }, { upsert: true });
    res.json({ path: req.params.path, value });
  }),
);

// "Reset to original": remove the saved version so the website's built-in text is used again.
app.delete(
  '/api/admin/content/:path',
  wrap(async (req, res) => {
    if (!SECTION_PATH.test(req.params.path)) return res.status(400).json({ error: 'Bad section' });
    await siteContent.deleteOne({ _id: req.params.path });
    res.json({ ok: true });
  }),
);

// ---------- errors ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.type === 'entity.too.large' ? 413 : 500).json({ error: err.type === 'entity.too.large' ? 'Upload too large' : 'Server error' });
});

app.listen(PORT, () => console.log(`Florista API listening on :${PORT}`));
