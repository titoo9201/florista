import { useEffect, useMemo, useState } from 'react';
import { apiFetch, authHeaders } from '../lib/contentApi';
import { useContent } from '../context/ContentContext';
import { DEFAULTS, SECTIONS } from '../content/sections';
import { mergeContent, stripImages } from '../content/merge';
import { firstError, guideFor } from './fieldGuide';
import Hint from './Hint';

// Technical fields the admin should not touch (links, layout, ids, photos — photos live in the Photos tab).
const HIDDEN = new Set(['id', 'to', 'href', 'whatsapp', 'column', 'tall', 'width', 'height', 'icon', 'source', 'link', 'autoComplete', 'required', 'full', 'type', 'image']);

const LABELS = {
  eyebrow: 'Small label above the heading',
  title: 'Heading',
  tagline: 'Tagline',
  body: 'Paragraph',
  intro: 'Intro paragraph',
  quote: 'Quote',
  note: 'Small note',
  cta: 'Button',
  primaryCta: 'Main button',
  secondaryCta: 'Second button',
  label: 'Text',
  features: 'Points',
  items: 'Items',
  blocks: 'Story blocks',
  number: 'Number',
  text: 'Text',
  caption: 'Caption',
  value: 'Text on the card',
  heading: 'Heading',
  editLabel: 'Count label (e.g. “The bouquet edit”)',
  unit: 'Word used for items',
  one: 'For 1 item',
  other: 'For many items',
  fields: 'Form fields',
  placeholder: 'Hint inside the box',
  submit: 'Send button',
  sending: 'Button text while sending',
  success: 'Message after sending',
  failure: 'Message if sending fails',
  privacy: 'Privacy note',
  errors: 'Error messages',
  phone: 'Phone',
  message: 'Message',
  messages: 'Pre-filled WhatsApp messages',
  general: 'General question (footer & contact cards)',
  order: 'Product order — {name} and {price} are filled in automatically',
  custom: '“Let’s create together” button',
  customBouquet: '“Enquire about a custom bouquet” button',
  gift: '“Let’s find your perfect gift” button',
  email: 'Email address',
  location: 'Location',
  handle: 'Instagram handle (e.g. @florista_07)',
  url: 'Instagram profile link',
  exploreHeading: '“Explore” heading',
  owner: 'Owner line',
  copyright: 'Copyright line',
};

const humanize = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
const labelFor = (key) => LABELS[key] ?? humanize(key);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isStringList = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Before saving: drop photos, trim, remove blank lines, give new categories an id. */
function prepareForSave(value, parentKey) {
  if (typeof value === 'string') return value.trim();
  if (isStringList(value)) return value.map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(value)) return value.map((v) => prepareForSave(v, parentKey));
  if (isObj(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = prepareForSave(v, k);
    if ('label' in out && 'id' in out && !out.id) out.id = slug(out.label) || `item-${Date.now()}`;
    return out;
  }
  return value;
}

function Field({ name, path, value, onChange, parentKey, listRule, hidden = [] }) {
  const id = `f-${path.replace(/\./g, '-')}`;
  const guide = guideFor(path, name);
  const label = labelFor(name);

  if (typeof value === 'boolean') {
    return (
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}
      </label>
    );
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value);
    // Multi-line box for long texts and anything whose example has line breaks (e.g. WhatsApp messages).
    const long = typeof value === 'string' && (text.includes('\n') || text.length > 90 || guide?.example?.includes('\n') || guide?.example?.length > 90);
    const error = guide?.check ? guide.check(text.trim()) : '';
    const hintId = `${id}-hint`;
    const handle = (raw) => {
      const v = guide?.clean ? guide.clean(raw) : raw;
      onChange(typeof value === 'number' ? Number(v) : v);
    };
    const common = {
      id,
      className: `admin-input ${error ? 'border-error' : ''}`,
      value: text,
      onChange: (e) => handle(e.target.value),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': guide || error ? hintId : undefined,
      placeholder: guide?.example?.split('\n')[0],
    };
    return (
      <label htmlFor={id} className="block text-xs">
        {label}
        {long ? (
          <textarea {...common} rows={Math.min(12, Math.max(3, text.split('\n').length + 1))} />
        ) : (
          <input
            {...common}
            type={/^site\.business\.email$/.test(path) ? 'email' : 'text'}
            inputMode={/^site\.whatsapp\.number$/.test(path) ? 'numeric' : undefined}
          />
        )}
        <Hint id={hintId} guide={guide} error={error} />
      </label>
    );
  }

  if (isStringList(value)) {
    const hintId = `${id}-hint`;
    return (
      <label htmlFor={id} className="block text-xs">
        {label} <span className="text-ink/60">(each row shows as its own line)</span>
        <textarea id={id} className="admin-input" aria-describedby={hintId} rows={Math.max(2, value.length + 1)} value={value.join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />
        <Hint id={hintId} guide={guide} />
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <fieldset className="rounded-media border border-line p-3">
        <legend className="px-1 text-xs font-medium">{label}</legend>
        <div className="grid gap-3">
          {value.map((item, i) => (
            <div key={i} className="rounded-media bg-cream p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase">{label} {i + 1}</span>
                {listRule?.add && (
                  <button type="button" className="text-xs text-error underline" onClick={() => onChange(value.filter((_, j) => j !== i))}>Remove</button>
                )}
              </div>
              <Field name={`${name}-${i}`} path={`${path}.${i}`} value={item} parentKey={name} hidden={hidden} onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))} />
            </div>
          ))}
        </div>
        {listRule?.add && (
          <button type="button" className="admin-secondary mt-3" onClick={() => onChange([...value, structuredClone(listRule.template)])}>+ Add</button>
        )}
      </fieldset>
    );
  }

  if (isObj(value)) {
    const keys = Object.keys(value).filter((k) => !HIDDEN.has(k) && !hidden.includes(k) && !(parentKey === 'fields' && k === 'name') && !('source' in value && k === 'value'));
    if (!keys.length) return null;
    const nested = !/-\d+$/.test(name) && name !== '_root';
    const inner = (
      <div className="grid gap-3">
        {keys.map((k) => (
          <Field key={k} name={k} path={`${path}.${k}`} value={value[k]} parentKey={name} hidden={hidden} onChange={(next) => onChange({ ...value, [k]: next })} />
        ))}
      </div>
    );
    return nested ? (
      <fieldset className="rounded-media border border-line p-3">
        <legend className="px-1 text-xs font-medium">{label}</legend>
        {inner}
      </fieldset>
    ) : (
      inner
    );
  }
  return null;
}

