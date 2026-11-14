import Img from './Img';
import SmartLink from './SmartLink';

const objectPosition = { center: 'object-center', bottom: 'object-bottom', top: 'object-top' };

/**
 * Moodboard tile: image + "01 / Title" caption. `tall` switches between the two image ratios in the design.
 * With `link`, the whole tile opens that page/product.
 */
export default function MoodboardItem({ number, title, tall = false, image, link, className = '', style }) {
  const Wrapper = link ? SmartLink : 'div';
  return (
    <li className={className} style={style}>
      <Wrapper {...(link ? { href: link } : {})} className="block rounded-media">
        <figure>
          <div className={`overflow-hidden rounded-media ${tall ? 'aspect-[410/459]' : 'aspect-[410/340]'}`}>
            <Img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className={`h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] ${objectPosition[image.position] ?? ''}`}
            />
          </div>
          <figcaption className="mt-[13px] text-xs leading-5">
            {number} / {title}
          </figcaption>
        </figure>
      </Wrapper>
    </li>
  );
}
