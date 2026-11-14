import { collection } from '../data/home';
import Eyebrow from '../components/Eyebrow';
import Heading from '../components/Heading';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';

/** "From our hands to your heart." — product preview grid. */
export default function Collection() {
  return (
    <section id={collection.id} aria-labelledby="collection-title" className="container-page pt-16 pb-16 md:pt-[78px] md:pb-20">
      <Reveal>
        <Eyebrow>{collection.eyebrow}</Eyebrow>
        <Heading
          id="collection-title"
          className="mt-4 text-[38px] leading-[1.08] md:mt-3 md:text-[48px] xl:text-[52px] xl:leading-[58px]"
        >
          {collection.title}
        </Heading>
        <p className="mt-4 text-sm leading-6 md:mt-[14px]">{collection.body}</p>
      </Reveal>

      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collection.products.map((product, i) => (
          <Reveal as="li" key={product.id} delay={i * 0.08}>
            <ProductCard {...product} cta={collection.cta} />
          </Reveal>
        ))}
      </ul>

      <p className="mt-8 text-[11px] leading-4">{collection.note}</p>
    </section>
  );
}
