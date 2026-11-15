/** Labelled input / textarea with an inline, screen-reader-linked error message. */
export default function FormField({ name, label, type = 'text', required, error, className = '', ...inputProps }) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const control =
    'w-full rounded-btn border bg-white px-[15px] text-base md:text-[13px] text-ink placeholder:text-ink/80 ' +
    'transition-colors duration-150 focus:border-rose focus:outline-2 focus:outline-offset-0 focus:outline-rose/50 ' +
    (error ? 'border-error' : 'border-line');

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm leading-5 md:text-[13px]">
        {label}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${control} mt-2 block h-[150px] resize-y py-[13px] leading-6`}
          {...inputProps}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${control} mt-2 h-[52px] md:h-[50px]`}
          {...inputProps}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs leading-5 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
