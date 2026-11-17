import { useSection } from '../../context/ContentContext';
import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import Reveal from '../../components/Reveal';

/** Centered intro — "A Little World of Flowers". */
export default function InspirationHero() {
  const inspirationHero = useSection('inspiration.inspirationHero');
  return (
    <section aria-labelledby="inspiration-title" className="container-page pt-16 pb-14 text-center md:pt-[100px] md:pb-[72px]">
      <Reveal>
        <Eyebrow>{inspirationHero.eyebrow}</Eyebrow>
        <Heading
          as="h1"
          id="inspiration-title"
          lines={inspirationHero.title}
          className="mt-5 text-[56px] leading-[1.02] sm:text-[72px] md:mt-[21px] md:text-[80px] md:leading-[1.08] xl:text-[88px] xl:leading-[96px]"
        />
        <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-6">{inspirationHero.body}</p>
      </Reveal>
    </section>
  );
}
