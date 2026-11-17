import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import Img from '../../components/Img';
import Reveal from '../../components/Reveal';
import { useContent, useSection } from '../../context/ContentContext';

/** Blush hero — "Our Beautiful Bouquets" with a feature photograph. */
export default function BouquetsHero() {
  const bouquetsHero = useSection('bouquets.bouquetsHero');
  const { getImage } = useContent();
  const image = getImage('bouquets.hero', bouquetsHero.image);
  return (
    <section aria-labelledby="bouquets-title" className="mt-6 bg-blush md:mt-7">
      <div className="container-page grid items-start gap-8 py-10 md:gap-10 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,493px)] lg:gap-16">
        <Reveal className="lg:pt-[1px]">
          <Eyebrow wide={false}>{bouquetsHero.eyebrow}</Eyebrow>
          <Heading
            as="h1"
            id="bouquets-title"
            lines={bouquetsHero.title}
            className="mt-4 text-[clamp(2.75rem,14vw,4.5rem)] leading-[1.02] sm:text-[72px] md:text-[72px] md:leading-[1.1] xl:text-[80px] xl:leading-[88px]"
          />
          <p className="mt-5 text-base leading-7 md:mt-[21px]">{bouquetsHero.body}</p>
        </Reveal>

        <Reveal delay={0.1} className="overflow-hidden rounded-media">
          <Img
            priority
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="aspect-[493/340] h-auto w-full object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
