import SmartLink from './SmartLink';

const base =
  'inline-flex min-h-[50px] items-center justify-center rounded-btn border px-6 text-sm leading-none whitespace-nowrap ' +
  'transition-[background-color,border-color,color,box-shadow] duration-200 ease-out ' +
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink';

const variants = {
  primary: 'border-rose bg-rose text-ink-strong hover:bg-[#cf9898] hover:border-[#cf9898]',
  outline: 'border-rose bg-transparent text-ink hover:bg-blush',
};

/** Button styled per the design. Pass `href` to render a link, otherwise renders a <button>. */
export default function Button({ variant = 'primary', href, className = '', children, ...props }) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <SmartLink href={href} className={classes} {...props}>
        {children}
      </SmartLink>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
