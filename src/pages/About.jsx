import { aboutClosing } from '../data/about';
import AboutHero from '../sections/about/AboutHero';
import MakerNote from '../sections/about/MakerNote';
import AboutValues from '../sections/about/AboutValues';
import AboutGallery from '../sections/about/AboutGallery';
import CtaBanner from '../components/CtaBanner';

export default function About() {
  return (
    <>
      <AboutHero />
      <MakerNote />
      <AboutValues />
      <AboutGallery />
      <CtaBanner
        id="about-closing-title"
        title={aboutClosing.quote.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        body={aboutClosing.body}
        cta={aboutClosing.cta}
        headingClassName="text-[30px] leading-[1.15] italic sm:text-[48px] xl:text-[60px] xl:leading-[67px]"
        paddingClassName="md:pt-[63px] md:pb-[73px]"
      />
    </>
  );
}
