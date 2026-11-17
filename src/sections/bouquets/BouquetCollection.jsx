import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { bouquetCollection as builtIn } from '../../data/bouquets';
import FilterPill from '../../components/FilterPill';
import ProductCard from '../../components/ProductCard';
import { useContent, useSection } from '../../context/ContentContext';

/** Filterable bouquet grid. Filtering is client-side over the static data. */
export default function BouquetCollection() {
  const data = useSection('bouquets.bouquetCollection');
  const bouquetFilters = useSection('bouquets.bouquetFilters');
  const { getProducts } = useContent();
  const [filter, setFilter] = useState('all');
  const reduce = useReducedMotion();
  const products = getProducts('bouquets', builtIn.items);
  const items = filter === 'all' ? products : products.filter((item) => item.categories.includes(filter));
  const count = String(items.length).padStart(2, '0');

  return (
    <section id="bouquet-collection" aria-labelledby="bouquet-edit" className="container-page pt-12 pb-16 md:pt-16">
      <div role="group" aria-label="Filter bouquets" className="flex flex-wrap gap-2.5 md:gap-3">
        {bouquetFilters.map((f) => (
          <FilterPill key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </FilterPill>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-2 md:mt-8 lg:grid lg:grid-cols-[550px_1fr] lg:items-baseline lg:gap-0">
        <h2 id="bouquet-edit" className="text-[10px] leading-4 uppercase" aria-live="polite">
          {data.editLabel} / {count} {items.length === 1 ? data.unit.one : data.unit.other}
        </h2>
        <p className="text-[11px] leading-4">{data.note}</p>
      </div>

      <motion.ul layout={!reduce} className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:mt-[34px] lg:grid-cols-3">
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
              <ProductCard {...item} cta={data.cta} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}
