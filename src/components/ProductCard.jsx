import Button from './Button';
import Img from './Img';
import SmartLink from './SmartLink';
import { ctaHref } from '../lib/whatsapp';

/** Collection card: image, name, description, price and order CTA. */
export default function ProductCard({ name, description, price, image, cta, link }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-transparent bg-card shadow-card transition-[box-shadow,border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-rose hover:shadow-card-hover focus-within:border-rose focus-within:shadow-card-hover">
      <div className="aspect-[410/320] overflow-hidden">
        <Img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col items-start px-6 pt-5 pb-6">
        <h3 className="font-serif text-[30px] leading-[1.15] font-normal">
          {link ? (
            // Stretched link: the ::after covers the whole card, so a click anywhere opens the product.
            <SmartLink href={link} className="rounded-sm after:absolute after:inset-0 after:content-['']">
              {name}
            </SmartLink>
          ) : (
            name
          )}
        </h3>
        <p className="mt-[11px] text-sm leading-[1.5]">{description}</p>
        <p className="mt-[9px] text-lg leading-7">{price}</p>
        <Button variant="outline" href={ctaHref(cta, { name, price })} className="relative z-10 mt-3" aria-label={`${cta.label}: ${name}`}>
          {cta.label}
        </Button>
      </div>
    </article>
  );
}
