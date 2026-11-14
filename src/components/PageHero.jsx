import Eyebrow from './Eyebrow';
import Heading from './Heading';
import Img from './Img';
import Reveal from './Reveal';

/**
 * Blush page hero: plain eyebrow, large two-line serif title and intro on the left,
 * feature photograph on the right (stacks on smaller screens).
 */
export default function PageHero({ id, eyebrow, title, body, image }) {
  return (
    <section aria-labelledby={id} className="mt-6 bg-blush md:mt-7">
      <div className="container-page grid items-start gap-10 py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,493px)] lg:gap-16">
        <Reveal className="lg:pt-[1px]">
          <Eyebrow wide={false}>{eyebrow}</Eyebrow>
          <Heading
            as="h1"
            id={id}
            lines={title}
            className="mt-4 text-[52px] leading-[1.05] sm:text-[64px] md:text-[72px] md:leading-[1.1] xl:text-[80px] xl:leading-[88px]"
          />
          <p className="mt-5 text-base leading-7 md:mt-[21px]">{body}</p>
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
