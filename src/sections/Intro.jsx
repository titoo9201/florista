import { useSection } from '../context/ContentContext';
import Eyebrow from '../components/Eyebrow';
import FeatureItem from '../components/FeatureItem';
import Heading from '../components/Heading';
import Reveal from '../components/Reveal';

/** "Thoughtful by nature" — brand promise + three numbered values. */
export default function Intro() {
  const intro = useSection('home.intro');
  return (
    <section aria-labelledby="intro-title" className="bg-blush">
      <div className="container-page py-16 md:py-[76px]">
        <Reveal className="mx-auto max-w-[900px] text-center">
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <Heading
            id="intro-title"
            lines={intro.title}
            className="mt-6 text-[38px] leading-[1.08] md:mt-[30px] md:text-[48px] xl:text-[54px] xl:leading-[58px]"
          />
          <p className="mx-auto mt-6 max-w-[620px] text-sm leading-6 md:mt-8">{intro.body}</p>
        </Reveal>

        <ul className="mt-12 grid gap-10 md:mt-[35px] md:grid-cols-3 md:gap-8">
          {intro.features.map((feature, i) => (
            <Reveal as="li" key={feature.number} delay={i * 0.08}>
              <FeatureItem {...feature} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
