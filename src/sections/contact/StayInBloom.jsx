import { stayInBloom } from '../../data/contact';
import { socials } from '../../data/site';
import Heading from '../../components/Heading';
import InfoCard from '../../components/InfoCard';
import Reveal from '../../components/Reveal';

const hrefFor = (icon) => socials.find((s) => s.icon === icon)?.href || undefined;

/** "Let’s stay in bloom." — social profile cards on blush. */
export default function StayInBloom() {
  return (
    <section aria-labelledby="bloom-title" className="bg-blush">
      <div className="container-page py-14 text-center md:pt-[62px] md:pb-16">
        <Reveal>
          <Heading id="bloom-title" className="text-[38px] leading-[1.1] md:text-[48px] xl:text-[58px] xl:leading-[64px]">
            {stayInBloom.title}
          </Heading>
          <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-6 md:mt-[25px]">{stayInBloom.body}</p>
        </Reveal>

        <ul className="mt-8 grid gap-6 md:mt-[25px] md:grid-cols-3">
          {stayInBloom.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.08}>
              <InfoCard {...item} href={hrefFor(item.icon)} align="center" className="bg-cream px-6 pt-[26px] pb-6" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
