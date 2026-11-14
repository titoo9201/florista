import Img from './Img';

const objectPosition = { center: 'object-center', bottom: 'object-bottom', top: 'object-top' };

/** Moodboard tile: image + "01 / Title" caption. `tall` switches between the two image ratios in the design. */
export default function MoodboardItem({ number, title, tall = false, image, className = '', style }) {
  return (
    <li className={className} style={style}>
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
    </li>
  );
}
