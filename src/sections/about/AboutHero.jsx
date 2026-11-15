import { aboutHero } from '../../data/about';
import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import Img from '../../components/Img';
import Reveal from '../../components/Reveal';

/** Centered "Our Story" intro followed by a full-width photograph. */
export default function AboutHero() {
  return (
    <section aria-labelledby="about-title" className="container-page pt-14 md:pt-[94px]">
      <Reveal className="text-center">
        <Eyebrow wide={false}>{aboutHero.eyebrow}</Eyebrow>
        <Heading
          as="h1"
          id="about-title"
          className="mt-4 text-[clamp(2.75rem,14vw,4.5rem)] leading-none sm:text-[72px] md:mt-[22px] md:text-[80px] xl:text-[88px] xl:leading-[96px]"
        >
          {aboutHero.title}
        </Heading>
        <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-6 md:mt-[28px]">{aboutHero.body}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 overflow-hidden rounded-media md:mt-6">
        <Img
          priority
          src={aboutHero.image.src}
          alt={aboutHero.image.alt}
          width={aboutHero.image.width}
          height={aboutHero.image.height}
          className="aspect-[4/3] h-auto w-full object-cover sm:aspect-[1601/480]"
        />
      </Reveal>
    </section>
  );
}
