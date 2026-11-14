import { closingQuote } from '../../data/inspiration';
import Button from '../../components/Button';
import Reveal from '../../components/Reveal';

/** Centered closing quote with a call-to-action. */
export default function ClosingQuote() {
  return (
    <section aria-label="Find your bouquet" className="bg-blush">
      <Reveal className="container-page py-14 text-center md:pt-[71px] md:pb-[71px]">
        <blockquote>
          <p className="font-serif text-[34px] leading-[1.15] italic sm:text-[48px] xl:text-[60px] xl:leading-[66px]">
            {closingQuote.quote.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </blockquote>
        <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-6 md:mt-[28px]">{closingQuote.body}</p>
        <Button href={closingQuote.cta.href} className="mt-6 md:mt-[25px]">
          {closingQuote.cta.label}
        </Button>
      </Reveal>
    </section>
  );
}
