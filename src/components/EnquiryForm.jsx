import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { enquiryForm as copy } from '../data/contact';
import Button from './Button';
import FormField from './FormField';
import Heading from './Heading';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const empty = Object.fromEntries(copy.fields.map((f) => [f.name, '']));

/** Returns { field: message } for every invalid field. Front-end only — nothing is submitted anywhere. */
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
  const [sent, setSent] = useState(false);
  const formRef = useRef(null);

  const onChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    setSent(false);
    if (submitted) setErrors(validate(next));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitted(true);
    const firstInvalid = copy.fields.find((f) => found[f.name]);
    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid.name}"]`)?.focus();
      return;
    }
    setSent(true);
    setValues(empty);
    setSubmitted(false);
  };

  return (
    <div className="rounded-card bg-card px-5 pt-7 pb-8 shadow-card sm:px-9 sm:pb-9">
      <Heading id="enquiry-title" className="text-[34px] leading-[1.12] md:text-[40px] xl:text-[42px] xl:leading-[50px]">
        {copy.title}
      </Heading>
      <p className="mt-4 text-sm leading-6 md:mt-[18px]">{copy.body}</p>

      <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="enquiry-title" className="mt-6">
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
        <Button type="submit" className="mt-6">
          {copy.submit}
        </Button>

        <div role="status" aria-live="polite">
          <AnimatePresence>
            {sent && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-btn bg-blush px-4 py-3 text-sm leading-6"
              >
                {copy.success}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-[11px] leading-5">{copy.privacy}</p>
      </form>
    </div>
  );
}
