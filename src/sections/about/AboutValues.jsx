import { aboutValues } from '../../data/about';
import Eyebrow from '../../components/Eyebrow';
import FeatureItem from '../../components/FeatureItem';
import Heading from '../../components/Heading';
import Reveal from '../../components/Reveal';

/** "Made with meaning." — four numbered brand values on blush. */
export default function AboutValues() {
  return (
    <section aria-labelledby="values-title" className="bg-blush">
      <div className="container-page py-16 md:pt-[74px] md:pb-[74px]">
        <Reveal>
          <Eyebrow>{aboutValues.eyebrow}</Eyebrow>
          <Heading
            id="values-title"
            className="mt-4 text-[38px] leading-[1.08] md:mt-[11px] md:text-[48px] xl:text-[52px] xl:leading-[58px]"
          >
            {aboutValues.title}
          </Heading>
          <p className="mt-4 text-[15px] leading-6">{aboutValues.body}</p>
        </Reveal>

        <ul className="mt-10 grid gap-10 sm:grid-cols-2 md:mt-8 md:gap-x-6 lg:grid-cols-4">
          {aboutValues.items.map((item, i) => (
            <Reveal as="li" key={item.number} delay={i * 0.06}>
              <FeatureItem {...item} size="lg" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
