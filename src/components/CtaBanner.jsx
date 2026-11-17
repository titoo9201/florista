import Button from './Button';
import Heading from './Heading';
import Reveal from './Reveal';
import { useWhatsApp } from '../context/ContentContext';

/** Centered blush call-to-action band: serif heading, short line of copy and a primary button. */
export default function CtaBanner({ id, title, body, cta, headingClassName = '', paddingClassName = 'md:pt-[63px] md:pb-[65px]' }) {
  const { ctaHref } = useWhatsApp();
  return (
    <section aria-labelledby={id} className="bg-blush">
      <Reveal className={`container-page py-14 text-center ${paddingClassName}`}>
        <Heading id={id} className={headingClassName}>
          {title}
        </Heading>
        <p className="mx-auto mt-5 max-w-[680px] text-[15px] leading-6 md:mt-[22px]">{body}</p>
        <Button href={ctaHref(cta)} className="mt-6 w-full sm:w-auto md:mt-[25px]">
          {cta.label}
        </Button>
      </Reveal>
    </section>
  );
}
