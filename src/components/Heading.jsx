/** Serif display heading. `lines` renders each entry on its own line (as in the design). */
export default function Heading({ as: Tag = 'h2', lines, className = '', children, ...props }) {
  return (
    <Tag className={`font-serif font-normal text-ink ${className}`} {...props}>
      {lines
        ? lines.map((line, i) => (
            <span key={i} className="block">
              {line}
              {i < lines.length - 1 && ' '}
            </span>
          ))
        : children}
    </Tag>
  );
}
