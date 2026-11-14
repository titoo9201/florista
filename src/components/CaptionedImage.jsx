import Img from './Img';

/** Rounded image with a small caption underneath (gallery tile). */
export default function CaptionedImage({ caption, image, aspect = 'aspect-[410/380]' }) {
  return (
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
}
