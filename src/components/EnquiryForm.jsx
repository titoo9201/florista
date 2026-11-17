import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { collection as homeCollection } from '../data/home';
import { bouquetCollection } from '../data/bouquets';
import { candleCollection } from '../data/candles';
import { useContent, useSection } from '../context/ContentContext';
import { formatAmount, orderTotals, parseAmount } from '../../server/emailTemplates.js';
import Button from './Button';
import FormField from './FormField';
import Heading from './Heading';
import ProductPicker from './ProductPicker';
import { sendEnquiry } from '../lib/sendEnquiry';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_QTY = 50;
// Order used to move the cursor to the first problem after pressing Send.
const FIELD_ORDER = ['name', 'email', 'phone', 'address', 'city', 'pincode', 'date', 'message'];

/** Today in the visitor's own time zone, as YYYY-MM-DD (for the date picker). */
function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

const emptyValues = (copy) => ({
  name: '',
  email: '',
  phone: '',
  message: '',
  items: [],
  method: 'delivery',
  recipient: '',
  address: '',
  area: '',
  city: copy.delivery?.cityDefault || '',
  pincode: '',
  date: '',
  occasion: '',
});

/** Returns { field: message } for every invalid field. */
function validate(values, copy) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = copy.errors.name;
  if (!EMAIL.test(values.email.trim())) errors.email = copy.errors.email;
  const digits = values.phone.replace(/[\s\-()]/g, '').replace(/^(\+91|0091|0)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) errors.phone = copy.errors.phone;
  if (!values.items.length && values.message.trim().length < 10) errors.message = copy.errors.message;
  if (values.method === 'delivery') {
    if (values.address.trim().length < 5) errors.address = copy.errors.address;
    if (values.city.trim().length < 2) errors.city = copy.errors.city;
    if (!/^[1-9]\d{5}$/.test(values.pincode.trim())) errors.pincode = copy.errors.pincode;
  }
  if (values.date && values.date < todayLocal()) errors.date = copy.errors.date;
  return errors;
}

/** Every product the shop sells (admin's list, or the built-in one), with duplicates removed. */
function useCatalog(priceOnRequest) {
  const { getProducts } = useContent();
  return useMemo(() => {
    const groups = [
      ['Bouquets', getProducts('bouquets', bouquetCollection.items)],
      ['Candles & Decor', getProducts('candles', candleCollection.items)],
      ['More from our collection', getProducts('home', homeCollection.products)],
    ];
    const seen = new Set();
    const list = [];
    for (const [group, items] of groups) {
      for (const p of items) {
        const key = p.name?.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const amount = parseAmount(p.price);
        list.push({ id: p.id, name: p.name, price: amount === null ? '' : p.price, priceLabel: amount === null ? priceOnRequest : formatAmount(amount), image: p.image, group });
      }
    }
    return list;
  }, [getProducts, priceOnRequest]);
}

function StepTitle({ number, children }) {
  return (
    <legend className="mb-4 flex items-center gap-3 font-serif text-[22px] leading-7 text-ink-strong">
      <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush font-sans text-sm text-ink-strong">
        {number}
      </span>
      {children}
    </legend>
  );
}

function SelectField({ name, label, value, onChange, options, placeholder, className = '' }) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm leading-5 md:text-[13px]">{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 h-[52px] w-full rounded-btn border border-line bg-white px-[13px] text-base text-ink focus:border-rose focus:outline-2 focus:outline-offset-0 focus:outline-rose/50 md:h-[50px] md:text-[13px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function QtyStepper({ item, copy, onChange }) {
  const btn = 'grid h-10 w-10 place-items-center text-lg text-ink-strong transition-colors hover:bg-blush disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label={`${copy.quantity}: ${item.name}`}>
      <button type="button" className={`${btn} rounded-l-full`} aria-label={`− ${item.name}`} disabled={item.qty <= 1} onClick={() => onChange(item.qty - 1)}>−</button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">{item.qty}</span>
      <button type="button" className={`${btn} rounded-r-full`} aria-label={`+ ${item.name}`} disabled={item.qty >= MAX_QTY} onClick={() => onChange(item.qty + 1)}>+</button>
    </div>
  );
}

