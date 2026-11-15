import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { enquiryForm as copy } from '../data/contact';
import Button from './Button';
import FormField from './FormField';
import Heading from './Heading';
import { sendEnquiry } from '../lib/sendEnquiry';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const empty = Object.fromEntries(copy.fields.map((f) => [f.name, '']));

/** Returns { field: message } for every invalid field. */
function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = copy.errors.name;
  if (!EMAIL.test(values.email.trim())) errors.email = copy.errors.email;
  const digits = values.phone.replace(/[\s\-()]/g, '').replace(/^(\+91|0091|0)/, '');
  if (values.phone.trim() && !/^[6-9]\d{9}$/.test(digits)) errors.phone = copy.errors.phone;
  if (values.message.trim().length < 10) errors.message = copy.errors.message;
  return errors;
}

export default function EnquiryForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false); // validate live after the first submit attempt
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const formRef = useRef(null);
  const honeypotRef = useRef(null);

  const onChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (status === 'sent' || status === 'failed') setStatus('idle');
    if (submitted) setErrors(validate(next));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validate(values);
    setErrors(found);
    setSubmitted(true);
    const firstInvalid = copy.fields.find((f) => found[f.name]);
    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid.name}"]`)?.focus();
      return;
    }

    const done = () => {
      setStatus('sent');
      setValues(empty);
      setSubmitted(false);
    };
    // Spam bots fill the hidden field — pretend success without sending anything.
    if (honeypotRef.current?.value) return done();

    setStatus('sending');
    try {
      await sendEnquiry(values);
      done();
    } catch (err) {
      console.error('Enquiry could not be sent:', err);
      setStatus('failed'); // keep what the customer typed so they can retry
    }
  };

  const sending = status === 'sending';

  return (
    <div className="rounded-card bg-card px-5 pt-7 pb-8 shadow-card sm:px-9 sm:pb-9">
      <Heading id="enquiry-title" className="text-[34px] leading-[1.12] md:text-[40px] xl:text-[42px] xl:leading-[50px]">
        {copy.title}
      </Heading>
      <p className="mt-4 text-sm leading-6 md:mt-[18px]">{copy.body}</p>

      <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="enquiry-title" aria-busy={sending} className="mt-6">
        {/* Honeypot: hidden from people and screen readers, tempting to bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="field-company">Company</label>
          <input ref={honeypotRef} id="field-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid gap-x-5 gap-y-[26px] sm:grid-cols-2">
          {copy.fields.map(({ full, ...field }) => (
            <FormField
              key={field.name}
              {...field}
              value={values[field.name]}
              onChange={onChange}
              error={errors[field.name]}
              className={full ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>

        <p className="mt-6 text-[11px] leading-5">{copy.note}</p>
        <Button type="submit" disabled={sending} className="mt-6 w-full sm:w-auto disabled:cursor-wait disabled:opacity-70">
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
                className={`mt-4 rounded-btn px-4 py-3 text-sm leading-6 ${
                  status === 'sent' ? 'bg-blush' : 'border border-error/40 bg-white text-error'
                }`}
              >
                {status === 'sent' ? copy.success : copy.failure}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-[11px] leading-5">{copy.privacy}</p>
      </form>
    </div>
  );
}
