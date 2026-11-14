const paths = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z" />,
  whatsapp: (
    <>
      <path d="M4.2 19.8 5.4 16A8.5 8.5 0 1 1 8.6 19l-4.4.8Z" />
      <path d="M9.3 8.4c.3-.4.8-.4 1 0l.7 1.5c.1.3 0 .6-.2.8l-.5.5a5.5 5.5 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.5.7c.4.2.4.7 0 1l-.6.6c-.6.6-1.6.7-2.4.3a8.8 8.8 0 0 1-4.2-4.2c-.4-.8-.3-1.8.3-2.4l.5-.7Z" />
    </>
  ),
};

/** Outline social icons (Instagram, Facebook, WhatsApp). Decorative — the label is shown next to it. */
export default function SocialIcon({ name, size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
