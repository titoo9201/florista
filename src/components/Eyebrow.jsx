/** Small uppercase label above headings. `wide` = letter-spaced variant (hero / section intros). */
export default function Eyebrow({ as: Tag = 'p', wide = true, className = '', children, ...props }) {
  return (
    <Tag
      className={`leading-4 uppercase ${wide ? 'text-[11px] tracking-eyebrow' : 'text-[10px] tracking-normal'} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
