import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import FilterPill from './FilterPill';
import ProductCard from './ProductCard';

/**
 * Filter pills + "edit" label + product card grid, filtered client-side.
 * `filters[0]` should be the "show everything" option (id: 'all').
 * `collection`: { editLabel, unit: { one, other }, note, cta, items[] } — items carry `categories`.
 */
export default function FilterableCollection({ id, sectionId, filterLabel, filters, collection }) {
  const [filter, setFilter] = useState('all');
  const reduce = useReducedMotion();
  const items = filter === 'all' ? collection.items : collection.items.filter((item) => item.categories.includes(filter));
  const count = String(items.length).padStart(2, '0');

  return (
    <section id={sectionId} aria-labelledby={id} className="container-page pt-12 pb-16 md:pt-16">
      <div role="group" aria-label={filterLabel} className="flex flex-wrap gap-2.5 md:gap-3">
        {filters.map((f) => (
          <FilterPill key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </FilterPill>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-2 md:mt-8 lg:grid lg:grid-cols-[550px_1fr] lg:items-baseline lg:gap-0">
        <h2 id={id} className="text-[10px] leading-4 uppercase" aria-live="polite">
          {collection.editLabel} / {count} {items.length === 1 ? collection.unit.one : collection.unit.other}
        </h2>
        <p className="text-[11px] leading-4">{collection.note}</p>
      </div>

      <motion.ul layout={!reduce} className="mt-8 grid gap-x-6 gap-y-8 md:mt-[34px] md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              id={item.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard {...item} cta={collection.cta} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}
