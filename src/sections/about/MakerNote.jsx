import { useContent, useSection } from '../../context/ContentContext';
import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import Img from '../../components/Img';
import Reveal from '../../components/Reveal';

/** "A note from the maker" — arched photo beside the brand introduction. */
export default function MakerNote() {
  const makerNote = useSection('about.makerNote');
  const { getImage } = useContent();
  const image = getImage('about.maker', makerNote.image);
  return (
    <section aria-labelledby="maker-title" className="container-page py-16 md:py-20">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,584px)_minmax(0,1fr)] lg:gap-16">
        <Reveal className="mx-auto w-full max-w-[584px] overflow-hidden rounded-t-[34%] rounded-b-media">
          <Img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="aspect-[584/561] h-auto w-full object-cover"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow wide={false}>{makerNote.eyebrow}</Eyebrow>
          <Heading
            id="maker-title"
            lines={makerNote.title}
            className="mt-5 text-[44px] leading-[1.1] md:text-[52px] xl:text-[60px] xl:leading-[66px]"
          />
          <p className="mt-6 text-[15px] leading-6 md:mt-[23px]">{makerNote.intro}</p>
          {makerNote.blocks.map((block) => (
            <div key={block.title}>
              <h3 className="mt-6 font-serif text-[28px] leading-9 font-normal md:mt-5">{block.title}</h3>
              <p className="mt-4 text-[15px] leading-6 md:mt-5">{block.text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
