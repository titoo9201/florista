import { useMemo, useState } from 'react';
import { useContent } from '../context/ContentContext';
import { apiFetch, authHeaders } from '../lib/contentApi';
// Same file the server uses to build and send the email — so the preview is exactly what the customer gets.
import { REPLY_TEMPLATES, brandFrom, buildReply, enquiryPrefill, formatAmount, orderTotals } from '../../server/emailTemplates.js';

const initialValues = (template, enquiry) => {
  const prefill = enquiryPrefill(enquiry);
  return Object.fromEntries(
    template.fields.map((f) => [f.key, f.prefill ? prefill[f.prefill] ?? '' : f.type === 'items' ? [] : '']),
  );
};

const isFilled = (v) => (Array.isArray(v) ? v.length > 0 : Boolean(v));

/** Editable product rows: name, quantity, price — with the running total. */
function ItemsEditor({ id, rows, onChange }) {
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const { total } = orderTotals(rows.filter((r) => r.name));
  return (
    <div className="mt-1 grid gap-2" id={id}>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_64px_96px_auto] items-center gap-2">
          <input className="admin-input" aria-label={`Product ${i + 1} name`} placeholder="Product name" value={row.name} onChange={(e) => set(i, { name: e.target.value })} />
          <input className="admin-input" aria-label={`Product ${i + 1} quantity`} type="number" min="1" max="999" value={row.qty} onChange={(e) => set(i, { qty: e.target.value })} />
          <input className="admin-input" aria-label={`Product ${i + 1} price for one`} placeholder="₹ each" value={row.price} onChange={(e) => set(i, { price: e.target.value })} />
          <button type="button" className="min-h-11 px-1 text-xs text-error underline" aria-label={`Remove product ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="min-h-11 text-sm underline" onClick={() => onChange([...rows, { name: '', qty: 1, price: '' }])}>+ Add product</button>
        <span className="text-xs text-ink/75">Price is for one piece · Products total: <strong className="text-ink">{total === null ? 'fill every price' : formatAmount(total)}</strong></span>
      </div>
    </div>
  );
}

/** Pick a ready-made email, fill a few boxes, preview it and send it to the customer who made the enquiry. */
export default function ReplyComposer({ enquiry, token, configured, onClose, onSent }) {
  const { content } = useContent();
  const [templateId, setTemplateId] = useState(REPLY_TEMPLATES[0].id);
  const template = REPLY_TEMPLATES.find((t) => t.id === templateId);
  const [values, setValues] = useState(() => initialValues(REPLY_TEMPLATES[0], enquiry));
  const [state, setState] = useState({ busy: false, error: '', sent: false });

  const brand = useMemo(() => brandFrom(content?.sections || {}), [content]);
  const preview = useMemo(() => {
    // Preview with example text in empty boxes so the layout is visible while typing.
    const filled = Object.fromEntries(
      template.fields.map((f) => [f.key, isFilled(values[f.key]) ? values[f.key] : f.type === 'items' ? [{ name: '[Product]', qty: 1, price: '' }] : f.required ? f.example || `[${f.label}]` : '']),
    );
    return buildReply(templateId, filled, brand);
  }, [templateId, template, values, brand]);

  function pick(id) {
    const next = REPLY_TEMPLATES.find((t) => t.id === id);
    // Keep anything already typed in boxes that the new template also has.
    setValues((old) => ({ ...initialValues(next, enquiry), ...Object.fromEntries(Object.entries(old).filter(([k, v]) => isFilled(v) && next.fields.some((f) => f.key === k && f.type === (Array.isArray(v) ? 'items' : f.type)))) }));
    setTemplateId(id);
    setState({ busy: false, error: '', sent: false });
  }

  async function send(event) {
    event.preventDefault();
    const check = buildReply(templateId, values, brand);
    if (check.error) return setState({ busy: false, error: check.error, sent: false });
    setState({ busy: true, error: '', sent: false });
    try {
      const result = await apiFetch(`/api/admin/enquiries/${enquiry.id}/reply`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId, fields: values }),
      });
      if (!result.ok) return setState({ busy: false, error: result.error || 'Email could not be sent.', sent: false });
      setState({ busy: false, error: '', sent: true });
      onSent?.();
    } catch (err) {
      setState({ busy: false, error: err.message, sent: false });
    }
  }

  return (
    <div className="mt-4 rounded-card border border-rose bg-cream p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-xl">Send an email template</h4>
          <p className="mt-1 text-xs text-ink/70">To: <strong className="font-medium">{enquiry.email}</strong></p>
        </div>
        <button type="button" className="min-h-11 px-2 text-sm underline" onClick={onClose}>Close</button>
      </div>

      {!configured && (
        <p className="mt-3 rounded-media bg-blush px-3 py-2 text-xs leading-5" role="note">
          Customer emails are not switched on yet. You can preview the templates, but sending needs your developer to set
          <strong> EMAILJS_CUSTOMER_TEMPLATE_ID</strong> on the server.
        </p>
      )}

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">1. Choose a template</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {REPLY_TEMPLATES.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-media border p-3 text-sm ${t.id === templateId ? 'border-rose bg-card ring-2 ring-rose/40' : 'border-line bg-card'}`}
            >
              <input type="radio" name={`tpl-${enquiry.id}`} value={t.id} checked={t.id === templateId} onChange={() => pick(t.id)} className="sr-only" />
              <span className="block font-medium">{t.label}</span>
              <span className="mt-1 block text-xs leading-5 text-ink/70">{t.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={send} noValidate>
        <div className="grid content-start gap-3">
          <p className="text-sm font-medium">2. Fill in the details</p>
          {template.fields.map((f) => {
            const id = `reply-${enquiry.id}-${f.key}`;
            const clear = () => (state.error || state.sent) && setState({ busy: false, error: '', sent: false });
            if (f.type === 'items') {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="text-xs font-medium">
                    {f.label} {f.required && <span className="text-error" aria-hidden="true">*</span>}
                  </label>
                  <ItemsEditor id={id} rows={values[f.key] || []} onChange={(rows) => { setValues((v) => ({ ...v, [f.key]: rows })); clear(); }} />
                </div>
              );
            }
            const Tag = f.multiline ? 'textarea' : 'input';
            return (
              <div key={f.key}>
                <label htmlFor={id} className="text-xs font-medium">
                  {f.label} {f.required && <span className="text-error" aria-hidden="true">*</span>}
                </label>
                <Tag
                  id={id}
                  className={`admin-input mt-1 ${f.multiline ? 'min-h-24' : ''}`}
                  value={values[f.key]}
                  required={f.required}
                  rows={f.multiline ? 3 : undefined}
                  placeholder={f.example ? `e.g. ${f.example.split('\n')[0]}` : ''}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [f.key]: e.target.value }));
                    if (state.error || state.sent) setState({ busy: false, error: '', sent: false });
                  }}
                />
              </div>
            );
          })}
          {state.error && <p className="text-sm text-error" role="alert">{state.error}</p>}
          {state.sent && <p className="text-sm" role="status">✅ Sent to {enquiry.email}. It is saved under this enquiry.</p>}
          <button type="submit" className="admin-primary" disabled={state.busy || !configured}>
            {state.busy ? 'Sending…' : '📨 Send to customer'}
          </button>
        </div>

        <div>
          <p className="text-sm font-medium">3. Preview</p>
          <p className="mt-1 text-xs text-ink/70">Subject: <strong className="font-medium text-ink">{preview.subject}</strong></p>
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={preview.html}
            className="mt-2 h-[520px] w-full rounded-media border border-line bg-card"
          />
        </div>
      </form>
    </div>
  );
}
