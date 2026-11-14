import { momentOfBeautySection as data } from '../../data/inspiration';
import Eyebrow from '../../components/Eyebrow';
import Img from '../../components/Img';
import Reveal from '../../components/Reveal';
import SmartLink from '../../components/SmartLink';

/** "A moment of beauty" — large italic quote beside a photograph. */
export default function MomentOfBeauty() {
  return (
    <section aria-labelledby="moment-title" className="bg-blush">
      <div className="container-page grid items-start gap-10 py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,542px)] lg:gap-16">
        <Reveal className="lg:pt-[1px]">
          <Eyebrow as="h2" wide={false} id="moment-title">
            {data.eyebrow}
          </Eyebrow>
          <blockquote className="mt-6 md:mt-[25px]">
            <p className="font-serif text-[40px] leading-[1.1] italic sm:text-[56px] xl:text-[64px] xl:leading-[68px]">
              {data.quote.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </blockquote>
          <p className="mt-6 text-sm leading-6 md:mt-[27px]">{data.body}</p>
        </Reveal>

        <Reveal delay={0.1} className="overflow-hidden rounded-media">
          <SmartLink href={data.link} className="group block">
            <Img
              src={data.image.src}
              alt={data.image.alt}
              width={data.image.width}
              height={data.image.height}
              className="aspect-[542/340] h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </SmartLink>
        </Reveal>
      </div>
    </section>
  );
}
