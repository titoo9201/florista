/** Rounded toggle used for category filters. Exposes its state via aria-pressed. */
export default function FilterPill({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-11 sm:h-10 items-center rounded-full border px-4 text-xs leading-none whitespace-nowrap transition-colors duration-200 ${
        active ? 'border-sage bg-sage text-ink-strong' : 'border-rose bg-transparent text-ink hover:bg-blush'
      }`}
    >
      {children}
    </button>
  );
}