function SectionEditor({ section, token }) {
  const { content, refresh } = useContent();
  const saved = content?.sections?.[section.path];
  const current = useMemo(() => mergeContent(DEFAULTS[section.path], saved), [section.path, saved]);
  const [draft, setDraft] = useState(current);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft(current);
    setMessage('');
  }, [current]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(current);
  const invalid = firstError(draft, section.path); // blocks Save until the format is right
  const rules = section.list || {};

  async function save() {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/content/${section.path}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ value: prepareForSave(stripImages(draft)) }),
      });
      await refresh();
      setMessage('Saved ✓ — live on the website.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!window.confirm('Undo all changes in this section and go back to the original text?')) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/content/${section.path}`, { method: 'DELETE', headers: authHeaders(token) });
      await refresh();
      setMessage('Original text restored ✓');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Top-level lists (e.g. categories) are edited directly; objects show their fields.
  const body = Array.isArray(draft) ? (
    <Field name="_root" path={section.path} value={draft} listRule={rules._root} hidden={section.hide} onChange={setDraft} />
  ) : (
    <div className="grid gap-3">
      {Object.keys(draft)
        .filter((k) => !HIDDEN.has(k) && !(section.hide || []).includes(k))
        .map((k) => (
          <Field key={k} name={k} path={`${section.path}.${k}`} value={draft[k]} listRule={rules[k]} hidden={section.hide} onChange={(next) => setDraft({ ...draft, [k]: next })} />
        ))}
    </div>
  );

  return (
    <article data-tour="section-editor" aria-busy={busy} className="rounded-card border border-line bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase">{section.page}</p>
          <h2 className="font-serif text-2xl sm:text-3xl">{section.label}</h2>
        </div>
        {saved && <span className="rounded-full bg-blush px-2 py-0.5 text-[11px]">Changed</span>}
      </div>
      <div className="mt-4">{body}</div>
      <div data-tour="save-bar" className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center gap-3 border-t border-line bg-card px-4 py-3 sm:-mx-5 sm:px-5">
        <button type="button" className="admin-primary" disabled={busy || !dirty || Boolean(invalid)} onClick={save}>{busy ? 'Please wait…' : dirty ? 'Save changes' : 'Saved'}</button>
        {dirty && invalid && <span className="text-xs text-error">Fix the field marked ⚠ to save.</span>}
        {dirty && <button type="button" className="min-h-11 text-sm underline" onClick={() => setDraft(current)}>Discard</button>}
        {saved && <button type="button" className="min-h-11 text-sm underline sm:ml-auto" disabled={busy} onClick={reset}>Reset to original</button>}
        {message && <span className="w-full text-xs" role="status">{message}</span>}
      </div>
    </article>
  );
}

/** `pages` limits which groups are shown (e.g. only "Contact & WhatsApp"). */
export default function ContentTab({ token, pages, exclude = [] }) {
  const sections = SECTIONS.filter((s) => (!pages || pages.includes(s.page)) && !exclude.includes(s.page));
  const groups = [...new Set(sections.map((s) => s.page))];
  const [active, setActive] = useState(sections[0]?.path);
  const section = sections.find((s) => s.path === active) || sections[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Mobile: dropdown. Desktop: sidebar. */}
      <label data-tour="section-list" className="block text-xs lg:hidden">
        Choose a section to edit
        <select className="admin-input" value={section.path} onChange={(e) => setActive(e.target.value)}>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {sections.filter((s) => s.page === g).map((s) => <option key={s.path} value={s.path}>{s.label}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <nav data-tour="section-list" aria-label="Sections" className="hidden lg:block">
        {groups.map((g) => (
          <div key={g} className="mb-4">
            <p className="text-[11px] uppercase">{g}</p>
            <ul className="mt-1">
              {sections.filter((s) => s.page === g).map((s) => (
                <li key={s.path}>
                  <button type="button" onClick={() => setActive(s.path)} className={`w-full rounded-media px-3 py-2 text-left text-sm ${s.path === section.path ? 'bg-blush font-medium' : 'hover:bg-cream'}`}>
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <SectionEditor key={section.path} section={section} token={token} />
    </div>
  );
}
