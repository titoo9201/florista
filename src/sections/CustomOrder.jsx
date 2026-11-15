import { customOrder } from '../data/home';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Heading from '../components/Heading';
import Img from '../components/Img';
import Reveal from '../components/Reveal';
import { ctaHref } from '../lib/whatsapp';

/** "Your colours. Your story." — custom creation call-to-action. */
export default function CustomOrder() {
  return (
    <section aria-labelledby="custom-title" className="bg-blush">
      <div className="container-page grid items-start gap-8 py-12 md:grid-cols-[minmax(0,547fr)_minmax(0,669fr)] md:gap-12 md:py-[72px] xl:gap-16">
        <Reveal className="overflow-hidden rounded-media">
          <Img
            src={customOrder.image.src}
            alt={customOrder.image.alt}
            width={customOrder.image.width}
            height={customOrder.image.height}
            className="aspect-[547/400] h-auto w-full object-cover"
          />
        </Reveal>

        <Reveal delay={0.1} className="md:pt-[1px]">
          <Eyebrow wide={false}>{customOrder.eyebrow}</Eyebrow>
          <Heading
            id="custom-title"
            lines={customOrder.title}
            className="mt-5 text-[clamp(2.25rem,10vw,3rem)] leading-[1.07] md:text-[48px] xl:text-[58px] xl:leading-[64px]"
          />
          <p className="mt-5 max-w-[610px] text-sm leading-6">{customOrder.body}</p>
          <Button href={ctaHref(customOrder.cta)} className="mt-[22px] w-full sm:w-auto">
            {customOrder.cta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
