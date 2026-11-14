import Img from './Img';
import SmartLink from './SmartLink';

/** Rounded image with a small caption underneath (gallery tile). */
export default function CaptionedImage({ caption, image, link, aspect = 'aspect-[410/380]' }) {
  const figure = (
    <figure>
      <div className={`overflow-hidden rounded-media ${aspect}`}>
        <Img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
        />
      </div>
      <figcaption className="mt-[13px] text-xs leading-5">{caption}</figcaption>
    </figure>
  );
  return link ? (
    <SmartLink href={link} className="block rounded-media">
      {figure}
    </SmartLink>
  ) : (
    figure
  );
}
