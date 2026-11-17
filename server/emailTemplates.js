// Email templates (HTML) — shared by the server (which sends them) and the admin panel (live preview).
// Plain JavaScript with no Node/browser imports so both sides can use the exact same file.
//
// Written to stay out of Spam folders: no images, no emoji in subjects, few links, real text and the
// customer's own details — Gmail trusts simple, personal-looking mail more than "designed" newsletters.

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Text with line breaks → safe HTML. */
const para = (v) => esc(v).trim().replace(/\r?\n/g, '<br>');

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';

// ---------- money & dates (also used by the website form and the admin panel) ----------

/** "₹1,499", "Rs 2000", "2000" → 1499 / 2000. Placeholders like "₹[price]" or empty → null. */
export function parseAmount(price) {
  const text = String(price ?? '');
  if (!text.trim() || text.includes('[')) return null;
  const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export const formatAmount = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/** "2026-11-22" → "Sun, 22 Nov 2026". Anything else is returned unchanged. */
export function formatDate(value) {
  const m = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(value ?? '');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Line totals + total. `total` is null when any price is still "on request". */
export function orderTotals(items = [], extra = []) {
  const lines = items.map((item) => {
    const unit = parseAmount(item.price);
    const qty = Math.max(1, Number(item.qty) || 1);
    return { ...item, qty, unit, line: unit === null ? null : unit * qty };
  });
  const extras = extra.map(parseAmount);
  const knownSum = lines.reduce((sum, l) => sum + (l.line || 0), 0) + extras.reduce((sum, n) => sum + (n || 0), 0);
  const allKnown = lines.every((l) => l.line !== null) && lines.length > 0;
  return { lines, total: allKnown ? knownSum : null, knownSum };
}

/** Total for display: "₹5,898", or "₹3,298 + price on request" when some prices are not set yet. */
export function formatTotal({ total, knownSum }, onRequest) {
  if (total !== null) return formatAmount(total);
  return knownSum > 0 ? `${formatAmount(knownSum)} + ${onRequest.toLowerCase()}` : onRequest;
}

/** One-line summary, e.g. "2 × Peony candle, 1 × Ivory garden bouquet". */
export const itemsSummary = (items = []) => items.map((i) => `${i.qty || 1} × ${i.name}`).join(', ');

/** Full delivery address on several lines (or the pickup note). */
export function addressText(delivery = {}) {
  if (delivery.method === 'pickup') return 'Pickup from our studio';
  return [delivery.address, delivery.area, [delivery.city, delivery.pincode].filter(Boolean).join(' - ')].filter(Boolean).join('\n');
}

// ---------- business details ----------

/** Business details used in every email (from the admin's saved settings, with sensible defaults). */
export function brandFrom(sections = {}, fallbackWhatsApp = '') {
  const number = String(sections['site.whatsapp']?.number || fallbackWhatsApp || '').replace(/\D/g, '');
  const handle = String(sections['site.instagram']?.handle || '@florista_07').trim();
  return {
    name: 'Florista',
    location: sections['site.business']?.location || 'Ghaziabad, Uttar Pradesh',
    instagram: handle.startsWith('@') ? handle : `@${handle}`,
    whatsappUrl: /^\d{11,15}$/.test(number) ? `https://wa.me/${number}` : '',
  };
}

// ---------- building blocks ----------

const cellLabel = 'padding:8px 0;border-bottom:1px solid #f0e2dc;color:#7a6a64;font-size:13px;vertical-align:top';
const cellValue = 'padding:8px 0;border-bottom:1px solid #f0e2dc;color:#3a2e2a;font-size:14px;vertical-align:top';

function detailRows(rows) {
  const html = rows
    .filter(([, value]) => String(value ?? '').trim())
    .map(([label, value]) => `<tr><td style="${cellLabel};width:38%">${esc(label)}</td><td style="${cellValue}">${para(value)}</td></tr>`)
    .join('');
  return html ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 6px">${html}</table>` : '';
}

/** Products table: name, qty, price, line total, then extra rows (delivery…) and the total. */
function itemsTable(items, { extraRows = [], totalLabel = 'Total', onRequest = 'To be confirmed' } = {}) {
  if (!items?.length) return '';
  const totals = orderTotals(items, extraRows.map(([, v]) => v));
  const { lines } = totals;
  const head = `<tr>
      <td style="${cellLabel};font-size:12px">Item</td>
      <td style="${cellLabel};font-size:12px;text-align:center;width:44px">Qty</td>
      <td style="${cellLabel};font-size:12px;text-align:right;width:90px">Price</td>
    </tr>`;
  const body = lines
    .map(
      (l) => `<tr>
      <td style="${cellValue}">${esc(l.name)}${l.unit !== null && l.qty > 1 ? `<br><span style="font-size:12px;color:#7a6a64">${formatAmount(l.unit)} each</span>` : ''}</td>
      <td style="${cellValue};text-align:center">${l.qty}</td>
      <td style="${cellValue};text-align:right">${l.line === null ? esc(onRequest) : formatAmount(l.line)}</td>
    </tr>`,
    )
    .join('');
  const extras = extraRows
    .filter(([, v]) => String(v ?? '').trim())
    .map(([label, v]) => `<tr><td colspan="2" style="${cellLabel}">${esc(label)}</td><td style="${cellValue};text-align:right">${parseAmount(v) === null ? esc(v) : formatAmount(parseAmount(v))}</td></tr>`)
    .join('');
  const totalRow = `<tr>
      <td colspan="2" style="padding:12px 0 0;font-size:15px;font-weight:bold;color:#3a2e2a">${esc(totalLabel)}</td>
      <td style="padding:12px 0 0;font-size:15px;font-weight:bold;color:#3a2e2a;text-align:right">${esc(formatTotal(totals, onRequest))}</td>
    </tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 8px">${head}${body}${extras}${totalRow}</table>`;
}

const sectionTitle = (text) => `<p style="margin:22px 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#b4546b">${esc(text)}</p>`;

function button(href, label) {
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;background:#b4546b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px">${esc(label)}</a>`;
}

/**
 * Page shell. `blocks` are ready HTML strings placed in order.
 * `footer` replaces the customer footer (used for the shop's own notification).
 */
function layout({ eyebrow, heading, blocks, brand, signoff = true, footer, buttons = [] }) {
  const defaultFooter = `${esc(brand.name)} &middot; ${esc(brand.location)} &middot; Instagram ${esc(brand.instagram)}<br>
          You are receiving this because you sent an enquiry on our website. Simply reply to this email to reach us.`;
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#fff8f3">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f3">
    <tr><td align="center" style="padding:28px 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px">
        <tr><td style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#3a2e2a;line-height:1.6">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b4546b">${esc(eyebrow || `${brand.name} · Handmade with love`)}</p>
          <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;line-height:1.3;color:#3a2e2a">${esc(heading)}</h1>
          ${blocks.filter(Boolean).join('\n')}
          ${buttons.length ? `<p style="margin:24px 0 0">${buttons.join('')}</p>` : ''}
          ${signoff ? `<p style="margin:28px 0 0;font-size:15px">Warm wishes,<br>Team ${esc(brand.name)}</p>` : ''}
        </td></tr>
        <tr><td style="padding:16px 28px 26px;border-top:1px solid #f0e2dc;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a7a74;line-height:1.5">
          ${footer ?? defaultFooter}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const p = (html) => `<p style="margin:0 0 14px;font-size:15px">${html}</p>`;
const orderBadge = (orderNo) =>
  orderNo
    ? `<p style="margin:0 0 18px;display:inline-block;padding:6px 12px;border:1px solid #e7c9c2;border-radius:8px;font-size:13px;color:#3a2e2a">Order / enquiry no. <strong>${esc(orderNo)}</strong></p>`
    : '';
const quoteBlock = (title, text) =>
  String(text ?? '').trim() ? `${sectionTitle(title)}<p style="margin:0;padding:14px 16px;background:#fbefeb;border-radius:10px;font-size:14px">${para(text)}</p>` : '';
const whatsappButton = (brand) => (brand.whatsappUrl ? [button(brand.whatsappUrl, 'Chat with us on WhatsApp')] : []);

function deliveryRows(e) {
  const d = e.delivery || {};
  if (!d.method && !e.date && !e.occasion) return '';
  return (
    sectionTitle(d.method === 'pickup' ? 'Pickup' : 'Delivery') +
    detailRows([
      ['Deliver to', d.method === 'pickup' ? '' : d.recipient || e.name],
      ['Address', addressText(d)],
      [d.method === 'pickup' ? 'Pickup date' : 'Preferred date', formatDate(e.date)],
      ['Occasion', e.occasion],
    ])
  );
}

// ---------- automatic emails ----------

/** Sent automatically to the customer right after they submit the Contact form. */
export function thankYouEmail(e, brand) {
  const hasItems = e.items?.length > 0;
  return {
    subject: e.orderNo ? `We have received your enquiry ${e.orderNo} - ${brand.name}` : `We have received your enquiry - ${brand.name}`,
    html: layout({
      brand,
      heading: `Thank you, ${firstName(e.name)}`,
      blocks: [
        p(`Thank you for writing to ${esc(brand.name)}. We have received your enquiry and will get back to you within 24 hours to confirm the price and delivery.`),
        orderBadge(e.orderNo),
        hasItems ? sectionTitle('What you chose') + itemsTable(e.items, { totalLabel: 'Estimated total', onRequest: 'Price on request' }) : '',
        hasItems ? `<p style="margin:0;font-size:12px;color:#7a6a64">The final price is confirmed by us before you pay.</p>` : '',
        deliveryRows(e),
        quoteBlock('Your message', e.message),
        p('<br>If you would like to change anything, just reply to this email.'),
      ],
      buttons: whatsappButton(brand),
    }),
  };
}

/** Notification to the shop with every detail of a new enquiry (sent to ENQUIRY_TO_EMAIL). */
export function ownerEnquiryEmail(e, brand) {
  const digits = String(e.phone || '').replace(/\D/g, '').replace(/^0+/, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  return {
    subject: `New enquiry ${e.orderNo || ''} from ${e.name}${e.items?.length ? ` - ${itemsSummary(e.items)}` : ''}`.replace(/\s+/g, ' ').slice(0, 150),
    html: layout({
      brand,
      eyebrow: `${brand.name} · New website enquiry`,
      heading: `New enquiry from ${e.name}`,
      signoff: false,
      footer: `Sent automatically by your website. Every enquiry is also saved in the admin panel (Dashboard → Recent enquiries), where you can reply with a ready-made email.`,
      blocks: [
        orderBadge(e.orderNo),
        sectionTitle('Customer'),
        detailRows([
          ['Name', e.name],
          ['Email', e.email],
          ['Phone', e.phone],
          ['Received', e.receivedAt],
        ]),
        e.items?.length ? sectionTitle('Products') + itemsTable(e.items, { totalLabel: 'Estimated total', onRequest: 'Price on request' }) : '',
        deliveryRows(e),
        quoteBlock('Message', e.message),
      ],
      buttons: [button(`mailto:${e.email}?subject=${encodeURIComponent(`Your ${brand.name} enquiry ${e.orderNo || ''}`.trim())}`, 'Reply by email'), ...(wa ? [button(`https://wa.me/${wa}`, 'WhatsApp the customer')] : [])],
    }),
  };
}

// ---------- templates the admin can pick in the dashboard ----------
// `prefill` names a value from enquiryPrefill() that is copied in automatically.
// Field types: text (default), multiline, items (product rows with quantity and price).

/** Values taken from an enquiry to pre-fill the template boxes. */
export function enquiryPrefill(e = {}) {
  return {
    name: e.name || '',
    orderNo: e.orderNo || '',
    product: e.items?.length ? itemsSummary(e.items) : e.product || '',
    items: e.items?.length ? e.items.map(({ name, qty, price }) => ({ name, qty: qty || 1, price: parseAmount(price) === null ? '' : price })) : e.product ? [{ name: e.product, qty: 1, price: '' }] : [],
    date: formatDate(e.date),
    deliverTo: e.delivery?.method === 'pickup' ? '' : e.delivery?.recipient || e.name || '',
    address: addressText(e.delivery || {}),
    phone: e.phone || '',
  };
}

export const REPLY_TEMPLATES = [
  {
    id: 'confirmed',
    label: 'Order confirmed',
    description: 'One complete email: order number, products, prices, total, delivery date and address.',
    fields: [
      { key: 'orderNo', label: 'Order number', required: true, prefill: 'orderNo', example: 'FL-1001' },
      { key: 'name', label: 'Customer name', required: true, prefill: 'name' },
      { key: 'items', label: 'Products, quantity and price', type: 'items', required: true, prefill: 'items' },
      { key: 'deliveryCharge', label: 'Delivery charge (optional)', example: '₹100 or Free' },
      { key: 'date', label: 'Delivery / pickup date', required: true, prefill: 'date', example: 'Saturday, 22 November, 4–6 pm' },
      { key: 'deliverTo', label: 'Deliver to (name)', prefill: 'deliverTo', example: 'Priya Sharma' },
      { key: 'address', label: 'Delivery address or pickup', multiline: true, prefill: 'address', example: 'Flat 12, Shipra Riviera, Indirapuram, Ghaziabad - 201014' },
      { key: 'payment', label: 'Payment', example: '50% advance by UPI, rest on delivery' },
      { key: 'note', label: 'Extra note (optional)', multiline: true, example: 'We will send you a photo before dispatch.' },
    ],
    build: (f, brand) => ({
      subject: `Your ${brand.name} order ${f.orderNo} is confirmed`,
      html: layout({
        brand,
        heading: `Your order is confirmed, ${firstName(f.name)}`,
        blocks: [
          p('Thank you for ordering with us. We have started preparing your order — here is everything in one place:'),
          orderBadge(f.orderNo),
          sectionTitle('Your order'),
          itemsTable(f.items, { extraRows: [['Delivery', f.deliveryCharge]], totalLabel: 'Total', onRequest: 'To be confirmed' }),
          sectionTitle('Delivery'),
          detailRows([
            ['Date', f.date],
            ['Deliver to', f.deliverTo],
            ['Address', f.address],
            ['Payment', f.payment],
          ]),
          f.note ? p(`<br>${para(f.note)}`) : '',
          p('<br>If anything needs to change, just reply to this email and mention your order number.'),
        ],
        buttons: whatsappButton(brand),
      }),
    }),
  },
  {
    id: 'quote',
    label: 'Price & details',
    description: 'Send the price and what is included, so the customer can decide.',
    fields: [
      { key: 'name', label: 'Customer name', required: true, prefill: 'name' },
      { key: 'product', label: 'Product', required: true, prefill: 'product', example: 'Peony candle' },
      { key: 'price', label: 'Price', required: true, example: '₹1,499' },
      { key: 'includes', label: 'What is included', multiline: true, example: 'Hand-poured soy candle, gift box and a handwritten note' },
      { key: 'ready', label: 'Ready / delivery time', example: '2–3 days after confirmation' },
      { key: 'note', label: 'Extra note (optional)', multiline: true, example: 'We can change the colours to match your theme.' },
    ],
    build: (f, brand) => ({
      subject: `Your ${brand.name} quote for ${f.product}`,
      html: layout({
        brand,
        heading: `Hi ${firstName(f.name)}, here are the details`,
        blocks: [
          p(`Thank you for your interest in <strong>${esc(f.product)}</strong>. Here is everything you need to know:`),
          detailRows([['Product', f.product], ['Price', f.price], ['Included', f.includes], ['Ready in', f.ready]]),
          f.note ? p(`<br>${para(f.note)}`) : '',
          p('<br>Reply to this email or message us on WhatsApp to place your order.'),
        ],
        buttons: whatsappButton(brand),
      }),
    }),
  },
  {
    id: 'details',
    label: 'Need a few details',
    description: 'Ask the customer questions before you can give a price or start.',
    fields: [
      { key: 'name', label: 'Customer name', required: true, prefill: 'name' },
      { key: 'product', label: 'Product (optional)', prefill: 'product', example: 'Custom bouquet' },
      { key: 'questions', label: 'Your questions (one per line)', required: true, multiline: true, example: 'Which colours do you like?\nWhat is your budget?\nWhen do you need it?' },
      { key: 'note', label: 'Extra note (optional)', multiline: true, example: 'Photos of your idea are very welcome.' },
    ],
    build: (f, brand) => {
      const items = String(f.questions || '')
        .split(/\r?\n/)
        .map((q) => q.trim())
        .filter(Boolean)
        .map((q) => `<li style="margin:0 0 6px">${esc(q)}</li>`)
        .join('');
      return {
        subject: `A few quick questions about your ${brand.name} enquiry`,
        html: layout({
          brand,
          heading: `Hi ${firstName(f.name)}, a few quick questions`,
          blocks: [
            p(`Thank you for your enquiry${f.product ? ` about <strong>${esc(f.product)}</strong>` : ''}. To make it just right for you, could you tell us:`),
            `<ol style="margin:0 0 14px;padding-left:20px;font-size:15px">${items}</ol>`,
            f.note ? p(para(f.note)) : '',
            p('Just reply to this email — or send us a message on WhatsApp.'),
          ],
          buttons: whatsappButton(brand),
        }),
      };
    },
  },
];

/** Cleans the product rows typed in the admin panel. */
function cleanItems(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 20)
    .map((row) => ({
      name: String(row?.name ?? '').trim().slice(0, 120),
      qty: Math.min(999, Math.max(1, Math.round(Number(row?.qty) || 1))),
      price: String(row?.price ?? '').trim().slice(0, 40),
    }))
    .filter((row) => row.name);
}

/** Returns { subject, html } or { error } for a template id + the admin's field values. */
export function buildReply(templateId, values, brand) {
  const template = REPLY_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { error: 'Unknown template' };
  const fields = {};
  for (const field of template.fields) {
    if (field.type === 'items') {
      const rows = cleanItems(values?.[field.key]);
      if (field.required && !rows.length) return { error: `Please add at least one product in “${field.label}”.` };
      fields[field.key] = rows;
      continue;
    }
    const value = String(values?.[field.key] ?? '').trim().slice(0, field.multiline ? 1500 : 200);
    if (field.required && !value) return { error: `Please fill in “${field.label}”.` };
    fields[field.key] = value;
  }
  return template.build(fields, brand);
}
