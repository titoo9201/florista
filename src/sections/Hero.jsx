import { motion, useReducedMotion } from 'framer-motion';
import { hero } from '../data/home';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Heading from '../components/Heading';
import Img from '../components/Img';
import Reveal from '../components/Reveal';
import { useContent } from '../context/ContentContext';

export default function Hero() {
  const { getImage } = useContent();
  const image = getImage('home.hero', hero.image);
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="hero-title" className="container-page pt-10 pb-16 md:pt-14 lg:pt-[74px] lg:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,653px)] lg:gap-10">
        <Reveal>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <Heading
            as="h1"
            id="hero-title"
            lines={hero.title}
            className="mt-5 text-[clamp(2.75rem,14vw,4rem)] leading-[1.02] sm:text-[64px] md:mt-7 md:text-[76px] md:leading-[1.05] xl:text-[88px] xl:leading-[96px]"
          />
          <p className="mt-5 font-serif text-[24px] leading-[1.2] italic md:mt-6 md:text-[28px]">{hero.tagline}</p>
          <p className="mt-5 max-w-[560px] text-sm leading-6 md:mt-6">{hero.body}</p>
          <div className="mt-8 flex flex-wrap gap-3 md:mt-[30px]">
            <Button href={hero.primaryCta.href} className="w-full sm:w-auto">{hero.primaryCta.label}</Button>
            <Button variant="outline" href={hero.secondaryCta.href} className="w-full sm:w-auto">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </Reveal>

        <motion.div
          className="mx-auto aspect-[653/624] w-full max-w-[653px] overflow-hidden rounded-t-[999px]"
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Img
            priority
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="h-full w-full object-cover object-top"
          />
        </motion.div>
      </div>
    </section>
  );
}