export default function EnquiryForm() {
  const copy = useSection('contact.enquiryForm');
  const picker = copy.picker;
  const delivery = copy.delivery;
  const field = (name) => copy.fields.find((f) => f.name === name) || { name };
  const catalog = useCatalog(picker.priceOnRequest);

  const [values, setValues] = useState(() => emptyValues(copy));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false); // validate live after the first submit attempt
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [orderNo, setOrderNo] = useState('');
  const [serverError, setServerError] = useState('');
  const formRef = useRef(null);
  const honeypotRef = useRef(null);

  const update = (patch) => {
    setValues((old) => {
      const next = { ...old, ...patch };
      if (submitted) setErrors(validate(next, copy));
      return next;
    });
    if (status === 'sent' || status === 'failed') setStatus('idle');
  };
  const onChange = (e) => update({ [e.target.name]: e.target.value });

  const addItem = (product) => {
    const existing = values.items.find((i) => i.id === product.id);
    update({
      items: existing
        ? values.items.map((i) => (i.id === product.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + 1) } : i))
        : [...values.items, { ...product, qty: 1 }],
    });
  };
  const setQty = (id, qty) => update({ items: values.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i)) });
  const removeItem = (id) => update({ items: values.items.filter((i) => i.id !== id) });

  const { lines, total } = orderTotals(values.items);
  const knownTotal = lines.reduce((sum, l) => sum + (l.line || 0), 0);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validate(values, copy);
    setErrors(found);
    setSubmitted(true);
    setServerError('');
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const done = (number = '') => {
      setOrderNo(number);
      setStatus('sent');
      setValues(emptyValues(copy));
      setSubmitted(false);
    };
    // Spam bots fill the hidden field — pretend success without sending anything.
    if (honeypotRef.current?.value) return done();

    setStatus('sending');
    try {
      const result = await sendEnquiry(values);
      done(result?.orderNo || '');
    } catch (err) {
      console.error('Enquiry could not be sent:', err);
      setServerError(err.message && !/fetch|network/i.test(err.message) ? err.message : '');
      setStatus('failed'); // keep what the customer typed so they can retry
    }
  };

  const sending = status === 'sending';
  const successText = orderNo && copy.successWithNumber ? copy.successWithNumber.replace('{orderNo}', orderNo) : copy.success;
  const fieldset = 'border-t border-line pt-7 first:border-t-0 first:pt-0';

  return (
    <div className="rounded-card bg-card px-5 pt-7 pb-8 shadow-card sm:px-9 sm:pb-9">
      <Heading id="enquiry-title" className="text-[34px] leading-[1.12] md:text-[40px] xl:text-[42px] xl:leading-[50px]">
        {copy.title}
      </Heading>
      <p className="mt-4 text-sm leading-6 md:mt-[18px]">{copy.body}</p>

      <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="enquiry-title" aria-busy={sending} className="mt-7 grid gap-8">
        {/* Honeypot: hidden from people and screen readers, tempting to bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="field-company">Company</label>
          <input ref={honeypotRef} id="field-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {/* 1. Products */}
        <fieldset className={fieldset}>
          <StepTitle number="1">{copy.steps.products}</StepTitle>

          <AnimatePresence initial={false}>
            {values.items.length > 0 && (
              <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 grid gap-2" aria-label={picker.label}>
                <AnimatePresence initial={false}>
                  {lines.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-[64px_1fr] items-center gap-x-3 gap-y-2 rounded-card border border-line bg-cream/60 p-2.5 sm:grid-cols-[64px_1fr_auto_auto]"
                    >
                      <span className="row-span-2 h-16 w-16 overflow-hidden rounded-[12px] bg-blush sm:row-span-1">
                        {item.image?.src && <img src={item.image.src} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink-strong">{item.name}</p>
                        <p className="text-xs text-ink/75">
                          {item.unit === null ? picker.priceOnRequest : item.qty > 1 ? `${formatAmount(item.unit)} × ${item.qty} = ${formatAmount(item.line)}` : formatAmount(item.unit)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:contents">
                        <QtyStepper item={item} copy={picker} onChange={(q) => setQty(item.id, q)} />
                        <button type="button" onClick={() => removeItem(item.id)} className="min-h-10 px-2 text-xs text-ink/75 underline underline-offset-2 hover:text-error" aria-label={`${picker.remove}: ${item.name}`}>
                          {picker.remove}
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>

          <ProductPicker
            products={catalog}
            onPick={addItem}
            copy={picker}
            label={picker.label}
            buttonText={values.items.length ? picker.addAnother : picker.placeholder}
            selectedIds={values.items.map((i) => i.id)}
          />

          {values.items.length > 0 && (
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-btn bg-blush px-4 py-3" aria-live="polite">
              <span className="text-sm">{picker.total}</span>
              <span className="text-base text-ink-strong tabular-nums">
                {total !== null ? formatAmount(total) : knownTotal > 0 ? `${formatAmount(knownTotal)} + ${picker.priceOnRequest.toLowerCase()}` : picker.priceOnRequest}
              </span>
              <span className="w-full text-[11px] leading-4 text-ink/75">{picker.totalNote}</span>
            </div>
          )}
          <p className="mt-3 text-xs leading-5 text-ink/75">{picker.custom}</p>
        </fieldset>

        {/* 2. Customer details */}
        <fieldset className={fieldset}>
          <StepTitle number="2">{copy.steps.details}</StepTitle>
          <div className="grid gap-x-5 gap-y-[22px] sm:grid-cols-2">
            {['name', 'email', 'phone'].map((name) => {
              const { full, ...f } = field(name);
              return (
                <FormField key={name} {...f} value={values[name]} onChange={onChange} error={errors[name]} className={name === 'name' ? 'sm:col-span-2' : ''} />
              );
            })}
          </div>
        </fieldset>

        {/* 3. Delivery or pickup */}
        <fieldset className={fieldset}>
          <StepTitle number="3">{copy.steps.delivery}</StepTitle>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={copy.steps.delivery}>
            {[
              ['delivery', delivery.deliveryOption, delivery.deliveryHint],
              ['pickup', delivery.pickupOption, delivery.pickupHint],
            ].map(([value, title, hint]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-card border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-rose/60 ${
                  values.method === value ? 'border-rose bg-blush/60' : 'border-line bg-white hover:bg-cream'
                }`}
              >
                <input type="radio" name="method" value={value} checked={values.method === value} onChange={onChange} className="sr-only" />
                <span className="flex items-center gap-2 text-sm text-ink-strong">
                  <span aria-hidden="true" className={`grid h-4 w-4 place-items-center rounded-full border ${values.method === value ? 'border-rose' : 'border-ink/40'}`}>
                    {values.method === value && <span className="h-2 w-2 rounded-full bg-rose" />}
                  </span>
                  {title}
                </span>
                <span className="mt-1 block pl-6 text-xs leading-4 text-ink/75">{hint}</span>
              </label>
            ))}
          </div>

          <div className="mt-5 grid gap-x-5 gap-y-[22px] sm:grid-cols-2">
            {values.method === 'delivery' && (
              <>
                <FormField name="recipient" label={delivery.recipient} placeholder={delivery.recipientPlaceholder} autoComplete="off" value={values.recipient} onChange={onChange} className="sm:col-span-2" />
                <FormField name="address" label={delivery.address} placeholder={delivery.addressPlaceholder} autoComplete="street-address" required value={values.address} onChange={onChange} error={errors.address} className="sm:col-span-2" />
                <FormField name="area" label={delivery.area} placeholder={delivery.areaPlaceholder} autoComplete="address-level3" value={values.area} onChange={onChange} className="sm:col-span-2" />
                <FormField name="city" label={delivery.city} autoComplete="address-level2" required value={values.city} onChange={onChange} error={errors.city} />
                <FormField name="pincode" label={delivery.pincode} placeholder={delivery.pincodePlaceholder} autoComplete="postal-code" inputMode="numeric" maxLength={6} required value={values.pincode} onChange={onChange} error={errors.pincode} />
              </>
            )}
            <FormField name="date" type="date" label={delivery.date} min={todayLocal()} value={values.date} onChange={onChange} error={errors.date} />
            <SelectField name="occasion" label={delivery.occasion} placeholder={delivery.occasionPlaceholder} options={delivery.occasions || []} value={values.occasion} onChange={onChange} />
          </div>
        </fieldset>

        {/* 4. Message */}
        <fieldset className={fieldset}>
          <StepTitle number="4">{copy.steps.message}</StepTitle>
          {(() => {
            const { full, ...f } = field('message');
            return <FormField {...f} required={!values.items.length} value={values.message} onChange={onChange} error={errors.message} />;
          })()}
        </fieldset>

        <div>
          <p className="text-[11px] leading-5">{copy.note}</p>
          <Button type="submit" disabled={sending} className="mt-5 w-full sm:w-auto disabled:cursor-wait disabled:opacity-70">
            {sending ? copy.sending : copy.submit}
          </Button>

          <div role="status" aria-live="polite">
            <AnimatePresence>
              {(status === 'sent' || status === 'failed') && (
                <motion.p
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 rounded-btn px-4 py-3 text-sm leading-6 ${status === 'sent' ? 'bg-blush' : 'border border-error/40 bg-white text-error'}`}
                >
                  {status === 'sent' ? successText : serverError || copy.failure}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-[11px] leading-5">{copy.privacy}</p>
        </div>
      </form>
    </div>
  );
}
