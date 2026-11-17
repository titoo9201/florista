import { useSection } from '../../context/ContentContext';
import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import Reveal from '../../components/Reveal';

/** Centered blush intro — "Let’s Create Something Beautiful". */
export default function ContactHero() {
  const contactHero = useSection('contact.contactHero');
  return (
    <section aria-labelledby="contact-title" className="mt-6 bg-blush md:mt-7">
      <Reveal className="container-page py-14 text-center md:pt-[68px] md:pb-[69px]">
        <Eyebrow wide={false}>{contactHero.eyebrow}</Eyebrow>
        <Heading
          as="h1"
          id="contact-title"
          lines={contactHero.title}
          className="mt-5 text-[38px] leading-[1.12] sm:text-[64px] md:mt-6 md:text-[72px] xl:text-[80px] xl:leading-[90px]"
        />
        <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-6 md:mt-[19px]">{contactHero.body}</p>
      </Reveal>
    </section>
  );
}
