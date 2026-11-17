import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Searchable product dropdown with photos (ARIA combobox + listbox).
 * `products`: [{ id, name, priceLabel, image, group }]. Calls onPick(product) and closes.
 */
export default function ProductPicker({ products, onPick, copy, label, buttonText, selectedIds = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();
  const listId = `${uid}-list`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => `${p.name} ${p.group}`.toLowerCase().includes(q)) : products;
  }, [products, query]);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted option visible while using the arrow keys.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function close(focusButton = true) {
    setOpen(false);
    setQuery('');
    if (focusButton) buttonRef.current?.focus();
  }

  function pick(product) {
    onPick(product);
    close();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      close(false);
    }
  }

  let lastGroup = null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-btn border border-dashed border-rose bg-white px-[15px] text-left text-base text-ink transition-colors duration-150 hover:bg-blush/40 focus-visible:outline-2 focus-visible:outline-rose/60 md:text-[13px]"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-blush text-lg leading-none text-ink-strong">+</span>
          {buttonText}
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-line bg-white shadow-card"
          >
            <div className="border-b border-line p-2">
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${uid}-opt-${active}` : undefined}
                aria-autocomplete="list"
                aria-label={copy.search}
                placeholder={copy.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                className="h-11 w-full rounded-btn border border-line bg-cream px-3 text-base text-ink placeholder:text-ink/70 focus:border-rose focus:outline-none md:text-[13px]"
              />
            </div>
            <ul ref={listRef} id={listId} role="listbox" aria-label={label} className="max-h-[min(360px,55vh)] overflow-y-auto overscroll-contain py-1">
              {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink/70">{copy.empty}</li>}
              {filtered.map((product, index) => {
                const heading = product.group !== lastGroup ? product.group : null;
                lastGroup = product.group;
                const chosen = selectedIds.includes(product.id);
                return (
                  <li key={product.id} role="presentation">
                    {heading && <p aria-hidden="true" className="px-4 pt-3 pb-1 text-[11px] tracking-[0.14em] text-ink/60 uppercase">{heading}</p>}
                    <div
                      id={`${uid}-opt-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={index === active}
                      onPointerMove={() => setActive(index)}
                      onClick={() => pick(product)}
                      className={`mx-1 flex cursor-pointer items-center gap-3 rounded-btn px-3 py-2 ${index === active ? 'bg-blush' : ''}`}
                    >
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-blush">
                        {product.image?.src && <img src={product.image.src} alt="" loading="lazy" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink-strong">{product.name}</span>
                        <span className="block text-xs text-ink/75">{product.priceLabel}</span>
                      </span>
                      {chosen && <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[11px] text-ink/80">✓ Added</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
