import { useContent, useSection } from '../../context/ContentContext';
import CaptionedImage from '../../components/CaptionedImage';
import Eyebrow from '../../components/Eyebrow';
import Heading from '../../components/Heading';
import Reveal from '../../components/Reveal';

/** "A little glimpse of our world." — three captioned photographs. */
export default function AboutGallery() {
  const aboutGallery = useSection('about.aboutGallery');
  const { getImage } = useContent();
  return (
    <section aria-labelledby="gallery-title" className="container-page pt-16 pb-16 md:pt-[82px] md:pb-20">
      <Reveal>
        <Eyebrow>{aboutGallery.eyebrow}</Eyebrow>
        <Heading
          id="gallery-title"
          className="mt-4 text-[38px] leading-[1.08] md:mt-3 md:text-[48px] xl:text-[52px] xl:leading-[58px]"
        >
          {aboutGallery.title}
        </Heading>
        <p className="mt-4 text-[15px] leading-6 md:mt-[14px]">{aboutGallery.body}</p>
      </Reveal>

      <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {aboutGallery.items.map((item, i) => (
          <Reveal as="li" key={item.caption} delay={i * 0.08}>
            <CaptionedImage {...item} image={getImage(`about.gallery.${i + 1}`, item.image)} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
